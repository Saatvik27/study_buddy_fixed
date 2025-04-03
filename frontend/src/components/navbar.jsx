import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/usercontext';
import { AuthModeContext } from '../contexts/authmodecontext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { setLogin } = useContext(AuthModeContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handler for "Get Started" button
  const handleGetStartedClick = () => {
    setLogin();
    navigate('/login');
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <header className="fixed top-0 w-full z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-5">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-600">
              StudyBuddy
            </Link>
            
            {/* Desktop Navigation Links - Only show when logged in */}
            {user && (
              <div className="hidden md:flex gap-8">
                <Link 
                  to="/flashcards"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Flashcards
                </Link>
                <Link 
                  to="/chatbot"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Chatbot
                </Link>
                <Link 
                  to="/questionnaire"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Quiz
                </Link>
                <Link 
                  to="/analyze"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Analyze
                </Link>
                <Link 
                  to="/profile"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Profile
                </Link>
              </div>
            )}
            
            {/* For non-authenticated users - Just show features, how-it-works */}
            {!user && (
              <div className="hidden md:flex gap-8">
                <a 
                  href="#features"
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works"
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  How It Works
                </a>
                <a 
                  href="#use-cases"
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Use Cases
                </a>
                <a 
                  href="#contact"
                  className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                >
                  Contact
                </a>
              </div>
            )}
            
            {/* CTA Button Area - Fixed width to prevent layout shift */}
            <div className="hidden md:block w-[140px]"> {/* Fixed width container */}
              {!user && (
                <button 
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-blue-400/40 shadow-lg hover:shadow-blue-600/60 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-blue-600 text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed top-0 left-0 w-full h-full bg-blue-50 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="container mx-auto px-5 py-20">
          <button 
            className="absolute top-5 right-5 text-blue-600 text-2xl"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center gap-5">
            {/* For logged in users - show app navigation */}
            {user ? (
              <>
                <Link 
                  to="/flashcards"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Flashcards
                </Link>
                <Link 
                  to="/chatbot"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Chatbot
                </Link>
                <Link 
                  to="/questionnaire"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Quiz
                </Link>
                <Link 
                  to="/analyze"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Analyze
                </Link>
                <Link 
                  to="/profile"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Profile
                </Link>
              </>
            ) : (
              // For non-logged in users - show landing page navigation
              <>
                <a 
                  href="#features"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  How It Works
                </a>
                <a 
                  href="#use-cases"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Use Cases
                </a>
                <a 
                  href="#contact"
                  onClick={handleLinkClick}
                  className="font-medium text-gray-800 text-lg"
                >
                  Contact
                </a>
                <button 
                  onClick={() => {
                    handleGetStartedClick();
                    handleLinkClick();
                  }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold mt-4 shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;