// frontend/src/components/Questionnaire.jsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './navbar.jsx'; 
import UploadComponent from './uploadcomponent.jsx';
import NoDocumentsPrompt from './nodocumentsprompt.jsx';

const QuizState = {
  INITIAL: 'initial',
  LOADING: 'loading',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  ERROR: 'error',
};

const Questionnaire = () => {
  const [quizState, setQuizState] = useState(QuizState.INITIAL);
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tempAnswer, setTempAnswer] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasVectors, setHasVectors] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
  const score = Object.values(answers).filter((a) => a.isCorrect).length;

  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Check if user has existing uploads (vectors)
  useEffect(() => {
    checkVectorsForQuiz();
  }, []);

  const checkVectorsForQuiz = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('http://127.0.0.1:8000/check_vectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user.uid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHasVectors(data.exists);
    } catch (err) {
      console.error('Error checking vectors for quiz:', err);
    }
  };

  // Fetch questions when quizState === LOADING
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('Please log in to take the quiz.');
          setQuizState(QuizState.ERROR);
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch('http://127.0.0.1:8000/generate_mcqs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topic, user_id: user.uid }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!data.mcqs) {
          throw new Error('No questions were returned from the server.');
        }

        let parsedQuestions = data.mcqs.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.correct_answer,
          explanation: q.explanation || 'No explanation provided.',
        }));

        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          throw new Error('No questions available for this topic');
        }

        // Limit or duplicate to 15 questions
        if (parsedQuestions.length > 15) {
          parsedQuestions = parsedQuestions.slice(0, 15);
        } else if (parsedQuestions.length < 15) {
          const originalLength = parsedQuestions.length;
          for (let i = 0; parsedQuestions.length < 15; i++) {
            parsedQuestions.push({ ...parsedQuestions[i % originalLength] });
          }
        }

        setQuestions(parsedQuestions);
        setQuizState(QuizState.IN_PROGRESS);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
        setQuizState(QuizState.ERROR);
      }
    };

    if (quizState === QuizState.LOADING) {
      fetchQuestions();
    }
  }, [topic, quizState]);

  const handleStart = () => {
    if (!topic) return;
    setStartTime(Date.now());
    setQuestions([]);
    setAnswers({});
    setTempAnswer(null);
    setCurrentIndex(0);
    setError(null);
    setQuizState(QuizState.LOADING);
  };

  const handleAnswer = (selectedOption) => {
    setTempAnswer(selectedOption);
  };

  const handleSubmitAnswer = () => {
    if (tempAnswer == null) return;
    const isCorrect = tempAnswer === currentQuestion.answer;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selected: tempAnswer,
        isCorrect,
        explanation: currentQuestion.explanation,
      },
    }));
    setQuizState(QuizState.SUBMITTED);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const quizResults = {
        topic,
        correctAnswers: score,
        totalQuestions: questions.length,
        timeTaken: `${timeTaken} seconds`,
      };

      // Save results
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }
        const token = await user.getIdToken();
        const response = await fetch('http://127.0.0.1:8000/save_quiz_results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...quizResults,
            user_id: user.uid,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save results to the database');
        }
        console.log('Quiz results saved successfully!');
      } catch (error) {
        console.error('Error saving results:', error);
      }

      setQuizState(QuizState.COMPLETED);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setQuizState(QuizState.IN_PROGRESS);
      setTempAnswer(null);
    }
  };

  const handleRetry = () => {
    setQuizState(QuizState.INITIAL);
    setTopic('');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setError(null);
  };

  const handleUploadSuccess = () => {
    setIsUploading(false);
    setHasVectors(true);
  };

  const toggleUpload = () => {
    setIsUploading((prev) => !prev);
  };

  // Custom NoDocumentsPrompt wrapper to ensure consistent styling
  const renderNoVectorsPrompt = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">StudyBuddy Quiz</h2>
      </div>
      <div className="p-8">
        <NoDocumentsPrompt
          featureName="quiz"
          onUploadClick={() => setIsUploading(true)}
          showHeader={false}
        />
      </div>
    </div>
  );

  const renderCompletion = () => {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    let resultMessage = "";
    let resultClass = "";
    
    if (percentage >= 80) {
      resultMessage = "Excellent! You've mastered this topic!";
      resultClass = "text-green-500";
    } else if (percentage >= 60) {
      resultMessage = "Good job! You're understanding the material well.";
      resultClass = "text-blue-500";
    } else {
      resultMessage = "Keep practicing! You'll improve with more study.";
      resultClass = "text-yellow-600";
    }
    
    return (
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Quiz Completed!</h2>
          <p className="text-white/80 mt-2">Topic: {topic}</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-gray-100">
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-gray-200" 
                    strokeWidth="10" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="45" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className="text-[#1e88e5] transition-all duration-1000" 
                    strokeWidth="10" 
                    strokeDasharray={`${percentage * 2.83}, 283`} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="45" 
                    cx="50" 
                    cy="50" 
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{score}</span>
                <span className="text-gray-500">out of {questions.length}</span>
              </div>
            </div>
          </div>
          
          <h3 className={`text-center text-xl font-semibold mb-4 ${resultClass}`}>
            {resultMessage}
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <button 
              onClick={handleRetry}
              className="py-3 px-6 rounded-lg bg-[#1e88e5] text-white font-medium transition-all hover:bg-[#1976d2] hover:shadow-md"
            >
              Take Another Quiz
            </button>
            <Link
              to="/dashboard"
              className="py-3 px-6 rounded-lg border border-[#1e88e5] text-[#1e88e5] font-medium transition-all hover:bg-[#1e88e5]/5 text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderInitialScreen = () => {
    if (!hasVectors) {
      return renderNoVectorsPrompt();
    }
    return (
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">StudyBuddy Quiz</h2>
          <p className="text-white/80 mt-2">Test your knowledge on any subject</p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#bbdefb] flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <p className="text-gray-600 text-center max-w-md mx-auto">
              We'll generate quiz questions based on your uploaded documents.
              Enter a specific topic to focus your quiz.
            </p>
          </div>

          <div className="mb-8">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Neural Networks, World War II, Climate Change"
              className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-[#64b5f6] focus:border-[#1e88e5] focus:outline-none transition-colors text-gray-700"
            />
          </div>
          
          <div className="mb-8 bg-[#e3f2fd] p-4 rounded-lg border-l-4 border-[#1e88e5]">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#1e88e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quiz Instructions:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
              <li>Each quiz contains 15 questions</li>
              <li>Select your answer and click Submit</li>
              <li>You'll see explanations for each answer</li>
              <li>Your results will be saved automatically</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleStart} 
              disabled={!topic}
              className="py-3 px-6 rounded-lg bg-[#1e88e5] text-white font-medium transition-all hover:bg-[#1976d2] hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
            >
              Start Quiz
            </button>
            <button 
              onClick={() => setIsUploading(true)}
              className="py-3 px-6 rounded-lg border border-[#1e88e5] text-[#1e88e5] font-medium transition-all hover:bg-[#1e88e5]/5 flex-1"
            >
              Upload New Document
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-4 px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Question {currentIndex + 1}/{questions.length}
          </h2>
          <span className="text-white/80">Topic: {topic}</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 mt-3">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, idx) => (
            <div 
              key={idx}
              onClick={() => quizState !== QuizState.SUBMITTED && handleAnswer(option)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                quizState === QuizState.SUBMITTED
                  ? answers[currentIndex]?.selected === option
                    ? answers[currentIndex]?.isCorrect 
                      ? 'bg-green-100 border-green-300'
                      : 'bg-red-100 border-red-300'
                    : option === currentQuestion.answer
                      ? 'bg-green-100 border-green-300'
                      : 'border-gray-200'
                  : tempAnswer === option
                    ? 'bg-[#e3f2fd] border-[#64b5f6]'
                    : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 flex-shrink-0 rounded-full mr-3 flex items-center justify-center ${
                  quizState === QuizState.SUBMITTED
                    ? answers[currentIndex]?.selected === option
                      ? answers[currentIndex]?.isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : option === currentQuestion.answer
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    : tempAnswer === option
                      ? 'bg-[#64b5f6] text-white'
                      : 'bg-gray-200'
                }`}>
                  {quizState === QuizState.SUBMITTED ? (
                    answers[currentIndex]?.selected === option ? (
                      answers[currentIndex]?.isCorrect ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    ) : option === currentQuestion.answer ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs text-gray-600">{String.fromCharCode(65 + idx)}</span>
                    )
                  ) : (
                    <span className="text-xs">{String.fromCharCode(65 + idx)}</span>
                  )}
                </div>
                <span className={`${
                  quizState === QuizState.SUBMITTED && 
                  (answers[currentIndex]?.selected === option || option === currentQuestion.answer) 
                    ? 'font-medium' 
                    : ''
                }`}>
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {quizState === QuizState.SUBMITTED && (
          <div className={`p-4 rounded-lg mb-6 ${
            answers[currentIndex].isCorrect 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`font-semibold ${
              answers[currentIndex].isCorrect ? 'text-green-800' : 'text-red-800'
            } mb-1`}>
              {answers[currentIndex].isCorrect ? 'Correct!' : 'Incorrect'}
            </h4>
            <p className="text-gray-700">{currentQuestion.explanation}</p>
          </div>
        )}
        
        {quizState === QuizState.IN_PROGRESS ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={tempAnswer === null}
            className="w-full py-3 rounded-lg bg-[#1e88e5] text-white font-medium transition-all hover:bg-[#1976d2] hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-[#1e88e5] text-white font-medium transition-all hover:bg-[#1976d2] hover:shadow-md"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-6 px-8 text-center">
        <h2 className="text-2xl font-bold text-white">Generating Quiz</h2>
        <p className="text-white/80 mt-2">Topic: {topic}</p>
      </div>
      
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="flex justify-center mb-6">
          <svg className="animate-spin h-12 w-12 text-[#1e88e5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600 text-center mb-2">Creating challenging questions for you...</p>
        <p className="text-sm text-gray-500 text-center">This might take a moment</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#f44336] to-[#e53935] py-6 px-8 text-center">
        <h2 className="text-2xl font-bold text-white">Error</h2>
      </div>
      
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Failed to Load Questions</h3>
        <p className="text-gray-600 text-center mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleRetry}
            className="py-3 px-6 rounded-lg bg-[#1e88e5] text-white font-medium transition-all hover:bg-[#1976d2] hover:shadow-md flex-1"
          >
            Try Again
          </button>
          <Link
            to="/dashboard"
            className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium transition-all hover:bg-gray-50 flex-1 text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
      <Navbar />
      
      {/* Fixed positioning to center everything properly */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
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
                    Back to Quiz
                  </button>
                </div>
                <div className="p-6">
                  <UploadComponent onUploadComplete={handleUploadSuccess} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              {quizState === QuizState.INITIAL && renderInitialScreen()}
              {quizState === QuizState.LOADING && renderLoading()}
              {quizState === QuizState.ERROR && renderError()}
              {(quizState === QuizState.IN_PROGRESS || quizState === QuizState.SUBMITTED) &&
                currentQuestion &&
                renderQuestion()}
              {quizState === QuizState.COMPLETED && renderCompletion()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;