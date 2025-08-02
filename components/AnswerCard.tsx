import React, { useState, useEffect } from 'react';

interface AnswerStep {
  id: string;
  title: string;
  content: string;
  completed?: boolean;
}

interface AnswerCardProps {
  question: string;
  answer: string;
  steps?: AnswerStep[];
  subject?: string;
  xpEarned?: number;
  relatedTopics?: string[];
  onRetry?: () => void;
  onAddToStudyPlan?: () => void;
  isLoading?: boolean;
  showTypewriter?: boolean;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  question,
  answer,
  steps = [],
  subject,
  xpEarned = 10,
  relatedTopics = [],
  onRetry,
  onAddToStudyPlan,
  isLoading = false,
  showTypewriter = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showStudyPlanPrompt, setShowStudyPlanPrompt] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (showTypewriter && answer) {
      setDisplayedText('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < answer.length) {
          setDisplayedText(answer.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          // Show study plan prompt after answer is complete
          setTimeout(() => setShowStudyPlanPrompt(true), 3000);
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setDisplayedText(answer);
      setTimeout(() => setShowStudyPlanPrompt(true), 3000);
    }
  }, [answer, showTypewriter]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const skipTypewriter = () => {
    setDisplayedText(answer);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Answer Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {subject && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {subject}
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-800">AI Answer</h3>
            </div>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                title="Retry question"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <p className="text-gray-700 font-medium">{question}</p>
        </div>

        {/* Answer Content */}
        <div className="px-6 py-6">
          <div className="relative">
            <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
              {displayedText}
            </p>
            
            {/* Skip typewriter button */}
            {showTypewriter && displayedText !== answer && (
              <button
                onClick={skipTypewriter}
                className="absolute top-0 right-0 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
          </div>

          {/* Steps */}
          {steps.length > 0 && (
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Step-by-step solution:</h4>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`
                    p-4 rounded-lg border-l-4 transition-all duration-300
                    ${completedSteps.has(step.id) 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-blue-400 bg-blue-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleStepComplete(step.id)}
                      className={`
                        mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center
                        transition-all duration-200
                        ${completedSteps.has(step.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                        }
                      `}
                    >
                      {completedSteps.has(step.id) && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-2">{step.title}</h5>
                      <p className="text-gray-700">{step.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* XP Reward */}
      {xpEarned > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <span className="text-lg font-semibold">+{xpEarned} XP Earned! Hebat!</span>
          </div>
        </div>
      )}

      {/* Related Topics */}
      {relatedTopics.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Related Topics to Explore:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTopics.map((topic, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <span className="text-blue-800 font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Plan Prompt */}
      {showStudyPlanPrompt && onAddToStudyPlan && (
        <div
          className={`
            bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-xl shadow-lg
            transform transition-all duration-500 ease-out
            ${showStudyPlanPrompt ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Ready to dive deeper?</h4>
              <p className="text-purple-100">Add this topic to your personalized study plan!</p>
            </div>
            <button
              onClick={onAddToStudyPlan}
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg"
            >
              Add to Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerCard;