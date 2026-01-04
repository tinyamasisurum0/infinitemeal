import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNKDX2Y94QY9oeGVGLHzbIsNsP5m2uWwE",
  authDomain: "infinitemeal.firebaseapp.com",
  projectId: "infinitemeal",
  storageBucket: "infinitemeal.firebasestorage.app",
  messagingSenderId: "211141060570",
  appId: "1:211141060570:web:9a12ee66ed1d8fec6702e3",
  measurementId: "G-SHGWRMHSRD"
};

// Initialize Firebase (prevent multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

export default app;
