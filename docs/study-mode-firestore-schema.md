# MARA+ Study Mode Firestore Schema

## Database Structure

### Collection: `study_sessions`
Path: `/study_sessions/{sessionId}`

```typescript
interface StudySession {
  sessionId: string;           // Unique session identifier
  userId: string;              // User ID from Firebase Auth
  subject: string;             // e.g., "mathematics", "science", "english"
  topic: string;               // e.g., "algebra", "biology", "grammar"
  startTime: Timestamp;        // Session start time
  endTime?: Timestamp;         // Session completion time
  status: 'active' | 'completed' | 'abandoned';
  
  // Question data
  questions: Question[];       // Array of questions asked
  totalQuestions: number;      // Number of questions in session
  
  // Performance metrics
  answers: StudyAnswer[];      // User responses and results
  correctAnswers: number;      // Count of correct answers
  totalXP: number;            // XP earned in this session
  accuracy: number;           // Percentage accuracy (0-100)
  averageTimePerQuestion: number; // In seconds
  
  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Question {
  id: string;                  // Question identifier
  question: string;            // Question text
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];          // For multiple choice questions
  correctAnswer: string;       // The correct answer
  explanation?: string;        // Built-in explanation
  hint?: string;              // Hint text
  difficulty: 'easy' | 'medium' | 'hard';
  xpValue: number;            // XP awarded for correct answer
  tags: string[];             // Topic tags for categorization
  source: string;             // "curated" | "ai_generated" | "imported"
}

interface StudyAnswer {
  questionId: string;          // Reference to question
  userAnswer: string;          // User's submitted answer
  isCorrect: boolean;          // Whether answer was correct
  timeSpent: number;          // Time spent on question (seconds)
  xpEarned: number;           // XP earned for this answer
  hintsUsed: number;          // Number of hints requested
  explanation?: string;        // AI-generated explanation if requested
  answeredAt: Timestamp;      // When answer was submitted
}
```

## Sample Firestore Documents

### Sample Study Session
```json
{
  "sessionId": "session_1640995200000_user123",
  "userId": "user123",
  "subject": "mathematics",
  "topic": "algebra",
  "startTime": "2024-01-15T10:30:00Z",
  "endTime": "2024-01-15T10:45:00Z",
  "status": "completed",
  "questions": [
    {
      "id": "alg_001",
      "question": "Solve for x: 2x + 5 = 15",
      "type": "short_answer",
      "correctAnswer": "5",
      "explanation": "Subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5",
      "hint": "Isolate x by performing the same operation on both sides",
      "difficulty": "easy",
      "xpValue": 15,
      "tags": ["linear_equations", "basic_algebra"],
      "source": "curated"
    }
  ],
  "totalQuestions": 5,
  "answers": [
    {
      "questionId": "alg_001",
      "userAnswer": "5",
      "isCorrect": true,
      "timeSpent": 25,
      "xpEarned": 15,
      "hintsUsed": 0,
      "answeredAt": "2024-01-15T10:32:00Z"
    }
  ],
  "correctAnswers": 4,
  "totalXP": 65,
  "accuracy": 80,
  "averageTimePerQuestion": 32,
  "difficulty": "easy",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

### Collection: `user_study_progress`
Path: `/user_study_progress/{userId}`

```typescript
interface UserStudyProgress {
  userId: string;
  totalXP: number;
  totalSessionsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  
  // Subject-specific progress
  subjectProgress: {
    [subject: string]: {
      xp: number;
      sessionsCompleted: number;
      questionsAnswered: number;
      correctAnswers: number;
      accuracy: number;
      topics: {
        [topic: string]: {
          xp: number;
          questionsAnswered: number;
          correctAnswers: number;
          accuracy: number;
          masteryLevel: 'learning' | 'developing' | 'proficient' | 'expert';
          lastStudied: Timestamp;
        }
      }
    }
  };
  
  // Achievement tracking
  achievements: {
    id: string;
    unlockedAt: Timestamp;
    type: 'accuracy' | 'streak' | 'xp_milestone' | 'subject_mastery';
  }[];
  
  // Study streaks
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Timestamp;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Sample User Progress
```json
{
  "userId": "user123",
  "totalXP": 2450,
  "totalSessionsCompleted": 25,
  "totalQuestionsAnswered": 125,
  "totalCorrectAnswers": 98,
  "overallAccuracy": 78.4,
  "subjectProgress": {
    "mathematics": {
      "xp": 850,
      "sessionsCompleted": 10,
      "questionsAnswered": 50,
      "correctAnswers": 42,
      "accuracy": 84,
      "topics": {
        "algebra": {
          "xp": 300,
          "questionsAnswered": 20,
          "correctAnswers": 18,
          "accuracy": 90,
          "masteryLevel": "proficient",
          "lastStudied": "2024-01-15T10:45:00Z"
        }
      }
    }
  },
  "achievements": [
    {
      "id": "first_perfect_session",
      "unlockedAt": "2024-01-10T14:30:00Z",
      "type": "accuracy"
    },
    {
      "id": "xp_milestone_1000",
      "unlockedAt": "2024-01-14T16:20:00Z",
      "type": "xp_milestone"
    }
  ],
  "currentStreak": 5,
  "longestStreak": 12,
  "lastStudyDate": "2024-01-15T10:45:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

### Collection: `curated_lessons`
Path: `/curated_lessons/{subject}/{topic}/{lessonId}`

```typescript
interface CuratedLesson {
  lessonId: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // in minutes
  
  questions: Question[];
  totalQuestions: number;
  
  learningObjectives: string[];
  prerequisites: string[];
  relatedTopics: string[];
  
  metadata: {
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    version: string;
    curriculum: 'MRSM' | 'SPM' | 'IGCSE';
    language: 'en' | 'ms';
  };
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Study sessions - users can only access their own
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // User study progress - users can only access their own
    match /user_study_progress/{userId} {
      allow read, write: if request.auth != null && 
        userId == request.auth.uid;
    }
    
    // Curated lessons - read-only for authenticated users
    match /curated_lessons/{subject}/{topic}/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Admin collections - admin only
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Cloud Functions Integration

### Function: `awardXP`
- Triggered when study session is completed
- Updates user's total XP and subject-specific progress
- Checks for achievement unlocks
- Updates mastery levels based on performance

### Function: `generateStudyQuestions`
- Called when starting a new study session
- Fetches questions from curated lessons
- Can generate additional AI questions if needed
- Adapts difficulty based on user performance

### Function: `trackStudyAnalytics`
- Aggregates study data for admin dashboard
- Tracks usage patterns and popular topics
- Monitors system performance metrics

## Usage Examples

### Starting a Study Session
```typescript
// Create new session
const sessionData = {
  sessionId: `session_${Date.now()}_${userId}`,
  userId: userId,
  subject: 'mathematics',
  topic: 'algebra',
  startTime: admin.firestore.Timestamp.now(),
  status: 'active',
  questions: questionsArray,
  totalQuestions: questionsArray.length,
  answers: [],
  correctAnswers: 0,
  totalXP: 0,
  accuracy: 0,
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now()
};

await db.collection('study_sessions').doc(sessionData.sessionId).set(sessionData);
```

### Recording an Answer
```typescript
// Add answer to session
const answerData = {
  questionId: 'alg_001',
  userAnswer: '5',
  isCorrect: true,
  timeSpent: 25,
  xpEarned: 15,
  hintsUsed: 0,
  answeredAt: admin.firestore.Timestamp.now()
};

await db.collection('study_sessions').doc(sessionId).update({
  answers: admin.firestore.FieldValue.arrayUnion(answerData),
  correctAnswers: admin.firestore.FieldValue.increment(1),
  totalXP: admin.firestore.FieldValue.increment(15),
  updatedAt: admin.firestore.Timestamp.now()
});
```

### Completing a Session
```typescript
// Calculate final metrics and update session
const accuracy = (correctAnswers / totalQuestions) * 100;
const avgTime = totalTimeSpent / totalQuestions;

await db.collection('study_sessions').doc(sessionId).update({
  endTime: admin.firestore.Timestamp.now(),
  status: 'completed',
  accuracy: accuracy,
  averageTimePerQuestion: avgTime,
  updatedAt: admin.firestore.Timestamp.now()
});

// Trigger XP award function
await awardXP(userId, totalXP, subject, topic);
```

This schema provides a robust foundation for tracking student progress, managing study sessions, and maintaining educational content in the MARA+ Study Mode system.