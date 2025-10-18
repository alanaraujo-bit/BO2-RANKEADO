// BO2 RANKED - DATA MANAGEMENT WITH FIREBASE

let auth, db;
let firebaseReady = false;

// Initialize Firebase when loaded
window.addEventListener('load', () => {
    const initialized = window.initFirebase();
    if (initialized) {
        auth = window.firebaseAuth;
        db = window.firebaseDB;
        firebaseReady = true;
        console.log('Data layer connected to Firebase');
    }
});

const RankedData = {
    currentUser: null,
    currentUserId: null,
    players: {},
    matches: [],
    pendingConfirmations: [],
    currentSeason: 1,
    
    // Initialize
    async init() {
        // Wait for Firebase to be ready
        while (!firebaseReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Listen to auth state
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUserId = user.uid;
                await this.loadUserData();
                if (window.updateUserDisplay) {
                    window.updateUserDisplay();
                }
            } else {
                this.currentUserId = null;
                this.currentUser = null;
            }
        });
        
        console.log('RankedData initialized');
    },
    
    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUserId) return;
        
        try {
            const doc = await db.collection('players').doc(this.currentUserId).get();
            
            if (doc.exists) {
                const data = doc.data();
                this.currentUser = data.username;
                this.players[data.username] = data;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },
    
    // Create new player
    async createPlayer(username, email, password) {
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            
            // Create player document in Firestore
            const playerData = {
                userId: userId,
                username: username,
                email: email,
                mmr: 1000,
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
                        mmr: 1000
                    }
                }
            };
            
            await db.collection('players').doc(userId).set(playerData);
            
            this.currentUserId = userId;
            this.currentUser = username;
            this.players[username] = playerData;
            
            return true;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    },
    
    // Login
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Load player data
            const doc = await db.collection('players').doc(userCredential.user.uid).get();
            
            if (doc.exists) {
                const playerData = doc.data();
                this.currentUserId = userCredential.user.uid;
                this.currentUser = playerData.username;
                this.players[this.currentUser] = playerData;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Logout
    async logout() {
        await auth.signOut();
        this.currentUser = null;
        this.currentUserId = null;
        this.players = {};
    },
    
    // Get player
    async getPlayer(username) {
        // Check local cache first
        if (this.players[username]) {
            return this.players[username];
        }
        
        // Query Firestore
        try {
            const querySnapshot = await db.collection('players')
                .where('username', '==', username)
                .get();
            
            if (!querySnapshot.empty) {
                const playerData = querySnapshot.docs[0].data();
                this.players[username] = playerData;
                return playerData;
            }
        } catch (error) {
            console.error('Error getting player:', error);
        }
        
        return null;
    },
    
    // Update player
    async updatePlayer(username, updates) {
        const player = await this.getPlayer(username);
        if (!player) return false;
        
        try {
            await db.collection('players').doc(player.userId).update(updates);
            
            // Update local cache
            Object.assign(this.players[username], updates);
            return true;
        } catch (error) {
            console.error('Error updating player:', error);
            return false;
        }
    },
    
    // Add match
    async addMatch(matchData) {
        try {
            const match = {
                ...matchData,
                timestamp: Date.now(),
                confirmed: false
            };
            
            const docRef = await db.collection('matches').add(match);
            match.id = docRef.id;
            
            this.matches.push(match);
            return match;
        } catch (error) {
            console.error('Error adding match:', error);
            throw error;
        }
    },
    
    // Add pending confirmation
    async addPendingConfirmation(match) {
        try {
            const pending = {
                matchId: match.id,
                reporter: match.reporter,
                opponent: match.playerA === match.reporter ? match.playerB : match.playerA,
                matchData: match,
                timestamp: Date.now()
            };
            
            const docRef = await db.collection('pendingConfirmations').add(pending);
            pending.id = docRef.id;
            
            this.pendingConfirmations.push(pending);
            return pending;
        } catch (error) {
            console.error('Error adding pending confirmation:', error);
            throw error;
        }
    },
    
    // Confirm match
    async confirmMatch(matchId) {
        try {
            // Update match as confirmed
            await db.collection('matches').doc(matchId).update({ confirmed: true });
            
            // Remove from pending
            const querySnapshot = await db.collection('pendingConfirmations')
                .where('matchId', '==', matchId)
                .get();
            
            const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
            // Update local arrays
            this.pendingConfirmations = this.pendingConfirmations.filter(p => p.matchId !== matchId);
            const match = this.matches.find(m => m.id === matchId);
            if (match) match.confirmed = true;
            
            return true;
        } catch (error) {
            console.error('Error confirming match:', error);
            return false;
        }
    },
    
    // Get leaderboard
    async getLeaderboard(type = 'global') {
        try {
            const querySnapshot = await db.collection('players')
                .orderBy('mmr', 'desc')
                .limit(100)
                .get();
            
            const leaderboard = [];
            querySnapshot.forEach((doc) => {
                leaderboard.push(doc.data());
            });
            
            return leaderboard;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    },
    
    // Get stats
    async getStats() {
        try {
            const playersSnapshot = await db.collection('players').get();
            const matchesSnapshot = await db.collection('matches').get();
            
            const confirmedMatches = matchesSnapshot.docs.filter(doc => doc.data().confirmed);
            
            return {
                totalPlayers: playersSnapshot.size,
                totalMatches: confirmedMatches.length,
                activeSeason: this.currentSeason
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalPlayers: 0,
                totalMatches: 0,
                activeSeason: this.currentSeason
            };
        }
    }
};
