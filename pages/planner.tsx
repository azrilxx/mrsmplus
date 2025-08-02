import React, { useState, useEffect } from 'react';
import PlannerStep from '../components/PlannerStep';
import SubjectCard, { MathIcon, ScienceIcon, EnglishIcon, HistoryIcon, BMIcon } from '../components/SubjectCard';
import XPBadge from '../components/XPBadge';

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  isCompleted: boolean;
  isLocked: boolean;
  dayOfWeek?: string;
  timeSlot?: string;
  description?: string;
}

interface WeeklyGoal {
  totalTasks: number;
  completedTasks: number;
  targetXP: number;
  currentXP: number;
}

const StudyPlannerPage: React.FC = () => {
  const [currentXP, setCurrentXP] = useState(150);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [formLevel, setFormLevel] = useState<number>(3);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [gainedXP, setGainedXP] = useState(0);

  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>({
    totalTasks: 20,
    completedTasks: 12,
    targetXP: 200,
    currentXP: 150
  });

  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([
    {
      id: '1',
      title: 'Quadratic Equations - Solving by Factoring',
      subject: 'Mathematics',
      difficulty: 'medium',
      estimatedTime: 45,
      isCompleted: false,
      isLocked: false,
      dayOfWeek: 'Monday',
      timeSlot: '4:00 PM',
      description: 'Learn to solve quadratic equations using factoring method with practice problems'
    },
    {
      id: '2',
      title: 'Photosynthesis Process',
      subject: 'Science',
      difficulty: 'easy',
      estimatedTime: 30,
      isCompleted: true,
      isLocked: false,
      dayOfWeek: 'Monday',
      timeSlot: '7:00 PM',
      description: 'Understanding how plants convert sunlight into energy'
    },
    {
      id: '3',
      title: 'Essay Writing - Introduction Paragraphs',
      subject: 'English',
      difficulty: 'medium',
      estimatedTime: 40,
      isCompleted: false,
      isLocked: false,
      dayOfWeek: 'Tuesday',
      timeSlot: '3:30 PM',
      description: 'Master the art of writing compelling introduction paragraphs'
    },
    {
      id: '4',
      title: 'Advanced Physics - Motion in 2D',
      subject: 'Physics',
      difficulty: 'hard',
      estimatedTime: 60,
      isCompleted: false,
      isLocked: formLevel < 4,
      dayOfWeek: 'Wednesday',
      timeSlot: '5:00 PM',
      description: 'Complex motion analysis in two dimensions'
    },
    {
      id: '5',
      title: 'Sejarah Malaysia - Era Kolonial',
      subject: 'History',
      difficulty: 'medium',
      estimatedTime: 35,
      isCompleted: false,
      isLocked: false,
      dayOfWeek: 'Thursday',
      timeSlot: '4:30 PM',
      description: 'Memahami tempoh penjajahan dan kesannya kepada Malaysia'
    }
  ]);

  const subjects = [
    { name: 'Mathematics', icon: <MathIcon />, progress: 75 },
    { name: 'Science', icon: <ScienceIcon />, progress: 82 },
    { name: 'English', icon: <EnglishIcon />, progress: 68 },
    { name: 'History', icon: <HistoryIcon />, progress: 55 }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleTaskComplete = (taskId: string) => {
    setStudyTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.isCompleted) {
        // Award XP for completion
        const xpGain = task.difficulty === 'easy' ? 15 : task.difficulty === 'medium' ? 25 : 40;
        setGainedXP(xpGain);
        setShowXPAnimation(true);
        setTimeout(() => {
          setCurrentXP(prev => prev + xpGain);
          setWeeklyGoal(prev => ({
            ...prev,
            completedTasks: prev.completedTasks + 1,
            currentXP: prev.currentXP + xpGain
          }));
        }, 500);

        return { ...task, isCompleted: true };
      }
      return task;
    }));
  };

  const handleTaskEdit = (taskId: string) => {
    // Implementation for editing tasks
    console.log('Edit task:', taskId);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Implementation for reordering tasks
    console.log('Dropped task:', draggedTask);
    setDraggedTask(null);
  };

  const filteredTasks = selectedSubject === 'all' 
    ? studyTasks 
    : studyTasks.filter(task => task.subject === selectedSubject);

  const groupedTasks = daysOfWeek.reduce((acc, day) => {
    acc[day] = filteredTasks.filter(task => task.dayOfWeek === day);
    return acc;
  }, {} as Record<string, StudyTask[]>);

  const progressPercentage = Math.round((weeklyGoal.completedTasks / weeklyGoal.totalTasks) * 100);
  const xpProgressPercentage = Math.round((weeklyGoal.currentXP / weeklyGoal.targetXP) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Study Planner</h1>
              <p className="text-gray-600 mt-1">Personalized learning pathway for Form {formLevel}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Form Level Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Form Level:</span>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>Form {level}</option>
                  ))}
                </select>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {weeklyGoal.completedTasks}/{weeklyGoal.totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">XP Progress</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {weeklyGoal.currentXP}/{weeklyGoal.targetXP} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SPM Countdown (Form 5 only) */}
          {formLevel === 5 && (
            <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">SPM Countdown</h3>
              <div className="text-3xl font-bold mb-2">287 Days</div>
              <p className="text-red-100">Stay focused! You're making great progress!</p>
            </div>
          )}
        </div>

        {/* Subject Filter */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter by Subject</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedSubject === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(subject => (
              <button
                key={subject.name}
                onClick={() => setSelectedSubject(subject.name)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedSubject === subject.name
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Weekly Schedule</h3>
          
          {daysOfWeek.map(day => (
            <div key={day} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{day}</h4>
                <span className="text-sm text-gray-500">
                  {groupedTasks[day]?.length || 0} tasks
                </span>
              </div>
              
              {groupedTasks[day]?.length > 0 ? (
                <div className="space-y-4">
                  {groupedTasks[day].map(task => (
                    <PlannerStep
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      subject={task.subject}
                      difficulty={task.difficulty}
                      estimatedTime={task.estimatedTime}
                      isCompleted={task.isCompleted}
                      isLocked={task.isLocked}
                      isDraggable={formLevel >= 4}
                      dayOfWeek={task.dayOfWeek}
                      timeSlot={task.timeSlot}
                      description={task.description}
                      onComplete={handleTaskComplete}
                      onEdit={handleTaskEdit}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks scheduled for {day}</p>
                  {formLevel >= 4 && (
                    <button className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      Add Task
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Auto-scheduling Note for Forms 1-2 */}
        {formLevel <= 2 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Auto-Scheduled Learning Path</h4>
                <p className="text-blue-700">
                  Your study schedule is automatically optimized based on your progress and learning needs. 
                  Focus on completing your tasks - we'll handle the planning for you!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlannerPage;