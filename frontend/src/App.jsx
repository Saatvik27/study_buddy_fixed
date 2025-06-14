import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { UserProvider } from "./contexts/usercontext";
import { AuthModeProvider } from "./contexts/authmodecontext";

import Login from "./components/login";
import ForgotPassword from "./components/forgotpassword";
import NotFound from "./components/notfound";
import Home from "./components/home";
import ProtectedRoute from "./components/protectedroute";
import Profile from "./components/profile";
import Contact from "./components/contact";
import Questionnaire from "./components/questionnaire";
import ChatBot from "./components/chatbot";
import Flashcards from "./components/flashcards";
import ComingSoon from "./components/comingsoon";


function App() {
  return (
    <AuthModeProvider>
    <UserProvider>
    <Router>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/questionnaire' element={<Questionnaire />} />
          <Route path='/chatbot' element={<ChatBot />} />
          <Route path='/flashcards' element={<Flashcards />} />
          <Route path='/analyze' element={<ComingSoon />} />
          <Route 
            path='/profile' 
            element={
            <ProtectedRoute>
              <Profile />
              </ProtectedRoute>} 
            />

          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
    </UserProvider>
    </AuthModeProvider>
  );
}

export default App;