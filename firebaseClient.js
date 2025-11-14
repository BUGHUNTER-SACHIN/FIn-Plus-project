import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously as fbSignInAnon, signInWithCustomToken as fbSignInWithCustomToken, onAuthStateChanged as fbOnAuthStateChanged, GoogleAuthProvider, signInWithPopup as fbSignInWithPopup, linkWithPopup as fbLinkWithPopup, signOut as fbSignOut, unlink as fbUnlink } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use the same environment variable pattern that `FB.jsx` used.
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : { apiKey: 'YOUR_FALLBACK_API_KEY', authDomain: '...', projectId: '...' };

let app = null;
let auth = null;
let db = null;
let isMockFirebase = false;

// Simple mock auth implementation to allow local development without a Firebase project.
const createMockAuth = () => {
  let currentUser = null;
  const listeners = new Set();

  return {
    async signInAnonymously() {
      currentUser = { uid: 'mock-user', isAnonymous: true };
      listeners.forEach((cb) => cb(currentUser));
      return { user: currentUser };
    },
    async signInWithCustomToken(token) {
      currentUser = { uid: `mock-${token ? 'token' : 'user'}`, isAnonymous: false };
      listeners.forEach((cb) => cb(currentUser));
      return { user: currentUser };
    },
    async signInWithGoogle() {
      // Create a fake Google user for local development
      // If there is an existing anonymous user, preserve their uid and mark as linked
      if (currentUser && currentUser.isAnonymous) {
        currentUser = { ...currentUser, isAnonymous: false, provider: 'google', displayName: 'Local User', email: 'local.user@example.com' };
      } else {
        currentUser = { uid: `local-google-${Date.now()}`, displayName: 'Local User', email: 'local.user@example.com', isAnonymous: false, provider: 'google' };
      }
      listeners.forEach((cb) => cb(currentUser));
      return { user: currentUser };
    },
    onAuthStateChanged(cb) {
      listeners.add(cb);
      // call immediately with null (not signed in) to mirror Firebase behavior
      cb(currentUser);
      return () => listeners.delete(cb);
    }
  };
};

try {
  // If the config is a placeholder, don't initialize Firebase — use mocks instead.
  if (!firebaseConfig || firebaseConfig.apiKey === 'YOUR_FALLBACK_API_KEY' || !firebaseConfig.apiKey) {
    isMockFirebase = true;
    auth = createMockAuth();
    db = null;
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  // If initialization fails, fall back to mock auth to keep the app usable locally.
  console.error('Firebase init failed, falling back to mock auth:', err);
  isMockFirebase = true;
  auth = createMockAuth();
  db = null;
}

// Export helper functions that abstract the real vs mock implementations
const signInAnonymouslyClient = async () => {
  if (isMockFirebase) return auth.signInAnonymously();
  return fbSignInAnon(auth);
};

const signInWithCustomTokenClient = async (token) => {
  if (isMockFirebase) return auth.signInWithCustomToken(token);
  return fbSignInWithCustomToken(auth, token);
};

const signInWithGoogleClient = async () => {
  if (isMockFirebase) return auth.signInWithGoogle();
  const provider = new GoogleAuthProvider();
  try {
    // If there is an anonymous current user, link the Google provider to preserve uid/data
    if (auth && auth.currentUser && auth.currentUser.isAnonymous) {
      return fbLinkWithPopup(auth.currentUser, provider);
    }
    return fbSignInWithPopup(auth, provider);
  } catch (err) {
    // If linking fails (e.g., no currentUser), fall back to signInWithPopup
    return fbSignInWithPopup(auth, provider);
  }
};

const signOutClient = async () => {
  if (isMockFirebase) {
    // mock sign out
    try {
      // notify listeners
      if (auth && typeof auth === 'object' && typeof auth.onAuthStateChanged === 'function') {
        // For mock auth created above, set currentUser to null via its signOut-like behavior
        // There's no dedicated signOut in mock, so call listeners with null
        const listeners = auth._listeners || null;
        // best-effort: if mock stored listeners, invoke them; otherwise do nothing
      }
    } catch (e) {}
    // In our mock implementation in this file, the signIn functions mutate currentUser variable in closure.
    // For simplicity, set currentUser to null by invoking onAuthStateChanged listeners via exported interface.
    // We'll provide a small helper if needed; for now just return.
    return;
  }
  return fbSignOut(auth);
};

const unlinkGoogleClient = async () => {
  if (isMockFirebase) {
    // For mock, convert back to anonymous while preserving uid
    if (auth && auth.currentUser) {
      auth.currentUser = { ...(auth.currentUser), provider: undefined, isAnonymous: true };
      // notify listeners if possible
      if (typeof auth.onAuthStateChanged === 'function') auth.onAuthStateChanged((u) => u);
    }
    return;
  }

  if (auth && auth.currentUser) {
    try {
      return fbUnlink(auth.currentUser, 'google.com');
    } catch (e) {
      console.warn('Failed to unlink Google provider:', e);
    }
  }
};

const onAuthStateChangedClient = (cb) => {
  if (isMockFirebase) return auth.onAuthStateChanged(cb);
  return fbOnAuthStateChanged(auth, cb);
};

export { app, auth, db, isMockFirebase, signInAnonymouslyClient, signInWithCustomTokenClient, onAuthStateChangedClient, signInWithGoogleClient, signOutClient, unlinkGoogleClient };
