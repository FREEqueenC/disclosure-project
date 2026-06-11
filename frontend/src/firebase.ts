import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJzfJZM3q62tCepu5lLzapD3oLLuoJAD4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "anw-aetheric-envoy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "anw-aetheric-envoy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "anw-aetheric-envoy.appspot.com",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
