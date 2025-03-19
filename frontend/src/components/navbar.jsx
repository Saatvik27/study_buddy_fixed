import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/usercontext';
import { AuthModeContext } from '../contexts/authmodecontext';
import { FaUserCircle } from 'react-icons/fa';
import LogoutButton from './logout';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setLogin } = useContext(AuthModeContext);
  const navigate = useNavigate();

  // Single handler for "Get Started" button
  const handleGetStartedClick = () => {
    // For example, set to login mode and go to /login
    setLogin();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div>
            <Link to="/" className="text-2xl font-bold">
              StudyBuddy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* If NOT logged in, show just "Get Started" */}
            {!user && (
              <button
                onClick={handleGetStartedClick}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
              >
                Get Started
              </button>
            )}

            {/* If logged in, show the rest of the navbar */}
            {user && (
              <>
                <Link
                  to="/flashcards"
                  className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Flashcards
                </Link>
                <Link
                  to="/chatbot"
                  className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Chatbot
                </Link>
                <Link
                  to="/questionnaire"
                  className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Quiz
                </Link>
                <Link
                  to="/analyze"
                  className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Analyze
                </Link>
                <Link
                  to="/profile"
                  className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FaUserCircle className="inline-block mr-1" />
                  Profile
                </Link>
                <LogoutButton />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400
                         hover:text-white hover:bg-gray-700 focus:outline-none transition"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* If NOT logged in, show only "Get Started" */}
            {!user && (
              <button
                onClick={handleGetStartedClick}
                className="block w-full text-left bg-blue-600 hover:bg-blue-700 px-3 py-2
                           rounded-md text-base font-medium text-white"
              >
                Get Started
              </button>
            )}

            {/* If logged in, show the rest of the links */}
            {user && (
              <>
                <Link
                  to="/flashcards"
                  className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Flashcards
                </Link>
                <Link
                  to="/chatbot"
                  className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Chatbot
                </Link>
                <Link
                  to="/questionnaire"
                  className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Quiz
                </Link>
                <Link
                  to="/analyze"
                  className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analyze
                </Link>
                <Link
                  to="/profile"
                  className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUserCircle className="inline-block mr-2" />
                  Profile
                </Link>
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
