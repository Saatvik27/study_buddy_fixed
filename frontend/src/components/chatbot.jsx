import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import UploadComponent from "./UploadComponent";
import Navbar from "./navbar";
import NoDocumentsPrompt from "./nodocumentsprompt"; // Reusable prompt component

/**
 * Color Palette:
 * #0B132B (dark navy)
 * #1C2541 (navy)
 * #3A506B (blue-gray)
 * #5BC0BE (teal)
 * #6FFFE9 (aqua)
 * #C2D8F2 (light bluish text)
 */

const ChatWithUpload = () => {
  const [hasVectors, setHasVectors] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Listen for auth changes and redirect to "/login" if not authenticated.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Check for existing document vectors on component mount.
  useEffect(() => {
    checkVectors();
  }, []);

  // Scroll to the bottom of the chat whenever messages change.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkVectors = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return; // onAuthStateChanged will handle redirect

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

      if (data.exists) {
        setMessages([
          {
            text: "Welcome back! I'm ready to help you with your study materials. What would you like to know?",
            sender: "bot",
          },
        ]);
      }
    } catch (error) {
      console.error("Error checking vectors:", error);
    }
  };

  // Handle successful document upload
  const handleUploadSuccess = () => {
    setIsUploading(false);
    setHasVectors(true);
    setMessages([
      {
        text: "Your document has been uploaded and processed! I'm ready to answer your questions about it.",
        sender: "bot",
      },
    ]);
  };

  // Toggle the upload panel
  const toggleUpload = () => {
    setIsUploading((prev) => !prev);
  };

  // Send a message to the chatbot
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { text: "Error: You must be logged in to send messages.", sender: "bot" },
      ]);
      return;
    }

    const messageText = input;
    setInput("");
    setMessages((prev) => [...prev, { text: messageText, sender: "user" }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, user_id: user.uid }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.output, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error: Could not get response from server.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Enter" key for sending messages
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-start pt-10 px-4">

        {/* If no vectors & not uploading, show prompt via reusable component */}
        {!hasVectors && !isUploading && (
          <NoDocumentsPrompt featureName="chatbot" onUploadClick={toggleUpload} />
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

        {/* Chat UI */}
        {hasVectors && !isUploading && (
          <div className="flex flex-col w-full h-full bg-[#1C2541] rounded-lg shadow p-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2 h-[calc(100vh-260px)]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.sender === "user" ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-[#5BC0BE] text-[#0B132B] rounded-br-none"
                        : "bg-[#3A506B] text-[#C2D8F2] rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading indicator (typing...) */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-[#3A506B] text-[#C2D8F2] p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#6FFFE9] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#6FFFE9] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-[#6FFFE9] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[#3A506B] pt-4">
              <div className="flex items-center space-x-2">
                <textarea
                  className="flex-1 bg-[#0B132B] text-[#C2D8F2] border border-[#3A506B] rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5BC0BE] resize-none"
                  rows="2"
                  placeholder="Ask a question about your study material..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="bg-[#5BC0BE] text-[#0B132B] px-4 py-2 hover:bg-[#6FFFE9] transition-colors"
                  onClick={sendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  ) : (
                    "Send"
                  )}
                </button>
                <button
                  onClick={toggleUpload}
                  className="bg-[#6FFFE9] hover:bg-[#5BC0BE] text-[#0B132B] px-4 py-2 rounded-r-lg transition-colors flex items-center justify-center"
                >
                  Upload New Document
                </button>
              </div>
              <p className="text-sm text-[#C2D8F2] mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithUpload;
