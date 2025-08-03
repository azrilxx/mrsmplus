import React, { useEffect } from 'react';
import { useAuth, UserRole } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = redirectTo;
        return;
      }

      if (user.role && !allowedRoles.includes(user.role)) {
        window.location.href = '/unauthorized';
        return;
      }
    }
  }, [user, loading, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Authenticating...</div>
          <div className="text-sm text-gray-500">Please wait while we verify your access</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-lg font-medium text-gray-700">Authentication Required</div>
          <div className="text-sm text-gray-500">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  if (user.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <div className="text-lg font-medium text-gray-700">Access Denied</div>
          <div className="text-sm text-gray-500">
            You don't have permission to access this page
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Required roles: {allowedRoles.join(', ')}
          </div>
          <div className="text-xs text-gray-400">
            Your role: {user.role || 'none'}
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};