import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Loader } from 'lucide-react';
import API from '../api/api';

const InviteModal = ({ isOpen, onClose, projectId, onInvite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/api/invites/search?query=${encodeURIComponent(query)}`);
      // Log the response to see what we're getting
      console.log('Search response:', response.data);
      if (response.data.success && Array.isArray(response.data.users)) {
        setSearchResults(response.data.users);
      } else {
        console.error('Invalid response format:', response.data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId) => {
    try {
      setInviting(true);
      await API.post('/api/invites/send-invitation', {
        projectId,
        userId,
        role: selectedRole
      });
      onInvite?.();
      onClose();
    } catch (error) {
      console.error('Invitation error:', error);
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Section */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                           focus:outline-none focus:border-blue-400 focus:ring-2 
                           focus:ring-blue-50 transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>

              {/* Role Selection */}
              <div className="mt-4 flex gap-2">
                {['viewer', 'member', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                              ${selectedRole === role 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-60 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="animate-spin text-blue-500" size={24} />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div 
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                        {user.username 
                          ? user.username.substring(0, 1).toUpperCase()
                          : 'U'
                        }
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvite(user._id)}
                      disabled={inviting}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg 
                               hover:bg-blue-100 transition-colors flex items-center gap-2
                               border border-blue-100 disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      <span>Invite</span>
                    </button>
                  </div>
                ))
              ) : searchQuery ? (
                <p className="text-center text-gray-500 py-4">No users found</p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;