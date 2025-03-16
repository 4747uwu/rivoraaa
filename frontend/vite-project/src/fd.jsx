import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/api/auth/google"; // Redirect to backend OAuth
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Google OAuth Login</h1>
      <button onClick={handleGoogleLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, X, Clock, AlertCircle, UserPlus, ChevronRight } from "lucide-react";
import { useAuth } from "./context/authContext";
import { useTheme } from "./context/themeContext";

// Sample notification data (in production, you would fetch this)
const notificationData = [
  {
    "id": 1,
    "type": "notification",
    "message": "You have 4 new notifications",
    "timestamp": "2025-03-07T09:30:00Z",
    "status": "unread"
  },
  {
    "id": 2,
    "type": "meeting",
    "message": "Project Sync-Up meeting in 2 hours",
    "timestamp": "2025-03-07T11:00:00Z",
    "status": "upcoming"
  },
  {
    "id": 3,
    "type": "deadline",
    "message": "Upcoming deadline: 'AI Task Automation' due tomorrow",
    "timestamp": "2025-03-08T23:59:00Z",
    "status": "pending"
  },
  {
    "id": 4,
    "type": "request",
    "message": "New LinkUp request from John Doe",
    "timestamp": "2025-03-07T08:45:00Z",
    "status": "pending"
  }
];

const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  themeClasses,
  searchPlaceholder = "Search projects..." 
}) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const getNotificationIcon = (type) => {
    switch(type) {
      case "meeting":
        return <Clock className="w-4 h-4" />;
      case "deadline":
        return <AlertCircle className="w-4 h-4" />;
      case "request":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };
  
  const getNotificationColor = (type) => {
    switch(type) {
      case "meeting":
        return "text-blue-400 bg-blue-400/10";
      case "deadline":
        return "text-amber-400 bg-amber-400/10";
      case "request":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-purple-400 bg-purple-400/10";
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  };

  // Auto-advance the slideshow every 4 seconds
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % notificationData.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <div className="flex items-center justify-center mt-2 mb-0"> 
      <header className={`${themeClasses.card} border-b ${themeClasses.border} top-3 z-40 px-6 py-2 w-[350px] backdrop-blur-md shadow-sm rounded-full`}>
        <div className="flex items-center justify-center">
          {/* Menu button - fixed width */}
          <div className="w-8 flex justify-start items-center"> 
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6  text-gray-400 hover:text-purple-400" />
            </button>
          </div>
          
          {/* Center notification - fixed width container */}
          <div 
            className="flex-1 mx-2 cursor-pointer flex justify-center items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center overflow-hidden"
              >
                <div className={`mr-2 p-1 rounded-full ${getNotificationColor(notificationData[currentSlide].type)}`}>
                  {getNotificationIcon(notificationData[currentSlide].type)}
                </div>
                
                <div className="text-xs truncate max-w-[200px]">
                  <span className="text-gray-300">
                    {notificationData[currentSlide].message}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Bell icon - fixed width */}
          <div className="w-8 flex justify-end">
            <button 
              className="relative group"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              {notificationData.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-xs text-white flex items-center justify-center"
                >
                  {notificationData.length}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-8 right-0 w-72 max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-700">
                    <h3 className="font-medium text-gray-300">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-700">
                    {notificationData.map((notification) => (
                      <motion.div 
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 hover:bg-gray-800 cursor-pointer flex items-start"
                      >
                        <div className={`p-2 rounded mr-3 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{notification.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.status === 'unread' && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="p-2 border-t border-gray-700">
                    <button className="w-full text-center text-xs text-purple-400 hover:text-purple-300 py-1 flex items-center justify-center">
                      View all notifications <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;