// BO2 RANKED - UI MANAGEMENT (minimal, robust version)

const UI = {
    showPage(pageId) {
        try {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const page = document.getElementById(pageId);
            if (page) page.classList.add('active');

            // Mark nav active (safe)
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
            if (activeLink) activeLink.classList.add('active');

            // Call page-specific renderers if present
            if (pageId === 'profile' && RankedData && RankedData.currentUser) this.renderProfile().catch(() => {});
            else if (pageId === 'leaderboard') this.renderLeaderboard().catch(() => {});
            else if (pageId === 'history' && RankedData && RankedData.currentUser) this.renderHistory().catch(() => {});
            else if (pageId === 'ranks') this.renderRanks().catch(() => {});
            else if (pageId === 'play') {
                this.updatePendingMatches().catch(() => {});
                this.populateOpponentSelect().catch(() => {});
            }
        } catch (e) {
            console.error('UI.showPage error:', e);
        }
    },

    async updateAllViews() {
        try {
            await this.updateStats();
            await this.updateTopPlayers();
            await this.updatePendingMatches();
            await this.updateHeroSection();
            await this.updateRecentMatches();
            await this.updatePodium();

            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const pageId = activePage.id;
                if (pageId === 'profile') await this.renderProfile();
                else if (pageId === 'leaderboard') await this.renderLeaderboard();
                else if (pageId === 'history') await this.renderHistory();
            }
        } catch (e) {
            console.error('UI.updateAllViews error:', e);
        }
    },

    async updateStats() {
        try {
            if (!RankedData || typeof RankedData.getStats !== 'function') return;
            const stats = await RankedData.getStats();
            const tp = document.getElementById('totalPlayers');
            const tm = document.getElementById('totalMatches');
            const as = document.getElementById('activeSeason');
            if (tp) tp.textContent = stats.totalPlayers || 0;
            if (tm) tm.textContent = stats.totalMatches || 0;
            if (as) as.textContent = 'S' + (stats.activeSeason || 1);
        } catch (e) {
            console.error('UI.updateStats error:', e);
        }
    },

    async updateTopPlayers() {
        try {
            if (!RankedData || typeof RankedData.getLeaderboard !== 'function') return;
            const leaderboard = await RankedData.getLeaderboard('global') || [];
            const container = document.getElementById('topPlayersPreview');
            if (!container) return;
            if (leaderboard.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Nenhum jogador ainda. Seja o primeiro!</p>';
                return;
            }

            container.innerHTML = leaderboard.slice(0,5).map((player, i) => {
                const rank = (typeof RankSystem !== 'undefined' && RankSystem.getRank) ? RankSystem.getRank(player.mmr) : { icon: '', name: '' };
                const pos = i + 1;
                const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;
                const winRate = player.gamesPlayed ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';
                const kd = (player.totalDeaths && player.totalDeaths > 0) ? (player.totalKills / player.totalDeaths).toFixed(2) : ((player.totalKills||0).toFixed(2));

                return `
                    <div class="top-player-item" onclick="openPlayerProfile('${player.username || player.name}')" style="cursor: pointer;">
                        <div class="pos">${medal}</div>
                        <div class="info">
                            <div class="name">${rank.icon || ''} ${player.username || player.name || '—'}</div>
                            <div class="meta">MMR: ${player.mmr || 0} • W:${player.wins||0} L:${player.losses||0}</div>
                        </div>
                        <div class="stats">K/D ${kd} • WR ${winRate}%</div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('UI.updateTopPlayers error:', e);
        }
    },

    // Simple notification/toast helper (fallback for when a richer UI isn't available)
    showNotification(message, type = 'info') {
        try {
            // Create container if missing
            let container = document.getElementById('bo2-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'bo2-toast-container';
                container.style.position = 'fixed';
                container.style.right = '16px';
                container.style.top = '16px';
                container.style.zIndex = 99999;
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '8px';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = 'bo2-toast ' + type;
            toast.textContent = message || '';
            toast.style.padding = '10px 14px';
            toast.style.borderRadius = '8px';
            toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.45)';
            toast.style.color = '#fff';
            toast.style.fontSize = '13px';
            toast.style.maxWidth = '320px';
            toast.style.opacity = '1';
            toast.style.transition = 'opacity 0.4s ease, transform 0.25s ease';
            toast.style.transform = 'translateY(0)';

            if (type === 'error') {
                toast.style.background = 'linear-gradient(90deg,#ff4d4f,#d9363e)';
            } else if (type === 'success') {
                toast.style.background = 'linear-gradient(90deg,#34c759,#28a745)';
            } else if (type === 'warning') {
                toast.style.background = 'linear-gradient(90deg,#f59e0b,#f97316)';
            } else {
                toast.style.background = 'linear-gradient(90deg,#0ea5e9,#0369a1)';
            }

            container.appendChild(toast);

            // Auto remove
            setTimeout(() => {
                try {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-6px)';
                    setTimeout(() => { try { toast.remove(); } catch(_) {} }, 400);
                } catch (_) {}
            }, 3500);
        } catch (e) {
            try { alert(message); } catch (_) { console.log(message); }
        }
    },

    async updatePendingMatches() {
        // Minimal stub; pages that expect this will call MatchSystem if available
        try {
            if (!MatchSystem || typeof MatchSystem.getPendingMatches !== 'function') return;
            const pending = await MatchSystem.getPendingMatches();
            // no-op for now; UI will call updateNotifications elsewhere
            return pending;
        } catch (e) {
            console.error('UI.updatePendingMatches error:', e);
        }
    },

    async updateHeroSection() {
        // placeholder to avoid runtime errors
        try { /* keep for compatibility */ } catch (e) { console.error(e); }
    },

    async updateRecentMatches() { try {} catch(e) { console.error(e); } },
    
    async updatePodium() {
        try {
            if (!RankedData || typeof RankedData.getLeaderboard !== 'function') return;
            const leaderboard = await RankedData.getLeaderboard('global') || [];
            const container = document.getElementById('podiumDisplay');
            if (!container) return;
            
            if (leaderboard.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">Nenhum jogador no pódio ainda.</p>';
                return;
            }

            const top3 = leaderboard.slice(0, 3);
            
            // Garantir que temos 3 posições (preencher com placeholders se necessário)
            while (top3.length < 3) {
                top3.push({ username: '—', mmr: 0, wins: 0, losses: 0, gamesPlayed: 0 });
            }

            const createPodiumCard = (player, position) => {
                const rank = (typeof RankSystem !== 'undefined' && RankSystem.getRank) 
                    ? RankSystem.getRank(player.mmr) 
                    : { icon: '🎖️', name: 'Unranked' };
                
                const winRate = player.gamesPlayed 
                    ? ((player.wins / player.gamesPlayed) * 100).toFixed(0) 
                    : '0';
                
                const medal = position === 1 ? '🏆' : position === 2 ? '🥈' : '🥉';
                const heightClass = position === 1 ? 'first' : position === 2 ? 'second' : 'third';
                
                // Se não houver jogador válido, não mostrar o card
                if (!player.username || player.username === '—') {
                    return '';
                }
                
                return `
                    <div class="podium-place ${heightClass}" onclick="openPlayerProfile('${player.username || player.name}')" style="cursor: pointer;">
                        <div class="podium-position">#${position}</div>
                        <div class="podium-medal">${medal}</div>
                        <div class="podium-player-info">
                            <div class="podium-rank-icon">${rank.icon || '🎖️'}</div>
                            <div class="podium-player-name">${player.username || player.name}</div>
                            <div class="podium-mmr">${player.mmr || 0}<span style="font-size: 0.5em; opacity: 0.7;"> MMR</span></div>
                            <div class="podium-stats">
                                <span>${player.wins || 0}W / ${player.losses || 0}L</span>
                                <span>${winRate}% WR</span>
                            </div>
                        </div>
                    </div>
                `;
            };

            // Montar o pódio na ordem visual: 2º, 1º, 3º
            container.innerHTML = `
                <div class="podium-wrapper">
                    ${createPodiumCard(top3[1], 2)}
                    ${createPodiumCard(top3[0], 1)}
                    ${createPodiumCard(top3[2], 3)}
                </div>
            `;
        } catch (e) {
            console.error('UI.updatePodium error:', e);
        }
    },

    async renderProfile() {
        try {
            // delegate to pages/profile.js if exists
            if (typeof window.renderProfile === 'function') return window.renderProfile();
            // otherwise, no-op
        } catch (e) { console.error('UI.renderProfile error:', e); }
    },

    async renderLeaderboard(type = 'global') { 
        try {
            if (!RankedData || typeof RankedData.getLeaderboard !== 'function') return;
            
            const leaderboard = await RankedData.getLeaderboard(type) || [];
            const container = document.getElementById('leaderboardTable');
            
            if (!container) {
                console.error('leaderboardTable container not found');
                return;
            }
            
            if (leaderboard.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">Nenhum jogador ranqueado ainda.</p>';
                return;
            }
            
            const currentUsername = RankedData.currentUser;
            const totalPlayers = leaderboard.length;
            
            container.innerHTML = `
                <div class="lb-header">
                    <div class="lb-search-wrapper">
                        <input type="text" id="leaderboardSearch" placeholder="Buscar jogador..." class="lb-search">
                    </div>
                    <div class="lb-info">
                        <span>${totalPlayers} jogadores</span>
                    </div>
                </div>
                
                <div class="lb-container">
                    ${leaderboard.map((player, index) => {
                        const rank = (typeof RankSystem !== 'undefined' && RankSystem.getRank) 
                            ? RankSystem.getRank(player.mmr) 
                            : { icon: '🎖️', name: 'Unranked' };
                        
                        const winRate = player.gamesPlayed 
                            ? ((player.wins / player.gamesPlayed) * 100).toFixed(0) 
                            : '0';
                        
                        const kd = (player.totalDeaths && player.totalDeaths > 0) 
                            ? (player.totalKills / player.totalDeaths).toFixed(2) 
                            : (player.totalKills || 0).toFixed(2);
                        
                        const position = index + 1;
                        const isCurrentUser = currentUsername && (player.username === currentUsername || player.name === currentUsername);
                        const topClass = position <= 3 ? `top-${position}` : '';
                        const currentClass = isCurrentUser ? 'is-current' : '';
                        
                        return `
                            <div class="lb-card ${topClass} ${currentClass}" data-player="${player.username || player.name}" onclick="openPlayerProfile('${player.username || player.name}')" style="cursor: pointer;">
                                <div class="lb-rank">
                                    <span class="lb-pos">#${position}</span>
                                    ${position === 1 ? '<span class="lb-medal">🥇</span>' : ''}
                                    ${position === 2 ? '<span class="lb-medal">🥈</span>' : ''}
                                    ${position === 3 ? '<span class="lb-medal">🥉</span>' : ''}
                                </div>
                                
                                <div class="lb-player">
                                    <div class="lb-avatar">${(player.username || player.name || '?')[0].toUpperCase()}</div>
                                    <div class="lb-name">
                                        ${player.username || player.name || '—'}
                                        ${isCurrentUser ? '<span class="lb-you">VOCÊ</span>' : ''}
                                    </div>
                                </div>
                                
                                <div class="lb-tier">
                                    <span class="lb-tier-icon">${rank.icon || '🎖️'}</span>
                                    <span class="lb-tier-name">${rank.name || 'Unranked'}</span>
                                </div>
                                
                                <div class="lb-mmr">
                                    <div class="lb-mmr-value">${player.mmr || 0}</div>
                                    <div class="lb-mmr-label">MMR</div>
                                </div>
                                
                                <div class="lb-stats">
                                    <div class="lb-stat">
                                        <span class="lb-stat-label">V/D</span>
                                        <span class="lb-stat-value">${player.wins || 0}/${player.losses || 0}</span>
                                    </div>
                                    <div class="lb-stat">
                                        <span class="lb-stat-label">K/D</span>
                                        <span class="lb-stat-value ${parseFloat(kd) >= 1.5 ? 'good' : parseFloat(kd) >= 1.0 ? 'ok' : 'bad'}">${kd}</span>
                                    </div>
                                    <div class="lb-stat">
                                        <span class="lb-stat-label">WR</span>
                                        <span class="lb-stat-value">${winRate}%</span>
                                    </div>
                                    <div class="lb-stat">
                                        <span class="lb-stat-label">Partidas</span>
                                        <span class="lb-stat-value">${player.gamesPlayed || 0}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            // Funcionalidade de busca
            const searchInput = document.getElementById('leaderboardSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const cards = document.querySelectorAll('.lb-card');
                    
                    cards.forEach(card => {
                        const playerName = card.dataset.player?.toLowerCase() || '';
                        card.style.display = playerName.includes(searchTerm) ? '' : 'none';
                    });
                });
            }
            
            // Scroll para usuário atual
            if (currentUsername) {
                setTimeout(() => {
                    const currentCard = document.querySelector('.lb-card.is-current');
                    if (currentCard) {
                        currentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
            
        } catch(e) { 
            console.error('UI.renderLeaderboard error:', e); 
        } 
    },
    async renderHistory() { try { /* keep for compatibility */ } catch(e) { console.error(e); } },
    async renderRanks() { try { /* keep for compatibility */ } catch(e) { console.error(e); } },

    async populateOpponentSelect() { try { /* no-op */ } catch(e) { console.error(e); } }
};

// Expose UI to global scope for legacy code
window.UI = window.UI || UI;
// Provide a fallback showLoginModal for legacy callers (pages/index.js expects this)
UI.showLoginModal = UI.showLoginModal || function() {
    try {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            const usernameInput = document.getElementById('usernameInput');
            if (usernameInput) usernameInput.focus();

            // Try to add terminal effect if available
            try {
                const evt = new Event('bo2:login-modal-opened');
                window.dispatchEvent(evt);
            } catch (e) {}
        } else {
            console.warn('UI.showLoginModal: #loginModal not found in DOM');
        }
    } catch (e) {
        console.error('UI.showLoginModal error:', e);
    }
};

// Also expose as global function for legacy inline handlers
window.showLoginModal = window.showLoginModal || UI.showLoginModal;

// Delegate clicks on Google login button to the login handler (fix for builds where
// inline/onClick handlers or React bindings are not attached)
document.addEventListener('click', function delegateGoogleLogin(e) {
    try {
        const btn = e.target.closest && e.target.closest('.btn-google');
        if (!btn) return;
        console.log('🔵 Google login button clicked (delegated)');
        console.log('🔍 Checking if loginWithGoogle is available:', typeof window.loginWithGoogle);

        // If handler exists, call it immediately
        if (typeof window.loginWithGoogle === 'function') {
            console.log('✅ loginWithGoogle found, calling it now');
            try {
                window.loginWithGoogle();
            } catch (e) {
                console.error('❌ Error calling loginWithGoogle:', e);
                UI.showNotification('Erro ao iniciar login: ' + e.message, 'error');
            }
            return;
        }

        // Otherwise poll for a short period for the handler to become available
        console.log('⏳ loginWithGoogle not found, starting polling...');
        let attempts = 0;
        const maxAttempts = 100; // ~10 seconds with 100ms interval
        const interval = setInterval(() => {
            attempts++;
            console.log(`⏱️ Polling attempt ${attempts}/${maxAttempts} - loginWithGoogle type:`, typeof window.loginWithGoogle);
            
            if (typeof window.loginWithGoogle === 'function') {
                clearInterval(interval);
                console.log('✅ loginWithGoogle found after polling, calling it now');
                try { 
                    window.loginWithGoogle(); 
                } catch (e) { 
                    console.error('❌ loginWithGoogle error after poll:', e); 
                    UI.showNotification('Erro ao iniciar login: ' + e.message, 'error');
                }
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('❌ loginWithGoogle not defined after polling; aborting');
                console.log('📋 Available window functions:', Object.keys(window).filter(k => k.includes('login')));
                // dispatch legacy events in case other scripts listen for them
                try { window.dispatchEvent(new CustomEvent('bo2:request-login-google')); } catch(_) {}
                try { window.dispatchEvent(new CustomEvent('bo2:request-login')); } catch(_) {}
                UI.showNotification('Serviço de login não disponível no momento. Verifique o console para mais detalhes.', 'error');
            }
        }, 100);
    } catch (err) {
        console.error('❌ Error in delegated Google login handler:', err);
        UI.showNotification('Erro crítico no login: ' + err.message, 'error');
    }
});

// End of file