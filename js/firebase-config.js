// BO2 RANKED - FIREBASE CONFIGURATION

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV95wdCM54M-xJn4hQanKw2unkfvAqxcs",
    authDomain: "bo2-ranked.firebaseapp.com",
    projectId: "bo2-ranked",
    storageBucket: "bo2-ranked.firebasestorage.app",
    messagingSenderId: "898358094429",
    appId: "1:898358094429:web:c3fc9088315630abb3fbb4"
};

// Wait for Firebase SDK to load
window.initFirebase = function() {
    try {
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        console.log('Firebase initialized successfully');
        
        // Export for use in other files
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDB = db;
        
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
};
