import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import API from '../../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Update the component props to include task and currentUser
const SubTask = ({ taskId, onTaskUpdate, task, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });
  const queryClient = useQueryClient();

  // Fetch subtasks using React Query
  const { 
    data: subtasks = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      const response = await API.get(`/api/task/${taskId}/subtasks`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (newSubtask) => {
      const response = await API.post(`/api/task/${taskId}/subtasks`, newSubtask);
      return response.data.data;
    },
    onSuccess: (newSubtaskData) => {
      // Update cache
      queryClient.setQueryData(['subtasks', taskId], (old = []) => [...old, newSubtaskData]);
      // Reset form
      setNewSubtask({ title: '', description: '' });
      setShowAddForm(false);
    },
    onError: (err) => {
      console.error('Error adding subtask:', err);
    }
  });

  // Remove subtask mutation
  const removeSubtaskMutation = useMutation({
    mutationFn: async (subtaskId) => {
      await API.delete(`/api/subtasks/${subtaskId}`);
      return subtaskId;
    },
    onSuccess: (removedId) => {
      // Update cache by filtering out the removed subtask
      queryClient.setQueryData(['subtasks', taskId], (old = []) => 
        old.filter(st => st._id !== removedId)
      );
    },
    onError: (err) => {
      console.error('Error removing subtask:', err);
    }
  });

  // Update subtask progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }) => {
      const response = await API.patch(`/api/subtasks/${subtaskId}/status`, { completed });
      return response.data;
    },
    onSuccess: (data) => {
      // Update the subtask in cache
      queryClient.setQueryData(['subtasks', taskId], (oldSubtasks = []) =>
        oldSubtasks.map(st => st._id === data.data._id ? data.data : st)
      );
      
      // Update parent task progress if needed
      if (data.task) {
        onTaskUpdate(data.task);
        // If you have task cache, update it here
        queryClient.setQueryData(['tasks', data.task._id], data.task);
      }
    },
    onError: (err) => {
      console.error('Error updating progress:', err);
    }
  });

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.title.trim()) return;
    addSubtaskMutation.mutate(newSubtask);
  };

  const handleRemoveSubtask = (subtaskId) => {
    removeSubtaskMutation.mutate(subtaskId);
  };

  const handleUpdateProgress = (subtaskId, completed) => {
    updateProgressMutation.mutate({ subtaskId, completed });
  };

  // Add function to check if user is assigned to task
  const isUserAssigned = () => {
    if (!task || !currentUser) return false;
    return task.assignedTo?.some(userId => 
      userId === currentUser._id || userId._id === currentUser._id
    );
  };

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-800/50 rounded-full h-1.5 mt-2">
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full 
                 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const completedCount = subtasks.filter(st => st.status === 'completed').length;
  const progress = subtasks.length ? (completedCount / subtasks.length) * 100 : 0;

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error if there's a problem fetching subtasks
  if (error) {
    return (
      <div className="text-red-500 text-sm p-2">
        Failed to load subtasks: {error.message}
      </div>
    );
  }

  return (
    <>
      {/* Compact View with Progress Bar */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col py-1 px-3 bg-[#1A1A1A]/60 backdrop-blur-sm 
                 border-[0.05rem] border-white/10 rounded-lg 
                 hover:bg-[#1A1A1A]/80 cursor-pointer group transition-all
                 duration-200 hover:border-indigo-500/30"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Subtasks</span>
            <span className="text-xs bg-[#121212]/80 px-2 py-0 rounded-full 
                         text-gray-400 border border-gray-800/40">
              {completedCount}/{subtasks.length}
            </span>
          </div>
          <Plus size={16} className="text-gray-500 group-hover:text-indigo-400" />
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                     flex items-center justify-center z-50">
          <div className="bg-[#121212] rounded-lg w-full max-w-md m-4 
                       border border-white/10 shadow-xl">
            {/* Modal Header with Progress */}
            <div className="p-4 border-b border-gray-800/40">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Subtasks</h3>
                  <div className="text-sm text-gray-400">
                    {completedCount} of {subtasks.length} completed
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowAddForm(false);
                  }}
                  className="p-1 hover:bg-white/5 rounded-full 
                         text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <ProgressBar progress={progress} />
            </div>

            {/* Add Button or Form - Now with permission check */}
            {isUserAssigned() ? (
              !showAddForm ? (
                <div className="p-4 border-b border-gray-800/40">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-2 px-4 bg-indigo-500/10 text-indigo-400 
                           rounded-lg hover:bg-indigo-500/20 transition-colors 
                           flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Subtask
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddSubtask} className="p-4 border-b border-gray-800/40 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-800/40 
                             rounded-lg focus:outline-none focus:ring-2 
                             focus:ring-indigo-500/30 text-gray-200 
                             placeholder-gray-500"
                      placeholder="Enter subtask title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-800/40 
                             rounded-lg focus:outline-none focus:ring-2 
                             focus:ring-indigo-500/30 h-24 text-gray-200 
                             placeholder-gray-500"
                      placeholder="Enter subtask description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-lg 
                             transition-colors"
                      disabled={addSubtaskMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-indigo-500 text-white rounded-lg 
                             hover:bg-indigo-600 transition-colors ${
                               addSubtaskMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
                             }`}
                      disabled={addSubtaskMutation.isPending}
                    >
                      {addSubtaskMutation.isPending ? 'Adding...' : 'Add Subtask'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="p-4 border-b border-gray-800/40">
                <div className="flex items-center gap-2 text-sm text-gray-400 
                            bg-white/5 rounded-lg p-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Only assigned members can create subtasks</span>
                </div>
              </div>
            )}

            {/* Subtasks List - Update to show creator info */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {subtasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No subtasks yet. Add some to track progress!
                </div>
              ) : (
                subtasks.map((subtask) => (
                  <div
                    key={subtask._id}
                    className="p-4 border-b border-gray-800/40 last:border-b-0 
                           hover:bg-white/5 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateProgress(
                              subtask._id, 
                              subtask.status !== 'completed'
                          )}
                          disabled={updateProgressMutation.isPending}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center 
                                    transition-colors ${
                            subtask.status === 'completed'
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-gray-600 hover:border-indigo-500'
                          } ${updateProgressMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {subtask.status === 'completed' && <Check size={14} />}
                        </button>
                        <div>
                          <h4 className={`font-medium ${
                              subtask.status === 'completed' 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-200'
                          }`}>
                            {subtask.title}
                          </h4>
                          {subtask.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {subtask.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Only show delete button if user is assigned */}
                      {isUserAssigned() && (
                        <button
                          onClick={() => handleRemoveSubtask(subtask._id)}
                          disabled={removeSubtaskMutation.isPending}
                          className={`opacity-0 group-hover:opacity-100 p-1 
                                   hover:bg-red-500/10 rounded-full text-red-400 
                                   transition-all ${
                                   removeSubtaskMutation.isPending ? 'cursor-not-allowed opacity-50' : ''
                                  }`}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubTask;