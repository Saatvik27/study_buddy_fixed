import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/usercontext.jsx';
import { AuthModeContext } from '../contexts/authmodecontext.jsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { setLogin } = useContext(AuthModeContext);
  const navigate = useNavigate();
  const location = useLocation();
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

  // Handle navigation for non-registered users on pages other than home
  const handleAnchorClick = (e, section) => {
    e.preventDefault();
    
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: section } });
    } else {
      // If already on home page, just scroll to the section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    handleLinkClick();
  };

  // Check for scrollTo in location state when component mounts or updates
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        // Clear the state after scrolling
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location.state, navigate]);

  return (
    <>
      {/* Main Navbar */}
      <header className="fixed top-0 w-full z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fixed height container */}
          <div className="h-20 flex justify-between items-center"> {/* Fixed height container */}
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-600">
              StudyBuddy
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex">
              {/* For logged in users */}
              {user && (
                <div className="flex gap-12"> {/* Increased gap from 10 to 12 */}
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
              
              {/* For non-authenticated users */}
              {!user && (
                <div className="flex gap-12"> {/* Increased gap from 10 to 12 */}
                  <a 
                    href="#features"
                    onClick={(e) => handleAnchorClick(e, 'features')}
                    className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                  >
                    Features
                  </a>
                  <a 
                    href="#how-it-works"
                    onClick={(e) => handleAnchorClick(e, 'how-it-works')}
                    className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                  >
                    How It Works
                  </a>
                  <a 
                    href="#use-cases"
                    onClick={(e) => handleAnchorClick(e, 'use-cases')}
                    className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                  >
                    Use Cases
                  </a>
                  <a 
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, 'contact')}
                    className="font-medium text-gray-800 hover:text-blue-600 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
                  >
                    Contact
                  </a>
                </div>
              )}
            </div>
            
            {/* CTA Button Area - Fixed width to prevent layout shift */}
            <div className="hidden md:block w-[160px] h-10 flex items-center justify-end"> {/* Added fixed height */}
              {!user && (
                <button 
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-7 py-2.5 rounded-full font-semibold transition-all shadow-blue-400/40 shadow-lg hover:shadow-blue-600/60 hover:shadow-xl hover:-translate-y-0.5"
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
          </div>
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
          
          <div className="flex flex-col items-center gap-8"> {/* Increased gap from 7 to 8 */}
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
                  onClick={(e) => handleAnchorClick(e, 'features')}
                  className="font-medium text-gray-800 text-lg"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works"
                  onClick={(e) => handleAnchorClick(e, 'how-it-works')}
                  className="font-medium text-gray-800 text-lg"
                >
                  How It Works
                </a>
                <a 
                  href="#use-cases"
                  onClick={(e) => handleAnchorClick(e, 'use-cases')}
                  className="font-medium text-gray-800 text-lg"
                >
                  Use Cases
                </a>
                <a 
                  href="#contact"
                  onClick={(e) => handleAnchorClick(e, 'contact')}
                  className="font-medium text-gray-800 text-lg"
                >
                  Contact
                </a>
                <button 
                  onClick={() => {
                    handleGetStartedClick();
                    handleLinkClick();
                  }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-7 py-2.5 rounded-full font-semibold mt-4 shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-20"></div> {/* Matches the navbar height */}
    </>
  );
};

export default Navbar;