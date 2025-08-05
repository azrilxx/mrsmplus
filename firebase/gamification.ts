import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';

// Gamification Types
export interface Mission {
  id: string;
  title: string;
  subject: string;
  type: 'questions' | 'xp' | 'streak' | 'subject_focus';
  goal: number;
  progress: number;
  rewardXP: number;
  completed: boolean;
  dateAssigned: Date;
  dateCompleted?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  condition: {
    type: 'streak' | 'xp' | 'mission' | 'level' | 'subject_mastery';
    value: number;
    subject?: string;
  };
  rewardXP: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GamifiedStudentProgress {
  studentId: string;
  xp: number;
  level: number;
  lastActiveDate: string;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  activeMissions: Mission[];
  completedMissions: Mission[];
  totalXP: number;
  xpToNextLevel: number;
  weeklyProgress: number;
  subjectProgress: {
    [subject: string]: {
      completedLessons: number;
      totalLessons: number;
      lastAccessed: Date;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      xpEarned: number;
    };
  };
  levelUpEffects?: {
    triggered: boolean;
    newLevel: number;
    timestamp: Date;
  };
  recentAchievements?: {
    achievementId: string;
    unlockedAt: Date;
    viewed: boolean;
  }[];
}

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'badge_7_day_streak',
    title: '7-Day Warrior',
    description: 'Study for 7 consecutive days',
    iconUrl: '/assets/student/icons/achievements/star.svg',
    condition: { type: 'streak', value: 7 },
    rewardXP: 100,
    rarity: 'rare'
  },
  {
    id: 'badge_1000_xp',
    title: 'XP Master',
    description: 'Earn 1000 total XP',
    iconUrl: '/assets/student/icons/achievements/trophy.svg',
    condition: { type: 'xp', value: 1000 },
    rewardXP: 150,
    rarity: 'epic'
  },
  {
    id: 'badge_first_mission',
    title: 'Mission Rookie',
    description: 'Complete your first daily mission',
    iconUrl: '/assets/student/icons/achievements/lightning_bolt.svg',
    condition: { type: 'mission', value: 1 },
    rewardXP: 50,
    rarity: 'common'
  },
  {
    id: 'badge_30_day_streak',
    title: 'Study Legend',
    description: 'Study for 30 consecutive days',
    iconUrl: '/assets/student/icons/achievements/trophy.svg',
    condition: { type: 'streak', value: 30 },
    rewardXP: 500,
    rarity: 'legendary'
  },
  {
    id: 'badge_level_10',
    title: 'Scholar',
    description: 'Reach level 10',
    iconUrl: '/assets/student/icons/achievements/star.svg',
    condition: { type: 'level', value: 10 },
    rewardXP: 200,
    rarity: 'epic'
  },
  {
    id: 'badge_math_master',
    title: 'Math Master',
    description: 'Earn 500 XP in Mathematics',
    iconUrl: '/assets/student/icons/subjects/math_icon.svg',
    condition: { type: 'subject_mastery', value: 500, subject: 'math' },
    rewardXP: 100,
    rarity: 'rare'
  },
  {
    id: 'badge_science_explorer',
    title: 'Science Explorer',
    description: 'Earn 500 XP in Science',
    iconUrl: '/assets/student/icons/subjects/science_icon.svg',
    condition: { type: 'subject_mastery', value: 500, subject: 'science' },
    rewardXP: 100,
    rarity: 'rare'
  }
];

// Mission Templates
const MISSION_TEMPLATES = [
  {
    title: "Daily Questions Challenge",
    type: 'questions' as const,
    goal: 5,
    rewardXP: 30,
    subjects: ['math', 'science', 'english', 'ict', 'bm']
  },
  {
    title: "XP Hunter",
    type: 'xp' as const,
    goal: 50,
    rewardXP: 25,
    subjects: ['all']
  },
  {
    title: "Subject Focus",
    type: 'subject_focus' as const,
    goal: 3,
    rewardXP: 40,
    subjects: ['math', 'science', 'english']
  },
  {
    title: "Knowledge Sprint",
    type: 'questions' as const,
    goal: 10,
    rewardXP: 60,
    subjects: ['math', 'science']
  }
];

// Core Gamification Functions

