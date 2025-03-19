import React from 'react';
import { Award } from 'lucide-react';

const PerformanceScoreCard = ({ score }) => {
  // Determine performance level with updated colors for dark theme
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-emerald-400' };
    if (score >= 75) return { text: 'Very Good', color: 'text-indigo-400' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-400' };
    if (score >= 40) return { text: 'Fair', color: 'text-amber-400' };
    return { text: 'Needs Improvement', color: 'text-rose-400' };
  };

  const { text, color } = getPerformanceLevel(score);

  return (
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] rounded-lg p-5 
                    flex items-center justify-between border border-gray-800/40 
                    backdrop-blur-sm relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
      
      {/* Content */}
      <div className="relative">
        <h3 className="text-gray-300 font-medium">Performance Score</h3>
        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 
                      text-transparent bg-clip-text">
          {score}/100
        </div>
        <div className={`${color} font-medium mt-1`}>
          {text}
        </div>
      </div>

      {/* Progress Circle */}
      <div className="w-24 h-24 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#1f2937" 
            strokeWidth="8" 
            className="opacity-40" 
          />
          {/* Progress Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="url(#gradient)" 
            strokeWidth="8" 
            strokeDasharray={`${Math.min(score * 2.83, 283)} 283`} 
            strokeLinecap="round"
            transform="rotate(-90 50 50)" 
            className="drop-shadow-[0_0_2px_rgba(99,102,241,0.3)]" 
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex items-center justify-center">
          <Award 
            size={28} 
            className="text-purple-400 drop-shadow-[0_0_3px_rgba(167,139,250,0.3)]" 
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceScoreCard;