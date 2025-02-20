import React, { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import API from '../../api/api';

// Update the component props to include task and currentUser
const SubTask = ({ taskId, onTaskUpdate, task, currentUser }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/task/${taskId}/subtasks`);
      setSubtasks(response.data.data);
    } catch (error) {
      setError('Failed to fetch subtasks');
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.title.trim()) return;

    try {
      const response = await API.post(`/api/task/${taskId}/subtasks`, newSubtask);
      setSubtasks([...subtasks, response.data.data]);
      setNewSubtask({ title: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      setError('Failed to add subtask');
      console.error('Error adding subtask:', error);
    }
  };

  const handleRemoveSubtask = async (subtaskId) => {
    try {
      await API.delete(`/api/subtasks/${subtaskId}`);
      setSubtasks(subtasks.filter(st => st._id !== subtaskId));
    } catch (error) {
      setError('Failed to remove subtask');
      console.error('Error removing subtask:', error);
    }
  };

  const handleUpdateProgress = async (subtaskId, completed) => {
    try {
      const response = await API.patch(`/api/subtasks/${subtaskId}/status`, { completed });
      
      // Update local subtasks state
      setSubtasks(prevSubtasks => 
        prevSubtasks.map(st => 
          st._id === subtaskId ? response.data.data : st
        )
      );

      // Update parent task progress
      if (response.data.task) {
        onTaskUpdate(response.data.task);
      }

    } catch (error) {
      setError('Failed to update progress');
      console.error('Error updating progress:', error);
    }
  };

  // Add function to check if user is assigned to task
  const isUserAssigned = () => {
    if (!task || !currentUser) return false;
    return task.assignedTo?.some(userId => 
      userId === currentUser._id || userId._id === currentUser._id
    );
  };

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
      <div
        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const completedCount = subtasks.filter(st => st.status === 'completed').length;
  const progress = subtasks.length ? (completedCount / subtasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Compact View with Progress Bar */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col py-1 px-3 bg-white border-[0.05rem] border-gray-200 rounded-lg 
                   hover:bg-gray-100 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Subtasks</span>
            <span className="text-xs bg-white px-2 py-0 rounded-full text-gray-600 border">
              {completedCount}/{subtasks.length}
            </span>
          </div>
          <Plus size={16} className="text-gray-400 group-hover:text-blue-500" />
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md m-4">
            {/* Modal Header with Progress */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Subtasks</h3>
                  <div className="text-sm text-gray-500">
                    {completedCount} of {subtasks.length} completed
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowAddForm(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <ProgressBar progress={progress} />
            </div>

            {/* Add Button or Form - Now with permission check */}
            {isUserAssigned() ? (
              !showAddForm ? (
                <div className="p-4 border-b">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg 
                             hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Subtask
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddSubtask} className="p-4 border-b space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtask title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                      placeholder="Enter subtask description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                               hover:bg-blue-600 transition-colors"
                    >
                      Add Subtask
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 
                              rounded-lg p-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Only assigned members can create subtasks</span>
                </div>
              </div>
            )}

            {/* Subtasks List - Update to show creator info */}
            <div className="max-h-[400px] overflow-y-auto">
              {subtasks.map((subtask) => (
                <div
                  key={subtask._id}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateProgress(
                            subtask._id, 
                            subtask.status !== 'completed'
                        )}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center 
                                  transition-colors ${
                          subtask.status === 'completed'
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {subtask.status === 'completed' && <Check size={14} />}
                      </button>
                      <div>
                        <h4 className={`font-medium ${
                            subtask.status === 'completed' 
                                ? 'text-gray-400 line-through' 
                                : 'text-gray-700'
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
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 
                                 rounded-full text-red-500 transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubTask;