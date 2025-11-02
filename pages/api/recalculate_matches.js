export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verifica autenticação
  const SECRET = process.env.BO2_SECRET || 'fallback_secreto';
  const auth = req.headers.authorization;
  const referer = req.headers.referer || '';
  const origin = req.headers.origin || '';
  const allowedDomain = 'rankops.vercel.app';
  
  const isAuthMatch = (auth && auth === `Bearer ${SECRET}`);
  const isDomainMatch = referer.includes(allowedDomain) || 
                        origin.includes(allowedDomain) || 
                        referer.includes('localhost') || 
                        origin.includes('localhost');
  
  if (!isAuthMatch && !isDomainMatch) {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  try {
    const { getFirestoreSafe } = await import('./_firebaseAdmin.js');
    const db = await getFirestoreSafe();
    
    console.log('[recalculate_matches] Iniciando recálculo de partidas...');
    
    // 1. Busca todas as partidas
    const matchesSnapshot = await db.collection('matches').orderBy('timestamp', 'asc').get();
    console.log(`[recalculate_matches] ${matchesSnapshot.size} partidas encontradas`);
    
    let processedMatches = 0;
    let errors = 0;
    
    // 2. Processa cada partida
    for (const matchDoc of matchesSnapshot.docs) {
      try {
        const matchData = matchDoc.data();
        const winnerTeam = matchData.winner_team;
        
        if (!matchData.players || !Array.isArray(matchData.players)) {
          console.log(`[recalculate_matches] ⚠️  Match ${matchDoc.id} sem players`);
          continue;
        }
        
        // 3. Para cada player da partida
        for (const playerStats of matchData.players) {
          const playerName = playerStats.player;
          const playerTeam = playerStats.team;
          const isWin = playerTeam === winnerTeam;
          
          // Busca o player no banco
          const playerQuery = await db.collection('players')
            .where('plutoniumName', '==', playerName)
            .limit(1)
            .get();
          
          if (playerQuery.empty) {
            console.log(`[recalculate_matches] ⚠️  Player não cadastrado: ${playerName}`);
            continue;
          }
          
          const playerDoc = playerQuery.docs[0];
          const playerRef = db.collection('players').doc(playerDoc.id);
          const playerData = playerDoc.data();
          
          // Calcula MMR
          const currentMMR = playerData.mmr || 1000;
          const kFactor = 32;
          const mmrChange = isWin ? kFactor : -kFactor;
          const newMMR = Math.max(0, currentMMR + mmrChange);
          
          // Atualiza wins/losses/mmr
          await playerRef.update({
            wins: (playerData.wins || 0) + (isWin ? 1 : 0),
            losses: (playerData.losses || 0) + (isWin ? 0 : 1),
            mmr: newMMR,
            updatedAt: Date.now()
          });
          
          // Adiciona ao histórico se não existir
          const historyRef = playerRef.collection('matches');
          const existingHistory = await historyRef.where('matchId', '==', matchDoc.id).get();
          
          if (existingHistory.empty) {
            await historyRef.add({
              matchId: matchDoc.id,
              timestamp: matchData.timestamp,
              stats: playerStats,
              map: matchData.match_info?.map,
              mode: matchData.match_info?.mode,
              winner: winnerTeam,
              playerTeam: playerTeam,
              result: isWin ? 'win' : 'loss',
              mmrChange: mmrChange,
              mmrBefore: currentMMR,
              mmrAfter: newMMR,
              duration: matchData.duration
            });
          }
          
          console.log(`[recalculate_matches] ✅ ${playerName}: ${isWin ? 'WIN' : 'LOSS'} (${mmrChange >= 0 ? '+' : ''}${mmrChange} MMR → ${newMMR})`);
        }
        
        processedMatches++;
        
      } catch (err) {
        console.error(`[recalculate_matches] ❌ Erro ao processar match ${matchDoc.id}:`, err);
        errors++;
      }
    }
    
    const result = {
      success: true,
      stats: {
        matchesFound: matchesSnapshot.size,
        matchesProcessed: processedMatches,
        errors: errors
      }
    };
    
    console.log('[recalculate_matches] Resultado:', result);
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('[recalculate_matches] Erro geral:', error);
    return res.status(500).json({ 
      error: 'Erro ao recalcular partidas',
      message: error.message 
    });
  }
}
