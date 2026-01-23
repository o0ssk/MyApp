import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB2NZBgLqXxa4w1GQrteILwgathXTxrfOk",
    authDomain: "halqati-quran-2026.firebaseapp.com",
    projectId: "halqati-quran-2026",
    storageBucket: "halqati-quran-2026.firebasestorage.app",
    messagingSenderId: "577940742168",
    appId: "1:577940742168:web:a3bbaf2278c992c8aba36d",
};

// Initialize Firebase (prevent re-initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);

// Connect to emulators in development (optional - uncomment to use)
// if (process.env.NODE_ENV === "development") {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

export default app;
