// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDi-3GQrOnmgS1Po9UTrbcC-wK8cvdjnyw",
  authDomain: "ai-trip-planner-bdca1.firebaseapp.com",
  projectId: "ai-trip-planner-bdca1",
  storageBucket: "ai-trip-planner-bdca1.firebasestorage.app",
  messagingSenderId: "929104626909",
  appId: "1:929104626909:web:f1910c79bf4c23d4ea8734",
  measurementId: "G-TJDV5567XL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
