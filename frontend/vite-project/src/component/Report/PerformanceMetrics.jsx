import React from 'react';
import { TrendingUp, Zap, Clock } from 'lucide-react';

const PerformanceMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Completion Rate Card */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-4 rounded-lg 
                    border border-gray-800/40 hover:border-indigo-500/30 
                    transition-all duration-200 group">
        <div className="flex items-center mb-3">
          <span className="p-2 rounded-lg bg-indigo-500/10 mr-3 
                         group-hover:bg-indigo-500/20 transition-colors">
            <TrendingUp size={18} className="text-indigo-400" />
          </span>
          <h4 className="font-medium text-gray-200">Completion Rate</h4>
        </div>
        <p className="text-2xl font-semibold text-gray-100 mb-1">
          {metrics.completionRate}%
        </p>
        <p className="text-sm text-gray-400">Tasks completed</p>
      </div>
      
      {/* Productivity Card */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-4 rounded-lg 
                    border border-gray-800/40 hover:border-emerald-500/30 
                    transition-all duration-200 group">
        <div className="flex items-center mb-3">
          <span className="p-2 rounded-lg bg-emerald-500/10 mr-3 
                         group-hover:bg-emerald-500/20 transition-colors">
            <Zap size={18} className="text-emerald-400" />
          </span>
          <h4 className="font-medium text-gray-200">Productivity</h4>
        </div>
        <p className="text-2xl font-semibold text-gray-100 mb-1">
          {metrics.productivity}/10
        </p>
        <p className="text-sm text-gray-400">Overall rating</p>
      </div>
      
      {/* Response Time Card */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-4 rounded-lg 
                    border border-gray-800/40 hover:border-purple-500/30 
                    transition-all duration-200 group">
        <div className="flex items-center mb-3">
          <span className="p-2 rounded-lg bg-purple-500/10 mr-3 
                         group-hover:bg-purple-500/20 transition-colors">
            <Clock size={18} className="text-purple-400" />
          </span>
          <h4 className="font-medium text-gray-200">Response Time</h4>
        </div>
        <p className="text-2xl font-semibold text-gray-100 mb-1">
          {metrics.responseTime}
        </p>
        <p className="text-sm text-gray-400">Task completion speed</p>
      </div>
    </div>
  );
};

export default PerformanceMetrics;