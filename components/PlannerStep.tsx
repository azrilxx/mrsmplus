import React, { useState } from 'react';

interface PlannerStepProps {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  isCompleted?: boolean;
  isLocked?: boolean;
  isDraggable?: boolean;
  dayOfWeek?: string;
  timeSlot?: string;
  description?: string;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const PlannerStep: React.FC<PlannerStepProps> = ({
  id,
  title,
  subject,
  difficulty,
  estimatedTime,
  isCompleted = false,
  isLocked = false,
  isDraggable = false,
  dayOfWeek,
  timeSlot,
  description,
  onComplete,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyConfig = (difficulty: 'easy' | 'medium' | 'hard') => {
    const configs = {
      easy: {
        color: 'from-green-400 to-green-600',
        textColor: 'text-green-800',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '😊',
        label: 'Easy'
      },
      medium: {
        color: 'from-yellow-400 to-orange-500',
        textColor: 'text-orange-800',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: '😐',
        label: 'Medium'
      },
      hard: {
        color: 'from-red-400 to-red-600',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '😤',
        label: 'Hard'
      }
    };
    return configs[difficulty] || configs.medium;
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'Science': 'bg-green-100 text-green-800 border-green-200',
      'English': 'bg-purple-100 text-purple-800 border-purple-200',
      'Bahasa Malaysia': 'bg-red-100 text-red-800 border-red-200',
      'History': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Geography': 'bg-teal-100 text-teal-800 border-teal-200',
      'Physics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Chemistry': 'bg-pink-100 text-pink-800 border-pink-200',
      'Biology': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const difficultyConfig = getDifficultyConfig(difficulty);
  const subjectColorClass = getSubjectColor(subject);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e, id);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
        ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragging ? 'opacity-75 scale-105 rotate-2' : ''}
        ${isHovered && !isLocked ? 'scale-102 shadow-lg' : 'shadow-md'}
        ${isDraggable && !isLocked ? 'hover:shadow-xl' : ''}
      `}
      draggable={isDraggable && !isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      {isDraggable && !isLocked && (
        <div className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 18h8v-2H8v2zM8 13h8v-2H8v2zM8 8h8V6H8v2z"/>
          </svg>
        </div>
      )}

      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      )}

      {/* Completion Checkbox */}
      {!isLocked && (
        <div
          className="absolute top-3 left-3 cursor-pointer"
          onClick={() => onComplete?.(id)}
        >
          <div
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isCompleted 
                ? 'bg-green-500 border-green-500 text-white scale-110' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }
            `}
          >
            {isCompleted && (
              <svg className="w-4 h-4 animate-bounce-in" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="ml-10 mr-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3
            className={`
              text-lg font-semibold leading-tight
              ${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}
            `}
          >
            {title}
          </h3>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Subject Tag */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${subjectColorClass}`}>
            {subject}
          </span>

          {/* Difficulty Tag */}
          <span
            className={`
              px-2 py-1 text-xs font-medium rounded-full border
              ${difficultyConfig.bgColor} ${difficultyConfig.textColor} ${difficultyConfig.borderColor}
            `}
          >
            <span className="mr-1">{difficultyConfig.icon}</span>
            {difficultyConfig.label}
          </span>

          {/* Time Estimate */}
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            ⏱️ {formatTime(estimatedTime)}
          </span>
        </div>

        {/* Schedule Info */}
        {(dayOfWeek || timeSlot) && (
          <div className="mb-3 text-sm text-gray-600">
            {dayOfWeek && <span className="font-medium">{dayOfWeek}</span>}
            {dayOfWeek && timeSlot && <span className="mx-2">•</span>}
            {timeSlot && <span>{timeSlot}</span>}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Actions */}
        {!isLocked && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completion Ripple Effect */}
      {isCompleted && (
        <div className="absolute inset-0 bg-green-400 opacity-20 rounded-xl animate-ping"></div>
      )}

      {/* Wobble Effect for Dragging */}
      {isDraggable && isHovered && !isLocked && (
        <div className="absolute inset-0 bg-blue-400 opacity-10 rounded-xl animate-pulse"></div>
      )}
    </div>
  );
};

export default PlannerStep;