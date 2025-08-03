import React, { useState } from 'react';

interface XPProgressTrackerProps {
  data: {
    totalXP: number;
    avgSessionTime: number;
    completionRate: number;
  } | undefined;
}

interface StudentXPData {
  id: string;
  name: string;
  program: string;
  currentXP: number;
  weeklyXP: number;
  monthlyXP: number;
  level: number;
  nextLevelXP: number;
  rank: number;
  achievements: string[];
  recentActivity: {
    subject: string;
    xpGained: number;
    timestamp: string;
  }[];
}

export const XPProgressTracker: React.FC<XPProgressTrackerProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'leaderboard' | 'trends'>('overview');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  // Mock student XP data
  const mockStudentData: StudentXPData[] = [
    {
      id: 'student_1',
      name: 'Ahmad Zikri',
      program: 'Premier',
      currentXP: 2850,
      weeklyXP: 420,
      monthlyXP: 1650,
      level: 15,
      nextLevelXP: 3000,
      rank: 1,
      achievements: ['Top Performer', 'Mathematics Master', 'Consistency King'],
      recentActivity: [
        { subject: 'Mathematics', xpGained: 85, timestamp: '2 hours ago' },
        { subject: 'Physics', xpGained: 92, timestamp: '5 hours ago' },
        { subject: 'Chemistry', xpGained: 78, timestamp: '1 day ago' }
      ]
    },
    {
      id: 'student_2',
      name: 'Nurul Aisyah',
      program: 'IGCSE',
      currentXP: 2720,
      weeklyXP: 380,
      monthlyXP: 1580,
      level: 14,
      nextLevelXP: 2800,
      rank: 2,
      achievements: ['Science Prodigy', 'English Excellence', 'Rising Star'],
      recentActivity: [
        { subject: 'Biology', xpGained: 95, timestamp: '1 hour ago' },
        { subject: 'English', xpGained: 88, timestamp: '4 hours ago' },
        { subject: 'Chemistry', xpGained: 82, timestamp: '6 hours ago' }
      ]
    },
    {
      id: 'student_3',
      name: 'Muhammad Syafiq',
      program: 'Ulul Albab',
      currentXP: 2650,
      weeklyXP: 350,
      monthlyXP: 1520,
      level: 14,
      nextLevelXP: 2800,
      rank: 3,
      achievements: ['Islamic Studies Expert', 'Arabic Scholar', 'Dedicated Learner'],
      recentActivity: [
        { subject: 'Islamic Studies', xpGained: 90, timestamp: '3 hours ago' },
        { subject: 'Arabic', xpGained: 85, timestamp: '7 hours ago' },
        { subject: 'Mathematics', xpGained: 75, timestamp: '1 day ago' }
      ]
    }
  ];

  const programs = ['Premier', 'IGCSE', 'Ulul Albab', 'Bitara', 'Teknikal'];

  const filteredStudents = selectedProgram === 'all' 
    ? mockStudentData 
    : mockStudentData.filter(student => student.program === selectedProgram);

  const getLevelProgress = (currentXP: number, nextLevelXP: number, level: number): number => {
    const currentLevelXP = (level - 1) * 200; // Assuming 200 XP per level
    return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  const getXPTrend = (weeklyXP: number): 'up' | 'down' | 'stable' => {
    // Mock trend calculation
    if (weeklyXP > 350) return 'up';
    if (weeklyXP < 250) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return { icon: '📈', color: 'text-green-600' };
      case 'down': return { icon: '📉', color: 'text-red-600' };
      default: return { icon: '➡️', color: 'text-gray-600' };
    }
  };

  const totalXPThisWeek = filteredStudents.reduce((sum, student) => sum + student.weeklyXP, 0);
  const avgXPPerStudent = filteredStudents.length > 0 ? totalXPThisWeek / filteredStudents.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">XP Progress Tracking</h2>
            <p className="text-gray-600">Monitor student learning progress and achievements</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="leaderboard">Leaderboard</option>
                <option value="trends">Trends</option>
              </select>
            </div>

            {/* Timeframe */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Program Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Program:</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">⭐</div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {totalXPThisWeek.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total XP This Week</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📊</div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(avgXPPerStudent)}
                  </div>
                  <div className="text-sm text-gray-600">Avg XP per Student</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🏆</div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredStudents.filter(s => getXPTrend(s.weeklyXP) === 'up').length}
                  </div>
                  <div className="text-sm text-gray-600">Students Improving</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🎯</div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.round(filteredStudents.reduce((sum, s) => sum + getLevelProgress(s.currentXP, s.nextLevelXP, s.level), 0) / filteredStudents.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Level Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.slice(0, 6).map((student) => {
              const progress = getLevelProgress(student.currentXP, student.nextLevelXP, student.level);
              const trend = getXPTrend(student.weeklyXP);
              const trendStyle = getTrendIcon(trend);
              
              return (
                <div key={student.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.program} • Rank #{student.rank}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">L{student.level}</div>
                        <div className={`text-sm ${trendStyle.color} flex items-center`}>
                          <span className="mr-1">{trendStyle.icon}</span>
                          {student.weeklyXP} XP
                        </div>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Level Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{student.currentXP} XP</span>
                        <span>{student.nextLevelXP} XP</span>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Achievements</h4>
                      <div className="flex flex-wrap gap-1">
                        {student.achievements.slice(0, 2).map((achievement, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            🏆 {achievement}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        {student.recentActivity.slice(0, 2).map((activity, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{activity.subject}</span>
                            <div className="flex items-center">
                              <span className="text-green-600 font-medium">+{activity.xpGained} XP</span>
                              <span className="text-gray-400 ml-2">{activity.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View detailed progress →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewMode === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Leaderboard</h3>
          <div className="space-y-4">
            {filteredStudents
              .sort((a, b) => b.currentXP - a.currentXP)
              .slice(0, 10)
              .map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.program}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{student.currentXP.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Level {student.level}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {viewMode === 'trends' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Trends Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly XP Chart */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Weekly XP Distribution</h4>
              <div className="space-y-3">
                {programs.map(program => {
                  const programStudents = mockStudentData.filter(s => s.program === program);
                  const totalWeeklyXP = programStudents.reduce((sum, s) => sum + s.weeklyXP, 0);
                  const maxXP = Math.max(...programs.map(p => 
                    mockStudentData.filter(s => s.program === p).reduce((sum, s) => sum + s.weeklyXP, 0)
                  ));
                  
                  return (
                    <div key={program} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600">{program}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${(totalWeeklyXP / maxXP) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-sm font-medium text-gray-900 text-right">
                        {totalWeeklyXP}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Insights */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Performance Insights</h4>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📈</div>
                    <div>
                      <div className="font-semibold text-green-800">Trending Up</div>
                      <div className="text-sm text-green-600">
                        {filteredStudents.filter(s => getXPTrend(s.weeklyXP) === 'up').length} students showing improvement
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🎯</div>
                    <div>
                      <div className="font-semibold text-blue-800">Average Progress</div>
                      <div className="text-sm text-blue-600">
                        {Math.round(avgXPPerStudent)} XP per student this week
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🏆</div>
                    <div>
                      <div className="font-semibold text-purple-800">Top Achiever</div>
                      <div className="text-sm text-purple-600">
                        {filteredStudents[0]?.name} leads with {filteredStudents[0]?.currentXP} XP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPProgressTracker;