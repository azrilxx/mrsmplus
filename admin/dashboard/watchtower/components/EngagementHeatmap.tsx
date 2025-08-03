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

interface EngagementHeatmapProps {
  data: Stream[];
  detailed?: boolean;
}

interface HeatmapData {
  program: string;
  subject: string;
  hour: number;
  day: number;
  engagement: number;
  students: number;
}

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ data, detailed = false }) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'hourly' | 'daily' | 'weekly'>('hourly');

  // Generate mock heatmap data
  const generateHeatmapData = (): HeatmapData[] => {
    const programs = data.map(d => d.id);
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
    const heatmapData: HeatmapData[] = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour < 22; hour++) {
        programs.forEach(program => {
          subjects.forEach(subject => {
            // Generate realistic engagement patterns
            let baseEngagement = 0.3;
            
            // Higher engagement during school hours (8-15)
            if (hour >= 8 && hour <= 15) {
              baseEngagement = 0.8;
            }
            // Moderate engagement in evening (16-20)
            else if (hour >= 16 && hour <= 20) {
              baseEngagement = 0.6;
            }
            
            // Lower engagement on weekends
            if (day === 0 || day === 6) {
              baseEngagement *= 0.7;
            }
            
            // Add some randomness
            const engagement = Math.min(1, baseEngagement + (Math.random() - 0.5) * 0.4);
            const students = Math.floor(engagement * 50);

            heatmapData.push({
              program,
              subject,
              hour,
              day,
              engagement,
              students
            });
          });
        });
      }
    }

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();
  
  const filteredData = selectedProgram === 'all' 
    ? heatmapData 
    : heatmapData.filter(d => d.program === selectedProgram);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEngagementForCell = (day: number, hour: number): number => {
    const cellData = filteredData.filter(d => d.day === day && d.hour === hour);
    if (cellData.length === 0) return 0;
    return cellData.reduce((sum, d) => sum + d.engagement, 0) / cellData.length;
  };

  const getStudentCountForCell = (day: number, hour: number): number => {
    const cellData = filteredData.filter(d => d.day === day && d.hour === hour);
    return cellData.reduce((sum, d) => sum + d.students, 0);
  };

  const getEngagementColor = (engagement: number): string => {
    if (engagement >= 0.8) return 'bg-green-600';
    if (engagement >= 0.6) return 'bg-green-400';
    if (engagement >= 0.4) return 'bg-yellow-400';
    if (engagement >= 0.2) return 'bg-orange-400';
    if (engagement > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  const getEngagementLevel = (engagement: number): string => {
    if (engagement >= 0.8) return 'Very High';
    if (engagement >= 0.6) return 'High';
    if (engagement >= 0.4) return 'Medium';
    if (engagement >= 0.2) return 'Low';
    return 'Very Low';
  };

  // Calculate peak hours and insights
  const hourlyAverages = hours.map(hour => {
    const hourData = filteredData.filter(d => d.hour === hour);
    const avgEngagement = hourData.length > 0 
      ? hourData.reduce((sum, d) => sum + d.engagement, 0) / hourData.length 
      : 0;
    return { hour, engagement: avgEngagement };
  });

  const peakHour = hourlyAverages.reduce((max, current) => 
    current.engagement > max.engagement ? current : max
  );

  const dailyAverages = days.map((dayName, day) => {
    const dayData = filteredData.filter(d => d.day === day);
    const avgEngagement = dayData.length > 0 
      ? dayData.reduce((sum, d) => sum + d.engagement, 0) / dayData.length 
      : 0;
    return { day: dayName, engagement: avgEngagement };
  });

  const peakDay = dailyAverages.reduce((max, current) => 
    current.engagement > max.engagement ? current : max
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {detailed ? 'Detailed Engagement Analysis' : 'Student Engagement Heatmap'}
          </h3>
          <p className="text-gray-600">Real-time student activity patterns across programs</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Program Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Program:</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Programs</option>
              {data.map(stream => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>

          {detailed && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Time header */}
            <div className="flex">
              <div className="w-12"></div> {/* Empty corner */}
              {hours.map(hour => (
                <div key={hour} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Heatmap rows */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex">
                <div className="w-12 h-8 flex items-center justify-start text-xs font-medium text-gray-600">
                  {day}
                </div>
                {hours.map(hour => {
                  const engagement = getEngagementForCell(dayIndex, hour);
                  const studentCount = getStudentCountForCell(dayIndex, hour);
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`w-8 h-8 ${getEngagementColor(engagement)} border border-white relative group cursor-pointer transition-all hover:scale-110`}
                      title={`${day} ${hour}:00 - ${getEngagementLevel(engagement)} (${studentCount} students)`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {day} {hour}:00<br/>
                        {getEngagementLevel(engagement)}<br/>
                        {studentCount} students
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
          <span className="text-gray-600">Low</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-gray-200 border border-white"></div>
            <div className="w-4 h-4 bg-red-400 border border-white"></div>
            <div className="w-4 h-4 bg-orange-400 border border-white"></div>
            <div className="w-4 h-4 bg-yellow-400 border border-white"></div>
            <div className="w-4 h-4 bg-green-400 border border-white"></div>
            <div className="w-4 h-4 bg-green-600 border border-white"></div>
          </div>
          <span className="text-gray-600">High</span>
        </div>
      </div>

      {detailed && (
        <>
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⏰</div>
                <div>
                  <div className="text-lg font-semibold text-blue-800">
                    {peakHour.hour}:00
                  </div>
                  <div className="text-sm text-blue-600">Peak Hour</div>
                  <div className="text-xs text-blue-500">
                    {Math.round(peakHour.engagement * 100)}% engagement
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📅</div>
                <div>
                  <div className="text-lg font-semibold text-green-800">
                    {peakDay.day}
                  </div>
                  <div className="text-sm text-green-600">Peak Day</div>
                  <div className="text-xs text-green-500">
                    {Math.round(peakDay.engagement * 100)}% engagement
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📈</div>
                <div>
                  <div className="text-lg font-semibold text-purple-800">
                    {Math.round(filteredData.reduce((sum, d) => sum + d.engagement, 0) / filteredData.length * 100)}%
                  </div>
                  <div className="text-sm text-purple-600">Avg Engagement</div>
                  <div className="text-xs text-purple-500">
                    Across all timeframes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Breakdown Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Hourly Engagement Trends</h4>
            <div className="flex items-end space-x-1 h-24">
              {hourlyAverages.map(({ hour, engagement }) => (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 w-full rounded-t transition-all"
                    style={{ height: `${engagement * 100}%` }}
                    title={`${hour}:00 - ${Math.round(engagement * 100)}%`}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">{hour}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!detailed && (
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View detailed engagement analysis →
          </button>
        </div>
      )}
    </div>
  );
};

export default EngagementHeatmap;