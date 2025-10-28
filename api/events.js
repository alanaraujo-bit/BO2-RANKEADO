export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Primeiro tenta Firestore; se não estiver configurado, cai para /tmp
  try {
    const { getFirestoreSafe, isFirebaseConfigured } = await import('./_firebaseAdmin.js');
    if (await isFirebaseConfigured()) {
      const db = await getFirestoreSafe();
      const snap = await db.collection('events').orderBy('ts', 'desc').limit(50).get();
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ ok: true, source: 'firestore', count: events.length, events });
    }
  } catch (e) {
    // Continua com o fallback
    console.log('[events] Firestore indisponível/erro:', e && e.message);
  }

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

    return res.status(200).json({ ok: true, source: 'tmp', count: events.length, events });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
}
