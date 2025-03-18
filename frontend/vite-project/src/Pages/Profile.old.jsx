import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, Edit2, Loader, CheckCircle, Clock, PlusCircle, Bell, Moon, Sun, LogOut, Camera, X, Save, 
  Briefcase, Trash2, MessageCircle, ArrowLeft, Settings, Globe, ExternalLink, Award, BarChart2, 
  Calendar, Link, Terminal, Bookmark, Paperclip, FileText, 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../component/CalenderWidget';
import API from '../api/api';

// Updated theme constants with frosted glass effects
const backgroundGradient = `bg-gradient-to-br from-[#121212]/90 via-[#1A1A1A]/90 to-[#121212]/90`;

const glassCard = `
    bg-[#1A1A1A]/40
    backdrop-blur-xl
    shadow-[0_8px_32px_rgb(0,0,0,0.15)]
    border
    border-white/5
    hover:border-white/10
    transition-all
    duration-300
    group
    backdrop-saturate-150
    backdrop-brightness-[1.1]
`;

const textClass = 'text-[#E0E0E0]';
const headingClass = 'text-white';
const subTextClass = 'text-[#B3B3B3]';

const formInputClass = `
    bg-[#1A1A1A]
    border
    border-[#333333]
    focus:border-white/30
    rounded-lg
    px-4 py-2.5
    text-[#E0E0E0]
    w-full
    transition-all
    duration-200
    focus:outline-none
    focus:ring-1
    focus:ring-white/20
    focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]
`;

