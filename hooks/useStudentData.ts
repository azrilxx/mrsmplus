import { useState, useEffect } from 'react';
import { useFirebase } from './useFirebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface StudentData {
  id: string;
  name: string;
  totalXP: number; 
  currentLevel: number;
  completedTopics: string[];
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
    if (!studentData) return;
    
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

  return { studentData, loading, updateXP };
};