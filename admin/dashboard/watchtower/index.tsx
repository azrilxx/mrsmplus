import React, { useState, useEffect } from 'react';
import { WatchtowerHeader } from './components/WatchtowerHeader';
import { OverviewMetrics } from './components/OverviewMetrics';
import { StreamComparison } from './components/StreamComparison';
import { EngagementHeatmap } from './components/EngagementHeatmap';
import { XPProgressTracker } from './components/XPProgressTracker';
import { StudentPerformanceMatrix } from './components/StudentPerformanceMatrix';
import { AlertsPanel } from './components/AlertsPanel';
import { SubjectAnalytics } from './components/SubjectAnalytics';
import { TrendAnalysis } from './components/TrendAnalysis';
import { ExportReporting } from './components/ExportReporting';
import { FilterBar } from './components/FilterBar';

interface DashboardFilters {
  program: string[];
  dateRange: string;
  subject: string[];
  riskLevel: string[];
  engagementLevel: string[];
}

interface DashboardData {
  overview: any;
  streams: any[];
  students: any[];
  subjects: any[];
  alerts: any[];
  trends: any[];
  lastUpdated: string;
}

export const WatchtowerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<DashboardFilters>({
    program: [],
    dateRange: '7d',
    subject: [],
    riskLevel: [],
    engagementLevel: []
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);

  // Mock data for demonstration - replace with real API calls
  const mockDashboardData: DashboardData = {
    overview: {
      totalStudents: 1247,
      activeStudents: 892,
      totalXP: 187650,
      avgSessionTime: 28.5,
      completionRate: 76.8,
      riskStudents: 124,
      excellentPerformers: 298
    },
    streams: [
      {
        id: 'premier',
        name: 'Program Premier',
        students: 267,
        avgXP: 1850,
        completionRate: 84.2,
        riskLevel: 'low',
        topSubjects: ['Mathematics', 'Physics', 'Chemistry']
      },
      {
        id: 'bitara',
        name: 'Program Bitara',
        students: 234,
        avgXP: 1720,
        completionRate: 79.1,
        riskLevel: 'medium',
        topSubjects: ['Biology', 'Chemistry', 'Mathematics']
      },
      {
        id: 'ulul-albab',
        name: 'Program Ulul Albab',
        students: 198,
        avgXP: 1650,
        completionRate: 82.5,
        riskLevel: 'low',
        topSubjects: ['Islamic Studies', 'Arabic', 'Mathematics']
      },
      {
        id: 'igcse',
        name: 'Program IGCSE',
        students: 312,
        avgXP: 1920,
        completionRate: 87.3,
        riskLevel: 'low',
        topSubjects: ['English', 'Mathematics', 'Sciences']
      },
      {
        id: 'teknikal',
        name: 'Program Teknikal',
        students: 236,
        avgXP: 1580,
        completionRate: 72.4,
        riskLevel: 'high',
        topSubjects: ['Engineering', 'Mathematics', 'Technical Drawing']
      }
    ],
    students: [], // Will be populated with individual student data
    subjects: [], // Will be populated with subject performance data
    alerts: [
      {
        id: 'alert_1',
        type: 'risk',
        severity: 'high',
        message: '15 students in Program Teknikal showing declining engagement',
        timestamp: new Date().toISOString(),
        program: 'teknikal'
      },
      {
        id: 'alert_2',
        type: 'performance',
        severity: 'medium',
        message: 'Mathematics completion rate dropped 8% this week',
        timestamp: new Date().toISOString(),
        subject: 'Mathematics'
      }
    ],
    trends: [],
    lastUpdated: new Date().toISOString()
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates if enabled
    if (isRealTime) {
      const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [filters, isRealTime]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would make API calls
      // For now, using mock data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData(mockDashboardData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    // Export functionality implementation
    console.log(`Exporting data in ${format} format`);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Watchtower Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WatchtowerHeader 
        lastUpdated={dashboardData?.lastUpdated}
        isRealTime={isRealTime}
        onToggleRealTime={setIsRealTime}
        onRefresh={loadDashboardData}
      />

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'streams', name: 'Stream Analysis', icon: '🏫' },
              { id: 'students', name: 'Student Performance', icon: '👥' },
              { id: 'subjects', name: 'Subject Analytics', icon: '📚' },
              { id: 'engagement', name: 'Engagement', icon: '⚡' },
              { id: 'trends', name: 'Trends', icon: '📈' },
              { id: 'alerts', name: 'Alerts', icon: '🚨' },
              { id: 'export', name: 'Reports', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        streams={dashboardData?.streams || []}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OverviewMetrics data={dashboardData?.overview} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel alerts={dashboardData?.alerts || []} />
              <EngagementHeatmap data={dashboardData?.streams || []} />
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <StreamComparison streams={dashboardData?.streams || []} />
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <StudentPerformanceMatrix students={dashboardData?.students || []} />
            <XPProgressTracker data={dashboardData?.overview} />
          </div>
        )}

        {activeTab === 'subjects' && (
          <SubjectAnalytics subjects={dashboardData?.subjects || []} />
        )}

        {activeTab === 'engagement' && (
          <EngagementHeatmap data={dashboardData?.streams || []} detailed={true} />
        )}

        {activeTab === 'trends' && (
          <TrendAnalysis trends={dashboardData?.trends || []} />
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel alerts={dashboardData?.alerts || []} detailed={true} />
        )}

        {activeTab === 'export' && (
          <ExportReporting onExport={exportData} />
        )}
      </div>

      {/* Loading Overlay */}
      {loading && dashboardData && (
        <div className="fixed top-0 right-0 m-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Updating...
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchtowerDashboard;