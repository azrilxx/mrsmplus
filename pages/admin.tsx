import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseWithFallback } from '../hooks/useFirebaseWithFallback';
import { DashboardData } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { getDashboardData, isUsingMockData } = useFirebaseWithFallback();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const data = await getDashboardData('admin');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const SystemOverview: React.FC = () => {
    const mockStats = {
      totalUsers: 1247,
      activeToday: 234,
      totalStudents: 987,
      totalTeachers: 45,
      totalParents: 203,
      totalContent: 89,
      systemHealth: 98.5
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📚</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{mockStats.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🍎</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{mockStats.totalTeachers}</div>
              <div className="text-sm text-gray-600">Teachers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{mockStats.systemHealth}%</div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserManagement: React.FC = () => {
    const mockUsers = [
      { id: 1, name: 'Ahmad bin Ali', email: 'ahmad@student.mrsm.my', role: 'student', status: 'active', lastActive: '2 hours ago' },
      { id: 2, name: 'Dr. Siti Aminah', email: 'siti@teacher.mrsm.my', role: 'teacher', status: 'active', lastActive: '1 hour ago' },
      { id: 3, name: 'Encik Rahman', email: 'rahman@parent.mrsm.my', role: 'parent', status: 'active', lastActive: '3 hours ago' },
      { id: 4, name: 'Fatimah binti Omar', email: 'fatimah@student.mrsm.my', role: 'student', status: 'inactive', lastActive: '2 days ago' }
    ];

    const getRoleColor = (role: string) => {
      switch (role) {
        case 'student': return 'bg-blue-100 text-blue-800';
        case 'teacher': return 'bg-green-100 text-green-800';
        case 'parent': return 'bg-purple-100 text-purple-800';
        case 'admin': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusColor = (status: string) => {
      return status === 'active' ? 'text-green-600' : 'text-red-600';
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">👥 User Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Add User
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Last Active</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-800">{user.name}</td>
                  <td className="px-3 py-2 text-gray-600">{user.email}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={`px-3 py-2 font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{user.lastActive}</td>
                  <td className="px-3 py-2">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const SystemHealth: React.FC = () => {
    const mockHealthData = [
      { metric: 'Database Response Time', value: '12ms', status: 'good' },
      { metric: 'API Uptime', value: '99.8%', status: 'good' },
      { metric: 'Storage Usage', value: '68%', status: 'warning' },
      { metric: 'Memory Usage', value: '45%', status: 'good' },
      { metric: 'Active Connections', value: '234', status: 'good' },
      { metric: 'Error Rate', value: '0.2%', status: 'good' }
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'good': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'good': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return '⚪';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockHealthData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center">
                <span className="mr-2">{getStatusIcon(item.status)}</span>
                <span className="text-gray-700">{item.metric}</span>
              </div>
              <span className={`font-semibold ${getStatusColor(item.status)}`}>
                {item.value}
              </span>
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
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-lg font-medium text-gray-700">Loading admin dashboard...</div>
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
          
          <SystemOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserManagement />
            <SystemHealth />
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Admin Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-gray-800">Manage Users</div>
                <div className="text-sm text-gray-600">Add, edit, or remove users</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-800">Analytics</div>
                <div className="text-sm text-gray-600">View system usage stats</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium text-gray-800">System Settings</div>
                <div className="text-sm text-gray-600">Configure app settings</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium text-gray-800">Audit Logs</div>
                <div className="text-sm text-gray-600">View system activity</div>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <div className="text-xl mr-3">👤</div>
                  <div>
                    <div className="font-medium text-gray-800">New user registration</div>
                    <div className="text-sm text-gray-500">Ahmad bin Hassan registered as student</div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <div className="text-xl mr-3">📤</div>
                  <div>
                    <div className="font-medium text-gray-800">Content uploaded</div>
                    <div className="text-sm text-gray-500">Dr. Siti uploaded Mathematics Chapter 6</div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">4 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <div className="text-xl mr-3">🔧</div>
                  <div>
                    <div className="font-medium text-gray-800">System maintenance</div>
                    <div className="text-sm text-gray-500">Database optimization completed</div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;