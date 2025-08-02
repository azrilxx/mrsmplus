import React, { useState, useEffect } from 'react';
import StudyLauncher from '../../components/StudyLauncher';
import StudyQuestion from '../../components/StudyQuestion';
import AnswerFeedback from '../../components/AnswerFeedback';
import ExplainCard from '../../components/ExplainCard';
import ProgressTracker from '../../components/ProgressTracker';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpValue: number;
}

interface StudySession {
  sessionId: string;
  userId: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    xpEarned: number;
  }[];
  totalXP: number;
  accuracy: number;
}

type StudyMode = 'launcher' | 'question' | 'feedback' | 'completed';

const StudyModePage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<StudyMode>('launcher');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userXP, setUserXP] = useState(850); // Mock current XP
  const [xpGained, setXpGained] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // Mock questions data - in real app, this would come from Firestore
  const mockQuestions: { [key: string]: { [key: string]: Question[] } } = {
    mathematics: {
      algebra: [
        {
          id: 'alg_1',
          question: 'Solve for x: 2x + 5 = 15',
          type: 'short_answer',
          correctAnswer: '5',
          explanation: 'To solve 2x + 5 = 15:\n1. Subtract 5 from both sides: 2x = 10\n2. Divide both sides by 2: x = 5',
          hint: 'Isolate x by performing the same operation on both sides',
          difficulty: 'easy',
          xpValue: 15
        },
        {
          id: 'alg_2',
          question: 'Which of the following is equivalent to 3(x + 4)?',
          type: 'multiple_choice',
          options: ['3x + 4', '3x + 12', 'x + 12', '3x + 7'],
          correctAnswer: '3x + 12',
          explanation: 'Using the distributive property: 3(x + 4) = 3 × x + 3 × 4 = 3x + 12',
          hint: 'Use the distributive property: a(b + c) = ab + ac',
          difficulty: 'easy',
          xpValue: 15
        }
      ],
      geometry: [
        {
          id: 'geo_1',
          question: 'What is the area of a circle with radius 5 units? (Use π ≈ 3.14)',
          type: 'short_answer',
          correctAnswer: '78.5',
          explanation: 'Area of circle = πr²\n= 3.14 × 5²\n= 3.14 × 25\n= 78.5 square units',
          hint: 'Remember the formula: Area = πr²',
          difficulty: 'medium',
          xpValue: 20
        }
      ]
    },
    science: {
      biology: [
        {
          id: 'bio_1',
          question: 'Photosynthesis occurs in which part of the plant cell?',
          type: 'multiple_choice',
          options: ['Nucleus', 'Mitochondria', 'Chloroplasts', 'Ribosomes'],
          correctAnswer: 'Chloroplasts',
          explanation: 'Chloroplasts contain chlorophyll, the green pigment that captures light energy for photosynthesis.',
          hint: 'Think about where chlorophyll is found',
          difficulty: 'easy',
          xpValue: 15
        }
      ]
    },
    english: {
      grammar: [
        {
          id: 'gram_1',
          question: 'Choose the correct sentence:',
          type: 'multiple_choice',
          options: [
            'Me and my friend went to the store',
            'My friend and I went to the store',
            'My friend and me went to the store',
            'I and my friend went to the store'
          ],
          correctAnswer: 'My friend and I went to the store',
          explanation: 'When the pronoun is the subject of the sentence, use "I". Also, it\'s polite to mention the other person first.',
          hint: 'Remove "my friend and" - would you say "Me went" or "I went"?',
          difficulty: 'easy',
          xpValue: 15
        }
      ]
    }
  };

  const handleLaunchStudy = async (subject: string, topic: string) => {
    const questions = mockQuestions[subject]?.[topic] || [];
    
    if (questions.length === 0) {
      // Generate default questions if none exist
      const defaultQuestion: Question = {
        id: 'default_1',
        question: `This is a sample question for ${topic} in ${subject}. What is 2 + 2?`,
        type: 'multiple_choice',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Basic addition: 2 + 2 = 4',
        hint: 'Count on your fingers if needed!',
        difficulty: 'easy',
        xpValue: 10
      };
      questions.push(defaultQuestion);
    }

    const newSession: StudySession = {
      sessionId: `session_${Date.now()}`,
      userId: 'mock_user_id', // In real app, get from auth
      subject,
      topic,
      startTime: new Date(),
      questions: questions.slice(0, 5), // Limit to 5 questions per session
      answers: [],
      totalXP: 0,
      accuracy: 0
    };

    setCurrentSession(newSession);
    setCurrentQuestionIndex(0);
    setXpGained(0);
    setCurrentMode('question');

    // In real app, save session start to Firestore
    await saveSessionToFirestore(newSession);
  };

  const handleAnswerSubmit = async (answer: string, isCorrect: boolean) => {
    if (!currentSession) return;

    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const xpEarned = isCorrect ? currentQuestion.xpValue : Math.floor(currentQuestion.xpValue * 0.3);

    const newAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
      timeSpent: 30, // Mock time - in real app, track actual time
      xpEarned
    };

    const updatedSession = {
      ...currentSession,
      answers: [...currentSession.answers, newAnswer],
      totalXP: currentSession.totalXP + xpEarned
    };

    setCurrentSession(updatedSession);
    setXpGained(prev => prev + xpEarned);
    if (isCorrect) {
      setUserXP(prev => prev + xpEarned);
    }
    setCurrentMode('feedback');

    // Save answer to Firestore
    await saveAnswerToFirestore(updatedSession, newAnswer);
  };

  const handleContinue = () => {
    if (!currentSession) return;

    if (currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentMode('question');
    } else {
      // Session complete
      const finalSession = {
        ...currentSession,
        endTime: new Date(),
        accuracy: currentSession.answers.length > 0 
          ? (currentSession.answers.filter(a => a.isCorrect).length / currentSession.answers.length) * 100 
          : 0
      };
      setCurrentSession(finalSession);
      setCurrentMode('completed');
      
      // Save completed session to Firestore
      saveCompletedSessionToFirestore(finalSession);
    }
    setShowExplanation(false);
  };

  const handleExplain = async () => {
    if (!currentSession) return;
    
    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const currentAnswer = currentSession.answers[currentSession.answers.length - 1];
    
    setIsLoadingExplanation(true);
    setShowExplanation(true);
    
    try {
      // In real app, call AI explanation API
      const explanation = await generateExplanation(
        currentQuestion.question,
        currentQuestion.correctAnswer,
        currentAnswer.userAnswer,
        currentSession.subject,
        currentSession.topic
      );
      
      setCurrentExplanation(explanation);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      setCurrentExplanation(currentQuestion.explanation || 'Unable to generate explanation at this time.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleReturnToLauncher = () => {
    setCurrentMode('launcher');
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setXpGained(0);
    setShowExplanation(false);
  };

  // Mock Firebase functions - replace with real Firebase calls
  const saveSessionToFirestore = async (session: StudySession) => {
    console.log('Saving session to Firestore:', session);
    // Real implementation:
    // await db.collection('study_sessions').doc(session.sessionId).set(session);
  };

  const saveAnswerToFirestore = async (session: StudySession, answer: any) => {
    console.log('Saving answer to Firestore:', answer);
    // Real implementation:
    // await db.collection('study_sessions').doc(session.sessionId).update({
    //   answers: session.answers,
    //   totalXP: session.totalXP
    // });
  };

  const saveCompletedSessionToFirestore = async (session: StudySession) => {
    console.log('Saving completed session to Firestore:', session);
    // Real implementation:
    // await db.collection('study_sessions').doc(session.sessionId).update(session);
    // await updateUserXP(session.userId, session.totalXP);
  };

  const generateExplanation = async (
    question: string, 
    correctAnswer: string, 
    userAnswer: string, 
    subject: string, 
    topic: string
  ): Promise<string> => {
    // Mock AI explanation - replace with real AI API call
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    return `Here's a detailed explanation for this ${subject} question about ${topic}:

The correct answer is "${correctAnswer}" because...

Your answer "${userAnswer}" was close, but here's why the correct answer is better:

1. Understanding the concept: This question tests your knowledge of fundamental principles in ${topic}.

2. Step-by-step approach: When solving problems like this, it's helpful to break them down into smaller parts.

3. Common mistakes: Many students choose "${userAnswer}" because it seems logical at first glance, but the key is to consider all aspects of the problem.

4. Remember: Practice makes perfect! Keep working on similar problems to strengthen your understanding.`;
  };

  const getCurrentQuestion = () => {
    if (!currentSession) return null;
    return currentSession.questions[currentQuestionIndex];
  };

  const getCurrentAnswer = () => {
    if (!currentSession || currentSession.answers.length === 0) return null;
    return currentSession.answers[currentSession.answers.length - 1];
  };

  // Main render logic
  if (currentMode === 'launcher') {
    return <StudyLauncher onLaunchStudy={handleLaunchStudy} />;
  }

  if (!currentSession) {
    return <StudyLauncher onLaunchStudy={handleLaunchStudy} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleReturnToLauncher}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Study Mode
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentSession.subject} • {currentSession.topic}
            </h1>
          </div>
          
          <div></div> {/* Spacer for flexbox */}
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          currentXP={userXP}
          xpGained={xpGained}
          questionsAnswered={currentSession.answers.length}
          correctAnswers={currentSession.answers.filter(a => a.isCorrect).length}
          totalQuestions={currentSession.questions.length}
          subject={currentSession.subject}
          topic={currentSession.topic}
          sessionStartTime={currentSession.startTime}
          onSessionComplete={handleReturnToLauncher}
          showModal={currentMode === 'completed'}
        />

        {/* Main Content */}
        {currentMode === 'question' && (
          <StudyQuestion
            question={getCurrentQuestion()?.question || ''}
            questionType={getCurrentQuestion()?.type || 'multiple_choice'}
            options={getCurrentQuestion()?.options}
            correctAnswer={getCurrentQuestion()?.correctAnswer || ''}
            hint={getCurrentQuestion()?.hint}
            onAnswerSubmit={handleAnswerSubmit}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentSession.questions.length}
            timeLimit={60}
          />
        )}

        {currentMode === 'feedback' && (
          <AnswerFeedback
            isCorrect={getCurrentAnswer()?.isCorrect || false}
            userAnswer={getCurrentAnswer()?.userAnswer || ''}
            correctAnswer={getCurrentQuestion()?.correctAnswer || ''}
            explanation={getCurrentQuestion()?.explanation}
            xpEarned={getCurrentAnswer()?.xpEarned || 0}
            onContinue={handleContinue}
            onExplain={!getCurrentQuestion()?.explanation ? handleExplain : undefined}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentSession.questions.length}
          />
        )}

        {/* Explanation Modal */}
        {showExplanation && (
          <ExplainCard
            question={getCurrentQuestion()?.question || ''}
            correctAnswer={getCurrentQuestion()?.correctAnswer || ''}
            userAnswer={getCurrentAnswer()?.userAnswer || ''}
            explanation={currentExplanation}
            onClose={() => setShowExplanation(false)}
            isLoading={isLoadingExplanation}
            subject={currentSession.subject}
            topic={currentSession.topic}
          />
        )}
      </div>
    </div>
  );
};

export default StudyModePage;