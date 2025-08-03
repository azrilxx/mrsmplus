import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { ParentModuleResponse, AgentContext, EngagementTip, ParentAction } from './types/agent-interfaces';
import { MotivationCard, ChildProgress } from '../types/dashboard';

interface ParentModuleHook {
  motivationCards: MotivationCard[];
  engagementTips: EngagementTip[];
  achievementHighlights: string[];
  concernAreas: string[];
  recommendedActions: ParentAction[];
  loading: boolean;
  error: string | null;
  generateMotivationContent: (childId: string) => Promise<void>;
  createCustomMotivationCard: (childId: string, achievement: string) => Promise<MotivationCard | null>;
  getPersonalizedTips: (childId: string, currentChallenges: string[]) => Promise<EngagementTip[]>;
  refreshParentInsights: () => Promise<void>;
}

export const useParentModule = (
  context: AgentContext,
  childrenData?: ChildProgress[],
  options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    includeProactiveTips?: boolean;
    motivationStyle?: 'encouraging' | 'achievement-focused' | 'growth-mindset';
  }
): ParentModuleHook => {
  const [motivationCards, setMotivationCards] = useState<MotivationCard[]>([]);
  const [engagementTips, setEngagementTips] = useState<EngagementTip[]>([]);
  const [achievementHighlights, setAchievementHighlights] = useState<string[]>([]);
  const [concernAreas, setConcernAreas] = useState<string[]>([]);
  const [recommendedActions, setRecommendedActions] = useState<ParentAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoRefresh = options?.autoRefresh ?? true;
  const refreshInterval = options?.refreshInterval ?? 240000; // 4 minutes
  const includeProactiveTips = options?.includeProactiveTips ?? true;
  const motivationStyle = options?.motivationStyle ?? 'growth-mindset';

  const generateParentContent = useCallback(async (targetChildId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const childrenContext = childrenData?.length 
        ? `Children data: ${childrenData.map(child => 
            `${child.name} (Level ${child.level}, ${child.weeklyProgress}/${child.weeklyGoal} weekly XP, favorite subjects: ${child.favoriteSubjects.join(', ')})`
          ).join('; ')}`
        : 'No specific children data available';

      const targetContext = targetChildId 
        ? `Focus on child: ${targetChildId}`
        : 'Generate content for all children';

      const prompt = `Generate personalized parent engagement content with motivation style: ${motivationStyle}.
      ${childrenContext}.
      ${targetContext}.
      ${includeProactiveTips ? 'Include proactive engagement tips and preventive strategies.' : ''}
      Current engagement context: ${context.userBehaviorData?.engagementMetrics?.dailyActiveMinutes || 'unknown'} daily active minutes.
      Parent role: Support learning journey, celebrate achievements, identify concerns early.`;

      const response = await agentClients.parent.invoke<ParentModuleResponse['data']>(
        prompt,
        { 
          ...context, 
          userId: targetChildId || context.userId,
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
        setMotivationCards(response.data.motivationCards);
        setEngagementTips(response.data.insights.engagementTips);
        setAchievementHighlights(response.data.insights.achievementHighlights);
        setConcernAreas(response.data.insights.concernAreas);
        setRecommendedActions(response.data.insights.recommendedActions);
      } else {
        throw new Error(response.error || 'Failed to generate parent content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Parent module error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, childrenData, includeProactiveTips, motivationStyle]);

  const generateMotivationContent = useCallback(async (childId: string) => {
    await generateParentContent(childId);
  }, [generateParentContent]);

  const createCustomMotivationCard = useCallback(async (
    childId: string, 
    achievement: string
  ): Promise<MotivationCard | null> => {
    try {
      const prompt = `Create a personalized motivation card for child ${childId} celebrating: ${achievement}.
      Use ${motivationStyle} approach. Make it specific, encouraging, and actionable for parents.
      Include suggestions for how parents can reinforce this achievement.`;

      const response = await agentClients.parent.invoke<ParentModuleResponse['data']>(
        prompt,
        { ...context, userId: childId }
      );

      if (response.success && response.data && response.data.motivationCards.length > 0) {
        const newCard = response.data.motivationCards[0];
        setMotivationCards(prev => [newCard, ...prev]);
        return newCard;
      }
      
      throw new Error(response.error || 'Failed to create motivation card');
    } catch (err) {
      console.error('Custom motivation card creation error:', err);
      return null;
    }
  }, [context, motivationStyle]);

  const getPersonalizedTips = useCallback(async (
    childId: string, 
    currentChallenges: string[]
  ): Promise<EngagementTip[]> => {
    try {
      const challengesContext = currentChallenges.length 
        ? `Current challenges: ${currentChallenges.join(', ')}`
        : 'No specific challenges identified';

      const prompt = `Generate personalized engagement tips for child ${childId}.
      ${challengesContext}.
      Focus on practical, actionable advice for parents.
      Use ${motivationStyle} approach and consider the child's learning patterns.`;

      const response = await agentClients.parent.invoke<ParentModuleResponse['data']>(
        prompt,
        { ...context, userId: childId }
      );

      if (response.success && response.data) {
        return response.data.insights.engagementTips;
      }
      
      throw new Error(response.error || 'Failed to generate personalized tips');
    } catch (err) {
      console.error('Personalized tips generation error:', err);
      return [];
    }
  }, [context, motivationStyle]);

  const refreshParentInsights = useCallback(async () => {
    await generateParentContent();
  }, [generateParentContent]);

  // Initial load
  useEffect(() => {
    generateParentContent();
  }, [generateParentContent]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generateParentContent();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, generateParentContent]);

  return {
    motivationCards,
    engagementTips,
    achievementHighlights,
    concernAreas,
    recommendedActions,
    loading,
    error,
    generateMotivationContent,
    createCustomMotivationCard,
    getPersonalizedTips,
    refreshParentInsights
  };
};

// Specialized hook for multiple children management
export const useMultiChildParentModule = (
  context: AgentContext,
  childrenData: ChildProgress[]
) => {
  return useParentModule(
    { ...context, role: 'parent' },
    childrenData,
    {
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes for multi-child view
      includeProactiveTips: true,
      motivationStyle: 'growth-mindset'
    }
  );
};

// Helper functions for motivation card styling
export const getMotivationCardStyling = (type: MotivationCard['type']) => {
  switch (type) {
    case 'praise':
      return {
        backgroundColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: '🌟'
      };
    case 'encouragement':
      return {
        backgroundColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        icon: '💪'
      };
    case 'tip':
      return {
        backgroundColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        icon: '💡'
      };
    case 'achievement':
      return {
        backgroundColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        icon: '🏆'
      };
    default:
      return {
        backgroundColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        icon: '📝'
      };
  }
};

// Helper function to categorize engagement tips
export const categorizeEngagementTips = (tips: EngagementTip[]) => {
  const categories = {
    motivation: tips.filter(tip => tip.category === 'motivation'),
    study_habits: tips.filter(tip => tip.category === 'study_habits'),
    goal_setting: tips.filter(tip => tip.category === 'goal_setting'),
    celebration: tips.filter(tip => tip.category === 'celebration')
  };

  return categories;
};

// Helper function to prioritize parent actions
export const prioritizeParentActions = (actions: ParentAction[]) => {
  const priorityOrder = ['intervention', 'support', 'conversation', 'reward'];
  
  return actions.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.type);
    const bPriority = priorityOrder.indexOf(b.type);
    return aPriority - bPriority;
  });
};

// Helper function to format achievement highlights for display
export const formatAchievementHighlights = (highlights: string[]) => {
  return highlights.map((highlight, index) => ({
    id: index,
    text: highlight,
    icon: getAchievementIcon(highlight),
    priority: getAchievementPriority(highlight)
  }));
};

const getAchievementIcon = (highlight: string): string => {
  if (highlight.toLowerCase().includes('streak')) return '🔥';
  if (highlight.toLowerCase().includes('score') || highlight.toLowerCase().includes('test')) return '📊';
  if (highlight.toLowerCase().includes('module') || highlight.toLowerCase().includes('lesson')) return '📚';
  if (highlight.toLowerCase().includes('time') || highlight.toLowerCase().includes('consistent')) return '⏰';
  return '⭐';
};

const getAchievementPriority = (highlight: string): 'high' | 'medium' | 'low' => {
  if (highlight.toLowerCase().includes('improved') || highlight.toLowerCase().includes('advanced')) return 'high';
  if (highlight.toLowerCase().includes('maintained') || highlight.toLowerCase().includes('consistent')) return 'medium';
  return 'low';
};