// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc5V9TdmvN1xDQFc1L0JiHqVNekS-9-60",
  authDomain: "pms-g1.firebaseapp.com",
  projectId: "pms-g1",
  storageBucket: "pms-g1.firebasestorage.app",
  messagingSenderId: "329856854123",
  appId: "1:329856854123:web:6159a1118a250cc679692e",
  measurementId: "G-E4GJBZJY7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db}