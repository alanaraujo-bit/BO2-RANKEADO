// BO2 RANKED - DATA MANAGEMENT WITH FIREBASE

let auth, db;
let firebaseReady = false;

// Wait for Firebase to be fully loaded
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebaseAuth && window.firebaseDB) {
                clearInterval(checkFirebase);
                auth = window.firebaseAuth;
                db = window.firebaseDB;
                firebaseReady = true;
                console.log('✅ Data layer connected to Firebase');
                resolve(true);
            }
        }, 100);
    });
}

const RankedData = {
    currentUser: null,
    currentUserId: null,
    players: {},
    matches: [],
    pendingConfirmations: [],
    currentSeason: 1,
    initialized: false,
    
    // Initialize
    async init() {
        if (this.initialized) return;
        
        // Wait for Firebase to be ready
        await waitForFirebase();
        
        // Listen to auth state
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUserId = user.uid;
                await this.loadUserData();
                await this.loadPendingConfirmations(); // Load pending confirmations
                if (window.updateUserDisplay) {
                    window.updateUserDisplay();
                }
                console.log('✅ User logged in:', this.currentUser);
            } else {
                this.currentUserId = null;
                this.currentUser = null;
                this.pendingConfirmations = []; // Clear pending confirmations
                console.log('User logged out');
            }
        });
        
        this.initialized = true;
        console.log('✅ RankedData initialized');
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
    
    // Load pending confirmations for current user
    async loadPendingConfirmations() {
        if (!this.currentUser) return;
        
        try {
            const querySnapshot = await db.collection('pendingConfirmations')
                .where('opponent', '==', this.currentUser)
                .get();
            
            this.pendingConfirmations = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // Reconstruct matchData object from flattened data
                const pending = {
                    id: doc.id,
                    matchId: data.matchId,
                    reporter: data.reporter,
                    opponent: data.opponent,
                    timestamp: data.timestamp,
                    matchData: {
                        id: data.matchId,
                        playerA: data.playerA,
                        playerB: data.playerB,
                        winner: data.winner,
                        loser: data.loser,
                        kills: data.kills,
                        deaths: data.deaths,
                        map: data.map,
                        mode: data.mode,
                        reporter: data.reporter,
                        confirmed: false
                    }
                };
                
                this.pendingConfirmations.push(pending);
            });
            
            console.log(`✅ Loaded ${this.pendingConfirmations.length} pending confirmations for ${this.currentUser}`);
            
            if (this.pendingConfirmations.length > 0) {
                console.log('Pending confirmations:', this.pendingConfirmations);
            }
        } catch (error) {
            console.error('❌ Error loading pending confirmations:', error);
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
                mmr: 999,
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
            console.log('🔑 Fazendo login no Firebase Auth...');
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Autenticação bem-sucedida, UID:', userCredential.user.uid);
            
            // Load player data with retry
            let doc;
            let retries = 3;
            
            while (retries > 0) {
                try {
                    console.log(`📄 Carregando dados do jogador (tentativa ${4 - retries}/3)...`);
                    doc = await db.collection('players').doc(userCredential.user.uid).get({ source: 'server' });
                    break;
                } catch (docError) {
                    console.warn(`⚠️ Erro ao carregar documento:`, docError.message);
                    retries--;
                    if (retries === 0) throw docError;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                }
            }
            
            if (doc.exists) {
                const playerData = doc.data();
                this.currentUserId = userCredential.user.uid;
                this.currentUser = playerData.username;
                this.players[this.currentUser] = playerData;
                console.log('✅ Dados do jogador carregados:', this.currentUser);
                return true;
            } else {
                console.error('❌ Documento do jogador não existe');
                return false;
            }
        } catch (error) {
            console.error('❌ Login error:', error);
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
    async getPlayer(username, forceRefresh = false) {
        // Check local cache first (unless forcing refresh)
        if (!forceRefresh && this.players[username]) {
            console.log('📦 Getting player from cache:', username, 'userId:', this.players[username].userId);
            return this.players[username];
        }
        
        // Query Firestore
        try {
            const querySnapshot = await db.collection('players')
                .where('username', '==', username)
                .get();
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const playerData = doc.data();
                
                // Ensure userId is set (use document ID if not in data)
                if (!playerData.userId) {
                    playerData.userId = doc.id;
                    console.warn('⚠️ Player missing userId, using doc.id:', doc.id);
                }
                
                console.log('🔥 Getting player from Firebase:', username, 'userId:', playerData.userId);
                this.players[username] = playerData;
                return playerData;
            }
            
            console.warn('⚠️ Player not found in Firestore:', username);
        } catch (error) {
            console.error('❌ Error getting player:', error);
        }
        
        return null;
    },
    
    // Update player
    async updatePlayer(username, playerData) {
        if (!playerData) {
            console.error('❌ No player data provided for:', username);
            return false;
        }
        
        try {
            // Ensure we have userId (get from current player if needed)
            if (!playerData.userId) {
                const currentPlayer = await this.getPlayer(username, true); // Force refresh
                if (!currentPlayer || !currentPlayer.userId) {
                    console.error('❌ Cannot find userId for player:', username);
                    return false;
                }
                playerData.userId = currentPlayer.userId;
            }
            
            console.log('🔄 Updating player in Firebase:', username, 'userId:', playerData.userId, 'MMR:', playerData.mmr);
            
            // Update in Firebase (complete overwrite)
            await db.collection('players').doc(playerData.userId).set(playerData);
            
            // Force refresh cache - remove old data
            delete this.players[username];
            
            // Set new data in cache
            this.players[username] = playerData;
            
            console.log('✅ Player updated successfully:', username, 'New MMR:', playerData.mmr);
            return true;
        } catch (error) {
            console.error('❌ Error updating player:', error, error.stack);
            return false;
        }
    },
    
    // Add match
    async addMatch(matchData) {
        try {
            const match = {
                ...matchData,
                players: [matchData.playerA, matchData.playerB],
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
            // Flatten matchData to avoid nested object issues in Firestore
            const pending = {
                matchId: match.id,
                reporter: match.reporter,
                opponent: match.playerA === match.reporter ? match.playerB : match.playerA,
                timestamp: Date.now(),
                // Flatten match data
                playerA: match.playerA,
                playerB: match.playerB,
                winner: match.winner,
                loser: match.loser,
                kills: match.kills,
                deaths: match.deaths,
                map: match.map,
                mode: match.mode
            };
            
            console.log('Adding pending confirmation:', pending);
            
            const docRef = await db.collection('pendingConfirmations').add(pending);
            pending.id = docRef.id;
            
            // Add matchData object for local use
            pending.matchData = match;
            
            this.pendingConfirmations.push(pending);
            
            console.log('✅ Pending confirmation added:', docRef.id);
            
            return pending;
        } catch (error) {
            console.error('❌ Error adding pending confirmation:', error);
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
    
    // Reject match (remove from pending)
    async rejectMatch(matchId) {
        try {
            // Remove match from matches collection
            await db.collection('matches').doc(matchId).delete();
            
            // Remove from pending confirmations
            const querySnapshot = await db.collection('pendingConfirmations')
                .where('matchId', '==', matchId)
                .get();
            
            const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
            // Update local arrays
            this.pendingConfirmations = this.pendingConfirmations.filter(p => p.matchId !== matchId);
            this.matches = this.matches.filter(m => m.id !== matchId);
            
            return true;
        } catch (error) {
            console.error('Error rejecting match:', error);
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
    
    // Get all players
    async getAllPlayers() {
        try {
            const querySnapshot = await db.collection('players').get();
            const players = [];
            querySnapshot.forEach((doc) => {
                players.push(doc.data());
            });
            return players;
        } catch (error) {
            console.error('Error getting all players:', error);
            return [];
        }
    },
    
    // Get player matches (for history)
    async getPlayerMatches(username, limit = 20) {
        try {
            // Tenta via players[] (novo padrão)
            let query = db.collection('matches')
                .where('players', 'array-contains', username)
                .orderBy('timestamp', 'desc')
                .limit(limit);

            let matchesSnapshot = null;
            try {
                matchesSnapshot = await query.get();
            } catch (e) {
                console.warn('players[] query failed, falling back to OR query on playerA/playerB', e);
            }

            let matches = [];
            if (matchesSnapshot && !matchesSnapshot.empty) {
                matchesSnapshot.forEach((doc) => {
                    matches.push({ id: doc.id, ...doc.data() });
                });
            } else {
                // Fallback: buscar por playerA==username e playerB==username e unir
                const [aSnap, bSnap] = await Promise.all([
                    db.collection('matches')
                        .where('playerA', '==', username)
                        .orderBy('timestamp', 'desc')
                        .limit(limit)
                        .get(),
                    db.collection('matches')
                        .where('playerB', '==', username)
                        .orderBy('timestamp', 'desc')
                        .limit(limit)
                        .get()
                ]);

                const mapDoc = (doc) => ({ id: doc.id, ...doc.data() });
                matches = [...aSnap.docs.map(mapDoc), ...bSnap.docs.map(mapDoc)]
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, limit);
            }

            return matches;
        } catch (error) {
            console.error('Error getting player matches:', error);
            return [];
        }
    },

    // Append a match entry to a player's personal history and persist to Firestore
    async addMatchToHistory(username, entry) {
        try {
            // Ensure player is loaded
            let player = this.players[username];
            if (!player) {
                player = await this.getPlayer(username, true);
            }
            if (!player) {
                console.error('❌ Player not found for history append:', username);
                return false;
            }

            if (!player.matchHistory) player.matchHistory = [];

            const normalized = {
                result: entry.result,
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
            if (player.matchHistory.length > 100) {
                player.matchHistory = player.matchHistory.slice(-100);
            }

            // Persist full player document
            await this.updatePlayer(username, player);
            return true;
        } catch (error) {
            console.error('❌ Error adding match to history (Firebase):', error);
            return false;
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
