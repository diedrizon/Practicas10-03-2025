import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDgufCBvFY513I2p05bf84pQiJ1frxKykE",
  authDomain: "practica10-03-2025.firebaseapp.com",
  projectId: "practica10-03-2025",
  storageBucket: "practica10-03-2025.firebasestorage.app",
  messagingSenderId: "787282413926",
  appId: "1:787282413926:web:b8d1c16876e107c144a0a7",
  measurementId: "G-4GEG202XYH"
};

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);

const db = getFirestore(appfirebase);


const auth = getAuth(appfirebase);

export {appfirebase, db, auth};
