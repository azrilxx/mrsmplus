import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMockFirestore } from '../hooks/useMockFirestore';
import { DashboardData, StudyModeUsage } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { 
  UserCountCard, 
  XPHeatmap, 
  SystemAlerts 
} from '../components/dashboard/widgets';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const mockFirestore = useMockFirestore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        const data = mockFirestore.getDashboardData('admin');
        setDashboardData(data);
        setDataLoading(false);
      }, 500);
    }
  }, [user, loading, mockFirestore]);

  const StudyModeUsageCard: React.FC<{ usage: StudyModeUsage }> = ({ usage }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">📚 Study Mode Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {usage.totalSessions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {usage.averageSessionDuration}m
            </div>
            <div className="text-sm text-gray-600">Avg. Duration</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {usage.popularSubjects.length}
            </div>
            <div className="text-sm text-gray-600">Active Subjects</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(usage.completionRates.reduce((sum, rate) => sum + rate.rate, 0) / usage.completionRates.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg. Completion</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">📊 Popular Subjects</h4>
            <div className="space-y-2">
              {usage.popularSubjects.slice(0, 5).map((subject, index) => {
                const maxSessions = Math.max(...usage.popularSubjects.map(s => s.sessionCount));
                const percentage = (subject.sessionCount / maxSessions) * 100;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 truncate">
                      {subject.subject}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {subject.sessionCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">⏰ Peak Hours</h4>
            <div className="space-y-2">
              {usage.peakHours.sort((a, b) => b.sessionCount - a.sessionCount).slice(0, 5).map((hour, index) => {
                const maxSessions = Math.max(...usage.peakHours.map(h => h.sessionCount));
                const percentage = (hour.sessionCount / maxSessions) * 100;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">
                      {hour.hour}:00
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-green-500 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {hour.sessionCount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SystemHealthCard: React.FC<{ health: any }> = ({ health }) => {
    const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
      if (value >= thresholds.good) return 'text-green-600 bg-green-100';
      if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    const getHealthIcon = (value: number, thresholds: { good: number; warning: number }) => {
      if (value >= thresholds.good) return '✅';
      if (value >= thresholds.warning) return '⚠️';
      return '🚨';
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💻 System Health</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {getHealthIcon(health.uptime, { good: 99, warning: 95 })}
            </div>
            <div className={`text-2xl font-bold mb-1 px-3 py-1 rounded ${getHealthColor(health.uptime, { good: 99, warning: 95 })}`}>
              {health.uptime}%
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-2">
              {getHealthIcon(300 - health.responseTime, { good: 200, warning: 100 })}
            </div>
            <div className={`text-2xl font-bold mb-1 px-3 py-1 rounded ${getHealthColor(300 - health.responseTime, { good: 200, warning: 100 })}`}>
              {health.responseTime}ms
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-2">
              {getHealthIcon(100 - (health.errorRate * 100), { good: 99, warning: 95 })}
            </div>
            <div className={`text-2xl font-bold mb-1 px-3 py-1 rounded ${getHealthColor(100 - (health.errorRate * 100), { good: 99, warning: 95 })}`}>
              {(health.errorRate * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
        </div>
      </div>
    );
  };

  const AdminActionsCard: React.FC = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Admin Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-800">User Management</div>
            <div className="text-sm text-gray-600">Manage user accounts</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-800">Analytics</div>
            <div className="text-sm text-gray-600">Detailed reports</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🔧</div>
            <div className="font-medium text-gray-800">System Settings</div>
            <div className="text-sm text-gray-600">Configure platform</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium text-gray-800">Content Management</div>
            <div className="text-sm text-gray-600">Manage curriculum</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🔔</div>
            <div className="font-medium text-gray-800">Notifications</div>
            <div className="text-sm text-gray-600">Send announcements</div>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-medium text-gray-800">Security</div>
            <div className="text-sm text-gray-600">Access controls</div>
          </button>
        </div>
      </div>
    );
  };

  const RecentActivitiesCard: React.FC = () => {
    const activities = [
      {
        type: 'user_registered',
        message: 'New student Ahmad Rahman registered',
        timestamp: '2 minutes ago',
        icon: '👤',
        color: 'bg-green-50 text-green-800'
      },
      {
        type: 'system_update',
        message: 'Study reflection module deployed successfully',
        timestamp: '1 hour ago',
        icon: '🚀',
        color: 'bg-blue-50 text-blue-800'
      },
      {
        type: 'alert_resolved',
        message: 'High server load alert resolved',
        timestamp: '3 hours ago',
        icon: '✅',
        color: 'bg-green-50 text-green-800'
      },
      {
        type: 'content_updated',
        message: 'Mathematics curriculum updated',
        timestamp: '6 hours ago',
        icon: '📚',
        color: 'bg-purple-50 text-purple-800'
      },
      {
        type: 'performance_milestone',
        message: '1000+ study sessions completed today',
        timestamp: '8 hours ago',
        icon: '🎯',
        color: 'bg-orange-50 text-orange-800'
      }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Recent Activities</h3>
        
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className={`flex items-center p-3 rounded-lg ${activity.color}`}>
              <div className="text-xl mr-3">{activity.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{activity.message}</div>
                <div className="text-xs opacity-75">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border-t">
          View All Activities →
        </button>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧑‍💼</div>
          <div className="text-lg font-medium text-gray-700">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }


  const adminData = dashboardData?.admin;

  if (!adminData) {
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
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">MARA+ Admin Dashboard</h1>
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
            <UserCountCard stats={adminData.userStats} />
          </div>
          <div>
            <SystemHealthCard health={adminData.systemHealth} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div>
            <XPHeatmap stats={adminData.xpStats} />
          </div>
          <div>
            <StudyModeUsageCard usage={adminData.studyModeUsage} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div>
            <SystemAlerts alerts={adminData.systemAlerts} maxAlerts={8} />
          </div>
          <div>
            <RecentActivitiesCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AdminActionsCard />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Platform Insights</h3>
            
            <div className="space-y-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-xl mr-3">📈</div>
                <div>
                  <div className="font-medium text-blue-800">Growth Trend</div>
                  <div className="text-sm text-blue-700">
                    User engagement increased by 15% this month. Peak activity hours are 7-9 PM.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div className="text-xl mr-3">💡</div>
                <div>
                  <div className="font-medium text-green-800">Optimization Opportunity</div>
                  <div className="text-sm text-green-700">
                    Mathematics modules have highest engagement. Consider expanding this content.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="text-xl mr-3">⚠️</div>
                <div>
                  <div className="font-medium text-yellow-800">Performance Note</div>
                  <div className="text-sm text-yellow-700">
                    Server response times spike during peak hours. Consider scaling infrastructure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;