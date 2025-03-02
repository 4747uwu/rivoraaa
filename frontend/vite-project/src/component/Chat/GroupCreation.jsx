import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';

const GroupCreationModal = ({ onClose, projectId, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [error, setError] = useState('');
  const { selectedProject } = useProjects();
  const backendUrl = import.meta.env.VITE_API_URL;

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

    try {
      const response = await fetch(`${backendUrl}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Members
            </label>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {selectedProject.members.map(member => (
                <label
                  key={member.userId._id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
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
                    className="mr-2"
                  />
                  <div className="flex items-center">
                    {member.userId.profilePicture ? (
                      <img
                        src={member.userId.profilePicture}
                        alt={member.userId.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                        <span className="text-purple-600 font-medium">
                          {member.userId.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{member.userId.username}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreationModal;