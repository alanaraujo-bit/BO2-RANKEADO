// Script para limpar jogadores duplicados do Firestore
// Execute no Console do navegador (F12) quando estiver logado

async function cleanupDuplicatePlayers() {
    console.log('🧹 Iniciando limpeza de jogadores duplicados...');
    
    try {
        // Buscar todos os jogadores
        const snapshot = await db.collection('players').get();
        
        console.log(`📊 Total de documentos: ${snapshot.size}`);
        
        const players = [];
        snapshot.forEach(doc => {
            players.push({
                id: doc.id,
                data: doc.data()
            });
        });
        
        // Agrupar por username
        const playersByUsername = {};
        players.forEach(player => {
            const username = player.data.username;
            if (!playersByUsername[username]) {
                playersByUsername[username] = [];
            }
            playersByUsername[username].push(player);
        });
        
        // Identificar duplicatas
        let duplicatesFound = 0;
        let documentsToDelete = [];
        
        for (const [username, docs] of Object.entries(playersByUsername)) {
            if (docs.length > 1) {
                console.warn(`⚠️ Duplicata encontrada: ${username} (${docs.length} documentos)`);
                duplicatesFound++;
                
                // Ordenar por MMR (manter o maior) ou por data de criação (manter o mais antigo)
                docs.sort((a, b) => {
                    // Preferir documentos com MMR válido
                    const mmrA = a.data.mmr || 0;
                    const mmrB = b.data.mmr || 0;
                    if (mmrA !== mmrB) return mmrB - mmrA; // Maior MMR primeiro
                    
                    // Se MMR igual, preferir mais antigo
                    return (a.data.createdAt || 0) - (b.data.createdAt || 0);
                });
                
                // Manter o primeiro (melhor), deletar o resto
                const toKeep = docs[0];
                const toDelete = docs.slice(1);
                
                console.log(`  ✅ Mantendo: ${toKeep.id} (MMR: ${toKeep.data.mmr})`);
                toDelete.forEach(doc => {
                    console.log(`  ❌ Deletando: ${doc.id} (MMR: ${doc.data.mmr})`);
                    documentsToDelete.push(doc.id);
                });
            }
        }
        
        if (documentsToDelete.length === 0) {
            console.log('✨ Nenhuma duplicata encontrada!');
            return;
        }
        
        console.log(`\n🗑️ Deletando ${documentsToDelete.length} documentos duplicados...`);
        
        // Deletar em lote
        const batch = db.batch();
        documentsToDelete.forEach(docId => {
            batch.delete(db.collection('players').doc(docId));
        });
        
        await batch.commit();
        
        console.log(`✅ Limpeza concluída! ${duplicatesFound} usernames tinham duplicatas.`);
        console.log(`✅ ${documentsToDelete.length} documentos foram deletados.`);
        console.log('\n🔄 Recarregue a página para ver as mudanças!');
        
    } catch (error) {
        console.error('❌ Erro durante limpeza:', error);
    }
}

// Executar
cleanupDuplicatePlayers();
