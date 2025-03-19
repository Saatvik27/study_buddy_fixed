// frontend/src/components/Login.jsx

import React, { useState, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider} from '../firebase/firebaseconfig.js'; // Ensure correct path
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { UserContext } from '../contexts/usercontext.jsx';
import { AuthModeContext } from '../contexts/authmodecontext.jsx'; // Import AuthModeContext
import axios from 'axios';

const Login = () => {
  // Consume AuthModeContext
  const { isSignUpMode, toggleAuthMode } = useContext(AuthModeContext);

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

  // Toggle between Sign In and Sign Up modes using context
  const handleToggleMode = () => {
    toggleAuthMode(); // Toggle mode via context
    // Reset form data and errors when toggling
    setSignInData({ email: '', password: '' });
    setSignInErrors({});
    setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
    setSignUpErrors({});
  };

  // Handler for Sign In input changes
  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for Sign Up input changes
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

    if (!signUpData.name.trim()) {
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

        // Send user data to backend (Uncomment and adjust the URL as needed)
        // await axios.post(
        //   'http://localhost:3000/storeUserData', // Replace with your backend URL
        //   userData,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${idToken}`,
        //     },
        //   }
        // );
        alert("Account Created Successfully!");
        navigate('/');
      } catch (error) {
        console.error("Sign Up Error:", error);
        setSignUpErrors({ general: error.message });
      }
    }
  };

  // Handler for Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);
      console.log("Google Sign-In Successful:", user);
      alert("Signed In with Google Successfully!");
      navigate('/');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(`Google Sign-In Error: ${error.message}`);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541]">
      <div className="relative w-full max-w-[800px] h-auto md:h-[600px] bg-[#1C2541] shadow-lg rounded-lg overflow-hidden">
        {/* Forms Container */}
        <div
          className={`absolute inset-0 flex w-[100%] h-full transition-transform duration-500`}
        >
          {/* Sign In Form */}
          <div className="w-1/2 flex flex-col items-center justify-center bg-[#0B132B] p-8">
            <h2 className="text-3xl font-bold text-[#C2D8F2] mb-4">Sign In</h2>
            <div className="flex justify-between space-x-4 w-full">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center w-full px-4 py-2 m-2 text-sm font-medium text-[#0B132B] border border-gray-300 rounded-lg bg-[#6FFFE9] hover:bg-[#5BC0BE] transition"
              >
                <img
                  src="/google-color-svgrepo-com.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Log in with Google
              </button>
            </div>

            {signInErrors.general && (
              <p className="text-red-500 text-sm mt-2">{signInErrors.general}</p>
            )}

            <form className="w-4/5 mt-4" onSubmit={handleSignInSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signInErrors.email ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signInData.email}
                  onChange={handleSignInChange}
                  required
                />
                {signInErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{signInErrors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signInErrors.password ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signInData.password}
                  onChange={handleSignInChange}
                  required
                />
                {signInErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{signInErrors.password}</p>
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <Link
                  to="/forgotpassword"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full p-3 bg-[#5BC0BE] text-[#0B132B] rounded-lg hover:bg-[#6FFFE9] transition"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Sign Up Form */}
          <div className="w-1/2 flex flex-col items-center justify-center bg-[#0B132B] p-8">
            <h2 className="text-3xl font-bold text-[#C2D8F2] mb-4">Create Account</h2>
            <div className="flex justify-between space-x-4 w-full">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center w-full px-4 py-2 m-2 text-sm font-medium text-[#0B132B] border border-gray-300 rounded-lg bg-[#6FFFE9] hover:bg-[#5BC0BE] transition"
              >
                <img
                  src="/google-color-svgrepo-com.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Sign up with Google
              </button>

            </div>

            {signUpErrors.general && (
              <p className="text-red-500 text-sm mt-2">{signUpErrors.general}</p>
            )}

            <form className="w-4/5 mt-4" onSubmit={handleSignUpSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signUpErrors.name ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  required
                />
                {signUpErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signUpErrors.email ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                />
                {signUpErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signUpErrors.password ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  required
                />
                {signUpErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.password}</p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full p-3 border rounded-lg bg-[#0B132B] text-[#C2D8F2] ${
                    signUpErrors.confirmPassword ? "border-red-500" : "border-gray-400"
                  }`}
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  required
                />
                {signUpErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full p-3 bg-[#5BC0BE] text-[#0B132B] rounded-lg hover:bg-[#6FFFE9] transition"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex pointer-events-none">
          {/* Overlay Left */}
          <div
            className={`w-1/2 bg-[#5BC0BE] text-[#0B132B] flex flex-col items-center justify-center p-8 transition-transform duration-500 ${
              isSignUpMode ? "translate-x-[100%]" : "translate-x-0"
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">
              {isSignUpMode ? "Welcome Back!" : "Hello, Friend!"}
            </h2>
            <p className="text-center mb-6">
              {isSignUpMode
                ? "To keep connected, please log in with your personal info"
                : "Enter your details and start your journey with us"}
            </p>
            <button
              onClick={handleToggleMode} // Use context's toggleAuthMode
              className="px-6 py-2 bg-black text-[#5BC0BE] rounded-lg hover:bg-gray-900 transition pointer-events-auto"
            >
              {isSignUpMode ? "Sign In" : "Sign Up"}
            </button>
          </div>

          {/* Overlay Right */}
          <div
            className={`w-1/2 bg-[#5BC0BE] text-[#0B132B] flex flex-col items-center justify-center p-8 transition-transform duration-500 ${
              isSignUpMode ? "translate-x-0" : "translate-x-[-100%]"
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">
              {isSignUpMode ? "Hello, Friend!" : "Welcome Back!"}
            </h2>
            <p className="text-center mb-6">
              {isSignUpMode
                ? "Enter your details and start your journey with us"
                : "To keep connected, please log in with your personal info"}
            </p>
            <button
              onClick={handleToggleMode} // Use context's toggleAuthMode
              className="px-6 py-2 bg-black text-[#5BC0BE] rounded-lg hover:bg-gray-900 transition pointer-events-auto"
            >
              {isSignUpMode ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
