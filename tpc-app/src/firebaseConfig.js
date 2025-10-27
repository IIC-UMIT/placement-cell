// FirebaseConfig.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Import Firebase Storage


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (guard to avoid re-init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// New: warn at runtime if storageBucket likely not configured (helps diagnose CORS / wrong-bucket issues)
if (!firebaseConfig.storageBucket) {
  console.warn("⚠️ firebaseConfig.storageBucket is not set. Check your .env and REACT_APP_FIREBASE_STORAGE_BUCKET value.");
} else {
  // also log the bucket used so you can confirm it matches the bucket you applied CORS to
  console.info("Firebase storage bucket:", firebaseConfig.storageBucket);
}

// Remove top-level await (not allowed in module without async wrapper)
// Set persistence when user signs in instead (example shown below can be moved to your auth flow)
// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

export { db, storage, auth, database };
export default firebase;