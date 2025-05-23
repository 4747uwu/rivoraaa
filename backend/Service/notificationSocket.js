import { Server } from 'socket.io';  // Correct import for Socket.IO v4+
import { socketAuthMiddleware } from './socketAuthMiddleware.js';

// Simple inline logger in case the logger module hasn't been created yet
const createSimpleLogger = () => {
  const log = (level, ...args) => console[level](`[${new Date().toISOString()}] [${level.toUpperCase()}]`, ...args);
  return {
    error: (...args) => log('error', ...args),
    warn: (...args) => log('warn', ...args),
    info: (...args) => log('info', ...args),
    debug: (...args) => log('debug', ...args),
  };
};

// Try to import the logger, fall back to simple logger if not available
let logger;
try {
  const loggerModule = await import('../utils/logger.js');
  logger = loggerModule.default;
} catch (err) {
  logger = createSimpleLogger();
  logger.warn('Logger module not found, using simple logger');
}

// Track connected users and their socket IDs
let io;
const connectedUsers = new Map();
const userRooms = new Map(); // Track rooms users have joined
let isInitialized = false;

/**
 * Socket service for real-time notifications and communication
 */
const socketService = {
  /**
   * Initialize Socket.IO server
   * @param {Object} server - HTTP server instance
   * @returns {Object} Socket.IO server instance
   */
  init(server) {
    if (isInitialized) {
      logger.warn('Socket.IO notification server already initialized');
      return io;
    }
    
    try {
      // Create Socket.IO server with CORS settings and namespace
      io = new Server(server, {
        cors: {
          origin: process.env.CLIENT_URL || 'http://localhost:3000',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          credentials: true,
          allowedHeaders: ['authorization', 'content-type', 'cookie']
        },
        path: '/socket/notifications', // Custom path to avoid conflicts
        transports: ['polling','websocket'],
        pingTimeout: 30000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e6
      });
      
      // Set up authentication middleware
      io.use(socketAuthMiddleware);
      
      // Set up connection handler
      io.on('connection', (socket) => this._handleConnection(socket));
      
      isInitialized = true;
      logger.info('Socket.IO notification server initialized');
      
      return io;
    } catch (error) {
      logger.error('Failed to initialize Socket.IO notification server:', error);
      throw error;
    }
  },
  
  /**
   * Get Socket.IO server instance
   * @returns {Object} Socket.IO server instance
   */
  getIO() {
    if (!io) {
      logger.warn('Attempted to get Socket.IO instance before initialization');
    }
    return io;
  },
  
  /**
   * Check if Socket.IO server is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return isInitialized;
  },
  
  /**
   * Check if a specific user is currently connected
   * @param {string} userId - User ID to check
   * @returns {boolean} Whether the user has at least one active connection
   */
  isUserConnected(userId) {
    if (!userId) return false;
    const userIdStr = userId.toString(); // Convert ObjectId to string if needed
    return (
      connectedUsers.has(userIdStr) && 
      connectedUsers.get(userIdStr).size > 0
    );
  },
  
  /**
   * Emit an event to a specific user
   * @param {string} userId - Target user ID
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @returns {boolean} True if the event was sent (user is connected)
   */
  emitToUser(userId, event, data) {
    if (!io || !isInitialized) {
      // Queue the event instead of just warning
      logger.warn(`Socket.IO not initialized. Queuing ${event} for user ${userId}`);
      this._queueEvent(userId, event, data);
      return false;
    }
    
    try {
      const isConnected = this.isUserConnected(userId);
      
      if (isConnected) {
        io.to(`user:${userId}`).emit(event, data);
        logger.debug(`Emitted ${event} to user ${userId}`);
      } else {
        // If user not connected, queue the event for later delivery
        this._queueEvent(userId, event, data);
        logger.debug(`User ${userId} not connected. Queued ${event}`);
      }
      
      return isConnected;
    } catch (error) {
      logger.error(`Error emitting ${event} to user ${userId}:`, error);
      return false;
    }
  },
  
  // Add a queue for pending events
  _eventQueue: new Map(),

  /**
   * Queue an event for later delivery
   * @param {string} userId - Target user ID
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @private
   */
  _queueEvent(userId, event, data) {
    if (!this._eventQueue.has(userId)) {
      this._eventQueue.set(userId, []);
    }
    
    // Add to queue with timestamp
    this._eventQueue.get(userId).push({
      event,
      data,
      timestamp: Date.now()
    });
    
    // Limit queue size to prevent memory issues
    const userQueue = this._eventQueue.get(userId);
    if (userQueue.length > 20) {
      userQueue.shift(); // Remove oldest event if queue gets too large
    }
  },

  /**
   * Process queued events for a user when they connect
   * @param {string} userId - User ID
   * @param {Object} socket - Socket instance
   * @private
   */
  _processQueuedEvents(userId, socket) {
    if (!this._eventQueue.has(userId)) return;
    
    const events = this._eventQueue.get(userId);
    if (events.length === 0) return;
    
    logger.info(`Processing ${events.length} queued events for user ${userId}`);
    
    // Send events through the user's socket
    events.forEach(({event, data}) => {
      socket.emit(event, data);
    });
    
    // Clear the queue
    this._eventQueue.set(userId, []);
  },

  /**
   * Handle new socket connections
   * @param {Object} socket - Socket instance
   * @private
   */
  _handleConnection(socket) {
    try {
      // Make sure socket.user exists and has an id
      if (!socket.user || !socket.user.id) {
        logger.error('Socket connected but user not authenticated:', socket.id);
        socket.disconnect();
        return;
      }

      const userId = socket.user.id.toString(); // Convert ObjectId to string if needed
      logger.info(`User connected: ${userId} (socket: ${socket.id})`);
      
      // Add this socket to the user's connected sockets
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(socket.id);
      
      // Join user-specific room
      socket.join(`user:${userId}`);
      
      // Debug - log connected users
      logger.debug(`Current connected users: ${Array.from(connectedUsers.keys()).join(', ')}`);
      logger.debug(`User ${userId} has ${connectedUsers.get(userId).size} active connections`);
      
      // Set up disconnect handler
      socket.on('disconnect', () => this._handleDisconnect(socket, userId));
      
      // Handle notification events
      socket.on('get_notification_count', () => this._handleGetNotificationCount(socket));
      socket.on('get_recent_notifications', (data) => this._handleGetRecentNotifications(socket, data));
      
      // Process any queued events for this user
      this._processQueuedEvents(userId);
      
      // Emit connection status
      socket.emit('connection_status', {
        connected: true,
        userId: userId
      });
    } catch (error) {
      logger.error('Error in _handleConnection:', error);
      if (socket.connected) {
        socket.emit('error', { message: 'Server error during connection setup' });
      }
    }
  },
  
  /**
   * Handle socket disconnection
   * @param {Object} socket - Socket instance
   * @param {string} userId - User ID
   * @private
   */
  _handleDisconnect(socket, userId) {
    try {
      logger.info(`User disconnected from notification socket: ${userId} (socket: ${socket.id})`);
      
      // Remove this socket connection for the user
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        // If no more connections, remove the user entry
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
          logger.info(`User ${userId} has no more active connections`);
        }
      }
      
    } catch (error) {
      logger.error(`Error handling notification socket disconnection:`, error);
    }
  },

  /**
   * Configure notification-related event handlers
   * @param {Object} socket - Socket instance
   * @param {String} userId - User ID
   * @private
   */
  _setupNotificationHandlers(socket, userId) {
    // Handle client requesting notification count
    socket.on('get_notification_count', async () => {
      try {
        const { default: notificationService } = await import('./notificationService.js');
        const count = await notificationService.getUnreadCount(userId);
        socket.emit('notification_count', { count });
      } catch (error) {
        logger.error(`Error fetching notification count for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to fetch notification count' });
      }
    });
    
    // Handle client requesting recent notifications
    socket.on('get_recent_notifications', async (data = {}) => {
      try {
        const { limit = 10, skip = 0, read = null } = data;
        const { default: notificationService } = await import('./notificationService.js');
        
        const options = { 
          limit, 
          skip,
          sort: { createdAt: -1 }
        };
        
        if (read !== null) {
          options.filter = { read };
        }
        
        const notifications = await notificationService.getUserNotifications(userId, options);
        socket.emit('recent_notifications', { notifications });
        
      } catch (error) {
        logger.error(`Error fetching recent notifications for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to fetch recent notifications' });
      }
    });
    
    // Handle marking a notification as read
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        const { default: notificationService } = await import('./notificationService.js');
        
        if (!notificationId) {
          socket.emit('error', { message: 'Notification ID required' });
          return;
        }
        
        await notificationService.markAsRead(notificationId);
        
        // Send updated count
        const count = await notificationService.getUnreadCount(userId);
        socket.emit('notification_count', { count });
        socket.emit('notification_marked_read', { id: notificationId });
        
      } catch (error) {
        logger.error(`Error marking notification read for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });
    
    // Handle marking all notifications as read
    socket.on('mark_all_read', async () => {
      try {
        const { default: notificationService } = await import('./notificationService.js');
        
        const updatedCount = await notificationService.markAllAsRead(userId);
        
        socket.emit('notification_count', { count: 0 });
        socket.emit('all_read_success', { updatedCount });
        
      } catch (error) {
        logger.error(`Error marking all notifications read for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });
    
    // Handle deleting a notification
    socket.on('delete_notification', async (data) => {
      try {
        const { notificationId } = data;
        const { default: notificationService } = await import('./notificationService.js');
        
        if (!notificationId) {
          socket.emit('error', { message: 'Notification ID required' });
          return;
        }
        
        await notificationService.deleteNotification(notificationId);
        
        // Update count and notify client
        const count = await notificationService.getUnreadCount(userId);
        socket.emit('notification_count', { count });
        socket.emit('notification_deleted', { id: notificationId });
        
      } catch (error) {
        logger.error(`Error deleting notification for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to delete notification' });
      }
    });
  },

  /**
   * Configure presence-related event handlers
   * @param {Object} socket - Socket instance
   * @param {String} userId - User ID
   * @private
   */
  _setupPresenceHandlers(socket, userId) {
    // Handle user setting their status
    socket.on('set_status', (data) => {
      try {
        const { status } = data;
        if (!status) return;
        
        // Store user status for broadcasting
        socket.user.status = status;
        
        // Let user's team members, friends, etc. know about status change
        this._notifyUserPresenceToRelevantUsers(userId, { status });
        
      } catch (error) {
        logger.error(`Error setting status for user ${userId}:`, error);
      }
    });
    
    // Handle "typing" indicators
    socket.on('typing_start', (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;
        
        // Notify others in the conversation
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          conversationId
        });
        
      } catch (error) {
        logger.error(`Error handling typing indicator for user ${userId}:`, error);
      }
    });
    
    socket.on('typing_end', (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;
        
        // Notify others the user stopped typing
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          userId,
          conversationId
        });
        
      } catch (error) {
        logger.error(`Error handling typing end indicator for user ${userId}:`, error);
      }
    });
  },
  
  /**
   * Configure team-related event handlers
   * @param {Object} socket - Socket instance
   * @param {String} userId - User ID
   * @private
   */
  _setupTeamHandlers(socket, userId) {
    // Handle joining a team channel
    socket.on('join_team', (data) => {
      try {
        const { teamId } = data;
        if (!teamId) return;
        
        // Join the room for this team
        socket.join(`team:${teamId}`);
        
        // Track this for cleanup on disconnect
        if (!userRooms.has(userId)) {
          userRooms.set(userId, new Set());
        }
        userRooms.get(userId).add(`team:${teamId}`);
        
        // Notify user that they joined successfully
        socket.emit('joined_team', { teamId });
        
        // Optionally notify team members about user joining
        socket.to(`team:${teamId}`).emit('team_member_active', {
          teamId,
          userId,
          status: socket.user.status || 'online'
        });
        
      } catch (error) {
        logger.error(`Error joining team for user ${userId}:`, error);
        socket.emit('error', { message: 'Failed to join team channel' });
      }
    });
    
    // Handle leaving a team channel
    socket.on('leave_team', (data) => {
      try {
        const { teamId } = data;
        if (!teamId) return;
        
        // Leave the team room
        socket.leave(`team:${teamId}`);
        
        // Update tracking
        if (userRooms.has(userId)) {
          userRooms.get(userId).delete(`team:${teamId}`);
        }
        
        // Notify user they left
        socket.emit('left_team', { teamId });
        
      } catch (error) {
        logger.error(`Error leaving team for user ${userId}:`, error);
      }
    });
  },
  
  /**
   * Configure disconnect handler
   * @param {Object} socket - Socket instance
   * @param {String} userId - User ID
   * @private
   */
  _setupDisconnectHandler(socket, userId) {
    socket.on('disconnect', () => {
      try {
        logger.info(`User disconnected: ${userId} (socket: ${socket.id})`);
        
        // Remove this socket from tracked connections
        if (connectedUsers.has(userId)) {
          const userSockets = connectedUsers.get(userId);
          userSockets.delete(socket.id);
          
          // If this was the user's last active socket, handle "offline" logic
          if (userSockets.size === 0) {
            connectedUsers.delete(userId);
            
            // Clean up any room memberships
            if (userRooms.has(userId)) {
              const rooms = userRooms.get(userId);
              // Notify members of all rooms that user is offline
              rooms.forEach(room => {
                if (room.startsWith('team:')) {
                  const teamId = room.replace('team:', '');
                  io.to(room).emit('team_member_offline', { teamId, userId });
                }
              });
              userRooms.delete(userId);
            }
            
            // Notify friends/teammates that user went offline
            this._notifyUserPresenceToRelevantUsers(userId, { status: 'offline' });
          }
        }
      } catch (error) {
        logger.error(`Error handling disconnect for user ${userId}:`, error);
      }
    });
  },

  /**
   * Set up heartbeat to ensure connections stay alive
   * @private
   */
  _setupHeartbeat() {
    setInterval(() => {
      if (!io) return;
      
      io.emit('heartbeat', { timestamp: new Date() });
      
      // Log connection statistics periodically
      logger.debug(`Socket stats: ${connectedUsers.size} users, ${Array.from(connectedUsers.values()).reduce((acc, sockets) => acc + sockets.size, 0)} sockets`);
      
    }, 30000); // Every 30 seconds
  },

  // Add a periodic debug log for socket stats
  _setupHeartbeat() {
    setInterval(() => {
      const stats = this.getSocketStats();
      logger.debug(`Socket stats: ${stats.users} users, ${stats.sockets} sockets`);
      
      // Extra debugging for connected users
      if (stats.users > 0) {
        connectedUsers.forEach((sockets, userId) => {
          logger.debug(`User ${userId}: ${sockets.size} connections`);
        });
      }
    }, 15000); // Log every 15 seconds
  },
  
  /**
   * Notify relevant users about a user's presence change
   * @param {String} userId - User whose presence changed
   * @param {Object} presenceData - Presence information
   * @private
   */
  async _notifyUserPresenceToRelevantUsers(userId, presenceData) {
    try {
      // For a production app, you'd load the user's connections dynamically
      // This is just a skeleton implementation
      
      // Example: Notify team members
      if (userRooms.has(userId)) {
        const rooms = userRooms.get(userId);
        rooms.forEach(room => {
          if (room.startsWith('team:')) {
            io.to(room).emit('user_presence_change', {
              userId,
              ...presenceData
            });
          }
        });
      }
      
    } catch (error) {
      logger.error(`Error notifying presence change for user ${userId}:`, error);
    }
  },

  /**
   * Get the Socket.IO server instance
   * @returns {Object} Socket.IO server
   */
  getIO() {
    if (!io) {
      throw new Error('Socket.IO not initialized');
    }
    return io;
  },
  
  /**
   * Check if a specific user is currently connected
   * @param {string} userId - The user ID to check
   * @returns {boolean} True if the user has active connections
   */
  //   isUserConnected(userId) {
  //     return connectedUsers.has(userId) && connectedUsers.get(userId).size > 0;
  //   },
  
  /**
   * Get count of active connections for a user
   * @param {string} userId - The user ID to check
   * @returns {number} Number of active connections
   */
  getUserConnectionCount(userId) {
    if (!connectedUsers.has(userId)) return 0;
    return connectedUsers.get(userId).size;
  },
  
  /**
   * Emit an event to a specific user
   * @param {string} userId - Target user ID
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @returns {boolean} True if the event was sent (user is connected)
   */
  emitToUser(userId, event, data) {
    if (!io) {
      // Queue the event instead of just warning
      logger.warn(`Socket.IO not initialized. Queuing ${event} for user ${userId}`);
      this._queueEvent(userId, event, data);
      return false;
    }
    
    try {
      const isConnected = this.isUserConnected(userId);
      
      if (isConnected) {
        io.to(`user:${userId}`).emit(event, data);
        logger.debug(`Emitted ${event} to user ${userId}`);
      } else {
        // If user not connected, queue the event for later delivery
        this._queueEvent(userId, event, data);
        logger.debug(`User ${userId} not connected. Queued ${event}`);
      }
      
      return isConnected;
    } catch (error) {
      logger.error(`Error emitting ${event} to user ${userId}:`, error);
      return false;
    }
  },
  
  // Add a queue for pending events
  _eventQueue: new Map(),

  /**
   * Queue an event for later delivery
   * @param {string} userId - Target user ID
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @private
   */
  _queueEvent(userId, event, data) {
    if (!this._eventQueue.has(userId)) {
      this._eventQueue.set(userId, []);
    }
    
    // Add to queue with timestamp
    this._eventQueue.get(userId).push({
      event,
      data,
      timestamp: Date.now()
    });
    
    // Limit queue size to prevent memory issues
    const userQueue = this._eventQueue.get(userId);
    if (userQueue.length > 20) {
      userQueue.shift(); // Remove oldest event if queue gets too large
    }
  },

  /**
   * Process queued events for a user when they connect
   * @param {string} userId - User ID
   * @param {Object} socket - Socket instance
   * @private
   */
  _processQueuedEvents(userId, socket) {
    if (!this._eventQueue.has(userId)) return;
    
    const events = this._eventQueue.get(userId);
    if (events.length === 0) return;
    
    logger.info(`Processing ${events.length} queued events for user ${userId}`);
    
    // Send events through the user's socket
    events.forEach(({event, data}) => {
      socket.emit(event, data);
    });
    
    // Clear the queue
    this._eventQueue.set(userId, []);
  },

  /**
   * Emit an event to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @returns {Array} Array of user IDs that received the event
   */
  emitToUsers(userIds, event, data) {
    if (!io) {
      logger.warn('Attempted to emit event to multiple users but Socket.IO is not initialized');
      return [];
    }
    
    try {
      const reachedUsers = [];
      
      userIds.forEach(userId => {
        if (this.emitToUser(userId, event, data)) {
          reachedUsers.push(userId);
        }
      });
      
      logger.debug(`Emitted ${event} to ${reachedUsers.length}/${userIds.length} users`);
      return reachedUsers;
    } catch (error) {
      logger.error(`Error emitting ${event} to multiple users:`, error);
      return [];
    }
  },
  
  /**
   * Send a notification to a user
   * @param {string} userId - Target user ID
   * @param {object} notification - Notification object
   * @returns {boolean} Whether notification was delivered
   */
  sendNotification(userId, notification) {
    try {
      if (!userId) {
        logger.error('Cannot send notification: Missing userId');
        return false;
      }
      
      const userIdStr = userId.toString(); // Convert ObjectId to string if needed
      
      // Check if user is connected
      if (this.isUserConnected(userIdStr)) {
        logger.debug(`Sending notification to user ${userIdStr}`);
        io.to(`user:${userIdStr}`).emit('new_notification', notification);
        return true;
      } else {
        logger.debug(`User ${userIdStr} not connected. Queued new_notification`);
        // Queue the notification for when the user connects
        this._queueEvent(userIdStr, 'new_notification', notification);
        return false;
      }
    } catch (error) {
      logger.error('Error sending notification:', error);
      return false;
    }
  },
  
  /**
   * Emit an event to all clients in a room
   * @param {string} room - Room name
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  emitToRoom(room, event, data) {
    if (!io) return;
    
    try {
      io.to(room).emit(event, data);
      logger.debug(`Emitted ${event} to room ${room}`);
    } catch (error) {
      logger.error(`Error emitting to room ${room}:`, error);
    }
  },
  
  /**
   * Broadcast event to all connected users except specified ones
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @param {Array} excludeUserIds - User IDs to exclude
   */
  broadcastToAll(event, data, excludeUserIds = []) {
    if (!io) return;
    
    try {
      if (excludeUserIds.length === 0) {
        io.emit(event, data);
        logger.debug(`Broadcast ${event} to all users`);
      } else {
        const excludeRooms = excludeUserIds.map(id => `user:${id}`);
        io.except(excludeRooms).emit(event, data);
        logger.debug(`Broadcast ${event} to all users except ${excludeUserIds.length} excluded`);
      }
    } catch (error) {
      logger.error(`Error broadcasting to all users:`, error);
    }
  },

  /**
   * Get socket statistics
   * @returns {Object} Socket statistics
   */
  getSocketStats() {
    const stats = {
      users: connectedUsers.size,
      sockets: Array.from(connectedUsers.values())
        .reduce((total, sockets) => total + sockets.size, 0)
    };
    return stats;
  }
};

export default socketService;