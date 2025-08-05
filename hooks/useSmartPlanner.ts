import { useState, useEffect, useCallback } from 'react';
import {
  StudyPlan,
  DayPlan,
  StudySlot,
  StudentProgressData,
  BloomLevel,
  getStudentProgressForPlanning,
  getStudyPlan,
  saveStudyPlan,
  updateSlotCompletion,
  SUBJECTS,
  XP_BY_BLOOM
} from '../firebase/planner';

interface PlannerOptions {
  targetSessionsPerWeek?: number;
  maxSessionsPerDay?: number;
  preferredStudyTimes?: string[];
  avoidWeekends?: boolean;
}

interface SmartPlannerHook {
  currentPlan: StudyPlan | null;
  loading: boolean;
  error: string | null;
  generatePlan: (studentId: string, options?: PlannerOptions) => Promise<boolean>;
  updatePlan: (plan: StudyPlan) => Promise<boolean>;
  markSlotComplete: (dayIndex: number, slotIndex: number, completed: boolean) => Promise<boolean>;
  refreshPlan: (studentId: string) => Promise<void>;
}

export const useSmartPlanner = (studentId?: string): SmartPlannerHook => {
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing plan on mount
  useEffect(() => {
    if (studentId) {
      loadExistingPlan(studentId);
    }
  }, [studentId]);

  const loadExistingPlan = async (studentId: string) => {
    try {
      setLoading(true);
      const plan = await getStudyPlan(studentId);
      setCurrentPlan(plan);
    } catch (err) {
      setError('Failed to load existing plan');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = useCallback(async (
    studentId: string, 
    options: PlannerOptions = {}
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get student progress data
      const progressData = await getStudentProgressForPlanning(studentId);
      if (!progressData) {
        throw new Error('Unable to fetch student progress data');
      }

      // Generate intelligent study plan
      const plan = await generateIntelligentPlan(studentId, progressData, options);
      
      // Save to Firestore
      const success = await saveStudyPlan(plan);
      if (success) {
        setCurrentPlan(plan);
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (plan: StudyPlan): Promise<boolean> => {
    try {
      plan.lastModified = new Date();
      const success = await saveStudyPlan(plan);
      if (success) {
        setCurrentPlan(plan);
      }
      return success;
    } catch (err) {
      setError('Failed to update plan');
      return false;
    }
  }, []);

  const markSlotComplete = useCallback(async (
    dayIndex: number, 
    slotIndex: number, 
    completed: boolean
  ): Promise<boolean> => {
    if (!currentPlan || !studentId) return false;

    try {
      const success = await updateSlotCompletion(studentId, dayIndex, slotIndex, completed);
      if (success && currentPlan) {
        const updatedPlan = { ...currentPlan };
        updatedPlan.days[dayIndex].slots[slotIndex].completed = completed;
        updatedPlan.lastModified = new Date();
        setCurrentPlan(updatedPlan);
      }
      return success;
    } catch (err) {
      setError('Failed to update slot completion');
      return false;
    }
  }, [currentPlan, studentId]);

  const refreshPlan = useCallback(async (studentId: string) => {
    await loadExistingPlan(studentId);
  }, []);

  return {
    currentPlan,
    loading,
    error,
    generatePlan,
    updatePlan,
    markSlotComplete,
    refreshPlan
  };
};

// Core planning algorithm
const generateIntelligentPlan = async (
  studentId: string,
  progressData: StudentProgressData,
  options: PlannerOptions
): Promise<StudyPlan> => {
  const {
    targetSessionsPerWeek = 12,
    maxSessionsPerDay = 3,
    preferredStudyTimes = ['16:00', '19:00', '20:00'],
    avoidWeekends = false
  } = options;

  // Analyze student's learning patterns
  const analysis = analyzeStudentPatterns(progressData);
  
  // Get week start (Monday)
  const now = new Date();
  const weekStart = getWeekStart(now);
  
  // Generate 7-day plan
  const days: DayPlan[] = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  let totalSessions = 0;
  const prioritizedTopics = generateTopicPriorities(progressData, analysis);
  let topicIndex = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    
    const isWeekend = i >= 5;
    const maxSlots = isWeekend && avoidWeekends ? 1 : 
      isWeekend ? Math.min(2, maxSessionsPerDay) : maxSessionsPerDay;
    
    const dayPlan: DayPlan = {
      date: dayDate.toISOString().split('T')[0],
      slots: []
    };

    // Determine number of sessions for this day
    const remainingDays = 7 - i;
    const remainingSessions = targetSessionsPerWeek - totalSessions;
    const sessionsForDay = Math.min(
      maxSlots,
      Math.ceil(remainingSessions / remainingDays)
    );

    // Generate study slots
    for (let j = 0; j < sessionsForDay && topicIndex < prioritizedTopics.length; j++) {
      const topic = prioritizedTopics[topicIndex];
      const studyTime = selectOptimalTime(analysis, preferredStudyTimes, j);
      
      const slot: StudySlot = {
        subject: topic.subject,
        topic: topic.name,
        time: studyTime,
        bloom: topic.bloomLevel,
        expectedXP: XP_BY_BLOOM[topic.bloomLevel],
        difficulty: topic.difficulty,
        completed: false
      };

      dayPlan.slots.push(slot);
      topicIndex++;
      totalSessions++;
    }

    days.push(dayPlan);
  }

  return {
    studentId,
    weekStart: weekStart.toISOString().split('T')[0],
    days,
    totalExpectedXP: days.reduce((total, day) => 
      total + day.slots.reduce((dayTotal, slot) => dayTotal + slot.expectedXP, 0), 0
    ),
    created: new Date(),
    lastModified: new Date()
  };
};

// Analyze student patterns for intelligent scheduling
const analyzeStudentPatterns = (progressData: StudentProgressData) => {
  const { completedQuestions, reflectionLog, weeklyStats, subjectWeaknesses, bloomProgress } = progressData;

  // Determine best study times based on reflection data
  const timePerformance = new Map<string, { mood: number[], tiredness: number[] }>();
  reflectionLog.forEach(entry => {
    const hour = entry.time.split(':')[0];
    const timeSlot = `${hour}:00`;
    
    if (!timePerformance.has(timeSlot)) {
      timePerformance.set(timeSlot, { mood: [], tiredness: [] });
    }
    
    const performance = timePerformance.get(timeSlot)!;
    performance.mood.push(getMoodScore(entry.mood));
    performance.tiredness.push(6 - entry.tiredness); // Invert tiredness (higher = less tired)
  });

  const bestTimes = Array.from(timePerformance.entries())
    .map(([time, data]) => ({
      time,
      focusScore: (
        data.mood.reduce((a, b) => a + b, 0) / data.mood.length +
        data.tiredness.reduce((a, b) => a + b, 0) / data.tiredness.length
      ) / 2
    }))
    .sort((a, b) => b.focusScore - a.focusScore)
    .map(item => item.time);

  // Analyze subject performance trends
  const subjectAccuracy = new Map<string, number>();
  const subjectCount = new Map<string, number>();
  
  completedQuestions.forEach(q => {
    const current = subjectAccuracy.get(q.subject) || 0;
    const count = subjectCount.get(q.subject) || 0;
    
    subjectAccuracy.set(q.subject, current + (q.correct ? 1 : 0));
    subjectCount.set(q.subject, count + 1);
  });

  const weakSubjects = Array.from(subjectAccuracy.entries())
    .filter(([subject, correct]) => {
      const total = subjectCount.get(subject) || 1;
      return total >= 3 && (correct / total) < 0.6;
    })
    .map(([subject]) => subject);

  return {
    bestTimes: bestTimes.length > 0 ? bestTimes : ['16:00', '19:00', '20:00'],
    weakSubjects: [...new Set([...subjectWeaknesses, ...weakSubjects])],
    bloomNeeds: getBloomNeeds(bloomProgress),
    averageMood: weeklyStats.averageMood,
    peakFocusTime: weeklyStats.peakFocusTime
  };
};

// Generate prioritized topic list
const generateTopicPriorities = (progressData: StudentProgressData, analysis: any) => {
  const topics: Array<{
    subject: string;
    name: string;
    bloomLevel: BloomLevel;
    priority: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }> = [];

  // Prioritize weak subjects
  const subjectPriorities = new Map<string, number>();
  Object.keys(SUBJECTS).forEach(subject => {
    let priority = 1;
    if (analysis.weakSubjects.includes(subject)) priority += 2;
    subjectPriorities.set(subject, priority);
  });

  // Generate topics for each subject
  Object.entries(SUBJECTS).forEach(([subject, data]) => {
    const subjectPriority = subjectPriorities.get(subject) || 1;
    
    data.topics.forEach(topicName => {
      data.bloomLevels.forEach(bloomLevel => {
        const bloomPriority = analysis.bloomNeeds[bloomLevel] || 1;
        
        topics.push({
          subject,
          name: topicName,
          bloomLevel,
          priority: subjectPriority * bloomPriority,
          difficulty: getDifficultyForBloom(bloomLevel)
        });
      });
    });
  });

  // Sort by priority and return top topics
  return topics
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20); // Limit to reasonable number
};

// Helper functions
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
};

const getMoodScore = (mood: string): number => {
  const moodScores: { [key: string]: number } = {
    'excellent': 5,
    'good': 4,
    'neutral': 3,
    'poor': 2,
    'struggling': 1
  };
  return moodScores[mood] || 3;
};

const getBloomNeeds = (bloomProgress: { [key in BloomLevel]: number }) => {
  const total = Object.values(bloomProgress).reduce((a, b) => a + b, 0);
  if (total === 0) return { Recall: 3, Apply: 2, Analyze: 1 };

  const needs: { [key in BloomLevel]: number } = { Recall: 1, Apply: 1, Analyze: 1 };
  
  // Boost levels that are underrepresented
  Object.entries(bloomProgress).forEach(([level, count]) => {
    const percentage = count / total;
    if (percentage < 0.3) needs[level as BloomLevel] *= 2;
    if (percentage < 0.15) needs[level as BloomLevel] *= 2;
  });

  return needs;
};

const selectOptimalTime = (analysis: any, preferredTimes: string[], slotIndex: number): string => {
  const availableTimes = analysis.bestTimes.length > 0 ? analysis.bestTimes : preferredTimes;
  return availableTimes[slotIndex % availableTimes.length] || preferredTimes[0];
};

const getDifficultyForBloom = (bloom: BloomLevel): 'easy' | 'medium' | 'hard' => {
  switch (bloom) {
    case 'Recall': return 'easy';
    case 'Apply': return 'medium';
    case 'Analyze': return 'hard';
    default: return 'medium';
  }
};