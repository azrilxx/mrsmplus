import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';
import { 
  XPProgress, 
  LessonTracker, 
  RecentAnswers 
} from '../components/dashboard/widgets';
import { 
  getStudentProgress, 
  getUserData, 
  subscribeToStudentProgress,
  StudentProgress as FirebaseStudentProgress,
  StudyReflection
} from '../firebase/queries';
import {
  GamifiedStudentProgress,
  subscribeToGamifiedProgress,
  trackDailyStreak,
  assignDailyMissions,
  completeMission,
  initializeGamifiedProgress,
  updateMissionProgress
} from '../firebase/gamification';
import XPBadge from '../components/XPBadge';
import AchievementPopup from '../components/AchievementPopup';
import MissionTracker from '../components/MissionTracker';

const StudentDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [studentProgress, setStudentProgress] = useState<FirebaseStudentProgress | null>(null);
  const [gamifiedProgress, setGamifiedProgress] = useState<GamifiedStudentProgress | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [levelUpEffect, setLevelUpEffect] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      loadStudentData();
    }
  }, [user, loading]);

  const loadStudentData = async () => {
    try {
      setDataLoading(true);
      
      // Get user data to find studentId
      const userInfo = await getUserData(user.uid);
      setUserData(userInfo);
      
      if (userInfo?.studentId) {
        // Initialize gamified progress if it doesn't exist
        await initializeGamifiedProgress(userInfo.studentId);
        
        // Track daily streak and assign missions
        await trackDailyStreak(userInfo.studentId);
        await assignDailyMissions(userInfo.studentId);
        
        // Get student progress (legacy)
        const progress = await getStudentProgress(userInfo.studentId);
        setStudentProgress(progress);
        
        // Set up real-time listener for gamified progress
        const unsubscribeGamified = subscribeToGamifiedProgress(userInfo.studentId, (updatedProgress) => {
          setGamifiedProgress(updatedProgress);
          
          // Check for level up effects
          if (updatedProgress?.levelUpEffects?.triggered) {
            setLevelUpEffect(true);
            setNewLevel(updatedProgress.levelUpEffects.newLevel);
            
            setTimeout(() => {
              setLevelUpEffect(false);
              setNewLevel(null);
            }, 4000);
          }
          
          // Check for new achievements
          if (updatedProgress?.recentAchievements?.length > 0) {
            const unviewedAchievement = updatedProgress.recentAchievements.find(a => !a.viewed);
            if (unviewedAchievement) {
              setShowAchievement(unviewedAchievement.achievementId);
            }
          }
        });
        
        // Set up real-time listener for legacy progress
        const unsubscribeLegacy = subscribeToStudentProgress(userInfo.studentId, (updatedProgress) => {
          setStudentProgress(updatedProgress);
        });
        
        return () => {
          unsubscribeGamified();
          unsubscribeLegacy();
        };
      } else {
        // Fallback to mock data if no studentId
        setIsUsingMockData(true);
        const mockGamifiedData: GamifiedStudentProgress = {
          studentId: user.uid,
          xp: 2450,
          level: 12,
          lastActiveDate: new Date().toISOString(),
          currentStreak: 7,
          longestStreak: 14,
          achievements: ['badge_first_mission', 'badge_7_day_streak'],
          activeMissions: [
            {
              id: 'mission_1',
              title: 'Daily Questions Challenge',
              subject: 'math',
              type: 'questions',
              goal: 5,
              progress: 3,
              rewardXP: 30,
              completed: false,
              dateAssigned: new Date()
            },
            {
              id: 'mission_2',
              title: 'XP Hunter',
              subject: 'general',
              type: 'xp',
              goal: 50,
              progress: 35,
              rewardXP: 25,
              completed: false,
              dateAssigned: new Date()
            }
          ],
          completedMissions: [],
          totalXP: 2450,
          xpToNextLevel: 550,
          weeklyProgress: 320,
          subjectProgress: {
            'math': {
              completedLessons: 15,
              totalLessons: 20,
              lastAccessed: new Date(),
              difficulty: 'intermediate' as const,
              xpEarned: 450
            }
          }
        };
        setGamifiedProgress(mockGamifiedData);
        
        const mockData = {
          currentXP: 2450,
          level: 12,
          xpToNextLevel: 550,
          totalXP: 2450,
          weeklyProgress: 320,
          lastActivity: new Date(),
          streakDays: 7,
          subjectProgress: {
            'Mathematics': {
              completedLessons: 15,
              totalLessons: 20,
              lastAccessed: new Date(),
              difficulty: 'intermediate' as const
            }
          },
          reflectionLogs: [{
            id: 'reflection-1',
            userId: user.uid,
            date: new Date(),
            mood: 'good' as const,
            insights: ['Making good progress', 'Understanding concepts better'],
            areasForImprovement: ['Time management', 'Practice more problems'],
            strengths: ['Strong analytical skills', 'Good memorization'],
            confidenceLevel: 7
          }]
        } as FirebaseStudentProgress;
        setStudentProgress(mockData);
      }
    } catch (error) {
      console.error('Failed to load student data:', error);
      setIsUsingMockData(true);
    } finally {
      setDataLoading(false);
    }
  };

  const handleMissionComplete = async (missionId: string) => {
    if (!userData?.studentId) return;
    
    try {
      const result = await completeMission(userData.studentId, missionId);
      if (result.success) {
        console.log(`Mission completed! Awarded ${result.xpAwarded} XP`);
      }
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  const StudyReflectionCard: React.FC<{ reflection: StudyReflection }> = ({ reflection }) => {
    const getMoodIcon = (mood: string) => {
      switch (mood) {
        case 'excellent': return '😄';
        case 'good': return '😊';
        case 'neutral': return '😐';
        case 'poor': return '😔';
        case 'struggling': return '😰';
        default: return '😐';
      }
    };

    const getMoodColor = (mood: string) => {
      switch (mood) {
        case 'excellent': return 'bg-green-100 text-green-800';
        case 'good': return 'bg-blue-100 text-blue-800';
        case 'neutral': return 'bg-gray-100 text-gray-800';
        case 'poor': return 'bg-yellow-100 text-yellow-800';
        case 'struggling': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🧠 Study Reflection</h3>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{getMoodIcon(reflection.mood)}</div>
          <div>
            <div className="font-medium text-gray-800">Today's Mood</div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(reflection.mood)}`}>
              {reflection.mood}
            </span>
          </div>
          <div className="ml-auto">
            <div className="text-sm text-gray-500">Confidence Level</div>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(reflection.confidenceLevel / 10) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {reflection.confidenceLevel}/10
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">💡 Key Insights</h4>
            <ul className="space-y-1">
              {reflection.insights.slice(0, 2).map((insight, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">🎯 Areas to Improve</h4>
            <ul className="space-y-1">
              {reflection.areasForImprovement.slice(0, 2).map((area, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">💪 Your Strengths</h4>
            <ul className="space-y-1">
              {reflection.strengths.slice(0, 2).map((strength, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-lg font-medium text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!studentProgress || !gamifiedProgress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium text-gray-700">No data available</div>
        </div>
      </div>
    );
  }

  // Transform Firebase data to match widget expectations
  const xpProgressData = {
    currentXP: gamifiedProgress.xp,
    level: gamifiedProgress.level,
    xpToNextLevel: gamifiedProgress.xpToNextLevel,
    totalXP: gamifiedProgress.totalXP,
    weeklyProgress: gamifiedProgress.weeklyProgress
  };

  const lessonProgressData = Object.entries(studentProgress.subjectProgress || {}).map(([subject, progress]) => ({
    subject,
    completedLessons: progress.completedLessons,
    totalLessons: progress.totalLessons,
    lastAccessed: progress.lastAccessed,
    difficulty: progress.difficulty
  }));

  // Mock recent answers for now (would come from a separate collection)
  const recentAnswersData = [
    {
      id: '1',
      question: 'What is the derivative of x²?',
      answer: '2x',
      isCorrect: true,
      subject: 'Mathematics',
      timestamp: new Date(),
      xpEarned: 15
    }
  ];

  const latestReflection = studentProgress.reflectionLogs?.[0] || {
    id: 'default',
    userId: user.uid,
    date: new Date(),
    mood: 'neutral' as const,
    insights: ['Continue practicing'],
    areasForImprovement: ['Stay consistent'],
    strengths: ['Good effort'],
    confidenceLevel: 5
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">MARA+ Student Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user.email}</span>
              </div>
              <ConnectionStatus compact />
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isUsingMockData && (
          <div className="mb-6">
            <ConnectionStatus position="header" />
          </div>
        )}
        
        {/* Gamification Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <XPBadge 
                currentXP={gamifiedProgress.xp}
                level={gamifiedProgress.level}
                xpToNextLevel={gamifiedProgress.xpToNextLevel}
                leveledUp={levelUpEffect}
                newLevel={newLevel}
                animate={levelUpEffect}
                size="large"
              />
              <div>
                <h2 className="text-2xl font-bold">Level {gamifiedProgress.level} Scholar</h2>
                <p className="opacity-90">Welcome back, {user.email?.split('@')[0]}!</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span className="font-medium">{gamifiedProgress.currentStreak} day streak</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🏆</span>
                    <span className="font-medium">{gamifiedProgress.achievements.length} achievements</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{gamifiedProgress.totalXP}</div>
              <div className="text-sm opacity-90">Total XP</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MissionTracker 
              missions={gamifiedProgress.activeMissions}
              onMissionComplete={handleMissionComplete}
            />
          </div>
          
          <div className="lg:col-span-2">
            <LessonTracker lessons={lessonProgressData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <RecentAnswers answers={recentAnswersData} />
          </div>
          
          <div>
            <StudyReflectionCard reflection={latestReflection} />
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/study'}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium text-gray-800">Start Study Session</div>
              <div className="text-sm text-gray-600">Choose a subject and start learning!</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/study'}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-gray-800">Practice Questions</div>
              <div className="text-sm text-gray-600">Test your knowledge & earn XP</div>
            </button>
            
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-800">View Progress</div>
              <div className="text-sm text-gray-600">Track your improvement</div>
            </button>
          </div>
        </div>

        {/* Achievement Badge Display */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            Your Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {gamifiedProgress.achievements.map((achievementId) => (
              <div key={achievementId} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl mb-2 shadow-lg">
                  🏆
                </div>
                <div className="text-xs font-medium text-gray-600 truncate">
                  {achievementId.replace('badge_', '').replace('_', ' ')}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - gamifiedProgress.achievements.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="text-center opacity-50">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                  🔒
                </div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Achievement Popup */}
      <AchievementPopup
        achievementId={showAchievement}
        visible={!!showAchievement}
        onClose={() => setShowAchievement(null)}
      />
    </ProtectedRoute>
  );
};

export default StudentDashboard;