export const updateXP = async (
  studentId: string, 
  xpToAdd: number, 
  subject?: string
): Promise<{
  success: boolean;
  leveledUp: boolean;
  newLevel?: number;
  unlockedAchievements?: string[];
}> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await initializeGamifiedProgress(studentId);
      return updateXP(studentId, xpToAdd, subject);
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    const newTotalXP = (currentData.totalXP || 0) + xpToAdd;
    const newCurrentXP = (currentData.xp || 0) + xpToAdd;
    
    // Level calculation (every 100 XP = 1 level)
    const oldLevel = currentData.level || 1;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    const leveledUp = newLevel > oldLevel;
    const xpToNextLevel = 100 - (newTotalXP % 100);
    
    // Update subject progress if specified
    const updatedSubjectProgress = { ...currentData.subjectProgress };
    if (subject && updatedSubjectProgress[subject]) {
      updatedSubjectProgress[subject] = {
        ...updatedSubjectProgress[subject],
        xpEarned: (updatedSubjectProgress[subject].xpEarned || 0) + xpToAdd,
        lastAccessed: new Date()
      };
    }
    
    // Update active missions progress
    const updatedMissions = currentData.activeMissions?.map(mission => {
      if (mission.type === 'xp' && !mission.completed) {
        const newProgress = mission.progress + xpToAdd;
        return {
          ...mission,
          progress: Math.min(newProgress, mission.goal),
          completed: newProgress >= mission.goal,
          dateCompleted: newProgress >= mission.goal ? new Date() : mission.dateCompleted
        };
      }
      return mission;
    }) || [];
    
    const updateData: Partial<GamifiedStudentProgress> = {
      xp: newCurrentXP,
      totalXP: newTotalXP,
      level: newLevel,
      xpToNextLevel,
      weeklyProgress: (currentData.weeklyProgress || 0) + xpToAdd,
      activeMissions: updatedMissions,
      lastActiveDate: new Date().toISOString(),
      subjectProgress: updatedSubjectProgress
    };
    
    if (leveledUp) {
      updateData.levelUpEffects = {
        triggered: true,
        newLevel,
        timestamp: new Date()
      };
    }
    
    await updateDoc(docRef, updateData);
    
    // Check for new achievements
    const unlockedAchievements = await checkAndUnlockAchievements(studentId);
    
    return {
      success: true,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      unlockedAchievements
    };
  } catch (error) {
    console.error('Error updating XP:', error);
    return { success: false, leveledUp: false };
  }
};

export const trackDailyStreak = async (studentId: string): Promise<{
  success: boolean;
  currentStreak: number;
  streakIncreased: boolean;
}> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await initializeGamifiedProgress(studentId);
      return trackDailyStreak(studentId);
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = currentData.lastActiveDate?.split('T')[0];
    
    let newStreak = currentData.currentStreak || 0;
    let streakIncreased = false;
    
    if (lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActiveDate === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak += 1;
        streakIncreased = true;
      } else if (lastActiveDate !== today) {
        // Missed days - reset streak
        newStreak = 1;
        streakIncreased = true;
      }
      
      const longestStreak = Math.max(currentData.longestStreak || 0, newStreak);
      
      await updateDoc(docRef, {
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      currentStreak: newStreak,
      streakIncreased
    };
  } catch (error) {
    console.error('Error tracking daily streak:', error);
    return { success: false, currentStreak: 0, streakIncreased: false };
  }
};

export const assignDailyMissions = async (studentId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await initializeGamifiedProgress(studentId);
      return assignDailyMissions(studentId);
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    const today = new Date().toISOString().split('T')[0];
    const lastMissionDate = currentData.activeMissions?.[0]?.dateAssigned 
      ? new Date(currentData.activeMissions[0].dateAssigned).toISOString().split('T')[0]
      : null;
    
    // Only assign new missions if it's a new day or no missions exist
    if (lastMissionDate === today && currentData.activeMissions?.length > 0) {
      return true; // Missions already assigned for today
    }
    
    // Move completed missions to completed list
    const completedMissions = [
      ...(currentData.completedMissions || []),
      ...(currentData.activeMissions?.filter(m => m.completed) || [])
    ];
    
    // Generate 3 new daily missions
    const newMissions: Mission[] = [];
    const shuffledTemplates = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffledTemplates.length; i++) {
      const template = shuffledTemplates[i];
      const subjects = template.subjects.filter(s => s !== 'all');
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      
      newMissions.push({
        id: `mission_${Date.now()}_${i}`,
        title: template.title,
        subject: randomSubject || 'general',
        type: template.type,
        goal: template.goal,
        progress: 0,
        rewardXP: template.rewardXP,
        completed: false,
        dateAssigned: new Date()
      });
    }
    
    await updateDoc(docRef, {
      activeMissions: newMissions,
      completedMissions
    });
    
    return true;
  } catch (error) {
    console.error('Error assigning daily missions:', error);
    return false;
  }
};

export const completeMission = async (
  studentId: string, 
  missionId: string
): Promise<{ success: boolean; xpAwarded: number }> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, xpAwarded: 0 };
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    const mission = currentData.activeMissions?.find(m => m.id === missionId);
    
    if (!mission || mission.completed) {
      return { success: false, xpAwarded: 0 };
    }
    
    // Mark mission as completed
    const updatedMissions = currentData.activeMissions?.map(m => 
      m.id === missionId 
        ? { ...m, completed: true, dateCompleted: new Date() }
        : m
    ) || [];
    
    await updateDoc(docRef, {
      activeMissions: updatedMissions
    });
    
    // Award XP for mission completion
    await updateXP(studentId, mission.rewardXP);
    
    return { success: true, xpAwarded: mission.rewardXP };
  } catch (error) {
    console.error('Error completing mission:', error);
    return { success: false, xpAwarded: 0 };
  }
};

