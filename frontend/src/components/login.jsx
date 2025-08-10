// frontend/src/components/Login.jsx

import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider} from '../firebase/firebaseconfig.js';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { UserContext } from '../contexts/usercontext.jsx';
import { AuthModeContext } from '../contexts/authmodecontext.jsx';

const Login = () => {
  // Consume AuthModeContext
  const { isSignUpMode, toggleAuthMode } = useContext(AuthModeContext);
  
  // Local state for mobile mode only - separate from desktop
  const [mobileIsSignUp, setMobileIsSignUp] = useState(false);

  // Add loading state for redirect
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  // Password visibility states
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // State for Sign In form
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signInErrors, setSignInErrors] = useState({});

  // State for Sign Up form
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [signUpErrors, setSignUpErrors] = useState({});

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Handle redirect result from Google Sign-In
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setIsProcessingRedirect(true);
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          setUser(user);
          console.log("Google Sign-In Successful:", user);
          alert("Signed In with Google Successfully!");
          navigate('/');
        }
      } catch (error) {
        console.error("Google Sign-In Redirect Error:", error);
        alert(`Google Sign-In Error: ${error.message}`);
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    handleRedirectResult();
  }, [navigate, setUser]);

  // Toggle between Sign In and Sign Up modes using context (for desktop)
  const handleToggleMode = () => {
    toggleAuthMode(); // Toggle mode via context
    // Reset form data and errors when toggling
    setSignInData({ email: '', password: '' });
    setSignInErrors({});
    setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
    setSignUpErrors({});
    // Reset password visibility
    setShowSignInPassword(false);
    setShowSignUpPassword(false);
    setShowSignUpConfirmPassword(false);
  };
  
  // Toggle for mobile view (separate from desktop context)
  const handleMobileToggle = () => {
    console.log("Mobile toggle clicked, current state:", mobileIsSignUp);
    setMobileIsSignUp(prev => !prev);
    // Reset form data and errors when toggling
    setSignInData({ email: '', password: '' });
    setSignInErrors({});
    setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
    setSignUpErrors({});
    // Reset password visibility
    setShowSignInPassword(false);
    setShowSignUpPassword(false);
    setShowSignUpConfirmPassword(false);
  };

  // Direct change handlers for input fields (simplifies event handling)
  const updateSignInEmail = (e) => {
    setSignInData({...signInData, email: e.target.value});
  };

  const updateSignInPassword = (e) => {
    setSignInData({...signInData, password: e.target.value});
  };

  const updateSignUpName = (e) => {
    setSignUpData({...signUpData, name: e.target.value});
  };

  const updateSignUpEmail = (e) => {
    setSignUpData({...signUpData, email: e.target.value});
  };

  const updateSignUpPassword = (e) => {
    setSignUpData({...signUpData, password: e.target.value});
  };

  const updateSignUpConfirmPassword = (e) => {
    setSignUpData({...signUpData, confirmPassword: e.target.value});
  };

  // Validation for Sign In form
  const validateSignIn = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signInData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(signInData.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!signInData.password) {
      errors.password = "Password is required.";
    } else if (signInData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setSignInErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation for Sign Up form
  const validateSignUp = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signUpData.name || !signUpData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!signUpData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(signUpData.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!signUpData.password) {
      errors.password = "Password is required.";
    } else if (signUpData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!signUpData.confirmPassword) {
      errors.confirmPassword = "Confirm your password.";
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler for Sign In form submission
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (validateSignIn()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
        setUser(userCredential.user);
        alert("Signed In Successfully!");
        navigate('/');
      } catch (error) {
        console.error("Sign In Error:", error);
        setSignInErrors({ general: error.message });
      }
    }
  };

  // Handler for Sign Up form submission
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (validateSignUp()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
        await updateProfile(userCredential.user, { displayName: signUpData.name });
        setUser({ ...userCredential.user, displayName: signUpData.name });
        const idToken = await userCredential.user.getIdToken();

        // Prepare user data
        const userData = {
          uid: userCredential.user.uid,
          email: signUpData.email,
          username: signUpData.name,
          createdAt: new Date().toISOString(),
        };

        alert("Account Created Successfully!");
        navigate('/');
      } catch (error) {
        console.error("Sign Up Error:", error);
        setSignUpErrors({ general: error.message });
      }
    }
  };

  // Handler for navigating to forgot password screen
  const handleForgotPassword = () => {
    navigate('/forgotpassword');
  };
  // Handler for Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google Sign-In...");
      setIsProcessingRedirect(true);
      
      // Use popup instead of redirect to avoid domain issues
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("Google Sign-In Successful:", user);
      setUser(user);
      alert("Signed In with Google Successfully!");
      navigate('/');
      
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(`Google Sign-In Error: ${error.message}`);
      setIsProcessingRedirect(false);
    }
  };

  // Google Icon SVG component
  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

  // Eye Icon components
  const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = ({ className }) => (
    <svg className={className} fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="m3 3 18 18"/>
      <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/>
      <path d="M9.363 5.365A9.466 9.466 0 0 1 12 5c7 0 10 7 10 7a13.46 13.46 0 0 1-1.67 2.62"/>
      <path d="M6.357 6.33A10.61 10.61 0 0 0 2 12s3 7 10 7a9.554 9.554 0 0 0 5.207-1.199"/>
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#f5f9ff] to-[#bbdefb] bg-no-repeat relative overflow-hidden px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#64b5f6]/10 rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#1e88e5]/10 rounded-full"></div>

      {/* Mobile Layout - Only visible on small screens */}
      <div className="md:hidden w-full max-w-md z-20">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#1e88e5] mb-4 text-center">
              {mobileIsSignUp ? "Create Account" : "Welcome Back"}
            </h2>
              <div className="flex justify-center w-full mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessingRedirect}
                className="flex items-center justify-center w-full max-w-[320px] px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingRedirect ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                    <span>Redirecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="ml-2">Continue with Google</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center my-4 w-full">
              <div className="flex-grow h-[1px] bg-gray-300"></div>
              <p className="mx-2 text-gray-500 text-sm">
                {mobileIsSignUp ? "or sign up with email" : "or sign in with email"}
              </p>
              <div className="flex-grow h-[1px] bg-gray-300"></div>
            </div>
            
            {/* Mobile sign in form */}
            {!mobileIsSignUp && (
              <form className="w-full" onSubmit={handleSignInSubmit}>
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="mobile-sign-in-email">
                    Email Address
                  </label>
                  <input
                    id="mobile-sign-in-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signInErrors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signInData.email}
                    onChange={updateSignInEmail}
                    autoComplete="email"
                    required
                  />
                  {signInErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{signInErrors.email}</p>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-gray-700 text-xs font-medium" htmlFor="mobile-sign-in-password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-[#1e88e5] hover:text-[#64b5f6] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="mobile-sign-in-password"
                      type={showSignInPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signInErrors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signInData.password}
                      onChange={updateSignInPassword}
                      autoComplete="current-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignInPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signInErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{signInErrors.password}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full p-2 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Sign In
                </button>
              </form>
            )}
            
            {/* Mobile sign up form */}
            {mobileIsSignUp && (
              <form className="w-full" onSubmit={handleSignUpSubmit}>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="mobile-sign-up-name">
                    Full Name
                  </label>
                  <input
                    id="mobile-sign-up-name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signUpErrors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signUpData.name}
                    onChange={updateSignUpName}
                    autoComplete="name"
                    required
                  />
                  {signUpErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.name}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="mobile-sign-up-email">
                    Email Address
                  </label>
                  <input
                    id="mobile-sign-up-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signUpErrors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signUpData.email}
                    onChange={updateSignUpEmail}
                    autoComplete="email"
                    required
                  />
                  {signUpErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.email}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="mobile-sign-up-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="mobile-sign-up-password"
                      type={showSignUpPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signUpErrors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signUpData.password}
                      onChange={updateSignUpPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignUpPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.password}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="mobile-sign-up-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="mobile-sign-up-confirm-password"
                      type={showSignUpConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signUpErrors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signUpData.confirmPassword}
                      onChange={updateSignUpConfirmPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignUpConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.confirmPassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full p-2 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Create Account
                </button>
              </form>
            )}
            
            {/* Mobile toggle section */}
            <div className="mt-6 pt-6 text-center border-t border-gray-200">
              <p className="text-gray-600 mb-2">
                {mobileIsSignUp ? "Already have an account?" : "New here?"}
              </p>
              <button
                type="button"
                onClick={handleMobileToggle}
                className="px-4 py-2 bg-[#1e88e5]/10 text-[#1e88e5] rounded-full font-medium transition-colors duration-300 hover:bg-[#1e88e5]/20"
              >
                {mobileIsSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Only visible on medium screens and up */}
      <div className="hidden md:block relative w-full max-w-[800px] h-auto md:h-[550px] bg-white shadow-2xl rounded-2xl overflow-hidden z-10">
        {/* Main container with fixed positioning */}
        <div className="relative w-full h-full">
          {/* Sign In Form - Always positioned at left side */}
          <div className={`absolute top-0 left-0 w-1/2 h-full transition-opacity duration-500 ${!isSignUpMode ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
            <div className="flex flex-col items-center justify-center h-full bg-white p-4 md:p-6">              <h2 className="text-2xl md:text-3xl font-bold text-[#1e88e5] mb-4 md:mb-6">Welcome Back</h2>
              
              <div className="flex justify-between space-x-4 w-[90%] max-w-[320px]">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isProcessingRedirect}
                  className="flex items-center justify-center w-full px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingRedirect ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="ml-2">Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center my-4 w-[90%] max-w-[320px]">
                <div className="flex-grow h-[1px] bg-gray-300"></div>
                <p className="mx-2 text-gray-500 text-xs md:text-sm">or sign in with email</p>
                <div className="flex-grow h-[1px] bg-gray-300"></div>
              </div>

              {signInErrors.general && (
                <div className="bg-red-50 text-red-500 p-2 rounded-lg mb-3 w-[90%] max-w-[320px]">
                  <p className="text-xs">{signInErrors.general}</p>
                </div>
              )}

              <form className="w-[90%] max-w-[320px]" onSubmit={handleSignInSubmit}>
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="sign-in-email">
                    Email Address
                  </label>
                  <input
                    id="sign-in-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signInErrors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signInData.email}
                    onChange={updateSignInEmail}
                    autoComplete="email"
                    required
                  />
                  {signInErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{signInErrors.email}</p>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-gray-700 text-xs font-medium" htmlFor="sign-in-password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-[#1e88e5] hover:text-[#64b5f6] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="sign-in-password"
                      type={showSignInPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signInErrors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signInData.password}
                      onChange={updateSignInPassword}
                      autoComplete="current-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignInPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signInErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{signInErrors.password}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full p-2 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>

          {/* Sign Up Form - Always positioned at right side */}
          <div className={`absolute top-0 right-0 w-1/2 h-full transition-opacity duration-500 ${isSignUpMode ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
            <div className="flex flex-col items-center justify-center h-full bg-white p-4 md:p-6">              <h2 className="text-2xl md:text-3xl font-bold text-[#1e88e5] mb-4 md:mb-6">Create Account</h2>
              
              <div className="flex justify-between space-x-4 w-[90%] max-w-[320px]">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isProcessingRedirect}
                  className="flex items-center justify-center w-full px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingRedirect ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="ml-2">Continue with Google</span>                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center my-4 w-[90%] max-w-[320px]">
                <div className="flex-grow h-[1px] bg-gray-300"></div>
                <p className="mx-2 text-gray-500 text-xs md:text-sm">or sign up with email</p>
                <div className="flex-grow h-[1px] bg-gray-300"></div>
              </div>

              {signUpErrors.general && (
                <div className="bg-red-50 text-red-500 p-2 rounded-lg mb-3 w-[90%] max-w-[320px]">
                  <p className="text-xs">{signUpErrors.general}</p>
                </div>
              )}

              <form className="w-[90%] max-w-[320px]" onSubmit={handleSignUpSubmit}>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="sign-up-name">
                    Full Name
                  </label>
                  <input
                    id="sign-up-name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signUpErrors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signUpData.name}
                    onChange={updateSignUpName}
                    autoComplete="name"
                    required
                  />
                  {signUpErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.name}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="sign-up-email">
                    Email Address
                  </label>
                  <input
                    id="sign-up-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className={`w-full p-2 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                      signUpErrors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                    }`}
                    value={signUpData.email}
                    onChange={updateSignUpEmail}
                    autoComplete="email"
                    required
                  />
                  {signUpErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.email}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="sign-up-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="sign-up-password"
                      type={showSignUpPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signUpErrors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signUpData.password}
                      onChange={updateSignUpPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignUpPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.password}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="sign-up-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="sign-up-confirm-password"
                      type={showSignUpConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      className={`w-full p-2 pr-10 text-sm border rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 ${
                        signUpErrors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
                      }`}
                      value={signUpData.confirmPassword}
                      onChange={updateSignUpConfirmPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSignUpConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{signUpErrors.confirmPassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full p-2 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Create Account
                </button>
              </form>
            </div>
          </div>

          {/* Overlay - Slides left/right based on mode */}
          <div 
            className="absolute top-0 w-1/2 h-full bg-gradient-to-br from-[#64b5f6] to-[#1e88e5] transition-all duration-700 ease-in-out z-30"
            style={{ left: isSignUpMode ? '0' : '50%' }}
          >
            <div className="h-full w-full flex items-center justify-center p-4 md:p-6 text-white">
              <div className="max-w-[240px] text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  {isSignUpMode ? "Already have an account?" : "New here?"}
                </h3>
                <p className="mb-4 md:mb-6 text-white/90 text-sm">
                  {isSignUpMode 
                    ? "Sign in to continue your learning journey."
                    : "Sign up and discover a new way to learn with AI."}
                </p>
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="px-4 py-2 bg-transparent border-2 border-white rounded-full hover:bg-white/10 transition-colors duration-300 font-medium text-white text-sm"
                >
                  {isSignUpMode ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;