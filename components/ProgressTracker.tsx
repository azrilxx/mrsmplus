import React, { useState, useEffect } from 'react';
import { XPBadge } from './XPBadge';

interface ProgressTrackerProps {
  currentXP: number;
  xpGained: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalQuestions: number;
  subject: string;
  topic: string;
  sessionStartTime: Date;
  onSessionComplete?: () => void;
  showModal?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentXP,
  xpGained,
  questionsAnswered,
  correctAnswers,
  totalQuestions,
  subject,
  topic,
  sessionStartTime,
  onSessionComplete,
  showModal = false
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setSessionDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  useEffect(() => {
    if (showModal || (questionsAnswered === totalQuestions && totalQuestions > 0)) {
      setShowCompletionModal(true);
      checkForNewAchievements();
    }
  }, [showModal, questionsAnswered, totalQuestions]);

  const checkForNewAchievements = () => {
    const achievements: Achievement[] = [];
    const accuracyPercentage = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

    // Perfect Score Achievement
    if (correctAnswers === totalQuestions && totalQuestions > 0) {
      achievements.push({
        id: 'perfect_score',
        title: 'Perfect Score!',
        description: 'Answered all questions correctly',
        icon: '🎯',
        unlocked: true
      });
    }

    // Accuracy Achievements
    if (accuracyPercentage >= 90 && questionsAnswered >= 5) {
      achievements.push({
        id: 'excellence',
        title: 'Excellence',
        description: '90%+ accuracy achieved',
        icon: '⭐',
        unlocked: true
      });
    }

    // Speed Achievement
    if (sessionDuration > 0 && questionsAnswered > 0) {
      const avgTimePerQuestion = sessionDuration / questionsAnswered;
      if (avgTimePerQuestion <= 30) {
        achievements.push({
          id: 'speed_demon',
          title: 'Quick Thinker',
          description: 'Average under 30 seconds per question',
          icon: '⚡',
          unlocked: true
        });
      }
    }

    // XP Milestones
    if (currentXP >= 1000) {
      achievements.push({
        id: 'xp_master',
        title: 'XP Master',
        description: 'Reached 1000 XP',
        icon: '🏆',
        unlocked: true
      });
    }

    setNewAchievements(achievements);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyPercentage = () => {
    if (questionsAnswered === 0) return 0;
    return Math.round((correctAnswers / questionsAnswered) * 100);
  };

  const getMasteryLevel = () => {
    const accuracy = getAccuracyPercentage();
    if (accuracy >= 90) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (accuracy >= 75) return { level: 'Proficient', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (accuracy >= 60) return { level: 'Developing', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Learning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  const getEncouragementMessage = () => {
    const accuracy = getAccuracyPercentage();
    const isComplete = questionsAnswered === totalQuestions;
    
    if (isComplete) {
      if (accuracy === 100) return "Perfect! You've mastered this topic! 🎯";
      if (accuracy >= 90) return "Excellent work! You're really getting the hang of this! ⭐";
      if (accuracy >= 75) return "Great job! You're making solid progress! 💪";
      if (accuracy >= 60) return "Good effort! Keep practicing to improve! 📚";
      return "Nice try! Every mistake is a learning opportunity! 🌱";
    }
    
    return "Keep going! You're doing great! 🚀";
  };

  const mastery = getMasteryLevel();

  return (
    <>
      {/* Progress Tracker Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <XPBadge 
              currentXP={currentXP} 
              gainedXP={xpGained} 
              animate={xpGained > 0} 
              size="large"
            />
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Study Progress</h3>
              <p className="text-gray-600">{subject} • {topic}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${mastery.bg} ${mastery.color}`}>
              {mastery.level}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatDuration(sessionDuration)}
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{questionsAnswered}</div>
            <div className="text-sm text-blue-600">Answered</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-green-600">Correct</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{getAccuracyPercentage()}%</div>
            <div className="text-sm text-purple-600">Accuracy</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{questionsAnswered} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-center text-gray-700 font-medium">
          {getEncouragementMessage()}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h2>
                <p className="text-xl text-gray-600">Great work on your study session!</p>
              </div>

              {/* Session Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{correctAnswers}/{totalQuestions}</div>
                    <div className="text-blue-600 font-medium">Questions Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">+{xpGained}</div>
                    <div className="text-purple-600 font-medium">XP Earned</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-6 gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700">{getAccuracyPercentage()}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700">{formatDuration(sessionDuration)}</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${mastery.bg} ${mastery.color}`}>
                      {mastery.level}
                    </div>
                    <div className="text-sm text-gray-600">Mastery Level</div>
                  </div>
                </div>
              </div>

              {/* New Achievements */}
              {newAchievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">New Achievements! 🏆</h3>
                  <div className="space-y-3">
                    {newAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <div className="font-bold text-yellow-800">{achievement.title}</div>
                          <div className="text-yellow-700 text-sm">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Performance Insights</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {getAccuracyPercentage() >= 90 && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Excellent accuracy! You've really understood this topic.</span>
                    </div>
                  )}
                  {sessionDuration / questionsAnswered <= 30 && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">⚡</span>
                      <span>Quick thinking! You answered questions efficiently.</span>
                    </div>
                  )}
                  {correctAnswers > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">🎯</span>
                      <span>Keep practicing to maintain and improve your skills!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    if (onSessionComplete) onSessionComplete();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Continue Learning 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgressTracker;