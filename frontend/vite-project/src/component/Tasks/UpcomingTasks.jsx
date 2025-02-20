import React from 'react';

const UpcomingTasks = ({ tasks }) => (
  <div className="space-y-4">
    {tasks.map(task => (
      <div 
        key={task.id}
        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-purple-500/10"
      >
        <div>
          <h4 className="text-gray-200 font-medium">{task.title}</h4>
          <p className="text-sm text-gray-400">{task.deadline}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          task.status === 'urgent' 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {task.status}
        </span>
      </div>
    ))}
  </div>
);

export default UpcomingTasks;