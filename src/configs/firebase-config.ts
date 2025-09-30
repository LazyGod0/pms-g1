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
const auth = getAuth(app);
const db = getFirestore(app);

// เช็คว่า Firebase เชื่อมต่อสำเร็จหรือไม่
console.log("Firebase initialized successfully");
console.log("Project ID:", firebaseConfig.projectId);

export {auth,db}