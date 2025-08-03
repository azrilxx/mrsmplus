import React from 'react';
import { SystemAlert } from '../../../types/dashboard';

interface SystemAlertsProps {
  alerts: SystemAlert[];
  maxAlerts?: number;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ 
  alerts, 
  maxAlerts = 10 
}) => {
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);
  const displayAlerts = alerts.slice(0, maxAlerts);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📋';
    }
  };

  const getAlertColor = (type: string, resolved: boolean) => {
    if (resolved) {
      return 'bg-gray-50 border-gray-200 text-gray-600';
    }
    
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">🔔 System Alerts</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>{unresolvedAlerts.length} Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>{resolvedAlerts.length} Resolved</span>
          </div>
        </div>
      </div>

      {unresolvedAlerts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Active Alerts
          </h4>
          <div className="space-y-3">
            {unresolvedAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type, alert.resolved)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="text-xl mr-3 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{alert.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2">
                        {alert.message}
                      </p>
                      <div className="text-xs opacity-75">
                        {formatTime(alert.timestamp)} • {getTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded border transition-colors">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Recently Resolved
          </h4>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 ${getAlertColor(alert.type, alert.resolved)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-lg mr-3">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs opacity-75">
                        Resolved {getTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm">✓</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔔</div>
          <p>All systems operational</p>
          <p className="text-sm">No alerts to display</p>
        </div>
      )}

      {alerts.length > maxAlerts && (
        <div className="mt-4 pt-4 border-t text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all {alerts.length} alerts →
          </button>
        </div>
      )}
    </div>
  );
};