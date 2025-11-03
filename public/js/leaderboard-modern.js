// ============================================================================
// LEADERBOARD V2.0 - MODERN, CLEAN & MINIMALIST
// ============================================================================

class LeaderboardModern {
    constructor() {
        this.currentSeason = 's1-genesis';
        this.currentMetric = 'mmr';
        this.searchQuery = '';
        this.allPlayers = [];
        this.seasons = [];
        
        this.init();
    }

    async init() {
        console.log('🏆 Initializing Modern Leaderboard...');
        
        // Load seasons data
        await this.loadSeasons();
        
        // Setup event listeners
        this.setupFilters();
        this.setupSearch();
        
        // Initial render
        await this.render();
        
        console.log('✅ Modern Leaderboard initialized');
    }

    async loadSeasons() {
        try {
            const response = await fetch('/data/seasons.json');
            this.seasons = await response.json();
            console.log(`📅 Loaded ${this.seasons.length} seasons`);
            
            // Update season filters
            this.renderSeasonFilters();
        } catch (error) {
            console.error('❌ Error loading seasons:', error);
            this.seasons = [];
        }
    }

    renderSeasonFilters() {
        const container = document.getElementById('seasonFilters');
        if (!container) return;

        const activeSeasons = this.seasons.filter(s => s.active || s.endDate < new Date().toISOString());
        
        let html = '<button class="lb-filter-tab" data-season="all">TEMPO TODO</button>';
        
        activeSeasons.forEach(season => {
            const isActive = season._id === this.currentSeason;
            html += `
                <button class="lb-filter-tab ${isActive ? 'active' : ''}" data-season="${season._id}">
                    ${season.name}
                </button>
            `;
        });
        
        container.innerHTML = html;
    }

    setupFilters() {
        // Season filters
        document.addEventListener('click', (e) => {
            const seasonBtn = e.target.closest('[data-season]');
            if (seasonBtn) {
                const season = seasonBtn.dataset.season;
                this.setSeasonFilter(season);
            }
        });

        // Metric filters
        document.addEventListener('click', (e) => {
            const metricBtn = e.target.closest('[data-metric]');
            if (metricBtn) {
                const metric = metricBtn.dataset.metric;
                this.setMetricFilter(metric);
            }
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('leaderboardSearchModern');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.render();
        });
    }

    setSeasonFilter(season) {
        if (this.currentSeason === season) return;
        
        this.currentSeason = season;
        
        // Update button states
        document.querySelectorAll('[data-season]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.season === season);
        });
        
