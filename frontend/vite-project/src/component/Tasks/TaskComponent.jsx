import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Calendar, AlertCircle, Loader, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../api/api';

// Individual task card component remains the same
const TaskCard = ({ task, formatDate, textClass, subTextClass }) => {
  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper function to get status styles
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-400',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'in_progress':
        return {
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          icon: <Clock className="w-4 h-4" />
        };
      case 'in_review':
        return {
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-400',
          icon: <Clock className="w-4 h-4" />
        };
      case 'blocked':
        return {
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-400',
          icon: <AlertCircle className="w-4 h-4" />
        };
      default:
        return {
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-400',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusStyles = getStatusStyles(task.status);

  // Format project name display
  const projectName = task.projectId?.name || 'No Project';

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-[#1A1A1A]/60 backdrop-blur-md rounded-lg p-3 border border-[#333333] hover:border-white/10 
                 transition-all duration-300 flex items-center gap-3"
    >
      {/* Status Indicator */}
      <div className={`w-1.5 h-12 rounded-full ${statusStyles.bgColor}`} />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-medium ${textClass} text-sm truncate`}>{task.title}</h3>
          <div className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium 
                        ${getPriorityColor(task.priority)} bg-opacity-20 capitalize`}>
            {task.priority}
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <span className={`${subTextClass} truncate`}>
            {projectName}
          </span>
          {task.dueDate && (
            <>
              <span className={`w-1 h-1 rounded-full ${subTextClass}`}>•</span>
              <span className={`flex items-center gap-1 ${subTextClass}`}>
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${statusStyles.bgColor} ${statusStyles.textColor} 
                    flex items-center justify-center`}>
        {statusStyles.icon}
      </div>
    </motion.div>
  );
};

// Main component with real API data
const TaskComponent = ({ 
  glassCard, 
  headingClass, 
  textClass, 
  subTextClass,
  maxHeight = "300px",
  showAddTask = true,
  limit = 5 // Default to showing 5 most recent tasks
}) => {
  // Local state for tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  // Fetch real task data from API
  useEffect(() => {
    console.log('TaskComponent mounted - Fetching real tasks data...');
    
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/user/tasks');
        console.log('API response:', response);
        
        let taskData = [];
        
        if (response.data && response.data.tasks) {
          taskData = response.data.tasks;
        } else if (response.data && Array.isArray(response.data)) {
          taskData = response.data;
        }
        
        // Sort tasks by createdAt date (most recent first)
        taskData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Limit to the specified number of tasks
        const limitedTasks = limit ? taskData.slice(0, limit) : taskData;
        
        setTasks(limitedTasks);
        setLoading(false);
        console.log('Tasks loaded successfully:', limitedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [limit]);

  // Style for the container
  const containerStyle = {
    maxHeight: maxHeight
  };

  return (
    <div className={`${glassCard} rounded-2xl p-4 hover:shadow-white/5`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-bold ${headingClass}`}>My Tasks</h2>
        {showAddTask && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-[#E0E0E0] hover:text-white 
                    transition-all duration-300 px-2.5 py-1.5 rounded-lg 
                    bg-[#1A1A1A] hover:bg-white/10 border border-[#333333]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Add Task</span>
          </motion.button>
        )}
      </div>
      
      {error ? (
        <div className="text-center py-8 rounded-xl bg-[#1A1A1A]/30 border border-[#333333]">
          <AlertCircle className="w-10 h-10 text-red-400/50 mx-auto mb-3" />
          <p className={`${subTextClass} mb-2 text-red-300`}>Error loading tasks</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1" style={containerStyle}>
          {tasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              formatDate={formatDate}
              textClass={textClass}
              subTextClass={subTextClass}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-[#1A1A1A]/30 border border-[#333333]">
          <Clock className="w-10 h-10 text-gray-400/50 mx-auto mb-3" />
          <p className={`${subTextClass} mb-2`}>No tasks available</p>
          <button className="text-[#E0E0E0] text-sm hover:text-white underline underline-offset-2">
            Create your first task
          </button>
        </div>
      )}
      
      {tasks.length > 0 && (
        <div className="mt-4 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#E0E0E0] text-sm hover:text-white underline underline-offset-2"
          >
            View all tasks
          </motion.button>
        </div>
      )}
    </div>
  );
};

export { TaskCard, TaskComponent as default };