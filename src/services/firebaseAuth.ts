import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

const cleanEnv = (v?: string, fallback = '') => {
  if (!v || v === 'undefined' || v === 'null') return fallback;
  const cleaned = v.replace(/^["']|["']$/g, '').trim();
  return cleaned || fallback;
};

// Default to the project's Firebase client configuration (tourism-44c65)
const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY, 'AIzaSyCkMwfLrZxtOv7WKK2o_EaX0q74iVOuVLA'),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 'tourism-44c65.firebaseapp.com'),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'tourism-44c65'),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 'tourism-44c65.firebasestorage.app'),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, '772235064607'),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID, '1:772235064607:web:569a25c11e6e6d8bb16c2a'),
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, 'G-GGFBZN761F')
};

// Initialize Firebase App
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (err) {
  console.warn('[Firebase] Initialization error:', err);
}

export const firebaseApp = app;
export const firebaseAuth = auth;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Triggers official Google OAuth popup using Firebase Auth
 */
export async function signInWithGooglePopup(): Promise<{
  email: string;
  name: string;
  avatar: string;
}> {
  const activeAuth = firebaseAuth || (app ? getAuth(app) : null);
  if (!activeAuth) {
    throw new Error('Google Sign-In service could not be initialized.');
  }

  try {
    const result = await signInWithPopup(activeAuth, googleProvider);
    const user = result.user;
    return {
      email: user.email || 'traveler@gmail.com',
      name: user.displayName || 'Google Traveler',
      avatar: user.photoURL || ''
    };
  } catch (error: any) {
    console.warn('[Firebase Google Sign-In] Popup issue or domain config:', error?.code, error?.message);
    throw error;
  }
}


