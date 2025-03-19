import React from 'react';
import { Lightbulb } from 'lucide-react';

const PerformanceRecommendations = ({ recommendations }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-5 rounded-lg 
                    border border-gray-800/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 rounded-lg bg-indigo-500/10">
          <Lightbulb className="text-indigo-400" size={20} />
        </span>
        <h3 className="font-semibold text-gray-200">
          AI Recommendations
        </h3>
      </div>

      <ul className="space-y-4">
        {recommendations.map((recommendation, idx) => (
          <li 
            key={idx} 
            className="flex items-start gap-3 group 
                     hover:bg-white/5 p-2 rounded-lg transition-colors"
          >
            <span className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 
                          text-indigo-400 rounded-full w-6 h-6 
                          flex items-center justify-center flex-shrink-0 mt-0.5
                          border border-indigo-500/20 group-hover:border-indigo-500/40
                          transition-colors text-sm">
              {idx + 1}
            </span>
            <span className="text-gray-300 leading-relaxed">
              {recommendation}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PerformanceRecommendations;