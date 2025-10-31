// BO2 RANKED - FIREBASE CONFIGURATION

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBI8FLuPn_Q6YZm1mUYW_YgBqdsH8aMCM",
    authDomain: "rankops-8d2ea.firebaseapp.com",
    projectId: "rankops-8d2ea",
    storageBucket: "rankops-8d2ea.firebasestorage.app",
    messagingSenderId: "489891182477",
    appId: "1:489891182477:web:7aad98542de6b060602fc4",
    measurementId: "G-QJZCYR3TPQ"
};

// Initialize Firebase immediately when script loads
(function() {
    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded!');
            return;
        }
        
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Disable offline persistence to avoid "client is offline" errors
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // Enable network (force online mode)
        db.enableNetwork().then(() => {
            console.log('🌐 Firestore network enabled');
        }).catch((error) => {
            console.warn('⚠️ Could not enable network:', error);
        });
        
        console.log('🔥 Firebase initialized successfully');
        
        // Export globally
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDB = db;
        window.firebaseReady = true;
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        window.firebaseReady = false;
    }
})();
