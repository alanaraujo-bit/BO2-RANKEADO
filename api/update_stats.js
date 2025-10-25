export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const SECRET = process.env.BO2_SECRET || 'fallback_secreto';
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${SECRET}`) {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  const body = req.body || {};
  console.log('📩 Dados recebidos do servidor (Vercel /api):', body);

  // Por enquanto, apenas confirma o recebimento
  return res.status(200).json({ ok: true, recebido: body });
}
