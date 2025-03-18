// src/component/Profile/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Briefcase, MapPin, Calendar, Users, Link as LinkIcon, 
         UserPlus, Check, X, ArrowLeft, Globe, Shield, Loader, Clock,
         Code, BookOpen, Zap, Palette, PieChart, Compass } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import API from '../../api/api';
import { useConnection } from '../../context/connectionContext'; // Import the connection context

// First, update the theme constants
const theme = {
  background: 'bg-black',
  card: 'bg-gray-900/20',
  cardHover: 'hover:bg-gray-800/30',
  border: 'border-gray-800/50',
  borderHover: 'hover:border-gray-700/50',
  text: {
    primary: 'text-gray-100',
    secondary: 'text-gray-400',
    muted: 'text-gray-600'
  },
  button: {
    primary: 'bg-gray-800 hover:bg-gray-700',
    secondary: 'bg-gray-900/50 hover:bg-gray-800/50',
    accent: 'bg-blue-900/20 hover:bg-blue-800/30'
  }
};

// Add the NavBar component
const ProfileNavBar = ({ activeTab, setActiveTab }) => (
  <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-gray-800/50 text-gray-100 border border-gray-700/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'projects'
                ? 'bg-gray-800/50 text-gray-100 border border-gray-700/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Projects
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Add the UnderConstruction component for Projects tab
const UnderConstruction = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme.card} rounded-2xl p-8 max-w-lg w-full mx-4 ${theme.border}`}
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            rotateZ: [0, 10, -10, 10, -10, 0],
            transition: { duration: 2, repeat: Infinity }
          }}
          className="inline-block mb-6"
        >
          {/* <Tool className="w-16 h-16 text-gray-600" /> */}
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          Under Construction
        </h2>
        <p className="text-gray-400 mb-6">
          We're working hard to bring you an amazing projects showcase feature. 
          Stay tuned for updates!
        </p>
        <div className="flex justify-center">
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </span>
        </div>
      </div>
    </motion.div>
  </div>
);

// Style constants
const backgroundGradient = `bg-gradient-to-br from-[#0A1022] via-[#151F30] to-[#0A1022]`;
const highlightGradient = `bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10`;

const glassCard = `
    bg-[#1E293B]/50
    backdrop-blur-xl
    shadow-[0_8px_32px_rgb(0,0,0,0.15)]
    border
    border-indigo-500/20
    hover:border-indigo-500/30
    transition-all
    duration-300
    group
`;

const textClass = 'text-gray-100 font-medium';
const headingClass = 'bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent';
const subTextClass = 'text-gray-400/90';

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
  const [activeTab, setActiveTab] = useState('profile');
  
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader size={40} className="text-indigo-500" />
        </motion.div>
        <p className="mt-4 text-indigo-300">Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-4">
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-red-500/30 p-6 rounded-xl max-w-md w-full shadow-lg">
          <h2 className="text-red-400 text-xl mb-4 font-bold">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-indigo-600/80 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  const { restricted } = profile;
  
  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Add the NavBar */}
      <ProfileNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conditional rendering based on activeTab */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Existing profile content */}
            {/* Enhanced background animations */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full mix-blend-soft-light filter blur-3xl opacity-20"
                  animate={{
                    x: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                    y: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                    scale: [1, 1.1 + Math.random() * 0.2, 1],
                  }}
                  transition={{
                    duration: 25 + i * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: `${300 + i * 200}px`,
                    height: `${300 + i * 200}px`,
                    background: i % 2 === 0 
                      ? `rgba(${88 + i * 30}, ${61 + i * 20}, ${255}, 0.${3 + i})` 
                      : `rgba(${130}, ${40 + i * 20}, ${255}, 0.${3 + i})`,
                    left: `${i * 20}%`,
                    top: `${i * 15}%`,
                  }}
                />
              ))}
            </div>

            {/* Content Container */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="container mx-auto max-w-6xl px-4 py-6"
            >
              {/* Back button with enhanced styling */}
              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center text-indigo-400 hover:text-indigo-300 mb-6 px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-sm shadow-lg"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span>Back</span>
              </motion.button>
              
              {/* Notification with enhanced styling */}
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-xl backdrop-blur-md shadow-lg ${
                      notification.type === 'success' ? 'bg-green-900/40 text-green-400 border border-green-500/30' :
                      notification.type === 'error' ? 'bg-red-900/40 text-red-400 border border-red-500/30' :
                      'bg-blue-900/40 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {notification.message}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Profile Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Sidebar - Profile Info */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-4"
                >
                  {/* Profile Card */}
                  <div className={`${glassCard} rounded-2xl overflow-hidden shadow-lg mb-6`}>
                    {/* Large profile picture area instead of cover */}
                    <div className="relative bg-gradient-to-r from-indigo-900/50 to-purple-900/50 py-8 px-6">
                      <div className="flex flex-col items-center">
                        {/* Profile picture */}
                        <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-[#1E293B] bg-[#1E293B] shadow-xl mb-4">
                          {profile.profilePicture ? (
                            <img 
                              src={profile.profilePicture} 
                              alt={profile.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-900/30">
                              <User size={64} className="text-indigo-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Name and Username */}
                        <h1 className={`text-2xl font-bold mb-1 ${headingClass}`}>
                          {profile.name}
                        </h1>
                        <p className="text-indigo-400 text-sm mb-2">@{profile.username}</p>
                        
                        {/* Profession */}
                        {profile.profession && (
                          <div className="bg-indigo-900/40 px-4 py-1.5 rounded-full mb-4 border border-indigo-500/20">
                            <span className="text-indigo-300 font-medium">{profile.profession}</span>
                          </div>
                        )}
                        
                        {/* Connection Status Button */}
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
                    
                    {/* User Details */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {profile.location && (
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="p-2 rounded-full bg-indigo-500/10">
                              <MapPin size={16} className="text-indigo-400" />
                            </div>
                            <span className={textClass}>{profile.location}</span>
                          </div>
                        )}
                        
                        {profile.email && !restricted && (
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="p-2 rounded-full bg-indigo-500/10">
                              <Mail size={16} className="text-indigo-400" />
                            </div>
                            <span className={textClass}>{profile.email}</span>
                          </div>
                        )}
                        
                        {/* Skills section - moved here */}
                        {profile.skills && profile.skills.length > 0 && !restricted && (
                          <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="flex items-center mb-2">
                              <div className="p-2 rounded-full bg-indigo-500/10 mr-2">
                                <Code size={16} className="text-indigo-400" />
                              </div>
                              <span className="font-medium text-indigo-300">Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-10">
                              {profile.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-500/30 
                                          text-indigo-300 text-xs font-medium hover:bg-indigo-900/60 
                                          transition-colors duration-200 cursor-default"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Interests section - moved here */}
                        {profile.interests && profile.interests.length > 0 && !restricted && (
                          <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="flex items-center mb-2">
                              <div className="p-2 rounded-full bg-indigo-500/10 mr-2">
                                <BookOpen size={16} className="text-indigo-400" />
                              </div>
                              <span className="font-medium text-purple-300">Interests</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-10">
                              {profile.interests.map((interest, index) => (
                                <span 
                                  key={index}
                                  className="px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-500/30 
                                          text-purple-300 text-xs font-medium hover:bg-purple-900/50 
                                          transition-colors duration-200 cursor-default"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {profile.website && !restricted && (
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="p-2 rounded-full bg-indigo-500/10">
                              <Globe size={16} className="text-indigo-400" />
                            </div>
                            <a 
                              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        
                        {profile.createdAt && (
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="p-2 rounded-full bg-indigo-500/10">
                              <Calendar size={16} className="text-indigo-400" />
                            </div>
                            <span className={subTextClass}>
                              Joined {formatDistanceToNow(new Date(profile.createdAt))} ago
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* About Section */}
                  <div className={`${glassCard} rounded-2xl p-6 shadow-lg`}>
                    <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>About</h2>
                    {restricted ? (
                      <div className="flex flex-col items-center justify-center py-6 bg-[#0F172A]/50 rounded-xl border border-indigo-500/10">
                        <Shield size={32} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 text-center">
                          Profile information is private
                        </p>
                      </div>
                    ) : (
                      <div className="bg-[#0F172A]/50 rounded-xl p-4 border border-indigo-500/10">
                        <p className="text-gray-300 leading-relaxed">
                          {profile.bio || "No bio available"}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Main Content */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-8"
                >
                  {/* Main Profile Card */}
                  <div className={`${glassCard} rounded-2xl p-6 shadow-lg mb-6`}>
                    {restricted ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-[#0F172A]/50 rounded-xl border border-indigo-500/10">
                        <Shield size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">Limited Profile Access</h3>
                        <p className="text-gray-400 text-center max-w-md mb-4">
                          {connection.status === 'accepted' 
                            ? "You're connected, but this user has restricted their profile information."
                            : "Connect with this user to see more profile information."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Connection Stats */}
                        {profile.connectionStats && (
                          <div className="mb-8">
                            <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Connections</h2>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-[#0F172A]/50 p-4 rounded-xl border border-indigo-500/10 text-center">
                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                                  {profile.connectionStats.linkUpsCount}
                                </p>
                                <p className="text-indigo-300 text-sm mt-1">LinkUps</p>
                              </div>
                              <div className="bg-[#0F172A]/50 p-4 rounded-xl border border-indigo-500/10 text-center">
                                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                                  {profile.connectionStats.followersCount}
                                </p>
                                <p className="text-indigo-300 text-sm mt-1">Followers</p>
                              </div>
                              <div className="bg-[#0F172A]/50 p-4 rounded-xl border border-indigo-500/10 text-center">
                                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                                  {profile.connectionStats.followingCount}
                                </p>
                                <p className="text-indigo-300 text-sm mt-1">Following</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Recent Activity */}
                        {/* Keep any existing activity code here */}
                      </>
                    )}
                  </div>

                  {/* New Compatibility Section */}
                  <div className={`${glassCard} rounded-2xl p-6 shadow-lg`}>
                    <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Compatibility</h2>
                    
                    {restricted ? (
                      <div className="flex flex-col items-center justify-center py-6 bg-[#0F172A]/50 rounded-xl border border-indigo-500/10">
                        <Shield size={32} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 text-center">
                          Compatibility data is private
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                            <Users size={18} className="mr-2" />
                            Team Compatibility
                          </h3>
                          
                          <div className="bg-[#0F172A]/70 p-4 rounded-xl border border-cyan-500/20">
                            {/* Team Compatibility Chart */}
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="flex flex-col items-center">
                                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                                <span className="text-xs text-cyan-400">Leadership</span>
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                                <span className="text-xs text-cyan-400">Collaboration</span>
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                                <span className="text-xs text-cyan-400">Communication</span>
                              </div>
                            </div>
                            
                            <div className="text-center mt-4 pt-4 border-t border-cyan-500/10">
                              <div className="text-3xl font-bold text-cyan-400 mb-1">85%</div>
                              <p className="text-gray-400 text-sm">Overall team compatibility</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center">
                            <PieChart size={18} className="mr-2" />
                            Project Compatibility
                          </h3>
                          
                          <div className="bg-[#0F172A]/70 p-4 rounded-xl border border-emerald-500/20">
                            {/* Project matches */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Palette size={16} className="text-emerald-400" />
                                  <span className="text-sm text-gray-200">Design Projects</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">94%</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Code size={16} className="text-emerald-400" />
                                  <span className="text-sm text-gray-200">Development Projects</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">87%</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Compass size={16} className="text-emerald-400" />
                                  <span className="text-sm text-gray-200">Research Projects</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">76%</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Most compatible:</span>
                              <div className="flex items-center text-emerald-300">
                                <Zap size={16} className="mr-1" />
                                <span className="font-medium">UI/UX Design</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* LinkUp Form Modal with enhanced styling */}
              <AnimatePresence>
                {showLinkUpForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-[#1E293B]/90 backdrop-blur-xl border border-indigo-500/30 rounded-xl p-6 max-w-md w-full shadow-xl"
                    >
                      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                        <UserPlus size={20} className="mr-3 text-indigo-400" />
                        Send LinkUp Request
                      </h2>
                      
                      <p className="text-gray-300 mb-6 border-l-2 border-indigo-500/50 pl-3">
                        Send a request to connect with <span className="text-indigo-300 font-medium">{profile.name}</span>
                      </p>
                      
                      <div className="mb-6">
                        <label className="block text-indigo-300 mb-2 font-medium">Add a message (optional)</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-[#0F172A]/80 border border-indigo-500/30 rounded-lg p-3 text-gray-200 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                          rows={4}
                          placeholder={`Hi ${profile.name}, I'd like to connect with you...`}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowLinkUpForm(false)}
                          className="px-4 py-2 text-gray-300 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50"
                          disabled={actionLoading}
                        >
                          Cancel
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendLinkUp}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border border-indigo-500/50 
                                  disabled:opacity-50 transition-colors flex items-center shadow-lg shadow-indigo-900/20"
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
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UnderConstruction />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(79, 70, 229, 0.3) rgba(30, 41, 59, 0.5);
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.5);
        }
      `}</style>
    </div>
  );
};

// Helper component for connection actions with enhanced styling
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
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all 
                  flex items-center disabled:opacity-50 shadow-lg shadow-indigo-900/20 border border-indigo-500/50"
      >
        <UserPlus size={18} className="mr-2" />
        Send LinkUp Request
      </motion.button>
    );
  }
  
  if (status === 'none' && !canConnect) {
    return (
      <div className="px-5 py-2.5 bg-gray-800/80 text-gray-400 rounded-lg flex items-center 
                     cursor-not-allowed border border-gray-700/50">
        <Shield size={18} className="mr-2" />
        Cannot Connect
      </div>
    );
  }
  
  if (status === 'request_sent') {
    return (
      <div className="px-5 py-2.5 bg-amber-900/30 text-amber-400 border border-amber-900/50 
                     rounded-lg flex items-center">
        <Clock size={18} className="mr-2" />
        Request Sent
      </div>
    );
  }
  
  if (status === 'request_received') {
    return (
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAccept}
          disabled={isLoadingAcceptLinkUp}
          className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 
                    disabled:opacity-50 shadow-lg shadow-green-900/30"
        >
          {isLoadingAcceptLinkUp ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Check size={18} />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReject}
          disabled={isLoadingRejectLinkUp}
          className="p-2.5 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 
                    disabled:opacity-50 shadow-lg shadow-gray-900/30"
        >
          {isLoadingRejectLinkUp ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <X size={18} />
          )}
        </motion.button>
        
        <span className="text-sm text-gray-400">LinkUp Request</span>
      </div>
    );
  }
  
  if (status === 'accepted') {
    return (
      <div className="px-5 py-2.5 bg-green-900/30 text-green-400 border border-green-900/50 
                     rounded-lg flex items-center">
        <Users size={18} className="mr-2" />
        Connected
      </div>
    );
  }
  
  if (status === 'declined') {
    return (
      <div className="flex space-x-2 items-center">
        <div className="px-5 py-2.5 bg-gray-700 text-gray-400 rounded-lg flex items-center 
                       border border-gray-700/50">
          <X size={18} className="mr-2" />
          Request Declined
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConnect}
          disabled={isLoadingSendLinkUp}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all 
                    flex items-center disabled:opacity-50 shadow-lg shadow-indigo-900/20 border border-indigo-500/50"
        >
          {isLoadingSendLinkUp ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <UserPlus size={18} />
          )}
        </motion.button>
      </div>
    );
  }
  
  return null;
};

export default UserProfilePage;