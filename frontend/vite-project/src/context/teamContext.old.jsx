import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api/api';

const TeamContext = createContext();
const BASE_URL = '/api/teams';

export const TeamProvider = ({ children }) => {
  // Loading states
  const [isLoadingCreateTeam, setIsLoadingCreateTeam] = useState(false);
  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);
  const [isLoadingDeleteTeam, setIsLoadingDeleteTeam] = useState(false);
  const [isLoadingAddMember, setIsLoadingAddMember] = useState(false);
  const [isLoadingUpdateMember, setIsLoadingUpdateMember] = useState(false);
  const [isLoadingRemoveMember, setIsLoadingRemoveMember] = useState(false);
  const [isLoadingLeaveTeam, setIsLoadingLeaveTeam] = useState(false);

  // ===== DATA FETCHING FUNCTIONS =====

  /**
   * Get all teams for current user
   */
  const getMyTeams = async (page = 1, limit = 10) => {
    try {
      const response = await API.get(`${BASE_URL}`, { 
        params: { page, limit } 
      });
      const data = response.data;
      
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
      console.log(data);
      
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

  // ===== MUTATION FUNCTIONS =====

  /**
   * Create a new team
   */
  const createTeam = async (teamData) => {
    try {
      setIsLoadingCreateTeam(true);
      const response = await API.post(`${BASE_URL}`, teamData);
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
  const updateTeamMember = async (teamId, memberId, role, permissions) => {
    try {
      setIsLoadingUpdateMember(true);
      const response = await API.put(`${BASE_URL}/${teamId}/members/${memberId}`, { 
        role, permissions 
      });
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
      const response = await API.delete(`${BASE_URL}/${teamId}/members/${memberId}`);
      toast.success(response.data.message || "Member removed successfully");
      return response.data;
    } catch (error) {
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
      toast.success(response.data.message || "You left the team successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave team");
      throw error;
    } finally {
      setIsLoadingLeaveTeam(false);
    }
  };

  const contextValue = {
    // Query functions
    getMyTeams,
    getTeam,
    getAvailableConnections,
    
    // Action methods
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    leaveTeam,
    
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