        this.render();
    }

    setMetricFilter(metric) {
        if (this.currentMetric === metric) return;
        
        this.currentMetric = metric;
        
        // Update button states
        document.querySelectorAll('[data-metric]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.metric === metric);
        });
        
        this.render();
    }

    async render() {
        this.showLoading(true);
        
        try {
            // Get all players data
            await this.fetchPlayers();
            
            // Filter by season
            let players = this.filterBySeason();
            
            // Sort by metric
            players = this.sortByMetric(players);
            
            // Filter by search
            if (this.searchQuery) {
                players = players.filter(p => 
                    (p.username || p.name || '').toLowerCase().includes(this.searchQuery)
                );
            }
            
            // Update player count
            this.updatePlayerCount(players.length);
            
            // Render podium (top 3)
            this.renderPodium(players.slice(0, 3));
            
            // Render list (from 4th onwards)
            this.renderList(players.slice(3));
            
            // Show/hide empty state
            this.showEmpty(players.length === 0);
            
        } catch (error) {
            console.error('❌ Error rendering leaderboard:', error);
            this.showEmpty(true);
        } finally {
            this.showLoading(false);
        }
    }

    async fetchPlayers() {
        try {
            if (!RankedData || typeof RankedData.getAllPlayers !== 'function') {
                console.error('RankedData not available');
                this.allPlayers = [];
                return;
            }
            
            this.allPlayers = await RankedData.getAllPlayers() || [];
            console.log(`👥 Fetched ${this.allPlayers.length} players`);
        } catch (error) {
            console.error('Error fetching players:', error);
            this.allPlayers = [];
        }
    }

    filterBySeason() {
        if (this.currentSeason === 'all') {
            // Tempo todo - usar stats globais
            return this.allPlayers.map(p => ({
                ...p,
                mmr: p.mmr || 0,
                wins: p.wins || 0,
                losses: p.losses || 0,
                totalKills: p.totalKills || 0,
                totalDeaths: p.totalDeaths || 0
            }));
        } else {
            // Temporada específica - usar seasonStats
            return this.allPlayers
                .filter(p => p.seasonStats && p.seasonStats[this.currentSeason])
                .map(p => {
                    const stats = p.seasonStats[this.currentSeason];
                    return {
                        ...p,
                        mmr: stats.mmr || 0,
                        wins: stats.wins || 0,
                        losses: stats.losses || 0,
                        totalKills: stats.kills || 0,
                        totalDeaths: stats.deaths || 0
                    };
                });
        }
    }

    sortByMetric(players) {
        switch (this.currentMetric) {
            case 'mmr':
                return players.sort((a, b) => (b.mmr || 0) - (a.mmr || 0));
            case 'wins':
                return players.sort((a, b) => (b.wins || 0) - (a.wins || 0));
            case 'kills':
                return players.sort((a, b) => (b.totalKills || 0) - (a.totalKills || 0));
            default:
                return players;
        }
    }

    updatePlayerCount(count) {
        const counter = document.querySelector('.lb-count-number');
        if (counter) {
            counter.textContent = count;
        }
    }

    renderPodium(topPlayers) {
        const container = document.getElementById('leaderboardPodium');
        if (!container) return;

        if (topPlayers.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'grid';

        // Reorganizar para ordem visual: 2º, 1º, 3º
        const orderedPlayers = [
            topPlayers[1], // 2º
            topPlayers[0], // 1º
            topPlayers[2]  // 3º
        ].filter(p => p); // Remove undefined

        const html = orderedPlayers.map((player, visualIndex) => {
            // Determinar posição real
            let realPosition;
            if (visualIndex === 1) realPosition = 1; // Centro = 1º
            else if (visualIndex === 0) realPosition = 2; // Esquerda = 2º
            else realPosition = 3; // Direita = 3º

            const rank = this.getRank(player.mmr);
            const value = this.getMetricValue(player);
            const label = this.getMetricLabel();
            
            const wins = player.wins || 0;
            const losses = player.losses || 0;
            const gamesPlayed = wins + losses;
            const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
            
            const kd = (player.totalDeaths > 0) 
                ? (player.totalKills / player.totalDeaths).toFixed(2)
                : (player.totalKills || 0).toFixed(2);

            return `
                <div class="lb-podium-item" onclick="openPlayerProfile('${player.username || player.name}')">
                    ${realPosition === 1 ? '<div class="lb-podium-crown">👑</div>' : ''}
                    <div class="lb-podium-position">${realPosition}</div>
                    <div class="lb-podium-avatar">${(player.username || player.name || '?')[0].toUpperCase()}</div>
                    <div class="lb-podium-name">${player.username || player.name || '—'}</div>
                    <div class="lb-podium-rank">
                        <span class="lb-podium-rank-icon">${rank.icon}</span>
                        <span>${rank.name}</span>
                    </div>
                    <div class="lb-podium-value">${value}</div>
                    <div class="lb-podium-label">${label}</div>
                    <div class="lb-podium-stats">
                        <div class="lb-podium-stat">
                            <span class="lb-podium-stat-value">${winRate}%</span>
                            <span class="lb-podium-stat-label">WR</span>
                        </div>
                        <div class="lb-podium-stat">
                            <span class="lb-podium-stat-value">${kd}</span>
                            <span class="lb-podium-stat-label">K/D</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderList(players) {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        if (players.length === 0) {
            container.innerHTML = '';
            return;
        }

        const currentUsername = RankedData.currentUser;

        const html = players.map((player, index) => {
            const position = index + 4; // Começa do 4º
            const rank = this.getRank(player.mmr);
            const value = this.getMetricValue(player);
            const label = this.getMetricLabel();
            const isCurrentUser = currentUsername && (player.username === currentUsername || player.name === currentUsername);

            const wins = player.wins || 0;
            const losses = player.losses || 0;
            const gamesPlayed = wins + losses;
            const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
            
            const kd = (player.totalDeaths > 0) 
                ? (player.totalKills / player.totalDeaths).toFixed(2)
                : (player.totalKills || 0).toFixed(2);

            return `
                <div class="lb-list-item ${isCurrentUser ? 'is-current' : ''}" onclick="openPlayerProfile('${player.username || player.name}')">
                    <div class="lb-list-position">#${position}</div>
                    
                    <div class="lb-list-player">
                        <div class="lb-list-avatar">${(player.username || player.name || '?')[0].toUpperCase()}</div>
                        <div class="lb-list-info">
                            <div class="lb-list-name">
                                ${player.username || player.name || '—'}
                                ${isCurrentUser ? '<span class="lb-list-badge">VOCÊ</span>' : ''}
                            </div>
                            <div class="lb-list-rank">
                                <span class="lb-list-rank-icon">${rank.icon}</span>
                                <span>${rank.name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="lb-list-stats">
                        <div class="lb-list-value">${value}</div>
                        <div class="lb-list-label">${label}</div>
                        <div class="lb-list-secondary">
                            <span class="lb-list-secondary-stat">${winRate}% WR</span>
                            <span class="lb-list-secondary-stat">${kd} K/D</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    getRank(mmr) {
        if (typeof RankSystem !== 'undefined' && RankSystem.getRank) {
            return RankSystem.getRank(mmr);
        }
        return { icon: '🎖️', name: 'Unranked' };
    }

    getMetricValue(player) {
        switch (this.currentMetric) {
            case 'mmr':
                return player.mmr || 0;
            case 'wins':
                return player.wins || 0;
            case 'kills':
                return player.totalKills || 0;
            default:
                return 0;
        }
    }

    getMetricLabel() {
        switch (this.currentMetric) {
            case 'mmr':
                return 'MMR';
            case 'wins':
                return 'VITÓRIAS';
            case 'kills':
                return 'ABATES';
            default:
                return '';
        }
    }

    showLoading(show) {
        const loading = document.getElementById('leaderboardLoading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }

    showEmpty(show) {
        const empty = document.getElementById('leaderboardEmpty');
        const podium = document.getElementById('leaderboardPodium');
        const list = document.getElementById('leaderboardList');
        
        if (empty) {
            empty.style.display = show ? 'block' : 'none';
        }
        if (podium) {
            podium.style.display = show ? 'none' : 'grid';
        }
        if (list) {
            list.style.display = show ? 'none' : 'flex';
        }
    }
}

// Initialize when page loads
let leaderboardModern = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, waiting for RankedData...');
    
    // Wait for RankedData to be available
    const checkInterval = setInterval(() => {
        if (typeof RankedData !== 'undefined' && RankedData.initialized) {
            console.log('✅ RankedData ready, initializing modern leaderboard');
            clearInterval(checkInterval);
            
            leaderboardModern = new LeaderboardModern();
            
            // Expose globally
            window.LeaderboardModern = leaderboardModern;
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!leaderboardModern) {
            console.warn('⚠️ RankedData not ready after 10s, initializing anyway');
            leaderboardModern = new LeaderboardModern();
            window.LeaderboardModern = leaderboardModern;
        }
    }, 10000);
});

// Re-render when switching to leaderboard page
document.addEventListener('click', (e) => {
    const navLink = e.target.closest('[onclick*="leaderboard"]');
    if (navLink && leaderboardModern) {
        setTimeout(() => {
            leaderboardModern.render();
        }, 100);
    }
});
