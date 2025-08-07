import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { FirebaseUser, StudentProgress, StudyReflection } from './queries';

export interface MotivationCardData {
  type: 'praise' | 'boost' | 'restart' | 'milestone';
  title: string;
  message: string;
  emoji: string;
  color: 'green' | 'blue' | 'yellow' | 'purple';
  actionSuggestion?: string;
}

export interface TrendSummary {
  weeklyXPTotal: number;
  weeklyXPChange: number; // positive or negative change from previous week
  streakChange: number; // change in streak days
  completedSessions: number;
  scheduledSessions: number;
  completionRate: number;
}

export interface ParentDashboardData {
  students: {
    student: FirebaseUser;
    progress: StudentProgress;
  }[];
  selectedStudentId?: string;
  motivationCards: MotivationCardData[];
  trendSummary: TrendSummary;
  recentReflections: StudyReflection[];
}

export const getParentStudents = async (parentUid: string): Promise<FirebaseUser[]> => {
  try {
    const parentDoc = await getDoc(doc(db, 'users', parentUid));
    if (!parentDoc.exists()) return [];
    
    const parentData = parentDoc.data() as FirebaseUser;
    
    // Handle both single and multiple linked students
    let linkedStudentIds: string[] = [];
    if (parentData.linkedStudentId) {
      linkedStudentIds = [parentData.linkedStudentId];
    }
    // Future: handle multiple linkedStudentIds array if implemented
    
    if (linkedStudentIds.length === 0) return [];
    
    const studentPromises = linkedStudentIds.map(studentId => 
      getDoc(doc(db, 'users', studentId))
    );
    
    const studentDocs = await Promise.all(studentPromises);
    return studentDocs
      .filter(doc => doc.exists())
      .map(doc => ({ uid: doc.id, ...doc.data() })) as FirebaseUser[];
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return [];
  }
};

export const getStudentProgressForParent = async (studentId: string): Promise<StudentProgress | null> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastActivity: data.lastActivity?.toDate(),
        reflectionLogs: data.reflectionLogs?.map((log: any) => ({
          ...log,
          date: log.date?.toDate()
        })) || []
      } as StudentProgress;
    }
    return null;
  } catch (error) {
    console.error('Error fetching student progress for parent:', error);
    return null;
  }
};

