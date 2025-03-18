import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, LayoutGrid, List, Eye, Search, Calendar, Flag, Clock, ArrowUpRight, Tag, X, AlertTriangle, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import CreateProjectForm from './ProjectForm';
import EditProjectForm from './EditProjectForm';
import API from '../api/api';
// import { useAuth } from '../context/authContext';
// import TeamDeploymentModal from './Team/FastDeploy';

const Projects = () => {
  const { projects, loading, error, fetchProjects, deleteProject } = useProjects();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'zen'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        fetchProjects(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  // Filter projects based on search term and filters
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === '' || project.status === filterStatus;
      const matchesPriority = filterPriority === '' || project.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchTerm, filterStatus, filterPriority]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterPriority('');
  };

  return (
    <>
      <div className="col-span-full mb-4">
        {/* Search and filters bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2"
        >
          {/* Search box */}
          <div className="col-span-1 md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 w-full bg-gray-900/50 border border-white/10 focus:border-white/30 
                       rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="col-span-1 md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-900/50 border border-white/10 focus:border-white/30 
                       rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/20 
                       appearance-none hover:cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="col-span-1 md:col-span-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-gray-900/50 border border-white/10 focus:border-white/30 
                       rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/20 
                       appearance-none hover:cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* View mode toggle - Modified to include Zen view */}
          <div className="col-span-1 md:col-span-2 flex items-center">
            <div className="flex items-center p-2.5 bg-gray-900/50 rounded-xl border border-white/10 w-full justify-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors duration-200 flex-1 flex justify-center ${
                  viewMode === 'grid' 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Card Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors duration-200 flex-1 flex justify-center ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('zen')}
                className={`p-1.5 rounded-lg transition-colors duration-200 flex-1 flex justify-center ${
                  viewMode === 'zen' 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Zen Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 
                     text-black px-4 py-2 rounded-xl transition-all duration-300 shadow-lg
                     border border-white/20 font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New</span>
          </button>

          {/* Clear filters button - only show if any filter is applied */}
          {(searchTerm || filterStatus || filterPriority) && (
            <div className="col-span-1 md:col-span-1 flex justify-end">
              <button
                onClick={clearFilters}
                className="p-2 text-gray-400 hover:text-indigo-300 bg-gray-800/70 border border-indigo-500/30 
                         rounded-xl hover:bg-indigo-500/10 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="text-sm text-gray-400 mb-2">
          {loading ? 
            'Loading projects...' : 
            `Showing ${filteredProjects.length} of ${projects?.length || 0} projects`}
        </div>
      </div>

      {/* Loading and error states */}
      {loading ? (
        <div className="col-span-full flex justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-indigo-500" />
            <div className="text-gray-400">Loading your projects...</div>
          </div>
        </div>
      ) : error ? (
        <div className="col-span-full flex justify-center py-10">
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-400 px-6 py-4 rounded-xl max-w-lg text-center">
            <div className="font-medium mb-1">Error loading projects</div>
            <div className="text-sm">{error}</div>
            <button 
              onClick={fetchProjects}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm border border-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyProjectsState 
          hasProjects={projects?.length > 0} 
          hasFilters={searchTerm || filterStatus || filterPriority}
          onClearFilters={clearFilters}
          onCreateNew={() => setShowNewProjectModal(true)} 
        />
      ) : viewMode === 'grid' ? (
        <AnimatePresence>
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        </AnimatePresence>
      ) : viewMode === 'list' ? (
        <div className="col-span-full">
          <ProjectList
            projects={filteredProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </div>
      ) : (
        // Zen Grid View
        <AnimatePresence>
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ZenProjectCard
                key={project._id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Modals */}
      {showNewProjectModal && (
        <CreateProjectForm 
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            setShowNewProjectModal(false);
            fetchProjects();
          }}
        />
      )}

      {editingProject && (
        <EditProjectForm
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null);
            fetchProjects();
          }}
        />
      )}
    </>
  );
};

// ZenProjectCard Component - Image-focused card with separate content section
const ZenProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const {fetchProjects} = useProjects();
  
  // Default project image if none provided
  const projectImage = project.image || 'https://images.unsplash.com/photo-1598350740831-b360a3283b24?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  
  // Handle image upload
  const handleImageUpload = async (e) => {
    e.stopPropagation(); // Prevent navigation
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('projectId', project._id);
      
      // Send to backend
    const response = await API.post('/api/projects/upload-image', formData, {
      headers: {
        // No Content-Type needed, axios will set it automatically with proper boundary for FormData
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Axios returns data directly in the response object
    if (response.data && response.data.success) {
      
      fetchProjects(); 
      alert('Image uploaded successfully!');
    } else {
      throw new Error('Failed to upload image');
    }
      
      alert('Image uploaded successfully!');
      
      // Refresh project data
      // window.location.reload(); // Quick solution, ideally use context refresh method
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Calculate progress
  const getProgressPercentage = () => {
    if (project.progress !== undefined) {
      const progress = typeof project.progress === 'number' ? project.progress : 0;
      return progress > 1 ? progress : progress * 100;
    }
    
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 50;
    return 0;
  };
  
  const progressPercent = getProgressPercentage();
  
  // Priority colors
  const getPriorityColor = () => {
    switch(project.priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default: return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
  };
  console.log(project.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-b from-gray-900/80 to-black rounded-xl overflow-hidden 
                shadow-xl hover:shadow-2xl transition-all duration-300 h-[250px] 
                flex flex-col group border border-white/10"
    >
      {/* Image section - 50% height with relative position for overlays */}
      <div className="relative h-[60%]">
        <img 
          src={projectImage} 
          alt={project.name || 'Project'}
          className="w-full h-full object-cover object-center opacity-80"
          onClick={() => navigate(`/project/${project._id}`)}
        />
        
        {/* Add image upload button on hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             onClick={(e) => e.stopPropagation()}>
          <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 
                         rounded-lg text-white text-xs flex items-center gap-1 shadow-lg">
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Change Image</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
        
        {/* Priority badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                        backdrop-blur-sm ${getPriorityColor()}`}>
            {project.priority || 'Low'}
          </span>
        </div>
        
        {/* Action buttons, only visible on hover */}
        <div className="absolute top-4 right-4 flex space-x-1 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-200 hover:bg-purple-600/80 transition-all"
            title="Edit Project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project._id);
            }}
            className="p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-200 hover:bg-red-600/80 transition-all"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Text content section - 50% height */}
      <div 
        className="p-1 pl-2 pt-0 flex flex-col h-[40%] border-t border-white/10 
                    bg-gradient-to-b from-gray-900 to-black"
        onClick={() => navigate(`/project/${project._id}`)}
      >
        {/* Project title */}
        <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">{project.name}</h3>
        
        {/* Project description */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-auto">{project.description}</p>
        
        {/* View button */}
        <div className="mt-0 flex justify-between items-center gap-2">
           <div className="flex justify-between items-center mt-2">
             <div className="flex items-center gap-1.5 text-gray-400 text-xs">
               <Clock className="w-3.5 h-3.5" />
               <span>{formatDate(project.deadline)}</span>
             </div>
           </div>

          <button 
            onClick={() => navigate(`/project/${project._id}`)}
            className="flex items-center gap-1 text-white bg-indigo-600/70 hover:bg-indigo-600 transition-colors px-3 py-1 rounded-lg text-xs"
          >
            
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Empty projects state component
const EmptyProjectsState = ({ hasProjects, hasFilters, onClearFilters, onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex justify-center py-10"
    >
      <div className="bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-8 max-w-lg text-center">
        {hasProjects && hasFilters ? (
          <>
            <Search className="w-12 h-12 text-indigo-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No matching projects</h3>
            <p className="text-gray-400 mb-6">We couldn't find any projects matching your current filters.</p>
            <button
              onClick={onClearFilters}
              className="px-6 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-all duration-300"
            >
              Clear Filters
            </button>
          </>
        ) : (
          <>
            <PlusCircle className="w-12 h-12 text-indigo-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first project.</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-all duration-300"
            >
              Create First Project
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Also enhance the list view to use progress data
const ProjectList = ({ projects, onEdit, onDelete }) => {
  const navigate = useNavigate();

  // Use actual progress from project data
  const getProgressPercentage = (project) => {
    if (project.progress !== undefined) {
      const progress = typeof project.progress === 'number' ? project.progress : 0;
      return progress >= 1 ? progress : progress * 100; 
    }
    
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 50;
    return 0;
  };

  return (
    <div className="bg-black backdrop-blur-md rounded-xl border border-[#333333] overflow-hidden shadow-lg">
      <div className="overflow-hidden">
        {/* Header Section with refined styling */}
        <div className="bg-gray-900 rounded-t-xl w-full backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-3 px-6 py-4">
            <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Name</div>
            <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Description</div>
            <div className="col-span-1 text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</div>
            <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Progress</div>
            <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Deadline</div>
            <div className="col-span-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</div>
          </div>
        </div>

        {/* Project List with alternating row colors */}
        <div>
          <AnimatePresence>
            {projects.map((project, index) => {
              const progressPercent = getProgressPercentage(project);
              
              return (
                <motion.div 
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-[#333333] ${
                    index % 2 === 0 ? 'bg-black' : 'bg-black/50'
                  } hover:bg-white/5 transition-all duration-300`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center px-6 py-4">
                    {/* Name */}
                    <div className="col-span-3 text-base font-medium text-gray-200 truncate">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-white/70" />
                        {project.name}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="col-span-3 text-gray-400 truncate max-w-xs text-sm">
                      {project.description}
                    </div>
                    
                    {/* Priority Badge */}
                    <div className="col-span-1">
                      <span className={`px-3 py-1.5 inline-flex items-center gap-1 rounded-full text-xs font-medium shadow-sm ${
                        project.priority === 'high' 
                          ? 'bg-red-500/10 text-red-300 border border-red-500/20' 
                          : project.priority === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                          : 'bg-green-500/10 text-green-300 border border-green-500/20'
                      }`}>
                        <Flag className="w-3 h-3" />
                        {project.priority}
                      </span>
                    </div>
                    
                    {/* Progress with bar */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[#2A2A2A] rounded-full h-1.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-white"
                          ></motion.div>
                        </div>
                        <span className="text-xs text-gray-300 font-medium w-8">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Deadline */}
                    <div className="col-span-2 text-gray-400 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/50" />
                      {formatDate(project.deadline)}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="col-span-1 flex justify-end space-x-1">
                      <button 
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="p-2 text-gray-400 hover:text-white transition-all duration-300
                                hover:bg-white/10 rounded-lg"
                        title="View Project"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(project)}
                        className="p-2 text-gray-400 hover:text-white transition-all duration-300
                                hover:bg-white/10 rounded-lg"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(project._id)}
                        className="p-2 text-gray-400 hover:text-red-300 transition-all duration-300
                                hover:bg-red-500/10 rounded-lg"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ProjectCard Component with actual progress data
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleViewProject = () => {
    if (project?._id) {
      navigate(`/project/${project._id}`);
    }
  };

  // Use actual progress from project data (ensure it's a number between 0-100)
  const getProgressPercentage = () => {
    // If progress is provided as a decimal (0-1), convert to percentage
    if (project.progress !== undefined) {
      const progress = typeof project.progress === 'number' ? project.progress : 0;
      // Check if the progress is already in percentage (0-100) or needs conversion from decimal (0-1)
      return progress > 1 ? progress : progress * 100;
    }
    
    // Fallback to status-based estimation if no progress value
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 50;
    return 0;
  };
  
  // Calculate days remaining until deadline
  const getDaysRemaining = () => {
    if (!project.deadline) return null;
    
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  const progressPercent = getProgressPercentage();
  
  // Determine if project is behind schedule (simple heuristic)
  const isLateOrAtRisk = () => {
    if (daysRemaining === null) return false;
    
    // If deadline is past
    if (daysRemaining < 0) return true;
    
    // If more than 70% of time has passed but less than 50% progress made
    if (daysRemaining <= 7 && progressPercent < 50) return true;
    
    return false;
  };
  
  const getDeadlineStatusColor = () => {
    if (daysRemaining === null) return 'text-gray-400';
    if (daysRemaining < 0) return 'text-red-400';
    if (daysRemaining <= 3) return 'text-orange-400';
    if (daysRemaining <= 7) return 'text-yellow-400';
    return 'text-gray-400';
  };

  // Update card colors and gradients
  const cardClasses = {
    base: `bg-gray-1000 opacity-80 rounded-xl 
           border border-[#292929] overflow-hidden shadow-lg backdrop-blur-sm 
           hover:border-white/10 transition-all duration-300`,
    text: {
      primary: 'text-[#E0E0E0]',
      secondary: 'text-[#B3B3B3]'
    },
    hover: 'hover:bg-[#1E1E1E]',
    button: 'bg-white/5 hover:bg-white/10 text-[#E0E0E0]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className={`${cardClasses.base} relative group`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Priority indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full`} />
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-semibold ${cardClasses.text.primary} truncate`}>{project.name}</h3>
          
          {/* Action buttons */}
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(project)}
              className={`p-1.5 ${cardClasses.button} hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all`}
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(project._id)}
              className={`p-1.5 ml-1 ${cardClasses.button} hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all`}
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className={`${cardClasses.text.secondary} text-sm mb-4 line-clamp-2`}>{project.description}</p>
        
        {/* Progress section with percentage display */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Progress</span>
          <span className={`text-xs font-medium ${
            progressPercent >= 75 ? 'text-green-400' : 
            progressPercent >= 30 ? 'text-blue-400' : 
            'text-yellow-400'
          }`}>{Math.round(progressPercent)}%</span>
        </div>
        
        {/* Progress bar with animation */}
        <div className="w-full h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              progressPercent >= 75 ? 'bg-white' :
              progressPercent >= 30 ? 'bg-gray-300' :
              isLateOrAtRisk() ? 'bg-red-500' : 'bg-gray-400'
            }`}
          ></motion.div>
        </div>

        {/* Project details with improved display */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className={`flex items-center gap-1.5 ${getDeadlineStatusColor()}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(project.deadline)}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-gray-400">
            <Flag className="w-3.5 h-3.5" />
            <span className="capitalize">{project.priority}</span>
          </div>
        </div>

        {/* Status badge and View button */}
        <div className="flex items-center justify-between mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}>
            {formatStatus(project.status)}
          </span>
          
          <button 
            onClick={handleViewProject}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="text-sm">View</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Display warning badge for at-risk projects */}
        {isLateOrAtRisk() && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30" title="Project at risk">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper functions
const formatStatus = (status) => {
  if (!status) return 'Not Started';
  return status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const formatDate = (dateString) => {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Additional icons
const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const CircleDotIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default Projects;