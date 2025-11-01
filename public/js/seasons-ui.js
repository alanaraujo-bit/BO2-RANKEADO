/* ===================================================================
   BO2 RANKED - SEASONS UI
   User interface functions for season page
   ================================================================ */

const SeasonsUI = {
    // Initialize seasons page
    init() {
        this.updateActiveSeasonDisplay();
        this.updatePlayerProgress();
        this.updateSeasonLeaderboard();
        this.updatePastSeasons();
        this.startTimerUpdate();
    },
    
    // Update active season display
    updateActiveSeasonDisplay() {
        const season = SeasonData.getActiveSeason();
        if (!season) return;
        
        // Update season name
        const nameParts = season.name.split(':');
        if (nameParts.length === 2) {
            document.querySelector('.season-hero-title .title-highlight').textContent = nameParts[0].trim() + ':';
            document.querySelector('.season-hero-title .title-main').textContent = nameParts[1].trim().toUpperCase();
        } else {
            document.querySelector('.season-hero-title .title-main').textContent = season.name.toUpperCase();
        }
        
        // Update description
        const descEl = document.getElementById('activeSeasonDescription');
        if (descEl) descEl.textContent = season.description;
        
        // Update status pill and dates
        const statusPill = document.getElementById('seasonStatusPill');
        const datesEl = document.getElementById('seasonDates');
        if (datesEl) {
            const start = new Date(season.startDate).toLocaleDateString('pt-BR');
            const end = new Date(season.endDate).toLocaleDateString('pt-BR');
            datesEl.textContent = `${start} • ${end}`;
        }
        if (statusPill) {
            const now = Date.now();
            let text = 'EM BREVE';
            let bg = 'rgba(255, 255, 0, 0.12)';
            let bd = 'rgba(255, 255, 0, 0.35)';
            let color = '#FFF385';
            if (now >= season.startDate && now <= season.endDate && season.active) {
                text = 'AO VIVO';
                bg = 'rgba(0, 255, 0, 0.12)';
                bd = 'rgba(0, 255, 0, 0.35)';
                color = '#7CFF7C';
            } else if (now > season.endDate || !season.active) {
                text = 'ENCERRADA';
                bg = 'rgba(255, 0, 0, 0.12)';
                bd = 'rgba(255, 0, 0, 0.35)';
                color = '#FF8A8A';
            }
            statusPill.textContent = text;
            statusPill.style.background = bg;
            statusPill.style.borderColor = bd;
            statusPill.style.color = color;
        }

        // Update timer
        this.updateTimer();
        
        // Update rewards
        if (season.rewards) {
            const rewardCards = document.querySelectorAll('.reward-card');
            if (rewardCards[0] && season.rewards.top1) {
                rewardCards[0].querySelector('.reward-title').textContent = season.rewards.top1.badge.replace('🏆 ', '');
                rewardCards[0].querySelector('.reward-badge-preview').textContent = season.rewards.top1.badge;
            }
            if (rewardCards[1] && season.rewards.top2) {
                rewardCards[1].querySelector('.reward-title').textContent = season.rewards.top2.badge.replace('🥈 ', '');
                rewardCards[1].querySelector('.reward-badge-preview').textContent = season.rewards.top2.badge;
            }
            if (rewardCards[2] && season.rewards.top3) {
                rewardCards[2].querySelector('.reward-title').textContent = season.rewards.top3.badge.replace('🥉 ', '');
                rewardCards[2].querySelector('.reward-badge-preview').textContent = season.rewards.top3.badge;
            }
            if (rewardCards[3] && season.rewards.participation) {
                rewardCards[3].querySelector('.reward-title').textContent = season.rewards.participation.badge.replace('🎖️ ', '');
                rewardCards[3].querySelector('.reward-badge-preview').textContent = season.rewards.participation.badge;
            }
        }
    },
    
    // Update timer display
    updateTimer() {
        const season = SeasonData.getActiveSeason();
        if (!season) return;
        
        const daysRemaining = SeasonData.getDaysRemaining(season.id);
        const timerValue = document.getElementById('timerValue');
        
        if (timerValue) {
            if (daysRemaining > 1) {
                timerValue.textContent = `${daysRemaining} dias`;
            } else if (daysRemaining === 1) {
                timerValue.textContent = '1 dia';
            } else {
                timerValue.textContent = 'Temporada encerrada';
            }
        }
    },
    
    // Start timer auto-update
    startTimerUpdate() {
        // Update every hour
        setInterval(() => {
            this.updateTimer();
        }, 3600000);
    },
    
    // Update player progress
    updatePlayerProgress() {
        const currentUser = RankedData.currentUser;
        if (!currentUser) {
            document.getElementById('seasonProgressSection').style.display = 'none';
            return;
        }
        
        document.getElementById('seasonProgressSection').style.display = 'block';
        
        const season = SeasonData.getActiveSeason();
        if (!season) return;
        
        const progress = SeasonData.getPlayerSeasonProgress(currentUser, season.id);
        
        // Update stats
        document.getElementById('seasonMMR').textContent = progress.mmr;
        document.getElementById('seasonRank').textContent = progress.rank;
        document.getElementById('seasonWinLoss').textContent = `${progress.wins} / ${progress.losses}`;
        document.getElementById('seasonWinRate').textContent = `${progress.winRate}%`;
        document.getElementById('seasonKD').textContent = progress.kd;
        
        // Get leaderboard position
        const leaderboard = SeasonData.getSeasonLeaderboard(season.id);
        const position = leaderboard.findIndex(p => p.playerId === currentUser) + 1;
        document.getElementById('seasonPosition').textContent = position > 0 ? `#${position}` : '-';
        
        // Update qualification progress
        const qualBar = document.getElementById('qualificationBar');
        const qualInfo = document.getElementById('qualificationInfo');
        const minGames = season.settings.minGamesForRank;
        const gamesPlayed = progress.gamesPlayed;
        const percentage = Math.min((gamesPlayed / minGames) * 100, 100);
        
        if (qualBar) {
            qualBar.style.width = `${percentage}%`;
            if (progress.qualified) {
                qualBar.style.background = 'linear-gradient(90deg, #00FF00, #00DD00)';
            }
        }
        
        if (qualInfo) {
            if (progress.qualified) {
                qualInfo.innerHTML = `✅ Qualificado! ${gamesPlayed} partidas jogadas`;
                qualInfo.style.color = '#00FF00';
            } else {
                qualInfo.textContent = `${gamesPlayed} / ${minGames} partidas jogadas`;
            }
        }

        // Goal hint: suggest Top 10% based on qualified count
        const goalHint = document.getElementById('seasonGoalHint');
        if (goalHint) {
            const fullLb = SeasonData.getSeasonLeaderboard(season.id, 10000);
            const qualifiedCount = fullLb.length;
            if (qualifiedCount > 0) {
                const goalPos = Math.max(1, Math.ceil(qualifiedCount * 0.1));
                goalHint.textContent = `Meta sugerida: ficar no Top ${Math.round(qualifiedCount * 0.1)} (${goalPos}º ou melhor)`;
            } else {
                goalHint.textContent = '';
            }
        }

        // Rank progress to next
        const rs = RankSystem.getRankProgress(progress.mmr);
        const currentRank = rs.current;
        const nextRank = rs.next;
        const fill = document.getElementById('seasonProgressBarFill');
        const curIcon = document.getElementById('seasonProgressCurrentIcon');
        const curName = document.getElementById('seasonProgressCurrentName');
        const nextIcon = document.getElementById('seasonProgressNextIcon');
        const nextName = document.getElementById('seasonProgressNextName');
        const mmrNeededEl = document.getElementById('seasonProgressMMRNeeded');
        const minEl = document.getElementById('seasonProgressMin');
        const maxEl = document.getElementById('seasonProgressMax');
        const pctEl = document.getElementById('seasonProgressPercent');
        
        if (curIcon) curIcon.textContent = currentRank.icon || '🎖️';
        if (curName) curName.textContent = currentRank.name;
        if (fill) fill.style.width = `${rs.progress}%`;
        if (minEl) minEl.textContent = currentRank.min;
        if (pctEl) pctEl.textContent = `${rs.progress}%`;
        if (maxEl) maxEl.textContent = currentRank.max === Infinity ? `${currentRank.min}+` : currentRank.max;
        
        if (nextRank) {
            if (nextIcon) nextIcon.textContent = nextRank.icon || '';
            if (nextName) nextName.textContent = nextRank.name;
            if (mmrNeededEl) mmrNeededEl.textContent = rs.mmrNeeded;
        } else {
            if (nextName) nextName.textContent = 'Máximo';
            if (mmrNeededEl) mmrNeededEl.textContent = 0;
        }
    },
    
    // Update season leaderboard
    updateSeasonLeaderboard() {
        const season = SeasonData.getActiveSeason();
        if (!season) return;
        
        const leaderboard = SeasonData.getSeasonLeaderboard(season.id, 10);
        const tableEl = document.getElementById('seasonLeaderboardTable');
        
        if (!tableEl) return;
        
        if (leaderboard.length === 0) {
            tableEl.innerHTML = `
                <div class="empty-leaderboard">
                    <div class="empty-icon">🏆</div>
                    <div class="empty-text">Nenhum jogador qualificado ainda</div>
                    <div class="empty-hint">Jogue pelo menos ${season.settings.minGamesForRank} partidas para aparecer no ranking</div>
                </div>
            `;
            return;
        }
        
        const currentUser = RankedData.currentUser;
        
        tableEl.innerHTML = leaderboard.map((player, index) => {
            const isCurrentUser = player.playerId === currentUser;
            const positionClass = index === 0 ? 'position-1' : index === 1 ? 'position-2' : index === 2 ? 'position-3' : '';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            return `
                <div class="leaderboard-row ${positionClass} ${isCurrentUser ? 'current-user' : ''}">
                    <div class="lb-position">
                        ${medal || `#${index + 1}`}
                    </div>
                    <div class="lb-player">
                        <div class="lb-player-name">${player.playerId}${isCurrentUser ? ' (Você)' : ''}</div>
                        <div class="lb-player-rank">${player.rank}</div>
                    </div>
                    <div class="lb-stats">
                        <div class="lb-stat">
                            <span class="lb-stat-label">MMR:</span>
                            <span class="lb-stat-value">${player.mmr}</span>
                        </div>
                        <div class="lb-stat">
                            <span class="lb-stat-label">W/L:</span>
                            <span class="lb-stat-value">${player.wins}/${player.losses}</span>
                        </div>
                        <div class="lb-stat">
                            <span class="lb-stat-label">K/D:</span>
                            <span class="lb-stat-value">${player.kd}</span>
                        </div>
                        <div class="lb-stat">
                            <span class="lb-stat-label">WR:</span>
                            <span class="lb-stat-value">${player.winRate}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Update past seasons
    updatePastSeasons() {
        const allSeasons = SeasonData.getAllSeasons();
        const pastSeasons = allSeasons.filter(s => !s.active);
        const gridEl = document.getElementById('pastSeasonsGrid');
        
        if (!gridEl) return;
        
        if (pastSeasons.length === 0) {
            gridEl.innerHTML = `
                <div class="no-past-seasons">
                    <div class="no-past-icon">📜</div>
                    <div class="no-past-text">Nenhuma temporada anterior</div>
                    <div class="no-past-hint">Esta é a primeira temporada ranqueada!</div>
                </div>
            `;
            return;
        }
        
        gridEl.innerHTML = pastSeasons.map(season => {
            const leaderboard = SeasonData.getSeasonLeaderboard(season.id, 3);
            const startDate = new Date(season.startDate).toLocaleDateString('pt-BR');
            const endDate = new Date(season.endDate).toLocaleDateString('pt-BR');
            
            return `
                <div class="past-season-card">
                    <div class="past-season-header">
                        <h3 class="past-season-name">${season.name}</h3>
                        <div class="past-season-dates">
                            ${startDate} - ${endDate}
                        </div>
                    </div>
                    <div class="past-season-description">
                        ${season.description}
                    </div>
                    <div class="past-season-podium">
                        <div class="podium-title">🏆 Top 3</div>
                        ${leaderboard.length > 0 ? `
                            <div class="podium-winners">
                                ${leaderboard.map((p, i) => `
                                    <div class="podium-winner">
                                        <span class="podium-medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                        <span class="podium-name">${p.playerId}</span>
                                        <span class="podium-mmr">${p.mmr} MMR</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="podium-empty">Sem dados disponíveis</div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Refresh all season data
    refresh() {
        this.updateActiveSeasonDisplay();
        this.updatePlayerProgress();
        this.updateSeasonLeaderboard();
        this.updatePastSeasons();
    }
};

// Auto-initialize when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for SeasonData to initialize
        setTimeout(() => {
            SeasonsUI.init();
        }, 100);
    });
}

// Update when navigating to seasons page
if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#seasons') {
            setTimeout(() => {
                SeasonsUI.refresh();
            }, 100);
        }
    });
}
