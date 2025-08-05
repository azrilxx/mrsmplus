import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentProgress, updateStudentXP, logQuestionAttempt, initializeStudentProgress, QuestionAttempt } from '../../firebase/queries';
import QuestionCard from '../../components/QuestionCard';
import XPBadge from '../../components/XPBadge';

// Types for the study session
interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  xpValue: number;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface StudySessionState {
  questions: Question[];
  currentQuestionIndex: number;
  completedQuestions: number;
  correctAnswers: number;
  totalXPEarned: number;
  sessionStartTime: Date;
  sessionAttempts: QuestionAttempt[];
}

interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  xpEarned: number;
}

interface StudySessionProps {
  subject: string;
  onBack?: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ subject, onBack }) => {
  const { user } = useAuth();
  
  // Core state
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [session, setSession] = useState<StudySessionState>({
    questions: [],
    currentQuestionIndex: 0,
    completedQuestions: 0,
    correctAnswers: 0,
    totalXPEarned: 0,
    sessionStartTime: new Date(),
    sessionAttempts: []
  });
  
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: false,
    userAnswer: '',
    correctAnswer: '',
    explanation: '',
    xpEarned: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (subject && user) {
      initializeStudySession();
    }
  }, [subject, user]);

  const initializeStudySession = async () => {
    if (!user || !subject) return;
    
    try {
      setLoading(true);
      
      // Initialize student progress if needed  
      await initializeStudentProgress(user.uid, (user as any).email || 'Student');
      
      // Fetch student progress
      const progress = await getStudentProgress(user.uid);
      setStudentProgress(progress);
      
      // Generate or load questions
      const questions = await generateQuestions(subject as string);
      setSession(prev => ({
        ...prev,
        questions,
        sessionStartTime: new Date()
      }));
      
    } catch (error) {
      console.error('Error initializing study session:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async (subjectId: string): Promise<Question[]> => {
    try {
      // First try to use Claude integration (if available)
      const claudeQuestions = await generateClaudeQuestions(subjectId);
      if (claudeQuestions.length > 0) {
        return claudeQuestions;
      }
      
      // Fallback to JSON content
      const response = await fetch(`/content/${subjectId}.json`);
      if (response.ok) {
        const data = await response.json();
        return generateFallbackQuestions(subjectId, data);
      }
      
      // Ultimate fallback - hardcoded questions
      return getHardcodedQuestions(subjectId);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      return getHardcodedQuestions(subjectId);
    }
  };

  const generateClaudeQuestions = async (subjectId: string): Promise<Question[]> => {
    // TODO: Implement Claude API integration
    // This would call the Claude ingestion agent to generate dynamic questions
    // For now, return empty array to use fallback
    return [];
  };

  const generateFallbackQuestions = (subjectId: string, data: any): Question[] => {
    // Generate questions based on JSON content structure
    const questions: Question[] = [];
    const topics = data.topics || [];
    
    topics.forEach((topic: any, index: number) => {
      // Generate 2-3 questions per topic
      const questionCount = Math.min(3, topic.questions || 2);
      for (let i = 0; i < questionCount; i++) {
        questions.push({
          id: `${subjectId}_${topic.id}_${i}`,
          question: `Question ${i + 1} for ${topic.name}: What is the key concept?`,
          type: Math.random() > 0.5 ? 'multiple_choice' : 'short_answer',
          options: topic.type === 'multiple_choice' ? [
            'Option A', 'Option B', 'Option C', 'Option D'
          ] : undefined,
          correctAnswer: topic.type === 'multiple_choice' ? 'Option B' : 'Sample Answer',
          explanation: `This covers the fundamentals of ${topic.name}`,
          xpValue: topic.xp_reward || 10,
          topic: topic.name,
          difficulty: 'medium'
        });
      }
    });
    
    return questions.slice(0, 10); // Limit to 10 questions per session
  };

  const getHardcodedQuestions = (subjectId: string): Question[] => {
    const questionBank: { [key: string]: Question[] } = {
      'math': [
        {
          id: 'math_1', question: 'What is 12 + 8?', type: 'multiple_choice',
          options: ['18', '19', '20', '21'], correctAnswer: '20',
          explanation: 'Simple addition: 12 + 8 = 20', xpValue: 10
        },
        {
          id: 'math_2', question: 'Solve: 3x = 15. What is x?', type: 'short_answer',
          correctAnswer: '5', explanation: 'Divide both sides by 3: x = 15/3 = 5', xpValue: 15
        },
        {
          id: 'math_3', question: 'What is 7 × 6?', type: 'multiple_choice',
          options: ['40', '41', '42', '43'], correctAnswer: '42',
          explanation: 'Multiplication: 7 × 6 = 42', xpValue: 10
        }
      ],
      'science': [
        {
          id: 'science_1', question: 'What is the chemical symbol for oxygen?', type: 'short_answer',
          correctAnswer: 'O', explanation: 'Oxygen has the chemical symbol O', xpValue: 10
        },
        {
          id: 'science_2', question: 'How many planets are in our solar system?', type: 'multiple_choice',
          options: ['7', '8', '9', '10'], correctAnswer: '8',
          explanation: 'There are 8 planets in our solar system', xpValue: 10
        }
      ],
      'english': [
        {
          id: 'english_1', question: 'Choose the correct past tense of "go":', type: 'multiple_choice',
          options: ['goed', 'went', 'gone', 'going'], correctAnswer: 'went',
          explanation: 'The past tense of "go" is "went"', xpValue: 10
        }
      ]
    };

    return questionBank[subjectId] || [
      {
        id: 'default_1', question: 'What is 2 + 2?', type: 'multiple_choice',
        options: ['3', '4', '5', '6'], correctAnswer: '4',
        explanation: 'Basic addition: 2 + 2 = 4', xpValue: 5
      }
    ];
  };

  const handleAnswerSubmit = async (userAnswer: string, isCorrect: boolean, xpEarned: number) => {
    if (!user || session.questions.length === 0) return;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      // Update student XP
      if (xpEarned > 0) {
        await updateStudentXP(user.uid, xpEarned);
      }

      // Log the attempt
      const attempt: QuestionAttempt = {
        id: `${Date.now()}_${currentQuestion.id}`,
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        xpAwarded: xpEarned,
        subject: subject,
        topic: currentQuestion.topic,
        timestamp: new Date()
      };

      await logQuestionAttempt(user.uid, attempt);

      // Update session state
      setSession(prev => ({
        ...prev,
        completedQuestions: prev.completedQuestions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalXPEarned: prev.totalXPEarned + xpEarned,
        sessionAttempts: [...prev.sessionAttempts, attempt]
      }));

      // Update student progress state
      if (studentProgress) {
        setStudentProgress((prev: any) => ({
          ...prev,
          totalXP: (prev.totalXP || 0) + xpEarned,
          currentXP: (prev.currentXP || 0) + xpEarned
        }));
      }

      // Show feedback
      setFeedback({
        show: true,
        isCorrect,
        userAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        xpEarned
      });

    } catch (error) {
      console.error('Error handling answer submission:', error);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex >= session.questions.length) {
      // Session complete
      setSessionComplete(true);
    } else {
      // Move to next question
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      
      setFeedback({
        show: false,
        isCorrect: false,
        userAnswer: '',
        correctAnswer: '',
        explanation: '',
        xpEarned: 0
      });
    }
  };

  const handleRestartSession = () => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      completedQuestions: 0,
      correctAnswers: 0,
      totalXPEarned: 0,
      sessionStartTime: new Date(),
      sessionAttempts: []
    }));
    
    setFeedback({
      show: false,
      isCorrect: false,
      userAnswer: '',
      correctAnswer: '',
      explanation: '',
      xpEarned: 0
    });
    
    setSessionComplete(false);
  };

  const handleBackToStudy = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/study';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-lg font-medium text-gray-700">Loading study session...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (!subject || session.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-700">Unable to load questions</div>
          <button 
            onClick={handleBackToStudy}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Study Mode
          </button>
        </div>
      </div>
    );
  }

  // Session complete state
  if (sessionComplete) {
    const accuracy = session.completedQuestions > 0 ? 
      (session.correctAnswers / session.completedQuestions * 100).toFixed(1) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Session Complete */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Session Complete!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-2xl font-bold text-blue-600">{session.completedQuestions}</div>
                <div className="text-blue-700">Questions Answered</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-green-700">Accuracy</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="text-2xl font-bold text-yellow-600">{session.totalXPEarned}</div>
                <div className="text-yellow-700">XP Earned</div>
              </div>
            </div>

            {studentProgress && (
              <div className="mb-8">
                <XPBadge 
                  currentXP={studentProgress.totalXP}
                  gainedXP={session.totalXPEarned}
                  animate={true}
                  size="large"
                  rewardMessage="Session Complete!"
                />
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestartSession}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToStudy}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Back to Study Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToStudy}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Study Mode
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{subject}</h1>
            <p className="text-gray-600">
              {session.completedQuestions} of {session.questions.length} completed
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {studentProgress && (
              <XPBadge 
                currentXP={studentProgress.totalXP || 0}
                gainedXP={feedback.show && feedback.isCorrect ? feedback.xpEarned : 0}
                animate={feedback.show && feedback.isCorrect}
                size="medium"
              />
            )}
          </div>
        </div>

        {/* Question or Feedback */}
        {!feedback.show ? (
          <QuestionCard
            question={currentQuestion.question}
            type={currentQuestion.type}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            explanation={currentQuestion.explanation}
            xpValue={currentQuestion.xpValue}
            onAnswerSubmit={handleAnswerSubmit}
            questionNumber={session.currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
            timeLimit={60}
          />
        ) : (
          /* Feedback Display */
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl text-center ${
              feedback.isCorrect 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-red-100 border border-red-200'
            }`}>
              <div className="text-4xl mb-2">
                {feedback.isCorrect ? '🎉' : '😔'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                feedback.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
              </h3>
              <p className="text-gray-700 mb-2">
                {feedback.isCorrect 
                  ? `Great job! You earned ${feedback.xpEarned} XP!` 
                  : `The correct answer is: ${feedback.correctAnswer}`
                }
              </p>
              {!feedback.isCorrect && feedback.userAnswer && (
                <p className="text-sm text-gray-600">
                  Your answer: {feedback.userAnswer}
                </p>
              )}
            </div>

            {feedback.explanation && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                <p className="text-blue-700">{feedback.explanation}</p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                {session.currentQuestionIndex + 1 >= session.questions.length ? 'Finish Session' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;