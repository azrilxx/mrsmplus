import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function: Award XP and update streak when user completes activities
 * Triggers on write to users/{uid}/xp_logs/{logId}
 */
export const awardXP = functions.firestore
  .document('users/{uid}/xp_logs/{logId}')
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    const xpData = snap.data();
    
    if (!xpData || !xpData.xp_earned) {
      console.log('No XP data found, skipping XP award');
      return null;
    }

    try {
      const userRef = db.collection('users').doc(uid);
      
      return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          // Create new user document if it doesn't exist
          transaction.set(userRef, {
            total_xp: xpData.xp_earned,
            current_streak: 1,
            last_activity: admin.firestore.FieldValue.serverTimestamp(),
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          const userData = userDoc.data()!;
          const currentXP = userData.total_xp || 0;
          const lastActivity = userData.last_activity?.toDate();
          const now = new Date();
          
          // Calculate streak
          let currentStreak = userData.current_streak || 0;
          if (lastActivity) {
            const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
              currentStreak += 1; // Continue streak
            } else if (daysDiff > 1) {
              currentStreak = 1; // Reset streak
            }
            // If daysDiff === 0 (same day), keep current streak
          } else {
            currentStreak = 1;
          }
          
          // Update user document
          transaction.update(userRef, {
            total_xp: currentXP + xpData.xp_earned,
            current_streak: currentStreak,
            last_activity: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw new functions.https.HttpsError('internal', 'Failed to award XP');
    }
  });

/**
 * Cloud Function: Update planner progress and award completion XP
 * Triggers on write to users/{uid}/planner/{weekId}
 */
export const updatePlannerProgress = functions.firestore
  .document('users/{uid}/planner/{weekId}')
  .onUpdate(async (change, context) => {
    const { uid } = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    if (!beforeData || !afterData || !afterData.steps) {
      return null;
    }

    // Check for newly completed steps
    const beforeSteps = beforeData.steps || [];
    const afterSteps = afterData.steps || [];
    
    const newlyCompleted = afterSteps.filter((step: any, index: number) => 
      step.completed && 
      (!beforeSteps[index] || !beforeSteps[index].completed) &&
      step.xp_reward
    );
    
    if (newlyCompleted.length === 0) {
      return null;
    }

    // Award XP for completed steps
    const batch = db.batch();
    
    for (const step of newlyCompleted) {
      const xpLogRef = db.collection('users').doc(uid).collection('xp_logs').doc();
      batch.set(xpLogRef, {
        activity_type: 'planner_step_completed',
        xp_earned: step.xp_reward,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        subject: afterData.subject,
        step_title: step.title
      });
    }
    
    return batch.commit();
  });

/**
 * Cloud Function: Clean up old XP logs to prevent excessive storage
 * Scheduled to run daily
 */
export const cleanupOldLogs = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('Asia/Kuala_Lumpur')
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    let deletionCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const oldLogsQuery = userDoc.ref
        .collection('xp_logs')
        .where('timestamp', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .limit(100); // Process in batches to avoid timeouts
      
      const oldLogs = await oldLogsQuery.get();
      
      oldLogs.forEach(log => {
        batch.delete(log.ref);
        deletionCount++;
      });
    }
    
    if (deletionCount > 0) {
      await batch.commit();
      console.log(`Deleted ${deletionCount} old XP logs`);
    }
    
    return null;
  });