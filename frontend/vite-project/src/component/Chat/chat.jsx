import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import { useProjects } from '../../context/ProjectContext';
import GroupCreationModal from './GroupCreation';
import AddMembersModal from './AddMembersModal';
// import TypingIndicator from "./TypingIndicator";
import { 
  Users, 
  PlusCircle, 
  Send,
  LogOut, 
  Settings, 
  Bell, 
  Search, 
  Trash2,
  UserPlus,
  ChevronRight,
  ChevronDown,
  X,
  MoreVertical
} from 'lucide-react';

const ChatComponent = () => {
  const backendUrl = import.meta.env.VITE_API_URL;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef({});

  const { user } = useAuth();
  const { selectedProject } = useProjects();
  const projectId = selectedProject?._id;
  const currentUser = user._id;

  // State variables
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  // Socket initialization
  useEffect(() => {
    if (!projectId) return;

    // Create socket once per project, not per group
    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      query: { projectId }
    });

    // Add debugging
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting socket');
      if (newSocket) newSocket.disconnect();
    };
  }, [projectId]); // Only depend on projectId, not selectedGroup

  // Add separate effect to handle group changes
  useEffect(() => {
    if (!socket || !selectedGroup) return;
    
    // Leave previous room and join new one
    console.log(`Joining group room: ${selectedGroup._id}`);
    socket.emit('joinGroup', selectedGroup._id);
    
    // Don't need to return cleanup as the socket will handle it
  }, [socket, selectedGroup?._id]);

  // Receive messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      setMessages(prev => {
        // Remove temporary message if it exists
        const filteredMessages = prev.filter(msg => 
          !msg._id?.toString().startsWith('temp-')
        );
        return [...filteredMessages, message];
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Add these new event listeners
    socket.on('userTyping', ({userId, groupId, username}) => {
      if (groupId === selectedGroup?._id && userId !== currentUser) {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: { username, timestamp: Date.now() }
        }));
      }
    });

    socket.on('userStoppedTyping', ({userId, groupId}) => {
      if (groupId === selectedGroup?._id) {
        setTypingUsers(prev => {
          const updated = {...prev};
          delete updated[userId];
          return updated;
        });
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('error');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [socket, selectedGroup?._id, currentUser]);

  // Load groups
  useEffect(() => {
    if (!projectId) return;

    const loadGroups = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/groups/project/${projectId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          const projectGroups = data.groups;
          
          if (projectGroups.length === 0) {
            const newDefaultGroup = await createDefaultGroup();
            if (newDefaultGroup) {
              setGroups([newDefaultGroup]);
              setSelectedGroup(newDefaultGroup);
            }
          } else {
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

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedGroup?._id) return;

      try {
        const response = await fetch(`${backendUrl}/api/groups/${selectedGroup._id}/messages`, {
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

  // Send message
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

    // Add temporary message
    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`
    };
    setMessages(prev => [...prev, tempMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  // Add this to handle typing status
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    // Only emit typing events if there's a selected group and socket
    if (!socket || !selectedGroup) return;
    
    // Emit typing event
    socket.emit('typing', {
      groupId: selectedGroup._id,
      userId: currentUser,
      username: user.username || user.name
    });
    
    // Clear existing timeout
    if (typingTimeoutRef.current[currentUser]) {
      clearTimeout(typingTimeoutRef.current[currentUser]);
    }
    
    // Set timeout to stop typing indication
    typingTimeoutRef.current[currentUser] = setTimeout(() => {
      socket.emit('stopTyping', {
        groupId: selectedGroup._id,
        userId: currentUser
      });
    }, 2000); // Stop typing indication after 2 seconds of inactivity
  };

  // Create default group
  const createDefaultGroup = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/groups`, {
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

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const response = await fetch(`${backendUrl}/api/groups/${groupId}`, {
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

  // Group name initial for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter groups by search query
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Same day - show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Within 7 days - show day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    
    return grouped;
  };
  
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex h-screen bg-gray-50 antialiased text-gray-800">
      {/* Left Sidebar: Profile & Groups */}
      <div className="w-80 flex flex-col bg-white border-r border-gray-100 shadow-sm">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <img 
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{user.username}</h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronDown size={18} />
              </button>
            </div>
            
            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  <Bell size={16} />
                  <span>Notifications</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 flex items-center gap-2">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Project Info */}
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider">Current Project</p>
              <h3 className="font-medium text-gray-900 truncate">{selectedProject?.name}</h3>
            </div>
            <button className="p-1 rounded-full hover:bg-indigo-100 text-indigo-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Search and Create Group */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 
                       text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 
                     bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            <span className="font-medium">New Conversation</span>
          </button>
        </div>
        
        {/* Groups List */}
        <div className="flex-1 overflow-y-auto py-2">
          <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Conversations
          </h4>
          
          {filteredGroups.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div 
                key={group._id} 
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer 
                         ${selectedGroup?._id === group._id ? 'bg-indigo-50' : 'hover:bg-gray-50'} 
                         transition-colors`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                           ${selectedGroup?._id === group._id ? 
                             'bg-gradient-to-br from-indigo-500 to-indigo-600' : 
                             'bg-gradient-to-br from-gray-200 to-gray-300'}`}
                >
                  <span className={`font-medium text-lg 
                                  ${selectedGroup?._id === group._id ? 'text-white' : 'text-gray-600'}`}>
                    {getInitials(group.name)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-medium truncate
                                  ${selectedGroup?._id === group._id ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {group.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {/* Here you can add the latest message time */}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {group.members.length} members
                    </p>
                    
                    {/* Controls */}
                    {group.createdBy._id?.toString() === currentUser && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddMembersModal(true);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                          title="Add members"
                        >
                          <UserPlus size={14} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group._id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                          title="Delete group"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedGroup ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                            bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm`}>
                <span className="text-white font-medium">
                  {getInitials(selectedGroup.name)}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">{selectedGroup.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={12} />
                  <span>{selectedGroup.members.length} members</span>
                </div>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {selectedGroup.createdBy._id?.toString() === currentUser && (
                <button
                  onClick={() => setShowAddMembersModal(true)}
                  className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 font-medium rounded-full
                           hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  <span>Add Members</span>
                </button>
              )}
              
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {Object.keys(groupedMessages).map(date => (
              <div key={date} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                    {new Date(date).toLocaleDateString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {groupedMessages[date].map((msg, idx) => {
                  const isCurrentUser = msg.sender._id === currentUser;
                  const showSender = idx === 0 || 
                    groupedMessages[date][idx - 1]?.sender._id !== msg.sender._id;
                  
                  return (
                    <div key={msg._id || idx} className="space-y-1">
                      {/* Show sender info only when speaker changes */}
                      {showSender && !isCurrentUser && (
                        <div className="flex items-center gap-2 ml-12 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {msg.sender.username || msg.sender.name}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                        {/* Show avatar with first message from this sender */}
                        {!isCurrentUser && showSender && (
                          <img
                            src={msg.sender.profilePicture || `https://ui-avatars.com/api/?name=${msg.sender.username || 'User'}&background=random`}
                            alt={msg.sender.username || msg.sender.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        )}
                        
                        {/* Message body */}
                        <div className={`group relative max-w-[75%] ${!isCurrentUser && !showSender ? 'ml-12' : ''}`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm
                                         ${isCurrentUser ? 
                                           'bg-indigo-600 text-white rounded-br-none' : 
                                           'bg-white text-gray-800 rounded-bl-none'}`}
                          >
                            <p className="text-[15px] whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          
                          {/* Time */}
                          <div className={`absolute bottom-0 ${isCurrentUser ? 'left-0 translate-x-[-110%]' : 'right-0 translate-x-[110%]'}
                                         opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-indigo-500" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500 max-w-sm">
                  Start a conversation by sending the first message to this group.
                </p>
              </div>
            )}
          </div>

          {/* Add this just before the message input area */}
          <div className="px-6 py-1">
            <TypingIndicator users={typingUsers} />
          </div>

          {/* Message Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-full 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           placeholder-gray-400 text-gray-900"
                />
              </div>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || !socket}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700
                        disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                        flex items-center justify-center shadow-sm"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        // No selected group view
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-indigo-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Project Chat</h2>
            <p className="text-gray-600 mb-6">
              Select a conversation from the sidebar or create a new one to start messaging.
            </p>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                        transition-colors shadow-sm flex items-center gap-2 mx-auto"
            >
              <PlusCircle size={20} />
              <span className="font-medium">Create New Conversation</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Add Members Modal */}
      {showAddMembersModal && selectedGroup && (
        <AddMembersModal 
          group={selectedGroup} 
          onClose={() => setShowAddMembersModal(false)} 
          availableMembers={selectedProject.members}
          onMembersAdded={(updatedGroup) => {
            setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
            setSelectedGroup(updatedGroup);
            setShowAddMembersModal(false);
          }}
        />
      )}
    </div>
  );
};
// Add this component at the bottom of your file
const TypingIndicator = ({ users }) => {
  if (Object.keys(users).length === 0) return null;
  
  // Get the usernames of people typing
  const typingUsernames = Object.values(users).map(u => u.username);
  
  // Limit to showing max 2 users typing
  const displayNames = typingUsernames.slice(0, 2);
  const text = displayNames.length === 1 
    ? `${displayNames[0]} is typing...` 
    : displayNames.length === 2 
      ? `${displayNames[0]} and ${displayNames[1]} are typing...` 
      : `${displayNames[0]}, ${displayNames[1]} and ${typingUsernames.length - 2} others are typing...`;
      
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 ml-12">
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{text}</span>
    </div>
  );
};
export default ChatComponent;