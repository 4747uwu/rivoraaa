import { useNotification } from '../../context/notificationContext';
import { IoNotifications } from 'react-icons/io5';
import { useState } from 'react';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const { unreadCount, connected } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none"
      >
        <IoNotifications className="w-6 h-6" />
        {/* Connection status indicator */}
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <NotificationList onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;