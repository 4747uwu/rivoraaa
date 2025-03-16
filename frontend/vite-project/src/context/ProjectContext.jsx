import React, { createContext, useContext, useState } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryClient,
  QueryClientProvider 
} from '@tanstack/react-query';
import API from '../api/api';
import { useAuth } from './authContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState(null);
  const {user} = useAuth();


  // Fetch all projects query
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
    refetch
  } = useQuery({
    queryKey: ['projects', user?._id],
    queryFn: async () => {
      const response = await API.get('/api/projects');
      console.log('Projects fetched:', response.data.projects);
      return response.data.projects;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?._id,
  });

  // Create compatible fetchProjects function matching original API
  const fetchProjects = async () => {
    try {
      const data = await refetch();
      return data.data;
    } catch (err) {
      console.error('Failed to fetch projects', err);
      throw err;
    }
  };

  // Create compatible fetchProjectById function matching original API
  const fetchProjectById = async (projectId) => {
    if (!projectId) return null;
    
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
          const response = await API.get(`/api/projects/${projectId}`);
          const project = response.data.project;
          
          if (!project) {
            throw new Error('Project not found');
          }
          return project;
        },
      });
      
      // Set selected project to maintain compatibility
      setSelectedProject(data);
      return data;
    } catch (error) {
      console.error('Error fetching project by id', error);
      throw error;
    }
  };

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      console.log('Creating project:', projectData);
      const response = await API.post('/api/projects', projectData, {
        headers: { 
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data.project;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.setQueryData(['projects'], (oldData = []) => [...oldData, newProject]);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updateData }) => {
      const response = await API.put(`/api/projects/${projectId}`, updateData);
      return response.data.project;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries(['project', updatedProject._id]);
      queryClient.setQueryData(['projects'], (oldData = []) => 
        oldData.map(p => p._id === updatedProject._id ? updatedProject : p)
      );
      
      // Update selectedProject if it's the one being updated
      if (selectedProject && selectedProject._id === updatedProject._id) {
        setSelectedProject(updatedProject);
      }
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      await API.delete(`/api/projects/${projectId}`, {
        withCredentials: true
      });
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.removeQueries(['project', projectId]);
      queryClient.setQueryData(['projects'], (oldData = []) => 
        oldData.filter(p => p._id !== projectId)
      );
      
      // Clear selectedProject if it's the one being deleted
      if (selectedProject && selectedProject._id === projectId) {
        setSelectedProject(null);
      }
    },
  });

  // Create compatible API functions with original signatures
  const createProject = async (projectData) => {
    return await createProjectMutation.mutateAsync(projectData);
  };

  const updateProject = async (projectId, updateData) => {
    return await updateProjectMutation.mutateAsync({ projectId, updateData });
  };

  const deleteProject = async (projectId) => {
    return await deleteProjectMutation.mutateAsync(projectId);
  };

  return (
    <ProjectContext.Provider value={{
      // Original API properties and functions
      projects,
      loading: projectsLoading || createProjectMutation.isPending || 
               updateProjectMutation.isPending || deleteProjectMutation.isPending,
      error: projectsError,
      selectedProject,
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

// Create this wrapper component to provide QueryClient
export const ProjectQueryProvider = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes
        enabled: false, 
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>{children}</ProjectProvider>
    </QueryClientProvider>
  );
};