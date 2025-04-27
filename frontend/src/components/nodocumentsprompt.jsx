import React from 'react';

const NoDocumentsPrompt = ({
  heading = "No Documents Found",
  featureName = "this",
  buttonText = "Upload Document",
  onUploadClick,
  containerStyles = "",
  showHeader = true
}) => {
  return (
    <div className={`text-center w-full ${containerStyles}`}>
      {showHeader && (
        <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">{heading}</h2>
        </div>
      )}
      
      <div className="bg-white px-6 py-8 rounded-b-xl shadow-md overflow-y-auto">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">
          {showHeader ? "Let's get started!" : heading}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Upload your study materials to unlock the {featureName} feature and enhance your learning experience.
        </p>
        
        <div className="bg-[#f5f9ff] border border-[#e3f2fd] rounded-lg p-4 mb-6 text-left">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What you can upload:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 pl-7 list-disc">
            <li>PDF documents</li>
          </ul>
        </div>
        
        <div className="pb-2">
          <button
            onClick={onUploadClick}
            className="bg-[#1e88e5] hover:bg-[#1976d2] text-white py-3 px-6 rounded-lg transition-colors shadow-sm font-medium flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoDocumentsPrompt;