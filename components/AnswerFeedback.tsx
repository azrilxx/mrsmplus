import React, { useState, useEffect } from 'react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  xpEarned: number;
  onContinue: () => void;
  onExplain?: () => void;
  onRetryQuestion?: () => void;
  questionNumber: number;
  totalQuestions: number;
  encouragementMessage?: string;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  userAnswer,
  correctAnswer,
  explanation,
  xpEarned,
  onContinue,
  onExplain,
  onRetryQuestion,
  questionNumber,
  totalQuestions,
  encouragementMessage
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    if (isCorrect && xpEarned > 0) {
      const timer = setTimeout(() => {
        setShowXPAnimation(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, xpEarned]);

  const getEncouragement = () => {
    if (encouragementMessage) return encouragementMessage;
    
    if (isCorrect) {
      const correctMessages = [
        "Hebat! Excellent work! 🌟",
        "Bagus sekali! Keep it up! 💪",
        "Perfect! You're on fire! 🔥",
        "Outstanding! Well done! ⭐",
        "Brilliant answer! 🎯",
        "Fantastic! You got it right! 🚀"
      ];
      return correctMessages[Math.floor(Math.random() * correctMessages.length)];
    } else {
      const incorrectMessages = [
        "Don't worry, you're learning! Keep trying! 💪",
        "Mistakes help us grow. You've got this! 🌱",
        "Great effort! Let's learn from this! 📚",
        "No worries, practice makes perfect! ✨",
        "Good try! Every mistake is a step forward! 🎯",
        "Keep going! You're doing great! 🌟"
      ];
      return incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
    }
  };

  const getProgressMessage = () => {
    const remaining = totalQuestions - questionNumber;
    if (remaining === 0) {
      return "🎉 Study session complete!";
    } else if (remaining === 1) {
      return "🏁 One more question to go!";
    } else {
      return `📚 ${remaining} questions remaining`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Feedback Card */}
      <div
        className={`
          bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500
          ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        {/* Result Header */}
        <div className="text-center mb-6">
          <div
            className={`
              inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
              ${isCorrect 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
              }
            `}
          >
            {isCorrect ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <h2 className={`
            text-3xl font-bold mb-2
            ${isCorrect ? 'text-green-600' : 'text-red-600'}
          `}>
            {isCorrect ? 'Correct!' : 'Not quite right'}
          </h2>
          
          <p className="text-xl text-gray-600">
            {getEncouragement()}
          </p>
        </div>

        {/* Answer Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`
            p-4 rounded-lg border-l-4
            ${isCorrect 
              ? 'border-green-400 bg-green-50' 
              : 'border-red-400 bg-red-50'
            }
          `}>
            <h3 className="font-semibold text-gray-800 mb-2">Your Answer</h3>
            <p className={`
              ${isCorrect ? 'text-green-800' : 'text-red-800'}
              font-medium
            `}>
              {userAnswer || 'No answer provided'}
            </p>
          </div>
          
          {!isCorrect && (
            <div className="p-4 rounded-lg border-l-4 border-green-400 bg-green-50">
              <h3 className="font-semibold text-gray-800 mb-2">Correct Answer</h3>
              <p className="text-green-800 font-medium">
                {correctAnswer}
              </p>
            </div>
          )}
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Explanation
            </h3>
            <p className="text-blue-800 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Progress Info */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-gray-600 text-sm">
              {getProgressMessage()}
            </span>
          </div>
          
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isCorrect && onRetryQuestion && (
            <button
              onClick={onRetryQuestion}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              🔄 Retry Question
            </button>
          )}
          
          {onExplain && !explanation && (
            <button
              onClick={onExplain}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
            >
              💡 Get Explanation
            </button>
          )}
          
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            {questionNumber >= totalQuestions ? '🎯 Finish Session' : '➡️ Next Question'}
          </button>
        </div>
      </div>

      {/* XP Reward Animation */}
      {isCorrect && xpEarned > 0 && (
        <div
          className={`
            bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-lg transform transition-all duration-700
            ${showXPAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-ping"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      transform: `rotate(${i * 60}deg) translateY(-20px)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">+{xpEarned} XP Earned!</div>
              <div className="text-yellow-100">Great job on getting it right!</div>
            </div>
            
            <div className="relative">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Tips */}
      {!isCorrect && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-lg mr-2">💡</span>
            Study Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Review the question carefully and look for key terms</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Don't worry about mistakes - they help you learn!</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Use hints when available to guide your thinking</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Practice similar questions to build confidence</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerFeedback;