// Agent Integration Hooks Export
// Centralized export for all MARA+ agent integration hooks

// Core agent hooks
export * from './useLeaderboardEngine';
export * from './useFeedbackSynthesizer';
export * from './useParentModule';
export * from './useStudyReflection';
export * from './useWatchtowerSentinel';
export * from './useXPSyncAgent';

// Main orchestrator
export * from './useAgentOrchestrator';

// Types and utilities
export * from './types/agent-interfaces';
export * from './utils/agent-client';

// Existing hooks
export * from './useAuth';
export * from './useMockFirestore';

// Re-export commonly used specialized hooks for convenience
export {
  useStudentLeaderboard,
  useTeacherLeaderboard,
  getLeaderboardStyling,
  formatCompetitiveMetrics
} from './useLeaderboardEngine';

export {
  useTeacherDiagnostics,
  useAdminDiagnostics,
  getRiskLevelStyling,
  prioritizeInterventions,
  formatPerformanceTrends
} from './useFeedbackSynthesizer';

export {
  useMultiChildParentModule,
  getMotivationCardStyling,
  categorizeEngagementTips,
  prioritizeParentActions,
  formatAchievementHighlights
} from './useParentModule';

export {
  usePostSessionReflection,
  getMoodStyling,
  categorizeInsights,
  formatConfidenceLevel
} from './useStudyReflection';

export {
  useAdminWatchtower,
  useRealTimeMonitoring,
  getAlertStyling,
  prioritizeAlerts,
  formatHealthScore,
  categorizePerformanceTrends,
  formatPredictiveUrgency
} from './useWatchtowerSentinel';

export {
  useStudentXPSync,
  useTeacherXPSync,
  useAdminXPSync,
  getSyncStatusStyling,
  prioritizeDiscrepancies,
  formatSyncLatency,
  calculateSyncProgress
} from './useXPSyncAgent';

export {
  useStudentDashboardAgents,
  useTeacherDashboardAgents,
  useParentDashboardAgents,
  useAdminDashboardAgents,
  getOverallAgentHealth
} from './useAgentOrchestrator';