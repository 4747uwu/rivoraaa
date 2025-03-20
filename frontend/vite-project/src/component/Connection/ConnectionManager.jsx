import React, { useState, useEffect } from 'react';
import { useConnection } from '../../context/connectionContext';
import { Users, UserPlus, X, Check, Loader, Bell, Search, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../sideNavbar';
import { Link } from 'react-router-dom';

// Animation variants
const tabContentVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const listItemVariants = {
  hidden: (i) => ({
    opacity: 0,
    y: 20,
    transition: {
      delay: i * 0.1,
      duration: 0.2,
      ease: "easeInOut"
    }
  }),
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeInOut"
    }
  })
};

const ConnectionManager = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visitedProfiles, setVisitedProfiles] = useState(new Set());
  
  // Data States
  const [linkUpsData, setLinkUpsData] = useState({ data: [], count: 0, currentPage: 1, totalPages: 1, loading: true, error: null });
  const [pendingData, setPendingData] = useState({ received: [], sent: [], loading: true, error: null });
  const [searchData, setSearchData] = useState({ data: [], count: 0, totalPages: 1, loading: false, error: null });

  const {
    getLinkUps,
    getPendingLinkUps,
    searchUsers,
    sendLinkUp,
    acceptLinkUp,
    rejectLinkUp,
    removeLinkUp,
    isLoadingSendLinkUp,
    isLoadingAcceptLinkUp,
    isLoadingRejectLinkUp,
    isLoadingRemoveLinkUp
  } = useConnection();

  // Fetch LinkUps data
  useEffect(() => {
    const fetchLinkUps = async () => {
      try {
        setLinkUpsData(prev => ({ ...prev, loading: true }));
        const result = await getLinkUps(page, 10);
        setLinkUpsData({ ...result.linkUps, loading: false });
      } catch (error) {
        setLinkUpsData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    if (activeTab === 'connections') {
      fetchLinkUps();
    }
  }, [page, activeTab]);

  // Fetch Pending LinkUps
  useEffect(() => {
    const fetchPendingLinkUps = async () => {
      try {
        setPendingData(prev => ({ ...prev, loading: true }));
        const result = await getPendingLinkUps();
        setPendingData({ 
          ...result.pendingLinkUps, 
          loading: false 
        });
      } catch (error) {
        setPendingData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    if (activeTab === 'pending') {
      fetchPendingLinkUps();
    }
  }, [activeTab]);

  // Search Users
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchEnabled || searchQuery.length < 2) {
        setSearchData({ data: [], count: 0, loading: false, error: null });
        return;
      }

      try {
        setSearchData(prev => ({ ...prev, loading: true }));
        const result = await searchUsers(searchQuery, page, 10);
        setSearchData({ ...result.searchResults, loading: false });
      } catch (error) {
        setSearchData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    if (activeTab === 'search') {
      fetchSearchResults();
    }
  }, [searchQuery, page, searchEnabled, activeTab]);

  // Enable search when query is at least 2 characters
  useEffect(() => {
    setSearchEnabled(searchQuery.length >= 2);
    if (searchQuery.length >= 2) {
      setPage(1);
    }
  }, [searchQuery]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Action Handlers
  const handleSendRequest = (userId) => {
    setSelectedUser(userId);
  };

  const submitRequest = async () => {
    if (!selectedUser) return;
    
    try {
      await sendLinkUp(selectedUser, messageText);
      setSelectedUser(null);
      setMessageText('');
      // Refresh pending data after sending request
      const result = await getPendingLinkUps();
      setPendingData({ ...result.pendingLinkUps, loading: false });
    } catch (err) {
      // Error handling managed by the context
    }
  };

  const handleAcceptReject = async (action, connectionId) => {
    try {
      if (action === 'accept') {
        await acceptLinkUp(connectionId);
      } else {
        await rejectLinkUp(connectionId);
      }
      // Refresh pending data after action
      const result = await getPendingLinkUps();
      setPendingData({ ...result.pendingLinkUps, loading: false });
      // Also refresh linkUps if accepted
      if (action === 'accept') {
        const linkUpsResult = await getLinkUps(page, 10);
        setLinkUpsData({ ...linkUpsResult.linkUps, loading: false });
      }
    } catch (err) {
      // Error handling managed by the context
    }
  };

  const handleRemoveConnection = async (userId) => {
    try {
      await removeLinkUp(userId);
      // Refresh linkUps data after removal
      const result = await getLinkUps(page, 10);
      setLinkUpsData({ ...result.linkUps, loading: false });
    } catch (err) {
      // Error handling managed by the context
    }
  };

  const forceRefetch = async () => {
    setIsRefreshing(true);
    try {
      const [linkUpsResult, pendingResult] = await Promise.all([
        getLinkUps(page, 10),
        getPendingLinkUps()
      ]);
      
      setLinkUpsData({ ...linkUpsResult.linkUps, loading: false });
      setPendingData({ ...pendingResult.pendingLinkUps, loading: false });
      
      if (searchEnabled) {
        const searchResult = await searchUsers(searchQuery, page, 10);
        setSearchData({ ...searchResult.searchResults, loading: false });
      }
    } catch (err) {
      // Error handling managed by the context
    } finally {
      setIsRefreshing(false);
    }
  };

  // Try again handlers
  const retryFetchLinkUps = async () => {
    try {
      setLinkUpsData(prev => ({ ...prev, loading: true, error: null }));
      const result = await getLinkUps(page, 10);
      setLinkUpsData({ ...result.linkUps, loading: false });
    } catch (error) {
      setLinkUpsData(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const retryFetchPending = async () => {
    try {
      setPendingData(prev => ({ ...prev, loading: true, error: null }));
      const result = await getPendingLinkUps();
      setPendingData({ ...result.pendingLinkUps, loading: false });
    } catch (error) {
      setPendingData(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };
  
  return (
    <div className="col-span-12 xl:col-span-9 2xl:col-span-10 bg-black">
      {/* Sidebar */}
     
      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-auto bg-black">
        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-800 sticky top-0 bg-gray-1000 z-10">
          <motion.button
            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-3 font-medium ${activeTab === 'connections' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              My LinkUps
              {linkUpsData?.count > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 bg-blue-900 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {linkUpsData.count}
                </motion.span>
              )}
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-3 font-medium ${activeTab === 'pending' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            <div className="flex items-center">
              <Bell size={16} className="mr-2" />
              Pending
              {(pendingData.received?.length > 0 || pendingData.sent?.length > 0) && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 bg-blue-900 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {(pendingData.received?.length || 0) + (pendingData.sent?.length || 0)}
                </motion.span>
              )}
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('search')}
            className={`px-4 py-3 font-medium ${activeTab === 'search' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            <div className="flex items-center">
              <Search size={16} className="mr-2" />
              Find People
            </div>
          </motion.button>

          {/* Dev-only debug button */}
          {process.env.NODE_ENV !== 'production' && (
            <motion.button
              whileHover={{ backgroundColor: "rgba(244, 63, 94, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={forceRefetch}
              disabled={isRefreshing}
              className="ml-auto px-2 py-1 mr-2 my-auto text-xs bg-red-900/50 text-red-300 rounded flex items-center"
              title="Force data refresh"
            >
              <RefreshCw size={12} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Debug Refresh'}
            </motion.button>
          )}
        </div>
        
        {/* Search Bar for Search Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden sticky top-[53px] z-10"
            >
              <div className="p-4 border-b border-gray-800 bg-gray-850">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for people..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-200 transition-all duration-200"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X size={16} className="text-gray-500 hover:text-gray-300" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {searchQuery.length < 2 ? 
                    'Type at least 2 characters to search' : 
                    `Showing results for "${searchQuery}"`
                  }
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Content Area */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Connections Tab Content */}
            {activeTab === 'connections' && (
              <motion.div
                key="connections-tab"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
              >
                {linkUpsData.loading ? (
                  <div className="flex justify-center py-10">
                    <Loader className="animate-spin text-blue-400" size={30} />
                  </div>
                ) : linkUpsData.error ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-red-400 mb-2">Error: {linkUpsData.error}</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={retryFetchLinkUps}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : linkUpsData.data.length === 0 ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Users size={48} className="text-gray-700 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-gray-300 font-medium mb-1">No connections yet</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Search for people and send LinkUp requests to connect
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('search')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Find People
                    </motion.button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {linkUpsData.data.map((connection, index) => (
                      <motion.div
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={listItemVariants}
                        key={connection.connectionId}
                        className="py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-gray-700">
                            {connection.user?.profilePicture ? (
                              <img 
                                src={connection.user?.profilePicture} 
                                alt={connection.user?.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users size={20} className="text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <Link to={`/profile/${connection.user._id}`} className="block">
                              <h3 className="font-medium text-gray-200 hover:text-blue-400 transition-colors">
                                {connection.user.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-400">@{connection.user?.username}</p>
                            {connection.user.profession && (
                              <p className="text-xs text-gray-500">{connection.user?.profession}</p>
                            )}
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveConnection(connection.user?._id)}
                          disabled={isLoadingRemoveLinkUp}
                          className="px-3 py-1 border border-gray-700 rounded text-sm text-gray-300 hover:bg-red-900/30 disabled:opacity-50 transition-colors group"
                        >
                          <span className="group-hover:hidden">Remove</span>
                          <span className="hidden group-hover:inline">Disconnect</span>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Pagination for connections */}
                {linkUpsData.totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mt-6 space-x-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-800 text-gray-300"
                    >
                      Previous
                    </motion.button>
                    <span className="px-3 py-1 text-gray-400">
                      Page {page} of {linkUpsData.totalPages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(Math.min(linkUpsData.totalPages, page + 1))}
                      disabled={page === linkUpsData.totalPages}
                      className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-800 text-gray-300"
                    >
                      Next
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* Pending Tab Content */}
            {activeTab === 'pending' && (
              <motion.div
                key="pending-tab"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
              >
                {pendingData.loading ? (
                  <div className="flex justify-center py-10">
                    <Loader className="animate-spin text-blue-400" size={30} />
                  </div>
                ) : pendingData.error ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-red-400 mb-2">Error: {pendingData.error}</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={retryFetchPending}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : pendingData.received?.length === 0 && pendingData.sent?.length === 0 ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Bell size={48} className="text-gray-700 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-gray-300 font-medium mb-1">No pending requests</h3>
                    <p className="text-gray-500 text-sm">
                      You don't have any pending LinkUp requests
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Received requests */}
                    <AnimatePresence>
                      {pendingData.received && pendingData.received.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mb-8"
                        >
                          <h3 className="text-lg font-medium mb-4 text-gray-200">Received Requests</h3>
                          <div className="divide-y divide-gray-800">
                            {pendingData.received.map((request, index) => (
                              <motion.div
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={listItemVariants}
                                key={request.connectionId}
                                className="py-4 flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-gray-700">
                                    {request.user?.profilePicture ? (
                                      <img 
                                        src={request.user?.profilePicture} 
                                        alt={request.user?.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Users size={20} className="text-gray-500" />
                                    )}
                                  </div>
                                  
                                  <div className="ml-4">
                                    <Link to={`/profile/${request.user?._id}`} className="block">
                                      <h3 className="font-medium text-gray-200 hover:text-blue-400 transition-colors">
                                        {request.user.name}
                                      </h3>
                                    </Link>
                                    <p className="text-sm text-gray-400">@{request.user?.username}</p>
                                    {request.message && (
                                      <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xs text-gray-500 mt-1 italic bg-gray-800/50 p-2 rounded"
                                      >
                                        "{request?.message}"
                                      </motion.p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAcceptReject('accept', request.connectionId)}
                                    disabled={isLoadingAcceptLinkUp}
                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    {isLoadingAcceptLinkUp ? (
                                      <Loader size={14} className="animate-spin" />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAcceptReject('reject', request.connectionId)}
                                    disabled={isLoadingRejectLinkUp}
                                    className="p-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors"
                                  >
                                    {isLoadingRejectLinkUp ? (
                                      <Loader size={14} className="animate-spin" />
                                    ) : (
                                      <X size={14} />
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Sent requests */}
                    <AnimatePresence>
                      {pendingData.sent && pendingData.sent.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-lg font-medium mb-4 text-gray-200">Sent Requests</h3>
                          <div className="divide-y divide-gray-800">
                            {pendingData.sent.map((request, index) => (
                              <motion.div
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={listItemVariants}
                                key={request.connectionId}
                                className="py-4 flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-gray-700">
                                    {request.user?.profilePicture ? (
                                      <img 
                                        src={request.user?.profilePicture} 
                                        alt={request.user?.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Users size={20} className="text-gray-500" />
                                    )}
                                  </div>
                                  
                                  <div className="ml-4">
                                    <h3 className="font-medium text-gray-200">{request?.user.name}</h3>
                                    <p className="text-sm text-gray-400">@{request?.user?.username}</p>
                                    <motion.span 
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="text-xs text-amber-500 bg-amber-900/40 px-2 py-0.5 rounded-full inline-block mt-1"
                                    >
                                      Pending
                                    </motion.span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Search Tab Content */}
            {activeTab === 'search' && (
              <motion.div
                key="search-tab"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
              >
                {searchEnabled && searchData.loading ? (
                  <div className="flex justify-center py-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader className="text-blue-400" size={30} />
                    </motion.div>
                  </div>
                ) : searchEnabled && searchData.error ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-red-400 mb-2">Error: {searchData.error}</p>
                  </div>
                ) : searchEnabled && searchData.data.length === 0 ? (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Search size={48} className="text-gray-700 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-gray-300 font-medium mb-1">No results found</h3>
                    <p className="text-gray-500 text-sm">
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                ) : searchEnabled ? (
                  <div className="divide-y divide-gray-800">
                    {searchData.data.map((user, index) => (
                      <motion.div
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={listItemVariants}
                        key={user._id}
                        className="py-4"
                      >
                        <div className="flex items-center justify-between">
                          <Link to={`/profile/${user._id}`} className="flex items-center flex-grow group">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all">
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  alt={user.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={20} className="text-gray-500" />
                              )}
                            </div>
                            
                            <div className="ml-4">
                              <h3 className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                                {user.name}
                              </h3>
                              <p className="text-sm text-gray-400">@{user.username}</p>
                              {user.profession && (
                                <p className="text-xs text-gray-500">{user.profession}</p>
                              )}
                              {visitedProfiles.has(user._id) && (
                                <span className="text-xs text-blue-500 ml-1">
                                  (Visited)
                                </span>
                              )}
                            </div>
                          </Link>
                          
                          <div className="flex items-center space-x-2">
                            <Link 
                              to={`/profile/${user._id}`}
                              className="px-3 py-1 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-colors flex items-center"
                            >
                              <Eye size={14} className="mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                            
                            {selectedUser !== user._id ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendRequest(user._id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                <div className="flex items-center">
                                  <UserPlus size={14} className="mr-1" />
                                  <span>Send LinkUp</span>
                                </div>
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedUser(null)}
                                className="px-3 py-1 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-colors"
                              >
                                Cancel
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {selectedUser === user._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 ml-16 overflow-hidden"
                            >
                              <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Add a message (optional)"
                                className="w-full border border-gray-700 bg-gray-800 rounded p-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                rows={3}
                              />
                              <div className="flex justify-end mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={submitRequest}
                                  disabled={isLoadingSendLinkUp}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  {isLoadingSendLinkUp ? (
                                    <div className="flex items-center">
                                      <Loader size={14} className="animate-spin mr-2" />
                                      <span>Sending...</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <UserPlus size={14} className="mr-2" />
                                      <span>Send Request</span>
                                    </div>
                                  )}
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    
                    {/* Pagination for search results */}
                    {searchData.totalPages > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mt-6 space-x-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-800 text-gray-300"
                        >
                          Previous
                        </motion.button>
                        <span className="px-3 py-1 text-gray-400">
                          Page {page} of {searchData.totalPages}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPage(Math.min(searchData.totalPages, page + 1))}
                          disabled={page === searchData.totalPages}
                          className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-800 text-gray-300"
                        >
                          Next
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Search size={48} className="text-gray-700 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-gray-300 font-medium mb-1">Search for people</h3>
                    <p className="text-gray-500 text-sm">
                      Type in the search box to find people to connect with
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;