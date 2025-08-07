import React from 'react';
import { AlertData } from '../firebase/teacherDashboard';

interface AlertCardProps {
  alert: AlertData;
  onDismiss?: (studentId: string) => void;
  className?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss, className = '' }) => {
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getTypeIcon = (type: 'no_xp' | 'no_reflection' | 'inactive') => {
    switch (type) {
      case 'no_xp':
        return '📉';
      case 'no_reflection':
        return '📝';
      case 'inactive':
        return '💤';
      default:
        return '❓';
    }
  };

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Alert';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getSeverityColor(alert.severity)} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="flex items-center mr-3">
            <span className="text-xl mr-1">{getSeverityIcon(alert.severity)}</span>
            <span className="text-lg">{getTypeIcon(alert.type)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <h4 className="font-semibold text-sm">
                {getSeverityLabel(alert.severity)}
              </h4>
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-60">
                {alert.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm mb-2">
              {alert.message}
            </p>
            <div className="text-xs opacity-75">
              Student: <span className="font-medium">{alert.studentName}</span>
            </div>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.studentId)}
            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Dismiss alert"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface AlertsGroupProps {
  alerts: AlertData[];
  title?: string;
  onDismiss?: (studentId: string) => void;
  maxDisplay?: number;
  className?: string;
}

export const AlertsGroup: React.FC<AlertsGroupProps> = ({ 
  alerts, 
  title = "⚠️ Student Alerts",
  onDismiss,
  maxDisplay = 5,
  className = ''
}) => {
  const displayAlerts = alerts.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, alerts.length - maxDisplay);

  if (alerts.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <div className="font-medium text-green-600">All Clear!</div>
          <div className="text-sm">No student alerts at this time</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
          {alerts.filter(a => a.severity === 'high').length > 0 && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              {alerts.filter(a => a.severity === 'high').length} urgent
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {displayAlerts.map((alert, index) => (
          <AlertCard 
            key={`${alert.studentId}-${alert.type}-${index}`} 
            alert={alert}
            onDismiss={onDismiss}
          />
        ))}
      </div>
      
      {hiddenCount > 0 && (
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600 py-2 px-4 bg-gray-50 rounded-lg">
            + {hiddenCount} more alert{hiddenCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 flex items-center">
            <span className="mr-2">🤖</span>
            Alerts are automatically generated based on student activity patterns.
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCard;