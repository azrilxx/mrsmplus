import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseWithFallback } from '../hooks/useFirebaseWithFallback';
import { DashboardData } from '../types/dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ConnectionStatus } from '../components/dashboard/ConnectionStatus';

const TeacherDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { getDashboardData, isUsingMockData } = useFirebaseWithFallback();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const data = await getDashboardData('teacher');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
                  <span className="font-semibold text-blue-600">45</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Active This Week</span>
                  <span className="font-semibold text-green-600">38</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Average Progress</span>
                  <span className="font-semibold text-purple-600">72%</span>
                </div>
              </div>
            </div>
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
                <div className="font-medium text-gray-800">Manage Students</div>
                <div className="text-sm text-gray-600">View student progress</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-800">Create Quiz</div>
                <div className="text-sm text-gray-600">Generate questions</div>
              </button>
              
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium text-gray-800">Analytics</div>
                <div className="text-sm text-gray-600">Class performance data</div>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Recent Uploads</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <div className="text-xl mr-3">📄</div>
                  <div>
                    <div className="font-medium text-gray-800">Math Chapter 5 Exercises</div>
                    <div className="text-sm text-gray-500">Uploaded 2 days ago</div>
                  </div>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <div className="text-xl mr-3">📊</div>
                  <div>
                    <div className="font-medium text-gray-800">Science Quiz Questions</div>
                    <div className="text-sm text-gray-500">Uploaded 1 week ago</div>
                  </div>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;