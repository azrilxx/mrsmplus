import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { LeaderboardEngineResponse, AgentContext } from './types/agent-interfaces';
import { LeaderboardEntry } from '../types/dashboard';

interface LeaderboardEngineHook {
  leaderboard: LeaderboardEntry[];
  competitiveMetrics: {
    rankMovement: number;
    xpGrowthRate: number;
    streakComparison: number;
    subjectStandings: { [subject: string]: number };
  } | null;
  motivationalMessages: string[];
  achievementOpportunities: string[];
  loading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
  generateCompetitiveInsights: (userId: string) => Promise<void>;
}

export const useLeaderboardEngine = (
  context: AgentContext,
  options?: { 
    autoRefresh?: boolean; 
    refreshInterval?: number;
    includeMotivation?: boolean;
  }
): LeaderboardEngineHook => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competitiveMetrics, setCompetitiveMetrics] = useState<any>(null);
  const [motivationalMessages, setMotivationalMessages] = useState<string[]>([]);
  const [achievementOpportunities, setAchievementOpportunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoRefresh = options?.autoRefresh ?? true;
  const refreshInterval = options?.refreshInterval ?? 30000; // 30 seconds
  const includeMotivation = options?.includeMotivation ?? true;

  const generateLeaderboardData = useCallback(async (targetUserId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Generate dynamic leaderboard data with competitive insights for ${context.role} dashboard. ${
        targetUserId ? `Focus on user ${targetUserId} competitive position and growth opportunities.` : ''
      } ${
        includeMotivation ? 'Include motivational messages and achievement opportunities.' : ''
      } Context: Current time is ${new Date().toISOString()}, user behavior indicates ${
        context.userBehaviorData?.engagementMetrics?.streakDays || 'unknown'
      } day streak.`;

      const response = await agentClients.leaderboard.invoke<LeaderboardEngineResponse['data']>(
        prompt,
        { ...context, userId: targetUserId || context.userId }
      );

      if (response.success && response.data) {
        setLeaderboard(response.data.leaderboard);
        setCompetitiveMetrics(response.data.insights.competitiveMetrics);
        setMotivationalMessages(response.data.insights.motivationalMessages);
        setAchievementOpportunities(response.data.insights.achievementOpportunities);
      } else {
        throw new Error(response.error || 'Failed to generate leaderboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Leaderboard engine error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, includeMotivation]);

  const refreshLeaderboard = useCallback(async () => {
    await generateLeaderboardData();
  }, [generateLeaderboardData]);

  const generateCompetitiveInsights = useCallback(async (userId: string) => {
    await generateLeaderboardData(userId);
  }, [generateLeaderboardData]);

  // Initial load
  useEffect(() => {
    generateLeaderboardData();
  }, [generateLeaderboardData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generateLeaderboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, generateLeaderboardData]);

  return {
    leaderboard,
    competitiveMetrics,
    motivationalMessages,
    achievementOpportunities,
    loading,
    error,
    refreshLeaderboard,
    generateCompetitiveInsights
  };
};

// Specialized hook for teacher dashboard leaderboard
export const useTeacherLeaderboard = (context: AgentContext) => {
  return useLeaderboardEngine(
    { ...context, role: 'teacher' },
    { 
      autoRefresh: true, 
      refreshInterval: 60000, // 1 minute for teacher view
      includeMotivation: false // Teachers need analytics, not motivation
    }
  );
};

// Specialized hook for student dashboard leaderboard
export const useStudentLeaderboard = (context: AgentContext) => {
  return useLeaderboardEngine(
    { ...context, role: 'student' },
    { 
      autoRefresh: true, 
      refreshInterval: 30000, // 30 seconds for student view
      includeMotivation: true // Students benefit from motivational content
    }
  );
};

// Helper function to get rank-based styling
export const getLeaderboardStyling = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        badgeColor: 'bg-yellow-500 text-white',
        borderColor: 'border-yellow-400',
        icon: '🥇'
      };
    case 2:
      return {
        badgeColor: 'bg-gray-400 text-white',
        borderColor: 'border-gray-300',
        icon: '🥈'
      };
    case 3:
      return {
        badgeColor: 'bg-amber-600 text-white',
        borderColor: 'border-amber-500',
        icon: '🥉'
      };
    default:
      return {
        badgeColor: 'bg-blue-500 text-white',
        borderColor: 'border-blue-200',
        icon: '🏆'
      };
  }
};

// Helper function to format competitive metrics for display
export const formatCompetitiveMetrics = (metrics: any) => {
  if (!metrics) return [];

  return [
    {
      label: 'Rank Movement',
      value: metrics.rankMovement > 0 ? `+${metrics.rankMovement}` : metrics.rankMovement.toString(),
      color: metrics.rankMovement > 0 ? 'text-green-600' : metrics.rankMovement < 0 ? 'text-red-600' : 'text-gray-600',
      icon: metrics.rankMovement > 0 ? '📈' : metrics.rankMovement < 0 ? '📉' : '➡️'
    },
    {
      label: 'XP Growth Rate',
      value: `${metrics.xpGrowthRate.toFixed(1)}%`,
      color: metrics.xpGrowthRate > 10 ? 'text-green-600' : 'text-gray-600',
      icon: '⚡'
    },
    {
      label: 'Streak Performance',
      value: `${metrics.streakComparison > 0 ? '+' : ''}${metrics.streakComparison} days`,
      color: metrics.streakComparison > 0 ? 'text-green-600' : 'text-gray-600',
      icon: '🔥'
    }
  ];
};