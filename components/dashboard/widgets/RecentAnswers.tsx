import React from 'react';
import { RecentAnswer } from '../../../types/dashboard';

interface RecentAnswersProps {
  answers: RecentAnswer[];
  maxItems?: number;
}

export const RecentAnswers: React.FC<RecentAnswersProps> = ({ 
  answers, 
  maxItems = 5 
}) => {
  const displayAnswers = answers.slice(0, maxItems);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Recent Answers</h3>
      
      <div className="space-y-3">
        {displayAnswers.map((answer) => (
          <div key={answer.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm font-medium text-gray-600">{answer.subject}</span>
                  <span className="text-xs text-gray-400">{formatTime(answer.timestamp)}</span>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm text-gray-800 font-medium mb-1">
                    Q: {truncateText(answer.question)}
                  </div>
                  <div className="text-sm text-gray-600">
                    A: {truncateText(answer.answer)}
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-3">
                <div className={`text-sm font-bold ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {answer.isCorrect ? '✓' : '✗'}
                </div>
                {answer.isCorrect && (
                  <div className="text-xs text-blue-600 font-medium">
                    +{answer.xpEarned} XP
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {displayAnswers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No recent answers yet</p>
            <p className="text-sm">Start answering questions to see your progress here!</p>
          </div>
        )}
      </div>
    </div>
  );
};