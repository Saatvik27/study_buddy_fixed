import React, { useState, useRef } from "react";
import Navbar from "./navbar.jsx";
import { sendForm } from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setSending(true);
    
    try {
      // EmailJS configuration
      const serviceId = 'service_luv69d';
      const templateId = 'template_nyeqc1p';
      const publicKey = 'h1pbIPSCGT6J9gWuR';
      
      // Using the sendForm function directly with the latest API
      const result = await sendForm(
        serviceId,
        templateId,
        form.current,
        publicKey
      );
      
      console.log('Email sent successfully:', result.text);
      
      // Success handling
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f9ff]">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          {/* Contact Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] bg-clip-text text-transparent mb-3">
              Get in Touch
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions about StudyBuddy? Need help with your account? We'd love to hear from you.
              Our team is here to help!
            </p>
          </div>
          
          {/* Contact Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] px-6 py-5">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Form
              </h2>
            </div>
            
            {/* Form Section */}
            <div className="p-6">
              {/* Status Messages */}
              {status === "success" && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Message sent successfully!</p>
                    <p className="text-sm">We'll get back to you as soon as possible.</p>
                  </div>
                </div>
              )}
              
              {status === "error" && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Failed to send message</p>
                    <p className="text-sm">Please try again or contact us directly at saatvikmittra1@gmail.com</p>
                  </div>
                </div>
              )}
              
              {/* Contact Form */}
              <form ref={form} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name" // EmailJS will use this name attribute
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#64b5f6] focus:border-[#1e88e5] transition-colors outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email" // EmailJS will use this name attribute
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#64b5f6] focus:border-[#1e88e5] transition-colors outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                
                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject" // EmailJS will use this name attribute
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#64b5f6] focus:border-[#1e88e5] transition-colors outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>
                
                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message" // EmailJS will use this name attribute
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your question or concern in detail..."
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#64b5f6] focus:border-[#1e88e5] transition-colors outline-none text-gray-800 placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
                
                {/* Hidden field for recipient email */}
                <input 
                  type="hidden" 
                  name="to_email" 
                  value="saatvikmittra1@gmail.com" 
                />
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] hover:from-[#5ba5e6] hover:to-[#1976d2] text-white py-3 px-6 rounded-lg shadow-md transition-all font-medium text-center flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;