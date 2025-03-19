import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { supabase } from "../supabase/supabaseClient";

const UploadComponent = ({ onUploadComplete, className = "" }) => {
  const [file, setFile] = useState(null);
  const [downloadURL, setDownloadURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isGeneratingVectors, setIsGeneratingVectors] = useState(false);
  const [vectorProgress, setVectorProgress] = useState(0);

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
            setProgress(percent);
          }
        });
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
      
      // Show loader for generating embeddings
      setIsGeneratingVectors(true);
      setVectorProgress(0);
      const progressInterval = setInterval(() => {
        setVectorProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 200);
      
      // Send a request to create vectors on the backend.
      const response = await fetch("http://127.0.0.1:8000/generate_vectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: publicUrl, user_id: user.uid }),
      });

      const result = await response.json();
      console.log("Vector creation result:", result);
      
      clearInterval(progressInterval);
      setVectorProgress(100);
      setIsGeneratingVectors(false);
      setUploadSuccess(true);
      
      // Alert the user that the upload was successful
      alert("Upload Successful!");

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
    } finally {
      setLoading(false);
    }
  };

  // Format file size in readable format
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Upload Document</h2>
      
      {/* Drag and drop area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 mb-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-500 text-center mb-1">Drag & drop your file here or</p>
        <label className="inline-block px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition-colors">
          Browse Files
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
        </label>
        <p className="text-xs text-gray-400 mt-2">Supported format: PDF</p>
      </div>

      {/* Selected file info */}
      {file && !uploadSuccess && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="ml-1 flex-1 truncate">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button 
            onClick={() => setFile(null)} 
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Remove file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loader */}
      {isGeneratingVectors && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Loading ...</span>
            <span>{vectorProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${vectorProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading || isGeneratingVectors}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
          !file || loading || isGeneratingVectors ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? "Processing..." : "Upload File"}
      </button>

      {/* Download URL display */}
      {uploadSuccess && downloadURL && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 text-sm font-medium">Upload Successful!</span>
          </div>
          <p className="text-xs text-gray-700 mb-1">Your file is available at:</p>
          <div className="bg-white p-1.5 rounded border border-gray-200 flex items-center">
            <input 
              type="text" 
              value={downloadURL} 
              readOnly 
              className="flex-1 text-xs text-blue-600 focus:outline-none truncate bg-transparent" 
            />
            <button 
              onClick={() => navigator.clipboard.writeText(downloadURL)}
              className="ml-1 text-blue-500 hover:text-blue-700 p-1"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
