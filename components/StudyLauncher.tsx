import React, { useState, useEffect } from 'react';

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: Topic[];
}

interface StudyLauncherProps {
  onLaunchStudy: (subject: string, topic: string) => void;
}

export const StudyLauncher: React.FC<StudyLauncherProps> = ({ onLaunchStudy }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subjects: Subject[] = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: '📐',
      color: 'from-blue-500 to-purple-600',
      topics: [
        { id: 'algebra', name: 'Algebra', description: 'Solve equations and work with variables', difficulty: 'Beginner', estimatedTime: 15 },
        { id: 'geometry', name: 'Geometry', description: 'Shapes, angles, and spatial reasoning', difficulty: 'Intermediate', estimatedTime: 20 },
        { id: 'calculus', name: 'Calculus', description: 'Derivatives, integrals, and limits', difficulty: 'Advanced', estimatedTime: 25 }
      ]
    },
    {
      id: 'science',
      name: 'Science',
      icon: '🔬',
      color: 'from-green-500 to-teal-600',
      topics: [
        { id: 'biology', name: 'Biology', description: 'Living organisms and life processes', difficulty: 'Beginner', estimatedTime: 18 },
        { id: 'chemistry', name: 'Chemistry', description: 'Elements, compounds, and reactions', difficulty: 'Intermediate', estimatedTime: 22 },
        { id: 'physics', name: 'Physics', description: 'Matter, energy, and natural phenomena', difficulty: 'Advanced', estimatedTime: 25 }
      ]
    },
    {
      id: 'english',
      name: 'English',
      icon: '📚',
      color: 'from-red-500 to-pink-600',
      topics: [
        { id: 'grammar', name: 'Grammar', description: 'Sentence structure and language rules', difficulty: 'Beginner', estimatedTime: 12 },
        { id: 'literature', name: 'Literature', description: 'Analyze texts and literary devices', difficulty: 'Intermediate', estimatedTime: 20 },
        { id: 'writing', name: 'Writing', description: 'Essay composition and creative writing', difficulty: 'Advanced', estimatedTime: 30 }
      ]
    },
    {
      id: 'computer_science',
      name: 'Computer Science',
      icon: '💻',
      color: 'from-orange-500 to-yellow-600',
      topics: [
        { id: 'programming', name: 'Programming', description: 'Code logic and algorithms', difficulty: 'Beginner', estimatedTime: 25 },
        { id: 'data_structures', name: 'Data Structures', description: 'Arrays, lists, trees, and graphs', difficulty: 'Intermediate', estimatedTime: 20 },
        { id: 'algorithms', name: 'Algorithms', description: 'Problem-solving strategies', difficulty: 'Advanced', estimatedTime: 30 }
      ]
    },
    {
      id: 'bahasa_malaysia',
      name: 'Bahasa Malaysia',
      icon: '🇲🇾',
      color: 'from-indigo-500 to-purple-600',
      topics: [
        { id: 'tatabahasa', name: 'Tatabahasa', description: 'Grammar and sentence structure', difficulty: 'Beginner', estimatedTime: 15 },
        { id: 'karangan', name: 'Karangan', description: 'Essay writing and composition', difficulty: 'Intermediate', estimatedTime: 25 }
      ]
    }
  ];

  const handleLaunchStudy = () => {
    if (selectedSubject && selectedTopic) {
      setIsLoading(true);
      setTimeout(() => {
        onLaunchStudy(selectedSubject.id, selectedTopic.id);
        setIsLoading(false);
      }, 1000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Study Mode
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sharpen your skills with AI-powered questions tailored to your level. 
            Select a subject and topic to begin your focused study session.
          </p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              💡 Study tip: Answer questions to earn XP and build mastery in your chosen topics!
            </p>
          </div>
        </div>

        {!selectedSubject ? (
          /* Subject Selection */
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choose your subject
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  <div className={`
                    bg-gradient-to-br ${subject.color} 
                    rounded-2xl p-6 text-white shadow-lg hover:shadow-xl
                  `}>
                    <div className="text-4xl mb-3">{subject.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                    <p className="text-sm opacity-90">
                      {subject.topics.length} topics available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !selectedTopic ? (
          /* Topic Selection */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Choose a topic in {selectedSubject.name}
              </h2>
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                ← Back to subjects
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedSubject.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="cursor-pointer bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{topic.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center">
                      ⏱️ ~{topic.estimatedTime} min
                    </span>
                    <span className="text-blue-600 font-medium text-sm">Start studying →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Study Session Confirmation */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedSubject.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Ready to study {selectedTopic.name}?
                </h2>
                <p className="text-gray-600">{selectedTopic.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-blue-600 font-medium">Subject</div>
                  <div className="text-lg font-semibold text-blue-800">{selectedSubject.name}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-green-600 font-medium">Estimated Time</div>
                  <div className="text-lg font-semibold text-green-800">~{selectedTopic.estimatedTime} min</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">What to expect:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    AI-generated questions tailored to your level
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Instant feedback on your answers
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Earn XP for correct answers
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Get explanations when you need help
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                >
                  ← Choose different topic
                </button>
                <button
                  onClick={handleLaunchStudy}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting...
                    </span>
                  ) : (
                    'Start Study Session 🚀'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyLauncher;