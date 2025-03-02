import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckSquare, Clock, Flag } from 'lucide-react';

const TaskDetailsModal = ({ 
  task, 
  onClose, 
  projectMembers,
  onSubtaskToggle // Add this prop
}) => {
  if (!task) return null;

  // Add subtask toggle handler
  const handleSubtaskToggle = async (subtaskId) => {
    try {
      await onSubtaskToggle(task._id, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                </div>

                {/* Updated Subtasks Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Subtasks ({task.subtasks?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {task.subtasks?.map((subtask) => (
                      <div
                        key={subtask._id}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg 
                               hover:bg-gray-100 transition-colors group"
                      >
                        <button
                          onClick={() => handleSubtaskToggle(subtask._id)}
                          className="flex items-center gap-2 w-full"
                        >
                          <CheckSquare 
                            size={18} 
                            className={`${
                              subtask.completed 
                                ? 'text-green-500' 
                                : 'text-gray-400 group-hover:text-gray-600'
                            } transition-colors`} 
                          />
                          <span className={`${
                            subtask.completed 
                              ? 'line-through text-gray-400' 
                              : 'text-gray-700'
                            } transition-colors`}
                          >
                            {subtask.title}
                          </span>
                        </button>
                      </div>
                    ))}
                    {!task.subtasks?.length && (
                      <p className="text-gray-500 text-sm italic">
                        No subtasks added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Meta Info */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Due Date */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Progress</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                  </div>
                </div>

                {/* Assigned Members */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.assignedTo?.map((userId) => {
                      const member = projectMembers?.find(m => 
                        m.userId?._id === userId || m.userId === userId
                      );
                      if (!member) return null;

                      return (
                        <div
                          key={member.userId?._id}
                          className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            {member.userId?.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">
                            {member.userId?.username}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailsModal;