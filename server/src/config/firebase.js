const admin = require('firebase-admin');
const env = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }),
      databaseURL: env.firebase.databaseUrl,
      storageBucket: env.firebase.storageBucket,
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Firebase initialization failed:', error.message);
    throw error;
  }
}

function getFirebaseApp() {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

function getAuth() {
  return getFirebaseApp().auth();
}

function getFirestore() {
  return getFirebaseApp().firestore();
}

function getStorage() {
  return getFirebaseApp().storage();
}

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  getAuth,
  getFirestore,
  getStorage,
};
