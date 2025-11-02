/**
 * API para recalcular TODAS as estatísticas dos players do zero
 * Processa todos os eventos de kills salvos no Firestore
 * 
 * USO: POST /api/recalculate_stats
 * Header: Authorization: Bearer <BO2_SECRET>
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const SECRET = process.env.BO2_SECRET || 'fallback_secreto';
  const auth = req.headers.authorization;
  const isAuthMatch = !!auth && auth === `Bearer ${SECRET}`;
  
  if (!isAuthMatch) {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  try {
    const { getFirestoreSafe, isFirebaseConfigured } = await import('./_firebaseAdmin.js');
    
    if (!(await isFirebaseConfigured())) {
      return res.status(500).json({ error: 'Firebase não configurado' });
    }

    const db = await getFirestoreSafe();
    
    console.log('[recalculate_stats] 🔄 Iniciando recálculo de estatísticas...');
    
    // PASSO 1: Zerar estatísticas de TODOS os players
    console.log('[recalculate_stats] 📊 Zerando estatísticas dos players...');
    const playersSnapshot = await db.collection('players').get();
    
    const resetPromises = playersSnapshot.docs.map(doc => 
      doc.ref.update({
        kills: 0,
        deaths: 0,
        headshots: 0,
        victims: {},
        killedBy: {},
        weaponsUsed: {},
        hitLocations: {},
        updatedAt: Date.now()
      })
    );
    
    await Promise.all(resetPromises);
    console.log(`[recalculate_stats] ✅ ${playersSnapshot.size} players resetados`);
    
    // PASSO 2: Buscar TODOS os eventos de kills
    console.log('[recalculate_stats] 🔍 Buscando eventos de kills...');
    const killsSnapshot = await db.collection('kills').orderBy('timestamp', 'asc').get();
    console.log(`[recalculate_stats] 📦 ${killsSnapshot.size} kills encontradas`);
    
    // PASSO 3: Re-processar cada kill
    let processed = 0;
    let errors = 0;
    
    for (const killDoc of killsSnapshot.docs) {
      try {
        const killData = killDoc.data();
        const { killer, victim, weapon, headshot, hitloc } = killData;
        
        if (!killer || !victim) {
          console.log(`[recalculate_stats] ⚠️  Kill sem killer/victim: ${killDoc.id}`);
          continue;
        }
        
        // Busca killer e victim
        const [killerQuery, victimQuery] = await Promise.all([
          db.collection('players').where('plutoniumName', '==', killer).limit(1).get(),
          db.collection('players').where('plutoniumName', '==', victim).limit(1).get()
        ]);
        
        if (killerQuery.empty || victimQuery.empty) {
          console.log(`[recalculate_stats] ⚠️  Player não encontrado: ${killer} ou ${victim}`);
          continue;
        }
        
        const killerDoc = killerQuery.docs[0];
        const victimDoc = victimQuery.docs[0];
        const killerRef = db.collection('players').doc(killerDoc.id);
        const victimRef = db.collection('players').doc(victimDoc.id);
        
        // Pega dados atuais
        const killerData = killerDoc.data();
        const victimData = victimDoc.data();
        
        const weaponKey = weapon || 'unknown';
        const headshotBool = headshot || false;
        const hitlocKey = hitloc || 'none';
        
        // INCREMENTA killer stats
        await killerRef.update({
          kills: (killerData.kills || 0) + 1,
          headshots: (killerData.headshots || 0) + (headshotBool ? 1 : 0),
          [`victims.${victim}`]: (killerData.victims?.[victim] || 0) + 1,
          [`weaponsUsed.${weaponKey}.kills`]: (killerData.weaponsUsed?.[weaponKey]?.kills || 0) + 1,
          [`weaponsUsed.${weaponKey}.headshots`]: (killerData.weaponsUsed?.[weaponKey]?.headshots || 0) + (headshotBool ? 1 : 0),
          [`hitLocations.${hitlocKey}`]: (killerData.hitLocations?.[hitlocKey] || 0) + 1,
          updatedAt: Date.now()
        });
        
        // INCREMENTA victim stats
        await victimRef.update({
          deaths: (victimData.deaths || 0) + 1,
          [`killedBy.${killer}`]: (victimData.killedBy?.[killer] || 0) + 1,
          updatedAt: Date.now()
        });
        
        processed++;
        
        if (processed % 100 === 0) {
          console.log(`[recalculate_stats] ⏳ Processadas ${processed}/${killsSnapshot.size} kills...`);
        }
        
      } catch (err) {
        errors++;
        console.error(`[recalculate_stats] ❌ Erro ao processar kill ${killDoc.id}:`, err.message);
      }
    }
    
    console.log(`[recalculate_stats] ✅ Recálculo completo!`);
    console.log(`[recalculate_stats]    📊 Kills processadas: ${processed}`);
    console.log(`[recalculate_stats]    ❌ Erros: ${errors}`);
    
    return res.status(200).json({
      ok: true,
      message: 'Estatísticas recalculadas com sucesso',
      stats: {
        playersReset: playersSnapshot.size,
        killsFound: killsSnapshot.size,
        killsProcessed: processed,
        errors: errors
      }
    });
    
  } catch (error) {
    console.error('[recalculate_stats] ❌ Erro fatal:', error);
    return res.status(500).json({ 
      error: 'Erro ao recalcular estatísticas',
      message: error.message 
    });
  }
}
