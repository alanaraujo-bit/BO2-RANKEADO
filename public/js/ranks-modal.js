/* ===================================================================
   BO2 RANKED - RANKS MODAL
   Modal para exibir todas as patentes e requisitos de MMR
   ================================================================ */

// Abrir modal de patentes
function openRanksModal() {
    const modal = document.getElementById('ranksModal');
    if (!modal) return;
    
    // Popular o grid com as patentes
    populateRanksModal();
    
    // Exibir modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar modal de patentes
function closeRanksModal() {
    const modal = document.getElementById('ranksModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Popular modal com todas as patentes
function populateRanksModal() {
    const grid = document.getElementById('ranksModalGrid');
    if (!grid) return;
    
    // Limpar grid
    grid.innerHTML = '';
    
    // Obter todas as patentes do sistema
    const ranks = RankSystem.getAllRanks();
    
    // Criar card para cada patente
    ranks.forEach(rank => {
        const card = createRankModalCard(rank);
        grid.appendChild(card);
    });
}

// Criar card de patente para o modal
function createRankModalCard(rank) {
    const card = document.createElement('div');
    card.className = 'rank-modal-card';
    
    // Adicionar classe de cor baseada no tier
    const tier = getRankTier(rank.name);
    card.classList.add(`rank-${tier}`);
    
    // Definir variável CSS para cor
    card.style.setProperty('--rank-color', rank.color);
    
    // HTML do card
    card.innerHTML = `
        <div class="rank-modal-icon-large">${rank.icon}</div>
        <div class="rank-modal-info">
            <div class="rank-modal-name">${rank.name}</div>
            <div class="rank-modal-mmr-range">
                <span class="rank-modal-mmr-value">${rank.min} MMR</span>
                ${rank.max !== Infinity ? `<span>→</span><span class="rank-modal-mmr-value">${rank.max} MMR</span>` : '<span>→ ∞</span>'}
            </div>
        </div>
    `;
    
    return card;
}

// Obter tier da patente
function getRankTier(rankName) {
    if (rankName.includes('Bronze')) return 'bronze';
    if (rankName.includes('Prata')) return 'silver';
    if (rankName.includes('Ouro')) return 'gold';
    if (rankName.includes('Platina')) return 'platinum';
    if (rankName.includes('Diamante')) return 'diamond';
    if (rankName.includes('Mestre')) return 'master';
    if (rankName.includes('Lenda')) return 'legend';
    return 'bronze';
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ranksModal');
    if (!modal) return;
    
    if (e.target === modal) {
        closeRanksModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('ranksModal');
        if (modal && modal.classList.contains('active')) {
            closeRanksModal();
        }
    }
});
