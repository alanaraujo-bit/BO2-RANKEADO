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

  // Confirma o recebimento
  return res.status(200).json({ ok: true, recebido: body });
}
