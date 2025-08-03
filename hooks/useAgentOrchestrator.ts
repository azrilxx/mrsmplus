import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentContext, UserBehaviorData } from './types/agent-interfaces';
import { DashboardData } from '../types/dashboard';

// Individual agent hooks
import { useLeaderboardEngine, useStudentLeaderboard, useTeacherLeaderboard } from './useLeaderboardEngine';
import { useFeedbackSynthesizer, useTeacherDiagnostics, useAdminDiagnostics } from './useFeedbackSynthesizer';
import { useParentModule, useMultiChildParentModule } from './useParentModule';
import { useStudyReflection, usePostSessionReflection } from './useStudyReflection';
import { useWatchtowerSentinel, useAdminWatchtower, useRealTimeMonitoring } from './useWatchtowerSentinel';
import { useXPSyncAgent, useStudentXPSync, useTeacherXPSync, useAdminXPSync } from './useXPSyncAgent';

interface AgentOrchestratorHook {
  dashboardData: DashboardData;
  loading: boolean;
  error: string | null;
  agentStatuses: { [agentName: string]: AgentStatus };
  refreshAllAgents: () => Promise<void>;
  enableAgent: (agentName: string) => void;
  disableAgent: (agentName: string) => void;
  updateUserBehavior: (behaviorData: Partial<UserBehaviorData>) => void;
  generateIntelligentInsights: () => Promise<IntelligentInsights>;
}

interface AgentStatus {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  responseTime: number;
}

interface IntelligentInsights {
  crossAgentPatterns: string[];
  emergingTrends: string[];
  actionableRecommendations: string[];
  riskFactors: string[];
  opportunityAreas: string[];
}

interface AgentOrchestratorConfig {
  role: 'student' | 'teacher' | 'parent' | 'admin';
  userId?: string;
  enabledAgents?: string[];
  refreshInterval?: number;
  enableCrossAgentAnalysis?: boolean;
  prioritizeRealTimeUpdates?: boolean;
}

export const useAgentOrchestrator = (
  config: AgentOrchestratorConfig
): AgentOrchestratorHook => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<{ [agentName: string]: AgentStatus }>({});
  const [userBehaviorData, setUserBehaviorData] = useState<UserBehaviorData | undefined>();

  const behaviorDataRef = useRef<UserBehaviorData | undefined>();
  behaviorDataRef.current = userBehaviorData;

  const defaultEnabledAgents = {
    student: ['leaderboard_engine', 'study_reflection', 'xp_sync_agent'],
    teacher: ['leaderboard_engine', 'feedback-synthesizer', 'xp_sync_agent'],
    parent: ['parent_module', 'xp_sync_agent'],
    admin: ['feedback-synthesizer', 'watchtower-sentinel', 'xp_sync_agent', 'leaderboard_engine']
  };

  const enabledAgents = config.enabledAgents || defaultEnabledAgents[config.role];
  const refreshInterval = config.refreshInterval || 60000; // 1 minute default
  const enableCrossAgentAnalysis = config.enableCrossAgentAnalysis ?? true;
  const prioritizeRealTimeUpdates = config.prioritizeRealTimeUpdates ?? false;

  // Create agent context
  const agentContext: AgentContext = {
    userId: config.userId,
    role: config.role,
    sessionId: `session-${Date.now()}`,
    userBehaviorData: behaviorDataRef.current,
    systemMetrics: {
      responseTime: 245,
      errorRate: 0.02,
      activeUsers: 892,
      systemLoad: 0.65,
      memoryUsage: 0.78,
      databaseConnections: 45
    }
  };

  // Initialize individual agent hooks based on role
  const leaderboardHook = config.role === 'student' 
    ? useStudentLeaderboard(agentContext)
    : config.role === 'teacher' 
    ? useTeacherLeaderboard(agentContext)
    : useLeaderboardEngine(agentContext);

  const feedbackHook = config.role === 'teacher'
    ? useTeacherDiagnostics(agentContext)
    : config.role === 'admin'
    ? useAdminDiagnostics(agentContext)
    : useFeedbackSynthesizer(agentContext);

  const parentHook = useParentModule(agentContext);
  const reflectionHook = useStudyReflection(agentContext);
  
  const watchtowerHook = config.role === 'admin'
    ? prioritizeRealTimeUpdates 
      ? useRealTimeMonitoring(agentContext)
      : useAdminWatchtower(agentContext)
    : useWatchtowerSentinel(agentContext);

  const xpSyncHook = config.role === 'student'
    ? useStudentXPSync(agentContext)
    : config.role === 'teacher'
    ? useTeacherXPSync(agentContext)
    : config.role === 'admin'
    ? useAdminXPSync(agentContext)
    : useXPSyncAgent(agentContext);

  // Update agent statuses
  useEffect(() => {
    const newStatuses: { [agentName: string]: AgentStatus } = {};

    if (enabledAgents.includes('leaderboard_engine')) {
      newStatuses.leaderboard_engine = {
        enabled: true,
        loading: leaderboardHook.loading,
        error: leaderboardHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 500 + 200
      };
    }

    if (enabledAgents.includes('feedback-synthesizer')) {
      newStatuses['feedback-synthesizer'] = {
        enabled: true,
        loading: feedbackHook.loading,
        error: feedbackHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 700 + 300
      };
    }

    if (enabledAgents.includes('parent_module')) {
      newStatuses.parent_module = {
        enabled: true,
        loading: parentHook.loading,
        error: parentHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 600 + 250
      };
    }

    if (enabledAgents.includes('study_reflection')) {
      newStatuses.study_reflection = {
        enabled: true,
        loading: reflectionHook.loading,
        error: reflectionHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 400 + 180
      };
    }

    if (enabledAgents.includes('watchtower-sentinel')) {
      newStatuses['watchtower-sentinel'] = {
        enabled: true,
        loading: watchtowerHook.loading,
        error: watchtowerHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 300 + 150
      };
    }

    if (enabledAgents.includes('xp_sync_agent')) {
      newStatuses.xp_sync_agent = {
        enabled: true,
        loading: xpSyncHook.loading,
        error: xpSyncHook.error,
        lastUpdate: new Date(),
        responseTime: Math.random() * 200 + 100
      };
    }

    setAgentStatuses(newStatuses);
  }, [
    enabledAgents,
    leaderboardHook.loading, leaderboardHook.error,
    feedbackHook.loading, feedbackHook.error,
    parentHook.loading, parentHook.error,
    reflectionHook.loading, reflectionHook.error,
    watchtowerHook.loading, watchtowerHook.error,
    xpSyncHook.loading, xpSyncHook.error
  ]);

  // Aggregate dashboard data from all agents
  useEffect(() => {
    const newDashboardData: DashboardData = {};

    switch (config.role) {
      case 'student':
        newDashboardData.student = {
          xpProgress: xpSyncHook.xpProgress || {
            currentXP: 0,
            level: 1,
            xpToNextLevel: 100,
            totalXP: 0,
            weeklyProgress: 0
          },
          lessonProgress: [], // Would come from lesson tracking agent
          recentAnswers: [], // Would come from study mode agent
          studyReflection: reflectionHook.reflection || {
            id: 'default',
            userId: config.userId || 'unknown',
            date: new Date(),
            mood: 'neutral',
            insights: [],
            areasForImprovement: [],
            strengths: [],
            confidenceLevel: 5
          }
        };
        break;

      case 'teacher':
        newDashboardData.teacher = {
          students: [], // Would come from student management agent
          leaderboard: leaderboardHook.leaderboard,
          engagementDiagnostics: feedbackHook.diagnostics,
          classStats: {
            totalStudents: 28,
            averageXP: 2156,
            completionRate: 73
          }
        };
        break;

      case 'parent':
        newDashboardData.parent = {
          children: [], // Would be provided from child data
          motivationCards: parentHook.motivationCards,
          familyStats: {
            totalXP: xpSyncHook.xpProgress?.totalXP || 0,
            activeChildren: 1,
            weeklyGoalProgress: 107
          }
        };
        break;

      case 'admin':
        newDashboardData.admin = {
          userStats: {
            totalUsers: 2547,
            activeUsersToday: 892,
            activeUsersWeek: 1876,
            newUsersToday: 23,
            retentionRate: 0.74
          },
          xpStats: {
            totalXPEarned: 1247500,
            averageXPPerUser: 490,
            weeklyXPGrowth: 12.5,
            topPerformers: leaderboardHook.leaderboard.slice(0, 5),
            xpDistribution: [
              { range: '0-500', count: 425 },
              { range: '501-1000', count: 678 },
              { range: '1001-2000', count: 543 },
              { range: '2001-3000', count: 287 },
              { range: '3000+', count: 156 }
            ]
          },
          studyModeUsage: {
            totalSessions: 15420,
            averageSessionDuration: 32,
            popularSubjects: [
              { subject: 'Mathematics', sessionCount: 4521 },
              { subject: 'Physics', sessionCount: 3876 },
              { subject: 'Chemistry', sessionCount: 3234 }
            ],
            peakHours: [
              { hour: 19, sessionCount: 1245 },
              { hour: 20, sessionCount: 1567 },
              { hour: 21, sessionCount: 1234 }
            ],
            completionRates: [
              { subject: 'Mathematics', rate: 78 },
              { subject: 'Physics', rate: 65 },
              { subject: 'Chemistry', rate: 72 }
            ]
          },
          systemAlerts: watchtowerHook.alerts,
          systemHealth: {
            uptime: watchtowerHook.systemHealth?.overallScore || 99.8,
            responseTime: 245,
            errorRate: 0.02
          }
        };
        break;
    }

    setDashboardData(newDashboardData);
  }, [
    config.role,
    config.userId,
    leaderboardHook.leaderboard,
    feedbackHook.diagnostics,
    parentHook.motivationCards,
    reflectionHook.reflection,
    watchtowerHook.alerts,
    watchtowerHook.systemHealth,
    xpSyncHook.xpProgress
  ]);

  const refreshAllAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const refreshPromises = [];

      if (enabledAgents.includes('leaderboard_engine')) {
        refreshPromises.push(leaderboardHook.refreshLeaderboard());
      }
      if (enabledAgents.includes('feedback-synthesizer')) {
        refreshPromises.push(feedbackHook.refreshDiagnostics());
      }
      if (enabledAgents.includes('parent_module')) {
        refreshPromises.push(parentHook.refreshParentInsights());
      }
      if (enabledAgents.includes('study_reflection')) {
        refreshPromises.push(reflectionHook.refreshReflection());
      }
      if (enabledAgents.includes('watchtower-sentinel')) {
        refreshPromises.push(watchtowerHook.refreshMonitoring());
      }
      if (enabledAgents.includes('xp_sync_agent')) {
        refreshPromises.push(xpSyncHook.refreshSyncStatus());
      }

      await Promise.allSettled(refreshPromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh agents');
    } finally {
      setLoading(false);
    }
  }, [enabledAgents, leaderboardHook, feedbackHook, parentHook, reflectionHook, watchtowerHook, xpSyncHook]);

  const enableAgent = useCallback((agentName: string) => {
    setAgentStatuses(prev => ({
      ...prev,
      [agentName]: {
        ...prev[agentName],
        enabled: true
      }
    }));
  }, []);

  const disableAgent = useCallback((agentName: string) => {
    setAgentStatuses(prev => ({
      ...prev,
      [agentName]: {
        ...prev[agentName],
        enabled: false
      }
    }));
  }, []);

  const updateUserBehavior = useCallback((behaviorData: Partial<UserBehaviorData>) => {
    setUserBehaviorData(prev => ({
      ...prev,
      ...behaviorData,
      recentActivity: behaviorData.recentActivity || prev?.recentActivity || [],
      learningPatterns: behaviorData.learningPatterns || prev?.learningPatterns || [],
      engagementMetrics: {
        ...prev?.engagementMetrics,
        ...behaviorData.engagementMetrics
      } as any,
      performanceHistory: behaviorData.performanceHistory || prev?.performanceHistory || []
    }));
  }, []);

  const generateIntelligentInsights = useCallback(async (): Promise<IntelligentInsights> => {
    if (!enableCrossAgentAnalysis) {
      return {
        crossAgentPatterns: [],
        emergingTrends: [],
        actionableRecommendations: [],
        riskFactors: [],
        opportunityAreas: []
      };
    }

    // Cross-agent pattern analysis
    const crossAgentPatterns = [];
    const emergingTrends = [];
    const actionableRecommendations = [];
    const riskFactors = [];
    const opportunityAreas = [];

    // Analyze patterns across different agents
    if (leaderboardHook.competitiveMetrics && reflectionHook.reflection) {
      if (leaderboardHook.competitiveMetrics.rankMovement > 0 && reflectionHook.reflection.confidenceLevel > 7) {
        crossAgentPatterns.push('Rising confidence correlates with improved leaderboard performance');
        opportunityAreas.push('Leverage high confidence to maintain competitive momentum');
      }
    }

    if (feedbackHook.riskAnalysis && xpSyncHook.syncStatus) {
      if (feedbackHook.riskAnalysis.riskScore > 70 && xpSyncHook.syncStatus.syncHealth === 'degraded') {
        riskFactors.push('High-risk students may be affected by sync issues');
        actionableRecommendations.push('Prioritize sync resolution for at-risk students');
      }
    }

    if (parentHook.concernAreas.length > 0 && watchtowerHook.systemHealth) {
      if (watchtowerHook.systemHealth.overallScore < 90) {
        emergingTrends.push('System performance issues may impact family engagement');
        actionableRecommendations.push('Address system performance to maintain parent satisfaction');
      }
    }

    return {
      crossAgentPatterns,
      emergingTrends,
      actionableRecommendations,
      riskFactors,
      opportunityAreas
    };
  }, [
    enableCrossAgentAnalysis,
    leaderboardHook.competitiveMetrics,
    reflectionHook.reflection,
    feedbackHook.riskAnalysis,
    xpSyncHook.syncStatus,
    parentHook.concernAreas,
    watchtowerHook.systemHealth
  ]);

  // Auto-refresh all agents periodically
  useEffect(() => {
    const interval = setInterval(refreshAllAgents, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshAllAgents, refreshInterval]);

  return {
    dashboardData,
    loading,
    error,
    agentStatuses,
    refreshAllAgents,
    enableAgent,
    disableAgent,
    updateUserBehavior,
    generateIntelligentInsights
  };
};

