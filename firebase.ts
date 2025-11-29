
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider
} from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKfFRG53GggBNgMyEuBGy-FJKFf4Eqni8",
  authDomain: "lumina-f7d88.firebaseapp.com",
  projectId: "lumina-f7d88",
  storageBucket: "lumina-f7d88.firebasestorage.app",
  messagingSenderId: "31263065340",
  appId: "1:31263065340:web:b7857a93cec5a70565c379",
  measurementId: "G-BRW8RLKY2X"
};

// Initialize Firebase
// Singleton pattern to prevent hot-reload errors in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with persistent cache settings directly (Modern Approach)
// This replaces the deprecated enableIndexedDbPersistence() call
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  ignoreUndefinedProperties: true
});

const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  db, 
  storage,
  googleProvider, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile 
};