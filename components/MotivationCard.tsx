import React from 'react';
import { MotivationCardData } from '../firebase/parentDashboard';

interface MotivationCardProps {
  card: MotivationCardData;
  className?: string;
}

const MotivationCard: React.FC<MotivationCardProps> = ({ card, className = '' }) => {
  const getCardColor = (color: 'green' | 'blue' | 'yellow' | 'purple') => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getHeaderColor = (color: 'green' | 'blue' | 'yellow' | 'purple') => {
    switch (color) {
      case 'green':
        return 'text-green-800';
      case 'blue':
        return 'text-blue-800';
      case 'yellow':
        return 'text-yellow-800';
      case 'purple':
        return 'text-purple-800';
      default:
        return 'text-gray-800';
    }
  };

  const getActionColor = (color: 'green' | 'blue' | 'yellow' | 'purple') => {
    switch (color) {
      case 'green':
        return 'text-green-700 bg-green-100 hover:bg-green-200';
      case 'blue':
        return 'text-blue-700 bg-blue-100 hover:bg-blue-200';
      case 'yellow':
        return 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200';
      case 'purple':
        return 'text-purple-700 bg-purple-100 hover:bg-purple-200';
      default:
        return 'text-gray-700 bg-gray-100 hover:bg-gray-200';
    }
  };

  const getTypeIcon = (type: 'praise' | 'boost' | 'restart' | 'milestone') => {
    switch (type) {
      case 'praise':
        return '🌟';
      case 'boost':
        return '💪';
      case 'restart':
        return '🔄';
      case 'milestone':
        return '🏆';
      default:
        return '📚';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getCardColor(card.color)} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{card.emoji}</span>
          <h4 className={`font-semibold ${getHeaderColor(card.color)}`}>
            {card.title}
          </h4>
        </div>
        <span className="text-lg">{getTypeIcon(card.type)}</span>
      </div>
      
      <p className="text-sm mb-3 leading-relaxed">
        {card.message}
      </p>
      
      {card.actionSuggestion && (
        <div className={`text-xs p-3 rounded-md ${getActionColor(card.color)} transition-colors duration-200`}>
          <div className="font-medium mb-1">💡 Suggestion:</div>
          <div>{card.actionSuggestion}</div>
        </div>
      )}
    </div>
  );
};

interface MotivationCardsGroupProps {
  cards: MotivationCardData[];
  title?: string;
  className?: string;
}

export const MotivationCardsGroup: React.FC<MotivationCardsGroupProps> = ({ 
  cards, 
  title = "💡 Motivation & Insights",
  className = ''
}) => {
  if (cards.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💡</div>
          <div>No insights available yet</div>
          <div className="text-sm">Insights will appear based on your child's learning patterns</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {cards.map((card, index) => (
          <MotivationCard 
            key={`${card.type}-${index}`} 
            card={card}
          />
        ))}
      </div>
      
      {cards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 flex items-center">
            <span className="mr-2">🤖</span>
            These insights are generated based on your child's learning patterns and activity.
          </div>
        </div>
      )}
    </div>
  );
};

export default MotivationCard;