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
            // Usar RankedData.getPlayerMatches para suportar tanto LocalStorage quanto Firebase,
            // e para lidar com documentos antigos sem players[]
            const matches = await RankedData.getPlayerMatches(RankedData.currentUser);
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
            // Try to read per-match MMR change if present
            let mmrChangeText = '';
            if (match.mmrDelta) {
                const delta = isWinner ? match.mmrDelta.winner?.change : match.mmrDelta.loser?.change;
                if (typeof delta === 'number') {
                    mmrChangeText = `<div style="color: ${delta >= 0 ? 'var(--success)' : 'var(--error)'}; font-size: 0.9em;">${delta >= 0 ? '+' : ''}${delta} MMR</div>`;
                }
            }
            
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
                        ${mmrChangeText}
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
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 2px solid ${colors[type]};
            border-radius: 10px;
            padding: 20px 30px;
            color: var(--text-primary);
            font-size: 1.1em;
            font-weight: 600;
            z-index: 11000;
            box-shadow: 0 4px 20px ${colors[type]}40;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Nudge the bell to draw attention
        const bell = document.getElementById('notificationBell');
        if (bell) {
            bell.classList.add('pulse');
            setTimeout(() => bell.classList.remove('pulse'), 800);
        }
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

    const player = await RankedData.getPlayer(RankedData.currentUser, true);
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
