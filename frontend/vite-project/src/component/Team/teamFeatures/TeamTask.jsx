import React, { useState } from 'react';
import axios from 'axios';

const TeamTasks = ({ teamId, team, tasks, isAdmin, onTaskCreated, onTaskUpdated, onTaskDeleted }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeIds: []
  });

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    switch (activeFilter) {
      case 'todo':
        return task.status === 'todo';
      case 'inProgress':
        return task.status === 'in-progress';
      case 'done':
        return task.status === 'done';
      case 'myTasks':
        return task.assignees?.some(assignee => 
          assignee.user._id === localStorage.getItem('userId')
        );
      default:
        return true; // 'all' filter
    }
  });

  const handleCreateTask = async () => {
    try {
      if (!newTask.title) {
        alert('Title is required');
        return;
      }
      
      const response = await axios.post(`/api/teams/${teamId}/tasks`, newTask);
      onTaskCreated(response.data);
      setShowNewTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeIds: []
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, {
        status: newStatus
      });
      onTaskUpdated(response.data);
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        onTaskDeleted(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  // Render task priority badge
  const renderPriorityBadge = (priority) => {
    const classes = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded ${classes[priority] || classes.medium}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="tasks-wrapper">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Team Tasks</h2>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => setShowNewTaskModal(true)}
        >
          + Add Task
        </button>
      </div>
      
      {/* Task filters */}
      <div className="flex mb-4 border-b">
        <button 
          className={`px-4 py-2 ${activeFilter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'todo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('todo')}
        >
          To Do
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'inProgress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('inProgress')}
        >
          In Progress
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'done' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('done')}
        >
          Done
        </button>
        <button 
          className={`px-4 py-2 ${activeFilter === 'myTasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('myTasks')}
        >
          My Tasks
        </button>
      </div>
      
      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Create your first task!
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {renderPriorityBadge(task.priority)}
                  <div className="relative">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                      className="text-sm px-2 py-1 border rounded bg-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Task metadata */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="mr-3">
                    Assigned to: {task.assignees?.map(a => a.user.name).join(', ') || 'Unassigned'}
                  </span>
                  {task.dueDate && (
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span>Created by: {task.createdBy?.name || 'Unknown'}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Create New Task</h3>
            
            <div className="mb-4">
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Assignees</label>
              <select
                multiple
                className="w-full px-3 py-2 border rounded"
                value={newTask.assigneeIds}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setNewTask({...newTask, assigneeIds: selectedOptions});
                }}
              >
                <option value={team?.owner?._id}>{team?.owner?.name}</option>
                {team?.members?.map(member => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowNewTaskModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleCreateTask}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTasks;