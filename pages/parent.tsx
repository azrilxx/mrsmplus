import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMockFirestore } from '../hooks/useMockFirestore';
import { DashboardData } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { 
  ChildProgress, 
  EngagementTips 
} from '../components/dashboard/widgets';

const ParentDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const mockFirestore = useMockFirestore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        const data = mockFirestore.getDashboardData('parent');
        setDashboardData(data);
        setDataLoading(false);
      }, 500);
    }
  }, [user, loading, mockFirestore]);

  const FamilyStatsCard: React.FC<{ stats: any }> = ({ stats }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧‍👦 Family Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Family XP</div>
            <div className="text-xs text-blue-600 mt-1">
              +{Math.floor(stats.totalXP * 0.15)} this week
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.activeChildren}
            </div>
            <div className="text-sm text-gray-600">Active Children</div>
            <div className="text-xs text-green-600 mt-1">
              Engaged today
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.weeklyGoalProgress}%
            </div>
            <div className="text-sm text-gray-600">Weekly Goal Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min(stats.weeklyGoalProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ParentActionsCard: React.FC = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Parent Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📧</div>
            <div className="font-medium text-gray-800">Message Teacher</div>
            <div className="text-sm text-gray-600">Discuss child's progress</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-medium text-gray-800">Set Goals</div>
            <div className="text-sm text-gray-600">Weekly learning targets</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-800">View Reports</div>
            <div className="text-sm text-gray-600">Detailed progress analysis</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🏆</div>
            <div className="font-medium text-gray-800">Reward System</div>
            <div className="text-sm text-gray-600">Manage achievements</div>
          </button>
        </div>
      </div>
    );
  };

  const WeeklyActivityCard: React.FC = () => {
    const weeklyData = [
      { day: 'Mon', xp: 45, active: true },
      { day: 'Tue', xp: 67, active: true },
      { day: 'Wed', xp: 23, active: false },
      { day: 'Thu', xp: 89, active: true },
      { day: 'Fri', xp: 56, active: true },
      { day: 'Sat', xp: 34, active: true },
      { day: 'Sun', xp: 78, active: true }
    ];

    const maxXP = Math.max(...weeklyData.map(d => d.xp));

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Weekly Activity</h3>
        
        <div className="flex items-end justify-between h-32 mb-4">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className={`w-full rounded-t ${day.active ? 'bg-blue-500' : 'bg-gray-300'} transition-all duration-300`}
                style={{ height: `${(day.xp / maxXP) * 100}%` }}
              ></div>
              <div className="text-xs text-gray-600 mt-2">{day.day}</div>
              <div className="text-xs font-medium text-gray-800">{day.xp}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium text-gray-800">Avg. Daily XP</div>
            <div className="text-blue-600">
              {Math.floor(weeklyData.reduce((sum, day) => sum + day.xp, 0) / 7)}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-800">Active Days</div>
            <div className="text-green-600">
              {weeklyData.filter(day => day.active).length}/7
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-800">Best Day</div>
            <div className="text-purple-600">
              {weeklyData.find(day => day.xp === maxXP)?.day}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StudySessionsCard: React.FC = () => {
    const recentSessions = [
      {
        subject: 'Mathematics',
        duration: '25 min',
        xpEarned: 45,
        timestamp: '2 hours ago',
        performance: 'excellent'
      },
      {
        subject: 'Physics',
        duration: '18 min',
        xpEarned: 32,
        timestamp: '1 day ago',
        performance: 'good'
      },
      {
        subject: 'Chemistry',
        duration: '30 min',
        xpEarned: 56,
        timestamp: '2 days ago',
        performance: 'excellent'
      }
    ];

    const getPerformanceColor = (performance: string) => {
      switch (performance) {
        case 'excellent': return 'text-green-600 bg-green-100';
        case 'good': return 'text-blue-600 bg-blue-100';
        case 'average': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Recent Study Sessions</h3>
        
        <div className="space-y-3">
          {recentSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-800">{session.subject}</div>
                  <div className="text-sm text-gray-600">{session.timestamp}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">{session.duration}</span>
                  <span className="text-sm font-medium text-blue-600">+{session.xpEarned} XP</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(session.performance)}`}>
                  {session.performance}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border-t">
          View All Sessions →
        </button>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👪</div>
          <div className="text-lg font-medium text-gray-700">Loading parent dashboard...</div>
        </div>
      </div>
    );
  }


  const parentData = dashboardData?.parent;

  if (!parentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium text-gray-700">No data available</div>
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
                Welcome back, <span className="font-medium">{user.email}</span>
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <FamilyStatsCard stats={parentData.familyStats} />
          </div>
          <div>
            <WeeklyActivityCard />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div>
            <ChildProgress children={parentData.children} />
          </div>
          <div>
            <EngagementTips motivationCards={parentData.motivationCards} maxCards={4} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <StudySessionsCard />
          </div>
          <div>
            <ParentActionsCard />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Notifications & Updates</h3>
          
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div className="text-xl mr-3">🎉</div>
              <div>
                <div className="font-medium text-green-800">Congratulations!</div>
                <div className="text-sm text-green-700">
                  Ahmad completed his weekly XP goal 2 days early. Consider setting a higher target next week.
                </div>
                <div className="text-xs text-green-600 mt-1">Today, 2:30 PM</div>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="text-xl mr-3">📚</div>
              <div>
                <div className="font-medium text-blue-800">Study Reminder</div>
                <div className="text-sm text-blue-700">
                  Ahmad has a Physics assignment due tomorrow. Encourage him to review the concepts.
                </div>
                <div className="text-xs text-blue-600 mt-1">Yesterday, 6:00 PM</div>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div className="text-xl mr-3">📧</div>
              <div>
                <div className="font-medium text-purple-800">Teacher Message</div>
                <div className="text-sm text-purple-700">
                  "Ahmad showed excellent improvement in Mathematics this week. Keep up the great work!"
                </div>
                <div className="text-xs text-purple-600 mt-1">2 days ago</div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border-t">
            View All Notifications →
          </button>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default ParentDashboard;