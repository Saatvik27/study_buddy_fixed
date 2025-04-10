import React from 'react';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
  // Team member data
  const team = [
    {
      name: "Lakshya",
      github: "https://github.com/tani118",
      linkedin: "https://www.linkedin.com/in/lakshyabhutani/",
      twitter: ""
    },
    {
      name: "Saatvik",
      github: "https://github.com/Saatvik27",
      linkedin: "https://www.linkedin.com/in/saatvik-mittra/",
      twitter: ""
    }
  ];

  return (
    <footer className="py-10 sm:py-12 border-t border-gray-200 bg-white relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-8">
          {/* Logo & About Column */}
          <div className="md:col-span-3">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] flex items-center justify-center mr-3 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl text-[#1e88e5] font-bold">StudyBuddy</span>
            </div>
            <p className="text-gray-600 mb-6">
              Helping students master any subject with AI-powered study tools that make learning more efficient and enjoyable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 rounded-full bg-[#e3f2fd] flex items-center justify-center text-[#1e88e5] hover:bg-[#1e88e5] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#e3f2fd] flex items-center justify-center text-[#1e88e5] hover:bg-[#1e88e5] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4">
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#e3f2fd] flex items-center justify-center text-[#1e88e5] hover:bg-[#1e88e5] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column - Shifted by 1 column for extra spacing */}
          <div className="md:col-span-2 md:col-start-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#1e88e5] transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/flashcards" className="text-gray-600 hover:text-[#1e88e5] transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full mr-2"></span>
                  Flashcards
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="text-gray-600 hover:text-[#1e88e5] transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full mr-2"></span>
                  Quizzes
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-gray-600 hover:text-[#1e88e5] transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full mr-2"></span>
                  Chat Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column - Adjusted start position to maintain spacing */}
          <div className="md:col-span-2 md:col-start-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="mr-3 text-[#1e88e5]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-gray-600">hello@studybuddy.app</span>
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-[#1e88e5]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="text-gray-600">+91 9999999999</span>
              </li>
              <li className="mt-4">
                <Link 
                  to="/contact"
                  className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-[#1e88e5] text-[#1e88e5] hover:bg-[#e3f2fd] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Links - Adjusted start position to maintain spacing */}
          <div className="md:col-span-2 md:col-start-11">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Our Team</h3>
            <div className="space-y-4">
              {team.map((member, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center mb-2">
                    <span className="w-1.5 h-1.5 bg-[#1e88e5] rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1e88e5] transition-colors">
                      <span className="sr-only">GitHub</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 0C5.372 0 0 5.372 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.332-1.756-1.332-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.237-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.511 11.511 0 0 1 12 5.803c1.02.005 2.046.138 3.007.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.177.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.824 1.102.824 2.222v3.293c0 .319.219.694.825.577C20.565 21.795 24 17.298 24 12c0-6.628-5.373-12-12-12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1e88e5] transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;