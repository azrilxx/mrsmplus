import { useState, useEffect } from 'react';
import { useFirebase } from './useFirebase';
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from 'firebase/firestore';

export interface StudentData {
  id: string;
  name: string;
  totalXP: number; 
  currentLevel: number;
  completedTopics: string[];
}

export interface XPLogEntry {
  subject: string;
  question: string;
  answer: string;
  correct: boolean;
  xpAwarded: number;
  timestamp: Date;
}

export const useStudentData = (studentId: string) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;
      
      try {
        const docRef = doc(db, 'students', studentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStudentData({ id: studentId, ...docSnap.data() } as StudentData);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, db]);

  const updateXP = async (xpGained: number) => {
    if (!studentData || !studentId) return;
    
    const newXP = studentData.totalXP + xpGained;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    try {
      const docRef = doc(db, 'students', studentId);
      await updateDoc(docRef, {
        totalXP: newXP,
        currentLevel: newLevel
      });
      
      setStudentData(prev => prev ? { ...prev, totalXP: newXP, currentLevel: newLevel } : null);
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  };

  const logXPActivity = async (logEntry: XPLogEntry) => {
    if (!studentId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const logRef = doc(db, 'students', studentId, 'xpLogs', today);
      
      // Get existing logs for today
      const logDoc = await getDoc(logRef);
      const existingLogs = logDoc.exists() ? (logDoc.data().activities || []) : [];
      
      // Add new log entry
      const newActivity = {
        ...logEntry,
        timestamp: logEntry.timestamp.toISOString()
      };
      
      const updatedLogs = [...existingLogs, newActivity];
      
      // Update the document
      await setDoc(logRef, {
        date: today,
        activities: updatedLogs,
        totalXPEarned: updatedLogs.reduce((sum, activity) => sum + activity.xpAwarded, 0),
        totalQuestions: updatedLogs.length,
        correctAnswers: updatedLogs.filter(activity => activity.correct).length
      });
      
      console.log('XP activity logged successfully');
    } catch (error) {
      console.error('Error logging XP activity:', error);
    }
  };

  const initializeStudent = async (userId: string, name: string = 'Student') => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'students', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const initialData: StudentData = {
          id: userId,
          name: name,
          totalXP: 0,
          currentLevel: 1,
          completedTopics: []
        };
        
        await setDoc(docRef, initialData);
        setStudentData(initialData);
        console.log('Student initialized');
      }
    } catch (error) {
      console.error('Error initializing student:', error);
    }
  };

  return { studentData, loading, updateXP, logXPActivity, initializeStudent };
};