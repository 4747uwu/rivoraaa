import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Clock, Users, Bell, RefreshCw, 
  Filter, ChevronDown, CalendarClock, ArrowUpRight, Search,
  AlertCircle, CheckCircle, FileText, Award, Shield, Eye,
  ChevronLeft, ChevronRight, Info, Loader2, ExternalLink,
  HelpCircle, Mail, Calendar, Sparkles, MessageSquare
} from 'lucide-react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const InvitationHandler = () => {
  const [invitations, setInvitations] = useState([]);
  const [filteredInvitations, setFilteredInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const detailsRef = useRef(null);
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // card or compact

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterOpen) setFilterOpen(false);
      if (sortOpen) setSortOpen(false);
      if (showDetails && detailsRef.current && !detailsRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen, sortOpen, showDetails]);

  useEffect(() => {
    fetchInvitations();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchInvitations(true);
    }, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Filter invitations whenever dependencies change
  useEffect(() => {
    filterInvitations();
  }, [invitations, activeTab, searchTerm, roleFilter, sortOrder]);

  // Handle filtering logic with better sorting
  const filterInvitations = () => {
    const filtered = invitations.filter(invitation => {
      // Filter by status
      const statusMatch = 
        activeTab === 'pending' ? invitation.status === 'pending' : 
        activeTab === 'accepted' ? invitation.status === 'accepted' : 
        activeTab === 'declined' ? (invitation.status === 'rejected' || invitation.status === 'declined') : 
        true;
      
      // Search term filter (case insensitive)
      const searchMatch = !searchTerm || 
        (invitation.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invitation.inviterId?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invitation.message?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Role filter
      const roleMatch = roleFilter === 'all' || invitation.role === roleFilter;
      
      return statusMatch && searchMatch && roleMatch;
    });
    
    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.sentAt || a.createdAt);
      const dateB = new Date(b.sentAt || b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredInvitations(sorted);
    
    // Reset pagination when filters change
    setPage(1);
  };

  const fetchInvitations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (silent) {
        setRefreshing(true);
        setAnimateRefresh(true);
        setTimeout(() => setAnimateRefresh(false), 1000);
      }
      
      const response = await API.get('/api/invites/requests');
      console.log('Invitations API response:', response.data);

      const newInvitations = response.data.invitations || [];
      setInvitations(newInvitations);
      setError(null);
      
      // If silent refresh and there are new pending invitations, show a notification
      if (silent && newInvitations.filter(inv => inv.status === 'pending').length > 
                    invitations.filter(inv => inv.status === 'pending').length) {
        toast.info('🔔 You have new pending invitations!', {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      if (!silent) {
        setError('Failed to load invitations');
      } else {
        toast.error('Could not refresh invitations');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      setLoading(true);
      
      // Find the invitation we're responding to for immediate UI feedback
      const invitation = invitations.find(
        inv => (inv._id === invitationId || inv.invitationId === invitationId)
      );
      
      // Log for debugging
      console.log(`Responding to invitation with ID: ${invitationId}`);
      
      // Ensure ID is a string
      const idToSend = invitationId.toString();
      
      const response = await API.post('/api/invites/respond', {
        invitationId: idToSend,
        action, // 'accept' or 'reject'
        message: '' // optional message
      });
      
      console.log('Invitation response:', response.data);

      if (response.data.success) {
        // Update local state for immediate feedback
        setInvitations(prevInvitations => 
          prevInvitations.map(inv => {
            const id = inv._id || inv.invitationId;
            if (id === invitationId) {
              return {
                ...inv,
                status: action === 'accept' ? 'accepted' : 'declined',
                respondedAt: new Date()
              };
            }
            return inv;
          })
        );
        
        // Close details panel if open
        if (showDetails && selectedInvitation && 
           (selectedInvitation._id === invitationId || selectedInvitation.invitationId === invitationId)) {
          setShowDetails(false);
        }
        
        // Show enhanced success message
        if (action === 'accept') {
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <div>
                <p className="font-medium">Invitation Accepted!</p>
                <p className="text-xs">You now have access to {invitation?.projectId?.name || 'the project'}</p>
              </div>
            </div>
          );
        } else {
          toast.success(
            <div className="flex items-center gap-2">
              <Check size={18} />
              <div>
                <p className="font-medium">Invitation Declined</p>
                <p className="text-xs">The invitation has been removed from your pending list</p>
              </div>
            </div>
          );
        }
        
        // After a short delay, refresh to get the latest data
        setTimeout(() => {
          fetchInvitations(true);
        }, 1200);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      
      let errorMessage = 'Failed to respond to invitation';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'This invitation could not be found or has been processed already';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to respond to this invitation';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open invitation details panel
  const openInvitationDetails = (invitation) => {
    setSelectedInvitation(invitation);
    setShowDetails(true);
  };

  // Get badge counts
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
  const declinedCount = invitations.filter(inv => 
    inv.status === 'declined' || inv.status === 'rejected'
  ).length;
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin':
        return <Shield size={14} className="text-amber-600" />;
      case 'member':
        return <Users size={14} className="text-blue-600" />;
      case 'editor':
        return <FileText size={14} className="text-purple-600" />;
      case 'viewer':
        return <Eye size={14} className="text-emerald-600" />;
      default:
        return null;
    }
  };
  
  // Status badge component with improved design
  const StatusBadge = ({ status, size = 'default' }) => {
    let bgColor = 'bg-gray-800';
    let textColor = 'text-gray-400';
    let icon = null;
    let label = 'Unknown';
    
    if (status === 'pending') {
      bgColor = 'bg-blue-900/20';
      textColor = 'text-blue-400';
      icon = <Clock size={size === 'small' ? 12 : 14} />;
      label = 'Pending';
    } else if (status === 'accepted') {
      bgColor = 'bg-green-900/20';
      textColor = 'text-green-400';
      icon = <CheckCircle size={size === 'small' ? 12 : 14} />;
      label = 'Accepted';
    } else if (status === 'declined' || status === 'rejected') {
      bgColor = 'bg-red-900/20';
      textColor = 'text-red-400';
      icon = <X size={size === 'small' ? 12 : 14} />;
      label = 'Declined';
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
        {icon}
        {label}
      </span>
    );
  };

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If within the last week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    if (date > oneWeekAgo) {
      const options = { weekday: 'long' };
      return `${date.toLocaleDateString(undefined, options)} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage);
  const currentInvitations = filteredInvitations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Loading state with skeleton UI
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 w-1/3 rounded mb-4"></div>
              <div className="h-4 bg-gray-600 w-1/2 rounded mb-6"></div>
              
              <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-600 w-full rounded"></div>
                <div className="h-10 bg-gray-600 w-32 rounded"></div>
              </div>
              
              <div className="flex border-b border-gray-200 mb-6">
                <div className="h-12 bg-gray-600 w-1/3 rounded-t"></div>
                <div className="h-12 bg-gray-600 w-1/3 rounded-t"></div>
                <div className="h-12 bg-gray-600 w-1/3 rounded-t"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className=" bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-lg p-4 border border-gray-100 animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-6 bg-gray-600 w-1/4 rounded"></div>
                    <div className="h-8 bg-gray-600 w-24 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-600 w-2/3 rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
                    <div className="h-6 bg-gray-600 w-1/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchInvitations()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-1000 rounded-xl shadow-md border border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-100">
                  Project Invitations
                </h1>
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Manage collaboration invitations to your projects
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'card' ? 'compact' : 'card')}
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg 
                      hover:bg-gray-600 text-gray-200 text-sm transition-colors"
                title={`Switch to ${viewMode === 'card' ? 'compact' : 'card'} view`}
              >
                {viewMode === 'card' ? 'Compact View' : 'Card View'}
              </button>
              
              <button
                onClick={() => fetchInvitations()}
                disabled={refreshing}
                className={`px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg 
                      hover:bg-gray-600 text-gray-200 text-sm transition-colors
                      flex items-center gap-2 ${refreshing ? 'opacity-70' : ''}`}
              >
                <RefreshCw 
                  size={14} 
                  className={`transition-all ${refreshing || animateRefresh ? 'animate-spin' : ''}`} 
                />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search projects, people or messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 px-4 block w-full bg-gray-700 border border-gray-600 rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-300" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Role filter dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                    setSortOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 
                         text-gray-200 text-sm transition-colors flex items-center gap-2"
                >
                  <Filter size={14} className="text-gray-500" />
                  {roleFilter === 'all' ? 'All Roles' : 
                   roleFilter === 'admin' ? 'Admins' :
                   roleFilter === 'member' ? 'Members' :
                   roleFilter === 'viewer' ? 'Viewers' : 'Filter'}
                  <ChevronDown size={14} className={`ml-1 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {filterOpen && (
                  <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-56 py-1 animate-fadeIn">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-600">
                      Filter by role
                    </div>
                    <button
                      onClick={() => { setRoleFilter('all'); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${roleFilter === 'all' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      All roles
                    </button>
                    <button
                      onClick={() => { setRoleFilter('admin'); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${roleFilter === 'admin' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      <Shield size={14} className="mr-2 text-amber-600" />
                      Admin
                    </button>
                    <button
                      onClick={() => { setRoleFilter('member'); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${roleFilter === 'member' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      <Users size={14} className="mr-2 text-blue-600" />
                      Member
                    </button>
                    <button
                      onClick={() => { setRoleFilter('viewer'); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${roleFilter === 'viewer' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      <Eye size={14} className="mr-2 text-emerald-600" />
                      Viewer
                    </button>
                  </div>
                )}
              </div>
              
              {/* Sort dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => {
                    setSortOpen(!sortOpen);
                    setFilterOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 
                         text-gray-200 text-sm transition-colors flex items-center gap-2"
                >
                  <CalendarClock size={14} className="text-gray-500" />
                  {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                  <ChevronDown size={14} className={`ml-1 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {sortOpen && (
                  <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-48 py-1 animate-fadeIn">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-600">
                      Sort by date
                    </div>
                    <button
                      onClick={() => { setSortOrder('newest'); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${sortOrder === 'newest' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      <Calendar size={14} className="mr-2" />
                      Newest First
                    </button>
                    <button
                      onClick={() => { setSortOrder('oldest'); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${sortOrder === 'oldest' ? 'text-blue-400 bg-gray-700' : ''}`}
                    >
                      <Calendar size={14} className="mr-2" />
                      Oldest First
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'pending'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
              >
                <Clock size={16} className="mr-1.5" />
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('accepted')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'accepted'
                          ? 'border-white text-green-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
              >
                <CheckCircle size={16} className="mr-1.5" />
                Accepted
                {acceptedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-black text-green-600 text-xs font-medium rounded-full">
                    {acceptedCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('declined')}
                className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center
                        ${activeTab === 'declined'
                          ? 'border-red-500 text-red-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
              >
                <X size={16} className="mr-1.5" />
                Declined
                {declinedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    {declinedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {filteredInvitations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="empty-state"
                className="bg-black rounded-xl shadow-md border border-gray-700 p-12 text-center"
              >
                {activeTab === 'pending' ? (
                  <>
                    <Bell size={40} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-gray-200 text-lg font-medium mb-1">No pending invitations</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You don't have any pending project invitations. When someone invites you to collaborate, it will appear here.
                    </p>
                  </>
                ) : activeTab === 'accepted' ? (
                  <>
                    <CheckCircle size={40} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-gray-200 text-lg font-medium mb-1">No accepted invitations</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't accepted any invitations yet. After accepting, they will appear here for easy access.
                    </p>
                  </>
                ) : (
                  <>
                    <X size={40} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-gray-200 text-lg font-medium mb-1">No declined invitations</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't declined any invitations. Declined invitations will be stored here for reference.
                    </p>
                  </>
                )}
              </motion.div>
            ) : viewMode === 'card' ? (
              // Card View
              <div className="space-y-5">
                {currentInvitations.map((invitation) => {
                  // Get the correct ID (could be either _id or invitationId)
                  const id = invitation._id || invitation.invitationId;
                  
                  // Safely access nested data with fallbacks
                  const projectName = invitation.projectId?.name || 'Untitled Project';
                  const projectDescription = invitation.projectId?.description || 'No description provided';
                  
                  const inviterName = invitation.inviterId?.username || invitation.inviterId?.name || 'Unknown';
                  
                  // Format the date
                  const dateObj = new Date(invitation.sentAt || invitation.createdAt);
                  const formattedDate = dateObj.toLocaleDateString();
                  
                  // Check if invitation is from team deployment
                  const isTeamInvite = invitation.teamDeployment;
                  
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`bg-gray-800/50 rounded-xl shadow-md border 
                               ${invitation.status === 'pending' ? 'border-blue-500/20 hover:border-blue-500/30' : 
                                 invitation.status === 'accepted' ? 'border-white-500/20 hover:border-white-500/30' :
                                 'border-gray-700 hover:border-gray-600'} 
                               p-5 transition-all hover:shadow-lg backdrop-blur-sm`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-100">
                              {projectName}
                            </h3>
                            
                            <StatusBadge status={invitation.status} />
                            
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                         ${invitation.role === 'admin' ? 'bg-amber-900/20 text-amber-400' : 
                                           invitation.role === 'member' ? 'bg-blue-900/20 text-blue-400' :
                                           'bg-emerald-900/20 text-emerald-400'}`}>
                              {getRoleIcon(invitation.role)}
                              {invitation.role}
                            </div>
                            
                            {isTeamInvite && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/20 text-purple-400 text-xs font-medium">
                                <Users size={12} />
                                Team invite
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3">
                            {projectDescription}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                           <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                              {invitation.inviterId?.profilePicture ? (
                                <img 
                                  src={invitation.inviterId.profilePicture}
                                  alt={invitation.inviterId?.username || "User"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${(invitation.inviterId?.username?.charAt(0) || "U")}&background=random`;
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {(invitation.inviterId?.username?.charAt(0) || "U").toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span>From {invitation.inviterId?.username || "Unknown user"}</span>
                          </div>
                            
                            <div className="flex items-center gap-1.5">
                              <CalendarClock size={14} className="text-gray-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                          
                          {invitation.message && (
                            <div className="text-sm italic text-gray-300 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                              "{invitation.message}"
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 self-start">
                          {invitation.status === 'pending' ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleInvitationResponse(id, 'accept')}
                                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg
                                         border border-green-500/20 transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <CheckCircle size={16} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleInvitationResponse(id, 'reject')}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg
                                         border border-gray-700 transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <X size={16} />
                                <span>Decline</span>
                              </button>
                            </div>
                          ) : invitation.status === 'accepted' ? (
                            <Link
                              to={`/project/${typeof invitation.projectId === 'string' ? invitation.projectId : invitation.projectId?._id}`}
                              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg
                                     border border-blue-500/20 transition-colors flex items-center gap-2"
                            >
                              <ArrowUpRight size={16} />
                              <span>View Project</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Declined on {new Date(invitation.respondedAt || invitation.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div>
                {filteredInvitations.map((invitation) => {
                  // Get the correct ID (could be either _id or invitationId)
                  const id = invitation._id || invitation.invitationId;
                  
                  // Safely access nested data with fallbacks
                  const projectName = invitation.projectId?.name || 'Untitled Project';
                  const projectDescription = invitation.projectId?.description || 'No description provided';
                  
                  const inviterName = invitation.inviterId?.username || 'Unknown';
                  const inviterPic = invitation.inviterId?.profilePicture;
                  
                  // Format the date
                  const dateObj = new Date(invitation.sentAt || invitation.createdAt);
                  const formattedDate = dateObj.toLocaleDateString();
                  
                  // Check if invitation is from team deployment
                  const isTeamInvite = invitation.teamDeployment;
                  
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`bg-gray-800/50 rounded-xl shadow-md border 
                               ${invitation.status === 'pending' ? 'border-blue-500/20 hover:border-blue-500/30' : 
                                 invitation.status === 'accepted' ? 'border-green-500/20 hover:border-green-500/30' :
                                 'border-gray-700 hover:border-gray-600'} 
                               p-5 transition-all hover:shadow-lg backdrop-blur-sm`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-100">
                              {projectName}
                            </h3>
                            
                            <StatusBadge status={invitation.status} />
                            
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                         ${invitation.role === 'admin' ? 'bg-amber-900/20 text-amber-400' : 
                                           invitation.role === 'member' ? 'bg-blue-900/20 text-blue-400' :
                                           'bg-emerald-900/20 text-emerald-400'}`}>
                              {getRoleIcon(invitation.role)}
                              {invitation.role}
                            </div>
                            
                            {isTeamInvite && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/20 text-purple-400 text-xs font-medium">
                                <Users size={12} />
                                Team invite
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3">
                            {projectDescription}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                {inviterPic ? (
                                  <img 
                                    src={inviterPic} 
                                    alt={inviterName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/40?text=' + inviterName.charAt(0);
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-gray-600">
                                    {inviterName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span>From {inviterName}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <CalendarClock size={14} className="text-gray-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                          
                          {invitation.message && (
                            <div className="text-sm italic text-gray-300 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                              "{invitation.message}"
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 self-start">
                          {invitation.status === 'pending' ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleInvitationResponse(id, 'accept')}
                                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg
                                         border border-green-500/20 transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <CheckCircle size={16} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleInvitationResponse(id, 'reject')}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg
                                         border border-gray-700 transition-colors flex items-center gap-2 w-full justify-center"
                              >
                                <X size={16} />
                                <span>Decline</span>
                              </button>
                            </div>
                          ) : invitation.status === 'accepted' ? (
                            <Link
                              to={`/project/${typeof invitation.projectId === 'string' ? invitation.projectId : invitation.projectId?._id}`}
                              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg
                                     border border-blue-500/20 transition-colors flex items-center gap-2"
                            >
                              <ArrowUpRight size={16} />
                              <span>View Project</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Declined on {new Date(invitation.respondedAt || invitation.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Helpful tips section */}
        {activeTab === 'pending' && pendingCount > 0 && (
          <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <HelpCircle size={20} className="text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-200">Project Collaboration Tips</h3>
                <div className="mt-2 text-sm text-gray-400">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Admin roles can manage project settings and invites</li>
                    <li>Member roles can contribute to project content</li>
                    <li>Viewer roles can access but not modify content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationHandler;