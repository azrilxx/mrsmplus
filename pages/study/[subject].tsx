import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentData } from '../../hooks/useStudentData';
import AnswerCard from '../../components/AnswerCard';
import XPBadge from '../../components/XPBadge';

interface ContentTopic {
  id: string;
  name: string;
  questions: number;
  xp_reward: number;
}

interface ContentSubject {
  subject: string;
  form_level: string;
  topics: ContentTopic[];
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  xpValue: number;
}

interface SubjectStudyPageProps {
  subject: string;
  onBack?: () => void;
}

const SubjectStudyPage: React.FC<SubjectStudyPageProps> = ({ subject, onBack }) => {
  const { user } = useAuth();
  const { studentData, updateXP, logXPActivity, initializeStudent } = useStudentData(user?.uid || '');
  
  const [subjectData, setSubjectData] = useState<ContentSubject | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subject) {
      loadSubjectData(subject);
    }
  }, [subject]);

  useEffect(() => {
    if (user && !studentData) {
      initializeStudent(user.uid, user.email || 'Student');
    }
  }, [user, studentData]);

  const loadSubjectData = async (subjectId: string) => {
    try {
      const response = await fetch(`/content/${subjectId}.json`);
      if (response.ok) {
        const data: ContentSubject = await response.json();
        setSubjectData(data);
        generateQuestion(data);
      } else {
        console.error(`Failed to load ${subjectId}.json`);
      }
    } catch (error) {
      console.error('Error loading subject data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestion = (data: ContentSubject) => {
    // For MVP, generate simple questions based on topics
    const topics = data.topics;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    // Simple question generation based on topic
    const questions = generateQuestionsForTopic(randomTopic, data.subject);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    setCurrentQuestion(randomQuestion);
  };

  const generateQuestionsForTopic = (topic: ContentTopic, subject: string): Question[] => {
    // MVP: Simple hardcoded questions based on subject and topic
    const questionTemplates: { [key: string]: Question[] } = {
      'math': [
        {
          id: 'math_1',
          question: 'What is 5 + 3?',
          type: 'multiple_choice',
          options: ['6', '7', '8', '9'],
          correctAnswer: '8',
          explanation: 'Simple addition: 5 + 3 = 8',
          xpValue: topic.xp_reward
        },
        {
          id: 'math_2',
          question: 'Solve: 2x = 10. What is x?',
          type: 'short_answer',
          correctAnswer: '5',
          explanation: 'Divide both sides by 2: x = 10/2 = 5',
          xpValue: topic.xp_reward
        }
      ],
      'science': [
        {
          id: 'science_1',
          question: 'What is the chemical symbol for water?',
          type: 'short_answer',
          correctAnswer: 'H2O',
          explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom: H2O',
          xpValue: topic.xp_reward
        },
        {
          id: 'science_2',
          question: 'Which planet is closest to the Sun?',
          type: 'multiple_choice',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          correctAnswer: 'Mercury',
          explanation: 'Mercury is the closest planet to the Sun in our solar system',
          xpValue: topic.xp_reward
        }
      ],
      'english': [
        {
          id: 'english_1',
          question: 'Choose the correct spelling:',
          type: 'multiple_choice',
          options: ['recieve', 'receive', 'receve', 'receave'],
          correctAnswer: 'receive',
          explanation: 'The correct spelling is "receive" - remember "i before e except after c"',
          xpValue: topic.xp_reward
        }
      ],
      'bm': [
        {
          id: 'bm_1',
          question: 'Apakah maksud perkataan "belajar"?',
          type: 'multiple_choice',
          options: ['to eat', 'to learn', 'to play', 'to sleep'],
          correctAnswer: 'to learn',
          explanation: '"Belajar" bermaksud "to learn" dalam bahasa Inggeris',
          xpValue: topic.xp_reward
        }
      ],
      'ict': [
        {
          id: 'ict_1',
          question: 'What does CPU stand for?',
          type: 'short_answer',
          correctAnswer: 'Central Processing Unit',
          explanation: 'CPU stands for Central Processing Unit - the main processor of a computer',
          xpValue: topic.xp_reward
        }
      ]
    };

    return questionTemplates[subject] || [
      {
        id: 'default_1',
        question: `This is a sample question for ${topic.name}. What is 1 + 1?`,
        type: 'multiple_choice',
        options: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: 'Basic addition: 1 + 1 = 2',
        xpValue: topic.xp_reward
      }
    ];
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion || !user || !subjectData) return;
    
    setCurrentAnswer(answer);
    const correct = checkAnswer(answer, currentQuestion.correctAnswer);
    setIsCorrect(correct);
    
    const xp = correct ? currentQuestion.xpValue : 0;
    setXpEarned(xp);
    
    if (correct && xp > 0) {
      await updateXP(xp);
      await logXPActivity({
        subject: subjectData.subject,
        question: currentQuestion.question,
        answer: answer,
        correct: true,
        xpAwarded: xp,
        timestamp: new Date()
      });
    }
    
    setShowFeedback(true);
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const handleNextQuestion = () => {
    if (!subjectData) return;
    
    setShowFeedback(false);
    setCurrentAnswer('');
    setQuestionIndex(prev => prev + 1);
    generateQuestion(subjectData);
  };

  const handleBackToLauncher = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/study';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-lg font-medium text-gray-700">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (!subjectData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-700">Subject not found</div>
          <button 
            onClick={handleBackToLauncher}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Study Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToLauncher}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Study Mode
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{subjectData.subject}</h1>
            <p className="text-gray-600">Question {questionIndex + 1}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {studentData && (
              <XPBadge 
                currentXP={studentData.totalXP} 
                gainedXP={showFeedback && isCorrect ? xpEarned : 0}
                animate={showFeedback && isCorrect}
                size="medium"
              />
            )}
          </div>
        </div>

        {/* Question Content */}
        {!showFeedback ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAnswerSubmit((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    handleAnswerSubmit(input.value);
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Feedback */
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl text-center ${
              isCorrect 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-red-100 border border-red-200'
            }`}>
              <div className="text-4xl mb-2">
                {isCorrect ? '🎉' : '😔'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </h3>
              <p className="text-gray-700">
                {isCorrect 
                  ? `Great job! You earned ${xpEarned} XP!` 
                  : `The correct answer is: ${currentQuestion.correctAnswer}`
                }
              </p>
            </div>

            {currentQuestion.explanation && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                <p className="text-blue-700">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Next Question →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectStudyPage;