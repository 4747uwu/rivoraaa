import React from 'react';
import { Lightbulb } from 'lucide-react';

const PerformanceRecommendations = ({ recommendations }) => {
  return (
    <div className="bg-indigo-50 p-5 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <Lightbulb className="text-indigo-600 mr-2" size={20} />
        AI Recommendations
      </h3>
      <ul className="space-y-3">
        {recommendations.map((recommendation, idx) => (
          <li key={idx} className="flex items-start">
            <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="text-gray-700">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PerformanceRecommendations;