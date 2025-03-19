import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Target, Lightbulb } from 'lucide-react';

const PerformanceInsights = ({ strengths, improvements, insights }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-800/40 rounded-lg bg-[#1A1A1A]">
      <div 
        className="p-4 bg-gradient-to-r from-[#1A1A1A] via-[#1E1E1E] to-[#1A1A1A] 
                 flex justify-between items-center cursor-pointer border-b 
                 border-gray-800/40 hover:bg-[#232323] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <Zap size={18} className="text-indigo-400" />
          Performance Analysis
        </h3>
        {expanded ? 
          <ChevronUp size={18} className="text-gray-400" /> : 
          <ChevronDown size={18} className="text-gray-400" />
        }
      </div>
      
      {expanded && (
        <div className="divide-y divide-gray-800/40">
          {/* Strengths Section */}
          <div className="p-4 bg-[#1A1A1A]/50">
            <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <Target size={16} className="text-emerald-400" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <span className="text-emerald-500/40 mt-1.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Improvements Section */}
          <div className="p-4 bg-[#1A1A1A]/50">
            <h4 className="font-semibold text-rose-400 mb-3 flex items-center gap-2">
              <Target size={16} className="text-rose-400" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <span className="text-rose-500/40 mt-1.5">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Key Insights Section */}
          <div className="p-4 bg-[#1A1A1A]/50">
            <h4 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-indigo-400" />
              Key Insights
            </h4>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;