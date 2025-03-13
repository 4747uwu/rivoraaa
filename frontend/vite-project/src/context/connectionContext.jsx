import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api/api';

const ConnectionContext = createContext();
const BASE_URL = '/api/connections';

export const ConnectionProvider = ({ children }) => {
  // Loading states
  const [isLoadingSendLinkUp, setIsLoadingSendLinkUp] = useState(false);
  const [isLoadingAcceptLinkUp, setIsLoadingAcceptLinkUp] = useState(false);
  const [isLoadingRejectLinkUp, setIsLoadingRejectLinkUp] = useState(false);
  const [isLoadingRemoveLinkUp, setIsLoadingRemoveLinkUp] = useState(false);

  // ===== DATA FETCHING FUNCTIONS =====

  /**
   * Get all LinkUps for the current user
   */
  const getLinkUps = async (page = 1, limit = 10) => {
    try {
      const response = await API.get(`${BASE_URL}/linkups`, { 
        params: { page, limit } 
      });
      const data = response.data;
      
      return {
        linkUps: {
          data: data?.linkUps || [],
          count: data?.count || 0,
          currentPage: data?.currentPage || page,
          totalPages: data?.totalPages || 1,
          loading: false,
          error: null
        }
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load your LinkUps");
      return {
        linkUps: {
          data: [],
          count: 0,
          currentPage: page,
          totalPages: 1,
          loading: false,
          error: error.response?.data?.message || error.message
        }
      };
    }
  };

  /**
   * Get pending LinkUp requests
   */
  const getPendingLinkUps = async () => {
    try {
      const response = await API.get(`${BASE_URL}/linkup/pending`);
      const data = response.data;
      
      return {
        pendingLinkUps: {
          sent: data?.sent || [],
          received: data?.received || [],
          loading: false,
          error: null
        }
      };
    } catch (error) {
      console.error('Error fetching pending LinkUps:', error);
      toast.error(error.response?.data?.message || "Failed to load pending requests");
      return {
        pendingLinkUps: {
          sent: [],
          received: [],
          loading: false,
          error: error.response?.data?.message || error.message
        }
      };
    }
  };

  /**
   * Get LinkUp count for a user
   */
  const getLinkUpCount = async (userId = null) => {
    try {
      const url = userId ? `${BASE_URL}/linkup/count/${userId}` : `${BASE_URL}/linkup/count`;
      const response = await API.get(url);
      
      return {
        count: response.data?.count || 0,
        loading: false,
        error: null
      };
    } catch (error) {
      console.error('Error getting LinkUp count:', error);
      return {
        count: 0,
        loading: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  // ===== MUTATION FUNCTIONS =====

  /**
   * Send a LinkUp request
   */
  const sendLinkUp = async (userId, message = '') => {
    try {
      setIsLoadingSendLinkUp(true);
      const response = await API.post(`${BASE_URL}/linkup`, { userId, message });
      toast.success(response.data.message || "LinkUp request sent");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send LinkUp request");
      throw error;
    } finally {
      setIsLoadingSendLinkUp(false);
    }
  };

  /**
   * Accept a LinkUp request
   */
  const acceptLinkUp = async (connectionId) => {
    try {
      setIsLoadingAcceptLinkUp(true);
      const response = await API.put(`${BASE_URL}/linkup/accept/${connectionId}`);
      toast.success(response.data.message || "LinkUp request accepted");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept LinkUp request");
      throw error;
    } finally {
      setIsLoadingAcceptLinkUp(false);
    }
  };

  /**
   * Reject a LinkUp request
   */
  const rejectLinkUp = async (connectionId) => {
    try {
      setIsLoadingRejectLinkUp(true);
      const response = await API.put(`${BASE_URL}/linkup/reject/${connectionId}`);
      toast.success(response.data.message || "LinkUp request rejected");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject LinkUp request");
      throw error;
    } finally {
      setIsLoadingRejectLinkUp(false);
    }
  };

  /**
   * Remove a LinkUp connection
   */
  const removeLinkUp = async (userId) => {
    try {
      setIsLoadingRemoveLinkUp(true);
      const response = await API.delete(`${BASE_URL}/linkup/${userId}`);
      toast.success(response.data.message || "LinkUp removed successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove LinkUp");
      throw error;
    } finally {
      setIsLoadingRemoveLinkUp(false);
    }
  };

  /**
   * Search users for potential LinkUps
   */
  const searchUsers = async (query = '', page = 1, limit = 10) => {
    try {
      if (!query.trim()) {
        return {
          searchResults: {
            data: [],
            count: 0,
            loading: false,
            error: null
          }
        };
      }

      const response = await API.get('/api/invites/search', {
        params: { query, page, limit }
      });

      return {
        searchResults: {
          data: response.data?.users || [],
          count: response.data?.count || 0,
          loading: false,
          error: null
        }
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
      return {
        searchResults: {
          data: [],
          count: 0,
          loading: false,
          error: error.response?.data?.message || error.message
        }
      };
    }
  };

  const contextValue = {
    // Query functions
    getLinkUps,
    getPendingLinkUps,
    getLinkUpCount,
    searchUsers,
    
    // Action methods
    sendLinkUp,
    acceptLinkUp,
    rejectLinkUp,
    removeLinkUp,
    
    // Loading states
    isLoadingSendLinkUp,
    isLoadingAcceptLinkUp,
    isLoadingRejectLinkUp,
    isLoadingRemoveLinkUp
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export default ConnectionContext;