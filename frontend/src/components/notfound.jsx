// NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black-200 via-gray-300 to-gray-400 px-4">
      {/* Illustration */}
      <svg
        className="w-24 h-24 text-gray-700 mb-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.95A4 4 0 0111.05 14H20m-8.95 0a4 4 0 00-2.878-3.95M4 4h16v16H4V4z"
        />
      </svg>

      {/* Error Code */}
      <h1 className="text-6xl font-extrabold text-gray-200 mb-4">404</h1>

      {/* Error Message */}
      <p className="text-xl text-gray-200 mb-8 text-center max-w-md">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>

      {/* Action Button */}
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
      >
        Go Back Home
      </Link>

      {/* Additional Links */}
      <div className="mt-6 space-x-4">
        <Link
          to="/contact"
          className="text-blue-600 hover:underline"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default NotFound;