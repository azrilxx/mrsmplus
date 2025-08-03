import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMockFirestore } from '../hooks/useMockFirestore';
import { DashboardData } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { 
  StudentTable, 
  LeaderboardPreview, 
  PerformanceHeatmap 
} from '../components/dashboard/widgets';

const TeacherDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const mockFirestore = useMockFirestore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        const data = mockFirestore.getDashboardData('teacher');
        setDashboardData(data);
        setDataLoading(false);
      }, 500);
    }
  }, [user, loading, mockFirestore]);

  const ClassStatsCard: React.FC<{ stats: any }> = ({ stats }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Class Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalStudents}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(stats.totalStudents / 30) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.averageXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Average XP</div>
            <div className="text-xs text-green-600 mt-1">
              +12.5% from last week
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuickActionsCard: React.FC = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-800">Create Assignment</div>
            <div className="text-sm text-gray-600">New task for students</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-800">Grade Submissions</div>
            <div className="text-sm text-gray-600">Review student work</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium text-gray-800">Send Message</div>
            <div className="text-sm text-gray-600">Contact students/parents</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📈</div>
            <div className="font-medium text-gray-800">View Reports</div>
            <div className="text-sm text-gray-600">Detailed analytics</div>
          </button>
        </div>
      </div>
    );
  };

  const EngagementInsightsCard: React.FC = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 AI Insights</h3>
        
        <div className="space-y-4">
          <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="text-xl mr-3">🎯</div>
            <div>
              <div className="font-medium text-blue-800">Engagement Opportunity</div>
              <div className="text-sm text-blue-700">
                3 students haven't been active for 2+ days. Consider sending encouragement messages.
              </div>
            </div>
          </div>
          
          <div className="flex items-start p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <div className="text-xl mr-3">📈</div>
            <div>
              <div className="font-medium text-green-800">Performance Trend</div>
              <div className="text-sm text-green-700">
                Mathematics scores improved by 15% this week. Great teaching strategy!
              </div>
            </div>
          </div>
          
          <div className="flex items-start p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="text-xl mr-3">⚠️</div>
            <div>
              <div className="font-medium text-yellow-800">Area of Focus</div>
              <div className="text-sm text-yellow-700">
                Physics completion rates are lower than other subjects. Consider adjusting difficulty.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍🏫</div>
          <div className="text-lg font-medium text-gray-700">Loading teacher dashboard...</div>
        </div>
      </div>
    );
  }


  const teacherData = dashboardData?.teacher;

  if (!teacherData) {
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
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">MARA+ Teacher Dashboard</h1>
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
            <ClassStatsCard stats={teacherData.classStats} />
          </div>
          <div>
            <LeaderboardPreview entries={teacherData.leaderboard} maxEntries={5} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <StudentTable students={teacherData.students} />
          </div>
          <div>
            <EngagementInsightsCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <PerformanceHeatmap diagnostics={teacherData.engagementDiagnostics} />
          </div>
          <div>
            <QuickActionsCard />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="text-xl mr-3">📝</div>
                <div>
                  <div className="font-medium text-gray-800">Ahmad Rahman submitted Physics assignment</div>
                  <div className="text-sm text-gray-600">2 hours ago</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Review
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="text-xl mr-3">🏆</div>
                <div>
                  <div className="font-medium text-gray-800">Li Wei Ming achieved level 16</div>
                  <div className="text-sm text-gray-600">4 hours ago</div>
                </div>
              </div>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                Congratulate
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="text-xl mr-3">⚠️</div>
                <div>
                  <div className="font-medium text-gray-800">Fatimah Zahra hasn't been active for 3 days</div>
                  <div className="text-sm text-gray-600">Status update</div>
                </div>
              </div>
              <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                Follow up
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;