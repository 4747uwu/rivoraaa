import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api/api';
import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  QueryClient, 
  QueryClientProvider 
} from '@tanstack/react-query';

const TeamContext = createContext();
const BASE_URL = '/api/teams';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    },
  },
});

// Wrapper component for QueryClientProvider
export const TeamQueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamProvider>{children}</TeamProvider>
    </QueryClientProvider>
  );
};

export const TeamProvider = ({ children }) => {
  // Loading states (we'll still keep these for backward compatibility)
  const [isLoadingCreateTeam, setIsLoadingCreateTeam] = useState(false);
  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);
  const [isLoadingDeleteTeam, setIsLoadingDeleteTeam] = useState(false);
  const [isLoadingAddMember, setIsLoadingAddMember] = useState(false);
  const [isLoadingUpdateMember, setIsLoadingUpdateMember] = useState(false);
  const [isLoadingRemoveMember, setIsLoadingRemoveMember] = useState(false);
  const [isLoadingLeaveTeam, setIsLoadingLeaveTeam] = useState(false);
  
  // Get the query client for mutations
  const queryClient = useQueryClient();

  // ===== DATA FETCHING FUNCTIONS (WITH REACT QUERY HOOKS) =====

  /**
   * Get all teams for current user
   */
  const getMyTeams = async (page = 1, limit = 10) => {
    try {
      const response = await API.get(`${BASE_URL}`, { 
        params: { page, limit } 
      });
      const data = response.data;
      console.log(data);
      
      return {
        ownedTeams: data?.ownedTeams || { count: 0, data: [], pagination: {} },
        memberTeams: data?.memberTeams || { count: 0, data: [], pagination: {} },
        loading: false,
        error: null
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load your teams");
      return {
        ownedTeams: { count: 0, data: [], pagination: {} },
        memberTeams: { count: 0, data: [], pagination: {} },
        loading: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  /**
   * Get a single team by ID
   */
  const getTeam = async (teamId) => {
    try {
      const response = await API.get(`${BASE_URL}/${teamId}`);
      const data = response.data;
      console.log("This ran 1")
      
      return {
        team: data?.data || null,
        loading: false,
        error: null
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load team");
      return {
        team: null,
        loading: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  /**
   * Get available connections for team
   */
  const getAvailableConnections = async (teamId, search = '') => {
    try {
      const response = await API.get(`${BASE_URL}/${teamId}/available-connections`, {
        params: { search }
      });
      const data = response.data;
      
      return {
        connections: data?.data || [],
        count: data?.count || 0,
        loading: false,
        error: null
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load available connections");
      return {
        connections: [],
        count: 0,
        loading: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  // ===== MUTATION FUNCTIONS (WITH REACT QUERY HOOKS) =====

  /**
   * Create a new team
   */
  const createTeam = async (teamData) => {
    try {
      setIsLoadingCreateTeam(true);
      const response = await API.post(`${BASE_URL}`, teamData);
      
      // Invalidate and refetch teams list
      queryClient.invalidateQueries(['myTeams']);
      
      toast.success(response.data.message || "Team created successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team");
      throw error;
    } finally {
      setIsLoadingCreateTeam(false);
    }
  };

  /**
   * Update a team
   */
  const updateTeam = async (teamId, teamData) => {
    try {
      setIsLoadingUpdateTeam(true);
      const response = await API.put(`${BASE_URL}/${teamId}`, teamData);
      
      // Update cache for this team and invalidate teams list
      queryClient.invalidateQueries(['team', teamId]);
      queryClient.invalidateQueries(['myTeams']);
      
      toast.success(response.data.message || "Team updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update team");
      throw error;
    } finally {
      setIsLoadingUpdateTeam(false);
    }
  };

  /**
   * Delete a team
   */
  const deleteTeam = async (teamId) => {
    try {
      setIsLoadingDeleteTeam(true);
      const response = await API.delete(`${BASE_URL}/${teamId}`);
      
      // Remove from cache and invalidate teams list
      queryClient.removeQueries(['team', teamId]);
      queryClient.invalidateQueries(['myTeams']);
      
      toast.success(response.data.message || "Team deleted successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete team");
      throw error;
    } finally {
      setIsLoadingDeleteTeam(false);
    }
  };

  /**
   * Add a member to a team
   */
  const addTeamMember = async (teamId, memberId, role, permissions = []) => {
    try {
      setIsLoadingAddMember(true);
      const response = await API.post(`${BASE_URL}/${teamId}/members`, { 
        memberId, role, permissions 
      });
      
      // Update team data
      queryClient.invalidateQueries(['team', teamId]);
      queryClient.invalidateQueries(['availableConnections', teamId]);
      
      toast.success(response.data.message || "Member added successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
      throw error;
    } finally {
      setIsLoadingAddMember(false);
    }
  };

  /**
   * Update a team member's role or permissions
   */
  const updateTeamMember = async (teamId, memberId, updates) => {
    try {
      setIsLoadingUpdateMember(true);
      const response = await API.put(`${BASE_URL}/${teamId}/members/${memberId}`, updates);
      
      // Update team data
      queryClient.invalidateQueries(['team', teamId]);
      
      toast.success(response.data.message || "Member updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member");
      throw error;
    } finally {
      setIsLoadingUpdateMember(false);
    }
  };

  /**
   * Remove a member from a team
   */
  const removeTeamMember = async (teamId, memberId) => {
    try {
      setIsLoadingRemoveMember(true);
      
      // Optimistic update - remove member locally first
      const previousTeam = queryClient.getQueryData(['team', teamId]);
      if (previousTeam) {
        // Update team cache optimistically
        queryClient.setQueryData(['team', teamId], old => ({
          ...old,
          team: {
            ...old.team,
            members: old.team.members.filter(m => m.user._id !== memberId)
          }
        }));
      }
      
      const response = await API.delete(`${BASE_URL}/${teamId}/members/${memberId}`);
      
      // In case of success, invalidate available connections too
      queryClient.invalidateQueries(['team', teamId]);
      queryClient.invalidateQueries(['availableConnections', teamId]);
      
      toast.success(response.data.message || "Member removed successfully");
      return response.data;
    } catch (error) {
      // Revert optimistic update on error
      if (previousTeam) {
        queryClient.setQueryData(['team', teamId], previousTeam);
      }
      
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    } finally {
      setIsLoadingRemoveMember(false);
    }
  };

  /**
   * Leave a team
   */
  const leaveTeam = async (teamId) => {
    try {
      setIsLoadingLeaveTeam(true);
      const response = await API.delete(`${BASE_URL}/${teamId}/leave`);
      
      // Update caches
      queryClient.removeQueries(['team', teamId]);
      queryClient.invalidateQueries(['myTeams']);
      
      toast.success(response.data.message || "You left the team successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave team");
      throw error;
    } finally {
      setIsLoadingLeaveTeam(false);
    }
  };

  // React Query custom hooks for components to use
  const useMyTeams = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['myTeams', page, limit],
      queryFn: () => getMyTeams(page, limit),
      keepPreviousData: true
    });
  };

  const useTeamDetails = (teamId) => {
    return useQuery({
      queryKey: ['team', teamId], 
      queryFn: () => getTeam(teamId),
      enabled: !!teamId,
      staleTime: 1000 * 60
    });
  };

  const useAvailableConnections = (teamId, search = '') => {
    return useQuery({
      queryKey: ['availableConnections', teamId, search],
      queryFn: () => getAvailableConnections(teamId, search),
      enabled: !!teamId,
      staleTime: search ? 0 : 1000 * 60 * 5 // No stale time for searches
    });
  };

  // Mutation hooks
  const useCreateTeam = () => {
    return useMutation({
      mutationFn: createTeam,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myTeams'] });
      }
    });
  };

  const useUpdateTeam = (teamId) => {
    return useMutation({
      mutationFn: (teamData) => updateTeam(teamId, teamData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      }
    });
  };

  const useDeleteTeam = () => {
    return useMutation({
      mutationFn: deleteTeam,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myTeams'] });
      }
    });
  };

  const useAddTeamMember = (teamId) => {
    return useMutation({
      mutationFn: ({ memberId, role, permissions }) => 
        addTeamMember(teamId, memberId, role, permissions),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['availableConnections', teamId] });
      }
    });
  };

  const useUpdateTeamMember = (teamId) => {
    return useMutation({
      mutationFn: ({ memberId, ...updates }) => updateTeamMember(teamId, memberId, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      }
    });
  };

  const useRemoveTeamMember = (teamId) => {
    return useMutation({
      mutationFn: (memberId) => removeTeamMember(teamId, memberId),
      onMutate: async (memberId) => {
        await queryClient.cancelQueries({ queryKey: ['team', teamId] });
        const previousData = queryClient.getQueryData(['team', teamId]);
        
        if (previousData) {
          queryClient.setQueryData(['team', teamId], old => ({
            ...old,
            team: {
              ...old.team,
              members: old.team.members.filter(m => m.user._id !== memberId)
            }
          }));
        }
        
        return { previousData };
      },
      onError: (err, memberId, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(['team', teamId], context.previousData);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['availableConnections', teamId] });
      }
    });
  };

  const useLeaveTeam = () => {
    return useMutation({
      mutationFn: leaveTeam,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myTeams'] });
      }
    });
  };

  const contextValue = {
    // Original query functions (preserved for compatibility)
    getMyTeams,
    getTeam,
    getAvailableConnections,
    
    // Original action methods (preserved for compatibility)
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    leaveTeam,
    
    // React Query hooks (new)
    useMyTeams,
    useTeamDetails,
    useAvailableConnections,
    useCreateTeam,
    useUpdateTeam,
    useDeleteTeam,
    useAddTeamMember,
    useUpdateTeamMember,
    useRemoveTeamMember,
    useLeaveTeam,
    
    // Loading states
    isLoadingCreateTeam,
    isLoadingUpdateTeam,
    isLoadingDeleteTeam,
    isLoadingAddMember,
    isLoadingUpdateMember,
    isLoadingRemoveMember,
    isLoadingLeaveTeam
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;