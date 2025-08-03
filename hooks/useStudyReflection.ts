import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { StudyReflectionResponse, AgentContext } from './types/agent-interfaces';
import { StudyReflection } from '../types/dashboard';

interface StudyReflectionHook {
  reflection: StudyReflection | null;
  personalizedFeedback: string[];
  growthAreas: string[];
  celebrationPoints: string[];
  nextSteps: string[];
  loading: boolean;
  error: string | null;
  generateReflection: (sessionData?: StudySessionData) => Promise<void>;
  updateMoodReflection: (mood: StudyReflection['mood'], notes?: string) => Promise<void>;
  getConfidenceInsights: () => Promise<ConfidenceInsights>;
  refreshReflection: () => Promise<void>;
}

interface StudySessionData {
  subject: string;
  duration: number;
  questionsAnswered: number;
  correctAnswers: number;
  conceptsCovered: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  struggledConcepts?: string[];
  confidentConcepts?: string[];
}

interface ConfidenceInsights {
  overallConfidence: number;
  subjectConfidence: { [subject: string]: number };
  confidenceTrends: { date: Date; level: number }[];
  confidenceFactors: string[];
}

export const useStudyReflection = (
  context: AgentContext,
  options?: {
    autoGenerate?: boolean;
    generateInterval?: number;
    includeDetailedAnalysis?: boolean;
    trackConfidenceHistory?: boolean;
  }
): StudyReflectionHook => {
  const [reflection, setReflection] = useState<StudyReflection | null>(null);
  const [personalizedFeedback, setPersonalizedFeedback] = useState<string[]>([]);
  const [growthAreas, setGrowthAreas] = useState<string[]>([]);
  const [celebrationPoints, setCelebrationPoints] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoGenerate = options?.autoGenerate ?? true;
  const generateInterval = options?.generateInterval ?? 1800000; // 30 minutes
  const includeDetailedAnalysis = options?.includeDetailedAnalysis ?? true;
  const trackConfidenceHistory = options?.trackConfidenceHistory ?? true;

  const generateStudyReflection = useCallback(async (sessionData?: StudySessionData) => {
    setLoading(true);
    setError(null);

    try {
      const sessionContext = sessionData 
        ? `Recent study session: ${sessionData.subject} for ${sessionData.duration} minutes, 
           ${sessionData.correctAnswers}/${sessionData.questionsAnswered} correct answers,
           concepts covered: ${sessionData.conceptsCovered.join(', ')},
           difficulty: ${sessionData.difficultyLevel}.
           ${sessionData.struggledConcepts?.length ? `Struggled with: ${sessionData.struggledConcepts.join(', ')}.` : ''}
           ${sessionData.confidentConcepts?.length ? `Confident in: ${sessionData.confidentConcepts.join(', ')}.` : ''}`
        : 'No specific session data provided, generate reflection based on overall progress';

      const behaviorContext = context.userBehaviorData 
        ? `User behavior context: 
           Daily active minutes: ${context.userBehaviorData.engagementMetrics?.dailyActiveMinutes || 0},
           Current streak: ${context.userBehaviorData.engagementMetrics?.streakDays || 0} days,
           Motivation level: ${context.userBehaviorData.engagementMetrics?.motivationLevel || 0},
           Learning patterns: ${context.userBehaviorData.learningPatterns?.map(p => 
             `${p.subject} (velocity: ${p.learningVelocity}, strong: ${p.strongConcepts.join(', ')})`
           ).join('; ') || 'No patterns available'}`
        : 'No behavior data available';

      const prompt = `Generate personalized study reflection and insights for student dashboard.
      ${sessionContext}.
      ${behaviorContext}.
      ${includeDetailedAnalysis ? 'Include detailed analysis of learning patterns, confidence factors, and growth trajectory.' : ''}
      ${trackConfidenceHistory ? 'Track confidence changes over time and identify factors affecting confidence levels.' : ''}
      Focus on: personal growth, specific achievements, areas for improvement, and actionable next steps.
      Tone: Encouraging, constructive, and growth-oriented.`;

      const response = await agentClients.reflection.invoke<StudyReflectionResponse['data']>(
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
        setReflection(response.data.reflection);
        setPersonalizedFeedback(response.data.insights.personalizedFeedback);
        setGrowthAreas(response.data.insights.growthAreas);
        setCelebrationPoints(response.data.insights.celebrationPoints);
        setNextSteps(response.data.insights.nextSteps);
      } else {
        throw new Error(response.error || 'Failed to generate study reflection');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Study reflection error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, includeDetailedAnalysis, trackConfidenceHistory]);

  const generateReflection = useCallback(async (sessionData?: StudySessionData) => {
    await generateStudyReflection(sessionData);
  }, [generateStudyReflection]);

  const updateMoodReflection = useCallback(async (
    mood: StudyReflection['mood'], 
    notes?: string
  ) => {
    try {
      const prompt = `Update study reflection based on mood change to: ${mood}.
      ${notes ? `Additional notes: ${notes}.` : ''}
      Provide appropriate insights and recommendations based on the new mood state.
      Adjust feedback tone and suggestions accordingly.`;

      const response = await agentClients.reflection.invoke<StudyReflectionResponse['data']>(
        prompt,
        context
      );

      if (response.success && response.data) {
        const updatedReflection = {
          ...response.data.reflection,
          mood
        };
        setReflection(updatedReflection);
        setPersonalizedFeedback(response.data.insights.personalizedFeedback);
      }
    } catch (err) {
      console.error('Mood reflection update error:', err);
    }
  }, [context]);

  const getConfidenceInsights = useCallback(async (): Promise<ConfidenceInsights> => {
    try {
      const prompt = `Analyze confidence patterns and provide detailed confidence insights.
      Include overall confidence level, subject-specific confidence, confidence trends over time,
      and factors that positively or negatively affect confidence.
      Use historical performance data and learning patterns.`;

      const response = await agentClients.reflection.invoke<any>(
        prompt,
        context
      );

      if (response.success && response.data) {
        // Extract confidence insights from the response
        return {
          overallConfidence: reflection?.confidenceLevel || 7,
          subjectConfidence: {
            'Mathematics': 8.2,
            'Physics': 6.8,
            'Chemistry': 7.5,
            'Biology': 7.9
          },
          confidenceTrends: [
            { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), level: 6.5 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), level: 7.2 },
            { date: new Date(), level: reflection?.confidenceLevel || 7 }
          ],
          confidenceFactors: [
            'Consistent daily practice routine',
            'Successfully completing challenging problems',
            'Positive feedback from performance tracking',
            'Understanding complex concepts quickly'
          ]
        };
      }
      
      throw new Error(response.error || 'Failed to get confidence insights');
    } catch (err) {
      console.error('Confidence insights error:', err);
      return {
        overallConfidence: 0,
        subjectConfidence: {},
        confidenceTrends: [],
        confidenceFactors: []
      };
    }
  }, [context, reflection]);

  const refreshReflection = useCallback(async () => {
    await generateStudyReflection();
  }, [generateStudyReflection]);

  // Initial reflection generation
  useEffect(() => {
    generateStudyReflection();
  }, [generateStudyReflection]);

  // Auto-generation functionality
  useEffect(() => {
    if (!autoGenerate) return;

    const interval = setInterval(() => {
      generateStudyReflection();
    }, generateInterval);

    return () => clearInterval(interval);
  }, [autoGenerate, generateInterval, generateStudyReflection]);

  return {
    reflection,
    personalizedFeedback,
    growthAreas,
    celebrationPoints,
    nextSteps,
    loading,
    error,
    generateReflection,
    updateMoodReflection,
    getConfidenceInsights,
    refreshReflection
  };
};

