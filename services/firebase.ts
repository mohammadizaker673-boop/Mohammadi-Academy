import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClyQzTqnJ3xXpJrNQKFRKai2RpkhAiVFU",
  authDomain: "mohammadi-academy.firebaseapp.com",
  projectId: "mohammadi-academy",
  storageBucket: "mohammadi-academy.appspot.com",
  messagingSenderId: "692070482535",
  appId: "1:692070482535:web:8562506b811435e9d54ac2",
  measurementId: "G-KWTJQGLED7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
