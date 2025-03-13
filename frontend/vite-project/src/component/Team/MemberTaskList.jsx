import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  XCircle, 
  AlertCircle, 
  CheckSquare, 
  XSquare,
  ClipboardList,
  X,
  ArrowUpDown,
  Search
} from 'lucide-react';

const MemberTaskList = ({ member, tasks, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get tasks assigned to this member
  const memberTasks = useMemo(() => {
    if (!member || !tasks || !tasks.length) return [];
    
    const userId = member._id;
    
    return tasks.filter(task => 
      task.assignedTo?.includes(userId) || task.assignedTo?.some(u => u._id === userId)
    );
  }, [member, tasks]);
  
  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...memberTasks];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title?.toLowerCase().includes(search) || 
        task.description?.toLowerCase().includes(search)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else if (sortBy === 'status') {
        const statusOrder = { 
          'todo': 1, 
          'in_progress': 2, 
          'in_review': 3, 
          'completed': 4
        };
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [memberTasks, searchTerm, sortBy, sortOrder]);
  
  // Status badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            In Review
          </span>
        );
      case 'todo':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ClipboardList className="w-3 h-3 mr-1" />
            To Do
          </span>
        );
    }
  };
  
  // Priority badge renderer
  const renderPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Check if date is in the past
  const isPastDue = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {member?.avatar ? (
                <img 
                  className="h-10 w-10 rounded-full" 
                  src={member.avatar} 
                  alt={`${member.username}'s avatar`} 
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {member?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold text-gray-900">{member?.username}'s Tasks</h2>
              <p className="text-sm text-gray-500">
                {memberTasks.length} {memberTasks.length === 1 ? 'task' : 'tasks'} assigned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search and sort */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search tasks..."
            />
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'text-gray-600' : 'text-blue-600'} />
            </button>
          </div>
        </div>
        
        {/* Task list */}
        <div className="flex-grow overflow-y-auto">
          {filteredTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <li key={task._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-grow">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {task.status === 'completed' ? (
                            <CheckSquare size={18} className="text-green-500" />
                          ) : (
                            <XSquare size={18} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                          {task.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 ml-7 sm:ml-0">
                      <div className="flex items-center gap-1">
                        {renderPriorityBadge(task.priority)}
                        {renderStatusBadge(task.status)}
                      </div>
                      
                      {task.dueDate && (
                        <div className={`flex items-center text-xs ${isPastDue(task.dueDate) && task.status !== 'completed' ? 'text-red-600' : 'text-gray-500'}`}>
                          <Calendar size={12} className="mr-1" />
                          {formatDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <ClipboardList size={36} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-medium">No tasks found</h3>
              <p className="text-gray-400 mt-1 text-sm">
                {searchTerm ? 'Try a different search term' : 'This member has no assigned tasks'}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredTasks.length} of {memberTasks.length} tasks shown
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberTaskList;