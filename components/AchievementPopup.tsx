import React, { useState, useEffect } from 'react';
import { Achievement, getAchievementById } from '../firebase/gamification';

interface AchievementPopupProps {
  achievementId: string | null;
  onClose: () => void;
  visible: boolean;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievementId,
  onClose,
  visible
}) => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievementId && visible) {
      const achievementData = getAchievementById(achievementId);
      setAchievement(achievementData);
      setIsAnimating(true);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievementId, visible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setAchievement(null);
    }, 300);
  };

  if (!visible || !achievement) return null;

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-300',
          glow: 'shadow-gray-300/50'
        };
      case 'rare':
        return {
          bg: 'from-blue-400 to-blue-600',
          border: 'border-blue-300',
          glow: 'shadow-blue-300/50'
        };
      case 'epic':
        return {
          bg: 'from-purple-400 to-purple-600',
          border: 'border-purple-300',
          glow: 'shadow-purple-300/50'
        };
      case 'legendary':
        return {
          bg: 'from-yellow-400 to-orange-500',
          border: 'border-yellow-300',
          glow: 'shadow-yellow-300/50'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-300',
          glow: 'shadow-gray-300/50'
        };
    }
  };

  const colors = getRarityColors(achievement.rarity);

  const particles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${i * 0.1}s`,
        animationDuration: '2s',
        transform: `rotate(${i * 30}deg) translateY(-40px)`,
        left: '50%',
        top: '50%'
      }}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Achievement Card */}
      <div
        className={`
          relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          ${colors.glow} shadow-2xl
        `}
      >
        {/* Particle Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {particles}
        </div>

        {/* Header */}
        <div className={`
          bg-gradient-to-r ${colors.bg} 
          text-white text-center py-4 rounded-t-xl
          border-2 ${colors.border}
        `}>
          <div className="text-lg font-bold animate-pulse">
            🏆 ACHIEVEMENT UNLOCKED! 🏆
          </div>
          <div className="text-sm opacity-90 uppercase tracking-wide">
            {achievement.rarity}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Achievement Icon */}
          <div className="relative mb-4">
            <div className={`
              w-20 h-20 mx-auto rounded-full 
              bg-gradient-to-br ${colors.bg}
              border-4 ${colors.border}
              flex items-center justify-center
              animate-bounce
              ${colors.glow} shadow-lg
            `}>
              <img 
                src={achievement.iconUrl} 
                alt={achievement.title}
                className="w-10 h-10 filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.textContent = '🏆';
                }}
              />
              <span className="text-2xl hidden">🏆</span>
            </div>
            
            {/* Sparkle effects */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <span className="text-yellow-400 text-lg animate-pulse">✨</span>
              </div>
              <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                <span className="text-yellow-400 text-sm animate-pulse">⭐</span>
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2">
                <span className="text-yellow-400 text-sm animate-pulse">💫</span>
              </div>
            </div>
          </div>

          {/* Achievement Details */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">
              {achievement.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {achievement.description}
            </p>
            
            {/* Reward */}
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-3">
              <span className="mr-1">🎁</span>
              +{achievement.rewardXP} XP Reward
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl text-center">
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Awesome! 🎉
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AchievementPopup;