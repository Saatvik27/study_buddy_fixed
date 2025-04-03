import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "./navbar.jsx";
import { UserContext } from "../contexts/usercontext";

// SVG icons as components
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
  </svg>
);

const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z" clipRule="evenodd" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const GraduationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
    <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
    <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const TeacherIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
  </svg>
);

// Social Icons
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4">
    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-4 h-4">
    <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/>
  </svg>
);

const Home = () => {
  const { user } = useContext(UserContext);
  
  // Refs for animated elements
  const featuresRef = useRef([]);
  const stepsRef = useRef([]);
  const useCasesRef = useRef([]);

  useEffect(() => {
    // Adding keyframes for animations
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .float {
        animation: float 6s ease-in-out infinite;
      }
      
      .float-slow {
        animation: float 8s ease-in-out infinite;
      }
      
      .fade-in {
        animation: fadeIn 1s ease-out;
      }
    `;
    document.head.appendChild(styleEl);

    // Function to check if element is in viewport
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) - 100 &&
        rect.bottom >= 0
      );
    };

    // Function to handle scroll animation
    const handleScroll = () => {
      // Animate feature cards
      featuresRef.current.forEach(element => {
        if (element && isInViewport(element)) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });

      // Animate step cards
      stepsRef.current.forEach(element => {
        if (element && isInViewport(element)) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });

      // Animate use case cards
      useCasesRef.current.forEach(element => {
        if (element && isInViewport(element)) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    };

    // Set initial state and trigger first check
    setTimeout(handleScroll, 100);

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f9ff] text-gray-800">
      {/* Navbar at the top */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div 
          className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#64b5f6]/10 z-0"
        ></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left z-0 fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] bg-clip-text text-transparent">
                Your AI Study Companion
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Upload your PDFs and let StudyBuddy transform them into interactive flashcards, quizzes, and a personal AI tutor that helps you master any subject.
              </p>
              {!user ? (
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-400/40 hover:shadow-blue-600/60 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Start Learning Smarter
                </Link>
              ) : null}
            </div>
            <div className="flex-1 relative z-0">
              <div className="relative">
                {/* These shapes should have a lower z-index */}
                <div 
                  className="absolute top-[-30px] left-[-30px] w-20 h-20 bg-[#bbdefb] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] float-slow z- -1"
                ></div>
                <div 
                  className="absolute bottom-[-20px] right-[-20px] w-16 h-16 bg-[#bbdefb] rounded-[63%_37%_54%_46%/55%_48%_52%_45%] float-slow z- -1"
                ></div>
                
                {/* The image should have a higher z-index */}
                <img 
                  src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Student studying with AI assistant" 
                  className="w-full rounded-xl shadow-2xl float relative z-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Smart Study Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BrainIcon />,
                title: "AI-Powered Flashcards",
                description: "Automatically generate smart flashcards from your study materials to boost retention and make learning more efficient."
              },
              {
                icon: <ChatIcon />,
                title: "PDF Chat Assistant",
                description: "Ask questions about your study materials and get instant, accurate answers from your personalized AI tutor."
              },
              {
                icon: <TaskIcon />,
                title: "Custom Quizzes",
                description: "Test your knowledge with automatically generated quizzes tailored to your study materials and learning goals."
              }
            ].map((feature, index) => (
              <div 
                key={`feature-${index}`}
                ref={el => featuresRef.current[index] = el}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.6s ease-out'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#64b5f6] to-[#1e88e5]"></div>
                <div className="w-16 h-16 bg-[#bbdefb] rounded-full flex items-center justify-center mb-6 text-[#1e88e5]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#f5f9ff]" id="how-it-works">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            How StudyBuddy Works
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                number: 1,
                icon: <UploadIcon />,
                title: "Upload Your PDFs",
                description: "Simply upload your lecture notes, textbooks, or study materials in PDF format."
              },
              {
                number: 2,
                icon: <MagicIcon />,
                title: "AI Processing",
                description: "Our advanced AI analyzes your content and organizes the information for optimal learning."
              },
              {
                number: 3,
                icon: <GraduationIcon />,
                title: "Study Smarter",
                description: "Use flashcards, take quizzes, or chat with your AI tutor to master the material."
              }
            ].map((step, index) => (
              <div 
                key={`step-${index}`}
                ref={el => stepsRef.current[index] = el}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full md:max-w-[300px] text-center relative"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.6s ease-out'
                }}
              >
                <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div className="w-[70px] h-[70px] bg-[#bbdefb] rounded-full flex items-center justify-center mx-auto mb-6 text-[#1e88e5]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white" id="use-cases">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Perfect For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <UserIcon />,
                title: "College Students",
                description: "Master complex subjects, prepare for exams, and improve retention across all your courses."
              },
              {
                icon: <TeacherIcon />,
                title: "High School Students",
                description: "Simplify difficult concepts, prepare for standardized tests, and build effective study habits."
              },
              {
                icon: <BriefcaseIcon />,
                title: "Lifelong Learners",
                description: "Quickly absorb information from books, articles, or professional development materials."
              }
            ].map((useCase, index) => (
              <div 
                key={`usecase-${index}`}
                ref={el => useCasesRef.current[index] = el}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.6s ease-out'
                }}
              >
                <div className="w-16 h-16 bg-[#bbdefb] rounded-full flex items-center justify-center mb-6 text-[#1e88e5]">
                  {useCase.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center bg-gradient-to-r from-[#64b5f6]/10 to-[#1e88e5]/10">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Study Sessions?</h2>
          <p className="text-lg text-gray-600 mb-10">
            {user
              ? "Continue your learning journey with our powerful study tools."
              : "Join thousands of users who are already learning smarter with StudyBuddy - completely free, no credit card required."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Get Started Now <span className="ml-1 inline-block bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">FREE</span>
                </Link>
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/flashcards"
                  className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Flashcards
                </Link>
                <Link
                  to="/questionnaire"
                  className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Quiz
                </Link>
                <Link
                  to="/chatbot"
                  className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Chatbot
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16" id="contact">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
    {/* Column 1 - Logo and Social Icons (spans 5 columns) */}
    <div className="md:col-span-5">
      <div className="text-2xl font-bold text-[#1e88e5] mb-4">
        StudyBuddy
      </div>
      <p className="mb-6">
        Helping everyone master any subject with AI-powered study tools that make learning more efficient and enjoyable.
      </p>
    </div>
    
    {/* Column 2 - Quick Links (spans 3 columns) */}
    <div className="md:col-span-3 md:col-start-7">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-[#1e88e5] transition-colors">Home</a></li>
        <li><a href="#features" className="hover:text-[#1e88e5] transition-colors">Features</a></li>
        <li><a href="#how-it-works" className="hover:text-[#1e88e5] transition-colors">How It Works</a></li>
        <li><a href="#use-cases" className="hover:text-[#1e88e5] transition-colors">Use Cases</a></li>
      </ul>
    </div>
    
    {/* Column 3 - Contact (spans 3 columns) */}
    <div className="md:col-span-3 md:col-start-10">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
  <ul className="space-y-3">
    <li className="flex items-center">
      <span className="mr-3 text-[#1e88e5]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </span> 
      hello@studybuddy.app
    </li>
    <li className="flex items-center">
      <span className="mr-3 text-[#1e88e5]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </span> 
      + 91 9999999999
    </li>
    <li className="mt-5 pt-3">
      <Link 
        to="/contact"
        className="inline-flex items-center px-4 py-2 rounded-lg border border-[#1e88e5] text-[#1e88e5] hover:bg-[#e3f2fd] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Quick Contact Form
      </Link>
    </li>
  </ul>
</div>
  </div>

          
          {/* Copyright */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <p>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;