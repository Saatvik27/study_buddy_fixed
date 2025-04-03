import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import UploadComponent from "./uploadcomponent.jsx";
import Navbar from "./navbar.jsx";
import NoDocumentsPrompt from "./nodocumentsprompt.jsx";

const Flashcards = () => {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFront, setIsFront] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasVectors, setHasVectors] = useState(false);

  const navigate = useNavigate();

  // Listen for auth changes and redirect to login if not authenticated
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Check if user has existing uploads for flashcards
  useEffect(() => {
    checkVectorsForFlashcards();
  }, []);

  const checkVectorsForFlashcards = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/check_vectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user.uid }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      setHasVectors(data.exists);
    } catch (err) {
      console.error("Error checking vectors for flashcards:", err);
    }
  };

  // Fetch/Generate flashcards based on topic
  const handleGenerateFlashcards = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/generate_flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, user_id: user.uid }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      const parsedFlashcards = Array.isArray(data.flashcards)
        ? data.flashcards
        : JSON.parse(data.flashcards);

      if (!parsedFlashcards || parsedFlashcards.length === 0) {
        throw new Error("No flashcards available for this topic.");
      }
      setFlashcards(parsedFlashcards);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFront((prev) => !prev);
  };

  const handleNext = () => {
    setIsFront(true);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFront(true);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleUploadSuccess = () => {
    setIsUploading(false);
    setHasVectors(true);
  };

  const toggleUpload = () => {
    setIsUploading((prev) => !prev);
  };

  // Reset current flashcard set
  const handleReset = () => {
    setFlashcards([]);
    setTopic("");
  };

  // Custom NoDocumentsPrompt wrapper to ensure consistent styling
  const renderNoVectorsPrompt = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">StudyBuddy Flashcards</h2>
      </div>
      <div className="p-8">
        <NoDocumentsPrompt
          featureName="flashcard"
          onUploadClick={toggleUpload}
          showHeader={false}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* If uploading */}
          {isUploading ? (
            <div className="w-full max-w-xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-4 px-6">
                  <button
                    onClick={toggleUpload}
                    className="flex items-center text-white hover:text-white/80 transition-colors font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Flashcards
                  </button>
                </div>
                <div className="p-6">
                  <UploadComponent onUploadComplete={handleUploadSuccess} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              {/* If user has NO vectors, show the prompt */}
              {!hasVectors && renderNoVectorsPrompt()}

              {/* If user DOES have vectors, show topic input & generation or flashcards */}
              {hasVectors && flashcards.length === 0 && (
                <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">StudyBuddy Flashcards</h2>
                    <p className="text-white/80 mt-2">Create interactive flashcards from your materials</p>
                  </div>
                  
                  <div className="p-8">
                    <div className="mb-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#bbdefb] flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-center max-w-md mx-auto">
                        Transform your study materials into interactive flashcards. Enter a specific topic from your uploaded documents,
                        and our AI will create personalized flashcards to enhance your learning experience.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                        Flashcard Topic
                      </label>
                      <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Photosynthesis, French Revolution, Machine Learning"
                        className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-[#64b5f6] focus:border-[#1e88e5] focus:outline-none transition-colors text-gray-700"
                      />
                      
                      {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                      )}
                    </div>
                    
                    <div className="mb-8 bg-[#e3f2fd] p-4 rounded-lg border-l-4 border-[#1e88e5]">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How it works:
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                        <li>Enter a specific topic from your uploaded materials</li>
                        <li>Our AI creates flashcards with questions and answers</li>
                        <li>Click on cards to flip between question and answer</li>
                        <li>Use the navigation buttons to move between cards</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleGenerateFlashcards} 
                        disabled={!topic || isLoading}
                        className={`py-3 px-6 rounded-lg ${
                          !topic || isLoading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#1e88e5] text-white hover:bg-[#1976d2] hover:shadow-md'
                        } font-medium transition-all flex-1 flex justify-center items-center`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          "Create Flashcards"
                        )}
                      </button>
                      <button 
                        onClick={toggleUpload}
                        className="py-3 px-6 rounded-lg border border-[#1e88e5] text-[#1e88e5] font-medium transition-all hover:bg-[#1e88e5]/5 flex-1"
                      >
                        Upload New Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* If we have flashcards, show them */}
              {hasVectors && !isLoading && flashcards.length > 0 && (
                <div className="w-full max-w-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Flashcards: {topic}</h2>
                      <p className="text-sm text-gray-500">Click on card to flip</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-[#1e88e5] hover:text-[#1976d2] font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      New Topic
                    </button>
                  </div>
                
                  {/* Card Progress Indicator */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Card {currentIndex + 1} of {flashcards.length}</span>
                    <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] h-2.5 rounded-full" 
                        style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                
                  {/* Card Container */}
                  <div
                    onClick={handleFlip}
                    className="flip-card relative w-full aspect-[7/5] rounded-xl cursor-pointer mb-6 perspective"
                  >
                    <div
                      className={`flip-card-inner absolute w-full h-full transition-transform duration-500 transform-style-3d ${
                        isFront ? "" : "flip-card-flipped"
                      }`}
                    >
                      {/* Front Side */}
                      <div className="flip-card-front absolute w-full h-full backface-hidden p-6 bg-white rounded-xl shadow-lg border-2 border-[#1e88e5] flex flex-col">
                        <div className="absolute top-3 left-3 bg-[#e3f2fd] text-[#1e88e5] text-xs font-medium px-2 py-1 rounded-md uppercase">
                          Question
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-800 text-center">
                            {flashcards[currentIndex].front}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                            <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                          </svg>
                          Tap to flip
                        </div>
                      </div>
                      
                      {/* Back Side */}
                      <div className="flip-card-back absolute w-full h-full backface-hidden p-6 bg-gradient-to-br from-[#bbdefb] to-white rounded-xl shadow-lg border-2 border-[#1e88e5] flex flex-col">
                        <div className="absolute top-3 left-3 bg-[#1e88e5] text-white text-xs font-medium px-2 py-1 rounded-md uppercase">
                          Answer
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-800 text-center">
                            {flashcards[currentIndex].back}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                            <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                          </svg>
                          Tap to flip
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="flex items-center py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      <button
                        onClick={handleFlip}
                        className="py-2 px-4 bg-[#e3f2fd] text-[#1e88e5] rounded-lg font-medium hover:bg-[#bbdefb] transition-colors"
                      >
                        Flip Card
                      </button>
                      <button
                        onClick={toggleUpload}
                        className="py-2 px-4 bg-white border border-[#1e88e5] text-[#1e88e5] rounded-lg font-medium hover:bg-[#e3f2fd]/50 transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                    <button
                      onClick={handleNext}
                      className="flex items-center py-2 px-4 bg-[#1e88e5] text-white rounded-lg font-medium hover:bg-[#1976d2] transition-colors shadow-sm"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS for the flip card effect */}
      <style jsx="true">{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .flip-card-flipped {
          transform: rotateY(180deg);
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;