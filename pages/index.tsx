import React, { useState, useEffect } from 'react';
import QuestionInput from '../components/QuestionInput';
import AnswerCard from '../components/AnswerCard';
import XPBadge from '../components/XPBadge';
import SubjectCard, { MathIcon, ScienceIcon, EnglishIcon, HistoryIcon, BMIcon } from '../components/SubjectCard';

interface Question {
  id: string;
  text: string;
  subject?: string;
  timestamp: Date;
}

interface Answer {
  question: string;
  answer: string;
  subject: string;
  xpEarned: number;
  relatedTopics: string[];
}

const HomePage: React.FC = () => {
  const [currentXP, setCurrentXP] = useState(150);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [gainedXP, setGainedXP] = useState(0);

  const subjects = [
    { name: 'Mathematics', icon: <MathIcon />, progress: 75 },
    { name: 'Science', icon: <ScienceIcon />, progress: 82 },
    { name: 'English', icon: <EnglishIcon />, progress: 68 },
    { name: 'Bahasa Malaysia', icon: <BMIcon />, progress: 90 },
    { name: 'History', icon: <HistoryIcon />, progress: 55 }
  ];

  const greetings = [
    "Selamat pagi, ready to learn?",
    "Good afternoon, keep going!",
    "Selamat petang, mari belajar!",
    "Malam yang baik untuk study!"
  ];

  const [currentGreeting, setCurrentGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    let greetingIndex = 0;
    if (hour >= 6 && hour < 12) greetingIndex = 0; // Morning
    else if (hour >= 12 && hour < 17) greetingIndex = 1; // Afternoon
    else if (hour >= 17 && hour < 20) greetingIndex = 2; // Evening
    else greetingIndex = 3; // Night

    setCurrentGreeting(greetings[greetingIndex]);

    // Load recent questions from localStorage
    const savedQuestions = localStorage.getItem('recentQuestions');
    if (savedQuestions) {
      setRecentQuestions(JSON.parse(savedQuestions));
    }

    // Load XP from localStorage
    const savedXP = localStorage.getItem('currentXP');
    if (savedXP) {
      setCurrentXP(parseInt(savedXP));
    }
  }, []);

  const handleQuestionSubmit = async (question: string, subject?: string) => {
    setIsLoading(true);
    setCurrentAnswer(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnswer: Answer = {
        question,
        answer: `This is a comprehensive answer to your question about "${question}". 

Let me break this down step by step:

1. First, we need to understand the basic concept...
2. Then, we apply the fundamental principles...
3. Finally, we can solve this systematically...

The key insight here is that this topic connects to several other important concepts in ${subject || 'your studies'}.`,
        subject: subject || 'General',
        xpEarned: 10,
        relatedTopics: ['Related Topic 1', 'Related Topic 2', 'Related Topic 3']
      };

      setCurrentAnswer(mockAnswer);
      
      // Add XP with animation
      const newXP = currentXP + mockAnswer.xpEarned;
      setGainedXP(mockAnswer.xpEarned);
      setShowXPAnimation(true);
      setTimeout(() => {
        setCurrentXP(newXP);
        localStorage.setItem('currentXP', newXP.toString());
      }, 500);

      // Add to recent questions
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: question,
        subject: subject,
        timestamp: new Date()
      };

      const updatedQuestions = [newQuestion, ...recentQuestions.slice(0, 2)];
      setRecentQuestions(updatedQuestions);
      localStorage.setItem('recentQuestions', JSON.stringify(updatedQuestions));

    } catch (error) {
      console.error('Error getting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentAnswer) {
      handleQuestionSubmit(currentAnswer.question);
    }
  };

  const handleAddToStudyPlan = () => {
    // Implement study plan integration
    alert('Added to study plan! 📚');
  };

  const handleRecentQuestionClick = (question: Question) => {
    handleQuestionSubmit(question.text, question.subject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MARA+</h1>
              <p className="text-gray-600 mt-1">{currentGreeting}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Streak Counter */}
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-sm text-orange-800 font-medium">{dailyStreak} Day Streak</p>
                  <p className="text-xs text-orange-600">Keep it up!</p>
                </div>
              </div>

              {/* XP Badge */}
              <XPBadge
                currentXP={currentXP}
                gainedXP={gainedXP}
                animate={showXPAnimation}
                size="large"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Question Input Section */}
        {!currentAnswer && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                What would you like to learn today?
              </h2>
              <p className="text-gray-600 text-lg">
                Ask any question about your studies and get personalized explanations
              </p>
            </div>

            <QuestionInput
              onSubmit={handleQuestionSubmit}
              isLoading={isLoading}
              autoDetectSubject={true}
            />

            {/* Subject Quick Select */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Quick Subject Selection
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.name}
                    subject={subject.name}
                    icon={subject.icon}
                    progress={subject.progress}
                    isSelected={selectedSubject === subject.name}
                    hasWeakness={subject.progress < 70}
                    isMastered={subject.progress >= 90}
                    onClick={() => setSelectedSubject(
                      selectedSubject === subject.name ? '' : subject.name
                    )}
                    size="medium"
                    showProgress={true}
                  />
                ))}
              </div>
            </div>

            {/* Recent Questions */}
            {recentQuestions.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Recent Questions
                </h3>
                <div className="space-y-3">
                  {recentQuestions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => handleRecentQuestionClick(question)}
                      className="p-4 bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg hover:scale-102 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-800 font-medium flex-1">{question.text}</p>
                        <div className="flex items-center gap-3 ml-4">
                          {question.subject && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {question.subject}
                            </span>
                          )}
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Getting your answer...</p>
            <p className="text-sm text-gray-500 mt-2">This usually takes a few seconds</p>
          </div>
        )}

        {/* Answer Display */}
        {currentAnswer && !isLoading && (
          <div className="space-y-6">
            <AnswerCard
              question={currentAnswer.question}
              answer={currentAnswer.answer}
              subject={currentAnswer.subject}
              xpEarned={currentAnswer.xpEarned}
              relatedTopics={currentAnswer.relatedTopics}
              onRetry={handleRetry}
              onAddToStudyPlan={handleAddToStudyPlan}
              showTypewriter={true}
            />

            {/* Ask Another Question */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  setCurrentAnswer(null);
                  setShowXPAnimation(false);
                  setGainedXP(0);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
              >
                Ask Another Question
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Offline Support Message */}
      <div className="fixed bottom-4 right-4 z-50">
        {!navigator.onLine && (
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Offline Mode - Some features may be limited</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;