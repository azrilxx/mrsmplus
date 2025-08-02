import React, { useState } from 'react';

interface SubjectCardProps {
  subject: string;
  icon: React.ReactNode;
  progress: number;
  isSelected?: boolean;
  hasWeakness?: boolean;
  isMastered?: boolean;
  formLevel?: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  icon,
  progress,
  isSelected = false,
  hasWeakness = false,
  isMastered = false,
  formLevel,
  onClick,
  size = 'medium',
  showProgress = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'p-4 min-h-[100px]',
    medium: 'p-6 min-h-[140px]',
    large: 'p-8 min-h-[180px]'
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'from-blue-400 to-blue-600',
      'Science': 'from-green-400 to-green-600',
      'English': 'from-purple-400 to-purple-600',
      'Bahasa Malaysia': 'from-red-400 to-red-600',
      'History': 'from-yellow-400 to-yellow-600',
      'Geography': 'from-teal-400 to-teal-600',
      'Physics': 'from-indigo-400 to-indigo-600',
      'Chemistry': 'from-pink-400 to-pink-600',
      'Biology': 'from-emerald-400 to-emerald-600'
    };
    return colors[subject as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getBackgroundClass = () => {
    if (isMastered) {
      return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-yellow-100';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400 shadow-blue-100';
    }
    if (hasWeakness) {
      return 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 shadow-red-100';
    }
    return 'bg-white border-2 border-gray-200 hover:border-gray-300';
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getBackgroundClass()}
        rounded-2xl shadow-lg cursor-pointer
        transform transition-all duration-300 ease-out
        ${isHovered || isSelected ? 'scale-105 shadow-xl' : 'hover:scale-102'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        relative overflow-hidden
        animate-float
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    >
      {/* Weakness Indicator */}
      {hasWeakness && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>
      )}

      {/* Mastery Shimmer */}
      {isMastered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20 -skew-x-12 animate-shimmer"></div>
      )}

      {/* Form Level Badge */}
      {formLevel && (
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded-full">
            F{formLevel}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center text-center h-full">
        {/* Icon Container */}
        <div
          className={`
            ${iconSizes[size]}
            mb-3 p-2 rounded-xl bg-gradient-to-br ${getSubjectColor(subject)}
            text-white shadow-lg
            transform transition-transform duration-200
            ${isHovered ? 'scale-110 rotate-3' : ''}
          `}
        >
          {icon}
        </div>

        {/* Subject Name */}
        <h3 className={`${textSizes[size]} font-bold text-gray-800 mb-2 leading-tight`}>
          {subject}
        </h3>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-semibold text-gray-800">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`
                  h-full bg-gradient-to-r ${getSubjectColor(subject)}
                  transition-all duration-1000 ease-out
                  ${isHovered ? 'animate-pulse' : ''}
                `}
                style={{ width: `${progress}%` }}
              >
                {progress > 0 && (
                  <div className="h-full bg-white bg-opacity-30 animate-wave"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {hasWeakness && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            Almost there! 💪
          </div>
        )}
        
        {isMastered && (
          <div className="mt-2 text-xs text-yellow-600 font-medium flex items-center gap-1">
            <span>Mastered!</span>
            <span className="animate-bounce">🏆</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Subject Icons Components
export const MathIcon = () => (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

export const ScienceIcon = () => (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 2v6l-2 2v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V10l-2-2V2H9zm2 2h2v6.17l2 2V20H9v-9.83l2-2V4z"/>
  </svg>
);

export const EnglishIcon = () => (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

export const HistoryIcon = () => (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 3c4.97 0 9 4.03 9 9H20c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.87 3.13 7 7 7c1.93 0 3.68-.79 4.95-2.05l-1.41-1.41C15.68 16.4 14.38 17 13 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5h-2l3 3 3-3h-2c0-5.97-4.03-11-9-11z"/>
  </svg>
);

export const BMIcon = () => (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default SubjectCard;