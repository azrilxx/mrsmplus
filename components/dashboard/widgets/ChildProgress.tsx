import React from 'react';
import { ChildProgress as ChildProgressType } from '../../../types/dashboard';

interface ChildProgressProps {
  children: ChildProgressType[];
}

export const ChildProgress: React.FC<ChildProgressProps> = ({ children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">👶 Children Progress</h3>
      
      <div className="space-y-6">
        {children.map((child) => {
          const weeklyProgressPercentage = (child.weeklyProgress / child.weeklyGoal) * 100;
          const isGoalMet = weeklyProgressPercentage >= 100;
          
          return (
            <div key={child.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-800 text-lg">{child.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-medium">Level {child.level}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{child.currentXP.toLocaleString()} XP</span>
                  </div>
                </div>
                {isGoalMet && (
                  <div className="text-green-600 text-2xl">🎉</div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Weekly Goal Progress</span>
                  <span className={`text-sm font-medium ${isGoalMet ? 'text-green-600' : 'text-gray-600'}`}>
                    {child.weeklyProgress}/{child.weeklyGoal} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isGoalMet ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(weeklyProgressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {weeklyProgressPercentage.toFixed(0)}% of weekly goal
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">📚 Favorite Subjects</h5>
                  <div className="flex flex-wrap gap-1">
                    {child.favoriteSubjects.slice(0, 3).map((subject, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {subject}
                      </span>
                    ))}
                    {child.favoriteSubjects.length > 3 && (
                      <span className="text-xs text-gray-500">+{child.favoriteSubjects.length - 3} more</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">🏆 Recent Achievements</h5>
                  <div className="space-y-1">
                    {child.recentAchievements.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        {achievement}
                      </div>
                    ))}
                    {child.recentAchievements.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{child.recentAchievements.length - 2} more achievements
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {child.parentNotes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">📝 Parent Notes</h5>
                  <div className="space-y-1">
                    {child.parentNotes.slice(0, 2).map((note, index) => (
                      <div key={index} className="text-sm text-gray-600 italic">
                        "{note}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {children.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👶</div>
          <p>No children registered yet</p>
        </div>
      )}
    </div>
  );
};