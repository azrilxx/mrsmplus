import React, { useState } from 'react';
import { StudyPlan, DayPlan, StudySlot, BloomLevel } from '../firebase/planner';

interface PlannerCalendarProps {
  plan: StudyPlan;
  onSlotComplete: (dayIndex: number, slotIndex: number, completed: boolean) => void;
  onSlotEdit?: (dayIndex: number, slotIndex: number, slot: StudySlot) => void;
  editable?: boolean;
}

const PlannerCalendar: React.FC<PlannerCalendarProps> = ({
  plan,
  onSlotComplete,
  onSlotEdit,
  editable = true
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getBloomColor = (bloom: BloomLevel): string => {
    switch (bloom) {
      case 'Recall': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Apply': return 'bg-green-100 text-green-800 border-green-200';
      case 'Analyze': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-red-50 border-red-200',
      'Science': 'bg-green-50 border-green-200',
      'English': 'bg-blue-50 border-blue-200',
      'History': 'bg-yellow-50 border-yellow-200',
      'Bahasa Malaysia': 'bg-purple-50 border-purple-200'
    };
    return colors[subject] || 'bg-gray-50 border-gray-200';
  };

  const getDifficultyIcon = (difficulty?: string): string => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐⭐';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTotalXPForDay = (day: DayPlan): number => {
    return day.slots.reduce((total, slot) => total + slot.expectedXP, 0);
  };

  const getCompletedXPForDay = (day: DayPlan): number => {
    return day.slots
      .filter(slot => slot.completed)
      .reduce((total, slot) => total + slot.expectedXP, 0);
  };

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Study Plan</h2>
            <p className="text-gray-600">
              Week of {formatDate(plan.weekStart)} • {plan.totalExpectedXP} XP Target
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-lg font-semibold text-gray-800">
              {plan.days.reduce((total, day) => total + getCompletedXPForDay(day), 0)} / {plan.totalExpectedXP} XP
            </div>
          </div>
        </div>

        {/* Week Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (plan.days.reduce((total, day) => total + getCompletedXPForDay(day), 0) / plan.totalExpectedXP) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Daily Plans */}
      {plan.days.map((day, dayIndex) => {
        const dayName = daysOfWeek[dayIndex];
        const totalXP = getTotalXPForDay(day);
        const completedXP = getCompletedXPForDay(day);
        const isExpanded = expandedDay === dayIndex;
        const hasSlots = day.slots.length > 0;

        return (
          <div key={dayIndex} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Day Header */}
            <div
              className={`p-6 cursor-pointer transition-colors ${
                hasSlots ? 'hover:bg-gray-50' : 'bg-gray-50'
              }`}
              onClick={() => hasSlots && setExpandedDay(isExpanded ? null : dayIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{dayName}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(day.date)} • {day.slots.length} sessions
                    </p>
                  </div>
                  {totalXP > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        {completedXP}/{totalXP} XP
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedXP / totalXP) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {hasSlots && (
                  <div className="text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                )}
              </div>
            </div>

            {/* Day Content */}
            {hasSlots && (isExpanded || day.slots.length <= 2) && (
              <div className="px-6 pb-6 space-y-4">
                {day.slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      slot.completed
                        ? 'bg-green-50 border-green-200'
                        : getSubjectColor(slot.subject)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {slot.subject}: {slot.topic}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBloomColor(slot.bloom)}`}>
                            {slot.bloom}
                          </span>
                          <span className="text-sm text-gray-600">
                            {getDifficultyIcon(slot.difficulty)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📅 {slot.time}</span>
                          <span>⚡ {slot.expectedXP} XP</span>
                          {slot.completed && <span className="text-green-600 font-medium">✅ Completed</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {editable && onSlotEdit && (
                          <button
                            onClick={() => onSlotEdit(dayIndex, slotIndex, slot)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit slot"
                          >
                            ✏️
                          </button>
                        )}
                        
                        <button
                          onClick={() => onSlotComplete(dayIndex, slotIndex, !slot.completed)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            slot.completed
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {slot.completed ? 'Completed' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasSlots && (
              <div className="px-6 pb-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🌟</div>
                  <p>Rest day - No sessions scheduled</p>
                  <p className="text-sm mt-1">Enjoy your break and recharge!</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bloom Taxonomy Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloomColor('Recall')}`}>
              Recall
            </span>
            <span className="text-sm text-gray-600">Review facts, definitions (15 XP)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloomColor('Apply')}`}>
              Apply
            </span>
            <span className="text-sm text-gray-600">Solve problems, practice (25 XP)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloomColor('Analyze')}`}>
              Analyze
            </span>
            <span className="text-sm text-gray-600">Critical thinking, analysis (40 XP)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerCalendar;