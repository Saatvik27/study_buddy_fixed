import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/firebaseconfig.js';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';

const FirebaseTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configStatus, setConfigStatus] = useState({});

  useEffect(() => {
    // Check Firebase configuration
    const checkConfig = () => {
      const config = {
        apiKey: import.meta.env.VITE_APP_APIKEY,
        authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
        projectId: import.meta.env.VITE_APP_PROJECTID,
        storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
        messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
        appId: import.meta.env.VITE_APP_APPID,
        measurementId: import.meta.env.VITE_APP_MEASUREMENTID
      };

      const status = {};
      Object.keys(config).forEach(key => {
        status[key] = config[key] ? 'OK' : 'MISSING';
      });

      setConfigStatus(status);
    };

    checkConfig();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('Auth state changed:', currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting Google Sign-In...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign-in successful:', result.user);
    } catch (error) {
      console.error('Sign-in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Sign-out successful');
    } catch (error) {
      console.error('Sign-out error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase Authentication Test</h1>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Configuration Status</h2>
        {Object.entries(configStatus).map(([key, status]) => (
          <div key={key} className="flex justify-between mb-1">
            <span className="font-mono">{key}:</span>
            <span className={status === 'OK' ? 'text-green-600' : 'text-red-600'}>
              {status}
            </span>
          </div>
        ))}
      </div>

      {/* Current User */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Current User</h2>
        {user ? (
          <div>
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <button 
              onClick={handleSignOut}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <p>No user signed in</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 rounded bg-red-50">
          <h2 className="text-lg font-semibold mb-3 text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Sign In Button */}
      {!user && (
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In with Google'}
        </button>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Debug Info</h2>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Auth Domain:</strong> {import.meta.env.VITE_APP_AUTHDOMAIN}</p>
        <p><strong>Project ID:</strong> {import.meta.env.VITE_APP_PROJECTID}</p>
      </div>
    </div>
  );
};

export default FirebaseTest;
