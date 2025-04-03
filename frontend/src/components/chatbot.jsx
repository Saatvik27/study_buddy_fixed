import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import UploadComponent from "./uploadcomponent.jsx";
import Navbar from "./navbar.jsx";
import NoDocumentsPrompt from "./nodocumentsprompt.jsx";
import backendconfig from "../../backendconfig.js";

const ChatWithUpload = () => {
  const [hasVectors, setHasVectors] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Listen for auth changes and redirect to "/login" if not authenticated
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        fetchChatHistory(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Check for existing document vectors on component mount
  useEffect(() => {
    checkVectors();
  }, []);

  // Scroll to the bottom of the chat whenever messages change
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
      const response = await fetch(`${backendconfig.apiBaseUrl}/check_vectors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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



  const fetchChatHistory = async (userId) => {
    try {
      const response = await fetch(`${backendconfig.apiBaseUrl}/get_chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setChatHistory(data.chats.slice(-10));
    } catch (error) {
      console.error("Error fetching chat history:", error);
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
      const response = await fetch(`${backendconfig.apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, user_id: user.uid }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.output, sender: "bot" }]);
      
      // Fetch updated chat history
      fetchChatHistory(user.uid);
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

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  
  // Load chat history conversation
  const loadChatFromHistory = (chat) => {
    if (chat.prompt && chat.response) {
      setMessages([
        { text: chat.prompt, sender: "user" },
        { text: chat.response, sender: "bot" }
      ]);
    }
  };
  
  // Format timestamp if available
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Custom NoDocumentsPrompt wrapper to ensure consistent styling
  const renderNoVectorsPrompt = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">StudyBuddy Chat</h2>
      </div>
      <div className="p-8">
        <NoDocumentsPrompt
          featureName="chatbot"
          onUploadClick={toggleUpload}
          showHeader={false}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex">
      {/* Sidebar for Chat History */}
      <div 
        className={`fixed top-0 left-0 h-full z-20 transition-all duration-300 ease-in-out bg-white shadow-lg border-r border-gray-200 ${
          isSidebarOpen ? "w-72" : "w-0 -translate-x-full sm:translate-x-0 sm:w-16"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white p-4 flex items-center justify-between">
            {isSidebarOpen && <h2 className="font-medium">Chat History</h2>}
            <button 
              onClick={toggleSidebar} 
              className={`p-1.5 rounded-md hover:bg-blue-500/30 transition-colors ${!isSidebarOpen && "w-full flex justify-center"}`}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Chat History Items */}
          <div className="flex-1 overflow-y-auto py-2 px-1">
            {isSidebarOpen ? (
              chatHistory && chatHistory.length > 0 ? (
                <div className="space-y-2">
                  {chatHistory.map((chat, index) => (
                    <button
                      key={index}
                      onClick={() => loadChatFromHistory(chat)}
                      className="w-full p-2.5 text-left bg-white hover:bg-gray-100 rounded-md transition-colors border border-gray-200 group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-800 line-clamp-1 flex-1">
                          {chat.prompt?.substring(0, 30) || `Chat ${index + 1}`}
                          {chat.prompt?.length > 30 ? "..." : ""}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {chat.response?.substring(0, 40)}
                        {chat.response?.length > 40 ? "..." : ""}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No chat history yet</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center py-2">
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  title="Chat History"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Bottom section with options */}
          {isSidebarOpen && (
            <div className="p-3 border-t border-gray-200">
              <button 
                onClick={() => setMessages([])}
                className="w-full py-1.5 px-2 text-gray-600 hover:bg-gray-100 rounded text-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Clear Current Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? "ml-72" : "ml-0 sm:ml-16"} transition-all duration-300`}>
        <Navbar />

        <div className="flex-1 flex flex-col items-center py-6 px-4">
          {/* Upload Component */}
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
                    Back to Chat
                  </button>
                </div>
                <div className="p-6">
                  <UploadComponent onUploadComplete={handleUploadSuccess} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full h-full max-w-4xl mx-auto">
              {/* No Documents Prompt */}
              {!hasVectors ? (
                renderNoVectorsPrompt()
              ) : (
                <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-3 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-white font-medium text-lg">StudyBuddy Chat</h2>
                          <p className="text-white/70 text-sm">Ask questions about your study materials</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={toggleSidebar}
                        className="sm:hidden p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Messages Area */}
                  <div 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #f5f9ff' }}
                  >
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        {msg.sender === "bot" && (
                          <div className="h-8 w-8 rounded-full bg-[#1e88e5] flex-shrink-0 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                            msg.sender === "user"
                              ? "bg-gradient-to-br from-[#64b5f6] to-[#1e88e5] text-white rounded-tr-none"
                              : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {msg.sender === "user" && (
                          <div className="h-8 w-8 rounded-full bg-[#64b5f6] flex-shrink-0 flex items-center justify-center ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-start animate-fadeIn">
                        <div className="h-8 w-8 rounded-full bg-[#1e88e5] flex-shrink-0 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="bg-white border border-gray-100 text-gray-800 rounded-xl rounded-tl-none p-4 shadow-sm max-w-[75%]">
                          <div className="flex space-x-2 items-center h-5">
                            <div className="w-2 h-2 bg-[#64b5f6] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#64b5f6] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-[#64b5f6] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Empty state when no messages */}
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                        <div className="w-16 h-16 bg-[#e3f2fd] rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Start a new conversation</h3>
                        <p className="text-gray-500 mb-4">Ask me anything about your study materials!</p>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <textarea
                          className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#64b5f6] focus:border-transparent resize-none text-gray-800 placeholder-gray-500"
                          rows="2"
                          placeholder="Ask a question about your study material..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
                            !input.trim() 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-[#1e88e5] text-white hover:bg-[#1976d2]'
                          }`}
                          onClick={sendMessage}
                          disabled={!input.trim() || isLoading}
                        >
                          {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={toggleUpload}
                          className="p-3 rounded-lg bg-white border border-[#1e88e5] text-[#1e88e5] hover:bg-[#e3f2fd] transition-colors"
                          title="Upload a document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 pl-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Custom Scrollbar for Webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f5f9ff;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default ChatWithUpload;