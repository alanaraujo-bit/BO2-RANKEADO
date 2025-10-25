let cached = globalThis.__firebaseAdminCache;

export async function getFirestoreSafe() {
  if (cached && cached.db) return cached.db;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE env not set');
  }

  if (privateKey.includes('\\n')) privateKey = privateKey.replace(/\\n/g, '\n');

  const { default: admin } = await import('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
  }
  const db = admin.firestore();
  globalThis.__firebaseAdminCache = { db };
  return db;
}

export async function isFirebaseConfigured() {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
