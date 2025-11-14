// Simple local auth + storage mock to avoid Firebase entirely.
let currentUser = null;
const listeners = new Set();

const signInAnonymouslyClient = async () => {
  currentUser = { uid: `local-${Date.now()}` };
  listeners.forEach((cb) => { try { cb(currentUser); } catch(e){} });
  return { user: currentUser };
};

const signInWithCustomTokenClient = async (token) => {
  currentUser = { uid: token ? `local-token-${Date.now()}` : `local-${Date.now()}` };
  listeners.forEach((cb) => { try { cb(currentUser); } catch(e){} });
  return { user: currentUser };
};

const onAuthStateChangedClient = (cb) => {
  listeners.add(cb);
  try { cb(currentUser); } catch(e){}
  return () => listeners.delete(cb);
};

// Exports compatible with what the app expects
const isMockFirebase = true;
const db = null;

export { signInAnonymouslyClient, signInWithCustomTokenClient, onAuthStateChangedClient, isMockFirebase, db };
