import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';
import {
  getAllUsers,
  getUsersByRole,
  getAllStudentProgress,
  getAllUploads,
  FirebaseUser,
  StudentProgress,
  UploadData
} from '../firebase/queries';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<FirebaseUser[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [uploads, setUploads] = useState<UploadData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadAdminData();
    }
  }, [user, loading]);

  const loadAdminData = async () => {
    try {
      setDataLoading(true);
      
      // Get all system data
      const [users, progress, allUploads] = await Promise.all([
        getAllUsers(),
        getAllStudentProgress(),
        getAllUploads()
      ]);
      
      if (users.length > 0) {
        setAllUsers(users);
        setStudentProgress(progress);
        setUploads(allUploads);
      } else {
        // Fallback to mock data if no users found
        setIsUsingMockData(true);
        setAllUsers([
          {
            uid: 'user-1',
            role: 'student',
            name: 'Ahmad Rahman',
            email: 'ahmad@student.mrsm.edu.my',
            studentId: 'student-1'
          },
          {
            uid: 'user-2',
            role: 'teacher',
            name: 'Dr. Siti Aminah',
            email: 'siti@teacher.mrsm.edu.my'
          },
          {
            uid: 'user-3',
            role: 'parent',
            name: 'Encik Rahman',
            email: 'rahman@parent.mrsm.edu.my',
            linkedStudentId: 'student-1'
          }
        ]);
        setStudentProgress([
          {
            studentId: 'student-1',
            currentXP: 2450,
            level: 12,
            xpToNextLevel: 550,
            totalXP: 2450,
            weeklyProgress: 320,
            lastActivity: new Date(),
            streakDays: 15,
            subjectProgress: {},
            reflectionLogs: []
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setIsUsingMockData(true);
    } finally {
      setDataLoading(false);
    }
  };

  const SystemOverview: React.FC = () => {
    const totalStudents = allUsers.filter(u => u.role === 'student').length;
    const totalTeachers = allUsers.filter(u => u.role === 'teacher').length;
    const totalParents = allUsers.filter(u => u.role === 'parent').length;
    
    // Calculate active users (those with activity in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const activeStudents = studentProgress.filter(p => 
      p.lastActivity && p.lastActivity > weekAgo
    ).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{allUsers.length.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📚</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🍎</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalTeachers}</div>
              <div className="text-sm text-gray-600">Teachers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚡</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{activeStudents}</div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserManagement: React.FC = () => {
    const getRoleColor = (role: string) => {
      switch (role) {
        case 'student': return 'bg-blue-100 text-blue-800';
        case 'teacher': return 'bg-green-100 text-green-800';
        case 'parent': return 'bg-purple-100 text-purple-800';
        case 'admin': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getUserStatus = (userId: string, role: string) => {
      if (role === 'student') {
        const progress = studentProgress.find(p => p.studentId === userId);
        if (progress?.lastActivity) {
          const daysSinceActivity = Math.floor(
            (new Date().getTime() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceActivity < 7 ? 'active' : 'inactive';
        }
      }
      return 'unknown';
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'text-green-600';
        case 'inactive': return 'text-red-600';
        default: return 'text-gray-600';
      }
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
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allUsers.slice(0, 10).map((user) => {
                const status = getUserStatus(user.studentId || user.uid, user.role);
                return (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{user.name}</td>
                    <td className="px-3 py-2 text-gray-600">{user.email}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className={`px-3 py-2 font-medium ${getStatusColor(status)}`}>
                      {status}
                    </td>
                    <td className="px-3 py-2">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {allUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <div>No users found</div>
            <div className="text-sm">Users will appear here once the system is in use</div>
          </div>
        )}
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
              {uploads.length > 0 ? (
                <>
                  {uploads.slice(0, 3).map((upload) => (
                    <div key={upload.fileId} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">📤</div>
                        <div>
                          <div className="font-medium text-gray-800">Content uploaded</div>
                          <div className="text-sm text-gray-500">{upload.fileName} - {upload.subject}</div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{upload.uploadDate.toLocaleDateString()}</span>
                    </div>
                  ))}
                  
                  {allUsers.slice(-2).map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">👤</div>
                        <div>
                          <div className="font-medium text-gray-800">User registered</div>
                          <div className="text-sm text-gray-500">{user.name} joined as {user.role}</div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">Recently</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No recent activity</div>
                  <div className="text-sm">System activity will appear here</div>
                </div>
              )}
            </div>
          </div>

          {studentProgress.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Student Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">Average XP</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(studentProgress.reduce((sum, p) => sum + p.currentXP, 0) / studentProgress.length)}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">Total XP Earned</div>
                  <div className="text-2xl font-bold text-green-600">
                    {studentProgress.reduce((sum, p) => sum + p.totalXP, 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800 mb-2">Average Streak</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(studentProgress.reduce((sum, p) => sum + p.streakDays, 0) / studentProgress.length)} days
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;