const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, logout, refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        bio: '',
        status: 'online',
        profession: '',
        profilePicture: '',
        skills: [],
        interests: [],
        // socialLinks: {
        //     github: '',
        //     twitter: '',
        //     linkedin: '',
        //     website: ''
        // },
        achievements: []
    });

    // New features state
    const [availabilityStatus, setAvailabilityStatus] = useState('online');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [personalDomain, setPersonalDomain] = useState('');

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                status: user.status || 'online',
                profession: user.profession || '',
                profilePicture: user.profilePicture || '',
                skills: user.skills || [],
                interests: user.interests || [],
                // socialLinks: user.socialLinks || {
                //     github: '',
                //     twitter: '',
                //     linkedin: '',
                //     website: ''
                // },
                achievements: user.achievements || []
            });
            setAvailabilityStatus(user.status || 'online');
        }
    }, [user]);

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

    const toggleEditMode = () => {
        if (isEditing) {
            // Reset form data when canceling
            setProfileData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                status: user.status || 'online',
                profession: user.profession || '',
                profilePicture: user.profilePicture || '',
                skills: user.skills || [],
                interests: user.interests || [],
                // socialLinks: user.socialLinks || {
                //     github: '',
                //     twitter: '',
                //     linkedin: '',
                //     website: ''
                // },
                achievements: user.achievements || []
            });
        }
        setIsEditing(!isEditing);
    };

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
                formData.append('skills', JSON.stringify(profileData.skills));
                formData.append('interests', JSON.stringify(profileData.interests));
                formData.append('socialLinks', JSON.stringify(profileData.socialLinks));
                
                data = formData;
                config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };
            } else {
                // Regular JSON data if no new image
                data = profileData;
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

    // New feature: Update availability status
    const updateAvailabilityStatus = (status) => {
        setAvailabilityStatus(status);
        setShowStatusDropdown(false);
        
        // In a real implementation, you would save this to the backend
        toast.success(`Status updated to ${status}`);
    };

    // New feature: Add personal domain handler
    const handlePersonalDomain = () => {
        if (personalDomain) {
            // In a real implementation, you would validate and save this domain
            toast.success(`Domain ${personalDomain}.rivora.com reserved successfully!`);
            setShowDomainModal(false);
            setPersonalDomain('');
        } else {
            toast.error("Please enter a valid domain name");
        }
    };

    // New feature: Add achievement
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

    // Update the main return container
    return (
        <div className={`min-h-screen ${backgroundGradient} p-6 md:p-8 transition-colors duration-300 relative overflow-hidden`}>
            {/* Add noise overlay */}
            
            
            {/* Add glass background effect */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#121212] opacity-90" />
                {[...Array(3)].map((_, i) => (
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
                        }}
                    />
                ))}
            </div>

            {/* Update navigation buttons with glass effect */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className="fixed top-2 right-4 p-1 md:p-3 rounded-xl bg-[#1A1A1A]/40 backdrop-blur-xl 
                        border border-white/10 z-50 flex items-center gap-2 text-[#E0E0E0] 
                        hover:text-white hover:bg-white/10 transition-all duration-300 shadow-lg"
            >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="fixed top-2 left-4 p-1 md:p-3 rounded-xl bg-[#1A1A1A] border border-[#333333] z-50 flex items-center gap-2 text-[#E0E0E0] hover:text-white hover:bg-white/10 transition-all duration-300 shadow-lg"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Dashboard</span>
            </motion.button>

            {/* Clean background with minimal effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full mix-blend-soft-light filter blur-3xl opacity-10"
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
                            background: `rgba(255, 255, 255, 0.${i + 1})`,
                            left: `${i * 20}%`,
                            top: `${i * 15}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-8xl mx-auto pt-2"
            >
                {/* Profile navigation tabs
                <motion.div variants={itemVariants} className="flex items-center justify-center mb-8 pt-10">
                    <div className="flex items-center gap-2 p-1 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'profile' 
                                ? 'bg-white text-[#121212]' 
                                : 'text-[#B3B3B3] hover:text-white'
                            }`}
                        >
                            Profile
                        </button>
                        <button 
                            onClick={() => setActiveTab('portfolio')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'portfolio' 
                                ? 'bg-white text-[#121212]' 
                                : 'text-[#B3B3B3] hover:text-white'
                            }`}
                        >
                            Portfolio
                        </button>
                        <button 
                            onClick={() => setActiveTab('achievements')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'achievements' 
                                ? 'bg-white text-[#121212]' 
                                : 'text-[#B3B3B3] hover:text-white'
                            }`}
                        >
                            Achievements
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'settings' 
                                ? 'bg-white text-[#121212]' 
                                : 'text-[#B3B3B3] hover:text-white'
                            }`}
                        >
                            Settings
                        </button>
                    </div>
                </motion.div> */}

                {activeTab === 'profile' && (
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                        {/* Profile Info Card */}
                        <div className={`${glassCard} rounded-2xl p-6 col-span-1 lg:col-span-3 hover:shadow-white/5`}>
                            <div className="relative mb-6">
                                {/* Profile Image with updated styling */}
                                <div className="w-full h-60 rounded-xl overflow-hidden relative shadow-lg border border-[#333333]">
                                    <img
                                        src={profileData.profilePicture || 'https://via.placeholder.com/400x200?text=No+Profile+Picture'}
                                        alt={profileData.name || 'Profile'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    
                                    {isEditing && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer transition-all"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full mb-2 border border-white/20">
                                                <Camera className="w-8 h-8 text-white" />
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

                                {/* Edit buttons with updated styling */}
                                {isEditing ? (
                                    <div className="absolute -bottom-3 right-3 flex space-x-2">
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
                                        className="absolute -bottom-3 right-3 bg-white text-[#121212] hover:bg-white/90 p-3 rounded-xl shadow-lg border border-[#333333]"
                                        onClick={toggleEditMode}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Name and profession with updated typography */}
                                <div className="text-center">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className={`${formInputClass} text-center text-xl mb-2`}
                                        />
                                    ) : (
                                        <h2 className={`text-2xl font-bold mb-1 ${headingClass}`}>{user.name}</h2>
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

                                {/* User Details with updated styling */}
                                <div className="space-y-5">
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
                                        className="p-4 rounded-xl bg-[#1A1A1A] backdrop-blur-sm 
                                                border border-[#333333] hover:border-white/10 
                                                transition-all duration-300 shadow-lg"
                                    >
                                        <h3 className={`font-semibold mb-3 ${headingClass}`}>Bio</h3>
                                        {isEditing ? (
                                            <textarea
                                                name="bio"
                                                value={profileData.bio || ''}
                                                onChange={handleChange}
                                                placeholder="Write something about yourself..."
                                                className={`${formInputClass} h-24 resize-none`}
                                            ></textarea>
                                        ) : (
                                            <div className="bg-[#121212] rounded-lg p-3 border border-[#292929]">
                                                <p className={`text-sm leading-relaxed ${user.bio ? textClass : 'text-gray-500 italic'}`}>
                                                    {user.bio || "No bio available"}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

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
                                
                                {/* <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                                    {[1, 2, 3].map(i => (
                                        <ActivityItem key={i} index={i} textClass={textClass} subTextClass={subTextClass} />
                                    ))}
                                </div> */}
                            </div>
                        </div>

                        {/* Calendar section - enhanced styling */}
                        <div className="col-span-1 lg:col-span-3">
                            <div className={`${glassCard} rounded-2xl p-0 hover:shadow-white/5`}>
                                {/* <h3 className={`text-xl font-bold mb-4 ${headingClass}`}>Calendar</h3> */}
                                <CalendarWidget
                                    glassCard={glassCard}
                                    textClass={textClass}
                                    subTextClass={subTextClass}
                                    darkMode={true}
                                />
                                
                                <div className="mt-4 p-3 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                                    <h4 className="text-sm font-semibold text-[#E0E0E0] mb-2">Upcoming</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                <span className={textClass}>Team Meeting</span>
                                            </div>
                                            <span className={subTextClass}>Tomorrow</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                                <span className={textClass}>Project Deadline</span>
                                            </div>
                                            <span className={subTextClass}>Friday</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

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
            </motion.div>
        </div>
    );
};

export default Profile;