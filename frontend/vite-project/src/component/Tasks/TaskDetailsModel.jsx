import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckSquare, Plus, FileText, Download, Trash2, Sparkles } from 'lucide-react';
import API from '../../api/api';
import FileUploaderModal from '../FileUpload/FileUploader';
import FileListModal from '../FileUpload/FileList'; // Import FileListModal component

// Admin permission helper function
const isAdmin = (currentUser, selectedProject) => {
  if (!currentUser || !selectedProject) return false;
  const member = selectedProject.members.find(m => m.userId?._id === currentUser._id);
  return member?.role === 'admin';
};

const TaskDetailsModal = ({ 
  task, 
  onClose, 
  projectMembers,
  onSubtaskToggle,
  currentUser,
  selectedProject
}) => {
  if (!task) return null;

  // Add state for files
  const [files, setFiles] = useState([]);
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fileError, setFileError] = useState(null);
  const [isFileListOpen, setIsFileListOpen] = useState(false); // Add state for FileListModal

  // Check if current user is admin
  const userIsAdmin = isAdmin(currentUser, selectedProject);
  
  // Check if user has permission to add files
  const canAddFiles = userIsAdmin || 
                     currentUser?.role === 'admin' ||
                     task.assignedTo?.some(id => 
                       id === currentUser?._id || id?._id === currentUser?._id
                     ) || 
                     task?.createdBy === currentUser?._id;

  // Add useEffect to fetch files
  useEffect(() => {
    if (task?._id) {
      fetchFiles();
    }
  }, [task?._id]);

  // Update the file fetching function to better handle file data
  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    setFileError(null);
    
    try {
      console.log(`Fetching files for task: ${task._id}`);
      const response = await API.get(`/api/tasks/${task._id}/files`);
      
      // Debug complete response
      console.log('Files API response:', response);
      console.log('Files response data:', response.data);
      
      // Handle different response formats
      let fetchedFiles = [];
      
      if (Array.isArray(response.data)) {
        fetchedFiles = response.data;
      } else if (response.data.files && Array.isArray(response.data.files)) {
        fetchedFiles = response.data.files;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        fetchedFiles = response.data.data;
      } else {
        console.warn('Unexpected files response format:', response.data);
        fetchedFiles = [];
      }
      
      // Log file details to debug property names
      if (fetchedFiles.length > 0) {
        console.log('First file properties:', Object.keys(fetchedFiles[0]));
        console.log('Sample file data:', fetchedFiles[0]);
      }
      
      console.log(`Found ${fetchedFiles.length} files`);
      
      // Process files to ensure they have standard property names
      const processedFiles = fetchedFiles.map(file => ({
        _id: file._id || file.id,
        name: file.name || file.fileName || file.filename || file.originalname || "Unnamed file",
        type: file.type || file.fileType || file.mimetype || file.contentType || "Unknown type",
        size: file.size || file.fileSize || 0,
        url: file.url || file.fileUrl || file.downloadUrl || `/api/files/${file._id || file.id}/download`,
        createdAt: file.createdAt || file.uploadedAt || file.created || new Date().toISOString(),
        uploadedBy: file.uploadedBy || file.userId || file.user,
        aiInsights: file.aiInsights || null,
        ...file // Keep all original properties too
      }));
      
      console.log('Processed files:', processedFiles);
      setFiles(processedFiles);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setFileError('Failed to load files. Please try again.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleUploadComplete = (file) => {
    console.log('File upload complete:', file);
    setFiles(prev => {
      // Make sure we don't add duplicates
      const exists = prev.some(f => f._id === file._id);
      if (exists) {
        return prev.map(f => f._id === file._id ? file : f);
      }
      return [...prev, file];
    });
    
    // Close the modal after successful upload
    setIsFileUploaderOpen(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await API.delete(`/api/files/${fileId}`);
      console.log(`File deleted: ${fileId}`);
      setFiles(prev => prev.filter(file => file._id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

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
                  <p className="text-gray-600 whitespace-pre-wrap">{task.description || 'No description provided'}</p>
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

                {/* Simplified Attachments Section - Click to Open FileListModal */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Attachments ({files?.length || 0})
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFileListOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View All
                      </button>
                      
                      {canAddFiles && (
                        <button
                          onClick={() => setIsFileUploaderOpen(true)}
                          className="flex items-center text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100"
                        >
                          <Plus size={16} className="mr-1" />
                          Add File
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Simple preview of attachments */}
                  {isLoadingFiles ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : fileError ? (
                    <div className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-md">
                      {fileError}
                    </div>
                  ) : files.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-sm">No attachments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Just show first 3 files as preview */}
                      {files.slice(0, 3).map(file => (
                        <div 
                          key={file._id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center overflow-hidden">
                            <FileText size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                            <p className="text-sm text-gray-800 truncate">
                              {file.name}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                          </span>
                        </div>
                      ))}
                      {files.length > 3 && (
                        <button 
                          onClick={() => setIsFileListOpen(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 w-full text-left pl-2"
                        >
                          + {files.length - 3} more files
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Meta Info */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                    {task.status?.replace('_', ' ') || 'Not set'}
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
                          key={member.userId?._id || userId}
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
                    {(!task.assignedTo || task.assignedTo.length === 0) && (
                      <p className="text-gray-500 text-sm italic">
                        No members assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* File uploader modal */}
          <AnimatePresence>
            {isFileUploaderOpen && (
              <FileUploaderModal
                isOpen={isFileUploaderOpen}
                onClose={() => setIsFileUploaderOpen(false)}
                taskId={task._id}
                projectId={task.projectId}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </AnimatePresence>

          {/* File list modal - your custom component */}
          <FileListModal
            isOpen={isFileListOpen}
            onClose={() => setIsFileListOpen(false)}
            files={files}
            taskId={task._id}
            projectId={task.projectId}
            onDelete={handleDeleteFile}
            currentUser={currentUser}
            isOwner={task?.createdBy === currentUser?._id}
            onUploadComplete={handleUploadComplete}
            onFilesUpdate={(updatedFiles) => setFiles(updatedFiles)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailsModal;