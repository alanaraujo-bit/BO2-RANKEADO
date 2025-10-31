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
                    <div class="top-player-item">
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
    async updatePodium() { try {} catch(e) { console.error(e); } },

    async renderProfile() {
        try {
            // delegate to pages/profile.js if exists
            if (typeof window.renderProfile === 'function') return window.renderProfile();
            // otherwise, no-op
        } catch (e) { console.error('UI.renderProfile error:', e); }
    },

    async renderLeaderboard() { try { /* keep for compatibility */ } catch(e) { console.error(e); } },
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
        console.log('Google login button clicked (delegated)');
        if (typeof window.loginWithGoogle === 'function') {
            window.loginWithGoogle();
        } else {
            console.warn('loginWithGoogle not defined on window');
        }
    } catch (err) {
        console.error('Error in delegated Google login handler:', err);
    }
});

// End of file