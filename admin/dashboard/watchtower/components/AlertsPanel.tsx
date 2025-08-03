import React, { useState } from 'react';

interface Alert {
  id: string;
  type: 'risk' | 'performance' | 'engagement' | 'system' | 'achievement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  program?: string;
  subject?: string;
  studentCount?: number;
  actionRequired?: boolean;
  resolved?: boolean;
}

interface AlertsPanelProps {
  alerts: Alert[];
  detailed?: boolean;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, detailed = false }) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'high' | 'critical'>('unresolved');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'type'>('timestamp');

  // Mock additional alerts for detailed view
  const mockAlerts: Alert[] = [
    {
      id: 'alert_1',
      type: 'risk',
      severity: 'high',
      message: '15 students in Program Teknikal showing declining engagement over past week',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      program: 'teknikal',
      studentCount: 15,
      actionRequired: true,
      resolved: false
    },
    {
      id: 'alert_2',
      type: 'performance',
      severity: 'medium',
      message: 'Mathematics completion rate dropped 8% compared to last week',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      subject: 'Mathematics',
      actionRequired: true,
      resolved: false
    },
    {
      id: 'alert_3',
      type: 'engagement',
      severity: 'critical',
      message: 'Average session time decreased by 35% in Program Bitara',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      program: 'bitara',
      studentCount: 23,
      actionRequired: true,
      resolved: false
    },
    {
      id: 'alert_4',
      type: 'achievement',
      severity: 'low',
      message: 'Program Premier reaches 90% completion milestone',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      program: 'premier',
      actionRequired: false,
      resolved: true
    },
    {
      id: 'alert_5',
      type: 'system',
      severity: 'medium',
      message: 'XP calculation service experiencing slower response times',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actionRequired: true,
      resolved: false
    },
    {
      id: 'alert_6',
      type: 'risk',
      severity: 'high',
      message: '8 students haven\'t logged in for more than 5 days',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      studentCount: 8,
      actionRequired: true,
      resolved: false
    }
  ];

  const allAlerts = detailed ? mockAlerts : alerts;

  const filteredAlerts = allAlerts.filter(alert => {
    switch (filter) {
      case 'unresolved':
        return !alert.resolved;
      case 'high':
        return alert.severity === 'high' || alert.severity === 'critical';
      case 'critical':
        return alert.severity === 'critical';
      default:
        return true;
    }
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' };
      case 'high': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' };
      case 'low': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-500' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk': return '⚠️';
      case 'performance': return '📉';
      case 'engagement': return '⚡';
      case 'system': return '🔧';
      case 'achievement': return '🎉';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSeverityBadge = (severity: string) => {
    const colors = getSeverityColor(severity);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        <span className={`w-2 h-2 rounded-full mr-1 ${colors.dot}`}></span>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const unresolvedCount = allAlerts.filter(alert => !alert.resolved).length;
  const criticalCount = allAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length;
  const highCount = allAlerts.filter(alert => alert.severity === 'high' && !alert.resolved).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {detailed ? 'Alert Management Center' : 'Recent Alerts'}
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              {unresolvedCount} unresolved
            </span>
            {criticalCount > 0 && (
              <span className="text-red-600 font-medium">
                {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className="text-orange-600 font-medium">
                {highCount} high priority
              </span>
            )}
          </div>
        </div>
        
        {detailed && (
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Alerts</option>
                <option value="unresolved">Unresolved</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Recent</option>
                <option value="severity">Severity</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {detailed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
            <div className="text-sm text-orange-600">High Priority</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{unresolvedCount}</div>
            <div className="text-sm text-blue-600">Unresolved</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {allAlerts.filter(a => a.resolved).length}
            </div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No alerts match your current filters</p>
          </div>
        ) : (
          sortedAlerts.slice(0, detailed ? undefined : 5).map((alert) => {
            const colors = getSeverityColor(alert.severity);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${colors.border} ${colors.bg} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-xs text-gray-500">
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </span>
                        {alert.program && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {alert.program}
                          </span>
                        )}
                        {alert.subject && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {alert.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        {alert.studentCount && (
                          <span>{alert.studentCount} students affected</span>
                        )}
                        {alert.actionRequired && !alert.resolved && (
                          <span className="text-red-600 font-medium">Action required</span>
                        )}
                        {alert.resolved && (
                          <span className="text-green-600 font-medium">✓ Resolved</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {detailed && (
                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.resolved && (
                        <>
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Investigate
                          </button>
                          <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            Resolve
                          </button>
                        </>
                      )}
                      <button className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!detailed && sortedAlerts.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {sortedAlerts.length} alerts →
          </button>
        </div>
      )}

      {detailed && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedAlerts.length} of {allAlerts.length} alerts
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Export Alerts
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create Alert Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;