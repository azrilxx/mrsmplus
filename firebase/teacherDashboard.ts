import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { FirebaseUser, StudentProgress, UploadData, ClassData } from './queries';

export interface StudentComment {
  commentId: string;
  studentId: string;
  teacherUid: string;
  comment: string;
  timestamp: Date;
  isPrivate: boolean;
}

export interface ClassEngagementData {
  student: FirebaseUser;
  progress: StudentProgress;
  xpLevel: 'low' | 'medium' | 'high';
  streakStatus: 'none' | 'short' | 'long';
  reflectionStatus: 'missing' | 'recent' | 'regular';
  lastActivity: Date | null;
}

export interface AlertData {
  type: 'no_xp' | 'no_reflection' | 'inactive';
  studentId: string;
  studentName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const getClassEngagementHeatmap = async (teacherUid: string): Promise<ClassEngagementData[]> => {
  try {
    // Get teacher's classes
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherUid', '==', teacherUid)
    );
    const classesSnapshot = await getDocs(classesQuery);
    const classes = classesSnapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() })) as ClassData[];

    if (classes.length === 0) return [];

    // Get all students from all classes
    const allStudentsPromises = classes.map(async cls => {
      const classDoc = await getDoc(doc(db, 'classes', cls.classId));
      if (!classDoc.exists()) return [];
      
      const classData = classDoc.data() as ClassData;
      const studentPromises = classData.students.map(studentUid => 
        getDoc(doc(db, 'users', studentUid))
      );
      
      const studentDocs = await Promise.all(studentPromises);
      return studentDocs
        .filter(doc => doc.exists())
        .map(doc => ({ uid: doc.id, ...doc.data() })) as FirebaseUser[];
    });

    const allStudentsArrays = await Promise.all(allStudentsPromises);
    const allStudents = allStudentsArrays.flat();
    
    // Remove duplicates
    const uniqueStudents = allStudents.filter((student, index, self) => 
      index === self.findIndex(s => s.uid === student.uid)
    );

    // Get progress for all students
    const progressPromises = uniqueStudents.map(async student => {
      const progressDoc = await getDoc(doc(db, 'studentProgress', student.studentId || student.uid));
      let progress: StudentProgress | null = null;
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        progress = {
          ...data,
          lastActivity: data.lastActivity?.toDate(),
          reflectionLogs: data.reflectionLogs?.map((log: any) => ({
            ...log,
            date: log.date?.toDate()
          })) || []
        } as StudentProgress;
      }

      return { student, progress };
    });

    const studentProgressData = await Promise.all(progressPromises);

    // Process engagement data
    const engagementData: ClassEngagementData[] = studentProgressData.map(({ student, progress }) => {
      if (!progress) {
        return {
          student,
          progress: {
            studentId: student.studentId || student.uid,
            currentXP: 0,
            level: 1,
            xpToNextLevel: 100,
            totalXP: 0,
            weeklyProgress: 0,
            lastActivity: new Date(0),
            streakDays: 0,
            subjectProgress: {},
            reflectionLogs: []
          },
          xpLevel: 'low',
          streakStatus: 'none',
          reflectionStatus: 'missing',
          lastActivity: null
        };
      }

      // Determine XP level (based on weekly progress)
      let xpLevel: 'low' | 'medium' | 'high' = 'low';
      if (progress.weeklyProgress > 500) xpLevel = 'high';
      else if (progress.weeklyProgress > 200) xpLevel = 'medium';

      // Determine streak status
      let streakStatus: 'none' | 'short' | 'long' = 'none';
      if (progress.streakDays > 7) streakStatus = 'long';
      else if (progress.streakDays > 0) streakStatus = 'short';

      // Determine reflection status
      let reflectionStatus: 'missing' | 'recent' | 'regular' = 'missing';
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentReflections = progress.reflectionLogs?.filter(log => 
        log.date && log.date > weekAgo
      ) || [];
      
      if (recentReflections.length >= 3) reflectionStatus = 'regular';
      else if (recentReflections.length > 0) reflectionStatus = 'recent';

      return {
        student,
        progress,
        xpLevel,
        streakStatus,
        reflectionStatus,
        lastActivity: progress.lastActivity
      };
    });

    return engagementData.sort((a, b) => b.progress.currentXP - a.progress.currentXP);
  } catch (error) {
    console.error('Error fetching class engagement heatmap:', error);
    return [];
  }
};

export const getTeacherAlerts = async (teacherUid: string): Promise<AlertData[]> => {
  try {
    const engagementData = await getClassEngagementHeatmap(teacherUid);
    const alerts: AlertData[] = [];
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    engagementData.forEach(({ student, progress }) => {
      // Alert: No XP in last 7 days
      if (progress.weeklyProgress === 0) {
        alerts.push({
          type: 'no_xp',
          studentId: student.studentId || student.uid,
          studentName: student.name,
          message: `${student.name} hasn't earned any XP this week`,
          severity: 'high'
        });
      }

      // Alert: No reflections this week
      const recentReflections = progress.reflectionLogs?.filter(log => 
        log.date && log.date > weekAgo
      ) || [];
      
      if (recentReflections.length === 0) {
        alerts.push({
          type: 'no_reflection',
          studentId: student.studentId || student.uid,
          studentName: student.name,
          message: `${student.name} hasn't logged any reflections this week`,
          severity: 'medium'
        });
      }

      // Alert: Inactive (no activity in 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      if (!progress.lastActivity || progress.lastActivity < threeDaysAgo) {
        alerts.push({
          type: 'inactive',
          studentId: student.studentId || student.uid,
          studentName: student.name,
          message: `${student.name} has been inactive for 3+ days`,
          severity: 'medium'
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  } catch (error) {
    console.error('Error fetching teacher alerts:', error);
    return [];
  }
};

export const addStudentComment = async (
  teacherUid: string,
  studentId: string,
  comment: string,
  isPrivate: boolean = false
): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'studentProgress', studentId, 'comments'), {
      teacherUid,
      comment,
      timestamp: Timestamp.now(),
      isPrivate
    });
    return true;
  } catch (error) {
    console.error('Error adding student comment:', error);
    return false;
  }
};

export const getStudentComments = async (studentId: string): Promise<StudentComment[]> => {
  try {
    const commentsQuery = query(
      collection(db, 'studentProgress', studentId, 'comments'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    
    return commentsSnapshot.docs.map(doc => ({
      commentId: doc.id,
      studentId,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as StudentComment[];
  } catch (error) {
    console.error('Error fetching student comments:', error);
    return [];
  }
};

export const getTeacherFileUploads = async (teacherUid: string): Promise<UploadData[]> => {
  try {
    const uploadsQuery = query(
      collection(db, 'uploads'),
      where('teacherUid', '==', teacherUid),
      orderBy('uploadDate', 'desc'),
      limit(20)
    );
    
    const uploadsSnapshot = await getDocs(uploadsQuery);
    
    return uploadsSnapshot.docs.map(doc => ({
      fileId: doc.id,
      ...doc.data(),
      uploadDate: doc.data().uploadDate?.toDate()
    })) as UploadData[];
  } catch (error) {
    console.error('Error fetching teacher file uploads:', error);
    return [];
  }
};

export const updateUploadStatus = async (fileId: string, isActive: boolean): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'uploads', fileId), {
      isActive,
      lastModified: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating upload status:', error);
    return false;
  }
};