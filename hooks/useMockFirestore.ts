import { 
  XPProgress, 
  LessonProgress, 
  RecentAnswer, 
  StudyReflection, 
  StudentOverview, 
  LeaderboardEntry, 
  EngagementDiagnostic, 
  ChildProgress, 
  MotivationCard, 
  SystemAlert, 
  UserStats, 
  XPStats, 
  StudyModeUsage,
  DashboardData
} from '../types/dashboard';

export const useMockFirestore = () => {
  const generateXPProgress = (): XPProgress => ({
    currentXP: 2450,
    level: 12,
    xpToNextLevel: 550,
    totalXP: 2450,
    weeklyProgress: 320
  });

  const generateLessonProgress = (): LessonProgress[] => [
    {
      subject: 'Mathematics',
      completedLessons: 15,
      totalLessons: 20,
      lastAccessed: new Date('2025-08-02'),
      difficulty: 'intermediate'
    },
    {
      subject: 'Physics',
      completedLessons: 8,
      totalLessons: 15,
      lastAccessed: new Date('2025-08-01'),
      difficulty: 'advanced'
    },
    {
      subject: 'Chemistry',
      completedLessons: 12,
      totalLessons: 18,
      lastAccessed: new Date('2025-07-30'),
      difficulty: 'intermediate'
    }
  ];

  const generateRecentAnswers = (): RecentAnswer[] => [
    {
      id: '1',
      question: 'What is the derivative of x²?',
      answer: '2x',
      isCorrect: true,
      subject: 'Mathematics',
      timestamp: new Date('2025-08-03T10:30:00'),
      xpEarned: 15
    },
    {
      id: '2',
      question: 'What is the speed of light?',
      answer: '3×10⁸ m/s',
      isCorrect: true,
      subject: 'Physics',
      timestamp: new Date('2025-08-03T09:15:00'),
      xpEarned: 20
    },
    {
      id: '3',
      question: 'What is the chemical formula for water?',
      answer: 'H2O',
      isCorrect: true,
      subject: 'Chemistry',
      timestamp: new Date('2025-08-02T16:45:00'),
      xpEarned: 10
    }
  ];

  const generateStudyReflection = (): StudyReflection => ({
    id: 'reflection-1',
    userId: 'student-123',
    date: new Date('2025-08-03'),
    mood: 'good',
    insights: [
      'Mathematics concepts are becoming clearer',
      'Need more practice with physics problems',
      'Chemistry formulas are easier to remember now'
    ],
    areasForImprovement: [
      'Time management during problem solving',
      'Understanding complex physics concepts'
    ],
    strengths: [
      'Strong foundation in algebra',
      'Good at memorizing chemical formulas'
    ],
    confidenceLevel: 7
  });

  const generateStudentOverview = (): StudentOverview[] => [
    {
      id: 'student-1',
      name: 'Ahmad Rahman',
      email: 'ahmad@student.mrsm.edu.my',
      currentXP: 2450,
      level: 12,
      lastActive: new Date('2025-08-03T10:30:00'),
      performance: 'excellent',
      engagementScore: 92,
      streakDays: 15
    },
    {
      id: 'student-2',
      name: 'Siti Aminah',
      email: 'siti@student.mrsm.edu.my',
      currentXP: 1890,
      level: 9,
      lastActive: new Date('2025-08-03T08:15:00'),
      performance: 'good',
      engagementScore: 78,
      streakDays: 8
    },
    {
      id: 'student-3',
      name: 'Li Wei Ming',
      email: 'wei@student.mrsm.edu.my',
      currentXP: 3200,
      level: 16,
      lastActive: new Date('2025-08-03T11:45:00'),
      performance: 'excellent',
      engagementScore: 95,
      streakDays: 22
    }
  ];

  const generateLeaderboard = (): LeaderboardEntry[] => [
    {
      rank: 1,
      userId: 'student-3',
      name: 'Li Wei Ming',
      xp: 3200,
      level: 16,
      weeklyXP: 450,
      streak: 22
    },
    {
      rank: 2,
      userId: 'student-1',
      name: 'Ahmad Rahman',
      xp: 2450,
      level: 12,
      weeklyXP: 320,
      streak: 15
    },
    {
      rank: 3,
      userId: 'student-2',
      name: 'Siti Aminah',
      xp: 1890,
      level: 9,
      weeklyXP: 280,
      streak: 8
    }
  ];

  const generateEngagementDiagnostics = (): EngagementDiagnostic[] => [
    {
      userId: 'student-4',
      name: 'Raja Krishnan',
      riskLevel: 'medium',
      lastActivity: new Date('2025-08-01T14:20:00'),
      averageSessionTime: 25,
      completionRate: 65,
      strugglingSubjects: ['Physics', 'Mathematics'],
      recommendations: [
        'Schedule regular study sessions',
        'Focus on foundational concepts',
        'Consider peer tutoring'
      ]
    },
    {
      userId: 'student-5',
      name: 'Fatimah Zahra',
      riskLevel: 'high',
      lastActivity: new Date('2025-07-29T16:30:00'),
      averageSessionTime: 15,
      completionRate: 45,
      strugglingSubjects: ['Chemistry', 'Biology'],
      recommendations: [
        'Immediate intervention needed',
        'One-on-one tutoring sessions',
        'Break concepts into smaller chunks'
      ]
    }
  ];

  const generateChildProgress = (): ChildProgress[] => [
    {
      id: 'child-1',
      name: 'Ahmad Rahman',
      currentXP: 2450,
      level: 12,
      weeklyGoal: 300,
      weeklyProgress: 320,
      favoriteSubjects: ['Mathematics', 'Physics'],
      recentAchievements: [
        'Completed Algebra Module',
        '15-day study streak',
        'Top 3 in class leaderboard'
      ],
      parentNotes: [
        'Showing great improvement in mathematics',
        'Needs encouragement in physics concepts'
      ]
    }
  ];

  const generateMotivationCards = (): MotivationCard[] => [
    {
      id: 'card-1',
      title: 'Great Progress!',
      message: 'Ahmad has maintained a 15-day study streak. Encourage him to keep going!',
      type: 'praise',
      targetChild: 'child-1',
      dateCreated: new Date('2025-08-03')
    },
    {
      id: 'card-2',
      title: 'Study Tip',
      message: 'Help Ahmad create a physics concept map to visualize relationships between topics.',
      type: 'tip',
      targetChild: 'child-1',
      dateCreated: new Date('2025-08-02')
    }
  ];

  const generateSystemAlerts = (): SystemAlert[] => [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'High Server Load',
      message: 'API response times are elevated during peak hours (7-9 PM)',
      timestamp: new Date('2025-08-03T20:15:00'),
      resolved: false,
      priority: 'medium'
    },
    {
      id: 'alert-2',
      type: 'info',
      title: 'New Feature Deployed',
      message: 'Study reflection module has been successfully deployed',
      timestamp: new Date('2025-08-03T09:30:00'),
      resolved: true,
      priority: 'low'
    }
  ];

  const generateUserStats = (): UserStats => ({
    totalUsers: 2547,
    activeUsersToday: 892,
    activeUsersWeek: 1876,
    newUsersToday: 23,
    retentionRate: 0.74
  });

  const generateXPStats = (): XPStats => ({
    totalXPEarned: 1247500,
    averageXPPerUser: 490,
    weeklyXPGrowth: 12.5,
    topPerformers: generateLeaderboard().slice(0, 5),
    xpDistribution: [
      { range: '0-500', count: 425 },
      { range: '501-1000', count: 678 },
      { range: '1001-2000', count: 543 },
      { range: '2001-3000', count: 287 },
      { range: '3000+', count: 156 }
    ]
  });

  const generateStudyModeUsage = (): StudyModeUsage => ({
    totalSessions: 15420,
    averageSessionDuration: 32,
    popularSubjects: [
      { subject: 'Mathematics', sessionCount: 4521 },
      { subject: 'Physics', sessionCount: 3876 },
      { subject: 'Chemistry', sessionCount: 3234 },
      { subject: 'Biology', sessionCount: 2890 },
      { subject: 'English', sessionCount: 899 }
    ],
    peakHours: [
      { hour: 19, sessionCount: 1245 },
      { hour: 20, sessionCount: 1567 },
      { hour: 21, sessionCount: 1234 },
      { hour: 15, sessionCount: 987 },
      { hour: 16, sessionCount: 876 }
    ],
    completionRates: [
      { subject: 'Mathematics', rate: 78 },
      { subject: 'Physics', rate: 65 },
      { subject: 'Chemistry', rate: 72 },
      { subject: 'Biology', rate: 81 },
      { subject: 'English', rate: 85 }
    ]
  });

  const getDashboardData = (role: 'student' | 'teacher' | 'parent' | 'admin'): DashboardData => {
    const data: DashboardData = {};

    switch (role) {
      case 'student':
        data.student = {
          xpProgress: generateXPProgress(),
          lessonProgress: generateLessonProgress(),
          recentAnswers: generateRecentAnswers(),
          studyReflection: generateStudyReflection()
        };
        break;
      case 'teacher':
        data.teacher = {
          students: generateStudentOverview(),
          leaderboard: generateLeaderboard(),
          engagementDiagnostics: generateEngagementDiagnostics(),
          classStats: {
            totalStudents: 28,
            averageXP: 2156,
            completionRate: 73
          }
        };
        break;
      case 'parent':
        data.parent = {
          children: generateChildProgress(),
          motivationCards: generateMotivationCards(),
          familyStats: {
            totalXP: 2450,
            activeChildren: 1,
            weeklyGoalProgress: 107
          }
        };
        break;
      case 'admin':
        data.admin = {
          userStats: generateUserStats(),
          xpStats: generateXPStats(),
          studyModeUsage: generateStudyModeUsage(),
          systemAlerts: generateSystemAlerts(),
          systemHealth: {
            uptime: 99.8,
            responseTime: 245,
            errorRate: 0.02
          }
        };
        break;
    }

    return data;
  };

  return {
    generateXPProgress,
    generateLessonProgress,
    generateRecentAnswers,
    generateStudyReflection,
    generateStudentOverview,
    generateLeaderboard,
    generateEngagementDiagnostics,
    generateChildProgress,
    generateMotivationCards,
    generateSystemAlerts,
    generateUserStats,
    generateXPStats,
    generateStudyModeUsage,
    getDashboardData
  };
};