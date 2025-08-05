import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  DocumentData,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface FirebaseUser {
  uid: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  name: string;
  email: string;
  studentId?: string;
  linkedStudentId?: string;
  linkedParentId?: string;
  classId?: string;
}

export interface StudentProgress {
  studentId: string;
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  totalXP: number;
  weeklyProgress: number;
  lastActivity: Date;
  streakDays: number;
  subjectProgress: {
    [subject: string]: {
      completedLessons: number;
      totalLessons: number;
      lastAccessed: Date;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    };
  };
  reflectionLogs: StudyReflection[];
  completedQuestions?: QuestionAttempt[];
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

export interface ClassData {
  classId: string;
  teacherUid: string;
  students: string[];
  className: string;
  subject: string;
}

export interface UploadData {
  fileId: string;
  teacherUid: string;
  fileName: string;
  subject: string;
  topic: string;
  uploadDate: Date;
  questionsFound: number;
  isActive: boolean;
}

// Student Queries
export const getStudentProgress = async (studentId: string): Promise<StudentProgress | null> => {
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
    console.error('Error fetching student progress:', error);
    return null;
  }
};

export const getUserData = async (uid: string): Promise<FirebaseUser | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirebaseUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Teacher Queries
export const getTeacherClasses = async (teacherUid: string): Promise<ClassData[]> => {
  try {
    const q = query(
      collection(db, 'classes'),
      where('teacherUid', '==', teacherUid)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      classId: doc.id,
      ...doc.data()
    })) as ClassData[];
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }
};

export const getStudentsInClass = async (classId: string): Promise<FirebaseUser[]> => {
  try {
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (!classDoc.exists()) return [];
    
    const classData = classDoc.data() as ClassData;
    const studentPromises = classData.students.map(studentUid => 
      getDoc(doc(db, 'users', studentUid))
    );
    
    const studentDocs = await Promise.all(studentPromises);
    return studentDocs
      .filter(doc => doc.exists())
      .map(doc => ({ uid: doc.id, ...doc.data() })) as FirebaseUser[];
  } catch (error) {
    console.error('Error fetching students in class:', error);
    return [];
  }
};

export const getStudentProgressBatch = async (studentIds: string[]): Promise<StudentProgress[]> => {
  try {
    const progressPromises = studentIds.map(studentId => 
      getStudentProgress(studentId)
    );
    
    const progressResults = await Promise.all(progressPromises);
    return progressResults.filter(progress => progress !== null) as StudentProgress[];
  } catch (error) {
    console.error('Error fetching student progress batch:', error);
    return [];
  }
};

export const getTeacherUploads = async (teacherUid: string, limitCount: number = 20): Promise<UploadData[]> => {
  try {
    const q = query(
      collection(db, 'uploads'),
      where('teacherUid', '==', teacherUid),
      orderBy('uploadDate', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      fileId: doc.id,
      ...doc.data(),
      uploadDate: doc.data().uploadDate?.toDate()
    })) as UploadData[];
  } catch (error) {
    console.error('Error fetching teacher uploads:', error);
    return [];
  }
};

// Parent Queries
export const getLinkedStudentData = async (parentUid: string): Promise<{user: FirebaseUser, progress: StudentProgress} | null> => {
  try {
    const parentDoc = await getDoc(doc(db, 'users', parentUid));
    if (!parentDoc.exists()) return null;
    
    const parentData = parentDoc.data() as FirebaseUser;
    if (!parentData.linkedStudentId) return null;
    
    const [studentUser, studentProgress] = await Promise.all([
      getUserData(parentData.linkedStudentId),
      getStudentProgress(parentData.linkedStudentId)
    ]);
    
    if (!studentUser || !studentProgress) return null;
    
    return {
      user: studentUser,
      progress: studentProgress
    };
  } catch (error) {
    console.error('Error fetching linked student data:', error);
    return null;
  }
};