export const generateMotivationCards = async (studentId: string): Promise<MotivationCardData[]> => {
  try {
    const progress = await getStudentProgressForParent(studentId);
    if (!progress) return [];
    
    const cards: MotivationCardData[] = [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Check XP growth patterns
    const hasLowXP = progress.weeklyProgress < 100;
    const hasHighXP = progress.weeklyProgress > 300;
    const hasGoodStreak = progress.streakDays >= 3;
    const hasBrokenStreak = progress.streakDays === 0;
    
    // Recent reflections check
    const recentReflections = progress.reflectionLogs?.filter(log => 
      log.date && log.date > weekAgo
    ) || [];
    
    // Praise Card - for good performance
    if (hasHighXP && hasGoodStreak) {
      cards.push({
        type: 'praise',
        title: 'Excellent Progress! 🌟',
        message: `Your child earned ${progress.weeklyProgress} XP this week and maintained a ${progress.streakDays}-day streak!`,
        emoji: '🎉',
        color: 'green',
        actionSuggestion: 'Consider a small reward to celebrate their dedication!'
      });
    }
    
    // Boost Card - for low XP or missing planner
    if (hasLowXP || recentReflections.length === 0) {
      let message = '';
      if (hasLowXP && recentReflections.length === 0) {
        message = 'Your child could use some encouragement. They have low XP and haven\'t reflected on their studies recently.';
      } else if (hasLowXP) {
        message = 'Your child earned less XP this week. Some gentle encouragement might help!';
      } else {
        message = 'Your child hasn\'t been reflecting on their studies. Encourage them to use the reflection journal!';
      }
      
      cards.push({
        type: 'boost',
        title: 'Gentle Encouragement Needed',
        message,
        emoji: '💪',
        color: 'blue',
        actionSuggestion: 'Try sitting with them during study time or asking about their favorite subjects.'
      });
    }
    
    // Restart Encouragement - for broken streaks
    if (hasBrokenStreak && progress.totalXP > 100) {
      cards.push({
        type: 'restart',
        title: 'Fresh Start Opportunity',
        message: 'Study streak was broken, but that\'s okay! Every expert was once a beginner.',
        emoji: '🔄',
        color: 'yellow',
        actionSuggestion: 'Help them set a small, achievable daily goal to rebuild momentum.'
      });
    }
    
    // Milestone Card - for level achievements
    if (progress.level >= 10 && progress.level % 5 === 0) {
      cards.push({
        type: 'milestone',
        title: `Level ${progress.level} Achieved! 🏆`,
        message: `Your child reached Level ${progress.level}! This shows consistent effort and growth.`,
        emoji: '🏆',
        color: 'purple',
        actionSuggestion: 'This milestone deserves recognition - maybe plan a special activity together!'
      });
    }
    
    // If no specific cards, provide general encouragement
    if (cards.length === 0) {
      cards.push({
        type: 'boost',
        title: 'Learning Journey Continues',
        message: 'Your child is making steady progress in their learning journey. Keep supporting them!',
        emoji: '📚',
        color: 'blue',
        actionSuggestion: 'Ask them about what they learned today - showing interest makes a big difference!'
      });
    }
    
    return cards.slice(0, 3); // Limit to 3 cards maximum
  } catch (error) {
    console.error('Error generating motivation cards:', error);
    return [];
  }
};

export const calculateTrendSummary = async (studentId: string): Promise<TrendSummary> => {
  try {
    const progress = await getStudentProgressForParent(studentId);
    if (!progress) {
      return {
        weeklyXPTotal: 0,
        weeklyXPChange: 0,
        streakChange: 0,
        completedSessions: 0,
        scheduledSessions: 7, // Assume daily sessions
        completionRate: 0
      };
    }
    
    // Current week XP
    const weeklyXPTotal = progress.weeklyProgress || 0;
    
    // Mock previous week data (in real implementation, this would be stored/calculated)
    const mockPreviousWeekXP = Math.max(0, weeklyXPTotal - Math.floor(Math.random() * 100) + 50);
    const weeklyXPChange = weeklyXPTotal - mockPreviousWeekXP;
    
    // Streak change (mock calculation)
    const mockPreviousStreak = Math.max(0, progress.streakDays - Math.floor(Math.random() * 3));
    const streakChange = progress.streakDays - mockPreviousStreak;
    
    // Sessions calculation based on activity patterns
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Count days with activity (reflections or subject progress)
    const recentReflections = progress.reflectionLogs?.filter(log => 
      log.date && log.date > weekAgo
    ) || [];
    
    const subjectActivity = Object.values(progress.subjectProgress || {}).filter(subject => 
      subject.lastAccessed && subject.lastAccessed > weekAgo
    ).length;
    
    const completedSessions = Math.min(7, recentReflections.length + subjectActivity);
    const scheduledSessions = 7; // Assume daily sessions
    const completionRate = Math.round((completedSessions / scheduledSessions) * 100);
    
    return {
      weeklyXPTotal,
      weeklyXPChange,
      streakChange,
      completedSessions,
      scheduledSessions,
      completionRate
    };
  } catch (error) {
    console.error('Error calculating trend summary:', error);
    return {
      weeklyXPTotal: 0,
      weeklyXPChange: 0,
      streakChange: 0,
      completedSessions: 0,
      scheduledSessions: 7,
      completionRate: 0
    };
  }
};

export const getRecentReflectionsForParent = async (studentId: string): Promise<StudyReflection[]> => {
  try {
    const progress = await getStudentProgressForParent(studentId);
    if (!progress || !progress.reflectionLogs) return [];
    
    return progress.reflectionLogs
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3); // Get last 3 reflections
  } catch (error) {
    console.error('Error fetching recent reflections for parent:', error);
    return [];
  }
};

export const getParentDashboardData = async (parentUid: string, selectedStudentId?: string): Promise<ParentDashboardData> => {
  try {
    // Get all linked students
    const students = await getParentStudents(parentUid);
    
    if (students.length === 0) {
      return {
        students: [],
        motivationCards: [],
        trendSummary: {
          weeklyXPTotal: 0,
          weeklyXPChange: 0,
          streakChange: 0,
          completedSessions: 0,
          scheduledSessions: 7,
          completionRate: 0
        },
        recentReflections: []
      };
    }
    
    // Get progress for all students
    const studentsWithProgress = await Promise.all(
      students.map(async student => ({
        student,
        progress: await getStudentProgressForParent(student.studentId || student.uid) || {
          studentId: student.studentId || student.uid,
          currentXP: 0,
          level: 1,
          xpToNextLevel: 100,
          totalXP: 0,
          weeklyProgress: 0,
          lastActivity: new Date(),
          streakDays: 0,
          subjectProgress: {},
          reflectionLogs: []
        }
      }))
    );
    
    // Determine selected student (first one if not specified)
    const targetStudentId = selectedStudentId || students[0]?.studentId || students[0]?.uid;
    
    // Generate data for selected student
    const [motivationCards, trendSummary, recentReflections] = await Promise.all([
      generateMotivationCards(targetStudentId),
      calculateTrendSummary(targetStudentId),
      getRecentReflectionsForParent(targetStudentId)
    ]);
    
    return {
      students: studentsWithProgress,
      selectedStudentId: targetStudentId,
      motivationCards,
      trendSummary,
      recentReflections
    };
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    return {
      students: [],
      motivationCards: [],
      trendSummary: {
        weeklyXPTotal: 0,
        weeklyXPChange: 0,
        streakChange: 0,
        completedSessions: 0,
        scheduledSessions: 7,
        completionRate: 0
      },
      recentReflections: []
    };
  }
};