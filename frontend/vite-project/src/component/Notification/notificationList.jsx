import { useNotification } from '../../context/notificationContext';
import { useState, useRef, useEffect } from 'react';
import { IoCheckmarkDoneOutline, IoTrashOutline, IoTimeOutline } from 'react-icons/io5';

const NotificationList = ({ onClose }) => {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    handleNotificationClick,
    getFormattedTime,
    isMarking,
    isMarkingAll,
    isDeleting,
  } = useNotification();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastNotificationRef = useRef();

  // Handle intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (lastNotificationRef.current) {
      observer.current.observe(lastNotificationRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const result = await loadMoreNotifications(nextPage);
    if (result?.hasNextPage === false) {
      setHasMore(false);
    }
    setPage(nextPage);
  };

  // Priority colors
  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30',
    low: 'bg-blue-100 dark:bg-blue-900/30',
  };

  return (
    <div className="py-2" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
        <button
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {/* Notification list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification, index) => (
          <div
            key={notification._id}
            ref={index === notifications.length - 1 ? lastNotificationRef : null}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              !notification.read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
            } ${priorityColors[notification.priority]}`}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.content}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <IoTimeOutline className="mr-1" />
                  {getFormattedTime(notification.createdAt)}
                </div>
              </div>

              <div className="ml-4 flex space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    disabled={isMarking}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                  >
                    <IoCheckmarkDoneOutline className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  <IoTrashOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;