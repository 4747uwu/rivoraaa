// src/component/Profile/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Briefcase, MapPin, Calendar, Users, Link as LinkIcon, 
         UserPlus, Check, X, ArrowLeft, Globe, Shield, Loader, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import API from '../../api/api';
import { useConnection } from '../../context/connectionContext'; // Import the connection context

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkUpForm, setShowLinkUpForm] = useState(false);
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Get connection methods from context
  const { 
    sendLinkUp,
    acceptLinkUp,
    rejectLinkUp,
    isLoadingSendLinkUp,
    isLoadingAcceptLinkUp,
    isLoadingRejectLinkUp
  } = useConnection();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/api/connections/profile/${userId}`);
        setProfile(response.data.profile);
        setConnection(response.data.connection);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);
  
  const handleSendLinkUp = async () => {
    try {
      setActionLoading(true);
      await sendLinkUp(userId, message);
      
      // Update connection status locally
      setConnection(prev => ({
        ...prev,
        status: 'request_sent'
      }));
      
      setShowLinkUpForm(false);
      setMessage('');
      showNotification('LinkUp request sent successfully!', 'success');
    } catch (err) {
      console.error('Error sending LinkUp request:', err);
      showNotification(err.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleAcceptLinkUp = async () => {
    if (!connection?.connectionId) return;
    
    try {
      setActionLoading(true);
      await acceptLinkUp(connection.connectionId);
      
      // Update connection status locally
      setConnection(prev => ({
        ...prev,
        status: 'accepted'
      }));
      
      showNotification('LinkUp request accepted!', 'success');
    } catch (err) {
      console.error('Error accepting LinkUp request:', err);
      showNotification(err.response?.data?.message || 'Failed to accept request', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleRejectLinkUp = async () => {
    if (!connection?.connectionId) return;
    
    try {
      setActionLoading(true);
      await rejectLinkUp(connection.connectionId);
      
      // Update connection status locally
      setConnection(prev => ({
        ...prev,
        status: 'declined'
      }));
      
      showNotification('LinkUp request rejected', 'info');
    } catch (err) {
      console.error('Error rejecting LinkUp request:', err);
      showNotification(err.response?.data?.message || 'Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader size={40} className="text-blue-500" />
        </motion.div>
        <p className="mt-4 text-gray-400">Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-red-400 text-xl mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  const { restricted } = profile;
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Back button */}
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
        
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-3 rounded-md ${
                notification.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                notification.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                'bg-blue-900/30 text-blue-400 border border-blue-800'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Profile header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          {/* Cover photo */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-700 to-purple-700 relative">
            {profile.coverImage && (
              <img 
                src={profile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            
            {restricted && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Shield size={40} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-300">This profile has privacy restrictions</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile info section */}
          <div className="relative p-6">
            {/* Profile picture */}
            <div className="absolute -top-16 left-6 md:left-10 ring-4 ring-gray-800 rounded-full overflow-hidden bg-gray-700">
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="pt-12 md:pt-16 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {profile.name}
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-2">@{profile.username}</p>
                
                {profile.profession && (
                  <div className="flex items-center text-gray-300 mb-2">
                    <Briefcase size={16} className="mr-2 text-blue-400" />
                    <span>{profile.profession}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center text-gray-300">
                    <MapPin size={16} className="mr-2 text-blue-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              
              {/* Connection Actions */}
              <div className="mt-4 md:mt-0">
                <ConnectionActions 
                  connection={connection}
                  onConnect={() => setShowLinkUpForm(true)}
                  onAccept={handleAcceptLinkUp}
                  onReject={handleRejectLinkUp}
                  isLoadingSendLinkUp={isLoadingSendLinkUp || actionLoading}
                  isLoadingAcceptLinkUp={isLoadingAcceptLinkUp || actionLoading}
                  isLoadingRejectLinkUp={isLoadingRejectLinkUp || actionLoading}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* LinkUp Form Modal */}
        <AnimatePresence>
          {showLinkUpForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <UserPlus size={20} className="mr-2 text-blue-400" />
                  Send LinkUp Request
                </h2>
                
                <p className="text-gray-300 mb-4">
                  Send a request to connect with {profile.name}
                </p>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Add a message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    rows={3}
                    placeholder={`Hi ${profile.name}, I'd like to connect with you...`}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setShowLinkUpForm(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendLinkUp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div>
            {/* About */}
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg mb-6">
              <h2 className="text-xl font-semibold mb-4 text-white">About</h2>
              {restricted ? (
                <p className="text-gray-400 flex items-center">
                  <Shield size={16} className="mr-2" />
                  Profile information is private
                </p>
              ) : (
                <p className="text-gray-300">{profile.bio || "No bio available"}</p>
              )}
            </div>
            
            {/* Contact Info */}
            {!restricted && (
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
                {profile.email && (
                  <div className="flex items-center mb-3">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-300">{profile.email}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center">
                    <Globe size={16} className="text-gray-400 mr-3" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-2">
            {restricted ? (
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
                <Shield size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Limited Profile Access</h3>
                <p className="text-gray-400 mb-4">
                  {connection.status === 'accepted' 
                    ? "You're connected, but this user has restricted their profile information."
                    : "Connect with this user to see more profile information."}
                </p>
              </div>
            ) : (
              <>
                {/* Stats */}
                {profile.connectionStats && (
                  <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-around">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{profile.connectionStats.linkUpsCount}</p>
                        <p className="text-gray-400 text-sm">LinkUps</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{profile.connectionStats.followersCount}</p>
                        <p className="text-gray-400 text-sm">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{profile.connectionStats.followingCount}</p>
                        <p className="text-gray-400 text-sm">Following</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recent Activity */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
                  
                  {profile.recentActivity && profile.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentActivity.map((activity, index) => (
                        <div key={index} className="p-3 bg-gray-700/50 rounded">
                          <div className="flex items-start">
                            <div className="mr-3">
                              {/* Activity icon based on type */}
                            </div>
                            <div>
                              <p className="text-gray-300">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(activity.date))} ago
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No recent activity</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for connection actions - updated to use context loading states
const ConnectionActions = ({ 
  connection, 
  onConnect, 
  onAccept, 
  onReject, 
  isLoadingSendLinkUp,
  isLoadingAcceptLinkUp,
  isLoadingRejectLinkUp
}) => {
  if (!connection) return null;
  
  const { status, canConnect } = connection;
  
  if (status === 'none' && canConnect) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onConnect}
        disabled={isLoadingSendLinkUp}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
      >
        <UserPlus size={16} className="mr-2" />
        Send LinkUp Request
      </motion.button>
    );
  }
  
  if (status === 'none' && !canConnect) {
    return (
      <div className="px-4 py-2 bg-gray-700 text-gray-400 rounded flex items-center cursor-not-allowed">
        <Shield size={16} className="mr-2" />
        Cannot Connect
      </div>
    );
  }
  
  if (status === 'request_sent') {
    return (
      <div className="px-4 py-2 bg-amber-900/30 text-amber-400 border border-amber-900/50 rounded flex items-center">
        <Clock size={16} className="mr-2" />
        Request Sent
      </div>
    );
  }
  
  if (status === 'request_received') {
    return (
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAccept}
          disabled={isLoadingAcceptLinkUp}
          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
        >
          {isLoadingAcceptLinkUp ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReject}
          disabled={isLoadingRejectLinkUp}
          className="p-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 disabled:opacity-50"
        >
          {isLoadingRejectLinkUp ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <X size={16} />
          )}
        </motion.button>
        
        <span className="text-sm text-gray-400">LinkUp Request</span>
      </div>
    );
  }
  
  if (status === 'accepted') {
    return (
      <div className="px-4 py-2 bg-green-900/30 text-green-400 border border-green-900/50 rounded flex items-center">
        <Users size={16} className="mr-2" />
        Connected
      </div>
    );
  }
  
  if (status === 'declined') {
    return (
      <div className="flex space-x-2 items-center">
        <div className="px-4 py-2 bg-gray-700 text-gray-400 rounded flex items-center">
          <X size={16} className="mr-2" />
          Request Declined
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConnect}
          disabled={isLoadingSendLinkUp}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoadingSendLinkUp ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
        </motion.button>
      </div>
    );
  }
  
  return null;
};

export default UserProfilePage;