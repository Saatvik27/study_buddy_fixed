// frontend/src/components/ForgotPassword.jsx

import React, { useState, useContext } from 'react';
import { AuthModeContext } from '../contexts/authmodecontext.jsx';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebaseconfig.js';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { toggleAuthMode } = useContext(AuthModeContext);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // To display success or error messages
  const [loading, setLoading] = useState(false); // To handle loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setStatus('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#f5f9ff] to-[#bbdefb] bg-no-repeat relative overflow-hidden px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#64b5f6]/10 rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#1e88e5]/10 rounded-full"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 z-10">
        <h2 className="text-2xl font-bold text-[#1e88e5] mb-6 text-center">
          Reset Your Password
        </h2>
        
        <p className="mb-6 text-gray-600 text-center text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-xs font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 transition-all focus:outline-none focus:ring-1 focus:ring-[#64b5f6]/50 focus:border-[#1e88e5]"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-center">
                {status}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 mt-2 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 pt-4 text-center border-t border-gray-200">
          <p className="text-gray-600 mb-2">
            Remembered your password?
          </p>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#1e88e5]/10 text-[#1e88e5] rounded-full font-medium transition-colors duration-300 hover:bg-[#1e88e5]/20 inline-block"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;