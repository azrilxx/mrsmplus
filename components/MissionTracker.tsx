import React, { useState } from 'react';
import { Mission } from '../firebase/gamification';

interface MissionTrackerProps {
  missions: Mission[];
  onMissionComplete?: (missionId: string) => void;
  compact?: boolean;
}

export const MissionTracker: React.FC<MissionTrackerProps> = ({
  missions = [],
  onMissionComplete,
  compact = false
}) => {
  const [completingMission, setCompletingMission] = useState<string | null>(null);

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = {
      math: '📐',
      science: '🔬',
      english: '📚',
      ict: '💻',
      bm: '🇲🇾',
      general: '🎯'
    };
    return icons[subject] || '📖';
  };

  const getMissionTypeColor = (type: Mission['type']) => {
    switch (type) {
      case 'questions':
        return 'bg-blue-500';
      case 'xp':
        return 'bg-green-500';
      case 'streak':
        return 'bg-orange-500';
      case 'subject_focus':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleMissionClick = async (mission: Mission) => {
    if (mission.completed || !onMissionComplete) return;
    
    if (mission.progress >= mission.goal) {
      setCompletingMission(mission.id);
      try {
        await onMissionComplete(mission.id);
      } catch (error) {
        console.error('Error completing mission:', error);
      } finally {
        setCompletingMission(null);
      }
    }
  };

  const formatMissionGoal = (mission: Mission) => {
    switch (mission.type) {
      case 'questions':
        return `${mission.progress}/${mission.goal} questions`;
      case 'xp':
        return `${mission.progress}/${mission.goal} XP`;
      case 'streak':
        return `${mission.progress}/${mission.goal} days`;
      case 'subject_focus':
        return `${mission.progress}/${mission.goal} ${mission.subject} sessions`;
      default:
        return `${mission.progress}/${mission.goal}`;
    }
  };

  if (missions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎯</div>
        <div className="text-gray-500">No missions available</div>
        <div className="text-sm text-gray-400">Check back tomorrow for new challenges!</div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {missions.map((mission) => {
          const progressPercentage = Math.min((mission.progress / mission.goal) * 100, 100);
          const isCompleted = mission.completed;
          const canComplete = mission.progress >= mission.goal && !isCompleted;
          
          return (
            <div
              key={mission.id}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                ${isCompleted 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : canComplete
                    ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer'
                    : 'bg-white border-gray-200'
                }
              `}
              onClick={() => handleMissionClick(mission)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSubjectIcon(mission.subject)}</span>
                  <div>
                    <div className="font-medium text-sm">{mission.title}</div>
                    <div className="text-xs text-gray-500">{formatMissionGoal(mission)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isCompleted ? (
                    <div className="text-green-600 text-sm font-medium">✓ Complete</div>
                  ) : canComplete ? (
                    <button 
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-yellow-600 transition-colors"
                      disabled={completingMission === mission.id}
                    >
                      {completingMission === mission.id ? '...' : 'Claim'}
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500">+{mission.rewardXP} XP</div>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getMissionTypeColor(mission.type)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-xl font-bold text-gray-800">Daily Missions</h3>
        </div>
        <div className="text-sm text-gray-500">
          {missions.filter(m => m.completed).length}/{missions.length} Complete
        </div>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => {
          const progressPercentage = Math.min((mission.progress / mission.goal) * 100, 100);
          const isCompleted = mission.completed;
          const canComplete = mission.progress >= mission.goal && !isCompleted;
          
          return (
            <div
              key={mission.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : canComplete
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-md cursor-pointer transform hover:scale-102'
                    : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
                }
              `}
              onClick={() => handleMissionClick(mission)}
            >
              {/* Mission Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                    ${getMissionTypeColor(mission.type)} bg-opacity-20
                  `}>
                    {getSubjectIcon(mission.subject)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{mission.title}</h4>
                    <p className="text-sm text-gray-600 capitalize">{mission.subject} • {mission.type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {isCompleted ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <span className="text-lg">✅</span>
                      <span className="font-medium">Complete!</span>
                    </div>
                  ) : canComplete ? (
                    <button 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      disabled={completingMission === mission.id}
                    >
                      {completingMission === mission.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Claiming...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>🎁</span>
                          <span>Claim +{mission.rewardXP} XP</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Reward</div>
                      <div className="font-semibold text-blue-600">+{mission.rewardXP} XP</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{formatMissionGoal(mission)}</span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`
                        h-3 rounded-full transition-all duration-500 ease-out
                        ${getMissionTypeColor(mission.type)}
                        ${progressPercentage === 100 ? 'animate-pulse' : ''}
                      `}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  {/* Progress percentage overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Completion effect */}
              {canComplete && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl animate-pulse pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mission Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {missions.filter(m => m.completed).length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {missions.reduce((sum, m) => sum + (m.completed ? m.rewardXP : 0), 0)}
            </div>
            <div className="text-sm text-gray-500">XP Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {missions.reduce((sum, m) => sum + (!m.completed ? m.rewardXP : 0), 0)}
            </div>
            <div className="text-sm text-gray-500">XP Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionTracker;