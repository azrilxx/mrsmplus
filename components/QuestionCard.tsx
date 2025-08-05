import React, { useState, useEffect } from 'react';

interface QuestionCardProps {
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  xpValue: number;
  onAnswerSubmit: (answer: string, isCorrect: boolean, xpEarned: number) => void;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  type,
  options = [],
  correctAnswer,
  explanation,
  xpValue,
  onAnswerSubmit,
  questionNumber,
  totalQuestions,
  timeLimit = 60
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsTimerActive(true);
    setIsSubmitted(false);
    setSelectedAnswer('');
    setTextAnswer('');
  }, [question, timeLimit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0 && !isSubmitted) {
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
  }, [isTimerActive, timeLeft, isSubmitted]);

  const handleTimeUp = () => {
    if (isSubmitted) return;
    
    const currentAnswer = type === 'short_answer' ? textAnswer : selectedAnswer;
    if (currentAnswer.trim()) {
      handleSubmit();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    setIsSubmitted(true);
    setIsTimerActive(false);
    
    let userAnswer = '';
    let isCorrect = false;

    if (type === 'multiple_choice') {
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === correctAnswer;
    } else {
      userAnswer = textAnswer.trim();
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }

    // Award full XP for correct answers, partial XP for attempts
    const xpEarned = isCorrect ? xpValue : Math.floor(xpValue * 0.2);
    
    onAnswerSubmit(userAnswer, isCorrect, xpEarned);
  };

  const canSubmit = () => {
    if (type === 'short_answer') {
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
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Worth {xpValue} XP
        </div>
      </div>

      {/* Answer Input */}
      <div className="mb-8">
        {type === 'multiple_choice' && (
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
                <span className="text-gray-800 font-medium">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </label>
            ))}
          </div>
        )}

        {type === 'short_answer' && (
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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && canSubmit()) {
                  handleSubmit();
                }
              }}
            />
            <div className="mt-2 text-sm text-gray-500">
              Character count: {textAnswer.length} • Press Ctrl+Enter to submit
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || isSubmitted}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-48"
        >
          {isSubmitted ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {timeLeft > 0 && isTimerActive && !isSubmitted && (
          <p>⏱️ Answer within {formatTime(timeLeft)} to earn full XP</p>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;