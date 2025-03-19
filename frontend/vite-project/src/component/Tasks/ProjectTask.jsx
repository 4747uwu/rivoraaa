import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/api.js';
import { useProjects } from '../../context/ProjectContext';
import SubTask from '../Tasks/subtask';
import GenerateAITasks from './aiGenerate';
import { SearchIcon, MoreHorizontal, Plus, AlertCircle, SortAsc, SortDesc, Paperclip, Image, FileText } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserPerformanceReport from '../Report/userPerformanceReport';
import FileList from '../FileUpload/FileList';
import FileUploaderModal from '../FileUpload/FileUploaderModal';
import FileListModal from '../FileUpload/FileList.jsx';

// Define TaskCard as a memoized component
const TaskCard = React.memo(({ 
  task, 
  onEdit, 
  onDelete, 
  projectMembers, 
  canAssignTasks,
  handleAssignUsers,
  handleUnassignUser,
  handleDragStart,
  currentUser,
  selectedProject,
  handleTaskUpdate
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const assignMenuRef = useRef(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileListModal, setShowFileListModal] = useState(false);
  const [isFileListOpen, setIsFileListOpen] = useState(false);

  // console.log('currentUser' , currentUser.role);
  // Use useCallback for event handlers
  // console.log(projectMembers) 
  const handleClickOutside = useCallback((event) => {
    if (assignMenuRef.current && !assignMenuRef.current.contains(event.target)) {
      setShowAssignMenu(false);
    }
  }, [assignMenuRef]);
  // This is your existing isAdmin helper function
  const isAdmin = (currentUser, selectedProject) => {
    if (!currentUser || !selectedProject) return false;
    const member = selectedProject.members.find(m => m.userId?._id === currentUser._id);
    return member?.role === 'admin';
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleAssignmentToggle = useCallback(async (memberId) => {
    if (!canAssignTasks) {
      console.warn('Unauthorized to assign tasks');
      window.alert('You are not authorized to assign tasks');
      return;
    }
    
    try {
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
  }, [task, canAssignTasks, handleAssignUsers, handleUnassignUser]);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  }, []);

  // Use memoization for expensive rendering
  const renderAssignedMembers = useMemo(() => {
    if (!task.assignedTo || !selectedProject?.members) return null;
  
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
  
      if (!userData) return null;
  
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
  }, [task.assignedTo, selectedProject?.members, handleUnassignUser]);

  const handleSubtaskToggle = useCallback(async (taskId, subtaskId) => {
    try {
      const response = await API.put(`/api/task/${taskId}/subtasks`);
      handleTaskUpdate(response.data);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  }, [handleTaskUpdate]);

  // Add admin check for edit/delete menu
  const showActionMenu = useMemo(() => isAdmin(currentUser, selectedProject), 
    [currentUser, selectedProject]);

  // Fetch task files on component mount
  useEffect(() => {
    if (task?._id) {
      fetchFiles();
    }
  }, [task?._id]);
  
  const fetchFiles = async () => {
    if (!task?._id) return;
    
    setIsLoading(true);
    try {
      const response = await API.get(`/api/tasks/${task._id}/files`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUploadComplete = (file) => {
    setFiles(prev => [...prev, file]);
  };
  
  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(file => file._id !== fileId));
  };

  return (
    <div className="relative group">
      {/* Draggable Task Card Section */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        className="group relative bg-[#121212] rounded-lg p-4 
                 border border-gray-800/40 hover:border-indigo-500/50
                 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-200 
                 cursor-move hover:scale-[1.02] overflow-hidden"
      >
        {/* Main Task Content - Clickable for Task Details */}
        <div 
          onClick={() => setShowDetailsModal(true)}
          className="cursor-pointer"
        >
          {/* Priority Badge */}
          <div className="absolute -top-2 -right-[0.75] z-10">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full 
                           text-xs font-medium shadow-md border border-gray-700/50 
                           ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* Task Content */}
          <div className="">
            <h3 className="flex items-center gap-2">
              <span className="font-semibold text-gray-200 text-base group-hover:text-indigo-400 
                           transition-colors line-clamp-2 flex-1">
                {task.title} 
                <span className="text-s font-medium px-2 py-0.5 text-gray-400 rounded-full 
                             inline-flex items-center">
                  {task.progress || 0}%
                </span>
              </span>
            </h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2 pb-2 border-b border-gray-800/40">
              {task.description}
            </p>
          </div>

          {/* Task Metadata */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {renderAssignedMembers}
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
        </div>

        {/* Subtasks Section - Separate Click Area */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="mt-4 border-t pt-4"
        >
          <SubTask 
            taskId={task._id} 
            onTaskUpdate={handleTaskUpdate}
            task={task}
            currentUser={currentUser}
          />
        </div>
      </motion.div>
      
      {/* NON-DRAGGABLE SECTION - File Attachment UI */}
      {/* This section is completely outside the draggable div */}
      <div 
        className="mt-2 py-2 px-3 bg-[#1A1A1A] rounded-lg 
                     border border-gray-800/40 flex items-center justify-between"
        onClick={(e) => {
          e.stopPropagation();
          if (files.length > 0) {
            setShowFileListModal(true);
          } else if (task.assignedTo?.some(id => 
            id === currentUser._id || id._id === currentUser._id
          ) || isAdmin(currentUser, selectedProject)) {
            setIsFileUploaderOpen(true);
          }
        }}
      >
        <div className="flex items-center cursor-pointer">
          <Paperclip size={16} className={`mr-2 ${files.length > 0 ? 'text-indigo-400' : 'text-gray-500'}`} />
          <span className="text-sm text-gray-300">
            {files.length > 0 
              ? `${files.length} attachment${files.length > 1 ? 's' : ''}` 
              : 'Add attachment'}
          </span>
        </div>
        
        {(task.assignedTo?.some(id => 
          id === currentUser?._id || id?._id === currentUser?._id
        ) || isAdmin(currentUser, selectedProject)) && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFileUploaderOpen(true);
            }}
            className="py-1 px-2 text-xs text-indigo-400 hover:bg-indigo-500/10 
                      rounded-md border border-indigo-500/20 transition-colors"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      
      {/* Actions Menu */}
      {showActionMenu && (
        <div 
          className="absolute top-2 right-2 flex space-x-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Assign Button */}
          <div className="relative">
            <button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              className="p-1.5 hover:bg-[#1A1A1A] rounded-full transition-colors"
              title="Assign members"
            >
              <Plus size={16} className="text-gray-400" />
            </button>
    
            {/* Assignment Menu */}
            {showAssignMenu && (
              <div 
                ref={assignMenuRef}
                className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] rounded-lg 
                           shadow-lg border border-gray-800/40 py-1 z-50"
              >
                {projectMembers?.map((member) => {
                  const memberUserId = member.userId?._id || member._id;
                  const isAssigned = task.assignedTo?.some(assigned => 
                    assigned._id === memberUserId || assigned === memberUserId
                  );
    
                  return (
                    <button
                      key={memberUserId}
                      onClick={() => handleAssignmentToggle(memberUserId)}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-[#232323] 
                             text-gray-300 flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        {member.userId?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1">{member.userId?.username}</span>
                      {isAssigned && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
    
          {/* More Options Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
    
          {/* More Options Menu */}
          {menuOpen && (
            <div 
              className="absolute right-0 mt-8 w-36 bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-800/40 py-1 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onEdit(task);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-[#232323] text-gray-300"
              >
                Edit Task
              </button>
              <button
                onClick={() => {
                  onDelete(task._id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600 border-t border-gray-100"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDetailsModal && (
          <TaskDetailsModal
            task={task}
            onClose={() => setShowDetailsModal(false)}
            projectMembers={projectMembers}
            onSubtaskToggle={handleSubtaskToggle}
          />
        )}
        
        {showFileListModal && (
  <FileListModal
    isOpen={showFileListModal} // Use showFileListModal instead of isFileListOpen
    onClose={() => setShowFileListModal(false)} // Match the state variable name
    files={files}
    taskId={task._id}
    projectId={task.projectId}
    onDelete={handleDeleteFile}
    currentUser={currentUser}
    isOwner={task?.createdBy === currentUser?._id}
    onUploadComplete={handleUploadComplete}
    onFilesUpdate={(updatedFiles) => {
      console.log('Files updated from FileListModal:', updatedFiles);
      setFiles(updatedFiles);
    }}
  />
        )}
        
        {isFileUploaderOpen && (
          <FileUploaderModal
            isOpen={isFileUploaderOpen}
            onClose={() => setIsFileUploaderOpen(false)}
            taskId={task._id}
            projectId={selectedProject._id}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

// Memoize the TaskControls component
const TaskControls = React.memo(({ sortBy, setSortBy, sortOrder, setSortOrder, filterPriority, setFilterPriority,filterUser, setFilterUser, projectMembers }) => (
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

    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Assigned to:</span>
      <select
        value={filterUser}
        onChange={(e) => setFilterUser(e.target.value)}
        className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
        style={{ minWidth: "120px" }}
      >
        <option value="all">All Users</option>
        {projectMembers?.map(member => (
          <option 
            key={member.userId?._id || member._id} 
            value={member.userId?._id || member._id}
          >
            {member.userId?.username || member?.username || "Unknown User"}
          </option>
        ))}
      </select>
    </div>
  </div>
));

// Add this helper function at the top of the file
const isAdmin = (currentUser, selectedProject) => {
  if (!currentUser || !selectedProject) return false;
  const member = selectedProject.members.find(m => m.userId?._id === currentUser._id);
  return member?.role === 'admin';
};

// Memoize the TaskFormModal component
const TaskFormModal = React.memo(({ onClose, initialData = null, handleCreateTask, handleUpdateTask, selectedProject }) => {
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

  const toggleMemberAssignment = useCallback((memberId) => {
    setFormData(prev => {
      const isCurrentlyAssigned = prev.assignedTo.includes(memberId);
      return {
        ...prev,
        assignedTo: isCurrentlyAssigned
          ? prev.assignedTo.filter(id => id !== memberId)
          : [...prev.assignedTo, memberId]
      };
    });
  }, []);

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
});

// Main component using React Query
const ProjectTasks = ({ 
  projectId, 
  canAssignTasks, 
  canBeAssigned, 
  currentUser, 
  projectMembers 
}) => {
  const { selectedProject } = useProjects();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState(null);
  const [filterUser, setFilterUser] = useState('all');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'performance'
  

  // Column configuration
  const columns = useMemo(() => [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'in_review', label: 'In Review' },
    { id: 'completed', label: 'Done' }
  ], []);

  // Fetch tasks with React Query
  const {
    data: tasks = [],
    isLoading,
    isError,
    error: tasksError
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await API.get(`/api/tasks?projectId=${projectId}`);
      console.log('Fetched tasks with assignments:', response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!projectId
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (formData) => {
      if (!isAdmin(currentUser, selectedProject)) {
        throw new Error('Only admins can create tasks');
      }
      const response = await API.post(`/api/tasks`, { 
        ...formData, 
        projectId 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      setShowTaskForm(false);
    },
    onError: (err) => {
      console.error('Error creating task:', err);
      setError('Failed to create task: ' + (err.message || 'Unknown error'));
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }) => {
      if (!isAdmin(currentUser, selectedProject)) {
        throw new Error('Only admins can edit tasks');
      }
      const response = await API.put(`/api/tasks/${taskId}`, updates);
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Update cache optimistically
      queryClient.setQueryData(['tasks', projectId], (oldData = []) => 
        oldData.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
      
      setShowTaskForm(false);
    },
    onError: (err) => {
      console.error('Error updating task:', err);
      setError('Failed to update task: ' + (err.message || 'Unknown error'));
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      if (!isAdmin(currentUser, selectedProject)) {
        throw new Error('Only admins can delete tasks');
      }
      await API.delete(`/api/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: (taskId) => {
      // Remove from cache optimistically
      queryClient.setQueryData(['tasks', projectId], (oldData = []) => 
        oldData.filter(task => task._id !== taskId)
      );
    },
    onError: (err) => {
      console.error('Error deleting task:', err);
      setError('Failed to delete task: ' + (err.message || 'Unknown error'));
    }
  });

  // Update task status mutation 
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      const response = await API.put(`/api/tasks/${taskId}`, { status: newStatus });
      return response.data;
    },
    onError: (err) => {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
      // Refresh data to restore correct state
      queryClient.invalidateQueries(['tasks', projectId]);
    }
  });

  // Assign users mutation
  const assignUsersMutation = useMutation({
    mutationFn: async ({ taskId, userIds }) => {
      const response = await API.put(`/api/tasks/${taskId}/assign`, { userIds });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Update cache optimistically
      queryClient.setQueryData(['tasks', projectId], (oldData = []) => 
        oldData.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
    },
    onError: (err) => {
      console.error('Error assigning users:', err);
      // Refresh data to restore correct state
      queryClient.invalidateQueries(['tasks', projectId]);
    }
  });

  // Unassign user mutation
  const unassignUserMutation = useMutation({
    mutationFn: async ({ taskId, userId }) => {
      const response = await API.put(`/api/tasks/${taskId}/unassign`, { userId });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Update cache optimistically
      queryClient.setQueryData(['tasks', projectId], (oldData = []) => 
        oldData.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
    },
    onError: (err) => {
      console.error('Error unassigning user:', err);
      // Refresh data to restore correct state
      queryClient.invalidateQueries(['tasks', projectId]);
    }
  });

  // Handle task operations with callback wrappers
  const handleCreateTask = useCallback((formData) => {
    createTaskMutation.mutate(formData);
  }, [createTaskMutation]);

  const handleUpdateTask = useCallback((taskId, updates) => {
    updateTaskMutation.mutate({ taskId, updates });
  }, [updateTaskMutation]);

  const handleDeleteTask = useCallback((taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  }, [deleteTaskMutation]);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  }, []);

  // Memoized functions for drag & drop
  const handleDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // Optimistically update local cache
    queryClient.setQueryData(['tasks', projectId], (oldData = []) =>
      oldData.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    // Update in the background
    updateTaskStatusMutation.mutate({ taskId, newStatus });
  }, [projectId, queryClient, updateTaskStatusMutation]);

  const handleAssignUsers = useCallback((taskId, userIds) => {
    return assignUsersMutation.mutateAsync({ taskId, userIds });
  }, [assignUsersMutation]);

  const handleUnassignUser = useCallback((taskId, userId) => {
    return unassignUserMutation.mutateAsync({ taskId, userId });
  }, [unassignUserMutation]);

  const handleTaskUpdate = useCallback((updatedTask) => {
    queryClient.setQueryData(['tasks', projectId], (oldData = []) =>
      oldData.map(task =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  }, [projectId, queryClient]);

  const handleTasksGenerated = useCallback(() => {
    queryClient.invalidateQueries(['tasks', projectId]);
  }, [projectId, queryClient]);

  // Sorting and filtering with useMemo
  const sortTasks = useCallback((taskList) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return sortOrder === 'asc' 
            ? new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
            : new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc'
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return sortOrder === 'asc'
            ? (a.progress || 0) - (b.progress || 0)
            : (b.progress || 0) - (a.progress || 0);
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [sortBy, sortOrder]);

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // Get filtered and sorted tasks (combined filtering and sorting)
  const getFilteredAndSortedTasks = useCallback(() => {
    let filtered = [...filteredTasks];
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(task => task.assignedTo?.some(userId => 
        userId === filterUser || userId._id === filterUser
      ))
    }
    
    return sortTasks(filtered);
  }, [filteredTasks, filterPriority, filterUser, sortTasks]);

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
      <div className="flex flex-col gap-2 bg-[#121212] rounded-lg p-4 
                       border border-gray-800/40">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800/40">
          <button
            onClick={() => setViewMode('board')}
            className={`px-4 py-3 font-medium text-sm ${
              viewMode === 'board'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Task Board
          </button>
          <button
            onClick={() => setViewMode('performance')}
            className={`px-4 py-3 font-medium text-sm ${
              viewMode === 'performance'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Performance Analytics
          </button>
        </div>

        {/* Existing search and filters */}
        <div className="flex justify-between items-center py-2 px-4">
          <div className="relative w-[49%]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] rounded-lg 
                         border border-gray-800/40 text-gray-200 
                         placeholder-gray-500 focus:outline-none 
                         focus:border-indigo-500/50 focus:ring-2 
                         focus:ring-indigo-500/20 transition-all"
            />
            <SearchIcon className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>
          <TaskControls 
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            filterUser={filterUser}
            setFilterUser={setFilterUser}
            projectMembers={projectMembers}
          />
          <GenerateAITasks 
            projectId={projectId}
            projectName={selectedProject?.name}
            projectDescription={selectedProject?.description}
            teamMembers={projectMembers}
            projectDeadline={selectedProject?.deadline}
            onTasksGenerated={handleTasksGenerated}
            className="px-4 py-2 bg-gradient-to-r from-gray-900 to-purple-900 text-white rounded-lg 
            hover:from-gray-800 hover:to-purple-800 transition-all duration-300 
            flex items-center gap-2 mr-2 shadow-md"
          />
        </div>
      </div>

      {/* Conditionally render task board or performance report */}
      {viewMode === 'performance' ? (
        <UserPerformanceReport 
          userId={filterUser}
          projectId={projectId}
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-[#121212] rounded-xl p-4 min-h-[calc(80vh-80px)] 
                        flex flex-col border border-gray-800/40 shadow-lg"
            >
              {/* Column Header with Task Count and Add Button */}
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#121212] z-10 pb-2 
                                border-b-2 border-gray-800/40">
                  <div className="flex items-center">
                    <h2 className="font-semibold text-gray-200">{column.label}</h2>
                    <span className="ml-2 px-2.5 py-0.5 bg-[#1A1A1A] rounded-full 
                               text-xs font-medium text-gray-300 
                               border border-gray-800/40">
                      {filteredTasks.filter(task => task.status === column.id).length}
                    </span>
                  </div>
                  
                  {/* Add Task Button - Moved to header */}
                  {isAdmin(currentUser, selectedProject) ? (
                    <button
                      onClick={() => {
                        setSelectedTask(null); // Set to null for new task
                        setShowTaskForm(true);
                        setFormData({ 
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
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {getFilteredAndSortedTasks()
                      .filter(task => task.status === column.id)
                      .map(task => (
                        <TaskCard 
                          key={task._id} 
                          task={task} 
                          onEdit={handleEditTask} 
                          onDelete={handleDeleteTask}
                          projectMembers={projectMembers}  // Add this prop
                          canAssignTasks={canAssignTasks}  // Add this prop
                          handleAssignUsers={handleAssignUsers}  // Add this prop
                          handleUnassignUser={handleUnassignUser}  // Add this prop
                          handleDragStart={handleDragStart}  // Add this prop
                          currentUser={currentUser}  // Add this prop
                          selectedProject={selectedProject}  // Add this prop
                          handleTaskUpdate={handleTaskUpdate}  // Add this prop
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
          handleCreateTask={handleCreateTask}  // Add this prop
          handleUpdateTask={handleUpdateTask}  // Add this prop
          selectedProject={selectedProject}  // Add this prop
        />
      )}
    </div>
  );
};

export default ProjectTasks;