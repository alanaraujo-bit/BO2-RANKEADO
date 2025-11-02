// BO2 RANKED - DATA MANAGEMENT WITH FIREBASE

let auth, db;
let firebaseReady = false;

// Wait for Firebase to be fully loaded
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max
        
        const checkFirebase = setInterval(() => {
            attempts++;
            console.log(`🔍 Waiting for Firebase... attempt ${attempts}/${maxAttempts}`, {
                firebaseAuth: typeof window.firebaseAuth,
                firebaseDB: typeof window.firebaseDB,
                firebase: typeof firebase
            });
            
            if (window.firebaseAuth && window.firebaseDB) {
                clearInterval(checkFirebase);
                auth = window.firebaseAuth;
                db = window.firebaseDB;
                firebaseReady = true;
                console.log('✅ Data layer connected to Firebase');
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                console.error('❌ Firebase initialization timeout');
                reject(new Error('Firebase initialization timeout'));
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
    _rt: { player: null, pending: null, matches: null, leaderboard: null },
    _lastMMR: {},
    _seqRef: null,
    
    // Initialize
    async init() {
        if (this.initialized) return;
        
        // Wait for Firebase to be ready
        await waitForFirebase();
        this._seqRef = () => db.collection('meta').doc('sequences');
        
        // Listen to auth state
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUserId = user.uid;
                await this.loadUserData();
                // Ensure legacy players receive a sequential number
                if (this.currentUser) {
                    await this.ensurePlayerNumber(this.currentUser);
                }
                await this.loadPendingConfirmations(); // Load pending confirmations
                // Start realtime listeners
                this.subscribeAllRealtime();
                if (window.updateUserDisplay) {
                    window.updateUserDisplay();
                }
                // Check if Plutonium name is set
                if (window.checkPlutoniumNameSetup) {
                    setTimeout(() => window.checkPlutoniumNameSetup(), 500);
                }
                console.log('✅ User logged in:', this.currentUser);
            } else {
                this.currentUserId = null;
                this.currentUser = null;
                this.pendingConfirmations = []; // Clear pending confirmations
                this.unsubscribeAllRealtime();
                console.log('User logged out');
            }
        });
        
        this.initialized = true;
        console.log('✅ RankedData initialized');
    },

    // Allocate next sequential player number using a Firestore transaction
    async allocateNextPlayerNumber() {
        if (!firebaseReady) await waitForFirebase();
        
        // Ensure _seqRef is initialized
        if (!this._seqRef) {
            this._seqRef = () => db.collection('meta').doc('sequences');
        }
        
        const ref = this._seqRef();
        try {
            // If players collection is empty (fresh start), reset sequence to 1
            let shouldReset = false;
            try {
                const anyPlayer = await db.collection('players').limit(1).get();
                shouldReset = anyPlayer.empty;
            } catch (_) {}

            const assigned = await db.runTransaction(async (tx) => {
                const snap = await tx.get(ref);
                let next = 1;
                if (shouldReset) {
                    // Reset/start sequence
                    tx.set(ref, { nextPlayerNumber: 2, createdAt: Date.now(), updatedAt: Date.now() }, { merge: true });
                    return 1;
                } else if (!snap.exists) {
                    // Initialize sequence
                    tx.set(ref, { nextPlayerNumber: 2, createdAt: Date.now(), updatedAt: Date.now() });
                    return 1;
                } else {
                    const data = snap.data() || {};
                    next = typeof data.nextPlayerNumber === 'number' ? data.nextPlayerNumber : 1;
                    tx.update(ref, { nextPlayerNumber: next + 1, updatedAt: Date.now() });
                    return next;
                }
            });
            return assigned;
        } catch (txErr) {
            console.warn('⚠️ Sequence transaction failed, falling back to max(playerNumber)+1:', txErr?.message || txErr);
            try {
                // Fallback: get the highest existing playerNumber and add 1
                const snap = await db.collection('players').orderBy('playerNumber', 'desc').limit(1).get();
                if (!snap.empty) {
                    const top = snap.docs[0].data();
                    const topNum = typeof top.playerNumber === 'number' ? top.playerNumber : 0;
                    return topNum + 1;
                }
                return 1;
            } catch (fallbackErr) {
                console.error('❌ Fallback allocation failed:', fallbackErr);
                return 0;
            }
        }
    },

    // Ensure a player has a sequential number; allocates and patches if missing
    async ensurePlayerNumber(username) {
        try {
            const player = await this.getPlayer(username, true);
            if (!player) return false;
            if (typeof player.playerNumber === 'number' && player.playerNumber > 0) return true;
            const num = await this.allocateNextPlayerNumber();
            const patch = { playerNumber: num, playerNumberStr: String(num).padStart(2, '0') };
            await this.updatePlayerPartial(username, patch);
            return true;
        } catch (e) {
            console.error('❌ ensurePlayerNumber failed:', e);
            return false;
        }
    },

    // Partial update for player (avoids full overwrite)
    async updatePlayerPartial(username, patch) {
        try {
            // Use currentUserId if available (faster and more reliable)
            if (this.currentUserId && this.currentUser === username) {
                console.log(`📝 Updating player ${username} (userId: ${this.currentUserId}) with:`, patch);
                await db.collection('players').doc(this.currentUserId).update(patch);
                
                // Update local cache
                if (this.players[username]) {
                    this.players[username] = { ...this.players[username], ...patch };
                }
                
                console.log('✅ Player updated successfully');
                return true;
            }
            
            // Fallback: query by username
            const current = await this.getPlayer(username, true);
            if (!current || !current.userId) {
                console.error('❌ Cannot patch player (missing userId):', username);
                return false;
            }
            
            console.log(`📝 Updating player ${username} (userId: ${current.userId}) with:`, patch);
            await db.collection('players').doc(current.userId).update(patch);
            this.players[username] = { ...current, ...patch };
            
            console.log('✅ Player updated successfully');
            return true;
        } catch (err) {
            console.error('❌ Error in updatePlayerPartial:', err);
            console.error('Error details:', err.message);
            return false;
        }
    },

    // Subscribe to all realtime feeds relevant to current user
    subscribeAllRealtime() {
        if (!this.currentUser) return;
        this.unsubscribeAllRealtime();
        this._rt.player = this.subscribeToPlayer(this.currentUser);
        this._rt.pending = this.subscribeToPendingConfirmations(this.currentUser);
        this._rt.matches = this.subscribeToMatchesForUser(this.currentUser);
        this._rt.leaderboard = this.subscribeToLeaderboard();
    },

    unsubscribeAllRealtime() {
        Object.keys(this._rt).forEach(k => {
            try { if (typeof this._rt[k] === 'function') this._rt[k](); } catch (_) {}
            this._rt[k] = null;
        });
    },

    // Realtime: listen to current player doc
    subscribeToPlayer(username) {
        let updateTimeout = null;
        
        const q = db.collection('players').where('username', '==', username).limit(1);
        const unsub = q.onSnapshot((snap) => {
            if (snap.empty) return;
            const data = snap.docs[0].data();
            const prev = this.players[username];
            this.players[username] = data;

            console.log('🔄 Player data updated in realtime:', username, {
                kills: data.kills,
                deaths: data.deaths,
                headshots: data.headshots,
                mmr: data.mmr
            });

            // Detect MMR changes for in-app notification
            const last = this._lastMMR[username];
            if (typeof data.mmr === 'number' && last !== undefined && data.mmr !== last) {
                const delta = data.mmr - last;
                if (window.UI && typeof UI.showNotification === 'function') {
                    UI.showNotification(`${delta >= 0 ? '+' : ''}${delta} MMR`, delta >= 0 ? 'success' : 'warning');
                }
            }
            this._lastMMR[username] = data.mmr;

            // Update UI in real-time with debounce
            if (window.UI && typeof UI.updateAllViews === 'function') {
                UI.updateAllViews();
            }
            
            // Update profile page if currently viewing it - BUT only if data actually changed
            // Use debounce to prevent flickering
            if (window.ProfileManager && typeof ProfileManager.renderProfile === 'function') {
                const profileSection = document.getElementById('profile');
                if (profileSection && profileSection.classList.contains('page-active')) {
                    // Check if important fields changed
                    const hasSignificantChange = !prev || 
                        prev.kills !== data.kills || 
                        prev.deaths !== data.deaths || 
                        prev.wins !== data.wins || 
                        prev.losses !== data.losses ||
                        prev.mmr !== data.mmr;
                    
                    if (hasSignificantChange) {
                        // Clear previous timeout to debounce
                        if (updateTimeout) clearTimeout(updateTimeout);
                        
                        // Wait 500ms before updating to avoid flickering
                        updateTimeout = setTimeout(() => {
                            console.log('🔄 Updating profile page in real-time (debounced)');
                            ProfileManager.renderProfile();
                        }, 500);
                    }
                }
            }
        });
        return unsub;
    },

    // Realtime: pending confirmations for current user
    subscribeToPendingConfirmations(username) {
        const q = db.collection('pendingConfirmations').where('opponent', '==', username);
        const unsub = q.onSnapshot((snap) => {
            const list = [];
            snap.forEach(doc => {
                const d = doc.data();
                list.push({
                    id: doc.id,
                    matchId: d.matchId,
                    reporter: d.reporter,
                    opponent: d.opponent,
                    timestamp: d.timestamp,
                    matchData: {
                        id: d.matchId,
                        playerA: d.playerA,
                        playerB: d.playerB,
                        winner: d.winner,
                        loser: d.loser,
                        kills: d.kills,
                        deaths: d.deaths,
                        map: d.map,
                        mode: d.mode,
                        reporter: d.reporter,
                        confirmed: false
                    }
                });
            });
            const wasEmpty = (this.pendingConfirmations || []).length === 0;
            const prevLen = (this.pendingConfirmations || []).length;
            const addedCount = (snap.docChanges ? snap.docChanges().filter(c => c.type === 'added').length : 0);
            const newCount = list.length - prevLen;
            this.pendingConfirmations = list;
            // Notify only when there are real additions or on first load from empty -> some
            if ((addedCount > 0 || (wasEmpty && list.length > 0)) && window.UI && typeof UI.showNotification === 'function') {
                const count = addedCount || list.length;
                UI.showNotification(`📥 ${count} nova(s) partida(s) pendente(s) para confirmar`, 'info');
            }
            if (window.UI && typeof UI.updatePendingMatches === 'function') {
                UI.updatePendingMatches();
            }
            // Keep notification bell/badge in sync on Home without requiring page refresh
            if (typeof window.updateNotifications === 'function') {
                window.updateNotifications();
            }
        });
        return unsub;
    },

    // Realtime: matches involving current user
    subscribeToMatchesForUser(username) {
        const q = db.collection('matches').where('players', 'array-contains', username);
        const unsub = q.onSnapshot((snap) => {
            const changes = snap.docChanges();
            changes.forEach(change => {
                const m = { id: change.doc.id, ...change.doc.data() };
                const idx = this.matches.findIndex(x => x.id === m.id);
                if (change.type === 'added') {
                    if (idx === -1) this.matches.push(m); else this.matches[idx] = m;
                    // Notify opponent that a new match was reported against them
                    const opponent = (m.playerA === username) ? m.playerB : (m.playerB === username ? m.playerA : null);
                    const isOpponent = opponent !== null; // user is part of this match
                    if (!m.confirmed && m.reporter && isOpponent && m.reporter !== username) {
                        if (window.UI && typeof UI.showNotification === 'function') {
                            UI.showNotification(`📄 Partida reportada por ${m.reporter} (vs ${opponent})`, 'info');
                        }
                        if (typeof window.updateNotifications === 'function') {
                            window.updateNotifications();
                        }
                    }
                } else if (change.type === 'modified') {
                    const prev = idx !== -1 ? this.matches[idx] : null;
                    if (idx === -1) this.matches.push(m); else this.matches[idx] = m;
                    if (prev && !prev.confirmed && m.confirmed) {
                        if (window.UI && typeof UI.showNotification === 'function') UI.showNotification('✅ Partida confirmada!', 'success');
                        if (typeof window.updateNotifications === 'function') {
                            window.updateNotifications();
                        }
                    }
                } else if (change.type === 'removed') {
                    if (idx !== -1) this.matches.splice(idx, 1);
                }
            });
            // Keep UI fresh
            if (window.UI && typeof UI.updateAllViews === 'function') {
                UI.updateAllViews();
            }
        });
        return unsub;
    },

    // Realtime: leaderboard updates (top 50)
    subscribeToLeaderboard() {
        const q = db.collection('players').orderBy('mmr', 'desc').limit(50);
        const unsub = q.onSnapshot(() => {
            if (window.UI && typeof UI.updateTopPlayers === 'function') {
                UI.updateTopPlayers();
            }
            if (window.UI && typeof UI.updatePodium === 'function') {
                UI.updatePodium();
            }
        });
        return unsub;
    },
    
    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUserId) return;
        
        try {
            console.log('🔍 Loading user data for userId:', this.currentUserId);
            const doc = await db.collection('players').doc(this.currentUserId).get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ User data loaded:', data);
                this.currentUser = data.username;
                this.players[data.username] = data;
                console.log('✅ currentUser set to:', this.currentUser);
                
                // Subscribe to real-time updates
                console.log('🔔 Subscribing to real-time updates for:', this.currentUser);
                this.subscribeAllRealtime();
            } else {
                console.warn('⚠️ No player document found for userId:', this.currentUserId);
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
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
    
    // Logout
    async logout() {
        await auth.signOut();
        this.currentUser = null;
        this.currentUserId = null;
        this.players = {};
    },
    
    // Get player
    async getPlayer(username, forceRefresh = false) {
        // Ensure Firebase is ready
        if (!firebaseReady || !db) {
            console.log('⏳ Firebase not ready yet, waiting...');
            await waitForFirebase();
        }
        
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
    
    // Get player match history from subcollection
    async getPlayerMatchHistory(username) {
        try {
            // First get the player to get their userId
            const player = await this.getPlayer(username);
            if (!player || !player.userId) {
                console.warn('⚠️ Cannot get match history - player not found:', username);
                return [];
            }
            
            // Query the matches subcollection
            const matchesSnapshot = await db.collection('players')
                .doc(player.userId)
                .collection('matches')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            const matches = [];
            matchesSnapshot.forEach((doc) => {
                matches.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📜 Loaded ${matches.length} matches for ${username}`);
            return matches;
            
        } catch (error) {
            console.error('❌ Error getting match history:', error);
            return [];
        }
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

    // Update match document (partial)
    async updateMatch(matchId, updates) {
        try {
            await db.collection('matches').doc(matchId).update(updates);
            // Update local cache copy if present
            const idx = this.matches.findIndex(m => m.id === matchId);
            if (idx !== -1) {
                this.matches[idx] = { ...this.matches[idx], ...updates };
            }
            return true;
        } catch (error) {
            console.error('Error updating match:', error);
            return false;
        }
    },
    
    // Get leaderboard
    async getLeaderboard(type = 'global') {
        try {
            // Ensure Firebase is ready
            if (!firebaseReady || !db) await waitForFirebase();
            
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

    // Find player by sequential id (number or string)
    async findPlayerBySequentialId(id) {
        try {
            const idNum = typeof id === 'number' ? id : parseInt(String(id).replace(/^#/, ''), 10);
            if (!idNum || isNaN(idNum)) return null;
            const q = await db.collection('players').where('playerNumber', '==', idNum).limit(1).get();
            if (q.empty) return null;
            const data = q.docs[0].data();
            // cache
            if (data && data.username) this.players[data.username] = data;
            return data;
        } catch (e) {
            console.error('findPlayerBySequentialId error:', e);
            return null;
        }
    },
    
    // Get player matches (for history)
    async getPlayerMatches(username, limit = 20) {
        try {
            // Tenta via players[] (novo padrão) - sem orderBy para evitar necessidade de índice composto
            let query = db.collection('matches')
                .where('players', 'array-contains', username)
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
                        .limit(limit)
                        .get(),
                    db.collection('matches')
                        .where('playerB', '==', username)
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
            // Ensure Firebase is ready
            if (!firebaseReady || !db) await waitForFirebase();
            
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
