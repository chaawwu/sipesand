import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (sipesand-app)
const firebaseConfig = {
  apiKey: "AIzaSyBfmtSkPK9GXe2uqM7yoPItDKE7xopdPlE",
  authDomain: "sipesand-app.firebaseapp.com",
  projectId: "sipesand-app",
  storageBucket: "sipesand-app.firebasestorage.app",
  messagingSenderId: "541655774913",
  appId: "1:541655774913:web:35f43f89c23867131e0640"
};

// Initialize Firebase App safely (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default db;
