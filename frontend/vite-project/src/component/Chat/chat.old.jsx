import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import { useProjects } from '../../context/ProjectContext';
import GroupCreationModal from './GroupCreation';
import AddMembersModal from './AddMembersModal';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const { user } = useAuth();
  const { selectedProject } = useProjects();
  const projectId = selectedProject?._id;
  const currentUser = user._id;
  console.log(currentUser)

  // Add new state variables
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  // Update the socket initialization useEffect
  useEffect(() => {
    if (!projectId || !selectedGroup) return;

    const newSocket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      query: { 
        projectId,
        groupId: selectedGroup._id 
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [projectId, selectedGroup]); // Add selectedGroup as dependency

  // Handle receiving messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      setMessages(prev => {
        // Remove temporary message if it exists
        const filteredMessages = prev.filter(msg => 
          !msg._id?.toString().startsWith('temp-')
        );
        return [...filteredMessages, message];
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  // Load groups on component mount
  useEffect(() => {
    if (!projectId) return;

    const loadGroups = async () => {
      if (!projectId) return;

      try {
        // First check if groups exist for this project
        const response = await fetch(`http://localhost:4000/api/groups/project/${projectId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          const projectGroups = data.groups;
          
          // If no groups at all, create default group
          if (projectGroups.length === 0) {
            const newDefaultGroup = await createDefaultGroup();
            if (newDefaultGroup) {
              setGroups([newDefaultGroup]);
              setSelectedGroup(newDefaultGroup);
            }
          } else {
            // Groups exist, find default group
            const defaultGroup = projectGroups.find(g => g.isDefault);
            setGroups(projectGroups);
            setSelectedGroup(defaultGroup || projectGroups[0]);
          }
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, [projectId]);

  // Update message loading to be group-specific
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedGroup?._id) return;

      try {
        // Update the URL to match the backend route
        const response = await fetch(`http://localhost:4000/api/groups/${selectedGroup._id}/messages`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setMessages(data.messages);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedGroup]);

  console.log('Selected Group:', selectedGroup);    

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedGroup) return;

    const messageData = {
      content: newMessage.trim(),
      projectId: projectId,
      groupId: selectedGroup._id,
      sender: {
        _id: currentUser,
        name: user.name,
        profilePicture: user.profilePicture
      },
      createdAt: new Date().toISOString()
    };

    // Add temporary message immediately
    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`
    };
    setMessages(prev => [...prev, tempMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Send to server
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  // Add group creation functionality
  const createDefaultGroup = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: `${selectedProject.name} Discussion`,
          projectId: projectId,
          isDefault: true,
          members: selectedProject.members.map(member => member.userId._id)
        })
      });

      const data = await response.json();
      return data.success ? data.group : null;
    } catch (error) {
      console.error('Error creating default group:', error);
      return null;
    }
  };

  // Handler to delete a group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const response = await fetch(`http://localhost:4000/api/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setGroups(prev => prev.filter(g => g._id !== groupId));
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting group", error);
    }
  };

  // Handler to add members (this example assumes you'll implement a modal where you select newMembers)
  const handleAddMembers = async (groupId, newMembers) => {
    try {
      const response = await fetch(`http://localhost:4000/api/groups/${groupId}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newMembers })
      });
      const data = await response.json();
      if (data.success) {
        // update groups state with the new group object
        setGroups(prev => prev.map(g => (g._id === groupId ? data.group : g)));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding members", error);
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 antialiased">
      {/* Groups Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-black">Groups</h2>
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="mt-4 w-full px-4 py-2.5 bg-sky-500 text-white rounded-lg 
                 hover:bg-sky-600 transition-colors duration-200 flex items-center justify-center 
                 gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 4v16m8-8H4" />
            </svg>
            Create New Group
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4">
          {groups.map(group => (
            <div key={group._id} className="flex items-center justify-between">
              <button
                onClick={() => setSelectedGroup(group)}
                className={`w-full px-6 py-3 text-left transition-all duration-200 
                      hover:bg-sky-50 flex items-center gap-3 ${
                        selectedGroup?._id === group._id 
                          ? 'bg-sky-100 border-l-4 border-sky-500' 
                          : 'border-l-4 border-transparent'
                      }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-400 
                      flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-medium text-lg">
                    {group.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-black line-clamp-1">{group.name}</p>
                  <p className="text-sm text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
              </button>
              {/* Show delete button if current user is the group creator */}
              {group.createdBy._id?.toString() === currentUser && (
                <button
                  onClick={() => handleDeleteGroup(group._id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-sky-50">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between shadow-sm
                 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center shadow-md">
              <span className="text-white font-medium">
                {selectedGroup?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-black">{selectedGroup?.name}</h3>
              <p className="text-sm text-gray-500">{selectedGroup?.members.length} members</p>
            </div>
          </div>
          {/* Show Add Members button if current user is the group creator */}
          {selectedGroup && selectedGroup.createdBy._id?.toString() === currentUser && (
            <button
              onClick={() => setShowAddMembersModal(true)}
              className="px-3 py-2 text-sm bg-sky-500 text-white rounded hover:bg-sky-600"
            >
              Add Members
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[70%] ${msg.sender._id === currentUser ? 'ml-auto items-end' : 'items-start'}`}
            >
              {/* Display sender profile and name */}
              {msg.sender._id !== currentUser ? (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={msg.sender.profilePicture || '/default-profile.png'}
                    alt={msg.sender.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="font-semibold text-black">{msg.sender.username}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={user.profilePicture || '/default-profile.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="font-semibold text-black">you</span>
                </div>
              )}

              {/* Message bubble section */}
              <div className="flex items-end gap-2">
                {/* {msg.sender._id !== currentUser && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-sky-500">
                    <img
                      src={msg.sender.profilePicture || '/default-profile.png'}
                      alt={msg.sender.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )} */}
                <div
                  className={`rounded-xl px-4 py-3 shadow-md ${
                    msg.sender._id === currentUser
                      ? 'bg-sky-500 text-white'
                      : 'bg-white text-black border border-gray-200'
                  }`}
                >
                  <p className="text-[15px]">{msg.content}</p>
                </div>
                {/* {msg.sender._id === currentUser && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-sky-500">
                    <img
                      src={user.profilePicture || '/default-profile.png'}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )} */}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-gray-500 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all 
                     duration-200 bg-sky-50 text-black hover:bg-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !socket}
              className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 
                     flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Group Creation Modal */}
      {isCreatingGroup && (
        <GroupCreationModal
          onClose={() => setIsCreatingGroup(false)}
          projectId={projectId}
          onGroupCreated={(newGroup) => {
            setGroups(prev => [...prev, newGroup]);
            setSelectedGroup(newGroup);
            setIsCreatingGroup(false);
          }}
        />
      )}

      {/* (Optional) Add Members Modal */}
      {showAddMembersModal && (
        // You can create a new AddMembersModal component similar to GroupCreationModal.
        <AddMembersModal 
          group={selectedGroup} 
          onClose={() => setShowAddMembersModal(false)} 
          availableMembers={selectedProject.members}
          onMembersAdded={(updatedGroup) => {
              // update group state after adding members
              setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
              setSelectedGroup(updatedGroup);
              setShowAddMembersModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatComponent;