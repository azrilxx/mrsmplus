import React, { useState } from 'react';
import { ClassEngagementData, addStudentComment } from '../firebase/teacherDashboard';

interface HeatmapTableProps {
  engagementData: ClassEngagementData[];
  teacherUid: string;
  onCommentAdded?: () => void;
}

const HeatmapTable: React.FC<HeatmapTableProps> = ({ 
  engagementData, 
  teacherUid,
  onCommentAdded 
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const getXpColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
    }
  };

  const getStreakColor = (status: 'none' | 'short' | 'long') => {
    switch (status) {
      case 'long': return 'bg-green-100 text-green-800';
      case 'short': return 'bg-blue-100 text-blue-800';
      case 'none': return 'bg-gray-100 text-gray-800';
    }
  };

  const getReflectionColor = (status: 'missing' | 'recent' | 'regular') => {
    switch (status) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'recent': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
    }
  };

  const getStreakIcon = (status: 'none' | 'short' | 'long') => {
    switch (status) {
      case 'long': return '🔥';
      case 'short': return '⚡';
      case 'none': return '❄️';
    }
  };

  const getReflectionIcon = (status: 'missing' | 'recent' | 'regular') => {
    switch (status) {
      case 'regular': return '📝';
      case 'recent': return '✏️';
      case 'missing': return '❌';
    }
  };

  const handleAddComment = async (studentId: string) => {
    if (!commentText.trim()) return;
    
    setIsAddingComment(true);
    try {
      const success = await addStudentComment(teacherUid, studentId, commentText, false);
      if (success) {
        setCommentText('');
        setSelectedStudent(null);
        onCommentAdded?.();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatLastActivity = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (engagementData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Class Engagement Heatmap</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👥</div>
          <div>No student data available</div>
          <div className="text-sm">Students will appear here once they start using the platform</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Class Engagement Heatmap</h3>
        <div className="text-sm text-gray-600">
          {engagementData.length} student{engagementData.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Legend:</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">XP Level:</span>
            <div className="flex gap-1 mt-1">
              <span className="px-2 py-1 rounded bg-red-100 text-red-800">Low (&lt;200)</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Medium (200-500)</span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-800">High (&gt;500)</span>
            </div>
          </div>
          <div>
            <span className="font-medium">Streak:</span>
            <div className="flex gap-1 mt-1">
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">❄️ None</span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">⚡ Short (1-7)</span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-800">🔥 Long (7+)</span>
            </div>
          </div>
          <div>
            <span className="font-medium">Reflections:</span>
            <div className="flex gap-1 mt-1">
              <span className="px-2 py-1 rounded bg-red-100 text-red-800">❌ Missing</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">✏️ Recent</span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-800">📝 Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-medium text-gray-700">Student</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">XP</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Level</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Streak</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Reflections</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Last Activity</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {engagementData.map((data, index) => (
              <React.Fragment key={data.student.uid}>
                <tr className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{data.student.name}</div>
                      <div className="text-xs text-gray-500">{data.student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getXpColor(data.xpLevel)}`}>
                    {data.progress.weeklyProgress}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="font-semibold text-purple-600">
                    {data.progress.level}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStreakColor(data.streakStatus)}`}>
                    {getStreakIcon(data.streakStatus)} {data.progress.streakDays}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReflectionColor(data.reflectionStatus)}`}>
                    {getReflectionIcon(data.reflectionStatus)}
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-sm text-gray-600">
                  {formatLastActivity(data.lastActivity)}
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => setSelectedStudent(selectedStudent === data.student.uid ? null : data.student.uid)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    💬
                  </button>
                </td>
              </tr>
              {selectedStudent === data.student.uid && (
                <tr>
                  <td colSpan={7} className="py-3 px-2 bg-blue-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add comment for ${data.student.name}...`}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAddingComment}
                      />
                      <button
                        onClick={() => handleAddComment(data.student.studentId || data.student.uid)}
                        disabled={!commentText.trim() || isAddingComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingComment ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          setCommentText('');
                        }}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {engagementData.filter(d => d.xpLevel === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Performers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {engagementData.filter(d => d.streakStatus === 'long').length}
          </div>
          <div className="text-sm text-gray-600">Long Streaks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {engagementData.filter(d => d.reflectionStatus === 'regular').length}
          </div>
          <div className="text-sm text-gray-600">Regular Reflectors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {engagementData.filter(d => d.xpLevel === 'low' || d.reflectionStatus === 'missing').length}
          </div>
          <div className="text-sm text-gray-600">Need Attention</div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTable;