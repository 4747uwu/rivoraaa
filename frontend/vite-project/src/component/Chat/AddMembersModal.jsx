import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { Search, X, UserPlus, Check, Users, AlertCircle } from 'lucide-react';

const AddMembersModal = ({ group, availableMembers, onClose, onMembersAdded }) => {
  const [newMembers, setNewMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available members by those not already in the group and not selected yet
  const availableMembersList = availableMembers.filter(
    (member) =>
      !group.members.some(
        (m) => m.userId._id.toString() === member.userId._id.toString()
      ) && !newMembers.includes(member.userId._id)
  );

  // Further filter by search query if present
  const filteredMembers = searchQuery 
    ? availableMembersList.filter(member => 
        member.userId.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableMembersList;

  const handleAdd = () => {
    if (selectedMemberId) {
      setNewMembers([...newMembers, selectedMemberId]);
      setSelectedMemberId('');
    }
  };

  const handleRemoveMember = (memberId) => {
    setNewMembers(newMembers.filter((m) => m !== memberId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMembers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const { data } = await API.patch(`/api/groups/${group._id}/members`, { newMembers });
      if (data.success) {
        onMembersAdded(data.group);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding members", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user details from their ID
  const getUserDetails = (userId) => {
    return availableMembers.find(m => m.userId._id === userId)?.userId || {};
  };

  // Handle click outside to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div 
        className="bg-[#121212] rounded-xl shadow-2xl p-6 max-w-lg w-full 
                   border border-gray-800/40 animate-modal-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">
                Add Members
              </h2>
              <p className="text-sm text-gray-400">
                {group.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 
                     hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enhanced Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
                   size={18} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1A1A1A] 
                       border border-gray-800/40 text-gray-200
                       placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-indigo-500/50 focus:border-transparent
                       transition-all"
            />
          </div>

          {/* Enhanced Member Selection */}
          {filteredMembers.length > 0 ? (
            <div className="bg-[#1A1A1A] rounded-lg border border-gray-800/40 overflow-hidden">
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.userId._id}
                    onClick={() => setNewMembers([...newMembers, member.userId._id])}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 
                             rounded-lg cursor-pointer transition-colors
                             group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden 
                                  bg-gray-800 flex-shrink-0 border border-gray-700">
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
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-200">{member.userId.username}</h4>
                      <p className="text-xs text-gray-400">{member.userId.email || 'No email'}</p>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg border border-indigo-500/20 
                               bg-indigo-500/10 text-indigo-400
                               opacity-0 group-hover:opacity-100 transition-all
                               hover:bg-indigo-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewMembers([...newMembers, member.userId._id]);
                      }}
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-[#1A1A1A] rounded-lg border border-gray-800/40">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-500 mb-3" />
              <p className="text-gray-400">
                {searchQuery 
                  ? "No matching members found" 
                  : "All members have already been added to this group"}
              </p>
            </div>
          )}

          {/* Enhanced Selected Members */}
          {newMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300">
                  Selected Members ({newMembers.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setNewMembers([])}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Clear All
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {newMembers.map((memberId) => {
                  const user = getUserDetails(memberId);
                  return (
                    <div 
                      key={memberId}
                      className="inline-flex items-center gap-2 bg-indigo-500/10 
                               border border-indigo-500/20 px-3 py-1.5 rounded-full 
                               text-sm group hover:bg-indigo-500/20 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture}
                            alt={user.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center 
                                        bg-gradient-to-br from-indigo-500 to-purple-600 
                                        text-white text-xs font-medium">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-indigo-300">{user.username}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(memberId)}
                        className="text-indigo-400 hover:text-indigo-300 focus:outline-none 
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-800/40 text-gray-300
                       hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newMembers.length === 0 || isSubmitting}
              className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600
                      text-white font-medium hover:from-indigo-700 hover:to-purple-700
                      transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20
                      ${(newMembers.length === 0 || isSubmitting) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                               rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Add {newMembers.length} {newMembers.length === 1 ? 'Member' : 'Members'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add enhanced animations
const style = document.createElement('style');
style.textContent = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-modal-in {
    animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;
document.head.appendChild(style);

export default AddMembersModal;