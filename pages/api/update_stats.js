// AVISO: Este arquivo não é usado na Vercel.
// A função ativa está em /api/update_stats.js na raiz do projeto.
// Mantido apenas para evitar confusões locais.
export default function handler(req, res) {
  return res.status(410).json({
    error: 'Rota descontinuada. Use /api/update_stats (na raiz do projeto/Vercel).'
  });
}
