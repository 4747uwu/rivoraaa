import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, Edit2, Loader, CheckCircle, Clock, PlusCircle, Bell, Moon, Sun, LogOut, Camera, X, Save, 
  Briefcase, Trash2, MessageCircle, ArrowLeft, Settings, Globe, ExternalLink, Award, BarChart2, 
  Calendar, Link, Terminal, Bookmark, Paperclip, FileText, Github, Twitter, Linkedin, Code,
  User, MapPin, Hash, Activity, Check, Shield, Star, Coffee, Eye, EyeOff, Zap, Share2, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../component/CalenderWidget';
import API from '../api/api';

// Advanced theme constants
const backgroundGradient = `bg-gradient-to-br from-[#121212]/95 via-[#161616]/95 to-[#121212]/95`;

const glassCard = `
    bg-[#1A1A1A]/30
    backdrop-blur-xl
    shadow-[0_8px_32px_rgba(0,0,0,0.2)]
    border
    border-white/8
    hover:border-white/12
    transition-all
    duration-300
    group
    backdrop-saturate-150
`;

const glassInput = `
    bg-[#1A1A1A]/50
    backdrop-blur-xl
    border
    border-white/10
    focus:border-white/20
    rounded-xl
    px-4 py-3
    text-[#E0E0E0]
    w-full
    transition-all
    duration-200
    focus:outline-none
    focus:ring-1
    focus:ring-white/10
    shadow-[0_4px_12px_rgba(0,0,0,0.1)]
    placeholder:text-gray-500
`;

const formInputClass = `${glassInput}`;
const headingClass = 'text-white font-display tracking-tight';
const textClass = 'text-[#E0E0E0]';
const subTextClass = 'text-[#B3B3B3]';

// Noise overlay component


// Achievement badge component
const AchievementBadge = ({ title, date, description, icon }) => {
  const Icon = icon || Award;
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 flex items-start gap-4"
    >
      <div className="p-2.5 rounded-lg bg-white/15 backdrop-blur-xl">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-300 mb-1.5">{description}</p>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Activity item component
const ActivityItem = ({ type, content, time, project, icon }) => {
  const getActivityIcon = () => {
    switch(type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'project_created': return <PlusCircle className="w-4 h-4 text-blue-400" />;
      case 'profile_updated': return <User className="w-4 h-4 text-purple-400" />;
      default: return icon || <Activity className="w-4 h-4 text-gray-400" />;
    }
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
        {getActivityIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-300 mb-1">{content}</p>
        <div className="flex items-center gap-4">
          {project && (
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">{project}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Statistic card component
const StatCard = ({ icon, label, value, trend, color = "white" }) => {
  const Icon = icon;
  
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          } text-xs font-medium`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
};

// Tab button component
const TabButton = ({ active, label, icon, onClick }) => {
  const Icon = icon;
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
        active 
          ? 'bg-white text-black font-medium' 
          : 'bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

// Main Profile component
const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, logout, refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    
    // State management
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        bio: '',
        status: 'online',
        profession: '',
        location: '',
        profilePicture: '',
        skills: [],
        interests: [],
        achievements: [],
        socialLinks: {
          github: '',
          twitter: '',
          linkedin: '',
          website: ''
        }
    });

    // New features state
    const [availabilityStatus, setAvailabilityStatus] = useState('online');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [personalDomain, setPersonalDomain] = useState('');
    const [showThemeOptions, setShowThemeOptions] = useState(false);
    
    // Mock statistics data
    const [stats] = useState({
      completed: 42,
      ongoing: 7,
      contributions: 126,
      streak: 14
    });

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                status: user.status || 'online',
                profession: user.profession || '',
                location: user.location || '',
                profilePicture: user.profilePicture || '',
                skills: user.skills || [],
                interests: user.interests || [],
                achievements: user.achievements || [],
                socialLinks: user.socialLinks || {
                    github: '',
                    twitter: '',
                    linkedin: '',
                    website: ''
                }
            });
            setAvailabilityStatus(user.status || 'online');
            setIsPublic(user.isPublic || false);
        }
    }, [user]);

    // Form handling functions
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialLinkChange = (platform, value) => {
        setProfileData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, profilePicture: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // Edit mode toggling
    const toggleEditMode = () => {
        if (isEditing) {
            // Reset form data when canceling
            setProfileData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                status: user.status || 'online',
                profession: user.profession || '',
                location: user.location || '',
                profilePicture: user.profilePicture || '',
                skills: user.skills || [],
                interests: user.interests || [],
                achievements: user.achievements || [],
                socialLinks: user.socialLinks || {
                    github: '',
                    twitter: '',
                    linkedin: '',
                    website: ''
                }
            });
        }
        setIsEditing(!isEditing);
    };

    // Profile data saving
    const saveProfile = async () => {
        try {
            setIsSaving(true);
            
            let data;
            let config = {};
            
            // Handle file upload if profile picture is a base64 string
            if (profileData.profilePicture && profileData.profilePicture.startsWith('data:image')) {
                // Using FormData for file uploads
                const formData = new FormData();
                
                // Convert base64 to blob and then to file
                const response = await fetch(profileData.profilePicture);
                const blob = await response.blob();
                const file = new File([blob], "profile.jpg", { type: blob.type });
                
                formData.append('profilePicture', file);
                formData.append('name', profileData.name);
                formData.append('username', profileData.username);
                formData.append('bio', profileData.bio);
                formData.append('status', profileData.status);
                formData.append('profession', profileData.profession);
                formData.append('location', profileData.location);
                formData.append('skills', JSON.stringify(profileData.skills));
                formData.append('interests', JSON.stringify(profileData.interests));
                formData.append('achievements', JSON.stringify(profileData.achievements));
                formData.append('socialLinks', JSON.stringify(profileData.socialLinks));
                formData.append('isPublic', isPublic);
                
                data = formData;
                config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };
            } else {
                // Regular JSON data if no new image
                data = {...profileData, isPublic};
            }
            
            const result = await API.put('/api/user/profile', data, config);
            
            if (result.data.success) {
                toast.success("Profile updated successfully!");
                
                // Refresh user data in auth context
                await refreshUser();
                
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || "An error occurred while updating your profile");
        } finally {
            setIsSaving(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07 }
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

    // Skills and interests handlers
    const handleSkillChange = (index, value) => {
        const newSkills = [...profileData.skills];
        newSkills[index] = value;
        setProfileData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleInterestChange = (index, value) => {
        const newInterests = [...profileData.interests];
        newInterests[index] = value;
        setProfileData(prev => ({ ...prev, interests: newInterests }));
    };

    const addSkill = () => {
        setProfileData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    };

    const removeSkill = (index) => {
        const newSkills = [...profileData.skills];
        newSkills.splice(index, 1);
        setProfileData(prev => ({ ...prev, skills: newSkills }));
    };

    const addInterest = () => {
        setProfileData(prev => ({ ...prev, interests: [...prev.interests, ''] }));
    };

    const removeInterest = (index) => {
        const newInterests = [...profileData.interests];
        newInterests.splice(index, 1);
        setProfileData(prev => ({ ...prev, interests: newInterests }));
    };

    // Update availability status
    const updateAvailabilityStatus = (status) => {
        setAvailabilityStatus(status);
        setProfileData(prev => ({ ...prev, status }));
        setShowStatusDropdown(false);
        toast.success(`Status updated to ${status}`);
    };

    // Handle personal domain setup
    const handlePersonalDomain = () => {
        if (personalDomain) {
            toast.success(`Domain ${personalDomain}.rivora.com reserved successfully!`);
            setShowDomainModal(false);
            setPersonalDomain('');
        } else {
            toast.error("Please enter a valid domain name");
        }
    };

    // Achievement handlers
    const addAchievement = () => {
        setProfileData(prev => ({
            ...prev,
            achievements: [
                ...prev.achievements, 
                { title: '', date: new Date().toISOString().split('T')[0], description: '' }
            ]
        }));
    };

    const updateAchievement = (index, field, value) => {
        const newAchievements = [...profileData.achievements];
        newAchievements[index] = {
            ...newAchievements[index],
            [field]: value
        };
        setProfileData(prev => ({ ...prev, achievements: newAchievements }));
    };

    const removeAchievement = (index) => {
        const newAchievements = [...profileData.achievements];
        newAchievements.splice(index, 1);
        setProfileData(prev => ({ ...prev, achievements: newAchievements }));
    };

    // Toggle public profile setting
    const togglePublicProfile = () => {
        setIsPublic(!isPublic);
        toast.success(`Profile visibility set to ${!isPublic ? 'public' : 'private'}`);
    };

    // Copy profile link to clipboard
    const copyProfileLink = () => {
        const profileUrl = `${window.location.origin}/profile/${profileData.username}`;
        navigator.clipboard.writeText(profileUrl);
        toast.success("Profile link copied to clipboard!");
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121212]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader className="w-8 h-8 text-white" />
                </motion.div>
            </div>
        );
    }

    if (!user) {
        navigate('/');
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121212]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Not Authorized</h2>
                    <p className="text-gray-400">Please log in to view your profile</p>
                    <a href="/login" className="text-white hover:underline">Login</a>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <div className={`min-h-screen ${backgroundGradient} p-4 md:p-8 transition-colors duration-300 relative overflow-hidden`}>
            {/* Noise overlay for texture */}
            
            
            {/* Background gradient effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-black opacity-95" />
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full mix-blend-soft-light filter blur-3xl"
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
                            background: `radial-gradient(circle, rgba(255,255,255,0.${i + 1}) 0%, transparent 70%)`,
                            left: `${i * 20}%`,
                            top: `${i * 15}%`,
                            opacity: 0.4,
                        }}
                    />
                ))}
            </div>

            {/* Navigation buttons */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-lg bg-black/20 flex justify-between items-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="p-2 md:px-4 md:py-2 rounded-xl bg-white/5 border border-white/10 
                            flex items-center gap-2 text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline text-sm font-medium">Dashboard</span>
                </motion.button>
                
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareModal(true)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 
                                text-white hover:bg-white/10 transition-all"
                        title="Share profile"
                    >
                        <Share2 className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePublicProfile}
                        className={`p-2 rounded-xl ${isPublic ? 'bg-white/10' : 'bg-white/5'} border border-white/10 
                                text-white hover:bg-white/15 transition-all`}
                        title={isPublic ? "Public profile" : "Private profile"}
                    >
                        {isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </motion.button>
                    
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowThemeOptions(!showThemeOptions)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 
                                    text-white hover:bg-white/10 transition-all"
                            title="Theme options"
                        >
                            {true ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </motion.button>
                        
                        {showThemeOptions && (
                            <div className="absolute top-full right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl p-2 w-48">
                                <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                    <Moon className="w-4 h-4 text-gray-300" />
                                    <span className="text-sm text-gray-300">Dark (Current)</span>
                                </div>
                                <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                    <Sun className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">Light</span>
                                </div>
                                <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">System</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => logout()}
                        className="p-2 md:px-4 md:py-2 rounded-xl bg-white/5 border border-white/10 
                                flex items-center gap-2 text-white hover:bg-red-500/10 hover:border-red-500/20 
                                hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline text-sm font-medium">Logout</span>
                    </motion.button>
                </div>
            </div>

            {/* Main content */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto pt-20 "
            >
                {/* Profile header section */}
            <div className='grid grid-cols-5 gap-6 mb-6'> {/* Changed from grid-cols-2 to grid-cols-5 */}
                <motion.div 
                    variants={itemVariants}
                    className={`${glassCard} rounded-2xl p-8 col-span-3`} // Changed from col-span-4 to col-span-3
                >
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {/* Profile image */}
                        <div className="relative w-full max-w-[200px] md:w-48 mx-auto md:mx-0">
                            <div className="aspect-square rounded-2xl overflow-hidden relative shadow-lg border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#121212]">
                                {profileData.profilePicture ? (
                                    <img
                                        src={profileData.profilePicture}
                                        alt={profileData.name || 'Profile'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-600" />
                                    </div>
                                )}
                                
                                {isEditing && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-full mb-3 border border-white/20">
                                            <Camera className="w-7 h-7 text-white" />
                                        </div>
                                        <p className="text-white font-medium text-sm">Change Photo</p>
                                    </motion.div>
                                )}
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            
                            {/* Status indicator */}
                            <div className="absolute bottom-2 right-2">
                                <div className="relative">
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#1A1A1A] border-4 border-[#0A0A0A]`}
                                    >
                                        <div className={`w-4 h-4 rounded-full ${getStatusColor(availabilityStatus)}`}></div>
                                    </motion.button>
                                    
                                    {showStatusDropdown && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-lg z-10 w-40 overflow-hidden">
                                            <div className="p-2 border-b border-white/5">
                                                <h5 className="text-xs uppercase text-gray-400 font-medium tracking-wider">Set Status</h5>
                                            </div>
                                            {['online', 'away', 'busy', 'offline'].map(status => (
                                                <button
                                                    key={status}
                                                    className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-white/5 text-left"
                                                    onClick={() => updateAvailabilityStatus(status)}
                                                >
                                                    <span className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
                                                    <span className="capitalize text-sm text-gray-300">{status}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile info */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className={`${formInputClass} text-2xl mb-2 font-bold`}
                                        />
                                    ) : (
                                        <h2 className={`text-3xl font-bold mb-1 ${headingClass}`}>{user.name}</h2>
                                    )}
                                    
                                    {/* Profession field with icon */}
                                    {isEditing ? (
                                        <div className="mt-2 mb-2 relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="profession"
                                                value={profileData.profession || ''}
                                                onChange={handleChange}
                                                placeholder="Your profession"
                                                className={`${formInputClass} pl-10 text-center text-sm`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5">
                                            {user.profession ? (
                                                <>
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <p className="text-[#E0E0E0] font-medium">{user.profession}</p>
                                                </>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No profession set</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Availability Status - New Feature */}
                                    <div className="mt-4 inline-flex items-center gap-2">
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#333333] text-sm"
                                            >
                                                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(availabilityStatus)}`}></span>
                                                <span className={`capitalize ${textClass}`}>{availabilityStatus}</span>
                                            </button>
                                            
                                            {showStatusDropdown && (
                                                <div className="absolute top-full left-0 mt-1 bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-lg z-10 w-32 overflow-hidden">
                                                    {['online', 'away', 'busy', 'offline'].map(status => (
                                                        <button
                                                            key={status}
                                                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 text-left text-sm"
                                                            onClick={() => updateAvailabilityStatus(status)}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></span>
                                                            <span className={`capitalize ${textClass}`}>{status}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-xs ${subTextClass}`}>
                                            Member since {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit buttons with updated styling */}
                                {isEditing ? (
                                    <div className="flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-[#1A1A1A] hover:bg-white/10 p-3 rounded-xl shadow-lg border border-[#333333] text-white"
                                            onClick={toggleEditMode}
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-3 rounded-xl shadow-lg border border-[#333333] ${
                                                isSaving 
                                                    ? 'bg-[#1A1A1A]' 
                                                    : 'bg-white text-[#121212] hover:bg-white/90'
                                            }`}
                                            onClick={saveProfile}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <Loader className="w-4 h-4 text-white animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                        </motion.button>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white text-[#121212] hover:bg-white/90 p-3 rounded-xl shadow-lg border border-[#333333]"
                                        onClick={toggleEditMode}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </div>

                            {/* User Details with updated styling */}
                            <div className="space-y-6 mt-6">
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#121212] border border-[#292929]">
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <Mail className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <span className={`${textClass} text-sm break-all`}>{user.email}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className={`${subTextClass} min-w-[80px]`}>Username:</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={profileData.username}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            className={`${formInputClass} flex-1`}
                                        />
                                    ) : (
                                        <span className={`${textClass} px-3 py-1 rounded-lg bg-[#121212] border border-[#292929]`}>@{user.username}</span>
                                    )}
                                </div>
                                
                                {/* Personal Domain - New Feature */}
                                <div className="flex flex-col gap-2">
                                    <div className={`flex items-center justify-between ${subTextClass}`}>
                                        <span>Personal URL:</span>
                                        <button 
                                            onClick={() => setShowDomainModal(true)}
                                            className="text-xs text-white hover:underline"
                                        >
                                            {user.personalDomain ? 'Change' : 'Set up'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-gray-300" />
                                        {user.personalDomain ? (
                                            <a 
                                                href={`https://${user.personalDomain}.rivora.com`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-white hover:underline flex items-center gap-1"
                                            >
                                                {user.personalDomain}.rivora.com
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">Not set up yet</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Skills Section */}
                                <div className="flex flex-col gap-3">
                                    <div className={`${subTextClass} min-w-[80px] font-medium`}>Skills:</div>
                                    
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            {profileData.skills.map((skill, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={skill}
                                                        onChange={(e) => handleSkillChange(index, e.target.value)}
                                                        placeholder="Add skill"
                                                        className={`${formInputClass} flex-1`}
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => removeSkill(index)}
                                                        className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-white/10 border border-[#333333]"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </motion.button>
                                                </div>
                                            ))}
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={addSkill}
                                                className="w-full py-2 mt-1 flex items-center justify-center gap-1 rounded-lg 
                                                        border border-[#333333] bg-[#1A1A1A] hover:bg-white/5 
                                                        text-[#E0E0E0] text-sm transition-all duration-200"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Add Skill
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {user.skills && user.skills.length > 0 ? (
                                                user.skills.map((skill, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1.5 rounded-lg bg-[#292929] border border-[#333333] 
                                                                text-[#E0E0E0] text-sm font-medium hover:bg-[#333333] 
                                                                transition-colors duration-200 cursor-default"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No skills added</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Interests Section */}
                                <div className="flex flex-col gap-3">
                                    <div className={`${subTextClass} min-w-[80px] font-medium`}>Interests:</div>
                                    
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            {profileData.interests.map((interest, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={interest}
                                                        onChange={(e) => handleInterestChange(index, e.target.value)}
                                                        placeholder="Add interest"
                                                        className={`${formInputClass} flex-1`}
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: .95 }}
                                                        onClick={() => removeInterest(index)}
                                                        className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-white/10 border border-[#333333]"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                                    </motion.button>
                                                </div>
                                            ))}
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={addInterest}
                                                className="w-full py-2 mt-1 flex items-center justify-center gap-1 rounded-lg 
                                                        border border-[#333333] bg-[#1A1A1A] hover:bg-white/5 
                                                        text-[#E0E0E0] text-sm transition-all duration-200"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Add Interest
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {user.interests && user.interests.length > 0 ? (
                                                user.interests.map((interest, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1.5 rounded-lg bg-[#292929] border border-[#333333] 
                                                                text-[#E0E0E0] text-sm font-medium hover:bg-[#333333] 
                                                                transition-colors duration-200 cursor-default"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No interests added</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Enhanced Bio section */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-2 rounded-xl bg-[#1A1A1A] backdrop-blur-sm 
                                            border border-[#333333] hover:border-white/10 
                                            transition-all duration-300 shadow-lg"
                                >
                                    <h3 className={`font-semibold mb-1 ${headingClass}`}>Bio</h3>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            value={profileData.bio || ''}
                                            onChange={handleChange}
                                            placeholder="Write something about yourself..."
                                            className={`${formInputClass} h-24 resize-none`}
                                        ></textarea>
                                    ) : (
                                        <div className="bg-[#121212] rounded-lg p-2 border border-[#292929]">
                                            <p className={`text-sm leading-relaxed ${user.bio ? textClass : 'text-gray-500 italic'}`}>
                                                {user.bio || "No bio available"}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                        
                    </div>

                    
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className={`${glassCard} rounded-2xl  col-span-2`} // Changed to col-span-2 and fixed height
                >
                    <CalendarWidget
                        glassCard={glassCard}
                        textClass={textClass}
                        subTextClass={subTextClass}
                        darkMode={true}
                    />
                </motion.div>

            </div>

                {/* Tabs section */}
                <motion.div 
                    variants={itemVariants}
                    className="flex gap-4 mb-6"
                >
                    <TabButton 
                        active={activeTab === 'overview'} 
                        label="Overview" 
                        icon={User} 
                        onClick={() => setActiveTab('overview')} 
                    />
                    <TabButton 
                        active={activeTab === 'achievements'} 
                        label="Achievements" 
                        icon={Award} 
                        onClick={() => setActiveTab('achievements')} 
                    />
                    <TabButton 
                        active={activeTab === 'activity'} 
                        label="Activity" 
                        icon={Activity} 
                        onClick={() => setActiveTab('activity')} 
                    />
                    <TabButton 
                        active={activeTab === 'stats'} 
                        label="Stats" 
                        icon={BarChart2} 
                        onClick={() => setActiveTab('stats')} 
                    />
                </motion.div>

                {/* Tab content */}
                <AnimatePresence exitBeforeEnter>
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                                {/* Tasks section - enhanced styling */}
                                <div className='col-span-1 lg:col-span-6 lg:row-span-3 flex flex-col gap-6'>
                                    <div className={`${glassCard} rounded-2xl p-6 hover:shadow-white/5`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className={`text-xl font-bold ${headingClass}`}>My Tasks</h2>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 text-[#E0E0E0] hover:text-white 
                                                        transition-all duration-300 px-3 py-2 rounded-lg 
                                                        bg-[#1A1A1A] hover:bg-white/10 border border-[#333333] shadow-inner"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Add Task</span>
                                            </motion.button>
                                        </div>
                                        
                                        {user.tasks && user.tasks.length > 0 ? (
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                                {user.tasks.map(task => (
                                                    // <TaskCard 
                                                    //     key={task._id} 
                                                    //     task={task} 
                                                    //     formatDate={formatDate}
                                                    //     textClass={textClass}
                                                    //     subTextClass={subTextClass}
                                                    // />
                                                    <span>Task</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className={`text-center py-12 rounded-xl ${highlightGradient} border border-[#333333]`}>
                                                <Clock className="w-10 h-10 text-gray-400/50 mx-auto mb-3" />
                                                <p className={`${subTextClass} mb-2`}>No tasks available</p>
                                                <button className="text-[#E0E0E0] text-sm hover:text-white underline underline-offset-2">
                                                    Create your first task
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`${glassCard} rounded-2xl p-6 hover:shadow-white/5`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className={`text-xl font-bold ${headingClass}`}>Recent Activity</h2>
                                        </div>
                                        
                                        <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                            {[1, 2, 3].map(i => (
                                                <ActivityItem key={i} index={i} textClass={textClass} subTextClass={subTextClass} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar section - enhanced styling */}
                               

                                {/* Achievements section */}
                                <div className="col-span-1 lg:col-span-3">
                                    <div className={`${glassCard} rounded-2xl p-6 hover:shadow-white/5`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className={`text-xl font-bold ${headingClass}`}>Achievements</h2>
                                            {isEditing && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={addAchievement}
                                                    className="flex items-center gap-2 text-[#E0E0E0] hover:text-white 
                                                            transition-all duration-300 px-3 py-2 rounded-lg 
                                                            bg-[#1A1A1A] hover:bg-white/10 border border-[#333333] shadow-inner"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Add Achievement</span>
                                                </motion.button>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                            {profileData.achievements.map((achievement, index) => (
                                                <AchievementBadge 
                                                    key={index} 
                                                    title={achievement.title} 
                                                    date={achievement.date} 
                                                    description={achievement.description} 
                                                    icon={Sparkles} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'achievements' && (
                        <motion.div 
                            key="achievements"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`${glassCard} rounded-2xl p-6 hover:shadow-white/5`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-bold ${headingClass}`}>Achievements</h2>
                                    {isEditing && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={addAchievement}
                                            className="flex items-center gap-2 text-[#E0E0E0] hover:text-white 
                                                    transition-all duration-300 px-3 py-2 rounded-lg 
                                                    bg-[#1A1A1A] hover:bg-white/10 border border-[#333333] shadow-inner"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Add Achievement</span>
                                        </motion.button>
                                    )}
                                </div>
                                
                                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                                    {profileData.achievements.map((achievement, index) => (
                                        <AchievementBadge 
                                            key={index} 
                                            title={achievement.title} 
                                            date={achievement.date} 
                                            description={achievement.description} 
                                            icon={Sparkles} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <motion.div 
                            key="activity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`${glassCard} rounded-2xl p-6 hover:shadow-white/5`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-bold ${headingClass}`}>Recent Activity</h2>
                                </div>
                                
                                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <ActivityItem key={i} index={i} textClass={textClass} subTextClass={subTextClass} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'stats' && (
                        <motion.div 
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard 
                                    icon={CheckCircle} 
                                    label="Completed Tasks" 
                                    value={stats.completed} 
                                    trend={5} 
                                    color="green" 
                                />
                                <StatCard 
                                    icon={Clock} 
                                    label="Ongoing Tasks" 
                                    value={stats.ongoing} 
                                    trend={-2} 
                                    color="yellow" 
                                />
                                <StatCard 
                                    icon={Zap} 
                                    label="Contributions" 
                                    value={stats.contributions} 
                                    trend={10} 
                                    color="blue" 
                                />
                                <StatCard 
                                    icon={Star} 
                                    label="Streak" 
                                    value={`${stats.streak} days`} 
                                    trend={3} 
                                    color="purple" 
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Add custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(79, 70, 229, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(79, 70, 229, 0.5);
                }
            `}</style>
        </div>
    );
};

export default Profile;