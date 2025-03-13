import React from 'react';
import { TrendingUp, Zap, Clock } from 'lucide-react';

const PerformanceMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <TrendingUp size={18} className="text-blue-600 mr-2" />
          <h4 className="font-medium text-gray-800">Completion Rate</h4>
        </div>
        <p className="text-2xl font-semibold">{metrics.completionRate}%</p>
        <p className="text-sm text-gray-600">Tasks completed</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Zap size={18} className="text-green-600 mr-2" />
          <h4 className="font-medium text-gray-800">Productivity</h4>
        </div>
        <p className="text-2xl font-semibold">{metrics.productivity}/10</p>
        <p className="text-sm text-gray-600">Overall rating</p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Clock size={18} className="text-purple-600 mr-2" />
          <h4 className="font-medium text-gray-800">Response Time</h4>
        </div>
        <p className="text-2xl font-semibold">{metrics.responseTime}</p>
        <p className="text-sm text-gray-600">Task completion speed</p>
      </div>
    </div>
  );
};

export default PerformanceMetrics;