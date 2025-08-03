import React from 'react';
import { LeaderboardEntry } from '../../../types/dashboard';

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  maxEntries?: number;
  showWeeklyXP?: boolean;
}

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({ 
  entries, 
  maxEntries = 5,
  showWeeklyXP = true 
}) => {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🏆 Leaderboard</h3>
        <span className="text-sm text-gray-500">Top {maxEntries}</span>
      </div>
      
      <div className="space-y-3">
        {displayEntries.map((entry) => (
          <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <div className="font-medium text-gray-800">{entry.name}</div>
                <div className="text-sm text-gray-500">Level {entry.level}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-gray-800">{entry.xp.toLocaleString()} XP</div>
              {showWeeklyXP && (
                <div className="text-sm text-green-600">+{entry.weeklyXP} this week</div>
              )}
              {entry.streak > 0 && (
                <div className="flex items-center justify-end text-xs text-orange-600">
                  <span className="mr-1">🔥</span>
                  {entry.streak} day streak
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {displayEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>Leaderboard coming soon!</p>
        </div>
      )}
    </div>
  );
};