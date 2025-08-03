import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'teacher': return 'Teacher';
      case 'parent': return 'Parent';
      case 'admin': return 'Administrator';
      default: return 'Unknown';
    }
  };

  const getRoleDashboard = (role: string) => {
    switch (role) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'parent': return '/parent';
      case 'admin': return '/admin';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          
          {user && user.role && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Current user:</div>
              <div className="font-medium text-gray-800">{user.email}</div>
              <div className="text-sm text-blue-600">
                Role: {getRoleDisplayName(user.role)}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {user && user.role && (
              <button
                onClick={() => window.location.href = getRoleDashboard(user.role)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to My Dashboard
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Login
            </button>
            
            {user && (
              <button
                onClick={logout}
                className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;