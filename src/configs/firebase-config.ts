// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCvjF74ZujZ4fiZkR-voOyphM6LZ3BPeuk",
    authDomain: "pms-se.firebaseapp.com",
    projectId: "pms-se",
    storageBucket: "pms-se.firebasestorage.app",
    messagingSenderId: "273012607709",
    appId: "1:273012607709:web:b27e4fdeff71eced05e934",
    measurementId: "G-B7PEP19N1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Only connect to emulators if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!(storage as any)._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    console.warn('Firebase emulators already connected or unavailable:', error);
  }
}

// เช็คว่า Firebase เชื่อมต่อสำเร็จหรือไม่
console.log("Firebase initialized successfully");
console.log("Project ID:", firebaseConfig.projectId);

export default app;
