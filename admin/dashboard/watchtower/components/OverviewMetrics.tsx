import React from 'react';

interface OverviewMetricsProps {
  data: {
    totalStudents: number;
    activeStudents: number;
    totalXP: number;
    avgSessionTime: number;
    completionRate: number;
    riskStudents: number;
    excellentPerformers: number;
  } | undefined;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Students',
      value: data.totalStudents.toLocaleString(),
      icon: '👥',
      color: 'blue',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Active Today',
      value: data.activeStudents.toLocaleString(),
      icon: '🟢',
      color: 'green',
      trend: '+12.1%',
      trendUp: true,
      subtitle: `${Math.round((data.activeStudents / data.totalStudents) * 100)}% engagement`
    },
    {
      title: 'Total XP Earned',
      value: `${(data.totalXP / 1000).toFixed(1)}K`,
      icon: '⭐',
      color: 'yellow',
      trend: '+28.3%',
      trendUp: true
    },
    {
      title: 'Avg. Session Time',
      value: `${data.avgSessionTime}m`,
      icon: '⏱️',
      color: 'purple',
      trend: '+2.1%',
      trendUp: true
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate}%`,
      icon: '✅',
      color: 'emerald',
      trend: '-1.8%',
      trendUp: false
    },
    {
      title: 'At Risk',
      value: data.riskStudents.toString(),
      icon: '⚠️',
      color: 'red',
      trend: '-8.4%',
      trendUp: false,
      subtitle: `${Math.round((data.riskStudents / data.totalStudents) * 100)}% of total`
    },
    {
      title: 'Top Performers',
      value: data.excellentPerformers.toString(),
      icon: '🏆',
      color: 'amber',
      trend: '+15.7%',
      trendUp: true,
      subtitle: `${Math.round((data.excellentPerformers / data.totalStudents) * 100)}% of total`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const colorClasses = getColorClasses(metric.color);
        return (
          <div
            key={index}
            className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${colorClasses.border} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`flex items-center text-xs font-medium ${
                metric.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg
                  className={`w-3 h-3 mr-1 ${metric.trendUp ? '' : 'transform rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 17H7" />
                </svg>
                {metric.trend}
              </div>
            </div>
            
            <div className={`text-2xl font-bold ${colorClasses.text} mb-1`}>
              {metric.value}
            </div>
            
            <div className="text-sm text-gray-600 font-medium mb-1">
              {metric.title}
            </div>
            
            {metric.subtitle && (
              <div className="text-xs text-gray-500">
                {metric.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OverviewMetrics;