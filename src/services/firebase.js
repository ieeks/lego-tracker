import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Deine Firebase-Konfiguration aus der Firebase Console:
// Project Settings → General → Your apps → Firebase SDK snippet
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously so Firestore security rules (require auth) are satisfied.
// Returns a promise that resolves once authentication is ready.
export const authReady = new Promise((resolve, reject) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (user) {
      resolve(user);
    } else {
      signInAnonymously(auth)
        .then((cred) => resolve(cred.user))
        .catch((err) => {
          console.error("Firebase anonymous sign-in failed:", err.code, err.message);
          reject(err);
        });
    }
  });
});
