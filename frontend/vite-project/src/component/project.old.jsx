import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, LayoutGrid, List, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import CreateProjectForm from './ProjectForm';
import EditProjectForm from './EditProjectForm';

const Projects = () => {
  const { projects, loading, error, fetchProjects, deleteProject } = useProjects();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
  console.log(projects)
//   console.log(projects[0]._id)

  return (
    <>
      <div className="col-span-full flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-200">Your Projects</h2>
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-purple-400'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-purple-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="col-span-full flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : error ? (
        <div className="col-span-full text-red-400 text-center">{error}</div>
      ) : viewMode === 'grid' ? (
        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full">
          <ProjectList
            projects={projects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </div>
      )}

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

// Update the ProjectList component styling
const ProjectList = ({ projects, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden p-6 shadow-lg">
      <div className="overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-700/50 to-purple-700/30 rounded-xl mb-6 w-full backdrop-blur-sm">
          <div className="grid grid-cols-6 px-6 py-4">
            {["Name", "Description", "Priority", "Status", "Deadline", "Actions"].map((header, index) => (
              <div 
                key={header}
                className={`${
                  index === 5 ? 'text-right' : 'text-left'
                } text-xs font-medium text-gray-300 uppercase tracking-wider`}
              >
                {header}
              </div>
            ))}
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          {projects.map((project) => (
            <motion.div 
              key={project._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-300 
                        border border-transparent hover:border-purple-500/20 hover:shadow-lg"
            >
              <div className="grid grid-cols-6 items-center px-6 py-4">
                {/* Name */}
                <div className="whitespace-nowrap text-base font-medium text-gray-200">
                  {project.name}
                </div>
                
                {/* Description */}
                <div className="text-gray-400 truncate max-w-xs text-sm">
                  {project.description}
                </div>
                
                {/* Priority Badge */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    project.priority === 'high' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : project.priority === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {project.priority}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    project.status === 'completed'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : project.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                {/* Deadline */}
                <div className="text-gray-400 text-sm">
                  {new Date(project.deadline).toLocaleDateString()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => {
                      console.log('Navigating to project:', project._id); // Debug log
                      navigate(`/project/${project._id}`);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(project)}
                    className="p-2 text-gray-400 hover:text-purple-400 transition-all duration-300
                             hover:bg-purple-500/10 rounded-lg border border-transparent
                             hover:border-purple-500/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(project._id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300
                             hover:bg-red-500/10 rounded-lg border border-transparent
                             hover:border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ProjectCard Component
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleViewProject = (e) => {
    e.preventDefault();
    if (project?._id) {
      navigate(`/project/${project._id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl border border-purple-500/20 p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-200">{project.name}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleViewProject}
            className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-300
                     hover:bg-blue-500/10 rounded-lg border border-transparent
                     hover:border-blue-500/20"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEdit(project)}
            className="text-gray-400 hover:text-purple-400"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(project._id)}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-gray-400 mb-4">{project.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className={`px-2 py-1 rounded-full ${
          project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {project.status}
        </span>
        <span className="text-gray-400">
          Due: {new Date(project.deadline).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

export default Projects;