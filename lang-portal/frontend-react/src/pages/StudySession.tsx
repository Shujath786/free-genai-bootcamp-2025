import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Volume2, Check, X, Flag, RotateCcw } from 'lucide-react';
import { Word, getSessionWords, APIError } from '../lib/api';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
        <p className="text-red-800">{message}</p>
      </div>
    </div>
  );
}

interface StudyProgress {
  correct: number;
  incorrect: number;
  flagged: number;
  total: number;
}

export function StudySession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudyProgress>({
    correct: 0,
    incorrect: 0,
    flagged: 0,
    total: 0,
  });

  useEffect(() => {
    async function fetchWords() {
      try {
        setLoading(true);
        // For demo, we're using group 1. In production, this would come from the session data
        const fetchedWords = await getSessionWords(1);
        setWords(fetchedWords);
        setProgress(prev => ({ ...prev, total: fetchedWords.length }));
      } catch (err) {
        const errorMessage = err instanceof APIError 
          ? err.message 
          : 'Failed to load study session. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchWords();
  }, [sessionId]);

  const currentWord = words[currentIndex];

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleResponse = (type: 'correct' | 'incorrect' | 'flagged') => {
    setProgress(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    handleNext();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentWord) return null;

  const progressPercentage = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/study-activities')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Exit Session
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {words.length}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">{progress.correct}</span>
              <span className="text-red-600">{progress.incorrect}</span>
              <span className="text-yellow-600">{progress.flagged}</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center space-y-6">
            {/* English */}
            <div>
              <h2 className="text-xl text-gray-600">English</h2>
              <p className="text-3xl font-medium text-gray-900 mt-2">
                {currentWord.english}
              </p>
            </div>

            {/* Arabic */}
            <div className={showAnswer ? 'opacity-100' : 'opacity-0'}>
              <h2 className="text-xl text-gray-600">Arabic</h2>
              <p className="text-4xl font-amiri text-gray-900 mt-2" dir="rtl">
                {currentWord.arabic}
              </p>
              <p className="text-lg text-gray-600 mt-2">
                {currentWord.transliteration}
              </p>
            </div>

            {/* Audio Button */}
            <button 
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => {/* TODO: Implement audio playback */}}
            >
              <Volume2 className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Show Answer
            </button>
          ) : (
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={() => handleResponse('correct')}
                className="flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="h-5 w-5 mr-2" />
                Correct
              </button>
              <button
                onClick={() => handleResponse('incorrect')}
                className="flex items-center justify-center py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="h-5 w-5 mr-2" />
                Incorrect
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleResponse('flagged')}
              className="flex items-center text-sm text-yellow-600 hover:text-yellow-700"
            >
              <Flag className="h-4 w-4 mr-1" />
              Flag for Review
            </button>
            <button
              onClick={() => setShowAnswer(false)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Card
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full ${
                currentIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              className={`p-2 rounded-full ${
                currentIndex === words.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}