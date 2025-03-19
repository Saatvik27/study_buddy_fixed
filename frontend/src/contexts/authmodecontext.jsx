// frontend/src/contexts/AuthModeContext.jsx

import React, { createContext, useState } from 'react';

export const AuthModeContext = createContext();

export const AuthModeProvider = ({ children }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const toggleAuthMode = () => {
    setIsSignUpMode((prevMode) => !prevMode);
  };

  const setSignup = () => {
    setIsSignUpMode(false);
  }

  const setLogin = () =>{
    setIsSignUpMode(true);
  }

  return (
    <AuthModeContext.Provider value={{ isSignUpMode, toggleAuthMode, setSignup, setLogin }}>
      {children}
    </AuthModeContext.Provider>
  );
};