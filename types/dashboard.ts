export interface XPProgress {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  totalXP: number;
  weeklyProgress: number;
}

export interface LessonProgress {
  subject: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface RecentAnswer {
  id: string;
  question: string;
  answer: string;
  isCorrect: boolean;
  subject: string;
  timestamp: Date;
  xpEarned: number;
}

export interface StudyReflection {
  id: string;
  userId: string;
  date: Date;
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'struggling';
  insights: string[];
  areasForImprovement: string[];
  strengths: string[];
  confidenceLevel: number;
}

export interface StudentOverview {
  id: string;
  name: string;
  email: string;
  currentXP: number;
  level: number;
  lastActive: Date;
  performance: 'excellent' | 'good' | 'average' | 'needs_attention';
  engagementScore: number;
  streakDays: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  weeklyXP: number;
  streak: number;
}

export interface EngagementDiagnostic {
  userId: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: Date;
  averageSessionTime: number;
  completionRate: number;
  strugglingSubjects: string[];
  recommendations: string[];
}

export interface ChildProgress {
  id: string;
  name: string;
  currentXP: number;
  level: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteSubjects: string[];
  recentAchievements: string[];
  parentNotes: string[];
}

export interface MotivationCard {
  id: string;
  title: string;
  message: string;
  type: 'praise' | 'encouragement' | 'tip' | 'achievement';
  targetChild: string;
  dateCreated: Date;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserStats {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  newUsersToday: number;
  retentionRate: number;
}

export interface XPStats {
  totalXPEarned: number;
  averageXPPerUser: number;
  weeklyXPGrowth: number;
  topPerformers: LeaderboardEntry[];
  xpDistribution: {
    range: string;
    count: number;
  }[];
}

export interface StudyModeUsage {
  totalSessions: number;
  averageSessionDuration: number;
  popularSubjects: {
    subject: string;
    sessionCount: number;
  }[];
  peakHours: {
    hour: number;
    sessionCount: number;
  }[];
  completionRates: {
    subject: string;
    rate: number;
  }[];
}

export interface DashboardData {
  student?: {
    xpProgress: XPProgress;
    lessonProgress: LessonProgress[];
    recentAnswers: RecentAnswer[];
    studyReflection: StudyReflection;
  };
  teacher?: {
    students: StudentOverview[];
    leaderboard: LeaderboardEntry[];
    engagementDiagnostics: EngagementDiagnostic[];
    classStats: {
      totalStudents: number;
      averageXP: number;
      completionRate: number;
    };
  };
  parent?: {
    children: ChildProgress[];
    motivationCards: MotivationCard[];
    familyStats: {
      totalXP: number;
      activeChildren: number;
      weeklyGoalProgress: number;
    };
  };
  admin?: {
    userStats: UserStats;
    xpStats: XPStats;
    studyModeUsage: StudyModeUsage;
    systemAlerts: SystemAlert[];
    systemHealth: {
      uptime: number;
      responseTime: number;
      errorRate: number;
    };
  };
}

export interface MockDataGenerator {
  generateXPProgress(): XPProgress;
  generateLessonProgress(): LessonProgress[];
  generateRecentAnswers(): RecentAnswer[];
  generateStudyReflection(): StudyReflection;
  generateStudentOverview(): StudentOverview[];
  generateLeaderboard(): LeaderboardEntry[];
  generateEngagementDiagnostics(): EngagementDiagnostic[];
  generateChildProgress(): ChildProgress[];
  generateMotivationCards(): MotivationCard[];
  generateSystemAlerts(): SystemAlert[];
  generateUserStats(): UserStats;
  generateXPStats(): XPStats;
  generateStudyModeUsage(): StudyModeUsage;
}