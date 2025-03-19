import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import UploadComponent from "./UploadComponent";
import Navbar from "./navbar";
import NoDocumentsPrompt from "./nodocumentsprompt"; // Reusable prompt component

const Flashcards = () => {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFront, setIsFront] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Track whether user has existing uploads (vectors)
  const [hasVectors, setHasVectors] = useState(false);

  const navigate = useNavigate();

  // Listen for auth changes and redirect to login if not authenticated.
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

  // Flip card animation
  const handleFlip = () => {
    setIsFront((prev) => !prev);
  };

  // Show next flashcard
  const handleNext = () => {
    setIsFront(true);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  // Show previous flashcard
  const handlePrev = () => {
    setIsFront(true);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  // Called when the upload finishes successfully
  const handleUploadSuccess = () => {
    setIsUploading(false);
    setHasVectors(true);
  };

  // Toggle the upload panel
  const toggleUpload = () => {
    setIsUploading((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-10 px-4">
        {/* If user has NO vectors & not uploading, show the prompt */}
        {!hasVectors && !isUploading && (
          <NoDocumentsPrompt featureName="flashcard" onUploadClick={toggleUpload} />
        )}

        {/* If user is uploading */}
        {isUploading && (
          <div className="w-full max-w-lg bg-[#1C2541] p-8 rounded-lg shadow-lg mb-6">
            <button
              onClick={toggleUpload}
              className="mb-4 text-[#5BC0BE] hover:text-[#6FFFE9] flex items-center"
            >
              ← Back
            </button>
            <UploadComponent onUploadComplete={handleUploadSuccess} />
          </div>
        )}

        {/* If user DOES have vectors, show topic input & generation or flashcards */}
        {hasVectors && !isUploading && flashcards.length === 0 && (
          <div className="w-full max-w-md flex flex-col items-center space-y-4">
            {/* Explanation Paragraph */}
            <p className="text-center text-[#C2D8F2] max-w-md">
              We will generate flashcards by analyzing the documents you've previously uploaded. 
              Simply enter a topic below, and our system will create flashcards based on that 
              topic from your existing uploads.
            </p>

            {/* Topic Input */}
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic..."
              className="p-3 border border-[#3A506B] rounded w-full bg-[#0B132B] text-[#C2D8F2]"
            />

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleGenerateFlashcards}
                disabled={isLoading}
                className="bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] font-medium py-3 px-8 rounded-lg transition-colors"
              >
                {isLoading ? "Generating..." : "Generate Flashcards"}
              </button>
              <button
                onClick={toggleUpload}
                className="bg-[#6FFFE9] hover:bg-[#5BC0BE] text-[#0B132B] font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Upload New Document
              </button>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center text-red-500 mt-4 max-w-md">{error}</div>
        )}

        {/* If we have flashcards, show them */}
        {hasVectors && !isUploading && !isLoading && flashcards.length > 0 && (
          <div className="flex flex-col items-center w-full max-w-lg mt-6">
            {/* Flip Card Container */}
            <div
              className="flip-card w-full aspect-[3/2] rounded-xl shadow-lg cursor-pointer mb-6 overflow-hidden"
              onClick={handleFlip}
            >
              <div
                className="flip-card-inner w-full h-full"
                style={{
                  transform: isFront ? "rotateY(0deg)" : "rotateY(180deg)",
                }}
              >
                {/* Front Side */}
                <div className="flip-card-front w-full h-full relative flex items-center justify-center p-8 bg-[#1C2541]">
                  <div className="text-xl text-[#C2D8F2] text-center">
                    {flashcards[currentIndex].front}
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-[#C2D8F2]">
                    click to flip
                  </div>
                </div>
                {/* Back Side */}
                <div
                  className="flip-card-back w-full h-full flex items-center justify-center p-8 bg-[#1C2541] absolute top-0 left-0"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="text-xl text-[#C2D8F2] text-center">
                    {flashcards[currentIndex].back}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handlePrev}
                className="bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="text-[#C2D8F2] font-medium">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <button
                onClick={handleNext}
                className="bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Custom Styles for Flip Animation */}
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;
