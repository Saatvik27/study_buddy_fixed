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
      className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;