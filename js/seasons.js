/* ===================================================================
   BO2 RANKED - SEASON DATA MANAGEMENT
   Client-side season data storage and management
   Compatible with existing LocalStorage system
   ================================================================ */

const SeasonData = {
    seasons: [],
    activeSeason: null,
    playerSeasonProgress: {}, // { seasonId: { playerId: progressData } }
    
    // Initialize season system
    init() {
        this.loadFromStorage();
        
        // Create default season if none exists
        if (this.seasons.length === 0) {
            this.createDefaultSeason();
        }
        
        // Set active season
        this.activeSeason = this.seasons.find(s => s.active) || this.seasons[0];
    },
    
    // Create default first season
    createDefaultSeason() {
        const defaultSeason = {
            id: 'season-1',
            name: 'Season 1: Genesis',
            description: 'A primeira temporada ranqueada. Prove seu valor e conquiste seu lugar no topo!',
            startDate: new Date('2025-01-01').getTime(),
            endDate: new Date('2025-03-31').getTime(),
            active: true,
            rewards: {
                top1: {
                    badge: '🏆 LEGEND SUPREME',
                    icon: '👑',
                    color: '#FFD700'
                },
                top2: {
                    badge: '🥈 ELITE MASTER',
                    icon: '💎',
                    color: '#C0C0C0'
                },
                top3: {
                    badge: '🥉 TACTICAL EXPERT',
                    icon: '⭐',
                    color: '#CD7F32'
                },
                participation: {
                    badge: '🎖️ SEASON 1 VETERAN',
                    icon: '⚔️'
                }
            },
            settings: {
                minGamesForRank: 10,
                mmrDecayDays: 7,
                mmrDecayAmount: 10
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.seasons.push(defaultSeason);
        this.activeSeason = defaultSeason;
        this.save();
    },
    
    // Get all seasons
    getAllSeasons() {
        return this.seasons.sort((a, b) => b.createdAt - a.createdAt);
    },
    
    // Get active season
    getActiveSeason() {
        return this.activeSeason;
    },
    
    // Get season by ID
    getSeasonById(seasonId) {
        return this.seasons.find(s => s.id === seasonId);
    },
    
    // Create new season
    createSeason(seasonData) {
        // Deactivate all other seasons
        this.seasons.forEach(s => s.active = false);
        
        const newSeason = {
            id: `season-${Date.now()}`,
            name: seasonData.name,
            description: seasonData.description,
            startDate: seasonData.startDate,
            endDate: seasonData.endDate,
            active: true,
            rewards: seasonData.rewards,
            settings: seasonData.settings || {
                minGamesForRank: 10,
                mmrDecayDays: 7,
                mmrDecayAmount: 10
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.seasons.push(newSeason);
        this.activeSeason = newSeason;
        this.save();
        
        return newSeason;
    },
    
    // Get player progress in a season
    getPlayerSeasonProgress(playerId, seasonId) {
        if (!this.playerSeasonProgress[seasonId]) {
            this.playerSeasonProgress[seasonId] = {};
        }
        
        if (!this.playerSeasonProgress[seasonId][playerId]) {
            // Initialize new progress
            const season = this.getSeasonById(seasonId);
            this.playerSeasonProgress[seasonId][playerId] = {
                playerId: playerId,
                seasonId: seasonId,
                seasonName: season ? season.name : 'Unknown Season',
                mmr: 1000,
                rank: 'Bronze I',
                wins: 0,
                losses: 0,
                gamesPlayed: 0,
                totalKills: 0,
                totalDeaths: 0,
                kd: 0,
                winRate: 0,
                winStreak: 0,
                bestStreak: 0,
                finalRank: null,
                rewardEarned: null,
                lastMatchDate: null,
                qualified: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.save();
        }
        
        return this.playerSeasonProgress[seasonId][playerId];
    },
    
    // Register match for active season
    registerSeasonMatch(matchData) {
        const season = this.getActiveSeason();
        if (!season) {
            console.error('No active season found');
            return false;
        }
        
        const { winner, loser, winnerKills, winnerDeaths, loserKills, loserDeaths, mmrChange } = matchData;
        
        // Update winner progress
        const winnerProgress = this.getPlayerSeasonProgress(winner, season.id);
        winnerProgress.wins++;
        winnerProgress.gamesPlayed++;
        winnerProgress.totalKills += winnerKills;
        winnerProgress.totalDeaths += winnerDeaths;
        winnerProgress.mmr += mmrChange;
        winnerProgress.winStreak++;
        winnerProgress.bestStreak = Math.max(winnerProgress.bestStreak, winnerProgress.winStreak);
        winnerProgress.lastMatchDate = Date.now();
        winnerProgress.kd = winnerProgress.totalDeaths > 0 ? 
            (winnerProgress.totalKills / winnerProgress.totalDeaths).toFixed(2) : 
            winnerProgress.totalKills.toFixed(2);
        winnerProgress.winRate = ((winnerProgress.wins / winnerProgress.gamesPlayed) * 100).toFixed(1);
        winnerProgress.qualified = winnerProgress.gamesPlayed >= season.settings.minGamesForRank;
        winnerProgress.updatedAt = Date.now();
        
        // Update rank based on MMR
        winnerProgress.rank = this.calculateRankFromMMR(winnerProgress.mmr);
        
        // Update loser progress
        const loserProgress = this.getPlayerSeasonProgress(loser, season.id);
        loserProgress.losses++;
        loserProgress.gamesPlayed++;
        loserProgress.totalKills += loserKills;
        loserProgress.totalDeaths += loserDeaths;
        loserProgress.mmr -= mmrChange;
        loserProgress.winStreak = 0;
        loserProgress.lastMatchDate = Date.now();
        loserProgress.kd = loserProgress.totalDeaths > 0 ? 
            (loserProgress.totalKills / loserProgress.totalDeaths).toFixed(2) : 
            loserProgress.totalKills.toFixed(2);
        loserProgress.winRate = ((loserProgress.wins / loserProgress.gamesPlayed) * 100).toFixed(1);
        loserProgress.qualified = loserProgress.gamesPlayed >= season.settings.minGamesForRank;
        loserProgress.updatedAt = Date.now();
        
        // Update rank based on MMR
        loserProgress.rank = this.calculateRankFromMMR(loserProgress.mmr);
        
        this.save();
        return true;
    },
    
    // Calculate rank from MMR (same as existing system)
    calculateRankFromMMR(mmr) {
        if (mmr >= 2400) return 'Legend';
        if (mmr >= 2200) return 'Master';
        if (mmr >= 2000) return 'Diamond I';
        if (mmr >= 1900) return 'Diamond II';
        if (mmr >= 1800) return 'Diamond III';
        if (mmr >= 1700) return 'Platinum I';
        if (mmr >= 1600) return 'Platinum II';
        if (mmr >= 1500) return 'Platinum III';
        if (mmr >= 1400) return 'Gold I';
        if (mmr >= 1300) return 'Gold II';
        if (mmr >= 1200) return 'Gold III';
        if (mmr >= 1100) return 'Silver I';
        if (mmr >= 1000) return 'Silver II';
        if (mmr >= 900) return 'Silver III';
        if (mmr >= 800) return 'Bronze I';
        if (mmr >= 700) return 'Bronze II';
        return 'Bronze III';
    },
    
    // Get season leaderboard
    getSeasonLeaderboard(seasonId, limit = 100) {
        const seasonProgress = this.playerSeasonProgress[seasonId] || {};
        
        const leaderboard = Object.values(seasonProgress)
            .filter(p => p.qualified) // Only qualified players
            .sort((a, b) => {
                if (b.mmr !== a.mmr) return b.mmr - a.mmr;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return a.losses - b.losses;
            })
            .slice(0, limit)
            .map((p, index) => ({
                ...p,
                position: index + 1
            }));
        
        return leaderboard;
    },
    
    // End season and distribute rewards
    endSeason(seasonId) {
        const season = this.getSeasonById(seasonId);
        if (!season) return false;
        
        season.active = false;
        season.endDate = Date.now();
        
        const leaderboard = this.getSeasonLeaderboard(seasonId, 3);
        
        // Assign rewards to top 3
        if (leaderboard[0]) {
            const progress = this.playerSeasonProgress[seasonId][leaderboard[0].playerId];
            progress.finalRank = 1;
            progress.rewardEarned = season.rewards.top1;
        }
        if (leaderboard[1]) {
            const progress = this.playerSeasonProgress[seasonId][leaderboard[1].playerId];
            progress.finalRank = 2;
            progress.rewardEarned = season.rewards.top2;
        }
        if (leaderboard[2]) {
            const progress = this.playerSeasonProgress[seasonId][leaderboard[2].playerId];
            progress.finalRank = 3;
            progress.rewardEarned = season.rewards.top3;
        }
        
        // Assign participation badge to all qualified players
        const allPlayers = Object.values(this.playerSeasonProgress[seasonId] || {});
        allPlayers.forEach(progress => {
            if (progress.qualified && !progress.rewardEarned) {
                progress.rewardEarned = season.rewards.participation;
            }
        });
        
        this.save();
        return true;
    },
    
    // Check if season is active
    isSeasonActive(seasonId) {
        const season = this.getSeasonById(seasonId);
        if (!season) return false;
        
        const now = Date.now();
        return season.active && now >= season.startDate && now <= season.endDate;
    },
    
    // Get days remaining in active season
    getDaysRemaining(seasonId) {
        const season = this.getSeasonById(seasonId);
        if (!season) return 0;
        
        const now = Date.now();
        const remaining = season.endDate - now;
        return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
    },
    
    // Save to localStorage
    save() {
        const data = {
            seasons: this.seasons,
            playerSeasonProgress: this.playerSeasonProgress
        };
        localStorage.setItem('bo2ranked-seasons', JSON.stringify(data));
    },
    
    // Load from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('bo2ranked-seasons');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.seasons = data.seasons || [];
                this.playerSeasonProgress = data.playerSeasonProgress || {};
            } catch (e) {
                console.error('Error loading season data:', e);
                this.seasons = [];
                this.playerSeasonProgress = {};
            }
        }
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        SeasonData.init();
    });
}
