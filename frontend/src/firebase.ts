import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCJzfJZM3q62tCepu5lLzapD3oLLuoJAD4",
  authDomain: "anw-aetheric-envoy.firebaseapp.com",
  projectId: "anw-aetheric-envoy",
  storageBucket: "anw-aetheric-envoy.appspot.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
