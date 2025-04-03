import React, { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar.jsx";

const ComingSoon = () => {
  const navigate = useNavigate();

  // Listen for auth changes and redirect if the user is not logged in.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/"); // Redirect to Home if not authenticated.
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f9ff]">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-8 px-6 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Coming Soon
              </h1>
            </div>
            
            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Illustration */}
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 bg-[#e3f2fd] rounded-full animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full text-[#1976d2] p-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="w-full md:w-2/3 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                    We're Building Something Exciting!
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    Our team is working hard to bring you an amazing new feature that will enhance your learning experience. Stay tuned as we put the finishing touches on this exciting update!
                  </p>
                  
                  {/* Feature Highlights */}
                  <div className="bg-[#f5f9ff] border border-[#e3f2fd] rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">What to expect:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Improved learning algorithms</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Enhanced user interface</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e88e5] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">More personalized study tools</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Development Progress</p>
                      <p className="text-sm font-medium text-[#1e88e5]">75%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] h-2.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  {/* CTA */}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Note */}
          <div className="text-center mt-6 text-gray-500">
            <p>Have feedback or suggestions? <a href="#" className="text-[#1e88e5] hover:underline">Let us know</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;