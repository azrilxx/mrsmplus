import React from 'react';
import { XPProgress as XPProgressType } from '../../../types/dashboard';

interface XPProgressProps {
  data: XPProgressType;
  showWeeklyProgress?: boolean;
}

export const XPProgress: React.FC<XPProgressProps> = ({ 
  data, 
  showWeeklyProgress = true 
}) => {
  const progressPercentage = ((data.currentXP % 1000) / 1000) * 100;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">XP Progress</h3>
        <div className="flex items-center">
          <span className="text-2xl mr-2">⭐</span>
          <span className="text-xl font-bold text-blue-600">Level {data.level}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{data.currentXP} XP</span>
          <span>{data.xpToNextLevel} XP to next level</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-gray-800">{data.totalXP.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total XP</div>
        </div>
        {showWeeklyProgress && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">+{data.weeklyProgress}</div>
            <div className="text-sm text-gray-500">This week</div>
          </div>
        )}
      </div>
    </div>
  );
};