import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB25VaErJEsI3VLBeb52cpczKRmEWC4fEs",
  authDomain: "pak-earning-site.firebaseapp.com",
  projectId: "pak-earning-site",
  storageBucket: "pak-earning-site.firebasestorage.app",
  messagingSenderId: "830671389706",
  appId: "1:830671389706:web:16ab555ffdd85cff70cbf3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
