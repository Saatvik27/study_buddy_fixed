import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './navbar'; 
import UploadComponent from './UploadComponent';
import NoDocumentsPrompt from './nodocumentsprompt'; // Reusable prompt

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

  // Track whether user has existing uploads (vectors)
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

  const renderCompletion = () => (
    <div className="text-center text-[#C2D8F2]">
      <h2 className="text-2xl font-bold mb-5">Quiz Completed!</h2>
      <div className="mt-4 text-xl font-bold">
        <p>You scored {score} out of {questions.length}</p>
        <p className="mt-3 text-2xl text-[#5BC0BE]">
          ({((score / questions.length) * 100).toFixed(1)}%)
        </p>
      </div>
      <button 
        onClick={handleRetry}
        className="py-3 px-5 rounded bg-[#5BC0BE] text-[#0B132B] mt-5 transition-colors hover:bg-[#6FFFE9]"
      >
        Take Another Quiz
      </button>
    </div>
  );

  // Reusable prompt for no documents
  const renderNoVectorsPrompt = () => (
    <NoDocumentsPrompt
      featureName="quiz"
      onUploadClick={() => setIsUploading(true)}
    />
  );

  const renderInitialScreen = () => {
    if (!hasVectors) {
      return renderNoVectorsPrompt();
    }
    return (
      <div className="text-center text-[#C2D8F2]">
        <h2 className="text-3xl font-bold mb-5">Welcome to the Quiz!</h2>

        {/* Explanation paragraph about generating quiz from user’s uploads */}
        <p className="max-w-md mx-auto mb-6">
          We will generate a quiz by analyzing the documents you've previously uploaded.
          Simply enter a topic below, and our system will create quiz questions
          from your existing uploads.
        </p>

        <div className="my-6">
          <label htmlFor="topic" className="block mb-2 text-lg font-semibold">
            Enter Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic"
            className="mt-3 px-3 py-2 w-56 border border-[#3A506B] rounded text-base bg-[#0B132B] text-[#C2D8F2]"
          />
        </div>
        <div className="my-6">
          <button 
            onClick={() => setIsUploading(true)}
            className="py-3 px-5 rounded bg-[#6FFFE9] text-[#0B132B] transition-colors hover:bg-[#5BC0BE]"
          >
            Upload New Document
          </button>
        </div>
        <div className="my-6 p-4 bg-[#1C2541] border-l-4 border-[#5BC0BE] rounded text-left">
          <h3 className="text-xl mb-3 font-bold">Instructions:</h3>
          <ul className="pl-5 list-disc text-[#C2D8F2]">
            <li>Each question has one correct answer</li>
            <li>Your progress will be saved automatically</li>
          </ul>
        </div>
        <button 
          onClick={handleStart} 
          disabled={!topic}
          className="py-3 px-5 rounded bg-[#5BC0BE] text-[#0B132B] mt-5 transition-colors hover:bg-[#6FFFE9] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Quiz
        </button>
      </div>
    );
  };

  const renderQuestion = () => (
    <div className="p-4 text-[#C2D8F2]">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="w-full bg-[#3A506B] rounded-full h-2 ml-4">
            <div 
              className="bg-[#5BC0BE] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg mb-5 font-semibold">{currentQuestion.question}</h3>
      
      <div className="my-6 grid gap-3">
        {currentQuestion.options.map((option, idx) => (
          <label key={idx} htmlFor={`option-${idx}`} className="flex items-center cursor-pointer">
            <input
              type="radio"
              id={`option-${idx}`}
              name="quiz-option"
              value={option}
              checked={
                quizState === QuizState.SUBMITTED
                  ? answers[currentIndex]?.selected === option
                  : tempAnswer === option
              }
              onChange={() => setTempAnswer(option)}
              disabled={quizState === QuizState.SUBMITTED}
              className="form-radio text-[#5BC0BE] mr-2"
            />
            <span className="text-base">{option}</span>
          </label>
        ))}
      </div>
      
      {quizState === QuizState.IN_PROGRESS && (
        <button
          onClick={handleSubmitAnswer}
          disabled={!tempAnswer}
          className="py-3 px-5 rounded bg-[#5BC0BE] text-[#0B132B] mt-5 transition-colors hover:bg-[#6FFFE9] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      )}
      
      {quizState === QuizState.SUBMITTED && (
        <div
          className={`mt-4 p-4 rounded text-base ${
            answers[currentIndex].isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="mb-4">
            {answers[currentIndex].isCorrect ? 'Correct! ' : 'Incorrect. '}
            {currentQuestion.explanation}
          </p>
          <button 
            onClick={handleNext}
            className="py-3 px-5 rounded bg-[#5BC0BE] text-[#0B132B] mt-5 transition-colors hover:bg-[#6FFFE9]"
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );

  const renderLoading = () => (
    <div className="text-center p-6 text-[#C2D8F2]">
      <div className="inline-block w-12 h-12 border-4 border-[#5BC0BE] border-t-[#6FFFE9] rounded-full animate-spin mb-3"></div>
      <p className="text-lg">Loading questions...</p>
      <p className="mt-3 italic">Topic: {topic}</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center text-[#C2D8F2]">
      <h2 className="text-2xl font-bold mb-5">Error Loading Questions</h2>
      <p className="text-red-500">{error}</p>
      <button 
        onClick={handleRetry}
        className="py-3 px-5 rounded bg-[#5BC0BE] text-[#0B132B] mt-5 transition-colors hover:bg-[#6FFFE9]"
      >
        Try Again
      </button>
    </div>
  );

  const toggleUpload = () => {
    setIsUploading((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-10 px-4">
        {/* If uploading, show upload screen */}
          {isUploading && (
            <div className="w-full max-w-lg bg-[#1C2541] p-8 rounded-lg shadow-lg mb-6">
              <button
                onClick={toggleUpload}
                className="mb-4 text-[#5BC0BE] hover:text-[#6FFFE9] flex items-center"
              >
                ← Back
              </button>
              <UploadComponent onUploadComplete={handleUploadSuccess} />
            </div>
          )}

          {/* If not uploading, show the quiz states */}
          {!isUploading && quizState === QuizState.INITIAL && renderInitialScreen()}
          {!isUploading && quizState === QuizState.LOADING && renderLoading()}
          {!isUploading && quizState === QuizState.ERROR && renderError()}
          {!isUploading &&
            (quizState === QuizState.IN_PROGRESS || quizState === QuizState.SUBMITTED) &&
            currentQuestion &&
            renderQuestion()}
          {!isUploading && quizState === QuizState.COMPLETED && renderCompletion()}
      </main>
    </div>
  );
};

export default Questionnaire;
