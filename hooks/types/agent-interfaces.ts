// Agent integration interfaces for MARA+ dashboard system
import { 
  LeaderboardEntry, 
  EngagementDiagnostic, 
  MotivationCard, 
  StudyReflection, 
  SystemAlert,
  XPProgress,
  StudentOverview
} from '../../types/dashboard';

// Base agent response interface
export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  agentId: string;
}

// Agent request context interface
export interface AgentContext {
  userId?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  sessionId?: string;
  userBehaviorData?: UserBehaviorData;
  systemMetrics?: SystemMetrics;
}

// User behavior data for intelligent analysis
export interface UserBehaviorData {
  recentActivity: ActivityRecord[];
  learningPatterns: LearningPattern[];
  engagementMetrics: EngagementMetrics;
  performanceHistory: PerformanceRecord[];
}

export interface ActivityRecord {
  timestamp: Date;
  type: 'study' | 'quiz' | 'reflection' | 'login' | 'logout';
  subject?: string;
  duration?: number;
  xpEarned?: number;
  performance?: number;
}

export interface LearningPattern {
  subject: string;
  preferredTimeOfDay: number[];
  averageSessionDuration: number;
  strongConcepts: string[];
  strugglingConcepts: string[];
  learningVelocity: number;
}

export interface EngagementMetrics {
  dailyActiveMinutes: number;
  streakDays: number;
  motivationLevel: number;
  frustrationIndicators: string[];
  positiveTriggers: string[];
}

export interface PerformanceRecord {
  date: Date;
  subject: string;
  accuracyRate: number;
  completionTime: number;
  confidenceLevel: number;
  conceptMastery: { [concept: string]: number };
}

// System metrics for monitoring
export interface SystemMetrics {
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  systemLoad: number;
  memoryUsage: number;
  databaseConnections: number;
}

// Specialized agent response types
export interface LeaderboardEngineResponse extends AgentResponse<{
  leaderboard: LeaderboardEntry[];
  insights: {
    competitiveMetrics: CompetitiveMetrics;
    motivationalMessages: string[];
    achievementOpportunities: string[];
  };
}> {}

export interface CompetitiveMetrics {
  rankMovement: number;
  xpGrowthRate: number;
  streakComparison: number;
  subjectStandings: { [subject: string]: number };
}

export interface FeedbackSynthesizerResponse extends AgentResponse<{
  diagnostics: EngagementDiagnostic[];
  insights: {
    riskAnalysis: RiskAnalysis;
    interventionRecommendations: InterventionRecommendation[];
    performanceTrends: PerformanceTrend[];
  };
}> {}

export interface RiskAnalysis {
  riskFactors: string[];
  riskScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  timeToIntervention: number;
}

export interface InterventionRecommendation {
  type: 'content' | 'pedagogical' | 'motivational' | 'technical';
  action: string;
  expectedImpact: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}

export interface PerformanceTrend {
  subject: string;
  direction: 'improving' | 'declining' | 'stable';
  magnitude: number;
  predictedOutcome: string;
}

export interface ParentModuleResponse extends AgentResponse<{
  motivationCards: MotivationCard[];
  insights: {
    engagementTips: EngagementTip[];
    achievementHighlights: string[];
    concernAreas: string[];
    recommendedActions: ParentAction[];
  };
}> {}

export interface EngagementTip {
  category: 'motivation' | 'study_habits' | 'goal_setting' | 'celebration';
  tip: string;
  context: string;
  expectedOutcome: string;
}

export interface ParentAction {
  type: 'conversation' | 'reward' | 'support' | 'intervention';
  description: string;
  timing: string;
  materials?: string[];
}

export interface StudyReflectionResponse extends AgentResponse<{
  reflection: StudyReflection;
  insights: {
    personalizedFeedback: string[];
    growthAreas: string[];
    celebrationPoints: string[];
    nextSteps: string[];
  };
}> {}

export interface WatchtowerSentinelResponse extends AgentResponse<{
  alerts: SystemAlert[];
  insights: {
    systemHealth: HealthMetrics;
    performanceAnalysis: PerformanceAnalysis;
    predictiveAlerts: PredictiveAlert[];
  };
}> {}

export interface HealthMetrics {
  overallScore: number;
  componentHealth: { [component: string]: number };
  bottlenecks: string[];
  recommendations: string[];
}

export interface PerformanceAnalysis {
  trends: { metric: string; direction: 'up' | 'down' | 'stable'; change: number }[];
  anomalies: string[];
  optimizationOpportunities: string[];
}

export interface PredictiveAlert {
  type: 'capacity' | 'performance' | 'error' | 'user_behavior';
  message: string;
  probability: number;
  timeToOccurrence: number;
  preventiveActions: string[];
}

export interface XPSyncAgentResponse extends AgentResponse<{
  xpProgress: XPProgress;
  insights: {
    syncStatus: SyncStatus;
    discrepancies: Discrepancy[];
    optimizationSuggestions: string[];
  };
}> {}

export interface SyncStatus {
  lastSyncTime: Date;
  syncHealth: 'healthy' | 'degraded' | 'failed';
  pendingSyncs: number;
  syncLatency: number;
}

export interface Discrepancy {
  userId: string;
  type: 'xp_mismatch' | 'level_mismatch' | 'progress_mismatch';
  expected: any;
  actual: any;
  impact: 'low' | 'medium' | 'high';
}

// Agent configuration interface
export interface AgentConfig {
  enabled: boolean;
  cacheTTL: number;
  retryAttempts: number;
  timeout: number;
  fallbackToMock: boolean;
}