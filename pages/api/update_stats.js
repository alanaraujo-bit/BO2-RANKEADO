export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const SECRET = process.env.BO2_SECRET || 'fallback_secreto';
  const auth = req.headers.authorization;
  const isAuthMatch = !!auth && auth === `Bearer ${SECRET}`;
  if (!isAuthMatch) {
    // Log mínimo para diagnóstico sem expor o segredo
    console.log('[update_stats] auth provided:', !!auth, 'authLen:', auth ? auth.length : 0, 'secretLen:', String(SECRET).length);
    return res.status(403).json({ error: 'Não autorizado' });
  }

  const body = req.body || {};
  console.log('[update_stats] recebido:', body);

  // Armazena temporariamente os últimos eventos em /tmp (válido apenas enquanto a função estiver quente)
  try {
    const fsMod = await import('fs');
    const fsp = fsMod.promises;
    const path = '/tmp/events.json';

    let events = [];
    try {
      const data = await fsp.readFile(path, 'utf8');
      events = JSON.parse(data);
      if (!Array.isArray(events)) events = [];
    } catch (e) {
      events = [];
    }

    events.push({ ts: Date.now(), event: body });
    if (events.length > 100) events = events.slice(-100);

    await fsp.writeFile(path, JSON.stringify(events), 'utf8');
  } catch (e) {
    console.log('[update_stats] erro ao gravar /tmp/events.json:', e && e.message);
  }

  // Tenta persistir no Firestore (se estiver configurado)
  let firebaseSaved = false;
  let firebaseError = null;
  try {
    const { getFirestoreSafe, isFirebaseConfigured } = await import('./_firebaseAdmin.js');
    if (await isFirebaseConfigured()) {
      const db = await getFirestoreSafe();
      const eventType = body.type;
      const eventData = body.data || {};
      const timestamp = body.timestamp || new Date().toISOString();
      
      // Estrutura organizada por tipo de evento
      if (eventType === 'match_end') {
        // Salva partida completa
        const matchRef = await db.collection('matches').add({
          ...eventData,
          timestamp,
          createdAt: Date.now()
        });
        console.log(`[update_stats] ✅ Match salva: ${matchRef.id}`);
        
        // Atualiza stats de cada jogador (apenas players cadastrados)
        if (eventData.players && Array.isArray(eventData.players)) {
          for (const player of eventData.players) {
            const playerRef = db.collection('players').doc(player.player);
            
            // Verifica se o player está cadastrado
            const playerDoc = await playerRef.get();
            if (!playerDoc.exists) {
              console.log(`[update_stats] ⚠️  Player não cadastrado: ${player.player}`);
              continue; // Pula para o próximo player
            }
            
            // Player cadastrado - atualiza stats
            await playerRef.set({
              lastSeen: timestamp,
              lastMatch: matchRef.id,
              updatedAt: Date.now()
            }, { merge: true });
            
            // Adiciona stats da partida ao histórico do jogador
            await playerRef.collection('matches').add({
              matchId: matchRef.id,
              timestamp,
              stats: player,
              map: eventData.match_info?.map,
              mode: eventData.match_info?.mode,
              winner: eventData.winner_team,
              duration: eventData.duration
            });
            
            console.log(`[update_stats] ✅ Stats atualizadas: ${player.player}`);
          }
        }
        
        firebaseSaved = true;
        
      } else if (eventType === 'kill') {
        // Verifica se killer ou victim estão cadastrados
        const killerRef = db.collection('players').doc(eventData.killer);
        const victimRef = db.collection('players').doc(eventData.victim);
        
        const [killerDoc, victimDoc] = await Promise.all([
          killerRef.get(),
          victimRef.get()
        ]);
        
        const killerRegistered = killerDoc.exists;
        const victimRegistered = victimDoc.exists;
        
        // Salva kill apenas se pelo menos um dos dois estiver cadastrado
        if (killerRegistered || victimRegistered) {
          await db.collection('kills').add({
            ...eventData,
            killerRegistered,
            victimRegistered,
            timestamp,
            createdAt: Date.now()
          });
          console.log(`[update_stats] ✅ Kill salva: ${eventData.killer} → ${eventData.victim}`);
          firebaseSaved = true;
        } else {
          console.log(`[update_stats] ⚠️  Kill ignorada (nenhum player cadastrado): ${eventData.killer} → ${eventData.victim}`);
        }
        
      } else if (eventType === 'player_join') {
        // Verifica se o player está cadastrado
        const playerRef = db.collection('players').doc(eventData.player);
        const playerDoc = await playerRef.get();
        
        if (playerDoc.exists) {
          // Player cadastrado - atualiza dados
          await playerRef.set({
            name: eventData.player,
            guid: eventData.guid,
            lastJoin: timestamp,
            updatedAt: Date.now()
          }, { merge: true });
          console.log(`[update_stats] ✅ Player join: ${eventData.player}`);
          firebaseSaved = true;
        } else {
          console.log(`[update_stats] ⚠️  Player não cadastrado (join ignorado): ${eventData.player}`);
        }
        
      } else if (eventType === 'player_quit') {
        // Verifica se o player está cadastrado
        const playerRef = db.collection('players').doc(eventData.player);
        const playerDoc = await playerRef.get();
        
        if (playerDoc.exists) {
          // Player cadastrado - atualiza última saída
          await playerRef.set({
            lastQuit: timestamp,
            updatedAt: Date.now()
          }, { merge: true });
          console.log(`[update_stats] ✅ Player quit: ${eventData.player}`);
          firebaseSaved = true;
        } else {
          console.log(`[update_stats] ⚠️  Player não cadastrado (quit ignorado): ${eventData.player}`);
        }
        
      } else {
        // Eventos genéricos vão para collection 'events'
        await db.collection('events').add({
          type: eventType,
          data: eventData,
          timestamp,
          createdAt: Date.now()
        });
        console.log(`[update_stats] ✅ Event salvo: ${eventType}`);
        firebaseSaved = true;
      }
      
    } else {
      firebaseError = 'Firebase não configurado (variáveis de ambiente ausentes)';
      console.log('[update_stats] ⚠️  Firebase não configurado');
    }
  } catch (e) {
    firebaseError = e.message;
    console.log('[update_stats] ❌ Firestore erro:', e && e.message);
  }

  // Confirma o recebimento com status do Firebase
  return res.status(200).json({ 
    ok: true, 
    recebido: body,
    firebase: {
      saved: firebaseSaved,
      error: firebaseError
    }
  });
}
