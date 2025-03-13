import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PerformanceInsights = ({ strengths, improvements, insights }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg">
      <div 
        className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-gray-800">Performance Analysis</h3>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      
      {expanded && (
        <div className="divide-y divide-gray-200">
          <div className="p-4">
            <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-4">
            <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {improvements.map((improvement, idx) => (
                <li key={idx}>{improvement}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Key Insights</h4>
            <p className="text-gray-700 whitespace-pre-line">{insights}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;