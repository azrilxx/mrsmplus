import React from 'react';

interface WatchtowerHeaderProps {
  lastUpdated?: string;
  isRealTime: boolean;
  onToggleRealTime: (enabled: boolean) => void;
  onRefresh: () => void;
}

export const WatchtowerHeader: React.FC<WatchtowerHeaderProps> = ({
  lastUpdated,
  isRealTime,
  onToggleRealTime,
  onRefresh
}) => {
  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and status */}
          <div className="flex items-center">
            <div className="flex items-center mr-6">
              <div className="text-2xl mr-3">🏰</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MRSM Watchtower</h1>
                <p className="text-sm text-gray-500">Student Analytics Dashboard</p>
              </div>
            </div>
            
            {/* Real-time status indicator */}
            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isRealTime 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                {isRealTime ? 'Live' : 'Static'}
              </div>
              
              <div className="text-xs text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-4">
            {/* Real-time toggle */}
            <div className="flex items-center">
              <label className="text-sm text-gray-700 mr-2">Real-time</label>
              <button
                onClick={() => onToggleRealTime(!isRealTime)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isRealTime ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRealTime ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {/* Settings menu */}
            <div className="relative">
              <button className="flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner (shown when needed) */}
      <div className="bg-red-50 border-l-4 border-red-400 p-3 hidden">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              System maintenance scheduled for tonight 2:00 AM - 4:00 AM. Dashboard may be temporarily unavailable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchtowerHeader;