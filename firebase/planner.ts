import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export type BloomLevel = 'Recall' | 'Apply' | 'Analyze';
export type Mood = 'excellent' | 'good' | 'neutral' | 'poor' | 'struggling';

export interface StudySlot {
  subject: string;
  topic: string;
  time: string;
  bloom: BloomLevel;
  expectedXP: number;
  completed?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface DayPlan {
  date: string;
  slots: StudySlot[];
}

export interface StudyPlan {
  studentId: string;
  weekStart: string;
  days: DayPlan[];
  totalExpectedXP: number;
  created: Date;
  lastModified: Date;
}

export interface ReflectionEntry {
  mood: Mood;
  tiredness: number; // 1-5 scale
  time: string;
  note?: string;
  timestamp: Date;
}

export interface CompletedQuestion {
  subject: string;
  topic: string;
  correct: boolean;
  timestamp: Date;
  xpAwarded: number;
  bloom?: BloomLevel;
  timeSpent?: number;
}

export interface StudentProgressData {
  studentId: string;
  xp: number;
  completedQuestions: CompletedQuestion[];
  reflectionLog: ReflectionEntry[];
  weeklyStats: {
    questionsAnswered: number;
    correctAnswers: number;
    totalXP: number;
    averageMood: number;
    peakFocusTime?: string;
  };
  subjectWeaknesses: string[];
  bloomProgress: {
    [key in BloomLevel]: number;
  };
}

// Get student progress data for planning
export const getStudentProgressForPlanning = async (studentId: string): Promise<StudentProgressData | null> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Process completed questions
      const completedQuestions: CompletedQuestion[] = (data.completedQuestions || []).map((q: any) => ({
        ...q,
        timestamp: q.timestamp?.toDate() || new Date()
      }));

      // Process reflection logs
      const reflectionLog: ReflectionEntry[] = (data.reflectionLogs || []).map((r: any) => ({
        ...r,
        timestamp: r.timestamp?.toDate() || new Date()
      }));

      // Calculate weekly stats (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentQuestions = completedQuestions.filter(q => q.timestamp >= weekAgo);
      const recentReflections = reflectionLog.filter(r => r.timestamp >= weekAgo);
      
      const weeklyStats = {
        questionsAnswered: recentQuestions.length,
        correctAnswers: recentQuestions.filter(q => q.correct).length,
        totalXP: recentQuestions.reduce((sum, q) => sum + (q.xpAwarded || 0), 0),
        averageMood: recentReflections.length > 0 
          ? recentReflections.reduce((sum, r) => sum + getMoodScore(r.mood), 0) / recentReflections.length
          : 3,
        peakFocusTime: getPeakFocusTime(recentReflections)
      };

      // Identify subject weaknesses
      const subjectPerformance = new Map<string, { correct: number, total: number }>();
      recentQuestions.forEach(q => {
        const current = subjectPerformance.get(q.subject) || { correct: 0, total: 0 };
        current.total++;
        if (q.correct) current.correct++;
        subjectPerformance.set(q.subject, current);
      });

      const subjectWeaknesses = Array.from(subjectPerformance.entries())
        .filter(([_, stats]) => stats.total >= 3 && (stats.correct / stats.total) < 0.6)
        .map(([subject, _]) => subject);

      // Calculate Bloom taxonomy progress
      const bloomProgress = {
        Recall: 0,
        Apply: 0,
        Analyze: 0
      } as { [key in BloomLevel]: number };

      recentQuestions.forEach(q => {
        if (q.bloom && q.correct) {
          bloomProgress[q.bloom]++;
        }
      });

      return {
        studentId,
        xp: data.totalXP || data.currentXP || 0,
        completedQuestions,
        reflectionLog,
        weeklyStats,
        subjectWeaknesses,
        bloomProgress
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching student progress for planning:', error);
    return null;
  }
};

// Save study plan to Firestore
export const saveStudyPlan = async (plan: StudyPlan): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studyPlans', plan.studentId);
    await setDoc(docRef, {
      ...plan,
      created: Timestamp.fromDate(plan.created),
      lastModified: Timestamp.fromDate(plan.lastModified)
    });
    return true;
  } catch (error) {
    console.error('Error saving study plan:', error);
    return false;
  }
};

// Get existing study plan
export const getStudyPlan = async (studentId: string): Promise<StudyPlan | null> => {
  try {
    const docRef = doc(db, 'studyPlans', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        created: data.created?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as StudyPlan;
    }
    return null;
  } catch (error) {
    console.error('Error fetching study plan:', error);
    return null;
  }
};

// Update study slot completion
export const updateSlotCompletion = async (
  studentId: string, 
  dayIndex: number, 
  slotIndex: number, 
  completed: boolean
): Promise<boolean> => {
  try {
    const plan = await getStudyPlan(studentId);
    if (!plan) return false;

    plan.days[dayIndex].slots[slotIndex].completed = completed;
    plan.lastModified = new Date();

    return await saveStudyPlan(plan);
  } catch (error) {
    console.error('Error updating slot completion:', error);
    return false;
  }
};

// Log reflection entry
export const logReflection = async (studentId: string, reflection: ReflectionEntry): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const reflectionLogs = currentData.reflectionLogs || [];
      
      const newReflection = {
        ...reflection,
        timestamp: Timestamp.fromDate(reflection.timestamp)
      };
      
      await updateDoc(docRef, {
        reflectionLogs: [...reflectionLogs, newReflection],
        lastActivity: Timestamp.fromDate(new Date())
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error logging reflection:', error);
    return false;
  }
};

// Helper functions
const getMoodScore = (mood: Mood): number => {
  const moodScores = {
    'excellent': 5,
    'good': 4,
    'neutral': 3,
    'poor': 2,
    'struggling': 1
  };
  return moodScores[mood];
};

const getPeakFocusTime = (reflections: ReflectionEntry[]): string | undefined => {
  if (reflections.length === 0) return undefined;

  const timeSlots = new Map<string, number[]>();
  
  reflections.forEach(r => {
    const hour = r.time.split(':')[0];
    const timeSlot = `${hour}:00`;
    const focusScore = getMoodScore(r.mood) + (6 - r.tiredness); // Higher is better focus
    
    if (!timeSlots.has(timeSlot)) {
      timeSlots.set(timeSlot, []);
    }
    timeSlots.get(timeSlot)!.push(focusScore);
  });

  let bestTime = '';
  let bestScore = 0;

  timeSlots.forEach((scores, time) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestTime = time;
    }
  });

  return bestTime || undefined;
};

// Subject and topic data for planning
export const SUBJECTS = {
  'Mathematics': {
    topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
    bloomLevels: ['Recall', 'Apply', 'Analyze'] as BloomLevel[]
  },
  'Science': {
    topics: ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
    bloomLevels: ['Recall', 'Apply', 'Analyze'] as BloomLevel[]
  },
  'English': {
    topics: ['Grammar', 'Literature', 'Writing', 'Reading Comprehension'],
    bloomLevels: ['Recall', 'Apply', 'Analyze'] as BloomLevel[]
  },
  'History': {
    topics: ['Ancient History', 'Modern History', 'Malaysian History', 'World History'],
    bloomLevels: ['Recall', 'Apply', 'Analyze'] as BloomLevel[]
  },
  'Bahasa Malaysia': {
    topics: ['Tatabahasa', 'Karangan', 'Kesusasteraan', 'Pemahaman'],
    bloomLevels: ['Recall', 'Apply', 'Analyze'] as BloomLevel[]
  }
};

export const XP_BY_BLOOM = {
  'Recall': 15,
  'Apply': 25,
  'Analyze': 40
};