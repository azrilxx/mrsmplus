import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';
import {
  getLinkedStudentData,
  FirebaseUser,
  StudentProgress
} from '../firebase/queries';

const ParentDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [linkedStudent, setLinkedStudent] = useState<{user: FirebaseUser, progress: StudentProgress} | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadParentData();
    }
  }, [user, loading]);

  const loadParentData = async () => {
    try {
      setDataLoading(true);
      
      // Get linked student data
      const studentData = await getLinkedStudentData(user.uid);
      
      if (studentData) {
        setLinkedStudent(studentData);
      } else {
        // Fallback to mock data if no linked student
        setIsUsingMockData(true);
        setLinkedStudent({
          user: {
            uid: 'student-1',
            role: 'student',
            name: 'Ahmad Rahman',
            email: 'ahmad@student.mrsm.edu.my',
            studentId: 'student-1'
          },
          progress: {
            studentId: 'student-1',
            currentXP: 2450,
            level: 12,
            xpToNextLevel: 550,
            totalXP: 2450,
            weeklyProgress: 320,
            lastActivity: new Date(),
            streakDays: 15,
            subjectProgress: {
              'Mathematics': {
                completedLessons: 15,
                totalLessons: 20,
                lastAccessed: new Date(),
                difficulty: 'intermediate'
              },
              'Science': {
                completedLessons: 12,
                totalLessons: 18,
                lastAccessed: new Date(),
                difficulty: 'advanced'
              }
            },
            reflectionLogs: []
          }
        });
      }
    } catch (error) {
      console.error('Failed to load parent data:', error);
      setIsUsingMockData(true);
    } finally {
      setDataLoading(false);
    }
  };

  const ProgressOverview: React.FC = () => {
    if (!linkedStudent) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
            <div>No linked student found</div>
            <div className="text-sm">Contact admin to link your child's account</div>
          </div>
        </div>
      );
    }

    const { user: student, progress } = linkedStudent;
    const subjects = Object.entries(progress.subjectProgress || {});

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">👨‍👩‍👧‍👦 Child Progress</h3>
            <div className="text-sm text-gray-600">{student.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-md font-semibold text-gray-700 mb-4">📊 Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className="font-semibold text-blue-600">Level {progress.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total XP Earned</span>
                <span className="font-semibold text-purple-600">{progress.totalXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Study Streak</span>
                <span className="font-semibold text-orange-600">{progress.streakDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly Progress</span>
                <span className="font-semibold text-green-600">+{progress.weeklyProgress} XP</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-md font-semibold text-gray-700 mb-4">📚 Subject Progress</h4>
            <div className="space-y-4">
              {subjects.length > 0 ? subjects.map(([subjectName, subjectData]) => {
                const progressPercentage = Math.round((subjectData.completedLessons / subjectData.totalLessons) * 100);
                return (
                  <div key={subjectName} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{subjectName}</span>
                        <span className="text-sm text-gray-600">
                          {subjectData.completedLessons}/{subjectData.totalLessons} lessons
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-600">{progressPercentage}%</span>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📖</div>
                  <div>No subject progress available</div>
                  <div className="text-sm">Encourage your child to start studying!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecentActivity: React.FC = () => {
    if (!linkedStudent) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <div>No activity data available</div>
          </div>
        </div>
      );
    }

    const { progress } = linkedStudent;
    
    // Generate basic activity from reflection logs and progress data
    const activities = [];
    
    if (progress.reflectionLogs && progress.reflectionLogs.length > 0) {
      progress.reflectionLogs.slice(0, 3).forEach(log => {
        activities.push({
          date: log.date.toLocaleDateString(),
          subject: 'Study Reflection',
          activity: `Completed reflection - feeling ${log.mood}`,
          score: `${log.confidenceLevel}/10 confidence`,
          xp: 50
        });
      });
    }

    // Add subject progress activities
    Object.entries(progress.subjectProgress || {}).forEach(([subject, data]) => {
      if (data.lastAccessed) {
        activities.push({
          date: data.lastAccessed.toLocaleDateString(),
          subject: subject,
          activity: `Continued ${subject} lessons`,
          score: `${data.completedLessons}/${data.totalLessons} completed`,
          xp: 25
        });
      }
    });

    // Sort by most recent (mock dates for now)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Recent Activity</h3>
        <div className="space-y-3">
          {activities.length > 0 ? activities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{activity.activity}</div>
                <div className="text-sm text-gray-500">{activity.subject} • {activity.date}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">{activity.score}</div>
                <div className="text-sm text-purple-600">+{activity.xp} XP</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <div>No recent activity</div>
              <div className="text-sm">Encourage your child to start studying!</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <div className="text-lg font-medium text-gray-700">Loading parent dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">MARA+ Parent Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.email}</span>
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
          
          <ProgressOverview />
          
          <div className="mt-6">
            <RecentActivity />
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Parent Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-800">Detailed Reports</div>
                <div className="text-sm text-gray-600">View comprehensive progress</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">⏰</div>
                <div className="font-medium text-gray-800">Study Schedule</div>
                <div className="text-sm text-gray-600">Set learning goals</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-medium text-gray-800">Contact Teacher</div>
                <div className="text-sm text-gray-600">Message your child's teacher</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-gray-800">Set Rewards</div>
                <div className="text-sm text-gray-600">Motivate with achievements</div>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Engagement Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800 mb-2">🌟 This Week's Tip</div>
                <div className="text-sm text-blue-700">
                  Encourage your child to take short breaks during study sessions. Research shows that 
                  25-minute focused sessions with 5-minute breaks improve retention.
                </div>
              </div>
              
              {linkedStudent && linkedStudent.progress.streakDays > 5 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">🎉 Celebrate Success</div>
                  <div className="text-sm text-green-700">
                    {linkedStudent.user.name} has maintained a {linkedStudent.progress.streakDays}-day study streak! 
                    Consider a small reward to acknowledge their dedication and consistency.
                  </div>
                </div>
              )}
              
              {linkedStudent && linkedStudent.progress.weeklyProgress > 200 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800 mb-2">⚡ Great Progress</div>
                  <div className="text-sm text-purple-700">
                    {linkedStudent.user.name} earned {linkedStudent.progress.weeklyProgress} XP this week! 
                    They're showing excellent engagement with their studies.
                  </div>
                </div>
              )}
              
              {linkedStudent && Object.keys(linkedStudent.progress.subjectProgress || {}).length === 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-2">📚 Getting Started</div>
                  <div className="text-sm text-yellow-700">
                    Help {linkedStudent.user.name} explore different subjects on the platform. 
                    Starting with their favorite subject can build confidence!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ParentDashboard;