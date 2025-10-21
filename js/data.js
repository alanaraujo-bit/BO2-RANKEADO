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
    
    // Generate unique user ID
    generateUserId() {
        const num = Math.floor(1000 + Math.random() * 9000);
        return `BO2#${num}`;
    },

    // Generate random avatar URL (or use default)
    generateAvatar(username) {
        // Using RoboHash for unique avatars based on username
        return `https://robohash.org/${username}?set=set4&size=200x200`;
    },

    // Create new player
    createPlayer(username) {
        if (this.players[username]) {
            return false; // Player already exists
        }
        
        this.players[username] = {
            username: username,
            userId: this.generateUserId(),
            avatarUrl: this.generateAvatar(username),
            status: 'offline', // online, offline, in-match
            lastOnline: Date.now(),
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
            friends: [],
            friendRequests: {
                sent: [],
                received: []
            },
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
        const player = this.players[username];
        
        // Migrate old players to new structure
        if (player && !player.userId) {
            player.userId = this.generateUserId();
            player.avatarUrl = this.generateAvatar(username);
            player.status = 'offline';
            player.lastOnline = Date.now();
            player.friends = player.friends || [];
            player.friendRequests = player.friendRequests || { sent: [], received: [] };
            
            // Fix old friendRequests format
            if (Array.isArray(player.friendRequests)) {
                player.friendRequests = {
                    sent: [],
                    received: player.friendRequests.map(req => ({
                        from: req.from,
                        timestamp: req.timestamp
                    }))
                };
            }
            
            this.save();
        }
        
        return player;
    },
    
    // Update player stats
    updatePlayer(username, updates) {
        if (!this.players[username]) return false;
        
        Object.assign(this.players[username], updates);
        this.save();
        return true;
    },

    // Append a match entry to a player's personal history
    addMatchToHistory(username, entry) {
        const player = this.players[username];
        if (!player) return false;

        // Ensure structure exists
        if (!player.matchHistory) player.matchHistory = [];

        // Basic normalization
        const normalized = {
            result: entry.result, // 'win' | 'loss' | 'draw'
            opponent: entry.opponent,
            map: entry.map,
            gameMode: entry.gameMode || entry.mode,
            kills: Number(entry.kills) || 0,
            deaths: Number(entry.deaths) || 0,
            mmrChange: Number(entry.mmrChange) || 0,
            matchId: entry.matchId,
            season: entry.season || this.currentSeason,
            date: entry.date || Date.now(),
            timestamp: entry.timestamp || Date.now(),
            confirmed: entry.confirmed !== undefined ? entry.confirmed : true
        };

        player.matchHistory.push(normalized);

        // Keep last 100 entries to avoid bloat
        if (player.matchHistory.length > 100) {
            player.matchHistory = player.matchHistory.slice(-100);
        }

        this.save();
        return true;
    },
    
    // Add match to history
    addMatch(matchData) {
        const match = {
            id: this.matches.length + 1,
            ...matchData,
            players: [matchData.playerA, matchData.playerB],
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
        // O oponente é quem precisa confirmar (quem NÃO reportou)
        const opponent = match.reporter === match.playerA ? match.playerB : match.playerA;
        
        this.pendingConfirmations.push({
            matchId: match.id,
            reporter: match.reporter,
            opponent: opponent,
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
        if (!Array.isArray(this.matches)) return [];

        // Migrate legacy matches (add players array if missing)
        let mutated = false;
        this.matches.forEach(m => {
            if (!m.players && (m.playerA || m.playerB)) {
                m.players = [m.playerA, m.playerB].filter(Boolean);
                mutated = true;
            }
        });
        if (mutated) this.save();

        return this.matches
            .filter(m => Array.isArray(m.players) ? m.players.includes(username) : (m.playerA === username || m.playerB === username))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
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
