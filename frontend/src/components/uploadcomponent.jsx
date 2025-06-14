import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { supabase } from "../supabase/supabaseclient.js";
import backendconfig from "../../backendconfig.js";

const UploadComponent = ({ onUploadComplete, className = "" }) => {
  const [file, setFile] = useState(null);
  const [downloadURL, setDownloadURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  // Add vector generation state variables
  const [isGeneratingVectors, setIsGeneratingVectors] = useState(false);
  const [vectorProgress, setVectorProgress] = useState(0);
  const [vectorError, setVectorError] = useState(null);
  const lastProgressUpdateRef = useRef(Date.now());
  const animationFrameRef = useRef(null);
  const vectorCheckIntervalRef = useRef(null);
  
  // Add number of retry attempts
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const bucket = "uploads"; // Supabase storage bucket name

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to upload files.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setVectorError(null);
    setRetryCount(0);
    
    // Set up a smoother progress animation
    let targetProgress = 0;
    let currentProgress = 0;
    
    const animateProgress = () => {
      if (currentProgress < targetProgress) {
        // Slow down by reducing the increment to 1/10000th of the original speed (0.5 / 10000 = 0.00005)
        currentProgress = Math.min(currentProgress + 5, targetProgress);
        setProgress(Math.round(currentProgress));
        // Add a significant delay between frames to slow down even more
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(animateProgress);
        }, 2000); // 2000ms delay between frames
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animateProgress);

    try {
      const timestamp = Date.now();
      const filePath = `public/${timestamp}-${file.name}`;

      // Upload file to Supabase Storage with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          fileMetadata: { owner: user.uid },
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            // Set the target progress, which our animation will smoothly catch up to
            targetProgress = percent;
            
            // Ensure we don't update too frequently (throttle)
            const now = Date.now();
            if (now - lastProgressUpdateRef.current > 50) { // 50ms throttle
              lastProgressUpdateRef.current = now;
            }
          }
        });
        
      // Cancel animation frame when upload is done
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setProgress(100); // Ensure we reach 100%
      
      if (error) throw error;

      // Retrieve the public URL for the uploaded file
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to retrieve file URL.");
      }

      const publicUrl = urlData.publicUrl;

      // Store the metadata in a separate table
      try {
        const { error: metaError } = await supabase.from("file_metadata").insert({
          file_path: filePath,
          user_id: user.uid,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
          file_size: file.size,
          mime_type: file.type,
          download_url: publicUrl,
        });
        if (metaError) {
          console.error("Metadata Error:", metaError);
        }
      } catch (metadataError) {
        console.error("Metadata Error:", metadataError);
      }

      setDownloadURL(publicUrl);
      
      // Start vector generation with progress tracking
      await generateVectors(publicUrl, user.uid);
      
      setUploadSuccess(true);

      // Call the callback function if provided
      if (onUploadComplete) {
        onUploadComplete({
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      }
    } catch (error) {
      console.error("Upload Error:", error.message);
      alert(`File upload failed: ${error.message}`);
      // Cancel the animation frame if there's an error
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Reset states on error
      setVectorError(error.message);
      setIsGeneratingVectors(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up animation frame on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Cleanup effect for vector check interval
  useEffect(() => {
    return () => {
      if (vectorCheckIntervalRef.current) {
        clearInterval(vectorCheckIntervalRef.current);
      }
    };
  }, []);

  // Function to handle vector generation and check if vectors were created
  const generateVectors = async (fileUrl, userId) => {
    setIsGeneratingVectors(true);
    setVectorProgress(0);
    
    try {
      // Start a simulated progress animation for vector generation
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        // Gradually increase progress to 95% (the final 5% will be when we confirm vectors exist)
        simulatedProgress += 1;
        if (simulatedProgress >= 95) {
          clearInterval(progressInterval);
          simulatedProgress = 95;
        }
        setVectorProgress(simulatedProgress);
      }, 500);
      
      // Call the vector generation API
      const response = await fetch(`${backendconfig.apiBaseUrl}/generate_vectors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: fileUrl,
          user_id: userId,
        }),
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate vectors");
      }
      
      // Once vector generation is called, poll to check if vectors exist
      await checkVectorsExist(userId);
      
      setVectorProgress(100);
      setIsGeneratingVectors(false);
      return true;
      
    } catch (error) {
      console.error("Vector generation error:", error);
      setVectorError(error.message);
      
      // Retry logic for vector generation
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying vector generation (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
        return generateVectors(fileUrl, userId);
      } else {
        setIsGeneratingVectors(false);
        throw error; // Propagate error after max retries
      }
    }
  };
  
  // Function to check if vectors exist for the user
  const checkVectorsExist = async (userId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // Maximum 30 attempts (5 minutes total with 10-second interval)
      
      // Clear any existing interval
      if (vectorCheckIntervalRef.current) {
        clearInterval(vectorCheckIntervalRef.current);
      }
      
      // Set up polling interval
      vectorCheckIntervalRef.current = setInterval(async () => {
        attempts++;
        
        try {
          const response = await fetch(`${backendconfig.apiBaseUrl}/check_vectors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to check vector status");
          }
          
          const data = await response.json();
          
          if (data.exists) {
            // Vectors exist, we're done!
            clearInterval(vectorCheckIntervalRef.current);
            resolve(true);
          } else if (attempts >= maxAttempts) {
            // Exceeded maximum attempts
            clearInterval(vectorCheckIntervalRef.current);
            reject(new Error("Timeout waiting for vectors to be generated"));
          }
        } catch (error) {
          console.error("Error checking vectors:", error);
          // Don't reject here, just continue polling
        }
      }, 10000); // Check every 10 seconds
    });
  };

  // Format file size in readable format
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Determines if the file is a PDF
  const isPDF = file && file.type === "application/pdf";

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-4 px-5">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Upload Document
        </h2>
      </div>
      
      <div className="p-5">
        {/* Drag and drop area */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive 
              ? "border-[#1e88e5] bg-[#bbdefb]/30" 
              : file 
                ? "border-[#64b5f6] bg-[#e3f2fd]/50" 
                : "border-gray-300 hover:border-[#64b5f6] hover:bg-[#f5f9ff]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            // File selected view
            <>
              <div className="w-16 h-16 mb-3 bg-[#e3f2fd] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">{file.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{formatFileSize(file.size)}</p>
              <div className="flex items-center text-[#1e88e5]">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isPDF ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-sm">{isPDF ? 'Ready to upload' : 'File might not be supported'}</span>
              </div>
              
              {/* Remove file button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full shadow-sm"
                title="Remove file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            // No file selected view
            <>
              <div className="w-16 h-16 mb-4 bg-[#e3f2fd] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1e88e5]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base text-gray-700 mb-2 font-medium">Drag & drop your document here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <label className="px-5 py-2.5 bg-[#1e88e5] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#1976d2] transition-colors shadow-sm hover:shadow-md">
                Browse Files
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
              </label>
              <div className="mt-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1e88e5] mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-500">Supported format: PDF</span>
              </div>
            </>
          )}
        </div>

        {/* Progress indicator - Only showing the upload progress */}
        {loading && (
          <div className="mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">
                Uploading file...
              </span>
              <span className="text-sm text-gray-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-2.5 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${progress}%`,
                  background: "linear-gradient(135deg, #64b5f6, #1e88e5)"
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Vector generation progress indicator */}
        {isGeneratingVectors && (
          <div className="mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">
                Generating document vectors... {retryCount > 0 ? `(Retry ${retryCount}/${MAX_RETRIES})` : ''}
              </span>
              <span className="text-sm text-gray-600">
                {vectorProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-2.5 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${vectorProgress}%`,
                  background: "linear-gradient(135deg, #81c784, #4caf50)"
                }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Please wait while we analyze your document. This may take a few minutes.
            </p>
          </div>
        )}

        {/* Vector generation error */}
        {vectorError && !isGeneratingVectors && (
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Vector generation failed</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {vectorError}. Your file was uploaded but may not work correctly.
                </p>
                <button 
                  onClick={() => {
                    setVectorError(null);
                    generateVectors(downloadURL, getAuth().currentUser.uid);
                  }}
                  className="mt-2 text-xs font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload button */}
        {!uploadSuccess && (
          <button
            onClick={handleUpload}
            disabled={!file || loading || !isPDF}
            className={`mt-4 w-full py-2.5 px-4 rounded-lg font-medium shadow-sm transition-all ${
              !file || loading || !isPDF 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] text-white hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        )}

        {/* Success view */}
        {uploadSuccess && downloadURL && (
          <div className="mt-4 rounded-lg border border-[#bbdefb] bg-[#e3f2fd] p-4">
            <div className="flex items-center mb-3">
              <div className="mr-3 h-10 w-10 flex-shrink-0 rounded-full bg-[#1e88e5] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#1e88e5]">Upload Successful!</h3>
                <p className="text-sm text-gray-600">Your document is ready for use</p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <input 
                  type="text" 
                  value={downloadURL} 
                  readOnly 
                  className="flex-1 text-sm text-gray-700 focus:outline-none bg-transparent truncate" 
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(downloadURL);
                    alert("Link copied to clipboard!");
                  }}
                  className="ml-1 p-1.5 text-[#1e88e5] hover:text-[#1976d2] hover:bg-gray-100 rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => {
                  setFile(null);
                  setUploadSuccess(false);
                  setDownloadURL("");
                }}
                className="w-full py-2 px-4 bg-[#1e88e5] text-white rounded-md font-medium transition-colors hover:bg-[#1976d2]"
              >
                Upload Another Document
              </button>
            </div>
          </div>
        )}

        {/* Information section */}
        {!uploadSuccess && !loading && (
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Your documents are securely stored and only used to generate study materials for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadComponent;