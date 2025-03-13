import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, UserCheck, UserX, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useConnection } from '../../context/connectionContext';

const UserConnectionCard = ({ 
  user, 
  connectionStatus = null, 
  connectionType = null, 
  connectionId = null,
  since = null,
  onAction = () => {},
  showActions = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    sendRequest, 
    removeConnection, 
    acceptRequest, 
    declineRequest, 
    blockUser 
  } = useConnection();

  const handleConnect = async (type) => {
    try {
      setIsLoading(true);
      await sendRequest(user._id, type);
      onAction('connect', user._id);
    } catch (error) {
      console.error('Connection action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      await removeConnection(user._id);
      onAction('remove', user._id);
    } catch (error) {
      console.error('Remove action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await acceptRequest(connectionId);
      onAction('accept', user._id);
    } catch (error) {
      console.error('Accept action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsLoading(true);
      await declineRequest(connectionId);
      onAction('decline', user._id);
    } catch (error) {
      console.error('Decline action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      setIsLoading(true);
      await blockUser(user._id);
      onAction('block', user._id);
    } catch (error) {
      console.error('Block action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const getConnectionBadge = () => {
    if (!connectionType) return null;
    
    if (connectionType === 'follow') {
      return (
        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
          Follower
        </span>
      );
    }
    return (
      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
        LinkUp
      </span>
    );
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    switch (connectionStatus) {
      case 'accepted':
        return (
          <div className="flex gap-2">
            <button 
              disabled={isLoading}
              onClick={handleRemove}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-800/30 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors duration-200"
            >
              <UserMinus size={14} />
              <span>Disconnect</span>
            </button>
            <button
              disabled={isLoading}
              onClick={() => window.open(`/profile/${user._id}`, '_blank')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              <ExternalLink size={14} />
              <span>Profile</span>
            </button>
          </div>
        );
        
      case 'pending':
        if (connectionType === 'follow' && user.isRequester) {
          return (
            <div className="flex gap-2">
              <button
                disabled={isLoading}
                onClick={handleAccept}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 transition-colors duration-200"
              >
                <UserCheck size={14} />
                <span>Accept</span>
              </button>
              <button
                disabled={isLoading}
                onClick={handleDecline}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                <UserX size={14} />
                <span>Decline</span>
              </button>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
              <span>Pending</span>
            </div>
          );
        }
        
      case 'none':
      default:
        return (
          <div className="flex gap-2">
            <button
              disabled={isLoading}
              onClick={() => handleConnect('follow')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 transition-colors duration-200"
            >
              <UserPlus size={14} />
              <span>Follow</span>
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleConnect('linkUps')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:border-purple-800/30 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 transition-colors duration-200"
            >
              <UserCheck size={14} />
              <span>LinkUp</span>
            </button>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-white">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800 dark:text-white">{user.name}</h3>
            {getConnectionBadge()}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          {user.profession && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{user.profession}</p>
          )}
          {since && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(since)}
            </p>
          )}
        </div>
      </div>
      
      {renderActionButtons()}
    </motion.div>
  );
};

export default UserConnectionCard;