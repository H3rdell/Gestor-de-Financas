// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR8y5kS0wV4Yn0crOfPVuyBHY0Dihpt3U",
  authDomain: "gestor-financas-h3.firebaseapp.com",
  projectId: "gestor-financas-h3",
  storageBucket: "gestor-financas-h3.firebasestorage.app",
  messagingSenderId: "1033478455346",
  appId: "1:1033478455346:web:03e9f742567f1d821f3c2b"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
export { app };