import React from 'react';
import { MotivationCard } from '../../../types/dashboard';

interface EngagementTipsProps {
  motivationCards: MotivationCard[];
  maxCards?: number;
}

export const EngagementTips: React.FC<EngagementTipsProps> = ({ 
  motivationCards, 
  maxCards = 3 
}) => {
  const displayCards = motivationCards.slice(0, maxCards);

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'praise': return '🎉';
      case 'encouragement': return '💪';
      case 'tip': return '💡';
      case 'achievement': return '🏆';
      default: return '📝';
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'praise': return 'bg-green-50 border-green-200 text-green-800';
      case 'encouragement': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'tip': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'achievement': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Engagement Tips & Updates</h3>
      
      <div className="space-y-4">
        {displayCards.map((card) => (
          <div key={card.id} className={`border rounded-lg p-4 ${getCardColor(card.type)}`}>
            <div className="flex items-start">
              <div className="text-2xl mr-3 mt-1">
                {getCardIcon(card.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{card.title}</h4>
                  <span className="text-xs opacity-75">
                    {formatDate(card.dateCreated)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {card.message}
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                    {card.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💡</div>
          <p>No tips or updates yet</p>
          <p className="text-sm">Check back for personalized engagement insights!</p>
        </div>
      )}
      
      {motivationCards.length > maxCards && (
        <div className="mt-4 pt-4 border-t text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all {motivationCards.length} tips →
          </button>
        </div>
      )}
    </div>
  );
};