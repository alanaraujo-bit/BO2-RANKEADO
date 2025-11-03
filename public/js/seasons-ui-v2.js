/* ===================================================================
   BO2 RANKED - SEASONS UI V2.0
   Interface moderna e clean para página de temporadas
   ================================================================ */

const SeasonsUI = {
    currentSeason: null,
    
    /**
     * Inicializa a página de temporadas
     */
    async init() {
        console.log('🎨 Inicializando SeasonsUI v2.0...');
        
        // Aguarda dados das temporadas
        await SeasonData.init();
        
        this.currentSeason = SeasonData.getActiveSeason();
        
        if (!this.currentSeason) {
            console.warn('⚠️ Nenhuma temporada ativa');
            this.showNoSeasonMessage();
            return;
        }
        
        console.log('✅ Temporada carregada:', this.currentSeason.displayName);
        
        // Renderiza a página
        await this.render();
        
        // Atualiza dados dinâmicos
        await this.updatePlayerProgress();
        await this.updateLeaderboard();
        
        // Inicia timers
        this.startCountdownTimer();
    },
    
    /**
     * Renderiza a página completa
     */
    async render() {
        const container = document.getElementById('seasonsContent');
        if (!container) {
            console.error('❌ Container #seasonsContent não encontrado');
            return;
        }
        
        const season = this.currentSeason;
        const endDate = new Date(season.endDate);
        const now = new Date();
        const isActive = season.active && now <= endDate;
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        container.innerHTML = `
            <!-- Header da Temporada -->
            <div class="season-header">
                <div class="season-header-bg"></div>
                <div class="season-header-content">
                    <div class="season-badge">
                        <span class="season-badge-icon">🏆</span>
                        <span class="season-badge-text">TEMPORADA RANQUEADA</span>
                    </div>
                    
                    <h1 class="season-title">
                        <span class="season-number">SEASON ${season.seasonNumber}</span>
                        <span class="season-name">${season.name}</span>
                    </h1>
                    
                    <p class="season-description">${season.description}</p>
                    
                    <div class="season-meta">
                        <div class="season-status ${isActive ? 'active' : 'ended'}">
                            <span class="status-dot"></span>
                            <span class="status-text">${isActive ? 'EM ANDAMENTO' : 'ENCERRADA'}</span>
                        </div>
                        <div class="season-dates">
                            <span>📅 ${new Date(season.startDate).toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Grid Principal -->
            <div class="season-grid">
                
                <!-- Countdown -->
                ${isActive ? `
                <div class="season-card countdown-card">
                    <div class="card-header">
                        <h3 class="card-title">⏱️ Tempo Restante</h3>
                    </div>
                    <div class="card-body">
                        <div class="countdown-display">
                            <div class="countdown-value" id="countdownValue">${daysLeft}</div>
                            <div class="countdown-label">DIAS RESTANTES</div>
                        </div>
                        <div class="countdown-bar">
                            <div class="countdown-progress" id="countdownProgress"></div>
                        </div>
                        <p class="countdown-hint">Jogue partidas ranqueadas e ganhe recompensas!</p>
                    </div>
                </div>
                ` : `
                <div class="season-card ended-card">
                    <div class="card-body center">
                        <span class="ended-icon">🏁</span>
                        <h3 class="ended-title">Temporada Encerrada</h3>
                        <p class="ended-text">Aguarde a próxima temporada!</p>
                    </div>
                </div>
                `}
                
                <!-- Seu Progresso -->
                <div class="season-card progress-card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Seu Progresso</h3>
                    </div>
                    <div class="card-body">
                        <div id="playerProgressContent">
                            <div class="loading-spinner">Carregando...</div>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- Recompensas -->
            <div class="season-section">
                <h2 class="section-title">
                    <span class="title-icon">🎁</span>
                    <span>Recompensas da Temporada</span>
                </h2>
                
                <div class="rewards-grid">
                    ${this.renderRewards()}
                </div>
            </div>
            
            <!-- Leaderboard -->
            <div class="season-section">
                <h2 class="section-title">
                    <span class="title-icon">🏆</span>
                    <span>Top 10 da Temporada</span>
                </h2>
                
                <div class="leaderboard-card">
                    <div id="seasonLeaderboard">
                        <div class="loading-spinner">Carregando...</div>
                    </div>
                </div>
            </div>
            
            <!-- Como Funciona -->
            <div class="season-section">
                <h2 class="section-title">
                    <span class="title-icon">ℹ️</span>
                    <span>Como Funciona</span>
                </h2>
                
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">🎮</div>
                        <h4>Jogue Partidas</h4>
                        <p>Todas as partidas ranqueadas contam para a temporada atual</p>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-icon">📈</div>
                        <h4>Suba no Ranking</h4>
                        <p>Quanto mais você joga e vence, mais alto você sobe</p>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-icon">🏆</div>
                        <h4>Ganhe Recompensas</h4>
                        <p>Top 3 ganham badges exclusivas e permanentes</p>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-icon">🔄</div>
                        <h4>Reset Inteligente</h4>
                        <p>No final do mês, seu MMR sofre soft reset baseado na patente</p>
                    </div>
                </div>
            </div>
        `;
        
        // Atualiza barra de progresso
        this.updateCountdownProgress();
    },
    
    /**
     * Renderiza progresso do jogador (async para buscar dados atualizados)
     */
    async renderPlayerProgress() {
        const currentUser = RankedData.currentUser;
        
        if (!currentUser) {
            return `
                <div class="progress-empty">
                    <span class="empty-icon">👤</span>
                    <p>Faça login para ver seu progresso</p>
                    <button class="btn-primary" onclick="showLoginModal()">Fazer Login</button>
                </div>
            `;
        }
        
        // Busca dados atualizados do Firebase (força refresh)
        const player = await RankedData.getPlayer(currentUser, true);
        console.log('🔍 Player data:', player);
        
        const seasonId = this.currentSeason._id || this.currentSeason.id;
        let progress = SeasonData.getPlayerSeasonProgress(currentUser, seasonId);
        
        // Se não há progresso na temporada, usa dados globais do jogador
        if (!progress || progress.gamesPlayed === 0) {
            const totalGames = (player?.wins || 0) + (player?.losses || 0);
            progress = {
                gamesPlayed: totalGames,
                wins: player?.wins || 0,
                losses: player?.losses || 0,
                mmr: player?.mmr || 999,
                rank: player?.rank || 'Bronze I',
                winRate: totalGames > 0 ? (player.wins / totalGames) : 0,
                qualified: totalGames >= (this.currentSeason.settings?.minGamesForRewards || 15)
            };
            console.log('📊 Using global player data:', progress);
        } else {
            console.log('📊 Using season progress:', progress);
        }
        
        const minGames = this.currentSeason.settings?.minGamesForRewards || 15;
        const qualified = progress.gamesPlayed >= minGames;
        const gamesNeeded = Math.max(0, minGames - progress.gamesPlayed);
        
        return `
            <div class="progress-stats">
                <div class="stat-item">
                    <div class="stat-label">Partidas</div>
                    <div class="stat-value">${progress.gamesPlayed}</div>
                    ${!qualified ? `<div class="stat-hint">-${gamesNeeded} restantes</div>` : `<div class="stat-hint">✓ Qualificado</div>`}
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">W / L</div>
                    <div class="stat-value">${progress.wins}W - ${progress.losses}L</div>
                    <div class="stat-hint">${(progress.winRate * 100).toFixed(0)}% WR</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">MMR</div>
                    <div class="stat-value">${progress.mmr}</div>
                    <div class="stat-hint">${progress.rank}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-label">Ranking</div>
                    <div class="stat-value">#${progress.leaderboardPosition || '--'}</div>
                    <div class="stat-hint">Top 10</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderiza recompensas
     */
    renderRewards() {
        const rewards = this.currentSeason.rewards;
        
        return `
            <div class="reward-card top1">
                <div class="reward-icon">${rewards.top1.icon}</div>
                <div class="reward-badge">${rewards.top1.badge}</div>
                <div class="reward-desc">Sage oferenda exclusiva + título permanente</div>
                <div class="reward-req">🥇 1º Lugar</div>
            </div>
            
            <div class="reward-card top2">
                <div class="reward-icon">${rewards.top2.icon}</div>
                <div class="reward-badge">${rewards.top2.badge}</div>
                <div class="reward-desc">Badge oferenda exclusiva + título permanente</div>
                <div class="reward-req">🥈 2º Lugar</div>
            </div>
            
            <div class="reward-card top3">
                <div class="reward-icon">${rewards.top3.icon}</div>
                <div class="reward-badge">${rewards.top3.badge}</div>
                <div class="reward-desc">Badge oferenda exclusiva + título permanente</div>
                <div class="reward-req">🥉 3º Lugar</div>
            </div>
            
            <div class="reward-card veteran">
                <div class="reward-icon">${rewards.participation.icon}</div>
                <div class="reward-badge">${rewards.participation.badge}</div>
                <div class="reward-desc">Badge de participação</div>
                <div class="reward-req">🎖️ ${rewards.participation.minGames || 15}+ partidas</div>
            </div>
        `;
    },
    
    /**
     * Renderiza o Top 10 da temporada
     */
    async renderLeaderboard() {
        // Pega todos os jogadores e ordena por MMR
        const allPlayers = await RankedData.getAllPlayers();
        const seasonId = this.currentSeason._id || this.currentSeason.id;
        
        // Filtra e ordena por progresso da temporada (ou dados globais se não houver)
        const seasonPlayers = allPlayers
            .map(player => {
                let progress = SeasonData.getPlayerSeasonProgress(player.id || player.username, seasonId);
                
                // Se não há progresso na temporada, usa dados globais
                if (!progress || progress.gamesPlayed === 0) {
                    progress = {
                        gamesPlayed: player.gamesPlayed || 0,
                        wins: player.wins || 0,
                        losses: player.losses || 0,
                        mmr: player.mmr || 999,
                        rank: player.rank || 'Bronze I',
                        winRate: player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) : 0
                    };
                }
                
                return { ...player, seasonProgress: progress };
            })
            .filter(p => p.seasonProgress.gamesPlayed > 0)
            .sort((a, b) => b.seasonProgress.mmr - a.seasonProgress.mmr)
            .slice(0, 10);
        
        if (seasonPlayers.length === 0) {
            return `
                <div class="leaderboard-empty">
                    <span class="empty-icon">📊</span>
                    <p>Nenhum jogador na temporada ainda</p>
                    <p class="empty-hint">Seja o primeiro a jogar!</p>
                </div>
            `;
        }
        
        return `
            <div class="leaderboard-list">
                ${seasonPlayers.map((player, index) => `
                    <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                        <div class="player-position">${index + 1}</div>
                        <div class="player-info">
                            <div class="player-name">${player.displayName || player.id || player.username}</div>
                            <div class="player-stats">
                                ${player.seasonProgress.wins}W - ${player.seasonProgress.losses}L • 
                                ${(player.seasonProgress.winRate * 100).toFixed(0)}% WR
                            </div>
                        </div>
                        <div class="player-rank">${player.seasonProgress.rank}</div>
                        <div class="player-mmr">${player.seasonProgress.mmr} MMR</div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Atualiza o progresso do jogador dinamicamente
     */
    async updatePlayerProgress() {
        const container = document.getElementById('playerProgressContent');
        if (!container) return;
        
        try {
            const html = await this.renderPlayerProgress();
            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Erro ao atualizar progresso:', error);
            container.innerHTML = `
                <div class="progress-empty">
                    <span class="empty-icon">⚠️</span>
                    <p>Erro ao carregar progresso</p>
                </div>
            `;
        }
    },
    
    /**
     * Atualiza o leaderboard dinamicamente
     */
    async updateLeaderboard() {
        const container = document.getElementById('seasonLeaderboard');
        if (!container) return;
        
        try {
            const html = await this.renderLeaderboard();
            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Erro ao atualizar leaderboard:', error);
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <span class="empty-icon">⚠️</span>
                    <p>Erro ao carregar ranking</p>
                </div>
            `;
        }
    },
    
    /**
     * Inicia timer de countdown
     */
    startCountdownTimer() {
        const updateTimer = () => {
            const endDate = new Date(this.currentSeason.endDate);
            const now = new Date();
            const diff = endDate - now;
            
            if (diff <= 0) {
                const el = document.getElementById('countdownValue');
                if (el) el.textContent = '0';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            const el = document.getElementById('countdownValue');
            if (el) {
                if (days > 0) {
                    el.textContent = days;
                } else {
                    el.textContent = `${hours}h`;
                }
            }
            
            this.updateCountdownProgress();
        };
        
        updateTimer();
        setInterval(updateTimer, 60000); // Atualiza a cada minuto
    },
    
    /**
     * Atualiza barra de progresso do countdown
     */
    updateCountdownProgress() {
        const startDate = new Date(this.currentSeason.startDate);
        const endDate = new Date(this.currentSeason.endDate);
        const now = new Date();
        
        const total = endDate - startDate;
        const elapsed = now - startDate;
        const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
        
        const progressBar = document.getElementById('countdownProgress');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    },
    
    /**
     * Mostra mensagem de sem temporada
     */
    showNoSeasonMessage() {
        const container = document.getElementById('seasonsContent');
        if (container) {
            container.innerHTML = `
                <div class="no-season">
                    <span class="no-season-icon">🏆</span>
                    <h2>Nenhuma Temporada Ativa</h2>
                    <p>Aguarde o início da próxima temporada ranqueada!</p>
                </div>
            `;
        }
    }
};

// Exporta para uso global
window.SeasonsUI = SeasonsUI;
