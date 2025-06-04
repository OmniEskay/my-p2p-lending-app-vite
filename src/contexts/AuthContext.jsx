import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebaseConfig'; // Firebase auth instance
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider, // Added
  OAuthProvider,    // Added
  signInWithPopup   // Added
} from 'firebase/auth';
import { updateUserProfile, getUserProfile } from '../services/firestoreService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Helper function to create/update user profile in Firestore after any sign-in/sign-up
  const handleUserProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;
    let profile = await getUserProfile(firebaseUser.uid);
    if (!profile) {
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid, ". Creating one.");
      const newProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "New User", // Use provider's display name
        photoURL: firebaseUser.photoURL || null, // Store photo URL if available
        createdAt: new Date(),
        // You might want to set a default role or other initial fields here
      };
      await updateUserProfile(firebaseUser.uid, newProfileData);
      profile = newProfileData;
    }
    setUserData(profile);
    return profile;
  };

  async function signup(email, password, displayName) {
    if (!auth) throw new Error("Authentication service is not available.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName });
    await handleUserProfile(userCredential.user); // Use helper
    return userCredential;
  }

  function login(email, password) {
    if (!auth) throw new Error("Authentication service is not available.");
    return signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle profile fetching
  }

  async function signInWithGoogle() {
    if (!auth) throw new Error("Authentication service is not available.");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle profile fetching and setting currentUser/userData
      // await handleUserProfile(result.user); // This will be handled by onAuthStateChanged
      return result;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }

  async function signInWithApple() {
    if (!auth) throw new Error("Authentication service is not available.");
    const provider = new OAuthProvider('apple.com'); // Specify apple.com
    // You can add custom parameters if needed, e.g., for specific scopes
    // provider.addScope('email');
    // provider.addScope('name');
    try {
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle profile fetching and setting currentUser/userData
      // await handleUserProfile(result.user); // This will be handled by onAuthStateChanged
      return result;
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
      // Handle common errors like popup blocked or account exists with different credential
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Handle linking or prompt user
      }
      throw error;
    }
  }

  function logout() {
    if (!auth) return Promise.reject(new Error("Authentication service is not available."));
    setUserData(null); 
    return signOut(auth);
  }

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth is not initialized. Cannot set up onAuthStateChanged listener.");
      setLoadingAuth(false);
      setCurrentUser(null);
      setUserData(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await handleUserProfile(user); // Use helper to fetch/create profile
      } else {
        setUserData(null);
      }
      setLoadingAuth(false);
    });

    return unsubscribe; 
  }, []);

  const value = {
    currentUser,
    userData, 
    loadingAuth,
    signup,
    login,
    signInWithGoogle, // Expose new method
    signInWithApple,  // Expose new method
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
