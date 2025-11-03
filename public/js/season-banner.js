/* ===================================================================
   BO2 RANKED - SEASON BANNER UI
   Banner visual mostrando temporada ativa e countdown
   ================================================================ */

const SeasonBanner = {
    initialized: false,
    
    /**
     * Inicializa o banner da temporada
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🎨 Inicializando Season Banner...');
        
        // Aguarda dados das temporadas
        await SeasonData.init();
        
        // Aguarda um pouco para garantir que os dados foram carregados
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const activeSeason = SeasonData.getActiveSeason();
        
        if (!activeSeason) {
            console.warn('⚠️ Nenhuma temporada ativa encontrada');
            return;
        }
        
        console.log('✅ Temporada ativa carregada:', activeSeason.displayName || activeSeason.name);
        
        this.createBanner();
        this.startCountdown();
        this.initialized = true;
    },
    
    /**
     * Cria o banner visual
     */
    createBanner() {
        const activeSeason = SeasonData.getActiveSeason();
        if (!activeSeason) {
            console.warn('⚠️ Não foi possível criar banner - temporada não encontrada');
            return;
        }
        
        // Remove banner antigo se existir
        const oldBanner = document.getElementById('seasonBanner');
        if (oldBanner) oldBanner.remove();
        
        // Cria novo banner
        const banner = document.createElement('div');
        banner.id = 'seasonBanner';
        banner.className = 'season-banner';
        
        const endDate = new Date(activeSeason.endDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        banner.innerHTML = `
            <div class="season-banner-content">
                <div class="season-info">
                    <span class="season-icon">🏆</span>
                    <div class="season-text">
                        <span class="season-label">TEMPORADA RANQUEADA</span>
                        <span class="season-name">${activeSeason.displayName || activeSeason.name}</span>
                    </div>
                </div>
                <div class="season-timer">
                    <span class="timer-label">TERMINA EM:</span>
                    <span class="timer-value" id="seasonCountdown">${daysLeft} DIAS</span>
                </div>
                <div class="season-rewards">
                    <span class="rewards-label">RECOMPENSAS:</span>
                    <div class="rewards-icons">
                        <span title="${activeSeason.rewards.top1.badge}">${activeSeason.rewards.top1.icon}</span>
                        <span title="${activeSeason.rewards.top2.badge}">${activeSeason.rewards.top2.icon}</span>
                        <span title="${activeSeason.rewards.top3.badge}">${activeSeason.rewards.top3.icon}</span>
                        <span title="${activeSeason.rewards.participation.badge}">${activeSeason.rewards.participation.icon}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insere depois da navbar
        const navbar = document.querySelector('.navbar');
        navbar.after(banner);
        
        console.log('✅ Banner da temporada criado');
    },
    
    /**
     * Inicia countdown em tempo real
     */
    startCountdown() {
        const updateCountdown = () => {
            const activeSeason = SeasonData.getActiveSeason();
            if (!activeSeason) return;
            
            const endDate = new Date(activeSeason.endDate);
            const now = new Date();
            const diff = endDate - now;
            
            if (diff <= 0) {
                this.showSeasonEnded();
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            const countdownEl = document.getElementById('seasonCountdown');
            if (countdownEl) {
                if (days > 1) {
                    countdownEl.textContent = `${days} DIAS`;
                } else if (days === 1) {
                    countdownEl.textContent = `${days} DIA ${hours}H`;
                } else {
                    countdownEl.textContent = `${hours}H ${minutes}M`;
                    countdownEl.classList.add('urgent');
                }
            }
        };
        
        // Atualiza a cada minuto
        updateCountdown();
        setInterval(updateCountdown, 60000);
    },
    
    /**
     * Mostra mensagem de temporada encerrada
     */
    showSeasonEnded() {
        const banner = document.getElementById('seasonBanner');
        if (banner) {
            banner.innerHTML = `
                <div class="season-banner-content season-ended">
                    <div class="season-info">
                        <span class="season-icon">⏰</span>
                        <div class="season-text">
                            <span class="season-label">TEMPORADA ENCERRADA</span>
                            <span class="season-name">Aguardando nova temporada...</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    /**
     * Retorna informações da temporada ativa
     */
    getActiveSeasonInfo() {
        const activeSeason = SeasonData.getActiveSeason();
        if (!activeSeason) return null;
        
        const endDate = new Date(activeSeason.endDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        return {
            id: activeSeason._id || activeSeason.id,
            number: activeSeason.seasonNumber,
            name: activeSeason.name,
            displayName: activeSeason.displayName || activeSeason.name,
            description: activeSeason.description,
            daysLeft: daysLeft,
            endDate: activeSeason.endDate,
            rewards: activeSeason.rewards,
            minGames: activeSeason.settings?.minGamesForRewards || activeSeason.rewards?.participation?.minGames || 15
        };
    }
};

// Exporta para uso global
window.SeasonBanner = SeasonBanner;

// A inicialização agora é feita manualmente no app.html para garantir ordem correta
