import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseWithFallback } from '../hooks/useFirebaseWithFallback';
import { DashboardData, StudyReflection } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';
import { 
  XPProgress, 
  LessonTracker, 
  RecentAnswers 
} from '../components/dashboard/widgets';

const StudentDashboard: React.FC = () => {
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
      const data = await getDashboardData('student');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setDataLoading(false);
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

  const studentData = dashboardData?.student;

  if (!studentData) {
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <XPProgress data={studentData.xpProgress} />
          </div>
          
          <div className="lg:col-span-2">
            <LessonTracker lessons={studentData.lessonProgress} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <RecentAnswers answers={studentData.recentAnswers} />
          </div>
          
          <div>
            <StudyReflectionCard reflection={studentData.studyReflection} />
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
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudentDashboard;