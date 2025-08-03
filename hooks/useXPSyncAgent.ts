import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { XPSyncAgentResponse, AgentContext, SyncStatus, Discrepancy } from './types/agent-interfaces';
import { XPProgress } from '../types/dashboard';

interface XPSyncAgentHook {
  xpProgress: XPProgress | null;
  syncStatus: SyncStatus | null;
  discrepancies: Discrepancy[];
  optimizationSuggestions: string[];
  loading: boolean;
  error: string | null;
  syncXPData: (userId?: string) => Promise<void>;
  resolveDiscrepancy: (discrepancyUserId: string, discrepancyType: string) => Promise<void>;
  validateSync: (userIds: string[]) => Promise<Discrepancy[]>;
  forceSyncAll: () => Promise<void>;
  refreshSyncStatus: () => Promise<void>;
}

interface XPSyncConfig {
  enableRealTimeSync?: boolean;
  syncInterval?: number;
  enableDiscrepancyDetection?: boolean;
  autoResolveMinorDiscrepancies?: boolean;
  syncBatchSize?: number;
}

export const useXPSyncAgent = (
  context: AgentContext,
  config?: XPSyncConfig
): XPSyncAgentHook => {
  const [xpProgress, setXPProgress] = useState<XPProgress | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableRealTimeSync = config?.enableRealTimeSync ?? true;
  const syncInterval = config?.syncInterval ?? 30000; // 30 seconds
  const enableDiscrepancyDetection = config?.enableDiscrepancyDetection ?? true;
  const autoResolveMinorDiscrepancies = config?.autoResolveMinorDiscrepancies ?? true;
  const syncBatchSize = config?.syncBatchSize ?? 50;

  const performXPSync = useCallback(async (targetUserId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const userContext = targetUserId 
        ? `Target user: ${targetUserId}`
        : `Context user: ${context.userId || 'system'}`;

      const syncContext = `
        Sync configuration: Real-time sync ${enableRealTimeSync ? 'enabled' : 'disabled'},
        Discrepancy detection ${enableDiscrepancyDetection ? 'enabled' : 'disabled'},
        Auto-resolve minor ${autoResolveMinorDiscrepancies ? 'enabled' : 'disabled'},
        Batch size: ${syncBatchSize}
      `;

      const prompt = `Perform XP synchronization and data consistency check for MARA+ platform.
      ${userContext}.
      ${syncContext}.
      User behavior context: ${
        context.userBehaviorData?.recentActivity?.length || 0
      } recent activities, ${
        context.userBehaviorData?.engagementMetrics?.streakDays || 0
      } day streak.
      Ensure data consistency across all dashboard views (student, teacher, parent, admin).
      Identify and flag discrepancies requiring attention.
      Provide optimization suggestions for sync performance.`;

      const response = await agentClients.xpSync.invoke<XPSyncAgentResponse['data']>(
        prompt,
        {
          ...context,
          userId: targetUserId || context.userId,
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
        setXPProgress(response.data.xpProgress);
        setSyncStatus(response.data.insights.syncStatus);
        setDiscrepancies(response.data.insights.discrepancies);
        setOptimizationSuggestions(response.data.insights.optimizationSuggestions);

        // Auto-resolve minor discrepancies if enabled
        if (autoResolveMinorDiscrepancies) {
          const minorDiscrepancies = response.data.insights.discrepancies.filter(
            d => d.impact === 'low'
          );
          
          for (const discrepancy of minorDiscrepancies) {
            await resolveDiscrepancyInternal(discrepancy.userId, discrepancy.type);
          }
        }
      } else {
        throw new Error(response.error || 'Failed to perform XP synchronization');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('XP sync agent error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, enableRealTimeSync, enableDiscrepancyDetection, autoResolveMinorDiscrepancies, syncBatchSize]);

  const syncXPData = useCallback(async (userId?: string) => {
    await performXPSync(userId);
  }, [performXPSync]);

  const resolveDiscrepancyInternal = useCallback(async (userId: string, discrepancyType: string) => {
    try {
      const prompt = `Resolve XP discrepancy for user ${userId} of type: ${discrepancyType}.
      Analyze the root cause and apply appropriate correction.
      Ensure data consistency across all systems after resolution.`;

      await agentClients.xpSync.invoke(prompt, { ...context, userId });
      
      // Remove resolved discrepancy from the list
      setDiscrepancies(prev => prev.filter(d => 
        !(d.userId === userId && d.type === discrepancyType)
      ));
      
      console.log(`Resolved discrepancy: ${discrepancyType} for user ${userId}`);
    } catch (err) {
      console.error('Discrepancy resolution error:', err);
    }
  }, [context]);

  const resolveDiscrepancy = useCallback(async (discrepancyUserId: string, discrepancyType: string) => {
    await resolveDiscrepancyInternal(discrepancyUserId, discrepancyType);
  }, [resolveDiscrepancyInternal]);

  const validateSync = useCallback(async (userIds: string[]): Promise<Discrepancy[]> => {
    try {
      const prompt = `Validate XP synchronization for specific users: ${userIds.join(', ')}.
      Check for data consistency issues, missing updates, and sync delays.
      Return detailed discrepancy analysis.`;

      const response = await agentClients.xpSync.invoke<XPSyncAgentResponse['data']>(
        prompt,
        context
      );

      if (response.success && response.data) {
        const detectedDiscrepancies = response.data.insights.discrepancies;
        setDiscrepancies(prev => [...prev, ...detectedDiscrepancies]);
        return detectedDiscrepancies;
      }
      
      throw new Error(response.error || 'Failed to validate sync');
    } catch (err) {
      console.error('Sync validation error:', err);
      return [];
    }
  }, [context]);

  const forceSyncAll = useCallback(async () => {
    try {
      const prompt = `Force complete XP synchronization for all users and systems.
      Rebuild consistency across all dashboard views and resolve all pending discrepancies.
      This is a comprehensive sync operation.`;

      const response = await agentClients.xpSync.invoke<XPSyncAgentResponse['data']>(
        prompt,
        context
      );

      if (response.success && response.data) {
        setXPProgress(response.data.xpProgress);
        setSyncStatus(response.data.insights.syncStatus);
        setDiscrepancies([]); // Clear discrepancies after force sync
        setOptimizationSuggestions(response.data.insights.optimizationSuggestions);
      }
    } catch (err) {
      console.error('Force sync error:', err);
      setError(err instanceof Error ? err.message : 'Force sync failed');
    }
  }, [context]);

  const refreshSyncStatus = useCallback(async () => {
    await performXPSync();
  }, [performXPSync]);

  // Initial sync
  useEffect(() => {
    performXPSync();
  }, [performXPSync]);

  // Real-time sync functionality
  useEffect(() => {
    if (!enableRealTimeSync) return;

    const interval = setInterval(() => {
      performXPSync();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [enableRealTimeSync, syncInterval, performXPSync]);

  return {
    xpProgress,
    syncStatus,
    discrepancies,
    optimizationSuggestions,
    loading,
    error,
    syncXPData,
    resolveDiscrepancy,
    validateSync,
    forceSyncAll,
    refreshSyncStatus
  };
};

// Specialized hooks for different dashboard views
export const useStudentXPSync = (context: AgentContext) => {
  return useXPSyncAgent(
    { ...context, role: 'student' },
    {
      enableRealTimeSync: true,
      syncInterval: 15000, // 15 seconds for students (immediate feedback)
      enableDiscrepancyDetection: false, // Students don't need to see discrepancies
      autoResolveMinorDiscrepancies: true
    }
  );
};

export const useTeacherXPSync = (context: AgentContext) => {
  return useXPSyncAgent(
    { ...context, role: 'teacher' },
    {
      enableRealTimeSync: true,
      syncInterval: 30000, // 30 seconds for teachers
      enableDiscrepancyDetection: true,
      autoResolveMinorDiscrepancies: true,
      syncBatchSize: 30 // Teacher's class size
    }
  );
};

export const useAdminXPSync = (context: AgentContext) => {
  return useXPSyncAgent(
    { ...context, role: 'admin' },
    {
      enableRealTimeSync: true,
      syncInterval: 60000, // 1 minute for admins
      enableDiscrepancyDetection: true,
      autoResolveMinorDiscrepancies: false, // Admins should review discrepancies
      syncBatchSize: 100 // Larger batch for admin operations
    }
  );
};

// Helper functions for sync status visualization
export const getSyncStatusStyling = (syncHealth: SyncStatus['syncHealth']) => {
  switch (syncHealth) {
    case 'healthy':
      return {
        color: 'text-green-600',
        backgroundColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '✅',
        description: 'All systems synchronized'
      };
    case 'degraded':
      return {
        color: 'text-yellow-600',
        backgroundColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: '⚠️',
        description: 'Sync performance degraded'
      };
    case 'failed':
      return {
        color: 'text-red-600',
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '❌',
        description: 'Sync failures detected'
      };
    default:
      return {
        color: 'text-gray-600',
        backgroundColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '❓',
        description: 'Status unknown'
      };
  }
};

// Helper function to prioritize discrepancies
export const prioritizeDiscrepancies = (discrepancies: Discrepancy[]) => {
  const impactOrder = { high: 3, medium: 2, low: 1 };
  
  return discrepancies.sort((a, b) => {
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
};

// Helper function to format sync latency
export const formatSyncLatency = (latency: number) => {
  if (latency < 100) return { label: 'Excellent', color: 'text-green-600' };
  if (latency < 300) return { label: 'Good', color: 'text-green-500' };
  if (latency < 500) return { label: 'Fair', color: 'text-yellow-500' };
  if (latency < 1000) return { label: 'Poor', color: 'text-orange-500' };
  return { label: 'Critical', color: 'text-red-500' };
};

// Helper function to estimate sync progress
export const calculateSyncProgress = (syncStatus: SyncStatus | null) => {
  if (!syncStatus) return 0;
  
  const healthScore = syncStatus.syncHealth === 'healthy' ? 100 : 
                     syncStatus.syncHealth === 'degraded' ? 60 : 30;
  
  const latencyScore = Math.max(0, 100 - (syncStatus.syncLatency / 10));
  const pendingScore = Math.max(0, 100 - (syncStatus.pendingSyncs * 10));
  
  return Math.round((healthScore + latencyScore + pendingScore) / 3);
};