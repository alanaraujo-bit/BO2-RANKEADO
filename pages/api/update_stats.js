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
        
        // Atualiza stats de cada jogador
        if (eventData.players && Array.isArray(eventData.players)) {
          for (const player of eventData.players) {
            const playerRef = db.collection('players').doc(player.player);
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
          }
        }
        
        firebaseSaved = true;
        
      } else if (eventType === 'kill') {
        // Salva kill individual
        await db.collection('kills').add({
          ...eventData,
          timestamp,
          createdAt: Date.now()
        });
        console.log('[update_stats] ✅ Kill salva');
        firebaseSaved = true;
        
      } else if (eventType === 'player_join') {
        // Atualiza dados do jogador
        const playerRef = db.collection('players').doc(eventData.player);
        await playerRef.set({
          name: eventData.player,
          guid: eventData.guid,
          lastJoin: timestamp,
          updatedAt: Date.now()
        }, { merge: true });
        console.log(`[update_stats] ✅ Player join: ${eventData.player}`);
        firebaseSaved = true;
        
      } else if (eventType === 'player_quit') {
        // Atualiza última saída do jogador
        const playerRef = db.collection('players').doc(eventData.player);
        await playerRef.set({
          lastQuit: timestamp,
          updatedAt: Date.now()
        }, { merge: true });
        console.log(`[update_stats] ✅ Player quit: ${eventData.player}`);
        firebaseSaved = true;
        
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
