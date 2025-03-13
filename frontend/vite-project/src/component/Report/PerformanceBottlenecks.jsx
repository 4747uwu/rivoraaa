import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const PerformanceBottlenecks = ({ bottlenecks = [] }) => {
  const [expanded, setExpanded] = useState(true);

  if (!bottlenecks.length) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-yellow-50 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-gray-800 flex items-center">
          <AlertTriangle size={18} className="text-yellow-600 mr-2" />
          Potential Bottlenecks ({bottlenecks.length})
        </h3>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      
      {expanded && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bottlenecks.map((bottleneck, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{bottleneck.title}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${bottleneck.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{bottleneck.progress}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${bottleneck.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        bottleneck.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {bottleneck.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(bottleneck.dueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PerformanceBottlenecks;