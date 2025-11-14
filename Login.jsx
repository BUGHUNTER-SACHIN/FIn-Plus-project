import React, { useState } from 'react';
import { signInAnonymouslyClient, signInWithCustomTokenClient, signInWithGoogleClient } from './firebaseClient';

const Login = ({ onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnonymous = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymouslyClient();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Anonymous sign-in failed', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogleClient();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Google sign-in failed', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSignIn = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please enter a token');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithCustomTokenClient(token);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Token sign-in failed', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sign in</h2>

        {error && <div className="mb-3 text-red-600 dark:text-red-300">{error}</div>}

        <div className="mb-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <form onSubmit={handleTokenSignIn} className="space-y-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Custom token (optional)</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste custom Firebase token"
            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 py-2 px-4 rounded bg-green-600 text-white hover:bg-green-700">
              Sign in with token
            </button>
            <button type="button" onClick={onClose} className="py-2 px-4 rounded bg-gray-300 dark:bg-gray-700">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
