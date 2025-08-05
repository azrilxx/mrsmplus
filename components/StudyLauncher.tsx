import React, { useState, useEffect } from 'react';

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

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: ContentTopic[];
}

interface StudyLauncherProps {
  onLaunchStudy: (subject: string) => void;
}

export const StudyLauncher: React.FC<StudyLauncherProps> = ({ onLaunchStudy }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const subjectConfigs = [
    { id: 'math', fileName: 'math.json', name: 'Mathematics', icon: '📐', color: 'from-blue-500 to-purple-600' },
    { id: 'science', fileName: 'science.json', name: 'Science', icon: '🔬', color: 'from-green-500 to-teal-600' },
    { id: 'english', fileName: 'english.json', name: 'English', icon: '📚', color: 'from-red-500 to-pink-600' },
    { id: 'bm', fileName: 'bm.json', name: 'Bahasa Malaysia', icon: '🇲🇾', color: 'from-indigo-500 to-purple-600' },
    { id: 'ict', fileName: 'ict.json', name: 'ICT', icon: '💻', color: 'from-orange-500 to-yellow-600' }
  ];

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const loadedSubjects: Subject[] = [];
      
      for (const config of subjectConfigs) {
        try {
          const response = await fetch(`/content/${config.fileName}`);
          if (response.ok) {
            const contentData: ContentSubject = await response.json();
            loadedSubjects.push({
              id: config.id,
              name: config.name,
              icon: config.icon,
              color: config.color,
              topics: contentData.topics
            });
          }
        } catch (error) {
          console.error(`Failed to load ${config.fileName}:`, error);
        }
      }
      
      setSubjects(loadedSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchStudy = (subject: Subject) => {
    onLaunchStudy(subject.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-lg font-medium text-gray-700">Loading subjects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Study Mode
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a subject to start your learning journey. Answer questions to earn XP!
          </p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              💡 Study tip: Get questions right to earn XP and level up your knowledge!
            </p>
          </div>
        </div>

        {/* Subject Selection */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Choose your subject
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleLaunchStudy(subject)}
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
                  <div className="mt-3 text-xs opacity-75">
                    Total XP: {subject.topics.reduce((sum, topic) => sum + topic.xp_reward, 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyLauncher;