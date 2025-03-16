import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, Bell, X, Clock, AlertCircle, UserPlus, 
  ChevronRight, Link, MessageSquare, CheckCircle, Calendar 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/authContext";
import { useTheme } from "./context/themeContext";
import { useNotification } from "./context/notificationContext";

const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  themeClasses,
  searchPlaceholder = "Search projects..." 
}) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { 
    notifications, 
    
    isLoading, 
    handleNotificationClick, 
    getFormattedTime,
    markAsRead,
    markAllAsRead
  } = useNotification();
  
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Extract notification list or use empty array
  const notificationsList = notifications?.notifications?.notifications || [];

  const unreadNotifications = notificationsList.filter(notification => !notification.read);
  const unreadCount = unreadNotifications.length;
  // console.log('Unread notifications:', unreadCount);
  
  
  // Limit to top 5 notifications for display
  const topNotifications = unreadNotifications.slice(0, 5);


  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case "task_assigned":
        return <Clock className="w-5 h-5" />;
      case "task_completed":
        return <CheckCircle className="w-5 h-5" />;
      case "task_deadline":
        return <Calendar className="w-5 h-5" />;
      case "project_invite":
      case "project_update":
        return <AlertCircle className="w-5 h-5" />;
      case "connection_request":
      case "connection_accepted":
        return <UserPlus className="w-5 h-5" />;
      case "team_invite":
      case "team_join":
      case "team_leave":
      case "team_role_change":
        return <Link className="w-5 h-5" />;
      case "message":
      case "mention":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };
  
  // Get notification color based on type and priority
  const getNotificationColor = (notification) => {
    if (!notification) return "text-purple-400 bg-purple-400/10";
    
    const { type, priority } = notification;
    
    // First check priority
    if (priority === 'high') return "text-red-400 bg-red-400/10";
    if (priority === 'low') return "text-blue-400 bg-blue-400/10";
    
    // Then check type
    switch(type) {
      case "task_assigned":
        return "text-emerald-400 bg-emerald-400/10";
      case "task_completed":
        return "text-green-500 bg-green-500/10";
      case "task_deadline":
        return "text-amber-400 bg-amber-400/10";
      case "project_invite":
      case "project_update":
        return "text-yellow-400 bg-yellow-400/10";
      case "connection_request":
      case "connection_accepted":
        return "text-green-400 bg-green-400/10";
      case "team_invite":
      case "team_join":
      case "team_leave":
      case "team_role_change":
        return "text-sky-400 bg-sky-400/10";
      case "message":
      case "mention":
        return "text-indigo-400 bg-indigo-400/10";
      default:
        return "text-purple-400 bg-purple-400/10";
    }
  };

  // Auto-advance the slideshow every 4 seconds if there are notifications
  useEffect(() => {
    if (!isPaused && topNotifications && topNotifications.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topNotifications.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, topNotifications]);

  // View all notifications handler
  const handleViewAll = () => {
    setShowNotifications(false);
    navigate('/notification');
  };

  // Handle notification click
  const onNotificationClick = (notification) => {
    handleNotificationClick(notification);
    setShowNotifications(false);
  };

  // Safely get a notification item with null checks
  const getCurrentNotification = () => {
    if (!topNotifications || !Array.isArray(topNotifications) || topNotifications.length === 0) {
      return null;
    }
    
    if (currentSlide >= topNotifications.length) {
      setCurrentSlide(0);
      return topNotifications[0];
    }
    
    return topNotifications[currentSlide];
  };

  const currentNotification = getCurrentNotification();

  return (
    <div className="flex items-center justify-center mt-2 mb-0"> 
      <header className={`${themeClasses.card} border-b ${themeClasses.border} top-3 z-40 px-6 py-2 w-[350px] backdrop-blur-md shadow-sm rounded-full`}>
        <div className="flex items-center justify-center">
          {/* Menu button - fixed width */}
          <div className="w-8 flex justify-start items-center"> 
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6 text-gray-400 hover:text-purple-400" />
            </button>
          </div>
          
          {/* Center notification - fixed width container */}
          <div 
            className="flex-1 mx-2 cursor-pointer flex justify-center items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => topNotifications && topNotifications.length > 0 && setShowNotifications(!showNotifications)}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <div className="mr-2 p-1 rounded-full text-gray-400 bg-gray-400/10">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-300">Loading notifications...</div>
                </motion.div>
              ) : currentNotification ? (
                <motion.div
                  key={currentNotification._id || currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center overflow-hidden"
                >
                  <div className={`mr-2 p-1 rounded-full ${getNotificationColor(currentNotification)}`}>
                    {getNotificationIcon(currentNotification.type)}
                  </div>
                  
                  <div className="text-xs truncate max-w-[200px]">
                    <span className="text-gray-300">
                      {currentNotification.title}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <div className="mr-2 p-1 rounded-full text-gray-400 bg-gray-400/10">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-300">
                    {unreadCount > 0 ? `${unreadCount} new notification${unreadCount !== 1 ? 's' : ''}` : 'No new notifications'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Bell icon - fixed width */}
          <div className="w-8 flex justify-end">
            <button 
              className="relative group"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[0.6rem] text-white flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                  className="absolute top-12 right-0 w-80 max-h-[70vh] overflow-hidden bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  {/* Header */}
                  <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/95 backdrop-blur-sm">
                    <h3 className="font-medium text-gray-300 flex items-center">
                      <Bell className="w-4 h-4 mr-2 text-purple-400" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    <div className="flex space-x-3">
                      {unreadCount > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 hover:bg-gray-800 rounded transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 p-1 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="overflow-y-auto max-h-[50vh]">
                    {isLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : topNotifications && topNotifications.length > 0 ? (
                      <div className="divide-y divide-gray-800">
                        {topNotifications.map((notification) => (
                          <motion.div 
                            key={notification._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`p-4 hover:bg-gray-800 cursor-pointer ${!notification.read ? 'bg-gray-800/50' : ''}`}
                            onClick={() => onNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className="text-sm font-medium text-gray-200 mb-1">
                                    {notification.title}
                                    {notification.priority === 'high' && (
                                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                                        High priority
                                      </span>
                                    )}
                                  </p>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                  {notification.content}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {getFormattedTime(notification.createdAt)}
                                  </span>
                                  
                                  <span className="bg-gray-800 px-2 py-0.5 rounded-full text-[0.65rem] capitalize">
                                    {notification.type.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <Bell className="w-12 h-12 text-gray-700 mb-2" />
                        <p className="text-gray-400 mb-1">No notifications yet</p>
                        <p className="text-xs text-gray-600">You'll see updates here</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="sticky bottom-0 p-3 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
                    <button 
                      className="w-full text-center text-sm text-purple-400 hover:text-purple-300 py-2 hover:bg-gray-800 rounded-md transition-colors flex items-center justify-center"
                      onClick={handleViewAll}
                    >
                      View all notifications <ChevronRight size={16} className="ml-1" />
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