import React from 'react';
import { LessonProgress } from '../../../types/dashboard';

interface LessonTrackerProps {
  lessons: LessonProgress[];
}

export const LessonTracker: React.FC<LessonTrackerProps> = ({ lessons }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Lesson Progress</h3>
      
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const completionPercentage = (lesson.completedLessons / lesson.totalLessons) * 100;
          
          return (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{lesson.subject}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      Last accessed {formatDate(lesson.lastAccessed)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {lesson.completedLessons}/{lesson.totalLessons}
                  </div>
                  <div className="text-sm text-gray-500">lessons</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completionPercentage.toFixed(0)}% complete
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};