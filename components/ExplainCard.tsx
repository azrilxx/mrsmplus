import React, { useState, useEffect } from 'react';

interface ExplainCardProps {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  onClose: () => void;
  isLoading?: boolean;
  subject?: string;
  topic?: string;
}

export const ExplainCard: React.FC<ExplainCardProps> = ({
  question,
  correctAnswer,
  userAnswer,
  explanation,
  onClose,
  isLoading = false,
  subject,
  topic
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);

  useEffect(() => {
    if (!isLoading && explanation) {
      setDisplayedText('');
      setIsTyping(true);
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < explanation.length) {
          setDisplayedText(explanation.slice(0, index + 1));
          index++;
          
          // Show skip button after 1 second of typing
          if (index > 30 && !showSkipButton) {
            setShowSkipButton(true);
          }
        } else {
          clearInterval(timer);
          setIsTyping(false);
          setShowSkipButton(false);
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [explanation, isLoading]);

  const skipTypewriter = () => {
    setDisplayedText(explanation);
    setIsTyping(false);
    setShowSkipButton(false);
  };

  const getSubjectIcon = (subjectName?: string) => {
    switch (subjectName?.toLowerCase()) {
      case 'mathematics': return '📐';
      case 'science': return '🔬';
      case 'english': return '📚';
      case 'computer_science': return '💻';
      case 'bahasa_malaysia': return '🇲🇾';
      default: return '🎯';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center gap-3 text-blue-600">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Generating explanation...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getSubjectIcon(subject)}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">AI Explanation</h2>
                {subject && topic && (
                  <p className="text-sm text-gray-600">{subject} • {topic}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Recap */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Question</h3>
            <p className="text-gray-700">{question}</p>
          </div>

          {/* Answer Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border-l-4 border-red-400 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">Your Answer</h3>
              <p className="text-red-700">{userAnswer || 'No answer provided'}</p>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-green-400 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Correct Answer</h3>
              <p className="text-green-700">{correctAnswer}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Detailed Explanation
              </h3>
              
              {showSkipButton && isTyping && (
                <button
                  onClick={skipTypewriter}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  Skip ⏭️
                </button>
              )}
            </div>
            
            <div className="relative">
              <p className="text-blue-800 leading-relaxed text-lg whitespace-pre-wrap">
                {displayedText}
              </p>
              
              {isTyping && (
                <span className="inline-block w-2 h-6 bg-blue-600 ml-1 animate-pulse" />
              )}
            </div>
          </div>

          {/* Learning Tips */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="text-lg mr-2">💡</span>
              Key Learning Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Break down complex problems into smaller steps</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Look for patterns and connections</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Practice similar problems to reinforce learning</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Don't hesitate to ask for help when needed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Got it! Continue studying 📚
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p className="flex items-center justify-center gap-2">
              <span>🤖</span>
              AI-powered explanation • Designed to help you learn better
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainCard;