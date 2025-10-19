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
        } else if (pageId === 'play') {
            this.updatePendingMatches();
            this.populateOpponentSelect();
        }
    },
    
    // Update all views
    async updateAllViews() {
        await this.updateStats();
        await this.updateTopPlayers();
        await this.updatePendingMatches();
        
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
                    <div style="background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%); 
                               padding: 20px; border-radius: 10px; border: 2px solid ${rank.color}; margin-bottom: 15px;
                               display: flex; justify-content: space-between; align-items: center;">
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
    async renderProfile() {
        try {
            if (!RankedData.currentUser) {
                document.getElementById('profileContent').innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Faça login para ver seu perfil.</p>';
                return;
            }
            
            const player = await RankedData.getPlayer(RankedData.currentUser);
            if (!player) return;
            
            // Garantir valores válidos
            player.mmr = player.mmr || 1000;
            player.wins = player.wins || 0;
            player.losses = player.losses || 0;
            player.gamesPlayed = player.gamesPlayed || 0;
            player.totalKills = player.totalKills || 0;
            player.totalDeaths = player.totalDeaths || 0;
            player.winStreak = player.winStreak || 0;
            player.bestStreak = player.bestStreak || 0;
            
            const rank = RankSystem.getRank(player.mmr);
            const progress = RankSystem.getRankProgress(player.mmr);
            const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';
            const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : player.totalKills.toFixed(2);
        
        document.getElementById('profileContent').innerHTML = `
            <div class="section">
                <div style="background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%);
                           padding: 40px; border-radius: 20px; border: 3px solid ${rank.color};">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 5em; margin-bottom: 10px;">${rank.icon}</div>
                        <h1 style="font-family: 'Orbitron', sans-serif; font-size: 3em; color: ${rank.color}; margin-bottom: 5px;">${player.username}</h1>
                        <div style="font-size: 1.5em; color: var(--text-secondary);">${rank.name}</div>
                        <div style="font-size: 2.5em; color: var(--primary-orange); margin-top: 10px; font-family: 'Orbitron', sans-serif;">${player.mmr} MMR</div>
                    </div>
                    
                    ${progress.next ? `
                    <div style="margin: 30px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Progresso para ${progress.next.icon} ${progress.next.name}</span>
                            <span>${progress.mmrNeeded} MMR restante</span>
                        </div>
                        <div style="background: #0a0a0a; height: 30px; border-radius: 15px; overflow: hidden; border: 2px solid #444;">
                            <div style="width: ${progress.progress}%; height: 100%; background: linear-gradient(90deg, var(--primary-orange), var(--secondary-orange));
                                       transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                                ${progress.progress}%
                            </div>
                        </div>
                    </div>
                    ` : '<p style="text-align: center; color: var(--success); font-size: 1.5em; margin: 20px 0;">Rank maximo atingido!</p>'}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 30px;">
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--success);">${player.wins}</div>
                            <div style="color: var(--text-secondary);">Vitorias</div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--error);">${player.losses}</div>
                            <div style="color: var(--text-secondary);">Derrotas</div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--neon-blue);">${winRate}%</div>
                            <div style="color: var(--text-secondary);">Win Rate</div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--primary-orange);">${kd}</div>
                            <div style="color: var(--text-secondary);">K/D Ratio</div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--warning);">${player.winStreak}</div>
                            <div style="color: var(--text-secondary);">Streak Atual</div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px;">
                            <div style="font-size: 2.5em; color: var(--warning);">${player.bestStreak}</div>
                            <div style="color: var(--text-secondary);">Melhor Streak</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        } catch (error) {
            console.error('Error rendering profile:', error);
            document.getElementById('profileContent').innerHTML = '<p style="text-align: center; color: var(--error);">Erro ao carregar perfil.</p>';
        }
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
                            <tr style="border-bottom: 1px solid #333; background: ${position <= 3 ? 'rgba(255, 102, 0, 0.05)' : 'transparent'};">
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
    }
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
