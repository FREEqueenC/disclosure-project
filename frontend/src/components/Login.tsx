import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import app from '../firebase';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const Login: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Helper to fetch the token for debugging or manual API testing
  const logToken = async () => {
    if (user) {
      const token = await user.getIdToken();
      console.log('Bearer Token:', token);
      alert('Token logged to console!');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm w-fit mb-4">
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
        )}
        <div>
          <p className="font-semibold text-gray-800">{user.displayName || user.email}</p>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={handleSignOut}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Sign Out
            </button>
            <button 
              onClick={logToken}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Log Token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-gray-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