// Specialized orchestrator hooks for each role
export const useStudentDashboardAgents = (userId: string) => {
  return useAgentOrchestrator({
    role: 'student',
    userId,
    enabledAgents: ['leaderboard_engine', 'study_reflection', 'xp_sync_agent'],
    refreshInterval: 30000, // 30 seconds for students
    enableCrossAgentAnalysis: true,
    prioritizeRealTimeUpdates: true
  });
};

export const useTeacherDashboardAgents = (userId: string) => {
  return useAgentOrchestrator({
    role: 'teacher',
    userId,
    enabledAgents: ['leaderboard_engine', 'feedback-synthesizer', 'xp_sync_agent'],
    refreshInterval: 60000, // 1 minute for teachers
    enableCrossAgentAnalysis: true,
    prioritizeRealTimeUpdates: false
  });
};

export const useParentDashboardAgents = (userId: string) => {
  return useAgentOrchestrator({
    role: 'parent',
    userId,
    enabledAgents: ['parent_module', 'xp_sync_agent'],
    refreshInterval: 120000, // 2 minutes for parents
    enableCrossAgentAnalysis: false,
    prioritizeRealTimeUpdates: false
  });
};

export const useAdminDashboardAgents = (userId: string) => {
  return useAgentOrchestrator({
    role: 'admin',
    userId,
    enabledAgents: ['feedback-synthesizer', 'watchtower-sentinel', 'xp_sync_agent', 'leaderboard_engine'],
    refreshInterval: 45000, // 45 seconds for admins
    enableCrossAgentAnalysis: true,
    prioritizeRealTimeUpdates: true
  });
};

// Helper function to get overall agent health
export const getOverallAgentHealth = (agentStatuses: { [agentName: string]: AgentStatus }) => {
  const statuses = Object.values(agentStatuses);
  const enabledStatuses = statuses.filter(status => status.enabled);
  
  if (enabledStatuses.length === 0) return { health: 'unknown', score: 0 };
  
  const healthyCount = enabledStatuses.filter(status => !status.error && !status.loading).length;
  const errorCount = enabledStatuses.filter(status => status.error).length;
  const loadingCount = enabledStatuses.filter(status => status.loading).length;
  
  const healthScore = (healthyCount / enabledStatuses.length) * 100;
  
  if (errorCount > 0) return { health: 'degraded', score: healthScore };
  if (loadingCount === enabledStatuses.length) return { health: 'loading', score: healthScore };
  if (healthScore >= 90) return { health: 'healthy', score: healthScore };
  if (healthScore >= 70) return { health: 'fair', score: healthScore };
  
  return { health: 'poor', score: healthScore };
};