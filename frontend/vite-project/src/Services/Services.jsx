

import API from '../api/api';

const BASE_URL = '/api/connection';

// Connection API services
const connectionService = {
  // Get followers of a user
  getFollowers: async (userId = null, page = 1, limit = 10) => {
    const url = userId ? `${BASE_URL}/user/${userId}/followers` : `${BASE_URL}/followers`;
    const response = await API.get(url, { params: { page, limit } });
    return response.data;
  },
  
  // Get users that a user is following
  getFollowing: async (userId = null, page = 1, limit = 10) => {
    const url = userId ? `${BASE_URL}/user/${userId}/following` : `${BASE_URL}/following`;
    const response = await API.get(url, { params: { page, limit } });
    return response.data;
  },
  
  // Get pending connection requests
  getPendingRequests: async () => {
    const response = await API.get(`${BASE_URL}/pending`);
    return response.data;
  },
  
  // Send a connection request
  sendRequest: async (userId, connectionType = 'follow', message = '') => {
    const response = await API.post(`${BASE_URL}/request`, { 
      userId, 
      connectionType, 
      message 
    });
    return response.data;
  },
  
  // Accept a connection request
  acceptRequest: async (connectionId) => {
    const response = await API.post(`${BASE_URL}/${connectionId}/accept`);
    return response.data;
  },
  
  // Decline a connection request
  declineRequest: async (connectionId) => {
    const response = await API.post(`${BASE_URL}/${connectionId}/decline`);
    return response.data;
  },
  
  // Remove an existing connection (unfollow)
  removeConnection: async (userId) => {
    const response = await API.delete(`${BASE_URL}/${userId}`);
    return response.data;
  },
  
  // Block a user
  blockUser: async (userId) => {
    const response = await API.post(`${BASE_URL}/${userId}/block`);
    return response.data;
  },
  
  // Unblock a user
  unblockUser: async (userId) => {
    const response = await API.post(`${BASE_URL}/${userId}/unblock`);
    return response.data;
  },
  
  // Get connection status with another user
  getConnectionStatus: async (userId) => {
    const response = await API.get(`${BASE_URL}/status/${userId}`);
    return response.data;
  },
  
  // Get connection suggestions
  getSuggestions: async (limit = 10) => {
    const response = await API.get(`${BASE_URL}/suggestions`, { 
      params: { limit } 
    });
    return response.data;
  },
  
  // Update connection settings
  updateSettings: async (settings) => {
    const response = await API.put(`${BASE_URL}/settings`, settings);
    return response.data;
  },
  
  // Search for users to connect with
  searchUsers: async (query, page = 1, limit = 10) => {
    const response = await API.get('/users/search', { 
      params: { query, page, limit }
    });
    return response.data;
  }
};

export default connectionService;