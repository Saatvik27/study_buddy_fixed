import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar.jsx';
import backendconfig from '../../backendconfig.js';
import NoDocumentsPrompt from './nodocumentsprompt.jsx';
import UploadComponent from './uploadcomponent.jsx';

const Flashcards = () => {
  const [hasVectors, setHasVectors] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Check if user has vectors
  useEffect(() => {
    checkVectors();
  }, []);

  const checkVectors = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`${backendconfig.apiBaseUrl}/check_vectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user.uid }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setHasVectors(data.exists);
    } catch (error) {
      console.error('Error checking vectors:', error);
    }
  };

  const generateFlashcards = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setLoading(true);
    setError(null);
    setFlashcards([]);
    setCurrentCardIndex(0);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const response = await fetch(`${backendconfig.apiBaseUrl}/generate_flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          user_id: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error('No flashcards were generated. Try a different topic.');
      }

      // Transform the data
      const formattedCards = data.flashcards.map(card => ({
        front: card.front,
        back: card.back
      }));

      setFlashcards(formattedCards);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError(err.message);
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploading(false);
    setHasVectors(true);
  };

  const toggleUpload = () => {
    setIsUploading(!isUploading);
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setFlipped(false);
    }
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNextCard();
    } else if (e.key === 'ArrowLeft') {
      handlePrevCard();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleFlip();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCardIndex, flipped, flashcards.length]);

  const handleShuffle = () => {
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setFlipped(false);
  };

  // Custom NoDocumentsPrompt wrapper to ensure consistent styling
  const renderNoVectorsPrompt = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-5 md:py-6 px-6 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">StudyBuddy Flashcards</h2>
      </div>
      <div className="p-5 md:p-8">
        <NoDocumentsPrompt
          featureName="flashcards"
          onUploadClick={toggleUpload}
          showHeader={false}
        />
      </div>
    </div>
  );

  const renderFlashcardGenerator = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-5 md:py-6 px-6 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">StudyBuddy Flashcards</h2>
        <p className="text-white/80 mt-2 text-sm md:text-base">Generate flashcards on any topic</p>
      </div>
      
      <div className="p-5 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-center mb-5 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#bbdefb] flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <p className="text-gray-600 text-center max-w-md mx-auto text-sm md:text-base">
            We'll create flashcards based on your uploaded documents.
            Enter a specific topic to focus your flashcards.
          </p>
        </div>

        <div className="mb-5 md:mb-6">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Flashcard Topic
          </label>
          <div className="flex">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Physics, Medieval History"
              className="px-3 md:px-4 py-2.5 md:py-3 flex-1 border border-gray-300 rounded-l-lg focus:ring-[#64b5f6] focus:border-[#1e88e5] focus:outline-none transition-colors text-gray-700 text-sm md:text-base"
              disabled={loading}
            />
            <button
              onClick={generateFlashcards}
              disabled={!topic.trim() || loading}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-r-lg transition-colors ${
                !topic.trim() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1e88e5] text-white hover:bg-[#1976d2]'
              } text-sm md:text-base font-medium`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Generate"
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <div className="mb-6 md:mb-8 bg-[#e3f2fd] p-3 md:p-4 rounded-lg border-l-4 border-[#1e88e5]">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm md:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use:
          </h3>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 pl-5 list-disc">
            <li>Enter a topic related to your uploaded documents</li>
            <li>Click on cards to flip them</li>
            <li>Use the arrow buttons or keyboard arrows to navigate</li>
            <li>Press spacebar to flip the current card</li>
          </ul>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={toggleUpload}
            className="py-2.5 md:py-3 px-4 md:px-6 rounded-lg border border-[#1e88e5] text-[#1e88e5] font-medium transition-all hover:bg-[#1e88e5]/5 text-sm md:text-base"
          >
            Upload New Document
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlashcards = () => (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-3 md:py-4 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg md:text-xl font-bold text-white mb-1 sm:mb-0">
            Flashcards: {topic}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs md:text-sm">
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>
            <button 
              onClick={handleShuffle}
              className="ml-2 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Shuffle cards"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6 mb-4 md:mb-6">
        {/* Card display */}
        <div 
          className="relative w-full h-52 sm:h-64 md:h-80 mx-auto mb-5 md:mb-6 perspective-1000 cursor-pointer" 
          onClick={toggleFlip}
        >
          <div 
            className={`absolute inset-0 rounded-lg shadow-md transition-transform duration-500 transform-style-3d ${
              flipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front of card */}
            <div 
              className="absolute inset-0 flex items-center justify-center p-6 md:p-8 bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] rounded-lg backface-hidden"
            >
              <div className="text-center max-w-full overflow-auto">
                <span className="absolute top-2 left-2 text-xs md:text-sm text-[#1e88e5] font-medium bg-white/60 px-2 py-1 rounded-full">
                  Front
                </span>
                <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-800 mb-2">
                  {flashcards[currentCardIndex]?.front}
                </h3>
                <p className="text-xs md:text-sm text-[#1e88e5] mt-4">Click to reveal answer</p>
              </div>
            </div>
            
            {/* Back of card */}
            <div 
              className="absolute inset-0 flex items-center justify-center p-6 md:p-8 bg-gradient-to-br from-[#e1f5fe] to-[#b3e5fc] rounded-lg backface-hidden rotate-y-180"
            >
              <div className="text-center max-w-full overflow-auto">
                <span className="absolute top-2 left-2 text-xs md:text-sm text-[#0288d1] font-medium bg-white/60 px-2 py-1 rounded-full">
                  Back
                </span>
                <p className="text-base md:text-lg text-gray-800 whitespace-pre-line">
                  {flashcards[currentCardIndex]?.back}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
          <button
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className={`p-2.5 md:p-3 rounded-full shadow-sm ${
              currentCardIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-[#1e88e5] text-[#1e88e5] hover:bg-[#e3f2fd] transition-colors'
            }`}
            title="Previous card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={toggleFlip}
            className="py-2 md:py-2.5 px-4 md:px-5 bg-white border border-[#1e88e5] text-[#1e88e5] rounded-lg hover:bg-[#e3f2fd] transition-colors shadow-sm text-sm md:text-base font-medium"
          >
            Flip Card
          </button>
          
          <button
            onClick={handleNextCard}
            disabled={currentCardIndex === flashcards.length - 1}
            className={`p-2.5 md:p-3 rounded-full shadow-sm ${
              currentCardIndex === flashcards.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-[#1e88e5] text-[#1e88e5] hover:bg-[#e3f2fd] transition-colors'
            }`}
            title="Next card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setFlashcards([]);
              setCurrentCardIndex(0);
              setFlipped(false);
              setTopic('');
            }}
            className="py-2 md:py-2.5 px-4 md:px-5 bg-[#1e88e5] text-white rounded-lg hover:bg-[#1976d2] transition-colors shadow-sm text-sm md:text-base font-medium"
          >
            New Topic
          </button>
          
          <button
            onClick={toggleUpload}
            className="py-2 md:py-2.5 px-4 md:px-5 bg-white border border-[#1e88e5] text-[#1e88e5] rounded-lg hover:bg-[#e3f2fd] transition-colors shadow-sm text-sm md:text-base font-medium"
          >
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderLoading = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-5 md:py-6 px-6 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white">Generating Flashcards</h2>
        <p className="text-white/80 mt-2 text-sm md:text-base">Topic: {topic}</p>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col items-center justify-center">
        <div className="flex justify-center mb-5 md:mb-6">
          <svg className="animate-spin h-10 w-10 md:h-12 md:w-12 text-[#1e88e5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600 text-center mb-2 text-sm md:text-base">Creating flashcards for you...</p>
        <p className="text-xs md:text-sm text-gray-500 text-center">This might take a moment</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
      <Navbar />
      
      {/* Content area */}
      <div className="flex-1 flex items-center justify-center py-5 md:py-8 px-3 md:px-4">
        <div className="w-full max-w-4xl mx-auto">
          {isUploading ? (
            <div className="w-full max-w-xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-3 md:py-4 px-4 md:px-6">
                  <button
                    onClick={toggleUpload}
                    className="flex items-center text-white hover:text-white/80 transition-colors font-medium text-sm md:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Flashcards
                  </button>
                </div>
                <div className="p-4 md:p-6">
                  <UploadComponent onUploadComplete={handleUploadSuccess} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              {!hasVectors ? (
                renderNoVectorsPrompt()
              ) : flashcards.length > 0 ? (
                renderFlashcards()
              ) : loading ? (
                renderLoading()
              ) : (
                renderFlashcardGenerator()
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for card flipping */}
      <style jsx="true">{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;