import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/notificationContext';
import { 
  IoCheckmarkDoneOutline, 
  IoTrashOutline, 
  IoTimeOutline,
  IoFilterOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoNotificationsOffOutline
} from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            Notifications <span className="text-sm bg-blue-600 px-2 py-1 rounded-full ml-2">{unreadCount}</span>
          </h1>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
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
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'unread' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'read' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Read
              </button>
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
          </div>
        </div>

        {/* Notifications List */}
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                  className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all
                    ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className={getPriorityStyle(notification.priority)} />
                  <div className="p-4 pl-6">
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <h3 className="text-lg font-semibold text-blue-400">
                          {notification.title}
                        </h3>
                        <p className="text-gray-300 mt-1">
                          {notification.content}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-400">
                          <IoTimeOutline className="mr-1" />
                          {getFormattedTime(notification.createdAt)}
                          {notification.type && (
                            <span className="ml-4 px-2 py-1 bg-gray-700 rounded-full text-xs">
                              {notification.type}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            title="Mark as read"
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
                          title="Delete notification"
                        >
                          <IoTrashOutline className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
    </div>
  );
};

export default NotificationsPage;