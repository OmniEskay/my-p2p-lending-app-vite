// src/config/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";       // Core Firebase app
import { getAuth } from "firebase/auth";           // Firebase Authentication
import { getFirestore } from "firebase/firestore";     // Cloud Firestore
// import { getAnalytics } from "firebase/analytics"; // Optional: if you use Firebase Analytics

// Your web app's Firebase configuration
// These should be in a .env.local file (or .env) in your project root for security.
// Example: VITE_FIREBASE_API_KEY="YOUR_API_KEY"
const firebaseCredentials = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional for Analytics
};

// Initialize Firebase and export the instances
let app;
let auth;
let db;
// let analytics; // Optional for Firebase Analytics

try {
  // Initialize Firebase App
  app = initializeApp(firebaseCredentials);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);

  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  // Initialize Analytics and get a reference to the service (optional)
  // if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) { // Check if measurementId is provided
  //   analytics = getAnalytics(app);
  // }

  console.log("Firebase initialized successfully."); // For debugging purposes
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle initialization error appropriately in your application
  // For example, you might want to display a message to the user or disable Firebase-dependent features.
  // Re-throw the error or set a global error state if necessary.
}

export { app, auth, db /*, analytics */ };
