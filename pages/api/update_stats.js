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
        // Primeiro verifica se há players cadastrados na partida
        const registeredPlayers = [];
        if (eventData.players && Array.isArray(eventData.players)) {
          for (const player of eventData.players) {
            const playersQuery = await db.collection('players')
              .where('plutoniumName', '==', player.player)
              .limit(1)
              .get();
            
            if (!playersQuery.empty) {
              registeredPlayers.push({
                data: player,
                docId: playersQuery.docs[0].id
              });
            }
          }
        }
        
        // Só salva match se houver pelo menos 1 player cadastrado
        if (registeredPlayers.length === 0) {
          console.log(`[update_stats] ⚠️  Match ignorada (nenhum player cadastrado)`);
        } else {
          // Salva partida completa
          const matchRef = await db.collection('matches').add({
            ...eventData,
            timestamp,
            createdAt: Date.now()
          });
          console.log(`[update_stats] ✅ Match salva: ${matchRef.id} (${registeredPlayers.length} players cadastrados)`);
          
          // Atualiza stats de cada player cadastrado
          for (const regPlayer of registeredPlayers) {
            const playerRef = db.collection('players').doc(regPlayer.docId);
            const playerData = (await playerRef.get()).data();
            
            // Determina se venceu ou perdeu
            const playerTeam = regPlayer.data.team;
            const winnerTeam = eventData.winner_team;
            const isWin = playerTeam === winnerTeam;
            
            // Calcula delta de MMR
            const currentMMR = playerData.mmr || 1000;
            // --- Cálculo dinâmico de MMR ---
            // Parâmetros básicos
            const baseK = 32;
            const opponent = registeredPlayers.find(p => p.data.team !== playerTeam);
            let opponentMMR = 1000;
            if (opponent) {
              const opponentData = (await db.collection('players').doc(opponent.docId).get()).data();
              opponentMMR = opponentData?.mmr || 1000;
            }
            // Expected score (Elo)
            const expected = 1 / (1 + Math.pow(10, (opponentMMR - currentMMR) / 400));
            // Performance multiplier (K/D)
            const kills = regPlayer.data.kills || 0;
            const deaths = regPlayer.data.deaths || 0;
            const kd = deaths > 0 ? kills / deaths : kills;
            let perfMultiplier = 1.0;
            if (kd >= 3.0) perfMultiplier = 1.3;
            else if (kd >= 2.0) perfMultiplier = 1.2;
            else if (kd >= 1.5) perfMultiplier = 1.1;
            else if (kd >= 1.0) perfMultiplier = 1.0;
            else if (kd > 0) perfMultiplier = 0.9;
            else perfMultiplier = 0.8;
            // Streak bonus (simples, pode ser aprimorado)
            const winStreak = playerData.winStreak || 0;
            let streakBonus = 0;
            if (winStreak >= 10) streakBonus = 10;
            else if (winStreak >= 7) streakBonus = 7;
            else if (winStreak >= 5) streakBonus = 5;
            else if (winStreak >= 3) streakBonus = 3;
            // Ganho base
            let mmrChange = 0;
            if (isWin) {
              mmrChange = Math.round(baseK * (1 - expected) * perfMultiplier + streakBonus);
            } else {
              mmrChange = -Math.round(baseK * (expected) * perfMultiplier);
            }
            const newMMR = Math.max(0, currentMMR + mmrChange);
            
            // Atualiza stats do player
            await playerRef.update({
              wins: (playerData.wins || 0) + (isWin ? 1 : 0),
              losses: (playerData.losses || 0) + (isWin ? 0 : 1),
              mmr: newMMR,
              lastSeen: timestamp,
              lastMatch: matchRef.id,
              updatedAt: Date.now()
            });
            
            // Adiciona stats da partida ao histórico do jogador
            await playerRef.collection('matches').add({
              matchId: matchRef.id,
              timestamp,
              stats: regPlayer.data,
              map: eventData.match_info?.map,
              mode: eventData.match_info?.mode,
              winner: winnerTeam,
              playerTeam: playerTeam,
              result: isWin ? 'win' : 'loss',
              mmrChange: mmrChange,
              mmrBefore: currentMMR,
              mmrAfter: newMMR,
              duration: eventData.duration
            });
            
            console.log(`[update_stats] ✅ Match processada: ${regPlayer.data.player} - ${isWin ? 'VITÓRIA' : 'DERROTA'} (${mmrChange >= 0 ? '+' : ''}${mmrChange} MMR → ${newMMR})`);
          }
        }
        
        firebaseSaved = true;
        
      } else if (eventType === 'kill') {
        // Busca killer e victim pelo plutoniumName
        const [killerQuery, victimQuery] = await Promise.all([
          db.collection('players').where('plutoniumName', '==', eventData.killer).limit(1).get(),
          db.collection('players').where('plutoniumName', '==', eventData.victim).limit(1).get()
        ]);
        
        const killerRegistered = !killerQuery.empty;
        const victimRegistered = !victimQuery.empty;
        
        // Salva kill APENAS se AMBOS estiverem cadastrados (economiza espaço)
        if (killerRegistered && victimRegistered) {
          await db.collection('kills').add({
            ...eventData,
            timestamp,
            createdAt: Date.now()
          });
          
          // ATUALIZA ESTATÍSTICAS DO KILLER
          const killerDoc = killerQuery.docs[0];
          const killerRef = db.collection('players').doc(killerDoc.id);
          const killerData = killerDoc.data();
          
          const weapon = eventData.weapon || 'unknown';
          const headshot = eventData.headshot || false;
          const hitloc = eventData.hitloc || 'none';
          
          // Atualiza kills, headshots, victims, weaponsUsed, hitLocations
          const killerUpdates = {
            kills: (killerData.kills || 0) + 1,
            totalKills: (killerData.totalKills || 0) + 1,
            headshots: (killerData.headshots || 0) + (headshot ? 1 : 0),
            [`victims.${eventData.victim}`]: (killerData.victims?.[eventData.victim] || 0) + 1,
            [`weaponsUsed.${weapon}.kills`]: ((killerData.weaponsUsed?.[weapon]?.kills) || 0) + 1,
            [`weaponsUsed.${weapon}.headshots`]: ((killerData.weaponsUsed?.[weapon]?.headshots) || 0) + (headshot ? 1 : 0),
            [`hitLocations.${hitloc}`]: (killerData.hitLocations?.[hitloc] || 0) + 1,
            lastKill: timestamp,
            updatedAt: Date.now()
          };
          
          await killerRef.update(killerUpdates);
          
          // ATUALIZA ESTATÍSTICAS DO VICTIM
          const victimDoc = victimQuery.docs[0];
          const victimRef = db.collection('players').doc(victimDoc.id);
          const victimData = victimDoc.data();
          
          const victimUpdates = {
            deaths: (victimData.deaths || 0) + 1,
            totalDeaths: (victimData.totalDeaths || 0) + 1,
            [`killedBy.${eventData.killer}`]: (victimData.killedBy?.[eventData.killer] || 0) + 1,
            lastDeath: timestamp,
            updatedAt: Date.now()
          };
          
          await victimRef.update(victimUpdates);
          
          console.log(`[update_stats] ✅ Kill processada: ${eventData.killer} → ${eventData.victim} [${weapon}${headshot ? ' HEADSHOT' : ''}]`);
          firebaseSaved = true;
        } else {
          console.log(`[update_stats] ⚠️  Kill ignorada (players não cadastrados): ${eventData.killer} [${killerRegistered ? 'OK' : 'NOT_REG'}] → ${eventData.victim} [${victimRegistered ? 'OK' : 'NOT_REG'}]`);
        }
        
      } else if (eventType === 'player_join') {
        // Busca player pelo plutoniumName
        const playerQuery = await db.collection('players')
          .where('plutoniumName', '==', eventData.player)
          .limit(1)
          .get();
        
        if (!playerQuery.empty) {
          // Player cadastrado - atualiza dados
          const playerDoc = playerQuery.docs[0];
          const playerRef = db.collection('players').doc(playerDoc.id);
          
          await playerRef.set({
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
        // Busca player pelo plutoniumName
        const playerQuery = await db.collection('players')
          .where('plutoniumName', '==', eventData.player)
          .limit(1)
          .get();
        
        if (!playerQuery.empty) {
          // Player cadastrado - atualiza última saída
          const playerDoc = playerQuery.docs[0];
          const playerRef = db.collection('players').doc(playerDoc.id);
          
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
