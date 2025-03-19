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
    <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Status Message */}
          {status && (
            <p
              className={`text-center ${
                status.includes('sent') ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {status}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-4 text-center text-gray-400">
          Remembered your password?{' '}
          <Link
            to="/login"
            onClick={toggleAuthMode}
            className="text-blue-400 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;