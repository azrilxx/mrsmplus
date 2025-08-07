import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';
import {
  getTeacherClasses,
  getStudentsInClass,
  getStudentProgressBatch,
  getTeacherUploads,
  FirebaseUser,
  StudentProgress,
  ClassData,
  UploadData
} from '../firebase/queries';
import {
  getClassEngagementHeatmap,
  getTeacherAlerts,
  getTeacherFileUploads,
  ClassEngagementData,
  AlertData
} from '../firebase/teacherDashboard';
import HeatmapTable from '../components/HeatmapTable';
import { AlertsGroup } from '../components/AlertCard';

const TeacherDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<FirebaseUser[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [uploads, setUploads] = useState<UploadData[]>([]);
  const [engagementData, setEngagementData] = useState<ClassEngagementData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadTeacherData();
    }
  }, [user, loading]);

  const loadTeacherData = async () => {
    try {
      setDataLoading(true);
      
      // Get teacher's classes
      const teacherClasses = await getTeacherClasses(user.uid);
      setClasses(teacherClasses);
      
      if (teacherClasses.length > 0) {
        // Get all students from all classes
        const allStudentsPromises = teacherClasses.map(cls => getStudentsInClass(cls.classId));
        const allStudentsArrays = await Promise.all(allStudentsPromises);
        const allStudents = allStudentsArrays.flat();
        
        // Remove duplicates
        const uniqueStudents = allStudents.filter((student, index, self) => 
          index === self.findIndex(s => s.uid === student.uid)
        );
        setStudents(uniqueStudents);
        
        // Get student progress for all students
        const studentIds = uniqueStudents.map(s => s.studentId).filter(Boolean) as string[];
        const progressData = await getStudentProgressBatch(studentIds);
        setStudentProgress(progressData);
        
        // Get teacher uploads
        const teacherUploads = await getTeacherUploads(user.uid, 10);
        setUploads(teacherUploads);
        
        // Get engagement heatmap data
        const heatmapData = await getClassEngagementHeatmap(user.uid);
        setEngagementData(heatmapData);
        
        // Get teacher alerts
        const alertsData = await getTeacherAlerts(user.uid);
        setAlerts(alertsData);
      } else {
        // Fallback to mock data if no classes found
        setIsUsingMockData(true);
        setStudents([
          {
            uid: 'student-1',
            role: 'student',
            name: 'Ahmad Rahman',
            email: 'ahmad@student.mrsm.edu.my',
            studentId: 'student-1'
          },
          {
            uid: 'student-2', 
            role: 'student',
            name: 'Siti Aminah',
            email: 'siti@student.mrsm.edu.my',
            studentId: 'student-2'
          }
        ]);
        setStudentProgress([
          {
            studentId: 'student-1',
            currentXP: 2450,
            level: 12,
            xpToNextLevel: 550,
            totalXP: 2450,
            weeklyProgress: 320,
            lastActivity: new Date(),
            streakDays: 15,
            subjectProgress: {},
            reflectionLogs: []
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load teacher data:', error);
      setIsUsingMockData(true);
    } finally {
      setDataLoading(false);
    }
  };

  const UploadSection: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setSelectedFiles(e.dataTransfer.files);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(e.target.files);
      }
    };

    const handleUpload = async () => {
      if (!selectedFiles) return;

      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });
      formData.append('userId', user?.uid || '');
      formData.append('subject', 'General');
      formData.append('topic', 'Uploaded Content');

      try {
        const response = await fetch('/api/upload/bulk', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`Successfully processed ${result.processed} files with ${result.results.reduce((acc, r) => acc + r.questionsFound, 0)} total questions!`);
          setSelectedFiles(null);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload files. Please try again.');
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📤 Upload Content</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg font-medium text-gray-700 mb-2">
            {selectedFiles ? `${selectedFiles.length} file(s) selected` : 'Drop files here or click to browse'}
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOCX, PNG, JPG, TXT
          </div>
          
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Choose Files
          </label>
          
          {selectedFiles && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Selected files:</div>
              <div className="text-xs text-gray-500 space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Upload Files
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
          <div className="text-lg font-medium text-gray-700">Loading teacher dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">MARA+ Teacher Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.email}</span>
                </div>
                <ConnectionStatus compact />
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isUsingMockData && (
            <div className="mb-6">
              <ConnectionStatus position="header" />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadSection />
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Class Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Students</span>
                  <span className="font-semibold text-blue-600">{students.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Active This Week</span>
                  <span className="font-semibold text-green-600">
                    {studentProgress.filter(p => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return p.lastActivity && p.lastActivity > weekAgo;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Average XP</span>
                  <span className="font-semibold text-purple-600">
                    {studentProgress.length > 0 
                      ? Math.round(studentProgress.reduce((sum, p) => sum + p.currentXP, 0) / studentProgress.length)
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mt-6">
            <AlertsGroup 
              alerts={alerts}
              title="⚠️ Student Alerts"
              maxDisplay={5}
            />
          </div>

          {/* Class Engagement Heatmap */}
          <div className="mt-6">
            <HeatmapTable 
              engagementData={engagementData}
              teacherUid={user?.uid || ''}
              onCommentAdded={() => {
                // Refresh data after comment is added
                loadTeacherData();
              }}
            />
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📤</div>
                <div className="font-medium text-gray-800">Upload Content</div>
                <div className="text-sm text-gray-600">Add new study materials</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-gray-800">Engagement Heatmap</div>
                <div className="text-sm text-gray-600">Monitor class participation</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-800">Create Quiz</div>
                <div className="text-sm text-gray-600">Generate questions</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium text-gray-800">Student Alerts</div>
                <div className="text-sm text-gray-600">Monitor at-risk students</div>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Recent Uploads</h3>
            <div className="space-y-3">
              {uploads.length > 0 ? uploads.map((upload) => (
                <div key={upload.fileId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center">
                    <div className="text-xl mr-3">📄</div>
                    <div>
                      <div className="font-medium text-gray-800">{upload.fileName}</div>
                      <div className="text-sm text-gray-500">
                        {upload.subject} • {upload.uploadDate.toLocaleDateString()} • {upload.questionsFound} questions
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm ${upload.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {upload.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📁</div>
                  <div>No uploads yet</div>
                  <div className="text-sm">Upload some content to get started</div>
                </div>
              )}
            </div>
          </div>

          {students.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Student Leaderboard</h3>
              <div className="space-y-3">
                {students
                  .map(student => {
                    const progress = studentProgress.find(p => p.studentId === student.studentId);
                    return {
                      ...student,
                      currentXP: progress?.currentXP || 0,
                      level: progress?.level || 1,
                      lastActivity: progress?.lastActivity
                    };
                  })
                  .sort((a, b) => b.currentXP - a.currentXP)
                  .slice(0, 10)
                  .map((student, index) => (
                    <div key={student.uid} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Level {student.level} • {student.lastActivity ? student.lastActivity.toLocaleDateString() : 'No activity'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">{student.currentXP.toLocaleString()} XP</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;