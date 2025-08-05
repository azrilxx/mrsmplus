import React, { useState, useEffect } from 'react';

interface XPBadgeProps {
  currentXP: number;
  gainedXP?: number;
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
  showParticles?: boolean;
  rewardMessage?: string;
}

export const XPBadge: React.FC<XPBadgeProps> = ({
  currentXP,
  gainedXP = 0,
  animate = false,
  size = 'medium',
  showParticles = true,
  rewardMessage = 'Great job!'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGain, setShowGain] = useState(false);

  useEffect(() => {
    if (animate && gainedXP > 0) {
      setIsAnimating(true);
      setShowGain(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowGain(false);
      }, 3000); // Extended duration for better visibility

      return () => clearTimeout(timer);
    }
  }, [animate, gainedXP]);

  const sizeClasses = {
    small: 'w-12 h-12 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base'
  };

  const particles = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${i * 0.1}s`,
        transform: `rotate(${i * 45}deg) translateY(-24px)`
      }}
    />
  ));

  return (
    <div className="relative flex items-center justify-center">
      {/* Particle Effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {particles}
        </div>
      )}
      
      {/* Main XP Badge */}
      <div
        className={`
          ${sizeClasses[size]}
          relative flex items-center justify-center
          bg-gradient-to-br from-yellow-400 to-orange-500
          rounded-full shadow-lg border-2 border-yellow-300
          font-bold text-white
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
        `}
      >
        {/* Progress Ring */}
        <div className="absolute inset-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${(currentXP % 100) * 2.83} 283`}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* XP Text */}
        <span className="relative z-10">
          {currentXP}
        </span>
      </div>

      {/* Gained XP Popup with Reward Message */}
      {showGain && gainedXP > 0 && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="text-center">
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce mb-1">
              +{gainedXP} XP
            </div>
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md animate-pulse">
              {rewardMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPBadge;