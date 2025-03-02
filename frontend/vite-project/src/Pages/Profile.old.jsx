import React, { useState, useRef } from 'react';
import { Mail, Edit2, Loader, CheckCircle, Clock, PlusCircle, Bell, Moon, Sun, LogOut, Camera, X, Save } from 'lucide-react';
import { toast } from 'react-toastify'; // Make sure to install if not already there
import { useAuth } from '../context/authContext';
import { motion } from 'framer-motion';
import ActivityFeed from '../components/ActivityFeed';
import DashboardCharts from '../components/DashboardCharts';
import QuickActions from '../components/QuickActions';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../component/CalenderWidget';

const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

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

    const glassCard = `
        bg-gray-800/40
        backdrop-blur
        shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        border
        border-gray-700/30
        hover:border-purple-500/20
        transition-all
        duration-300
    `;
    const textClass = 'text-gray-100 font-medium';
    const subTextClass = 'text-gray-400/80';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader className="w-8 h-8 text-purple-600" />
                </motion.div>
            </div>
        );
    }

    if (!user) {
        navigate('/');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Not Authorized</h2>
                    <p className="text-gray-600">Please log in to view your profile</p>
                    <a href="/login" className="text-purple-600 hover:underline">Login</a>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 transition-colors duration-300">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className={`fixed top-4 left-4 p-3 rounded-full ${glassCard} z-50 flex items-center gap-2 text-red-500 hover:text-red-600`}
            >
                <LogOut className="w-5 h-5" />
                <span className={textClass}>Logout</span>
            </motion.button>

            <div className="fixed inset-0 -z-10">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full mix-blend-soft-light filter blur-3xl opacity-30"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 15 + i * 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            width: `${400 + i * 200}px`,
                            height: `${400 + i * 200}px`,
                            background: `rgba(${88 + i * 30}, ${61 + i * 20}, ${255}, 0.${3 + i})`,
                            left: `${i * 25}%`,
                            top: `${i * 15}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="min-h-screen p-8"
            >
                {/* Top Section: Profile Info, Tasks, and Calendar */}
                <motion.div variants={itemVariants} className="grid grid-cols-12 gap-4 mb-6">
                    {/* Profile Info */}
                    <div className={`${glassCard} rounded-xl p-6 col-span-4`}>
                        <div className="relative mb-6">
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-full h-52 rounded-lg object-cover"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="absolute bottom-3 right-3 bg-purple-600 p-2 rounded-full"
                            >
                                <Edit2 className="w-4 h-4 text-white" />
                            </motion.button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className={`text-2xl font-semibold ${textClass}`}>{user.name}</h2>
                                <p className={subTextClass}>Joined {formatDate(user.createdAt)}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className={textClass}>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={subTextClass}>Username:</div>
                                    <span className={textClass}>{user.username}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={subTextClass}>Role:</div>
                                    <span className={`capitalize ${textClass}`}>{user.role}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={subTextClass}>Status:</div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                                    bg-green-500/10 text-green-400 border border-green-500/20">
                                        {user.status}
                                    </span>
                                </div>
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm 
                                               border border-gray-700/30 hover:border-purple-500/20 
                                               transition-all duration-300"
                                >
                                    <h3 className={`font-medium mb-2 ${textClass}`}>Bio</h3>
                                    <p className={`text-sm ${subTextClass}`}>
                                        {user.bio || "No bio available"}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className='col-span-5 row-span-2 flex flex-col gap-4'>
                        <div className={`${glassCard} rounded-xl p-6 col-span-5 h-[48%]`}>
                            <div className="flex h- justify-between items-center mb-6">
                                <h2 className={`text-xl font-semibold ${textClass}`}>My Tasks</h2>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 
                                               transition-all duration-300 px-3 py-1.5 rounded-lg 
                                               bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    <span>Add Task</span>
                                </motion.button>
                            </div>
                            {user.tasks && user.tasks.length > 0 ? (
                                <div className="space-y-3  overflow-y-auto">
                                    {user.tasks.map(task => (
                                        <motion.div
                                            key={task._id}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-sm 
                                                       rounded-lg border border-gray-700/30 hover:border-purple-500/20 
                                                       transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-yellow-500" />
                                                <span className={textClass}>{task.title}</span>
                                            </div>
                                            <span className={`text-sm ${subTextClass}`}>Due {formatDate(task.dueDate)}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-8 ${subTextClass}`}>
                                    No tasks available
                                </div>
                            )}
                            <div className={`text-center mt-4 ${textClass}`}>user analysis</div>
                        </div>

                        <div className={`${glassCard} rounded-xl p-6 col-span-5 h-[48%]`}>
                            <div className="flex h- justify-between items-center mb-6">
                                <h2 className={`text-xl font-semibold ${textClass}`}>userAnd</h2>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 
                                               transition-all duration-300 px-3 py-1.5 rounded-lg 
                                               bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    <span>Add Task</span>
                                </motion.button>
                            </div>
                            {user.tasks && user.tasks.length > 0 ? (
                                <div className="space-y-3  overflow-y-auto">
                                    {user.tasks.map(task => (
                                        <motion.div
                                            key={task._id}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-sm 
                                                       rounded-lg border border-gray-700/30 hover:border-purple-500/20 
                                                       transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-yellow-500" />
                                                <span className={textClass}>{task.title}</span>
                                            </div>
                                            <span className={`text-sm ${subTextClass}`}>Due {formatDate(task.dueDate)}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-8 ${subTextClass}`}>
                                    No tasks available
                                </div>
                            )}
                            <div className={`text-center mt-4 ${textClass}`}>user analysis</div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="col-span-3">
                        <CalendarWidget
                            glassCard={glassCard}
                            textClass={textClass}
                            subTextClass={subTextClass}
                            darkMode={true} // Add this line to force dark mode
                        />
                    </div>
                </motion.div>

                {/* Bottom Section: Projects, Requests, Notifications */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Projects */}
                    <motion.div
                        variants={itemVariants}
                        className={`${glassCard} rounded-xl p-6`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-xl font-semibold ${textClass}`}>Projects</h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 
                                           transition-all duration-300 px-3 py-1.5 rounded-lg 
                                           bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
                            >
                                <PlusCircle className="w-5 h-5" />
                                New Project
                            </motion.button>
                        </div>
                        {user.projects && user.projects.length > 0 ? (
                            <div className="space-y-3">
                                {user.projects.map(project => (
                                    <motion.div
                                        key={project._id}
                                        whileHover={{ y: -5 }}
                                        className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg 
                                                   border border-gray-700/30 hover:border-purple-500/20 
                                                   transition-all duration-300"
                                    >
                                        <h3 className={`font-medium ${textClass}`}>{project.name}</h3>
                                        <p className={`text-sm mt-1 ${subTextClass}`}>{project.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-8 ${subTextClass}`}>
                                No projects available
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Requests */}
                    <motion.div
                        variants={itemVariants}
                        className={`${glassCard} rounded-xl p-6`}
                    >
                        <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Pending Requests</h2>
                        {user.invitations && user.invitations.length > 0 ? (
                            <div className="space-y-3">
                                {user.invitations.map(invitation => (
                                    <motion.div
                                        key={invitation._id}
                                        whileHover={{ x: 5 }}
                                        className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg 
                                                   border border-gray-700/30 hover:border-purple-500/20 
                                                   transition-all duration-300"
                                    >
                                        <h3 className={`font-medium ${textClass}`}>{invitation.title}</h3>
                                        <p className={`text-sm mt-1 ${subTextClass}`}>{invitation.message}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button className="text-sm text-green-600">Accept</button>
                                            <button className="text-sm text-red-600">Decline</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-8 ${subTextClass}`}>
                                No pending requests
                            </div>
                        )}
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        variants={itemVariants}
                        className={`${glassCard} rounded-xl p-6`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-xl font-semibold ${textClass}`}>Notifications</h2>
                            <Bell className="w-5 h-5 text-gray-400" />
                        </div>
                        {user.notifications && user.notifications.length > 0 ? (
                            <div className="space-y-3">
                                {user.notifications.map(notification => (
                                    <motion.div
                                        key={notification._id}
                                        whileHover={{ x: 5 }}
                                        className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg 
                                                   border border-gray-700/30 hover:border-purple-500/20 
                                                   transition-all duration-300"
                                    >
                                        <p className={`text-sm ${subTextClass}`}>{notification.message}</p>
                                        <span className={`text-xs mt-1 ${subTextClass}`}>
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-8 ${subTextClass}`}>
                                No notifications
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;