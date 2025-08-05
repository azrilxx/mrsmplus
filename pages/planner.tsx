import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import PlannerCalendar from '../components/PlannerCalendar';
import XPBadge from '../components/XPBadge';
import { StudySlot } from '../firebase/planner';

const StudyPlannerPage: React.FC = () => {
  const { user } = useAuth();
  const {
    currentPlan,
    loading,
    error,
    generatePlan,
    updatePlan,
    markSlotComplete,
    refreshPlan
  } = useSmartPlanner(user?.uid);

  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [gainedXP, setGainedXP] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle slot completion with XP animation
  const handleSlotComplete = async (dayIndex: number, slotIndex: number, completed: boolean) => {
    if (!user?.uid) return;

    const success = await markSlotComplete(dayIndex, slotIndex, completed);
    if (success && currentPlan && completed) {
      const slot = currentPlan.days[dayIndex].slots[slotIndex];
      setGainedXP(slot.expectedXP);
      setShowXPAnimation(true);
      
      setTimeout(() => {
        setShowXPAnimation(false);
      }, 2000);
    }
  };

  // Handle slot editing
  const handleSlotEdit = (dayIndex: number, slotIndex: number, slot: StudySlot) => {
    console.log('Edit slot:', dayIndex, slotIndex, slot);
    // TODO: Implement slot editing modal
  };

  // Generate new plan
  const handleGeneratePlan = async () => {
    if (!user?.uid) return;

    setIsGenerating(true);
    try {
      await generatePlan(user.uid, {
        targetSessionsPerWeek: 12,
        maxSessionsPerDay: 3,
        preferredStudyTimes: ['16:00', '19:00', '20:00'],
        avoidWeekends: false
      });
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate current XP from student progress
  const getCurrentXP = () => {
    if (!currentPlan) return 0;
    return currentPlan.days.reduce((total, day) => 
      total + day.slots.filter(slot => slot.completed).reduce((dayTotal, slot) => dayTotal + slot.expectedXP, 0), 0
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Study Planner</h1>
          <p className="text-gray-600">Please log in to access your personalized study plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Study Planner</h1>
              <p className="text-gray-600 mt-1">Cognitive Smart Study Planner powered by MARA+</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Plan Actions */}
              <div className="flex items-center gap-3">
                {!currentPlan && (
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Plan'}
                  </button>
                )}
                
                {currentPlan && (
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? 'Updating...' : 'Update Plan'}
                  </button>
                )}
              </div>

              {/* XP Badge */}
              <XPBadge
                currentXP={getCurrentXP()}
                gainedXP={gainedXP}
                animate={showXPAnimation}
                size="large"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your study plan...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Plan State */}
        {!loading && !currentPlan && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Create Your Smart Study Plan?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our AI will analyze your learning patterns, fatigue levels, and performance data to create 
              a personalized weekly study schedule optimized for your success.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg font-semibold"
            >
              {isGenerating ? 'Generating Your Plan...' : 'Generate My Study Plan'}
            </button>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Performance Analysis</h3>
                <p className="text-gray-600 text-sm">Analyzes your XP history and question performance to identify weak areas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🕒</div>
                <h3 className="font-semibold text-gray-800 mb-2">Optimal Timing</h3>
                <p className="text-gray-600 text-sm">Uses your mood logs to schedule sessions when you're most focused</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Bloom Taxonomy</h3>
                <p className="text-gray-600 text-sm">Balances Recall, Apply, and Analyze activities for comprehensive learning</p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Display */}
        {currentPlan && !loading && (
          <PlannerCalendar
            plan={currentPlan}
            onSlotComplete={handleSlotComplete}
            onSlotEdit={handleSlotEdit}
            editable={true}
          />
        )}
      </div>
    </div>
  );
};

export default StudyPlannerPage;