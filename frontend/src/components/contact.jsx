import React, { useState } from "react";
import Navbar from "./navbar";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      // Simulate form submission delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1C2541] p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-[#C2D8F2] text-center">
            Contact Us
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-[#C2D8F2] mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0B132B] border border-[#3A506B] text-[#C2D8F2] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#5BC0BE]"
              />
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#C2D8F2] mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0B132B] border border-[#3A506B] text-[#C2D8F2] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#5BC0BE]"
              />
            </div>
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-[#C2D8F2] mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-[#0B132B] border border-[#3A506B] text-[#C2D8F2] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#5BC0BE]"
              />
            </div>
            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-[#C2D8F2] mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-[#0B132B] border border-[#3A506B] text-[#C2D8F2] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#5BC0BE] resize-none"
              ></textarea>
            </div>
            {/* Status Message */}
            {status && (
              <p
                className={`text-center ${
                  status.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {status}
              </p>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] py-2 rounded transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
