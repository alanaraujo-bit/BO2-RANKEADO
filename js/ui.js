// BO2 RANKED - UI MANAGEMENT

const UI = {
    // Show/hide pages
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
        
        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load page-specific content
        if (pageId === 'profile' && RankedData.currentUser) {
            this.renderProfile();
        } else if (pageId === 'leaderboard') {
            this.renderLeaderboard();
        } else if (pageId === 'history' && RankedData.currentUser) {
            this.renderHistory();
        } else if (pageId === 'ranks') {
            this.renderRanks();
        } else if (pageId === 'play') {
            this.updatePendingMatches();
            this.populateOpponentSelect();
        } else if (pageId === 'friends' && RankedData.currentUser) {
            // Initialize friends system on page load
            if (typeof friendsSystem !== 'undefined') {
                friendsSystem.init();
            }
        }
    },
    
    // Update all views
    async updateAllViews() {
        await this.updateStats();
        await this.updateTopPlayers();
        await this.updatePendingMatches();
        await this.updateHeroSection();
        await this.updateRecentMatches();
        await this.updatePodium();
        
        // Update current page
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id;
            if (pageId === 'profile') {
                await this.renderProfile();
            } else if (pageId === 'leaderboard') {
                await this.renderLeaderboard();
            } else if (pageId === 'history') {
                await this.renderHistory();
            }
        }
    },
    
    // Update homepage stats
    async updateStats() {
        try {
            const stats = await RankedData.getStats();
            document.getElementById('totalPlayers').textContent = stats.totalPlayers;
            document.getElementById('totalMatches').textContent = stats.totalMatches;
            document.getElementById('activeSeason').textContent = 'S' + stats.activeSeason;
        } catch (error) {
            console.error('Error updating stats:', error);
            document.getElementById('totalPlayers').textContent = '0';
            document.getElementById('totalMatches').textContent = '0';
            document.getElementById('activeSeason').textContent = 'S1';
        }
    },
    
    // Update top players preview
    async updateTopPlayers() {
        try {
            const leaderboard = await RankedData.getLeaderboard('global');
            const topPlayers = leaderboard.slice(0, 5);
            const container = document.getElementById('topPlayersPreview');
        
            if (!container) return;
            
            if (leaderboard.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum jogador ainda. Seja o primeiro!</p>';
                return;
            }
            
            container.innerHTML = leaderboard.map((player, index) => {
                const rank = RankSystem.getRank(player.mmr);
                const position = index + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `#${position}`;
                const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';
                const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : player.totalKills.toFixed(2);
                
                return `
                    <div onclick="openPlayerProfile('${player.username}')" 
                         style="background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%); 
                               padding: 20px; border-radius: 10px; border: 2px solid ${rank.color}; margin-bottom: 15px;
                               display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.3s ease;"
                         onmouseover="this.style.transform='translateX(10px) scale(1.02)'; this.style.boxShadow='0 0 30px ${rank.color}'"
                         onmouseout="this.style.transform='translateX(0) scale(1)'; this.style.boxShadow='none'">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <span style="font-size: 2em;">${medal}</span>
                            <div>
                                <div style="font-size: 1.5em; font-weight: 700; color: ${rank.color};">${player.username}</div>
                                <div style="color: var(--text-secondary);">${rank.icon} ${rank.name}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 30px; text-align: center;">
                            <div>
                                <div style="font-size: 1.8em; color: var(--primary-orange);">${player.mmr}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">MMR</div>
                            </div>
                            <div>
                                <div style="font-size: 1.5em; color: var(--success);">${player.wins}W</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">${winRate}%</div>
                            </div>
                            <div>
                                <div style="font-size: 1.5em; color: var(--neon-blue);">${kd}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">K/D</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error updating top players:', error);
            const container = document.getElementById('topPlayersPreview');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Erro ao carregar jogadores.</p>';
            }
        }
    },
    
    // Render profile page
    // Render profile page
    async renderProfile() {
        await ProfileManager.renderProfile();
    },
    
    // Render leaderboard
    async renderLeaderboard(type = 'global') {
        try {
            const leaderboard = await RankedData.getLeaderboard(type);
            const container = document.getElementById('leaderboardTable');
            
            if (!container) return;
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum jogador no ranking ainda.</p>';
            return;
        }
        
        container.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: rgba(255, 102, 0, 0.1); border-bottom: 2px solid var(--primary-orange);">
                        <th style="padding: 15px; text-align: left;">POS</th>
                        <th style="padding: 15px; text-align: left;">JOGADOR</th>
                        <th style="padding: 15px; text-align: center;">RANK</th>
                        <th style="padding: 15px; text-align: center;">MMR</th>
                        <th style="padding: 15px; text-align: center;">V/D</th>
                        <th style="padding: 15px; text-align: center;">WIN%</th>
                        <th style="padding: 15px; text-align: center;">K/D</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.map((player, index) => {
                        const rank = RankSystem.getRank(player.mmr);
                        const position = index + 1;
                        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : position;
                        const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';
                        const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : player.totalKills.toFixed(2);
                        
                        return `
                            <tr onclick="openPlayerProfile('${player.username}')" 
                                style="border-bottom: 1px solid #333; background: ${position <= 3 ? 'rgba(255, 102, 0, 0.05)' : 'transparent'}; cursor: pointer; transition: all 0.3s ease;"
                                onmouseover="this.style.background='rgba(255, 102, 0, 0.15)'; this.style.transform='translateX(5px)';"
                                onmouseout="this.style.background='${position <= 3 ? 'rgba(255, 102, 0, 0.05)' : 'transparent'}'; this.style.transform='translateX(0)';">
                                <td style="padding: 15px; font-size: 1.3em;">${medal}</td>
                                <td style="padding: 15px; font-weight: 700; color: ${rank.color};">${player.username}</td>
                                <td style="padding: 15px; text-align: center;">${rank.icon} ${rank.name}</td>
                                <td style="padding: 15px; text-align: center; font-weight: 700; color: var(--primary-orange);">${player.mmr}</td>
                                <td style="padding: 15px; text-align: center;">${player.wins}/${player.losses}</td>
                                <td style="padding: 15px; text-align: center; color: var(--success);">${winRate}%</td>
                                <td style="padding: 15px; text-align: center; color: var(--neon-blue);">${kd}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        } catch (error) {
            console.error('Error rendering leaderboard:', error);
            const container = document.getElementById('leaderboardTable');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: var(--error);">Erro ao carregar ranking.</p>';
            }
        }
    },
    
    // Render match history
    async renderHistory() {
        try {
            const matches = await MatchSystem.getMatchHistory(RankedData.currentUser);
            const container = document.getElementById('matchHistory');
            
            if (!container) return;
        
        if (matches.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhuma partida jogada ainda.</p>';
            return;
        }
        
        container.innerHTML = matches.map(match => {
            const isWinner = match.winner === RankedData.currentUser;
            const opponent = match.playerA === RankedData.currentUser ? match.playerB : match.playerA;
            const kd = (match.kills / Math.max(1, match.deaths)).toFixed(2);
            const date = new Date(match.timestamp).toLocaleString('pt-BR');
            
            return `
                <div style="background: linear-gradient(135deg, ${isWinner ? 'rgba(0, 255, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)'} 0%, rgba(10, 10, 10, 0.9) 100%);
                           padding: 20px; border-radius: 10px; border: 2px solid ${isWinner ? 'var(--success)' : 'var(--error)'};
                           margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 1.5em; font-weight: 700; color: ${isWinner ? 'var(--success)' : 'var(--error)'};">
                            ${isWinner ? 'VITORIA' : 'DERROTA'}
                        </div>
                        <div style="color: var(--text-secondary); margin-top: 5px;">vs ${opponent} - ${match.map} - ${match.mode}</div>
                        <div style="color: var(--text-muted); font-size: 0.9em; margin-top: 5px;">${date}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.8em; color: var(--primary-orange);">${match.kills}/${match.deaths}</div>
                        <div style="color: var(--neon-blue);">K/D: ${kd}</div>
                        ${match.confirmed ? '<div style="color: var(--success); font-size: 0.9em;">Confirmado</div>' : '<div style="color: var(--warning); font-size: 0.9em;">Pendente</div>'}
                    </div>
                </div>
            `;
        }).join('');
        } catch (error) {
            console.error('Error rendering history:', error);
            const container = document.getElementById('matchHistory');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: var(--error);">Erro ao carregar histórico.</p>';
            }
        }
    },
    
    // Update pending matches
    async updatePendingMatches() {
        try {
            const pending = await MatchSystem.getPendingMatches();
            const section = document.getElementById('pendingSection');
            const container = document.getElementById('pendingMatches');
            
            if (!section || !container) return;
        
        if (pending.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = pending.map(p => {
            const match = p.matchData;
            return `
                <div style="background: rgba(26, 26, 26, 0.9); padding: 20px; border-radius: 10px;
                           border: 2px solid var(--warning); margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 1.3em; font-weight: 700;">Partida reportada por ${p.reporter}</div>
                            <div style="color: var(--text-secondary); margin-top: 5px;">
                                ${match.map} - ${match.mode} - Resultado: ${match.winner === RankedData.currentUser ? 'Voce perdeu' : 'Voce venceu'}
                            </div>
                            <div style="color: var(--text-secondary); margin-top: 5px;">
                                K/D reportado: ${match.kills}/${match.deaths}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn-primary" onclick="MatchSystem.confirmMatch(${p.matchId}, true); UI.updatePendingMatches();">
                                CONFIRMAR
                            </button>
                            <button class="btn-secondary" onclick="MatchSystem.confirmMatch(${p.matchId}, false); UI.updatePendingMatches();">
                                REJEITAR
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        } catch (error) {
            console.error('Error updating pending matches:', error);
        }
    },
    
    // Populate opponent select
    async populateOpponentSelect() {
        try {
            const select = document.getElementById('opponentSelect');
            if (!select) return;
            
            const players = (await RankedData.getAllPlayers())
                .filter(p => p.username !== RankedData.currentUser)
                .sort((a, b) => a.username.localeCompare(b.username));
            
            select.innerHTML = '<option value="">Selecione o adversario...</option>' +
                players.map(p => `<option value="${p.username}">${p.username}</option>`).join('');
        } catch (error) {
            console.error('Error populating opponent select:', error);
        }
    },
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--neon-blue)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 2px solid ${colors[type]};
            border-radius: 10px;
            padding: 20px 30px;
            color: var(--text-primary);
            font-size: 1.1em;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 20px ${colors[type]}40;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    // Update Hero Section (Home Page)
    async updateHeroSection() {
        const heroPlayerCard = document.getElementById('heroPlayerCard');
        const showcaseRankIcon = document.getElementById('showcaseRankIcon');
        
        if (!RankedData.currentUser) {
            if (heroPlayerCard) heroPlayerCard.style.display = 'none';
            if (showcaseRankIcon) showcaseRankIcon.textContent = '⚡';
            return;
        }

        const player = await RankedData.getPlayer(RankedData.currentUser);
        if (!player) return;

        const rank = RankSystem.getRank(player.mmr);
        const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(0) : '0';
        const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : player.totalKills.toFixed(2);

        // Update player card
        if (heroPlayerCard) {
            heroPlayerCard.style.display = 'block';
            document.getElementById('heroRankIcon').textContent = rank.icon;
            document.getElementById('heroRankName').textContent = rank.name;
            document.getElementById('heroMMR').textContent = player.mmr;
            document.getElementById('heroWinRate').textContent = winRate + '%';
            document.getElementById('heroKD').textContent = kd;
            document.getElementById('heroMatches').textContent = player.gamesPlayed;
        }

        // Update showcase icon
        if (showcaseRankIcon) {
            showcaseRankIcon.textContent = rank.icon;
        }
    },

    // Update Recent Matches (Home Page)
    async updateRecentMatches() {
        const container = document.getElementById('recentMatchesContainer');
        if (!container) return;

        if (!RankedData.currentUser) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <p class="empty-text">Nenhuma partida jogada ainda</p>
                    <p class="empty-subtext">Faça login e registre sua primeira partida para ver seu histórico aqui</p>
                    <button class="btn-empty-action" onclick="showLoginModal()">Fazer Login</button>
                </div>
            `;
            return;
        }

        const player = await RankedData.getPlayer(RankedData.currentUser);
        if (!player || !player.matchHistory || player.matchHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <p class="empty-text">Nenhuma partida jogada ainda</p>
                    <p class="empty-subtext">Registre sua primeira partida ranqueada para ver seu histórico</p>
                    <button class="btn-empty-action" onclick="showPage('play')">Jogar Agora</button>
                </div>
            `;
            return;
        }

        // Show last 5 matches
        const recentMatches = player.matchHistory.slice(-5).reverse();
        
        container.innerHTML = recentMatches.map(match => {
            const isWin = match.result === 'win';
            const kd = match.deaths > 0 ? (match.kills / match.deaths).toFixed(2) : match.kills.toFixed(2);
            const mmrChange = match.mmrChange || 0;
            
            return `
                <div class="match-card">
                    <div class="match-result-icon">${isWin ? '✅' : '❌'}</div>
                    <div class="match-info">
                        <div class="match-opponent">vs ${match.opponent}</div>
                        <div class="match-details">${match.map} • ${match.gameMode} • ${new Date(match.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div class="match-stats">
                        <div class="match-stat">
                            <div class="match-stat-label">K/D</div>
                            <div class="match-stat-value">${kd}</div>
                        </div>
                        <div class="match-stat">
                            <div class="match-stat-label">KILLS</div>
                            <div class="match-stat-value">${match.kills}</div>
                        </div>
                        <div class="match-stat">
                            <div class="match-stat-label">DEATHS</div>
                            <div class="match-stat-value">${match.deaths}</div>
                        </div>
                    </div>
                    <div class="match-mmr-change ${mmrChange >= 0 ? 'positive' : 'negative'}">
                        ${mmrChange >= 0 ? '+' : ''}${mmrChange}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Update Podium (Top 3 Players)
    async updatePodium() {
        const podiumDisplay = document.getElementById('podiumDisplay');
        if (!podiumDisplay) return;

        try {
            const leaderboard = await RankedData.getLeaderboard('global');
            const top3 = leaderboard.slice(0, 3);

            if (top3.length === 0) {
                podiumDisplay.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏆</div>
                        <p class="empty-text">Seja o primeiro no ranking!</p>
                    </div>
                `;
                return;
            }

            const positions = [
                { place: 'first', medal: '🥇', index: 0 },
                { place: 'second', medal: '🥈', index: 1 },
                { place: 'third', medal: '🥉', index: 2 }
            ];

            podiumDisplay.innerHTML = positions.map(pos => {
                const player = top3[pos.index];
                if (!player) return '';

                const rank = RankSystem.getRank(player.mmr);
                
                return `
                    <div class="podium-place ${pos.place}">
                        <div class="podium-medal">${pos.medal}</div>
                        <div class="podium-player-name">${player.username}</div>
                        <div class="podium-rank-icon">${rank.icon}</div>
                        <div class="podium-mmr">${player.mmr} MMR</div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error updating podium:', error);
        }
    }
};

// Render ranks grid dynamically from RankSystem
UI.renderRanks = function() {
    const grid = document.querySelector('#ranks .ranks-grid');
    if (!grid || typeof RankSystem === 'undefined') return;

    const ranks = RankSystem.getAllRanks();

    // Sort by tier and division ascending (I, II, III)
    const tierOrder = ['bronze','silver','gold','platinum','diamond','master','legend'];
    const romanToNum = { 'I': 1, 'II': 2, 'III': 3 };
    const getDivisionNum = (name) => {
        const parts = name.trim().split(/\s+/);
        const last = parts[parts.length - 1];
        return romanToNum[last] || 0; // 0 for ranks without division (Master/Legend)
    };
    const getTierIndex = (name) => tierOrder.indexOf(RankSystem.getRankTier(name));

    const sorted = [...ranks].sort((a, b) => {
        const ta = getTierIndex(a.name);
        const tb = getTierIndex(b.name);
        if (ta !== tb) return ta - tb;
        const da = getDivisionNum(a.name);
        const db = getDivisionNum(b.name);
        // Ascending: I (1) -> II (2) -> III (3); ranks without division (0) vão no topo do tier
        if (da !== db) return da - db;
        // Fallback by min MMR
        return (a.min || 0) - (b.min || 0);
    });

    const tierBadge = (name) => {
        const tier = RankSystem.getRankTier(name);
        const label = {
            bronze: 'BRONZE',
            silver: 'PRATA',
            gold: 'OURO',
            platinum: 'PLATINA',
            diamond: 'DIAMANTE',
            master: 'MESTRE',
            legend: 'LENDA'
        }[tier] || 'RANK';
        const icon = {
            bronze: '🥉',
            silver: '🥈',
            gold: '🥇',
            platinum: '💠',
            diamond: '💎',
            master: '👑',
            legend: '⚡'
        }[tier] || '🎖️';
        return { tier, label, icon };
    };

    const formatRange = (min, max) => {
        const maxText = max === Infinity ? '+' : `- ${max}`;
        return `${min} ${max === Infinity ? '' : ''}${max === Infinity ? '+' : `- ${max}`} MMR`;
    };

    grid.innerHTML = sorted.map(r => {
        const { tier, label, icon } = tierBadge(r.name);
        const mmrRange = r.max === Infinity ? `${r.min}+ MMR` : `${r.min} - ${r.max} MMR`;
        return `
            <div class="rank-card rank-${tier}">
                <div class="rank-card-header">
                    <div class="rank-card-icon">${icon}</div>
                    <div class="rank-card-badge">${label}</div>
                </div>
                <div class="rank-card-body">
                    <h3 class="rank-card-name">${r.name.toUpperCase()}</h3>
                    <div class="rank-card-mmr">
                        <span class="mmr-range">${mmrRange}</span>
                    </div>
                    <p class="rank-card-description">
                        ${label === 'LENDA' ? 'A elite do BO2 Ranked. Somente os melhores operadores sobrevivem aqui. Você é lenda.' : 'Continue evoluindo e provando seu valor no campo.'}
                    </p>
                </div>
                <div class="rank-card-footer">
                    <span class="rank-tier">${label === 'LENDA' ? 'ELITE' : `Tier ${['bronze','silver','gold','platinum','diamond','master','legend'].indexOf(tier)+1}`}</span>
                </div>
            </div>
        `;
    }).join('');

    // Update player's current/next rank progress (top of ranks page)
    const progressSection = document.getElementById('playerRankProgress');
    if (!progressSection) return;

    if (!RankedData.currentUser) {
        progressSection.style.display = 'none';
        return;
    }

    progressSection.style.display = 'block';
    // Get player data and compute progress
    const player = RankedData.getPlayer(RankedData.currentUser);
    if (!player) return;

    const current = RankSystem.getRank(player.mmr);
    const prog = RankSystem.getRankProgress(player.mmr);

    // Current rank card
    const currentIconEl = document.getElementById('currentRankIcon');
    const currentNameEl = document.getElementById('currentRankName');
    if (currentIconEl) currentIconEl.textContent = current.icon;
    if (currentNameEl) currentNameEl.textContent = current.name.toUpperCase();

    // Next rank card (if exists)
    const nextIconEl = document.getElementById('nextRankIcon');
    const nextNameEl = document.getElementById('nextRankName');
    if (prog.next) {
        const nextRank = RankSystem.getRankByName(prog.next.name) || prog.next;
        if (nextIconEl) nextIconEl.textContent = nextRank.icon || '⚡';
        if (nextNameEl) nextNameEl.textContent = nextRank.name.toUpperCase();
    } else {
        if (nextIconEl) nextIconEl.textContent = '⚡';
        if (nextNameEl) nextNameEl.textContent = 'LENDA';
    }

    // Progress bar large
    const progressFillLarge = document.getElementById('progressBarFillLarge');
    if (progressFillLarge) progressFillLarge.style.width = Math.max(0, Math.min(100, prog.progress)) + '%';
};

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);
