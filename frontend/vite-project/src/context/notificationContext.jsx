import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './authContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/api';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Get notifications using React Query
  const {
    data: notifications = [],
    isLoading,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await axios.get('/api/notifications?limit=10');
      console.log('Notifications:', data.data);
      return data.data;
    },
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  // Get unread count using React Query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await API.get('/api/notifications/unread-count');
      console.log
      return data.count;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Consider fresh for 30 seconds
  });

  // Socket connection effect
  React.useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['polling', 'websocket']
    });

    // Socket event handlers
    socketInstance.on('connect', () => {
      setConnected(true);
      socketInstance.emit('get_notification_count');
      socketInstance.emit('get_recent_notifications', { limit: 10 });
    });

    socketInstance.on('new_notification', (notification) => {
      console.log('New notification received via socket:', notification);
      
      // Update notifications in cache
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return { notifications: { notifications: [notification] } };
        
        // Handle nested structure
        if (old.notifications && old.notifications.notifications) {
          return {
            ...old,
            notifications: {
              ...old.notifications,
              notifications: [notification, ...old.notifications.notifications]
            }
          };
        }
        
        // Handle flat array structure
        if (Array.isArray(old)) {
          return [notification, ...old];
        }
        
        return old;
      });
      
      // Update unread count
      queryClient.setQueryData(['notifications', 'unread'], (oldCount) => 
        (oldCount || 0) + 1
      );
      
      // Show toast notification
      toast.info(notification.title, {
        description: notification.content.substring(0, 100)
      });
    });

    // Handle when a notification is marked as read
    socketInstance.on('notification_marked_read', ({ id }) => {
      console.log('Notification marked as read via socket:', id);
      
      // Update notification in cache
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        
        // Handle nested structure
        if (old.notifications && old.notifications.notifications) {
          return {
            ...old,
            notifications: {
              ...old.notifications,
              notifications: old.notifications.notifications.map(n => 
                n._id === id ? { ...n, read: true } : n
              )
            }
          };
        }
        
        // Handle flat array structure
        if (Array.isArray(old)) {
          return old.map(n => n._id === id ? { ...n, read: true } : n);
        }
        
        return old;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, queryClient]);

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await API.put(`/api/notifications/${notificationId}/mark-read`);
      return data;
    },
    // Perform an optimistic update
    onMutate: async (notificationId) => {
      // Cancel any outgoing fetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(['notifications']);

      // Snapshot the previous cached notifications
      const previousNotifications = queryClient.getQueryData(['notifications']) || [];

      // Update the read status immediately
      queryClient.setQueryData(['notifications'], (old = []) =>
        old.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );

      // Return the snapshot so we can roll back in case of error
      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      // If the mutation fails, revert the optimistic update
      queryClient.setQueryData(['notifications'], context.previousNotifications);
    },
    onSettled: () => {
      // Refresh unread count or any other queries if needed
      queryClient.invalidateQueries(['notifications', 'unread']);
    },
  });

  const markAsRead = (notificationId) => {
    console.log('markAsRead called with:', notificationId);
    
    // Immediately update the UI (optimistic update)
    queryClient.setQueryData(['notifications'], (old = []) => {
      if (!old || !Array.isArray(old.notifications?.notifications)) {
        return old; // Return unchanged if structure is unexpected
      }
      
      // Create a new object with updated notifications
      return {
        ...old,
        notifications: {
          ...old.notifications,
          notifications: old.notifications.notifications.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        }
      };
    });
    
    // Also update unread count
    queryClient.setQueryData(['notifications', 'unread'], (old = 0) => 
      Math.max(0, old - 1)
    );
    
    // Now make the API call
    API.put(`/api/notifications/${notificationId}/mark-read`)
      .then(response => {
        console.log('Notification marked as read:', response);
        // Success - the optimistic update is already done
        
        // Refresh unread count to ensure accuracy
        queryClient.invalidateQueries(['notifications', 'unread']);
      })
      .catch(error => {
        console.error('Failed to mark notification as read:', error);
        
        // On error, revert the optimistic update
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications', 'unread']);
        
        // Show error toast if needed
        toast.error('Failed to mark notification as read');
      });
  };

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await API.put('/api/notifications/mark-all-read');
      return data;
    },
    onSuccess: () => {
      // Update cache
      queryClient.setQueryData(['notifications'], (old = []) =>
        old.map(n => ({ ...n, read: true }))
      );
      queryClient.setQueryData(['notifications', 'unread'], 0);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await API.delete(`/api/notifications/${notificationId}`);
      return data;
    },
    onSuccess: (_, notificationId) => {
      // Update cache
      queryClient.setQueryData(['notifications'], (old = []) =>
        old.filter(n => n._id !== notificationId)
      );
      queryClient.invalidateQueries(['notifications', 'unread']);
    }
  });

  // Load more notifications
  const loadMoreNotifications = useCallback(async (page = 2, limit = 10) => {
    try {
      const { data } = await API.get(`/api/notifications?page=${page}&limit=${limit}`);
      
      queryClient.setQueryData(['notifications'], (old = []) => 
        [...old, ...data.data]
      );
      
      return data.pagination;
    } catch (error) {
      console.error('Error loading more notifications:', error);
      return null;
    }
  }, [queryClient]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    if (!notification) return;
    
    markAsReadMutation.mutate(notification._id);
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }, [markAsReadMutation]);

  // Format time utility
  const getFormattedTime = useCallback((createdAt) => {
    if (!createdAt) return '';
    
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    // markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    loadMoreNotifications,
    handleNotificationClick,
    getFormattedTime,
    // Add mutation states
    isMarking: markAsReadMutation.isLoading,
    isMarkingAll: markAllAsReadMutation.isLoading,
    isDeleting: deleteNotificationMutation.isLoading,
    // Add refetch function
    refetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;