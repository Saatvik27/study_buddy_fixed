// frontend/src/LogoutButton.jsx

import React, { useContext } from 'react';
import { UserContext } from '../contexts/usercontext';
import { auth } from '../firebase/firebaseconfig';

const LogoutButton = () => {
  const { setUser } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-white text-red-600 border border-red-500 hover:bg-red-50 py-2.5 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  );
};

export default LogoutButton;