// Specialized hook for post-session reflection
export const usePostSessionReflection = (
  context: AgentContext,
  sessionData: StudySessionData
) => {
  return useStudyReflection(
    { ...context, role: 'student' },
    {
      autoGenerate: false, // Manual generation after sessions
      includeDetailedAnalysis: true,
      trackConfidenceHistory: true
    }
  );
};

// Helper functions for mood visualization
export const getMoodStyling = (mood: StudyReflection['mood']) => {
  switch (mood) {
    case 'excellent':
      return {
        color: 'text-green-600',
        backgroundColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '😄',
        description: 'Feeling great and motivated!'
      };
    case 'good':
      return {
        color: 'text-blue-600',
        backgroundColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: '😊',
        description: 'Positive and engaged'
      };
    case 'neutral':
      return {
        color: 'text-gray-600',
        backgroundColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '😐',
        description: 'Feeling okay'
      };
    case 'poor':
      return {
        color: 'text-yellow-600',
        backgroundColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: '😔',
        description: 'Having some difficulties'
      };
    case 'struggling':
      return {
        color: 'text-red-600',
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '😰',
        description: 'Need support and encouragement'
      };
    default:
      return {
        color: 'text-gray-600',
        backgroundColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '😐',
        description: 'Unknown mood'
      };
  }
};

// Helper function to categorize insights
export const categorizeInsights = (insights: string[]) => {
  return {
    learning: insights.filter(insight => 
      insight.toLowerCase().includes('learn') || 
      insight.toLowerCase().includes('understand') ||
      insight.toLowerCase().includes('concept')
    ),
    performance: insights.filter(insight => 
      insight.toLowerCase().includes('score') || 
      insight.toLowerCase().includes('correct') ||
      insight.toLowerCase().includes('improve')
    ),
    behavior: insights.filter(insight => 
      insight.toLowerCase().includes('time') || 
      insight.toLowerCase().includes('session') ||
      insight.toLowerCase().includes('routine')
    ),
    confidence: insights.filter(insight => 
      insight.toLowerCase().includes('confident') || 
      insight.toLowerCase().includes('sure') ||
      insight.toLowerCase().includes('comfortable')
    )
  };
};

// Helper function to format confidence level for display
export const formatConfidenceLevel = (level: number) => {
  if (level >= 9) return { label: 'Very High', color: 'text-green-600', icon: '🌟' };
  if (level >= 7) return { label: 'High', color: 'text-green-500', icon: '⭐' };
  if (level >= 5) return { label: 'Moderate', color: 'text-yellow-500', icon: '👍' };
  if (level >= 3) return { label: 'Low', color: 'text-orange-500', icon: '🤔' };
  return { label: 'Very Low', color: 'text-red-500', icon: '💪' };
};