import React from 'react';
import { StudyReflection } from '../firebase/queries';

interface ReflectionStripProps {
  reflections: StudyReflection[];
  title?: string;
  className?: string;
  maxDisplay?: number;
}

const ReflectionStrip: React.FC<ReflectionStripProps> = ({ 
  reflections, 
  title = "📝 Recent Reflections",
  className = '',
  maxDisplay = 3
}) => {
  const getMoodColor = (mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'struggling') => {
    switch (mood) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'struggling':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodEmoji = (mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'struggling') => {
    switch (mood) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '😊';
      case 'neutral':
        return '😐';
      case 'poor':
        return '😟';
      case 'struggling':
        return '😔';
      default:
        return '🤔';
    }
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 8) return 'text-green-600';
    if (level >= 6) return 'text-blue-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const displayReflections = reflections.slice(0, maxDisplay);

  if (reflections.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <div>No reflections yet</div>
          <div className="text-sm">Reflections will appear as your child logs their study sessions</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600">
          {reflections.length} reflection{reflections.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4">
        {displayReflections.map((reflection, index) => (
          <div key={reflection.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(reflection.mood)}`}>
                  <span className="mr-1">{getMoodEmoji(reflection.mood)}</span>
                  {reflection.mood.charAt(0).toUpperCase() + reflection.mood.slice(1)}
                </div>
                <div className={`ml-3 font-semibold ${getConfidenceColor(reflection.confidenceLevel)}`}>
                  {reflection.confidenceLevel}/10 confidence
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(reflection.date)}
              </div>
            </div>
            
            {reflection.insights && reflection.insights.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">💡 Insights:</div>
                <div className="text-sm text-gray-600">
                  {reflection.insights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="flex items-start mb-1">
                      <span className="mr-2">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                  {reflection.insights.length > 2 && (
                    <div className="text-xs text-gray-500 ml-4">
                      +{reflection.insights.length - 2} more insight{reflection.insights.length - 2 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {reflection.strengths && reflection.strengths.length > 0 && (
                <div>
                  <div className="font-medium text-green-700 mb-1">✅ Strengths:</div>
                  <div className="text-gray-600">
                    {reflection.strengths.slice(0, 1).map((strength, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{strength}</span>
                      </div>
                    ))}
                    {reflection.strengths.length > 1 && (
                      <div className="text-xs text-gray-500 ml-4">
                        +{reflection.strengths.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {reflection.areasForImprovement && reflection.areasForImprovement.length > 0 && (
                <div>
                  <div className="font-medium text-orange-700 mb-1">🎯 Areas to improve:</div>
                  <div className="text-gray-600">
                    {reflection.areasForImprovement.slice(0, 1).map((area, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{area}</span>
                      </div>
                    ))}
                    {reflection.areasForImprovement.length > 1 && (
                      <div className="text-xs text-gray-500 ml-4">
                        +{reflection.areasForImprovement.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {reflections.length > maxDisplay && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 py-2 px-4 bg-gray-50 rounded-lg">
            + {reflections.length - maxDisplay} more reflection{reflections.length - maxDisplay !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      {reflections.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 flex items-center">
            <span className="mr-2">📊</span>
            Reflections help track learning progress and identify patterns in study habits.
          </div>
        </div>
      )}
    </div>
  );
};

interface ReflectionSummaryProps {
  reflections: StudyReflection[];
  className?: string;
}

export const ReflectionSummary: React.FC<ReflectionSummaryProps> = ({ 
  reflections, 
  className = '' 
}) => {
  if (reflections.length === 0) return null;

  const avgConfidence = reflections.reduce((sum, r) => sum + r.confidenceLevel, 0) / reflections.length;
  const moodCounts = reflections.reduce((acc, r) => {
    acc[r.mood] = (acc[r.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  )[0] as 'excellent' | 'good' | 'neutral' | 'poor' | 'struggling';

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">📈 Reflection Summary</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Average Confidence</div>
          <div className="text-lg font-semibold text-blue-600">
            {avgConfidence.toFixed(1)}/10
          </div>
        </div>
        <div>
          <div className="text-gray-600">Most Common Mood</div>
          <div className="text-lg font-semibold text-purple-600 capitalize">
            {mostCommonMood}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionStrip;