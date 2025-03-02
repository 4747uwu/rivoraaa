import React, { useState, useRef, useEffect } from 'react';
import { Mail, Edit2, Loader, CheckCircle, Clock, PlusCircle, Bell, Moon, Sun, LogOut, Camera, X, Save, Briefcase, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import { motion } from 'framer-motion';
import ActivityFeed from '../components/ActivityFeed';
import DashboardCharts from '../components/DashboardCharts';
import QuickActions from '../components/QuickActions';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../component/CalenderWidget';
import API from '../api/api'; // Make sure this path is correct

// Add these animation constants at the top of your component
const backgroundGradient = `bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]`;
const highlightGradient = `bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10`;

// Update these styling constants
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

const formInputClass = `
    bg-[#1E293B]/70
    border
    border-indigo-500/30
    focus:border-indigo-500/70
    rounded-lg
    px-4 py-2.5
    text-gray-100
    w-full
    transition-all
    duration-200
    focus:outline-none
    focus:ring-1
    focus:ring-indigo-500/30
    focus:shadow-[0_0_15px_rgba(79,70,229,0.15)]
`;

const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, logout, refreshUser } = useAuth(); // Ensure refreshUser is available
    const fileInputRef = useRef(null);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        bio: '',
        status: 'online',
        profession: '',
        profilePicture: ''
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
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
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
                profilePicture: user.profilePicture || ''
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
                if (typeof refreshUser === 'function') {
                    await refreshUser();
                }
                
                setIsEditing(false);
            } else {
                toast.error(result.data.message || "Failed to update profile");
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    if (!user) {
        navigate('/');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-100 mb-2">Not Authorized</h2>
                    <p className="text-gray-400">Please log in to view your profile</p>
                    <a href="/login" className="text-purple-400 hover:underline">Login</a>
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

    return (
        <div className={`min-h-screen ${backgroundGradient} p-6 md:p-8 transition-colors duration-300`}>
            {/* Improved logout button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className="fixed top-4 right-4 p-2.5 md:p-3 rounded-xl bg-red-950/30 backdrop-blur-lg border border-red-500/20 z-50 flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all duration-300 shadow-lg"
            >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
            </motion.button>

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

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-8xl mx-auto pt-2 "
            >
                {/* Top Section with improved spacing and layout */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-8">
                    {/* Profile Info - Enhanced card */}
                    <div className={`${glassCard} rounded-2xl p-4 col-span-1 lg:col-span-3 hover:shadow-indigo-500/5`}>
                        <div className="relative mb-6">
                            {/* Profile Image with enhanced styling */}
                            <div className="w-full h-60 rounded-xl overflow-hidden relative shadow-lg border border-indigo-500/20">
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
                                        <div className="p-3 bg-indigo-600/30 backdrop-blur-md rounded-full mb-2 border border-indigo-500/40">
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

                            {/* Edit buttons with improved styling */}
                            {isEditing ? (
                                <div className="absolute -bottom-3 right-3 flex space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-red-600/90 hover:bg-red-600 p-3 rounded-xl shadow-lg border border-red-500/30"
                                        onClick={toggleEditMode}
                                        disabled={isSaving}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-3 rounded-xl shadow-lg border border-indigo-500/30 ${
                                            isSaving 
                                                ? 'bg-indigo-700/80' 
                                                : 'bg-indigo-600/90 hover:bg-indigo-600'
                                        }`}
                                        onClick={saveProfile}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader className="w-4 h-4 text-white animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 text-white" />
                                        )}
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute -bottom-3 right-3 bg-indigo-600/90 hover:bg-indigo-600 p-3 rounded-xl shadow-lg border border-indigo-500/30"
                                    onClick={toggleEditMode}
                                >
                                    <Edit2 className="w-4 h-4 text-white" />
                                </motion.button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Name and profession with improved typography */}
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
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
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
                                                <Briefcase className="w-4 h-4 text-indigo-400" />
                                                <p className="text-indigo-300 font-medium">{user.profession}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No profession set</p>
                                        )}
                                    </div>
                                )}
                                
                                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/20">
                                    <p className={`${subTextClass} text-xs`}>Member since {formatDate(user.createdAt)}</p>
                                </div>
                            </div>

                            {/* User Details with improved spacing and icons */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-1 rounded-lg bg-indigo-500/5">
                                    <div className="p-2 rounded-full bg-indigo-500/10">
                                        <Mail className="w-4 h-4 text-indigo-400" />
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
                                        <span className={`${textClass} px-3 py-1 rounded-lg bg-indigo-500/5`}>@{user.username}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className={`${subTextClass} min-w-[80px]`}>Role:</div>
                                    <span className={`capitalize ${textClass} px-3 py-1 rounded-lg bg-indigo-500/5`}>{user.role}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className={`${subTextClass} min-w-[80px]`}>Status:</div>
                                    {isEditing ? (
                                        <select
                                            name="status"
                                            value={profileData.status}
                                            onChange={handleChange}
                                            className={`${formInputClass}`}
                                        >
                                            <option value="online">Online</option>
                                            <option value="away">Away</option>
                                            <option value="busy">Busy</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    ) : (
                                        <span className={`capitalize ${textClass} px-3 py-1 rounded-lg bg-indigo-500/5`}>{user.status}</span>
                                    )}
                                </div>
                                
                                {/* Enhanced Bio section */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-4 rounded-xl bg-[#1E293B]/70 backdrop-blur-sm 
                                               border border-indigo-500/20 hover:border-indigo-500/40 
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
                                        <div className="bg-[#0F172A]/50 rounded-lg p-3 border border-indigo-500/10">
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
                        <div className={`${glassCard} rounded-2xl p-6 hover:shadow-indigo-500/5`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-xl font-bold ${headingClass}`}>My Tasks</h2>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 
                                              transition-all duration-300 px-3 py-2 rounded-lg 
                                              bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 shadow-inner"
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
                                <div className={`text-center py-12 rounded-xl ${highlightGradient} border border-indigo-500/10`}>
                                    <Clock className="w-10 h-10 text-indigo-400/50 mx-auto mb-3" />
                                    <p className={`${subTextClass} mb-2`}>No tasks available</p>
                                    <button className="text-indigo-400 text-sm hover:text-indigo-300 underline underline-offset-2">
                                        Create your first task
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={`${glassCard} rounded-2xl p-6 hover:shadow-indigo-500/5`}>
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
                        <div className={`${glassCard} rounded-2xl p-0 hover:shadow-indigo-500/5`}>
                            {/* <h3 className={`text-xl font-bold mb-4 ${headingClass}`}>Calendar</h3> */}
                            <CalendarWidget
                                glassCard={glassCard}
                                textClass={textClass}
                                subTextClass={subTextClass}
                                darkMode={true}
                            />
                            
                            <div className="mt-4 p-3 rounded-xl bg-[#1E293B]/50 border border-indigo-500/20">
                                <h4 className="text-sm font-semibold text-indigo-300 mb-2">Upcoming</h4>
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