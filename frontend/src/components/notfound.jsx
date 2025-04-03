// NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f9ff] px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[180px] font-black text-[#e3f2fd] select-none">
              404
            </div>
          </div>
          <div className="relative z-10 py-8 flex flex-col items-center">
            <div className="bg-white rounded-full p-5 shadow-lg mb-4">
              <svg
                className="w-20 h-20 text-[#1e88e5]"
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
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-transparent bg-clip-text">
              Page Not Found
            </h1>
          </div>
        </div>

        {/* Error Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/"
            className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Homepage
          </Link>
          <Link
            to="/contact"
            className="border border-[#1e88e5] text-[#1e88e5] px-8 py-3 rounded-lg hover:bg-[#e3f2fd] transition-all duration-300 font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Support
          </Link>
        </div>
      
        {/* Suggestions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Here's what you can try:</h2>
          <ul className="space-y-3 text-left text-gray-600">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Check the URL for typos or errors</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Go back to the previous page or our homepage</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Try searching for what you're looking for</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} StudyBuddy. All rights reserved.
      </div>
    </div>
  );
};

export default NotFound;