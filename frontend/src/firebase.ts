import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDBjn-FvIcejTVd23nyujwW4Ib1yn3vzp0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "disclosureproject1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "disclosureproject1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "disclosureproject1.firebasestorage.app",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1036882252851:web:bc2ee8090a4e97f0193f46",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
