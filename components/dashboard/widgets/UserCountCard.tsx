import React from 'react';
import { UserStats } from '../../../types/dashboard';

interface UserCountCardProps {
  stats: UserStats;
}

export const UserCountCard: React.FC<UserCountCardProps> = ({ stats }) => {
  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'blue',
      change: '+5.2%',
      changeType: 'increase'
    },
    {
      title: 'Active Today',
      value: stats.activeUsersToday.toLocaleString(),
      icon: '🟢',
      color: 'green',
      change: `${((stats.activeUsersToday / stats.totalUsers) * 100).toFixed(1)}%`,
      changeType: 'percentage',
      subtitle: 'of total users'
    },
    {
      title: 'Active This Week',
      value: stats.activeUsersWeek.toLocaleString(),
      icon: '📅',
      color: 'purple',
      change: `${((stats.activeUsersWeek / stats.totalUsers) * 100).toFixed(1)}%`,
      changeType: 'percentage',
      subtitle: 'weekly engagement'
    },
    {
      title: 'New Today',
      value: stats.newUsersToday.toLocaleString(),
      icon: '✨',
      color: 'yellow',
      change: '+12.3%',
      changeType: 'increase'
    },
    {
      title: 'Retention Rate',
      value: `${(stats.retentionRate * 100).toFixed(1)}%`,
      icon: '🔄',
      color: 'indigo',
      change: stats.retentionRate >= 0.7 ? 'Good' : 'Needs Attention',
      changeType: stats.retentionRate >= 0.7 ? 'positive' : 'negative'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">📊 User Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const colorClasses = getColorClasses(metric.color);
          
          return (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${colorClasses.bg} ${colorClasses.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{metric.icon}</div>
                <div className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
                  {metric.change}
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${colorClasses.text} mb-1`}>
                {metric.value}
              </div>
              
              <div className="text-sm font-medium text-gray-700">
                {metric.title}
              </div>
              
              {metric.subtitle && (
                <div className="text-xs text-gray-500 mt-1">
                  {metric.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-800">
              {((stats.activeUsersToday / stats.totalUsers) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Daily Engagement</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-800">
              {(stats.newUsersToday / (stats.totalUsers / 30)).toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">Growth Rate</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-800">
              {(stats.totalUsers - stats.activeUsersWeek).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Inactive Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};