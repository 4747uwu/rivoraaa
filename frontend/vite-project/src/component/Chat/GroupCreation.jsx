import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { X, Users, Search, AlertCircle } from 'lucide-react';

const GroupCreationModal = ({ onClose, projectId, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedProject } = useProjects();
  const backendUrl = import.meta.env.VITE_API_URL;

  const filteredMembers = selectedProject.members.filter(member =>
    member.userId.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedMembers.size === 0) {
      setError('Please select at least one member');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: groupName,
          projectId,
          isDefault: false,
          members: Array.from(selectedMembers)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onGroupCreated(data.group);
      } else {
        setError(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div className="bg-[#121212] rounded-xl shadow-2xl p-6 max-w-lg w-full 
                     border border-gray-800/40 animate-modal-in"
           style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Users size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-100">Create New Group</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 
                     hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg 
                         flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-800/40 rounded-lg 
                       text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-indigo-500/50 focus:border-transparent transition-all"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Members
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
                     size={18} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] border border-gray-800/40 
                         rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
              />
            </div>

            <div className="bg-[#1A1A1A] rounded-lg border border-gray-800/40 
                          max-h-[240px] overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <label
                    key={member.userId._id}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 
                             cursor-pointer transition-colors border-b border-gray-800/40 
                             last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.userId._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedMembers);
                        if (e.target.checked) {
                          newSelected.add(member.userId._id);
                        } else {
                          newSelected.delete(member.userId._id);
                        }
                        setSelectedMembers(newSelected);
                      }}
                      className="rounded border-gray-700 text-indigo-600 
                               focus:ring-indigo-500/50 bg-gray-800"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden 
                                    bg-gray-800 flex-shrink-0">
                        {member.userId.profilePicture ? (
                          <img
                            src={member.userId.profilePicture}
                            alt={member.userId.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center 
                                        bg-gradient-to-br from-indigo-500 to-purple-600 
                                        text-white font-medium">
                            {member.userId.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">
                          {member.userId.username}
                        </p>
                        <p className="text-sm text-gray-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No members found
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-800/40 
                       text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 
                        to-purple-600 text-white font-medium hover:from-indigo-700 
                        hover:to-purple-700 transition-all flex items-center gap-2 
                        shadow-lg shadow-indigo-500/20
                        ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                               rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreationModal;