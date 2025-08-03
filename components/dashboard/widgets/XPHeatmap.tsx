import React from 'react';
import { XPStats } from '../../../types/dashboard';

interface XPHeatmapProps {
  stats: XPStats;
}

export const XPHeatmap: React.FC<XPHeatmapProps> = ({ stats }) => {
  const maxCount = Math.max(...stats.xpDistribution.map(d => d.count));

  const getIntensityClass = (count: number) => {
    const intensity = (count / maxCount) * 100;
    if (intensity >= 80) return 'bg-blue-500';
    if (intensity >= 60) return 'bg-blue-400';
    if (intensity >= 40) return 'bg-blue-300';
    if (intensity >= 20) return 'bg-blue-200';
    return 'bg-blue-100';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">⭐ XP Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Overall Statistics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Total XP Earned</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(stats.totalXPEarned / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Average per User</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.averageXPPerUser.toLocaleString()}
                </div>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Weekly Growth</div>
                <div className="text-2xl font-bold text-purple-600">
                  +{stats.weeklyXPGrowth}%
                </div>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-4">XP Distribution</h4>
          <div className="space-y-3">
            {stats.xpDistribution.map((distribution, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 font-medium">
                  {distribution.range}
                </div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className={`h-6 rounded-full transition-all duration-300 ${getIntensityClass(distribution.count)}`}
                      style={{ width: `${(distribution.count / maxCount) * 100}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {distribution.count}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-500 text-right">
                  {((distribution.count / stats.xpDistribution.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-700 mb-4">🏆 Top Performers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.topPerformers.slice(0, 5).map((performer, index) => {
            const rankColors = [
              'bg-yellow-100 text-yellow-800 border-yellow-200',
              'bg-gray-100 text-gray-800 border-gray-200',
              'bg-orange-100 text-orange-800 border-orange-200',
              'bg-blue-100 text-blue-800 border-blue-200',
              'bg-purple-100 text-purple-800 border-purple-200'
            ];
            
            return (
              <div key={performer.userId} className={`p-3 rounded-lg border ${rankColors[index]}`}>
                <div className="text-center">
                  <div className="text-lg font-bold">#{performer.rank}</div>
                  <div className="text-sm font-medium truncate">{performer.name}</div>
                  <div className="text-xs opacity-75">Level {performer.level}</div>
                  <div className="text-sm font-bold mt-1">
                    {performer.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};