import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { FeedbackSynthesizerResponse, AgentContext, RiskAnalysis, InterventionRecommendation, PerformanceTrend } from './types/agent-interfaces';
import { EngagementDiagnostic } from '../types/dashboard';

interface FeedbackSynthesizerHook {
  diagnostics: EngagementDiagnostic[];
  riskAnalysis: RiskAnalysis | null;
  interventionRecommendations: InterventionRecommendation[];
  performanceTrends: PerformanceTrend[];
  loading: boolean;
  error: string | null;
  analyzeBehaviorPatterns: (studentIds?: string[]) => Promise<void>;
  generateInterventionPlan: (studentId: string) => Promise<InterventionRecommendation[]>;
  assessRiskLevel: (studentId: string) => Promise<RiskAnalysis>;
  refreshDiagnostics: () => Promise<void>;
}

export const useFeedbackSynthesizer = (
  context: AgentContext,
  options?: {
    autoAnalyze?: boolean;
    analysisInterval?: number;
    includeDetailedTrends?: boolean;
    riskThreshold?: 'low' | 'medium' | 'high';
  }
): FeedbackSynthesizerHook => {
  const [diagnostics, setDiagnostics] = useState<EngagementDiagnostic[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [interventionRecommendations, setInterventionRecommendations] = useState<InterventionRecommendation[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoAnalyze = options?.autoAnalyze ?? true;
  const analysisInterval = options?.analysisInterval ?? 120000; // 2 minutes
  const includeDetailedTrends = options?.includeDetailedTrends ?? true;
  const riskThreshold = options?.riskThreshold ?? 'medium';

  const performBehaviorAnalysis = useCallback(async (targetStudentIds?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const studentContext = targetStudentIds?.length 
        ? `Analyze specific students: ${targetStudentIds.join(', ')}`
        : 'Analyze all students in context';

      const prompt = `Perform comprehensive behavioral analysis and generate diagnostic insights for ${context.role} dashboard. 
      ${studentContext}. 
      Focus on engagement patterns, learning difficulties, and intervention opportunities.
      Risk threshold set to: ${riskThreshold}.
      ${includeDetailedTrends ? 'Include detailed performance trends and predictive analysis.' : ''}
      Current context: User behavior data shows ${
        context.userBehaviorData?.engagementMetrics?.motivationLevel || 'unknown'
      } motivation level.`;

      const response = await agentClients.feedback.invoke<FeedbackSynthesizerResponse['data']>(
        prompt,
        { 
          ...context, 
          userBehaviorData: {
            ...context.userBehaviorData,
            recentActivity: context.userBehaviorData?.recentActivity || [],
            learningPatterns: context.userBehaviorData?.learningPatterns || [],
            engagementMetrics: context.userBehaviorData?.engagementMetrics || {
              dailyActiveMinutes: 0,
              streakDays: 0,
              motivationLevel: 0,
              frustrationIndicators: [],
              positiveTriggers: []
            },
            performanceHistory: context.userBehaviorData?.performanceHistory || []
          }
        }
      );

      if (response.success && response.data) {
        setDiagnostics(response.data.diagnostics);
        setRiskAnalysis(response.data.insights.riskAnalysis);
        setInterventionRecommendations(response.data.insights.interventionRecommendations);
        setPerformanceTrends(response.data.insights.performanceTrends);
      } else {
        throw new Error(response.error || 'Failed to generate diagnostic insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Feedback synthesizer error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, riskThreshold, includeDetailedTrends]);

  const analyzeBehaviorPatterns = useCallback(async (studentIds?: string[]) => {
    await performBehaviorAnalysis(studentIds);
  }, [performBehaviorAnalysis]);

  const generateInterventionPlan = useCallback(async (studentId: string): Promise<InterventionRecommendation[]> => {
    try {
      const prompt = `Generate specific intervention plan for student ${studentId}. 
      Analyze their current performance patterns, engagement levels, and learning difficulties.
      Provide actionable, time-bound recommendations with expected impact.`;

      const response = await agentClients.feedback.invoke<FeedbackSynthesizerResponse['data']>(
        prompt,
        { ...context, userId: studentId }
      );

      if (response.success && response.data) {
        return response.data.insights.interventionRecommendations;
      }
      
      throw new Error(response.error || 'Failed to generate intervention plan');
    } catch (err) {
      console.error('Intervention plan generation error:', err);
      return [];
    }
  }, [context]);

  const assessRiskLevel = useCallback(async (studentId: string): Promise<RiskAnalysis> => {
    try {
      const prompt = `Assess detailed risk level for student ${studentId}.
      Analyze engagement patterns, performance trends, and behavioral indicators.
      Provide risk score, urgency assessment, and time-to-intervention recommendations.`;

      const response = await agentClients.feedback.invoke<FeedbackSynthesizerResponse['data']>(
        prompt,
        { ...context, userId: studentId }
      );

      if (response.success && response.data) {
        return response.data.insights.riskAnalysis;
      }
      
      throw new Error(response.error || 'Failed to assess risk level');
    } catch (err) {
      console.error('Risk assessment error:', err);
      return {
        riskFactors: ['Assessment unavailable'],
        riskScore: 0,
        urgencyLevel: 'low',
        timeToIntervention: 0
      };
    }
  }, [context]);

  const refreshDiagnostics = useCallback(async () => {
    await performBehaviorAnalysis();
  }, [performBehaviorAnalysis]);

  // Initial analysis
  useEffect(() => {
    performBehaviorAnalysis();
  }, [performBehaviorAnalysis]);

  // Auto-analysis functionality
  useEffect(() => {
    if (!autoAnalyze) return;

    const interval = setInterval(() => {
      performBehaviorAnalysis();
    }, analysisInterval);

    return () => clearInterval(interval);
  }, [autoAnalyze, analysisInterval, performBehaviorAnalysis]);

  return {
    diagnostics,
    riskAnalysis,
    interventionRecommendations,
    performanceTrends,
    loading,
    error,
    analyzeBehaviorPatterns,
    generateInterventionPlan,
    assessRiskLevel,
    refreshDiagnostics
  };
};

// Specialized hook for teacher dashboard diagnostics
export const useTeacherDiagnostics = (context: AgentContext, classStudents?: string[]) => {
  return useFeedbackSynthesizer(
    { ...context, role: 'teacher' },
    {
      autoAnalyze: true,
      analysisInterval: 180000, // 3 minutes for teacher view
      includeDetailedTrends: true,
      riskThreshold: 'medium'
    }
  );
};

// Specialized hook for admin dashboard analytics
export const useAdminDiagnostics = (context: AgentContext) => {
  return useFeedbackSynthesizer(
    { ...context, role: 'admin' },
    {
      autoAnalyze: true,
      analysisInterval: 300000, // 5 minutes for admin view
      includeDetailedTrends: true,
      riskThreshold: 'low' // Catch issues early at admin level
    }
  );
};

// Helper functions for risk level visualization
export const getRiskLevelStyling = (riskLevel: 'low' | 'medium' | 'high') => {
  switch (riskLevel) {
    case 'low':
      return {
        color: 'text-green-600',
        backgroundColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '✅'
      };
    case 'medium':
      return {
        color: 'text-yellow-600',
        backgroundColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: '⚠️'
      };
    case 'high':
      return {
        color: 'text-red-600',
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '🚨'
      };
    default:
      return {
        color: 'text-gray-600',
        backgroundColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '❓'
      };
  }
};

// Helper function to prioritize interventions
export const prioritizeInterventions = (recommendations: InterventionRecommendation[]) => {
  return recommendations.sort((a, b) => {
    const difficultyWeight = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };
    
    // Prioritize by impact potential and implementation ease
    return difficultyWeight[a.implementationDifficulty] - difficultyWeight[b.implementationDifficulty];
  });
};

// Helper function to format performance trends for display
export const formatPerformanceTrends = (trends: PerformanceTrend[]) => {
  return trends.map(trend => ({
    ...trend,
    displayIcon: trend.direction === 'improving' ? '📈' : 
                 trend.direction === 'declining' ? '📉' : '➡️',
    displayColor: trend.direction === 'improving' ? 'text-green-600' :
                  trend.direction === 'declining' ? 'text-red-600' : 'text-gray-600',
    magnitudeLabel: trend.magnitude > 15 ? 'Significant' :
                   trend.magnitude > 8 ? 'Moderate' : 'Slight'
  }));
};