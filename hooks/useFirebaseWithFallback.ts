import { useState, useEffect } from 'react';
import { useMockFirestore } from './useMockFirestore';
import { DashboardData, UserRole } from '../types/dashboard';

interface FirebaseStatus {
  isConnected: boolean;
  connectionAttempted: boolean;
  error: string | null;
  retryCount: number;
}

export const useFirebaseWithFallback = () => {
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>({
    isConnected: false,
    connectionAttempted: false,
    error: null,
    retryCount: 0
  });
  
  const mockFirestore = useMockFirestore();

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const checkFirebaseConnection = async () => {
    setFirebaseStatus(prev => ({
      ...prev,
      connectionAttempted: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      const { db } = await import('../firebase');
      
      const testDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
        getDoc(doc(db, 'system', 'health-check'))
      );
      
      setFirebaseStatus(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }));
      
      console.log('✅ Firebase connection successful');
    } catch (error: any) {
      console.warn('⚠️ Firebase unavailable, using mock data:', error.message);
      
      setFirebaseStatus(prev => ({
        ...prev,
        isConnected: false,
        error: error.message
      }));
    }
  };

  const retryConnection = () => {
    if (firebaseStatus.retryCount < 3) {
      checkFirebaseConnection();
    }
  };

  const getDashboardData = async (role: UserRole): Promise<DashboardData> => {
    if (!firebaseStatus.isConnected) {
      console.log('🔄 Using mock data fallback for role:', role);
      return mockFirestore.getDashboardData(role);
    }

    try {
      const firebaseData = await fetchFirebaseData(role);
      console.log('✅ Using Firebase data for role:', role);
      return firebaseData;
    } catch (error) {
      console.warn('⚠️ Firebase fetch failed, falling back to mock data:', error);
      setFirebaseStatus(prev => ({ ...prev, isConnected: false }));
      return mockFirestore.getDashboardData(role);
    }
  };

  const fetchFirebaseData = async (role: UserRole): Promise<DashboardData> => {
    const { db } = await import('../firebase');
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    switch (role) {
      case 'student':
        const studentData = await getDocs(collection(db, 'student_dashboard'));
        return processFirebaseStudentData(studentData);
      
      case 'teacher':
        const teacherData = await getDocs(
          query(collection(db, 'teacher_dashboard'), where('active', '==', true))
        );
        return processFirebaseTeacherData(teacherData);
      
      case 'parent':
        const parentData = await getDocs(collection(db, 'parent_dashboard'));
        return processFirebaseParentData(parentData);
      
      case 'admin':
        const adminData = await getDocs(collection(db, 'admin_dashboard'));
        return processFirebaseAdminData(adminData);
      
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  };

  const processFirebaseStudentData = (querySnapshot: any): DashboardData => {
    if (querySnapshot.empty) {
      return mockFirestore.getDashboardData('student');
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      student: {
        xpProgress: data.xpProgress || mockFirestore.generateXPProgress(),
        lessonProgress: data.lessonProgress || mockFirestore.generateLessonProgress(),
        recentAnswers: data.recentAnswers || mockFirestore.generateRecentAnswers(),
        studyReflection: data.studyReflection || mockFirestore.generateStudyReflection()
      }
    };
  };

  const processFirebaseTeacherData = (querySnapshot: any): DashboardData => {
    if (querySnapshot.empty) {
      return mockFirestore.getDashboardData('teacher');
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      teacher: {
        students: data.students || mockFirestore.generateStudentOverview(),
        leaderboard: data.leaderboard || mockFirestore.generateLeaderboard(),
        engagementDiagnostics: data.engagementDiagnostics || mockFirestore.generateEngagementDiagnostics(),
        classStats: data.classStats || {
          totalStudents: 28,
          averageXP: 2156,
          completionRate: 73
        }
      }
    };
  };

  const processFirebaseParentData = (querySnapshot: any): DashboardData => {
    if (querySnapshot.empty) {
      return mockFirestore.getDashboardData('parent');
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      parent: {
        children: data.children || mockFirestore.generateChildProgress(),
        motivationCards: data.motivationCards || mockFirestore.generateMotivationCards(),
        familyStats: data.familyStats || {
          totalXP: 2450,
          activeChildren: 1,
          weeklyGoalProgress: 107
        }
      }
    };
  };

  const processFirebaseAdminData = (querySnapshot: any): DashboardData => {
    if (querySnapshot.empty) {
      return mockFirestore.getDashboardData('admin');
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      admin: {
        userStats: data.userStats || mockFirestore.generateUserStats(),
        xpStats: data.xpStats || mockFirestore.generateXPStats(),
        studyModeUsage: data.studyModeUsage || mockFirestore.generateStudyModeUsage(),
        systemAlerts: data.systemAlerts || mockFirestore.generateSystemAlerts(),
        systemHealth: data.systemHealth || {
          uptime: 99.8,
          responseTime: 245,
          errorRate: 0.02
        }
      }
    };
  };

  const getConnectionStatus = () => {
    if (!firebaseStatus.connectionAttempted) {
      return { 
        status: 'checking', 
        message: 'Checking Firebase connection...' 
      };
    }
    
    if (firebaseStatus.isConnected) {
      return { 
        status: 'connected', 
        message: 'Connected to Firebase' 
      };
    }
    
    return { 
      status: 'fallback', 
      message: 'Using offline mode (mock data)' 
    };
  };

  const getStatusIndicator = () => {
    const { status } = getConnectionStatus();
    
    switch (status) {
      case 'connected':
        return { color: 'green', icon: '🟢', text: 'Online' };
      case 'fallback':
        return { color: 'orange', icon: '🟡', text: 'Offline Mode' };
      default:
        return { color: 'gray', icon: '⚪', text: 'Connecting...' };
    }
  };

  return {
    firebaseStatus,
    getDashboardData,
    retryConnection,
    getConnectionStatus,
    getStatusIndicator,
    isUsingMockData: !firebaseStatus.isConnected
  };
};