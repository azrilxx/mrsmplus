import { useState, useEffect, useCallback } from 'react';
import { agentClients } from './utils/agent-client';
import { WatchtowerSentinelResponse, AgentContext, HealthMetrics, PerformanceAnalysis, PredictiveAlert } from './types/agent-interfaces';
import { SystemAlert } from '../types/dashboard';

interface WatchtowerSentinelHook {
  alerts: SystemAlert[];
  systemHealth: HealthMetrics | null;
  performanceAnalysis: PerformanceAnalysis | null;
  predictiveAlerts: PredictiveAlert[];
  loading: boolean;
  error: string | null;
  monitorSystemHealth: () => Promise<void>;
  generatePerformanceReport: () => Promise<PerformanceAnalysis | null>;
  checkPredictiveThreats: () => Promise<PredictiveAlert[]>;
  resolveAlert: (alertId: string) => Promise<void>;
  refreshMonitoring: () => Promise<void>;
}

export const useWatchtowerSentinel = (
  context: AgentContext,
  options?: {
    autoMonitor?: boolean;
    monitoringInterval?: number;
    alertThreshold?: 'low' | 'medium' | 'high';
    includeDetailedMetrics?: boolean;
    enablePredictiveAnalysis?: boolean;
  }
): WatchtowerSentinelHook => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<HealthMetrics | null>(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoMonitor = options?.autoMonitor ?? true;
  const monitoringInterval = options?.monitoringInterval ?? 60000; // 1 minute
  const alertThreshold = options?.alertThreshold ?? 'medium';
  const includeDetailedMetrics = options?.includeDetailedMetrics ?? true;
  const enablePredictiveAnalysis = options?.enablePredictiveAnalysis ?? true;

  const performSystemMonitoring = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const systemMetrics = context.systemMetrics || {
        responseTime: 245,
        errorRate: 0.02,
        activeUsers: 892,
        systemLoad: 0.65,
        memoryUsage: 0.78,
        databaseConnections: 45
      };

      const prompt = `Perform comprehensive system monitoring and health analysis for MARA+ platform.
      Current system metrics: Response time: ${systemMetrics.responseTime}ms, Error rate: ${systemMetrics.errorRate}%, 
      Active users: ${systemMetrics.activeUsers}, System load: ${systemMetrics.systemLoad}, 
      Memory usage: ${systemMetrics.memoryUsage}%, DB connections: ${systemMetrics.databaseConnections}.
      Alert threshold: ${alertThreshold}.
      ${includeDetailedMetrics ? 'Include detailed component health analysis and bottleneck identification.' : ''}
      ${enablePredictiveAnalysis ? 'Generate predictive alerts for potential issues.' : ''}
      Focus on: System stability, performance optimization, capacity planning, user experience impact.`;

      const response = await agentClients.watchtower.invoke<WatchtowerSentinelResponse['data']>(
        prompt,
        {
          ...context,
          systemMetrics
        }
      );

      if (response.success && response.data) {
        setAlerts(response.data.alerts);
        setSystemHealth(response.data.insights.systemHealth);
        setPerformanceAnalysis(response.data.insights.performanceAnalysis);
        setPredictiveAlerts(response.data.insights.predictiveAlerts);
      } else {
        throw new Error(response.error || 'Failed to perform system monitoring');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Watchtower sentinel error:', err);
    } finally {
      setLoading(false);
    }
  }, [context, alertThreshold, includeDetailedMetrics, enablePredictiveAnalysis]);

  const monitorSystemHealth = useCallback(async () => {
    await performSystemMonitoring();
  }, [performSystemMonitoring]);

  const generatePerformanceReport = useCallback(async (): Promise<PerformanceAnalysis | null> => {
    try {
      const prompt = `Generate detailed performance analysis report for MARA+ system.
      Analyze trends, identify anomalies, and provide optimization recommendations.
      Focus on user experience metrics, system efficiency, and resource utilization.`;

      const response = await agentClients.watchtower.invoke<WatchtowerSentinelResponse['data']>(
        prompt,
        context
      );

      if (response.success && response.data) {
        const analysis = response.data.insights.performanceAnalysis;
        setPerformanceAnalysis(analysis);
        return analysis;
      }
      
      throw new Error(response.error || 'Failed to generate performance report');
    } catch (err) {
      console.error('Performance report generation error:', err);
      return null;
    }
  }, [context]);

  const checkPredictiveThreats = useCallback(async (): Promise<PredictiveAlert[]> => {
    try {
      const prompt = `Analyze system patterns and generate predictive alerts for potential threats.
      Consider capacity planning, performance degradation, user behavior anomalies, and security risks.
      Provide actionable preventive measures and timeline estimates.`;

      const response = await agentClients.watchtower.invoke<WatchtowerSentinelResponse['data']>(
        prompt,
        context
      );

      if (response.success && response.data) {
        const alerts = response.data.insights.predictiveAlerts;
        setPredictiveAlerts(alerts);
        return alerts;
      }
      
      throw new Error(response.error || 'Failed to check predictive threats');
    } catch (err) {
      console.error('Predictive threat analysis error:', err);
      return [];
    }
  }, [context]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      // Mark alert as resolved
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));

      // Log resolution for tracking
      console.log(`Alert ${alertId} marked as resolved`);
    } catch (err) {
      console.error('Alert resolution error:', err);
    }
  }, []);

  const refreshMonitoring = useCallback(async () => {
    await performSystemMonitoring();
  }, [performSystemMonitoring]);

  // Initial monitoring
  useEffect(() => {
    performSystemMonitoring();
  }, [performSystemMonitoring]);

  // Auto-monitoring functionality
  useEffect(() => {
    if (!autoMonitor) return;

    const interval = setInterval(() => {
      performSystemMonitoring();
    }, monitoringInterval);

    return () => clearInterval(interval);
  }, [autoMonitor, monitoringInterval, performSystemMonitoring]);

  return {
    alerts,
    systemHealth,
    performanceAnalysis,
    predictiveAlerts,
    loading,
    error,
    monitorSystemHealth,
    generatePerformanceReport,
    checkPredictiveThreats,
    resolveAlert,
    refreshMonitoring
  };
};

// Specialized hook for admin dashboard monitoring
export const useAdminWatchtower = (context: AgentContext) => {
  return useWatchtowerSentinel(
    { ...context, role: 'admin' },
    {
      autoMonitor: true,
      monitoringInterval: 30000, // 30 seconds for admin view
      alertThreshold: 'low', // Catch issues early for admins
      includeDetailedMetrics: true,
      enablePredictiveAnalysis: true
    }
  );
};

// Specialized hook for real-time system monitoring
export const useRealTimeMonitoring = (context: AgentContext) => {
  return useWatchtowerSentinel(
    { ...context, role: 'admin' },
    {
      autoMonitor: true,
      monitoringInterval: 10000, // 10 seconds for real-time
      alertThreshold: 'medium',
      includeDetailedMetrics: false, // Lighter for frequent updates
      enablePredictiveAnalysis: false
    }
  );
};

// Helper functions for alert styling and prioritization
export const getAlertStyling = (type: SystemAlert['type'], priority: SystemAlert['priority']) => {
  const baseStyles = {
    error: { baseColor: 'red', icon: '🚨' },
    warning: { baseColor: 'yellow', icon: '⚠️' },
    info: { baseColor: 'blue', icon: 'ℹ️' },
    success: { baseColor: 'green', icon: '✅' }
  };

  const priorityIntensity = {
    low: '100',
    medium: '200',
    high: '300',
    critical: '500'
  };

  const base = baseStyles[type];
  const intensity = priorityIntensity[priority];

  return {
    backgroundColor: `bg-${base.baseColor}-${intensity}`,
    textColor: priority === 'critical' ? 'text-white' : `text-${base.baseColor}-800`,
    borderColor: `border-${base.baseColor}-${intensity}`,
    icon: base.icon
  };
};

// Helper function to prioritize alerts
export const prioritizeAlerts = (alerts: SystemAlert[]) => {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return alerts.sort((a, b) => {
    if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    // If same priority, sort by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
};

// Helper function to format system health score
export const formatHealthScore = (score: number) => {
  if (score >= 95) return { label: 'Excellent', color: 'text-green-600', icon: '🟢' };
  if (score >= 85) return { label: 'Good', color: 'text-green-500', icon: '🟢' };
  if (score >= 70) return { label: 'Fair', color: 'text-yellow-500', icon: '🟡' };
  if (score >= 50) return { label: 'Poor', color: 'text-orange-500', icon: '🟠' };
  return { label: 'Critical', color: 'text-red-500', icon: '🔴' };
};

// Helper function to categorize performance trends
export const categorizePerformanceTrends = (analysis: PerformanceAnalysis | null) => {
  if (!analysis) return { improving: [], declining: [], stable: [] };

  return {
    improving: analysis.trends.filter(trend => trend.direction === 'up'),
    declining: analysis.trends.filter(trend => trend.direction === 'down'),
    stable: analysis.trends.filter(trend => trend.direction === 'stable')
  };
};

// Helper function to format predictive alert urgency
export const formatPredictiveUrgency = (timeToOccurrence: number) => {
  const days = Math.ceil(timeToOccurrence / (24 * 60 * 60 * 1000));
  
  if (days <= 1) return { label: 'Immediate', color: 'text-red-600', urgency: 'critical' };
  if (days <= 7) return { label: 'This Week', color: 'text-orange-500', urgency: 'high' };
  if (days <= 30) return { label: 'This Month', color: 'text-yellow-500', urgency: 'medium' };
  return { label: 'Long Term', color: 'text-blue-500', urgency: 'low' };
};