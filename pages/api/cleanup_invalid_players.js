// Endpoint para limpar players inválidos (sem userId)
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
  const origin = req.headers.origin || '';
  const isFromWebApp = referer.includes('rankops.vercel.app') || origin.includes('rankops.vercel.app') || referer.includes('localhost');
  
  if (!isAuthMatch && !isFromWebApp) {
    console.log('[cleanup] Acesso negado. Referer:', referer, 'Origin:', origin);
    return res.status(403).json({ error: 'Não autorizado' });
  }

  try {
    const { getFirestoreSafe, isFirebaseConfigured } = await import('./_firebaseAdmin.js');
    
    if (!await isFirebaseConfigured()) {
      return res.status(500).json({ error: 'Firebase não configurado' });
    }

    const db = await getFirestoreSafe();
    
    // Busca todos os players
    const playersSnapshot = await db.collection('players').get();
    
    let deleted = 0;
    let kept = 0;
    const deletedPlayers = [];

    for (const doc of playersSnapshot.docs) {
      const data = doc.data();
      
      // Verifica se tem userId válido
      if (!data.userId || data.userId.trim() === '') {
        console.log(`[cleanup] 🗑️  Deletando player inválido: ${doc.id} (nome: ${data.name || data.username || 'sem nome'})`);
        await doc.ref.delete();
        deleted++;
        deletedPlayers.push({
          id: doc.id,
          name: data.name || data.username || data.plutoniumName || 'sem nome'
        });
      } else {
        kept++;
      }
    }

    console.log(`[cleanup] ✅ Limpeza concluída: ${deleted} deletados, ${kept} mantidos`);

    return res.status(200).json({
      success: true,
      deleted,
      kept,
      deletedPlayers
    });

  } catch (error) {
    console.error('[cleanup] ❌ Erro:', error);
    return res.status(500).json({ 
      error: 'Erro ao limpar players',
      message: error.message 
    });
  }
}