export const checkAndUnlockAchievements = async (studentId: string): Promise<string[]> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return [];
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    const currentAchievements = currentData.achievements || [];
    const newAchievements: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (currentAchievements.includes(achievement.id)) {
        continue; // Already unlocked
      }
      
      let conditionMet = false;
      
      switch (achievement.condition.type) {
        case 'streak':
          conditionMet = (currentData.currentStreak || 0) >= achievement.condition.value;
          break;
        case 'xp':
          conditionMet = (currentData.totalXP || 0) >= achievement.condition.value;
          break;
        case 'level':
          conditionMet = (currentData.level || 1) >= achievement.condition.value;
          break;
        case 'mission':
          const completedMissionCount = (currentData.completedMissions || []).length;
          conditionMet = completedMissionCount >= achievement.condition.value;
          break;
        case 'subject_mastery':
          if (achievement.condition.subject) {
            const subjectProgress = currentData.subjectProgress?.[achievement.condition.subject];
            conditionMet = (subjectProgress?.xpEarned || 0) >= achievement.condition.value;
          }
          break;
      }
      
      if (conditionMet) {
        newAchievements.push(achievement.id);
      }
    }
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...currentAchievements, ...newAchievements];
      const recentAchievements = [
        ...(currentData.recentAchievements || []),
        ...newAchievements.map(id => ({
          achievementId: id,
          unlockedAt: new Date(),
          viewed: false
        }))
      ];
      
      await updateDoc(docRef, {
        achievements: updatedAchievements,
        recentAchievements
      });
      
      // Award XP for achievements
      for (const achievementId of newAchievements) {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
          await updateXP(studentId, achievement.rewardXP);
        }
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

export const updateMissionProgress = async (
  studentId: string,
  type: 'questions' | 'xp' | 'subject_focus',
  amount: number = 1,
  subject?: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return false;
    }
    
    const currentData = docSnap.data() as GamifiedStudentProgress;
    let missionUpdated = false;
    
    const updatedMissions = currentData.activeMissions?.map(mission => {
      if (mission.completed) return mission;
      
      let shouldUpdate = false;
      
      // Check if this mission type matches and subject matches (if specified)
      if (mission.type === type) {
        if (type === 'subject_focus' && subject) {
          shouldUpdate = mission.subject === subject;
        } else if (type === 'questions') {
          shouldUpdate = !subject || mission.subject === subject || mission.subject === 'general';
        } else {
          shouldUpdate = true;
        }
      }
      
      if (shouldUpdate) {
        const newProgress = mission.progress + amount;
        missionUpdated = true;
        
        return {
          ...mission,
          progress: Math.min(newProgress, mission.goal),
          completed: newProgress >= mission.goal,
          dateCompleted: newProgress >= mission.goal ? new Date() : mission.dateCompleted
        };
      }
      
      return mission;
    }) || [];
    
    if (missionUpdated) {
      await updateDoc(docRef, {
        activeMissions: updatedMissions
      });
    }
    
    return missionUpdated;
  } catch (error) {
    console.error('Error updating mission progress:', error);
    return false;
  }
};

export const initializeGamifiedProgress = async (studentId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const initialData: GamifiedStudentProgress = {
        studentId,
        xp: 0,
        level: 1,
        lastActiveDate: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        activeMissions: [],
        completedMissions: [],
        totalXP: 0,
        xpToNextLevel: 100,
        weeklyProgress: 0,
        subjectProgress: {}
      };
      
      await setDoc(docRef, initialData);
      
      // Assign initial daily missions
      await assignDailyMissions(studentId);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing gamified progress:', error);
    return false;
  }
};

// Real-time subscription for gamified progress
export const subscribeToGamifiedProgress = (
  studentId: string,
  callback: (progress: GamifiedStudentProgress | null) => void
) => {
  const docRef = doc(db, 'studentProgress', studentId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as GamifiedStudentProgress;
      callback(data);
    } else {
      callback(null);
    }
  });
};

// Helper function to get achievement details
export const getAchievementById = (id: string): Achievement | null => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id) || null;
};

// Leaderboard functions
export const getTopStudentsByXP = async (limit: number = 10): Promise<{
  studentId: string;
  totalXP: number;
  level: number;
  currentStreak: number;
}[]> => {
  try {
    const q = query(
      collection(db, 'studentProgress'),
      orderBy('totalXP', 'desc'),
      orderBy('level', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .slice(0, limit)
      .map(doc => ({
        studentId: doc.id,
        totalXP: doc.data().totalXP || 0,
        level: doc.data().level || 1,
        currentStreak: doc.data().currentStreak || 0
      }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};