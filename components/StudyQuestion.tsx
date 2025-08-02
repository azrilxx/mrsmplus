import React, { useState, useEffect } from 'react';

interface StudyQuestionProps {
  question: string;
  questionType: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string;
  hint?: string;
  onAnswerSubmit: (answer: string, isCorrect: boolean) => void;
  onSkip?: () => void;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
}

export const StudyQuestion: React.FC<StudyQuestionProps> = ({
  question,
  questionType,
  options = [],
  correctAnswer,
  hint,
  onAnswerSubmit,
  onSkip,
  questionNumber,
  totalQuestions,
  timeLimit = 60
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsTimerActive(true);
    setIsSubmitted(false);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowHint(false);
  }, [question, timeLimit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleTimeUp = () => {
    const currentAnswer = questionType === 'short_answer' ? textAnswer : selectedAnswer;
    if (currentAnswer.trim()) {
      handleSubmit();
    } else {
      onAnswerSubmit('', false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    setIsSubmitted(true);
    setIsTimerActive(false);
    
    let userAnswer = '';
    let isCorrect = false;

    switch (questionType) {
      case 'multiple_choice':
        userAnswer = selectedAnswer;
        isCorrect = selectedAnswer === correctAnswer;
        break;
      case 'short_answer':
        userAnswer = textAnswer.trim();
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        break;
      case 'true_false':
        userAnswer = selectedAnswer;
        isCorrect = selectedAnswer === correctAnswer;
        break;
    }

    onAnswerSubmit(userAnswer, isCorrect);
  };

  const handleSkip = () => {
    if (onSkip) {
      setIsTimerActive(false);
      onSkip();
    }
  };

  const canSubmit = () => {
    if (questionType === 'short_answer') {
      return textAnswer.trim().length > 0;
    }
    return selectedAnswer !== '';
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${getTimeColor()}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 leading-relaxed">
          {question}
        </h2>
        
        {hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <p className="text-yellow-800">💡 {hint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Input */}
      <div className="mb-8">
        {questionType === 'multiple_choice' && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <label
                key={index}
                className={`
                  flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedAnswer === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                  ${isSubmitted ? 'cursor-not-allowed opacity-75' : ''}
                `}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isSubmitted}
                  className="w-4 h-4 text-blue-600 mr-4"
                />
                <span className="text-gray-800 font-medium">{option}</span>
              </label>
            ))}
          </div>
        )}

        {questionType === 'true_false' && (
          <div className="flex gap-4">
            {['True', 'False'].map((option) => (
              <label
                key={option}
                className={`
                  flex-1 flex items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedAnswer === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                  ${isSubmitted ? 'cursor-not-allowed opacity-75' : ''}
                `}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isSubmitted}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <span className="text-xl font-semibold text-gray-800">
                  {option === 'True' ? '✓ True' : '✗ False'}
                </span>
              </label>
            ))}
          </div>
        )}

        {questionType === 'short_answer' && (
          <div>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your answer here..."
              className={`
                w-full p-4 border-2 rounded-lg resize-none transition-all duration-200
                ${textAnswer.trim() ? 'border-blue-500' : 'border-gray-300'}
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                ${isSubmitted ? 'cursor-not-allowed opacity-75 bg-gray-50' : ''}
              `}
              rows={4}
            />
            <div className="mt-2 text-sm text-gray-500">
              Character count: {textAnswer.length}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onSkip && (
          <button
            onClick={handleSkip}
            disabled={isSubmitted}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip Question
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || isSubmitted}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitted ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {timeLeft > 0 && isTimerActive && (
          <p>⏱️ Answer within {formatTime(timeLeft)} to earn full XP</p>
        )}
      </div>
    </div>
  );
};

export default StudyQuestion;