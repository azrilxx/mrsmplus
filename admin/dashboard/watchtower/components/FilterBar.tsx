import React, { useState } from 'react';

interface Stream {
  id: string;
  name: string;
  students: number;
  avgXP: number;
  completionRate: number;
  riskLevel: string;
  topSubjects: string[];
}

interface DashboardFilters {
  program: string[];
  dateRange: string;
  subject: string[];
  riskLevel: string[];
  engagementLevel: string[];
}

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  streams: Stream[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, streams }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Bahasa Malaysia', 'Islamic Studies', 'Arabic', 'Computer Science',
    'Engineering', 'Technical Drawing', 'History', 'Geography'
  ];

  const dateRanges = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: 'all', label: 'All time' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600' },
    { value: 'high', label: 'High Risk', color: 'text-red-600' }
  ];

  const engagementLevels = [
    { value: 'very-high', label: 'Very High (80%+)' },
    { value: 'high', label: 'High (60-79%)' },
    { value: 'medium', label: 'Medium (40-59%)' },
    { value: 'low', label: 'Low (20-39%)' },
    { value: 'very-low', label: 'Very Low (<20%)' }
  ];

  const handleProgramToggle = (programId: string) => {
    const newPrograms = filters.program.includes(programId)
      ? filters.program.filter(id => id !== programId)
      : [...filters.program, programId];
    onFilterChange({ program: newPrograms });
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = filters.subject.includes(subject)
      ? filters.subject.filter(s => s !== subject)
      : [...filters.subject, subject];
    onFilterChange({ subject: newSubjects });
  };

  const handleRiskLevelToggle = (level: string) => {
    const newLevels = filters.riskLevel.includes(level)
      ? filters.riskLevel.filter(l => l !== level)
      : [...filters.riskLevel, level];
    onFilterChange({ riskLevel: newLevels });
  };

  const handleEngagementToggle = (level: string) => {
    const newLevels = filters.engagementLevel.includes(level)
      ? filters.engagementLevel.filter(l => l !== level)
      : [...filters.engagementLevel, level];
    onFilterChange({ engagementLevel: newLevels });
  };

  const clearAllFilters = () => {
    onFilterChange({
      program: [],
      dateRange: '7d',
      subject: [],
      riskLevel: [],
      engagementLevel: []
    });
  };

  const getActiveFilterCount = () => {
    return filters.program.length + 
           filters.subject.length + 
           filters.riskLevel.length + 
           filters.engagementLevel.length +
           (filters.dateRange !== '7d' ? 1 : 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Filters - Always Visible */}
        <div className="flex flex-wrap items-center justify-between py-4 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ dateRange: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Programs Quick Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Programs:</label>
              <div className="flex flex-wrap gap-1">
                {streams.slice(0, 3).map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => handleProgramToggle(stream.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.program.includes(stream.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stream.name.replace('Program ', '')}
                  </button>
                ))}
                {streams.length > 3 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    +{streams.length - 3} more
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            {/* Active Filter Count */}
            {activeFilterCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className={`w-4 h-4 mr-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? 'Fewer filters' : 'More filters'}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="border-t border-gray-200 py-4 space-y-4">
            {/* All Programs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Programs</label>
              <div className="flex flex-wrap gap-2">
                {streams.map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => handleProgramToggle(stream.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.program.includes(stream.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stream.name}
                    {filters.program.includes(stream.id) && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.subject.includes(subject)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                    {filters.subject.includes(subject) && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <div className="flex flex-wrap gap-2">
                {riskLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => handleRiskLevelToggle(level.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.riskLevel.includes(level.value)
                        ? `bg-red-600 text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className={filters.riskLevel.includes(level.value) ? 'text-white' : level.color}>
                      {level.label}
                    </span>
                    {filters.riskLevel.includes(level.value) && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Level</label>
              <div className="flex flex-wrap gap-2">
                {engagementLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => handleEngagementToggle(level.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.engagementLevel.includes(level.value)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.label}
                    {filters.engagementLevel.includes(level.value) && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;