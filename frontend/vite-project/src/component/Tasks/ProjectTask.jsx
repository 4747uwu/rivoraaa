import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, Calendar, LayoutGrid, List, MoreHorizontal, Plus, AlertCircle, Filter, SortAsc, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/api';
import  {useProjects}  from '../../context/ProjectContext';
import SubTask from '../Tasks/subtask';

const ProjectTasks = ({ 
  projectId, 
  canAssignTasks, 
  canBeAssigned, 
  currentUser, 
  projectMembers 
}) => {
  const { selectedProject } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState(null);
  console.log('Project:', selectedProject);
  console.log('user', currentUser);

  // Column configuration
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'in_review', label: 'In Review' },
    { id: 'completed', label: 'Done' }
  ];

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Add after existing useEffect
  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return sortOrder === 'asc' 
            ? new Date(a.dueDate) - new Date(b.dueDate)
            : new Date(b.dueDate) - new Date(a.dueDate);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc'
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return sortOrder === 'asc'
            ? a.progress - b.progress
            : b.progress - a.progress;
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...filteredTasks];
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    return sortTasks(filtered);
  };

  // Update the fetchTasks function to populate assignedTo data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/tasks?projectId=${projectId}`);
      console.log('Fetched tasks with assignments:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      if (!isAdmin(currentUser, selectedProject)) {
        setError('Only admins can create tasks');
        return;
      }
      const response = await API.post(`/api/tasks`, { 
        ...formData, 
        projectId // Make sure projectId is included
      });
      fetchTasks(); // Refresh tasks for current project
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      if (!isAdmin(currentUser, selectedProject)) {
        setError('Only admins can edit tasks');
        return;
      }
      await API.put(`/api/tasks/${taskId}`, updates);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      if (!isAdmin(currentUser, selectedProject)) {
        setError('Only admins can delete tasks');
        return;
      }
      if (window.confirm('Are you sure you want to delete this task?')) {
        await API.delete(`/api/tasks/${taskId}`);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  // Drag and Drop Functions with Optimistic UI Update
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Update API for status change without re-fetching tasks
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Optionally, revert the change or notify the user
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    // Optimistically update local state without calling fetchTasks
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
    // Update the API in the background without calling fetchTasks() again
    await handleUpdateTaskStatus(taskId, newStatus);
  };

  // Update the filteredTasks to only handle search
  const filteredTasks = tasks.filter(task => 
    // Only filter by search query now
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Task Form Modal Component
  const TaskFormModal = ({ onClose, initialData = null }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: initialData?.status || 'todo',
      assignedTo: [],
      ...(initialData || {}) // Only spread initialData if it exists
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (initialData?._id) { // Check for _id to determine if it's an edit
        await handleUpdateTask(initialData._id, formData);
      } else {
        await handleCreateTask(formData);
      }
      onClose();
    };

    const toggleMemberAssignment = (memberId) => {
      setFormData(prev => {
        const isCurrentlyAssigned = prev.assignedTo.includes(memberId);
        return {
          ...prev,
          assignedTo: isCurrentlyAssigned
            ? prev.assignedTo.filter(id => id !== memberId)
            : [...prev.assignedTo, memberId]
        };
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-4 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="px-4 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-4 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="mt-2 border-t pt-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Assign Team Members
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedProject?.members?.map(member => (
                  <div 
                    key={member._id}
                    className="flex items-center space-x-3 p-1 hover:bg-gray-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      id={`member-${member._id}`}
                      checked={formData.assignedTo.includes(member.userId?._id || member.userId)}
                      onChange={() => toggleMemberAssignment(member.userId?._id || member.userId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`member-${member._id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {(member.userId?.username || member.username)?.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">
                        {member.userId?.username || member.username}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {initialData ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Task Card Component with Edit/Delete Menu
  const TaskCard = ({ task, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showAssignMenu, setShowAssignMenu] = useState(false);
    const assignMenuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (assignMenuRef.current && !assignMenuRef.current.contains(event.target)) {
          setShowAssignMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAssignmentToggle = async (memberId) => {
      if (!canAssignTasks) {
        console.warn('Unauthorized to assign tasks');
        window.alert('You are not authorized to assign tasks');
        return;
      }
      try {
        console.log('Toggling member:', memberId);
        console.log('Current assignedTo:', task.assignedTo);
        
        const isCurrentlyAssigned = task.assignedTo?.some(id => 
          id === memberId || id === memberId._id
        );
    
        if (isCurrentlyAssigned) {
          await handleUnassignUser(task._id, memberId);
        } else {
          await handleAssignUsers(task._id, [memberId]);
        }
      } catch (error) {
        console.error('Error toggling assignment:', error);
      }
    };

    const getPriorityColor = (priority) => {
      const colors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
      };
      return colors[priority] || colors.medium;
    };

    // Update TaskCard member display section
    const renderAssignedMembers = (task) => {
      if (!task.assignedTo || !selectedProject?.members) return null;
    
      console.log('Rendering members for task:', task._id);
      console.log('Assigned users:', task.assignedTo);
      console.log('Project members:', selectedProject.members);
    
      return task.assignedTo.slice(0, 3).map(assignedUser => {
        // Handle both full user object and ID cases
        const userId = assignedUser._id || assignedUser;
        
        // Find the member in project members
        const member = selectedProject.members.find(m => {
          const memberUserId = m.userId?._id || m.userId;
          return memberUserId === userId;
        });
    
        // If we have a full user object in assignedTo, use it directly
        const userData = assignedUser.username ? assignedUser : member?.userId;
    
        if (!userData) {
          console.log('No user data found for:', assignedUser);
          return null;
        }
    
        return (
          <div
            key={userData._id}
            className="relative group"
          >
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt={userData.username}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${userData.username}&background=random`;
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center 
                               text-xs font-medium bg-blue-100 text-blue-600">
                  {userData.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            {/* Unassign button */}
          <button
          onClick={(e) => {
            e.stopPropagation();
            handleUnassignUser(task._id, userData._id);
          }}
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-500 rounded-full text-white 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 
                   transition-opacity duration-100 hover:bg-red-600 z-20"
          title={`Unassign ${userData.username}`}
        >
          <span className="text-xs">×</span>
        </button>
          </div>
        );
      }).filter(Boolean);
    };

    // Add admin check for edit/delete menu
    const showActionMenu = isAdmin(currentUser, selectedProject);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        className="group relative bg-gray-50 rounded-lg p-4 border-[0.05rem] border-gray-200 
                   hover:border-blue-200 hover:shadow-lg transition-all duration-200 
                   cursor-move hover:scale-[1.02] overflow-hidden"
      >
        {/* Priority Badge - Enhanced */}
        <div className="absolute -top-2 -right-[0.75] z-10">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full 
                           text-xs font-medium shadow-md border 
                           ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      
        {/* Actions Menu */}
        {showActionMenu && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAssignMenu(!showAssignMenu);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200
                       text-gray-500 hover:text-blue-600"
              title="Assign members"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200
                       text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontal size={16} />
            </button>
    
            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-8 w-36 bg-white border-2 border-gray-100 
                           rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    onEdit(task);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                           hover:text-blue-600 transition-colors duration-150 first:rounded-t-lg"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    onDelete(task._id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 
                           transition-colors duration-150 last:rounded-b-lg border-t border-gray-100"
                >
                  Delete Task
                </button>
              </div>
            )}
          </div>
        )}
              
                {/* Task Content - Enhanced */}
        <div className="">
          <h3 className="flex items-center gap-2">
            <span className="font-semibold text-black text-base group-hover:text-blue-600 
                           transition-colors line-clamp-2 flex-1">
              {task.title} 
               <span className="text-s font-medium px-2 py-0.5 text-gray-600 rounded-full 
                           inline-flex items-center">
              {task.progress || 0}%
            </span>
            </span>
           
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2 pb-2 border-b border-gray-50">
            {task.description}
          </p>
        </div>
      
        {/* Task Metadata - Enhanced */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {renderAssignedMembers(task)}
            {task.assignedTo?.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white 
                             flex items-center justify-center text-xs font-medium 
                             text-gray-600 shadow-sm">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
      
          {task.dueDate && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full 
                           bg-gray-50 text-gray-600 border border-gray-200">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="mt-4 border-t pt-4">
          <SubTask 
            taskId={task._id} 
            onTaskUpdate={handleTaskUpdate}
            task={task}        // Make sure this contains the full task object with assignedTo array
            currentUser={currentUser}
          />
        </div>
      </motion.div>
    );
  };

  // Update handleAssignUsers function to properly update local state
  const handleAssignUsers = async (taskId, userIds) => {
    try {
      const response = await API.put(`/api/tasks/${taskId}/assign`, { userIds });
      
      // Update local state with the complete response data
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? response.data : task
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error assigning users:', error);
      await fetchTasks(); // Refresh on error
      throw error;
    }
  };

  // Update handleUnassignUser function similarly
  const handleUnassignUser = async (taskId, userId) => {
    try {
      const response = await API.put(`/api/tasks/${taskId}/unassign`, { userId });
      
      // Update local state with the complete response data
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? response.data : task
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error unassigning user:', error);
      await fetchTasks(); // Refresh on error
      throw error;
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  const TaskControls = () => (
    <div className="flex items-center gap-4 pb-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
        >
          <option value="createdAt">Created Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="progress">Progress</option>
        </select>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Priority:</span>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col gap-4 bg-white rounded-lg p-4 border border-gray-200">
       

        {/* Search and View Toggle */}
        <div className="flex justify-between items-center">
          <div className="relative w-[49%] border border-gray-100 rounded-lg">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
            <SearchIcon className="absolute left-3 top-2 text-gray-400" size={18} />
          </div>
          <TaskControls />
          <div className="flex gap-2 bg-gray-100  rounded-lg">
            {['list', 'board', 'calendar'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-4 py-1 rounded-lg flex items-center gap-0 transition-all ${
                  view === viewType 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType === 'list' && <List size={16} />}
                {viewType === 'board' && <LayoutGrid size={16} />}
                {viewType === 'calendar' && <Calendar size={16} />}
                <span className="capitalize font-medium">{viewType}</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Controls */}
        
      </div>

      {/* Task Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-white rounded-xl p-4 min-h-[calc(80vh-80px)] flex flex-col 
                         border border-gray-200 shadow-sm"
            >
              {/* Column Header with Task Count and Add Button */}
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 
                              border-b-2 border-gray-100">
                <div className="flex items-center">
                  <h2 className="font-semibold text-gray-900">{column.label}</h2>
                  <span className="ml-2 px-2.5 py-0.5 bg-gray-200 rounded-full text-xs font-medium 
                                 text-black border border-gray-200">
                    {filteredTasks.filter(task => task.status === column.id).length}
                  </span>
                </div>
                
                {/* Add Task Button - Moved to header */}
                {isAdmin(currentUser, selectedProject) ? (
                  <button
                    onClick={() => {
                      setSelectedTask(null); // Set to null for new task
                      setShowTaskForm(true);
                      setFormData({ // Set initial status only
                        title: '',
                        description: '',
                        dueDate: '',
                        priority: 'medium',
                        status: column.id,
                        assignedTo: []
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 
                               transition-all duration-200 flex items-center justify-center group"
                    title="Add task"
                  >
                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                ) : null}
              </div>
      
              {/* Tasks Container */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                <AnimatePresence>
                  {getFilteredAndSortedTasks()
                    .filter(task => task.status === column.id)
                    .map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        onEdit={handleEditTask} 
                        onDelete={handleDeleteTask} 
                      />
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskFormModal
          onClose={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
          initialData={selectedTask}
        />
      )}
    </div>
  );
};

// Add this helper function at the top of the file
const isAdmin = (currentUser, selectedProject) => {
  if (!currentUser || !selectedProject) return false;
  const member = selectedProject.members.find(m => m.userId?._id === currentUser._id);
  return member?.role === 'admin';
};

export default ProjectTasks;