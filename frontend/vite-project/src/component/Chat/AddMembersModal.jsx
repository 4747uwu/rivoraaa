import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { Search, X, UserPlus, Check, Users } from 'lucide-react';

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full border border-gray-100 animate-fade-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Add Members
              </h2>
              <p className="text-sm text-gray-500">
                {group.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 
                       text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:border-transparent"
            />
          </div>

          {/* Member Selection */}
          {filteredMembers.length > 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.userId._id}
                    onClick={() => setNewMembers([...newMembers, member.userId._id])}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 
                             rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                      {member.userId.profilePicture ? (
                        <img 
                          src={member.userId.profilePicture} 
                          alt={member.userId.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-medium">
                          {member.userId.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.userId.username}</h4>
                      <p className="text-xs text-gray-500">{member.userId.email || 'No email'}</p>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600
                               hover:bg-indigo-100 transition-colors"
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
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">
                {searchQuery 
                  ? "No matching members found" 
                  : "All members have already been added to this group"}
              </p>
            </div>
          )}

          {/* Selected Members */}
          {newMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Selected Members ({newMembers.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setNewMembers([])}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
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
                      className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 
                               px-3 py-1.5 rounded-full text-sm"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-indigo-100">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture}
                            alt={user.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-200 text-indigo-600 text-xs font-medium">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-indigo-700">{user.username}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(memberId)}
                        className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700
                       hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newMembers.length === 0 || isSubmitting}
              className={`px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium
                      hover:bg-indigo-700 transition-colors flex items-center gap-2
                      ${(newMembers.length === 0 || isSubmitting) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

// Add a simple fade-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default AddMembersModal;