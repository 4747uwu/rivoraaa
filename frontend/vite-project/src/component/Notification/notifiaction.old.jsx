import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/notificationContext';
import { 
  IoCheckmarkDoneOutline, IoTrashOutline, IoTimeOutline, IoFilterOutline,
  IoSearchOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline,
  IoNotificationsOffOutline, IoCalendarOutline, IoArrowUpOutline,
  IoWarningOutline, // ADD this icon instead
  IoLinkOutline, IoPersonOutline,
  IoHomeOutline // Add this import
} from 'react-icons/io5'; 
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom'; // Add this import

const NotificationsPage = () => {
  const {
    notifications: notificationData = {},
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    handleNotificationClick,
    getFormattedTime
  } = useNotification();

  // Extract the actual notifications array from the response structure
  const notifications = notificationData?.notifications?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    notificationData?.pagination?.hasMore || false
  );
  const observer = useRef();
  const lastNotificationRef = useRef();

  // New state for grouping and sorting
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'type', 'priority'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);

  // Add navigate function from react-router
  const navigate = useNavigate();

  // Scroll to top handler
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowScrollTop(containerRef.current.scrollTop > 500);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Filter options
  const types = [
    { value: 'all', label: 'All' },
    { value: 'team_update', label: 'Team Updates' },
    { value: 'team_invite', label: 'Team Invites' },
    { value: 'project_update', label: 'Project Updates' },
    { value: 'task_assigned', label: 'Task Assignments' },
    { value: 'message', label: 'Messages' }
  ];

  // Filter notifications with null check
  const filteredNotifications = Array.isArray(notifications) 
    ? notifications.filter(notification => {
        if (!notification) return false;
        
        const matchesSearch = (notification.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
                           (notification.content?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || 
                           (filter === 'unread' && !notification.read) ||
                           (filter === 'read' && notification.read);
        const matchesType = selectedType === 'all' || notification.type === selectedType;
        
        return matchesSearch && matchesFilter && matchesType;
      })
    : [];

  // Priority styles
  const getPriorityStyle = (priority) => {
    const baseStyle = "absolute left-0 w-1 h-full";
    switch (priority) {
      case 'high':
        return `${baseStyle} bg-red-500`;
      case 'medium':
        return `${baseStyle} bg-yellow-500`;
      case 'low':
        return `${baseStyle} bg-blue-500`;
      default:
        return `${baseStyle} bg-gray-500`;
    }
  };

  // Infinite scroll logic
  useEffect(() => {
    if (isLoading || !hasMore) return;

    const currentObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreNotifications(page + 1).then(result => {
          if (!result?.pagination?.hasMore) {
            setHasMore(false);
          }
          setPage(prev => prev + 1);
        });
      }
    }, { threshold: 0.5 });

    if (lastNotificationRef.current) {
      currentObserver.observe(lastNotificationRef.current);
    }

    return () => currentObserver.disconnect();
  }, [isLoading, hasMore, page]);

  // Debug output to help identify issues
  useEffect(() => {
    console.log('Notification data structure:', notificationData);
    console.log('Extracted notifications array:', notifications);
    console.log('Filtered notifications:', filteredNotifications);
  }, [notificationData, notifications, filteredNotifications]);

  // Enhanced notification grouping
  const groupNotifications = (notifications) => {
    if (groupBy === 'date') {
      const groups = {};
      notifications.forEach(notification => {
        const date = new Date(notification.createdAt).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(notification);
      });
      return groups;
    }

    if (groupBy === 'type') {
      const groups = {};
      notifications.forEach(notification => {
        if (!groups[notification.type]) groups[notification.type] = [];
        groups[notification.type].push(notification);
      });
      return groups;
    }

    if (groupBy === 'priority') {
      const groups = {
        high: [], medium: [], low: [], other: []
      };
      notifications.forEach(notification => {
        const priority = notification.priority || 'other';
        groups[priority].push(notification);
      });
      return groups;
    }

    return { all: notifications };
  };

  // Sort notifications
  const sortNotifications = (notifications) => {
    return [...notifications].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  };

  // Notification card component
  const NotificationCard = ({ notification, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <motion.div
        ref={isLast ? lastNotificationRef : null}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all
          ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
      >
        
        <div className={getPriorityStyle(notification.priority)} />
        <div className="p-4 pl-6">
          <div 
            className="cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-blue-400">
                {notification.title}
              </h3>
              <div className="flex space-x-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                    data-tooltip-id="notification-tooltip"
                    data-tooltip-content="Mark as read"
                  >
                    <IoCheckmarkDoneOutline className="w-5 h-5 text-blue-400" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  data-tooltip-id="notification-tooltip"
                  data-tooltip-content="Delete notification"
                >
                  <IoTrashOutline className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
            
            <p className={`text-gray-300 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {notification.content}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              <div className="flex items-center">
                <IoTimeOutline className="mr-1" />
                {getFormattedTime(notification.createdAt)}
              </div>
              
              {notification.type && (
                <div className="flex items-center">
                  <IoFilterOutline className="mr-1" />
                  <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                    {notification.type}
                  </span>
                </div>
              )}

              {notification.priority && (
                <div className="flex items-center">
                    <IoWarningOutline className="mr-1" /> {/* replaced IoPriorityHighOutline */}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.priority === 'high' ? 'bg-red-900 text-red-300' :
                    notification.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                    }`}>
                    {notification.priority}
                    </span>
                </div>
                )}
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notification.sender && (
                    <div className="flex items-center text-sm">
                      <IoPersonOutline className="mr-2 text-gray-400" />
                      <span className="text-gray-300">From: {notification.sender}</span>
                    </div>
                  )}
                  
                  {notification.expiresAt && (
                    <div className="flex items-center text-sm">
                      <IoCalendarOutline className="mr-2 text-gray-400" />
                      <span className="text-gray-300">
                        Expires: {format(new Date(notification.expiresAt), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>

                {notification.actionUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <IoLinkOutline />
                    <span>View Details</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section - Fixed at top */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-800">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Add Dashboard button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <IoHomeOutline className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              
              <h1 className="text-3xl font-bold text-blue-400">
                Notifications 
                {unreadCount > 0 && (
                  <span className="text-sm bg-blue-600 px-2 py-1 rounded-full ml-2">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Type filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Group by */}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="date">Group by Date</option>
                <option value="type">Group by Type</option>
                <option value="priority">Group by Priority</option>
              </select>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {/* Read/Unread filter pills */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'unread' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'read' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto p-6 space-y-6"
      >
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            Object.entries(groupNotifications(sortNotifications(filteredNotifications)))
              .map(([group, notifications]) => (
                <div key={group}>
                  <h2 className="text-xl font-semibold text-gray-400 mb-4">
                    {group}
                  </h2>
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        isLast={index === notifications.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <IoNotificationsOffOutline className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400">No notifications found</h3>
              <p className="text-gray-500 mt-2">
                {search || filter !== 'all' || selectedType !== 'all'
                  ? "Try adjusting your search or filters"
                  : "You're all caught up!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading notifications...</p>
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors"
          >
            <IoArrowUpOutline className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tooltips */}
      <Tooltip id="notification-tooltip" />
    </div>
  );
};

export default NotificationsPage;