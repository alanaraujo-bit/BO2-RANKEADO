/**
 * API para DELETAR TODOS OS DADOS do sistema
 * ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!
 * 
 * Deleta:
 * - Todas as collections: kills, matches, events
 * - Reseta estatísticas de TODOS os players (mantém apenas userId, username, email)
 * 
 * USO: POST /api/reset_all_data
 * Header: Authorization: Bearer <BO2_SECRET>
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Aceita requisições da interface web (sem auth) ou com Bearer token
  const SECRET = process.env.BO2_SECRET || 'fallback_secreto';
  const auth = req.headers.authorization;
  const isAuthMatch = !!auth && auth === `Bearer ${SECRET}`;
  
  // Permite acesso sem autenticação apenas se vier da própria aplicação
  const referer = req.headers.referer || req.headers.referrer || '';
  const isFromWebApp = referer.includes('/admin.html');
  
  if (!isAuthMatch && !isFromWebApp) {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  try {
    const { getFirestoreSafe, isFirebaseConfigured } = await import('./_firebaseAdmin.js');
    
    if (!(await isFirebaseConfigured())) {
      return res.status(500).json({ error: 'Firebase não configurado' });
    }

    const db = await getFirestoreSafe();
    
    console.log('[reset_all_data] ⚠️  INICIANDO RESET COMPLETO DO SISTEMA...');
    
    let deletedKills = 0;
    let deletedMatches = 0;
    let deletedEvents = 0;
    let deletedPendingConfirmations = 0;
    let deletedPlayerMatches = 0;
    let resetPlayers = 0;
    
    // PASSO 1: Deletar TODAS as kills
    console.log('[reset_all_data] 🗑️  Deletando collection: kills...');
    const killsSnapshot = await db.collection('kills').get();
    const killsDeletePromises = killsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(killsDeletePromises);
    deletedKills = killsSnapshot.size;
    console.log(`[reset_all_data] ✅ ${deletedKills} kills deletadas`);
    
    // PASSO 2: Deletar TODAS as matches
    console.log('[reset_all_data] 🗑️  Deletando collection: matches...');
    const matchesSnapshot = await db.collection('matches').get();
    const matchesDeletePromises = matchesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(matchesDeletePromises);
    deletedMatches = matchesSnapshot.size;
    console.log(`[reset_all_data] ✅ ${deletedMatches} matches deletadas`);
    
    // PASSO 3: Deletar TODOS os events
    console.log('[reset_all_data] 🗑️  Deletando collection: events...');
    const eventsSnapshot = await db.collection('events').get();
    const eventsDeletePromises = eventsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(eventsDeletePromises);
    deletedEvents = eventsSnapshot.size;
    console.log(`[reset_all_data] ✅ ${deletedEvents} events deletados`);
    
    // PASSO 3.5: Deletar TODAS as pendingConfirmations
    console.log('[reset_all_data] 🗑️  Deletando collection: pendingConfirmations...');
    const pendingSnapshot = await db.collection('pendingConfirmations').get();
    const pendingDeletePromises = pendingSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(pendingDeletePromises);
    deletedPendingConfirmations = pendingSnapshot.size;
    console.log(`[reset_all_data] ✅ ${deletedPendingConfirmations} pending confirmations deletadas`);
    
    // PASSO 4: RESETAR estatísticas de TODOS os players (mantém identidade)
    console.log('[reset_all_data] 🔄 Resetando estatísticas dos players...');
    const playersSnapshot = await db.collection('players').get();
    
    const resetPlayersPromises = playersSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Deleta subcollection de matches do player
      const playerMatchesSnapshot = await doc.ref.collection('matches').get();
      const deletePlayerMatches = playerMatchesSnapshot.docs.map(m => m.ref.delete());
      await Promise.all(deletePlayerMatches);
      deletedPlayerMatches += playerMatchesSnapshot.size;
      
      // Deleta subcollection de friends do player (se existir)
      try {
        const playerFriendsSnapshot = await doc.ref.collection('friends').get();
        const deleteFriends = playerFriendsSnapshot.docs.map(f => f.ref.delete());
        await Promise.all(deleteFriends);
      } catch (e) {
        // Ignora se não existir
      }
      
      // Reseta COMPLETAMENTE mantendo apenas identidade
      const resetData = {
        // MANTÉM identidade
        userId: data.userId,
        username: data.username,
        email: data.email,
        plutoniumName: data.plutoniumName || null,
        displayName: data.displayName || data.username,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || Date.now(),
        
        // ZERA TODAS as estatísticas
        kills: 0,
        deaths: 0,
        wins: 0,
        losses: 0,
        headshots: 0,
        assists: 0,
        suicides: 0,
        teamkills: 0,
        damageDealt: 0,
        damageTaken: 0,
        mmr: 1000,
        rank: 'bronze',
        rankNumber: 1,
        playerNumber: data.playerNumber || 0,
        playerNumberStr: data.playerNumberStr || '00',
        
        // LIMPA mapas/objetos
        victims: {},
        killedBy: {},
        weaponsUsed: {},
        hitLocations: {},
        
        // ZERA contadores
        matchesPlayed: 0,
        winStreak: 0,
        lossStreak: 0,
        bestWinStreak: 0,
        bestKillStreak: 0,
        
        // LIMPA timestamps
        lastMatch: null,
        lastKill: null,
        lastDeath: null,
        lastSeen: null,
        lastJoin: null,
        lastQuit: null,
        
        updatedAt: Date.now()
      };
      
      // Usa SET para sobrescrever TUDO (não merge)
      return doc.ref.set(resetData);
    });
    
    await Promise.all(resetPlayersPromises);
    resetPlayers = playersSnapshot.size;
    console.log(`[reset_all_data] ✅ ${resetPlayers} players resetados`);
    
    console.log('[reset_all_data] ✅ RESET COMPLETO FINALIZADO!');
    
    return res.status(200).json({
      ok: true,
      message: '🔥 TODOS OS DADOS FORAM DELETADOS! Sistema resetado para o estado inicial.',
      stats: {
        deletedKills,
        deletedMatches,
        deletedEvents,
        deletedPendingConfirmations,
        deletedPlayerMatches,
        resetPlayers,
        totalDeleted: deletedKills + deletedMatches + deletedEvents + deletedPendingConfirmations + deletedPlayerMatches
      }
    });
    
  } catch (error) {
    console.error('[reset_all_data] ❌ Erro fatal:', error);
    return res.status(500).json({ 
      error: 'Erro ao resetar dados',
      message: error.message 
    });
  }
}
