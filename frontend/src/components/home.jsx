import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "./navbar.jsx";
import { UserContext } from "../contexts/usercontext";

const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the top */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex items-center justify-center">
        <div className="text-center px-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg">
            Enhance Your Learning with AI
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#C2D8F2] font-medium">
            Generate flashcards, chat with AI tutors, and test your knowledge with interactive quizzes.
          </p>
          {/* (Optional) If you want a direct CTA here */}
          {/* <Link
            to="/dashboard"
            className="inline-block bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] font-semibold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Continue Your Journey
          </Link> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="-mt-1 py-20 bg-gradient-to-b from-[#1C2541] to-[#3A506B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 drop-shadow-md">
            Our AI-Powered Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flashcard Generation */}
            <div className="bg-[#0B132B] p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="flex items-center mb-4">
                <span className="text-4xl text-[#6FFFE9]">📚</span>
                <h3 className="ml-3 text-xl font-semibold text-[#C2D8F2]">
                  Flashcard Generation
                </h3>
              </div>
              <p className="text-[#C2D8F2]">
                Instantly create personalized flashcards to reinforce your learning and memory.
              </p>
            </div>
            {/* AI Chatbot */}
            <div className="bg-[#0B132B] p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="flex items-center mb-4">
                <span className="text-4xl text-[#6FFFE9]">🤖</span>
                <h3 className="ml-3 text-xl font-semibold text-[#C2D8F2]">
                  AI Chatbot
                </h3>
              </div>
              <p className="text-[#C2D8F2]">
                Chat with our intelligent AI tutor for instant help, explanations, and guidance.
              </p>
            </div>
            {/* Self-Assessment Quizzes */}
            <div className="bg-[#0B132B] p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="flex items-center mb-4">
                <span className="text-4xl text-[#6FFFE9]">📝</span>
                <h3 className="ml-3 text-xl font-semibold text-[#C2D8F2]">
                  Self-Assessment Quizzes
                </h3>
              </div>
              <p className="text-[#C2D8F2]">
                Test your knowledge with interactive quizzes designed to help you learn and grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Explanation Section (Images Removed) */}
      <section className="py-16 bg-[#0B132B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#6FFFE9] mb-8 drop-shadow-md">
            Dive Deeper Into Our Tools
          </h2>

          {/* Chatbot Details */}
          <div className="mb-12 md:flex md:items-center md:space-x-6 text-white">
            <div className="md:w-full">
              <h3 className="text-2xl font-semibold text-[#C2D8F2] mb-4">
                1. AI Chatbot
              </h3>
              <p className="leading-relaxed text-[#C2D8F2]">
                Our AI Chatbot acts like your personal tutor, ready to answer your questions 
                around the clock. Ask for clarifications, request examples, or dive deeper 
                into tricky concepts. It's like having a study partner who never sleeps!
              </p>
            </div>
          </div>

          {/* Flashcard Details */}
          <div className="mb-12 md:flex md:items-center md:space-x-6 text-white">
            <div className="md:w-full">
              <h3 className="text-2xl font-semibold text-[#C2D8F2] mb-4">
                2. Flashcard Generation
              </h3>
              <p className="leading-relaxed text-[#C2D8F2]">
                Generate tailor-made flashcards from your uploaded documents or typed notes. 
                No more manual card creation—our AI picks out key terms and concepts, 
                helping you retain information faster and more effectively.
              </p>
            </div>
          </div>

          {/* Questionnaire Details */}
          <div className="md:flex md:items-center md:space-x-6 text-white">
            <div className="md:w-full">
              <h3 className="text-2xl font-semibold text-[#C2D8F2] mb-4">
                3. Questionnaire (Self-Assessment)
              </h3>
              <p className="leading-relaxed text-[#C2D8F2]">
                Test your knowledge with custom quizzes. Whether you’re prepping for an exam or 
                just checking your understanding, our questionnaire tool gives instant feedback 
                so you can target areas needing improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-[#3A506B] to-[#5BC0BE] text-white py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-md">
            Keep Learning with Our AI Tools
          </h2>
          <p className="mb-8">
            {user
              ? "You're already signed in—choose a tool to continue your learning journey!"
              : "Ready to dive in? Get started now and unlock your AI-powered learning experience!"
            }
          </p>

          {!user ? (
            /* If NOT logged in, show "Get Started" button linking to /login */
            <Link
              to="/login"
              className="inline-block bg-white text-[#0B132B] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-[#C2D8F2] transition-colors"
            >
              Get Started
            </Link>
          ) : (
            /* If logged in, show three buttons for Flashcards, Quiz, and Chatbot */
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to="/flashcards"
                className="bg-white text-[#0B132B] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-[#C2D8F2] transition-colors"
              >
                Flashcards
              </Link>
              <Link
                to="/questionnaire"
                className="bg-white text-[#0B132B] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-[#C2D8F2] transition-colors"
              >
                Quiz
              </Link>
              <Link
                to="/chatbot"
                className="bg-white text-[#0B132B] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-[#C2D8F2] transition-colors"
              >
                Chatbot
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C2541] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} MyWebsite. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
