import React from 'react';

/**
 * A reusable prompt component that shows:
 * - A heading (e.g., "No Existing Documents Found!")
 * - A subtext that references a variable feature name (e.g., "flashcard", "quiz", etc.)
 * - A button labeled "Upload Document"
 *
 * Props:
 * - heading (string): Main heading text
 * - featureName (string): Name of the feature to unlock (e.g. "flashcard")
 * - onUploadClick (function): Called when the button is clicked
 *
 * Optional props:
 * - buttonText (string): Label for the button (default: "Upload Document")
 * - containerStyles (string): Additional Tailwind classes for the container
 */
const NoDocumentsPrompt = ({
  heading = "No Existing Documents Found!",
  featureName = "this",
  buttonText = "Upload Document",
  onUploadClick,
  containerStyles = ""
}) => {
  return (
    <div className={`text-center text-[#C2D8F2] bg-[#1C2541] p-6 rounded-lg shadow-lg max-w-md w-full ${containerStyles}`}>
      <h2 className="text-2xl font-bold mb-4">{heading}</h2>
      <p className="mb-4">
        Please upload your study material to unlock the {featureName} feature.
      </p>
      <button
        onClick={onUploadClick}
        className="py-2 px-5 rounded bg-[#5BC0BE] text-[#0B132B] transition-colors hover:bg-[#6FFFE9]"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default NoDocumentsPrompt;
