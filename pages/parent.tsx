import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseWithFallback } from '../hooks/useFirebaseWithFallback';
import { DashboardData } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';

const ParentDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { getDashboardData, isUsingMockData } = useFirebaseWithFallback();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const data = await getDashboardData('parent');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const ProgressOverview: React.FC = () => {
    const mockChildren = [
      { id: 'child1', name: 'Ahmad', class: 'Form 4 Cemerlang' },
      { id: 'child2', name: 'Fatimah', class: 'Form 2 Bestari' }
    ];

    const mockProgress = {
      child1: {
        name: 'Ahmad',
        class: 'Form 4 Cemerlang',
        subjects: [
          { name: 'Mathematics', progress: 85, grade: 'A' },
          { name: 'Science', progress: 78, grade: 'B+' },
          { name: 'English', progress: 92, grade: 'A+' },
          { name: 'Bahasa Malaysia', progress: 88, grade: 'A' }
        ],
        weeklyActivity: 24,
        totalXP: 1450,
        streak: 7
      },
      child2: {
        name: 'Fatimah',
        class: 'Form 2 Bestari',
        subjects: [
          { name: 'Mathematics', progress: 72, grade: 'B' },
          { name: 'Science', progress: 81, grade: 'A-' },
          { name: 'English', progress: 75, grade: 'B+' },
          { name: 'Bahasa Malaysia', progress: 79, grade: 'B+' }
        ],
        weeklyActivity: 18,
        totalXP: 980,
        streak: 4
      }
    };

    const currentChild = mockProgress[selectedChild as keyof typeof mockProgress];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">👨‍👩‍👧‍👦 Select Child</h3>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {mockChildren.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} - {child.class}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-md font-semibold text-gray-700 mb-4">📊 Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly Study Hours</span>
                <span className="font-semibold text-blue-600">{currentChild.weeklyActivity}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total XP Earned</span>
                <span className="font-semibold text-purple-600">{currentChild.totalXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Study Streak</span>
                <span className="font-semibold text-orange-600">{currentChild.streak} days</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-md font-semibold text-gray-700 mb-4">📚 Subject Progress</h4>
            <div className="space-y-4">
              {currentChild.subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                      <span className="text-sm font-semibold text-gray-600">{subject.grade}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-600">{subject.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecentActivity: React.FC = () => {
    const mockActivities = [
      {
        date: '2024-01-15',
        subject: 'Mathematics',
        activity: 'Completed Chapter 5 Quiz',
        score: '92%',
        xp: 150
      },
      {
        date: '2024-01-14',
        subject: 'Science',
        activity: 'Study Session - Physics',
        score: '88%',
        xp: 120
      },
      {
        date: '2024-01-13',
        subject: 'English',
        activity: 'Grammar Practice',
        score: '95%',
        xp: 180
      }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Recent Activity</h3>
        <div className="space-y-3">
          {mockActivities.map((activity, index) => (
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
          ))}
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
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800 mb-2">🎉 Celebrate Success</div>
                <div className="text-sm text-green-700">
                  Your child has maintained a 7-day study streak! Consider a small reward to 
                  acknowledge their dedication and consistency.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ParentDashboard;