// Admin Queries
export const getAllUsers = async (): Promise<FirebaseUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as FirebaseUser[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const getUsersByRole = async (role: string): Promise<FirebaseUser[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as FirebaseUser[];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};

export const getAllStudentProgress = async (): Promise<StudentProgress[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'studentProgress'));
    return querySnapshot.docs.map(doc => ({
      studentId: doc.id,
      ...doc.data(),
      lastActivity: doc.data().lastActivity?.toDate(),
      reflectionLogs: doc.data().reflectionLogs?.map((log: any) => ({
        ...log,
        date: log.date?.toDate()
      })) || []
    })) as StudentProgress[];
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    return [];
  }
};

export const getAllUploads = async (): Promise<UploadData[]> => {
  try {
    const q = query(
      collection(db, 'uploads'),
      orderBy('uploadDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      fileId: doc.id,
      ...doc.data(),
      uploadDate: doc.data().uploadDate?.toDate()
    })) as UploadData[];
  } catch (error) {
    console.error('Error fetching all uploads:', error);
    return [];
  }
};

// Study Mode specific interfaces and queries
export interface QuestionAttempt {
  id: string;
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  xpAwarded: number;
  subject: string;
  topic?: string;
  timestamp: Date;
  timeSpent?: number;
}

export interface StudySession {
  id: string;
  studentId: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  questionsAttempted: number;
  correctAnswers: number;
  totalXPEarned: number;
  attempts: QuestionAttempt[];
}

// XP and Answer Log Functions
export const updateStudentXP = async (studentId: string, xpToAdd: number): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data() as StudentProgress;
      const newTotalXP = (currentData.totalXP || 0) + xpToAdd;
      const newCurrentXP = (currentData.currentXP || 0) + xpToAdd;
      
      // Simple level calculation (every 100 XP = 1 level)
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const xpToNextLevel = 100 - (newTotalXP % 100);
      
      await updateDoc(docRef, {
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        level: newLevel,
        xpToNextLevel: xpToNextLevel,
        lastActivity: new Date(),
        weeklyProgress: (currentData.weeklyProgress || 0) + xpToAdd
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating student XP:', error);
    return false;
  }
};

export const logQuestionAttempt = async (studentId: string, attempt: QuestionAttempt): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data() as StudentProgress;
      const completedQuestions = currentData.completedQuestions || [];
      
      // Add the new attempt
      const newAttempt = {
        ...attempt,
        timestamp: new Date()
      };
      
      await updateDoc(docRef, {
        completedQuestions: [...completedQuestions, newAttempt],
        lastActivity: new Date()
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error logging question attempt:', error);
    return false;
  }
};

export const getStudentQuestionHistory = async (studentId: string, limit: number = 50): Promise<QuestionAttempt[]> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const attempts = data.completedQuestions || [];
      
      return attempts
        .map((attempt: any) => ({
          ...attempt,
          timestamp: attempt.timestamp?.toDate()
        }))
        .sort((a: QuestionAttempt, b: QuestionAttempt) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )
        .slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching question history:', error);
    return [];
  }
};

export const initializeStudentProgress = async (studentId: string, studentName: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'studentProgress', studentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        studentId,
        currentXP: 0,
        level: 1,
        xpToNextLevel: 100,
        totalXP: 0,
        weeklyProgress: 0,
        lastActivity: new Date(),
        streakDays: 0,
        subjectProgress: {},
        reflectionLogs: [],
        completedQuestions: []
      });
    }
    return true;
  } catch (error) {
    console.error('Error initializing student progress:', error);
    return false;
  }
};

// Real-time listeners
export const subscribeToStudentProgress = (
  studentId: string, 
  callback: (progress: StudentProgress | null) => void
) => {
  const docRef = doc(db, 'studentProgress', studentId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const progress: StudentProgress = {
        ...data,
        lastActivity: data.lastActivity?.toDate(),
        reflectionLogs: data.reflectionLogs?.map((log: any) => ({
          ...log,
          date: log.date?.toDate()
        })) || []
      } as StudentProgress;
      callback(progress);
    } else {
      callback(null);
    }
  });
};

export const subscribeToClassStudents = (
  classId: string,
  callback: (students: FirebaseUser[]) => void
) => {
  const docRef = doc(db, 'classes', classId);
  return onSnapshot(docRef, async (doc) => {
    if (doc.exists()) {
      const classData = doc.data() as ClassData;
      const students = await getStudentsInClass(classId);
      callback(students);
    } else {
      callback([]);
    }
  });
};