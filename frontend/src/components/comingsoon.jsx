import React, { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-white text-center p-5">
        <div className="max-w-[600px] bg-white bg-opacity-20 rounded-2xl p-10 shadow-lg animate-pulse">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Exciting Feature Coming Soon!
          </h1>
          <p className="text-xl">
            We're working hard to bring you an amazing new experience. Stay tuned for updates and get ready to be wowed!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
