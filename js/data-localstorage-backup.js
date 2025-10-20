// BO2 RANKED - DATA MANAGEMENT

// Global Data Storage
const RankedData = {
    currentUser: null,
    players: {},
    matches: [],
    pendingConfirmations: [],
    currentSeason: 1,
    
    // Initialize or load data
    init() {
        this.loadFromStorage();
        if (!this.players || Object.keys(this.players).length === 0) {
            this.players = {};
        }
        if (!this.matches) {
            this.matches = [];
        }
        if (!this.pendingConfirmations) {
            this.pendingConfirmations = [];
        }
    },
    
    // Save to localStorage
    save() {
        const data = {
            currentUser: this.currentUser,
            players: this.players,
            matches: this.matches,
            pendingConfirmations: this.pendingConfirmations,
            currentSeason: this.currentSeason
        };
        localStorage.setItem('bo2ranked', JSON.stringify(data));
    },
    
    // Load from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('bo2ranked');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentUser = data.currentUser;
            this.players = data.players || {};
            this.matches = data.matches || [];
            this.pendingConfirmations = data.pendingConfirmations || [];
            this.currentSeason = data.currentSeason || 1;
        }
    },
    
    // Create new player
    createPlayer(username) {
        if (this.players[username]) {
            return false; // Player already exists
        }
        
        this.players[username] = {
            username: username,
            mmr: 999, // Starting MMR
            rank: 'Silver I',
            level: 1,
            wins: 0,
            losses: 0,
            totalKills: 0,
            totalDeaths: 0,
            winStreak: 0,
            bestStreak: 0,
            gamesPlayed: 0,
            createdAt: Date.now(),
            lastPlayed: null,
            achievements: [],
            seasonStats: {
                [this.currentSeason]: {
                    wins: 0,
                    losses: 0,
                    mmr: 999
                }
            }
        };
        
        this.save();
        return true;
    },
    
    // Get player data
    getPlayer(username) {
        return this.players[username];
    },
    
    // Update player stats
    updatePlayer(username, updates) {
        if (!this.players[username]) return false;
        
        Object.assign(this.players[username], updates);
        this.save();
        return true;
    },
    
    // Add match to history
    addMatch(matchData) {
        const match = {
            id: this.matches.length + 1,
            ...matchData,
            timestamp: Date.now(),
            season: this.currentSeason,
            confirmed: false
        };
        
        this.matches.unshift(match); // Add to beginning
        this.save();
        return match;
    },
    
    // Add pending confirmation
    addPendingConfirmation(match) {
        this.pendingConfirmations.push({
            matchId: match.id,
            reporter: match.winner,
            opponent: match.loser,
            timestamp: Date.now(),
            matchData: match
        });
        this.save();
    },
    
    // Confirm match
    confirmMatch(matchId) {
        const pendingIndex = this.pendingConfirmations.findIndex(p => p.matchId === matchId);
        if (pendingIndex === -1) return false;
        
        const pending = this.pendingConfirmations[pendingIndex];
        const match = this.matches.find(m => m.id === matchId);
        
        if (match) {
            match.confirmed = true;
            // Process MMR updates here
            this.save();
        }
        
        this.pendingConfirmations.splice(pendingIndex, 1);
        this.save();
        return true;
    },
    
    // Get player match history
    getPlayerMatches(username, limit = 20) {
        return this.matches
            .filter(m => m.playerA === username || m.playerB === username)
            .slice(0, limit);
    },
    
    // Get leaderboard
    getLeaderboard(type = 'global') {
        const players = Object.values(this.players);
        
        if (type === 'season') {
            return players
                .filter(p => p.seasonStats[this.currentSeason])
                .sort((a, b) => {
                    const aStats = a.seasonStats[this.currentSeason];
                    const bStats = b.seasonStats[this.currentSeason];
                    return bStats.mmr - aStats.mmr;
                });
        }
        
        return players.sort((a, b) => b.mmr - a.mmr);
    },
    
    // Get statistics
    getStats() {
        return {
            totalPlayers: Object.keys(this.players).length,
            totalMatches: this.matches.filter(m => m.confirmed).length,
            activeSeason: `S${this.currentSeason}`
        };
    },
    
    // Reset everything (for testing)
    reset() {
        if (confirm('⚠️ RESETAR TUDO? Isso apagará todos os dados permanentemente!')) {
            localStorage.removeItem('bo2ranked');
            this.currentUser = null;
            this.players = {};
            this.matches = [];
            this.pendingConfirmations = [];
            this.currentSeason = 1;
            location.reload();
        }
    }
};
