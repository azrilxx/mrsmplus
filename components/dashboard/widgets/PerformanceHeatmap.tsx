import React from 'react';
import { EngagementDiagnostic } from '../../../types/dashboard';

interface PerformanceHeatmapProps {
  diagnostics: EngagementDiagnostic[];
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ diagnostics }) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-800 bg-green-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'high': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDaysAgo = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
  };

  const atRiskStudents = diagnostics.filter(d => d.riskLevel === 'high' || d.riskLevel === 'medium');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Performance Diagnostics</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>High Risk</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {diagnostics.map((diagnostic) => (
          <div key={diagnostic.userId} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800 truncate">{diagnostic.name}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskTextColor(diagnostic.riskLevel)}`}>
                {diagnostic.riskLevel}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
              <div>
                <div className="text-xs text-gray-500">Avg. Session</div>
                <div className="font-medium">{diagnostic.averageSessionTime}m</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Completion</div>
                <div className="font-medium">{diagnostic.completionRate}%</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              Last active: {formatDaysAgo(diagnostic.lastActivity)}
            </div>
            
            {diagnostic.strugglingSubjects.length > 0 && (
              <div className="text-xs">
                <div className="text-gray-500 mb-1">Struggling with:</div>
                <div className="flex flex-wrap gap-1">
                  {diagnostic.strugglingSubjects.slice(0, 2).map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {subject}
                    </span>
                  ))}
                  {diagnostic.strugglingSubjects.length > 2 && (
                    <span className="text-gray-500">+{diagnostic.strugglingSubjects.length - 2} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {atRiskStudents.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">⚠️ Students Needing Attention</h4>
          <div className="space-y-2">
            {atRiskStudents.slice(0, 3).map((student) => (
              <div key={student.userId} className="flex items-center justify-between p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                <div>
                  <div className="font-medium text-gray-800">{student.name}</div>
                  <div className="text-sm text-gray-600">
                    {student.recommendations[0]}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskTextColor(student.riskLevel)}`}>
                  {student.riskLevel} risk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {diagnostics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );
};