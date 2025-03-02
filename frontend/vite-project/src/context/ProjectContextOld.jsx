import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../api/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/projects');
      console.log('Projects fetched:', response.data.projects);
      setProjects(response.data.projects);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (projectId) => {
    if (!projectId) return null;
    
    try {
      setLoading(true);
      const response = await API.get(`/api/projects/${projectId}`);
      const project = response.data.project;
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Set the project state
      setSelectedProject(project);
      
      // Return the project data
      return project;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData) => {
    try {
      setLoading(true);
      const response = await API.post('/api/projects', projectData, {
        headers: { 
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setProjects(prev => [...prev, response.data.project]);
      return response.data.project;
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.response?.data?.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId, updateData) => {
    try {
      setLoading(true);
      const response = await API.put(`/api/projects/${projectId}`, updateData);
      setProjects(prev => 
        prev.map(p => p._id === projectId ? response.data.project : p)
      );
      return response.data.project;
    } catch (err) {
      setError('Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      await API.delete(`/api/projects/${projectId}`, {
        withCredentials: true
      });
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      setError('Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      console.log('Selected Project Updated:', selectedProject);
    }
  }, [selectedProject]);

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      error,
      selectedProject, // Add this
      fetchProjects,
      fetchProjectById,
      createProject,
      updateProject,
      deleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);


