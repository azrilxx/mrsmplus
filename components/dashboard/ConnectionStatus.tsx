import React from 'react';
import { useFirebaseWithFallback } from '../../hooks/useFirebaseWithFallback';

interface ConnectionStatusProps {
  showRetryButton?: boolean;
  position?: 'header' | 'footer' | 'floating';
  compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showRetryButton = true, 
  position = 'header',
  compact = false
}) => {
  const { firebaseStatus, retryConnection, getConnectionStatus, getStatusIndicator } = useFirebaseWithFallback();
  
  const { status, message } = getConnectionStatus();
  const { color, icon, text } = getStatusIndicator();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-600">{text}</span>
      </div>
    );
  }

  const getContainerStyles = () => {
    const baseStyles = "flex items-center justify-between p-3 rounded-lg border";
    
    switch (status) {
      case 'connected':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'fallback':
        return `${baseStyles} bg-orange-50 border-orange-200 text-orange-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  if (position === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={getContainerStyles()}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <div>
              <div className="font-medium text-sm">{text}</div>
              <div className="text-xs opacity-75">{message}</div>
            </div>
          </div>
          
          {showRetryButton && status === 'fallback' && firebaseStatus.retryCount < 3 && (
            <button
              onClick={retryConnection}
              className="ml-3 px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-xs font-medium transition-all"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerStyles()}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm opacity-75">{message}</div>
          {status === 'fallback' && (
            <div className="text-xs opacity-60 mt-1">
              All features available offline • Data will sync when reconnected
            </div>
          )}
        </div>
      </div>
      
      {showRetryButton && status === 'fallback' && firebaseStatus.retryCount < 3 && (
        <button
          onClick={retryConnection}
          className="px-4 py-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded font-medium transition-all"
        >
          Retry Connection
        </button>
      )}
      
      {status === 'fallback' && firebaseStatus.retryCount >= 3 && (
        <div className="text-xs opacity-60">
          Max retries reached
        </div>
      )}
    </div>
  );
};