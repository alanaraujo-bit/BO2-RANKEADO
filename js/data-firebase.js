// BO2 RANKED - DATA MANAGEMENT WITH FIREBASE

// Wait for Firebase to initialize
let firebaseReady = false;
let auth, db;

// Initialize when Firebase is ready
setTimeout(() => {
    auth = window.firebaseAuth;
    db = window.firebaseDB;
    firebaseReady = true;
    console.log('Data layer connected to Firebase');
}, 1000);

const RankedData = {
    currentUser: null,
    currentUserId: null,
    players: {},
    matches: [],
    pendingConfirmations: [],
    currentSeason: 1,
    
    // Initialize
    async init() {
        if (!firebaseReady) {
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Listen to auth state
        window.FirebaseAuth.onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUserId = user.uid;
                this.currentUser = user.email || user.displayName;
                console.log('User logged in:', this.currentUser);
                await this.loadUserData();
            } else {
                this.currentUserId = null;
                this.currentUser = null;
                console.log('User logged out');
            }
        });
    },
    
    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUserId) return;
        
        const { doc, getDoc } = window.FirestoreDB;
        const userDoc = await getDoc(doc(db, 'players', this.currentUserId));
        
        if (userDoc.exists()) {
            this.players[this.currentUser] = userDoc.data();
        }
    },
    
    // Create new player
    async createPlayer(username, email, password) {
        try {
            const { createUserWithEmailAndPassword } = window.FirebaseAuth;
            const { doc, setDoc } = window.FirestoreDB;
            
            // Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
            
            await setDoc(doc(db, 'players', userId), playerData);
            
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
            const { signInWithEmailAndPassword } = window.FirebaseAuth;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Load player data
            const { doc, getDoc } = window.FirestoreDB;
            const playerDoc = await getDoc(doc(db, 'players', userCredential.user.uid));
            
            if (playerDoc.exists()) {
                const playerData = playerDoc.data();
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
        const { signOut } = window.FirebaseAuth;
        await signOut(auth);
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
        const { collection, query, where, getDocs } = window.FirestoreDB;
        const q = query(collection(db, 'players'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const playerData = querySnapshot.docs[0].data();
            this.players[username] = playerData;
            return playerData;
        }
        
        return null;
    },
    
    // Update player
    async updatePlayer(username, updates) {
        const player = await this.getPlayer(username);
        if (!player) return false;
        
        const { doc, updateDoc } = window.FirestoreDB;
        await updateDoc(doc(db, 'players', player.userId), updates);
        
        // Update local cache
        Object.assign(this.players[username], updates);
        return true;
    },
    
    // Add match
    async addMatch(matchData) {
        const { collection, addDoc } = window.FirestoreDB;
        
        const match = {
            ...matchData,
            timestamp: Date.now(),
            id: null,
            confirmed: false
        };
        
        const docRef = await addDoc(collection(db, 'matches'), match);
        match.id = docRef.id;
        
        this.matches.push(match);
        return match;
    },
    
    // Add pending confirmation
    async addPendingConfirmation(match) {
        const { collection, addDoc } = window.FirestoreDB;
        
        const pending = {
            matchId: match.id,
            reporter: match.reporter,
            opponent: match.playerA === match.reporter ? match.playerB : match.playerA,
            matchData: match,
            timestamp: Date.now()
        };
        
        const docRef = await addDoc(collection(db, 'pendingConfirmations'), pending);
        pending.id = docRef.id;
        
        this.pendingConfirmations.push(pending);
        return pending;
    },
    
    // Confirm match
    async confirmMatch(matchId) {
        const { doc, updateDoc, deleteDoc, collection, query, where, getDocs } = window.FirestoreDB;
        
        // Update match as confirmed
        await updateDoc(doc(db, 'matches', matchId), { confirmed: true });
        
        // Remove from pending
        const q = query(collection(db, 'pendingConfirmations'), where('matchId', '==', matchId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (document) => {
            await deleteDoc(doc(db, 'pendingConfirmations', document.id));
        });
        
        // Update local arrays
        this.pendingConfirmations = this.pendingConfirmations.filter(p => p.matchId !== matchId);
        const match = this.matches.find(m => m.id === matchId);
        if (match) match.confirmed = true;
    },
    
    // Get leaderboard
    async getLeaderboard(type = 'global') {
        const { collection, getDocs, orderBy, query } = window.FirestoreDB;
        
        const q = query(collection(db, 'players'), orderBy('mmr', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const leaderboard = [];
        querySnapshot.forEach((doc) => {
            leaderboard.push(doc.data());
        });
        
        return leaderboard;
    },
    
    // Get stats
    async getStats() {
        const { collection, getDocs } = window.FirestoreDB;
        
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        
        return {
            totalPlayers: playersSnapshot.size,
            totalMatches: matchesSnapshot.docs.filter(doc => doc.data().confirmed).length,
            activeSeason: this.currentSeason
        };
    }
};
