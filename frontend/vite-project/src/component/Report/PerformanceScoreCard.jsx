import React from 'react';
import { Award } from 'lucide-react';

const PerformanceScoreCard = ({ score }) => {
  // Determine performance level
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 75) return { text: 'Very Good', color: 'text-blue-600' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-500' };
    if (score >= 40) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };

  const { text, color } = getPerformanceLevel(score);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 flex items-center justify-between">
      <div>
        <h3 className="text-gray-700 font-medium">Performance Score</h3>
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          {score}/100
        </div>
        <div className={`${color} font-medium mt-1`}>
          {text}
        </div>
      </div>
      <div className="w-24 h-24 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#e2e8f0" 
            strokeWidth="8" 
          />
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
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex items-center justify-center">
          <Award size={28} className="text-purple-600" />
        </div>
      </div>
    </div>
  );
};

export default PerformanceScoreCard;