import React, { useState } from 'react';

interface Stream {
  id: string;
  name: string;
  students: number;
  avgXP: number;
  completionRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  topSubjects: string[];
}

interface StreamComparisonProps {
  streams: Stream[];
}

export const StreamComparison: React.FC<StreamComparisonProps> = ({ streams }) => {
  const [selectedMetric, setSelectedMetric] = useState<'students' | 'xp' | 'completion' | 'risk'>('students');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'xp' | 'completion'>('students');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedStreams = [...streams].sort((a, b) => {
    let aValue: number | string, bValue: number | string;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'students':
        aValue = a.students;
        bValue = b.students;
        break;
      case 'xp':
        aValue = a.avgXP;
        bValue = b.avgXP;
        break;
      case 'completion':
        aValue = a.completionRate;
        bValue = b.completionRate;
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricValue = (stream: Stream, metric: string) => {
    switch (metric) {
      case 'students': return stream.students;
      case 'xp': return stream.avgXP;
      case 'completion': return stream.completionRate;
      case 'risk': return stream.riskLevel;
      default: return 0;
    }
  };

  const getMaxValue = (metric: string) => {
    switch (metric) {
      case 'students': return Math.max(...streams.map(s => s.students));
      case 'xp': return Math.max(...streams.map(s => s.avgXP));
      case 'completion': return 100;
      default: return 100;
    }
  };

  const getBarWidth = (stream: Stream, metric: string) => {
    if (metric === 'risk') return 0;
    const value = getMetricValue(stream, metric) as number;
    const max = getMaxValue(metric);
    return (value / max) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stream Performance Comparison</h2>
            <p className="text-gray-600">Compare academic performance across all MRSM programs</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Metric Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="students">Student Count</option>
                <option value="xp">Average XP</option>
                <option value="completion">Completion Rate</option>
                <option value="risk">Risk Assessment</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="students">Students</option>
                <option value="xp">Average XP</option>
                <option value="completion">Completion Rate</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStreams.map((stream) => (
          <div key={stream.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{stream.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(stream.riskLevel)}`}>
                  {stream.riskLevel} risk
                </span>
              </div>
              <p className="text-sm text-gray-600">{stream.students} students enrolled</p>
            </div>

            {/* Metrics */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Student Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Students</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getBarWidth(stream, 'students')}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {stream.students}
                    </span>
                  </div>
                </div>

                {/* Average XP */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Avg XP</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getBarWidth(stream, 'xp')}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {stream.avgXP}
                    </span>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Completion</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getBarWidth(stream, 'completion')}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {stream.completionRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Subjects */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Subjects</h4>
                <div className="flex flex-wrap gap-1">
                  {stream.topSubjects.map((subject, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View detailed analytics →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {streams.reduce((sum, stream) => sum + stream.students, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(streams.reduce((sum, stream) => sum + stream.avgXP, 0) / streams.length)}
            </div>
            <div className="text-sm text-gray-600">Avg XP per Program</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(streams.reduce((sum, stream) => sum + stream.completionRate, 0) / streams.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {streams.filter(stream => stream.riskLevel === 'low').length}/{streams.length}
            </div>
            <div className="text-sm text-gray-600">Low Risk Programs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamComparison;