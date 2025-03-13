import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, PlusCircle, Search, Briefcase, Clock, Settings, Trash2, 
  UserPlus, X, Check, Edit, Save, ArrowLeft, Eye, Lock, Globe, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTeam } from '../../context/teamContext';
import { useConnection } from '../../context/connectionContext';
import { useAuth } from '../../context/authContext';

// Style constants (matching your ProfilePage)
const backgroundGradient = `bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]`;
const highlightGradient = `bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10`;

const glassCard = `
  bg-[#1E293B]/50
  backdrop-blur-xl
  shadow-[0_8px_32px_rgb(0,0,0,0.15)]
  border
  border-indigo-500/20
  hover:border-indigo-500/30
  transition-all
  duration-300
  group
`;

const textClass = 'text-gray-100 font-medium';
const headingClass = 'bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent';
const subTextClass = 'text-gray-400/90';
const buttonPrimary = 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200';
const buttonSecondary = 'bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200';
const buttonDanger = 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200';

const TeamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState(teamId ? 'details' : 'myTeams');
  
  // Team data states
  const [ownedTeams, setOwnedTeams] = useState([]);
  const [memberTeams, setMemberTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  
  // Team editing states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    avatar: ''
  });
  
  // Member management states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableConnections, setAvailableConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [roleInput, setRoleInput] = useState('Member');
  const [editingMember, setEditingMember] = useState(null);
  
  // Team context
  const { 
    getMyTeams, getTeam, getAvailableConnections,
    createTeam, updateTeam, deleteTeam, 
    addTeamMember, updateTeamMember, removeTeamMember, leaveTeam,
    isLoadingCreateTeam, isLoadingUpdateTeam, isLoadingDeleteTeam,
    isLoadingAddMember, isLoadingUpdateMember, isLoadingRemoveMember,
    isLoadingLeaveTeam
  } = useTeam();
  
  // Fetch initial data
  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
      setActiveTab('details');
    } else {
      fetchTeams();
    }
  }, [teamId]);
  
  // Fetch team details when ID changes
  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);
  
  // Fetch available connections when search query changes
  useEffect(() => {
    if (teamId && currentTeam && showMemberForm && currentTeam.owner._id === user._id) {
      fetchAvailableConnections();
    }
  }, [searchQuery, showMemberForm, teamId]);
  
  // Reset form data when switching to creation mode
  useEffect(() => {
    if (isCreating) {
      setTeamFormData({
        name: '',
        description: '',
        category: '',
        isPrivate: false,
        avatar: ''
      });
    }
  }, [isCreating]);
  
  // Set form data when editing existing team
  useEffect(() => {
    if (isEditing && currentTeam) {
      setTeamFormData({
        name: currentTeam.name || '',
        description: currentTeam.description || '',
        category: currentTeam.category || '',
        isPrivate: currentTeam.isPrivate || false,
        avatar: currentTeam.avatar || ''
      });
    }
  }, [isEditing, currentTeam]);
  
  /**
   * Fetch all teams for the current user
   */
  const fetchTeams = async () => {
    setLoading(true);
    const { ownedTeams: owned, memberTeams: member } = await getMyTeams(pagination.page);
    setOwnedTeams(owned.data || []);
    setMemberTeams(member.data || []);
    setPagination({
      page: owned.pagination?.currentPage || 1,
      totalPages: Math.max(
        owned.pagination?.totalPages || 1, 
        member.pagination?.totalPages || 1
      )
    });
    setLoading(false);
  };
  
  /**
   * Fetch details for a specific team
   */
  const fetchTeamDetails = async () => {
    setLoading(true);
    const { team, error } = await getTeam(teamId);
    
    if (error) {
      toast.error("Failed to load team details");
      navigate('/teams');
      return;
    }
    
    setCurrentTeam(team);
    setLoading(false);
  };
  
  /**
   * Fetch available connections for adding to team
   */
  const fetchAvailableConnections = async () => {
    if (!teamId) return;
    
    const { connections } = await getAvailableConnections(teamId, searchQuery);
    setAvailableConnections(connections);
  };
  
  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  /**
   * Handle team creation submission
   */
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    try {
      await createTeam(teamFormData);
      setIsCreating(false);
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };
  
  /**
   * Handle team update submission
   */
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    
    try {
      await updateTeam(teamId, teamFormData);
      setIsEditing(false);
      fetchTeamDetails();
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };
  
  /**
   * Handle team deletion with confirmation
   */
  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteTeam(teamId);
      toast.success("Team deleted successfully");
      navigate('/teams');
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };
  
  /**
   * Handle adding a member to the team
   */
  const handleAddMember = async () => {
    if (!selectedConnection || !roleInput) {
      toast.error("Please select a connection and assign a role");
      return;
    }
    
    try {
      await addTeamMember(teamId, selectedConnection._id, roleInput);
      setSelectedConnection(null);
      setRoleInput('Member');
      setShowMemberForm(false);
      fetchTeamDetails();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };
  
  /**
   * Handle updating a member's role
   */
  const handleUpdateMember = async () => {
    if (!editingMember || !roleInput) {
      toast.error("Please assign a valid role");
      return;
    }
    
    try {
      await updateTeamMember(teamId, editingMember.user._id, roleInput);
      setEditingMember(null);
      setRoleInput('Member');
      fetchTeamDetails();
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };
  
  /**
   * Handle removing a member from the team
   */
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) {
      return;
    }
    
    try {
      await removeTeamMember(teamId, memberId);
      fetchTeamDetails();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };
  
  /**
   * Handle leaving a team (for members)
   */
  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) {
      return;
    }
    
    try {
      await leaveTeam(teamId);
      toast.success("You've left the team");
      navigate('/teams');
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };
  
  // UI Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  // Format date helper function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className={`min-h-screen ${backgroundGradient} flex justify-center items-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Users className="w-8 h-8 text-indigo-400" />
        </motion.div>
      </div>
    );
  }
  
  // Render Team Creation Form
  const renderTeamForm = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${glassCard} rounded-lg p-6 max-w-2xl mx-auto`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl ${headingClass}`}>
          {isCreating ? 'Create New Team' : 'Edit Team'}
        </h2>
        <button 
          onClick={() => isCreating ? setIsCreating(false) : setIsEditing(false)} 
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={isCreating ? handleCreateTeam : handleUpdateTeam}>
        <div className="space-y-4">
          <div>
            <label className={`block mb-1 ${textClass}`}>Team Name</label>
            <input 
              type="text"
              name="name"
              value={teamFormData.name}
              onChange={handleInputChange}
              placeholder="Enter team name"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className={`block mb-1 ${textClass}`}>Category</label>
            <select
              name="category"
              value={teamFormData.category}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select a category</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Support">Support</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className={`block mb-1 ${textClass}`}>Description</label>
            <textarea
              name="description"
              value={teamFormData.description}
              onChange={handleInputChange}
              placeholder="Describe the team's purpose"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={teamFormData.isPrivate}
              onChange={handleInputChange}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPrivate" className={`ml-2 ${textClass}`}>
              Make team private
            </label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => isCreating ? setIsCreating(false) : setIsEditing(false)}
              className={buttonSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={buttonPrimary}
              disabled={isLoadingCreateTeam || isLoadingUpdateTeam}
            >
              {isLoadingCreateTeam || isLoadingUpdateTeam ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-2"
                  >
                    <Clock size={16} />
                  </motion.div>
                  Processing...
                </div>
              ) : isCreating ? 'Create Team' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
  
  // Render Add Member Form
  const renderAddMemberForm = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${glassCard} rounded-lg p-6 max-w-2xl mx-auto my-4`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl ${headingClass}`}>Add Team Member</h2>
        <button 
          onClick={() => {
            setShowMemberForm(false);
            setSelectedConnection(null);
            setSearchQuery('');
          }} 
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-200"
          />
        </div>
      </div>
      
      {availableConnections.length === 0 ? (
        <div className="text-center py-4 bg-gray-800/50 rounded-lg">
          <p className={subTextClass}>
            {searchQuery ? 'No connections found matching your search' : 'No available connections'}
          </p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
          {availableConnections.map(connection => (
            <div 
              key={connection._id}
              onClick={() => setSelectedConnection(connection)}
              className={`p-3 rounded-lg cursor-pointer flex items-center ${
                selectedConnection?._id === connection._id 
                  ? 'bg-indigo-600/30 border border-indigo-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                {connection.profilePicture ? (
                  <img 
                    src={connection.profilePicture} 
                    alt={connection.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User size={16} className="text-gray-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={textClass}>{connection.name}</p>
                <p className="text-xs text-gray-400">@{connection.username}</p>
              </div>
              {selectedConnection?._id === connection._id && (
                <div className="ml-auto">
                  <Check className="text-indigo-400" size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {selectedConnection && (
        <div className="mt-4">
          <div className="mb-4">
            <label className={`block mb-1 ${textClass}`}>Role</label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="E.g. Developer, Designer, etc."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setSelectedConnection(null)}
              className={buttonSecondary}
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              className={buttonPrimary}
              disabled={isLoadingAddMember || !roleInput.trim()}
            >
              {isLoadingAddMember ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-2"
                  >
                    <Clock size={16} />
                  </motion.div>
                  Adding...
                </div>
              ) : 'Add Member'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
  
  // Render Edit Member Form
  const renderEditMemberForm = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${glassCard} rounded-lg p-6 max-w-2xl mx-auto my-4`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl ${headingClass}`}>
          Update {editingMember?.user?.name}'s Role
        </h2>
        <button 
          onClick={() => {
            setEditingMember(null);
            setRoleInput('Member');
          }} 
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <label className={`block mb-1 ${textClass}`}>Role</label>
        <input
          type="text"
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          placeholder="E.g. Developer, Designer, etc."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setEditingMember(null)}
          className={buttonSecondary}
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateMember}
          className={buttonPrimary}
          disabled={isLoadingUpdateMember || !roleInput.trim()}
        >
          {isLoadingUpdateMember ? (
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mr-2"
              >
                <Clock size={16} />
              </motion.div>
              Updating...
            </div>
          ) : 'Update Role'}
        </button>
      </div>
    </motion.div>
  );
  
  // Render My Teams Tab
  const renderMyTeamsTab = () => (
    <>
      {isCreating ? (
        renderTeamForm()
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl ${headingClass}`}>My Teams</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className={buttonPrimary}
            >
              <div className="flex items-center">
                <PlusCircle size={16} className="mr-2" />
                Create Team
              </div>
            </motion.button>
          </div>
          
          {/* Owned Teams */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg ${textClass}`}>Teams I Own</h3>
            {ownedTeams.length === 0 ? (
              <div className={`${glassCard} rounded-lg p-6 text-center`}>
                <Briefcase className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <h4 className={textClass}>No teams created yet</h4>
                <p className={subTextClass}>Create your first team to start collaborating</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-4 text-indigo-400 hover:text-indigo-300"
                >
                  Create a team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedTeams.map(team => (
                  <motion.div
                    key={team._id}
                    whileHover={{ y: -5 }}
                    className={`${glassCard} rounded-lg p-4 shadow-lg`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        team.isPrivate 
                          ? 'bg-gray-700/70 text-gray-300' 
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        <div className="flex items-center space-x-1">
                          {team.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                          <span>{team.isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
                        {team.category}
                      </span>
                    </div>
                    
                    <Link to={`/teams/${team._id}`} className="block group">
                      <h4 className={`text-lg font-semibold ${textClass} group-hover:text-indigo-300 transition-colors`}>
                        {team.name}
                      </h4>
                    </Link>
                    
                    {team.description && (
                      <p className={`${subTextClass} text-sm mt-2 line-clamp-2`}>
                        {team.description}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-400">
                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        <Link 
                          to={`/teams/${team._id}`} 
                          className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center"
                        >
                          <span>Manage</span>
                          <Eye size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Member Teams */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg ${textClass}`}>Teams I'm In</h3>
            {memberTeams.length === 0 ? (
              <div className={`${glassCard} rounded-lg p-6 text-center`}>
                <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <h4 className={textClass}>You're not a member of any teams</h4>
                <p className={subTextClass}>When you're added to a team, it will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memberTeams.map(team => (
                  <motion.div
                    key={team._id}
                    whileHover={{ y: -5 }}
                    className={`${glassCard} rounded-lg p-4 shadow-lg`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
                        {team.category}
                      </span>
                      
                      <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                        {team.members.find(m => m.user._id === user._id)?.role || 'Member'}
                      </span>
                    </div>
                    
                    <Link to={`/teams/${team._id}`} className="block group">
                      <h4 className={`text-lg font-semibold ${textClass} group-hover:text-indigo-300 transition-colors`}>
                        {team.name}
                      </h4>
                    </Link>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                        {team.owner?.profilePicture ? (
                          <img 
                            src={team.owner.profilePicture} 
                            alt={team.owner.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={12} className="text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {team.owner?.name}
                      </span>
                    </div>
                    
                    {team.description && (
                      <p className={`${subTextClass} text-sm mt-2 line-clamp-2`}>
                        {team.description}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-400">
                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        <Link 
                          to={`/teams/${team._id}`} 
                          className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center"
                        >
                          <span>View</span>
                          <Eye size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded ${
                    pagination.page === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 bg-gray-800/50 rounded text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    pagination.page === pagination.totalPages
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
  
  // Render Team Details Tab
  const renderTeamDetailsTab = () => {
    if (!currentTeam) return null;
    
    // Check if current user is owner
    const isOwner = currentTeam.owner._id === user._id;
    // Check if current user is a member
    const isMember = currentTeam.members.some(member => member.user._id === user._id);
    // Get current user's role
    const userRole = currentTeam.members.find(member => member.user._id === user._id)?.role || 'Member';
    
    return (
      <>
        {isEditing ? (
          renderTeamForm()
        ) : showMemberForm ? (
          renderAddMemberForm()
        ) : editingMember ? (
          renderEditMemberForm()
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Back button and team actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <Link to="/teamBuilder" className="mr-4">
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-center text-indigo-400 hover:text-indigo-300"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    <span>Back to Teams</span>
                  </motion.div>
                </Link>
              </div>
              
              {isOwner && (
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className={buttonSecondary}
                  >
                    <div className="flex items-center">
                      <Edit size={16} className="mr-2" />
                      Edit Team
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteTeam}
                    disabled={isLoadingDeleteTeam}
                    className={buttonDanger}
                  >
                    {isLoadingDeleteTeam ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="mr-2"
                        >
                          <Clock size={16} />
                        </motion.div>
                        Deleting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Trash2 size={16} className="mr-2" />
                        Delete Team
                      </div>
                    )}
                  </motion.button>
                </div>
              )}
              
              {!isOwner && isMember && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveTeam}
                  disabled={isLoadingLeaveTeam}
                  className={buttonDanger}
                >
                  {isLoadingLeaveTeam ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="mr-2"
                      >
                        <Clock size={16} />
                      </motion.div>
                      Leaving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Trash2 size={16} className="mr-2" />
                      Leave Team
                    </div>
                  )}
                </motion.button>
              )}
            </div>
            
            {/* Team Details Card */}
            <motion.div 
              variants={itemVariants}
              className={`${glassCard} rounded-lg p-6`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h2 className={`text-2xl ${headingClass} mr-3`}>{currentTeam.name}</h2>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      currentTeam.isPrivate 
                        ? 'bg-gray-700/70 text-gray-300' 
                        : 'bg-green-600/20 text-green-400'
                    }`}>
                      <div className="flex items-center space-x-1">
                        {currentTeam.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                        <span>{currentTeam.isPrivate ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
                      {currentTeam.category}
                    </span>
                    
                    {isMember && (
                      <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                        Your Role: {userRole}
                      </span>
                    )}
                  </div>
                  
                  {currentTeam.description && (
                    <div className="mb-4">
                      <h3 className={`text-sm uppercase ${subTextClass} mb-1`}>Description</h3>
                      <p className={`${textClass}`}>{currentTeam.description}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:gap-8">
                    <div className="mb-3 sm:mb-0">
                      <h3 className={`text-sm uppercase ${subTextClass} mb-1`}>Created</h3>
                      <p className={textClass}>{formatDate(currentTeam.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className={`text-sm uppercase ${subTextClass} mb-1`}>Last Updated</h3>
                      <p className={textClass}>{formatDate(currentTeam.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/3 bg-gray-800/50 rounded-lg p-4">
                  <h3 className={`text-lg ${textClass} mb-3`}>Team Owner</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-gray-600">
                      {currentTeam.owner?.profilePicture ? (
                        <img 
                          src={currentTeam.owner.profilePicture} 
                          alt={currentTeam.owner.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`${textClass}`}>{currentTeam.owner.name}</p>
                      <p className={`text-sm ${subTextClass}`}>@{currentTeam.owner.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Team Members */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl ${headingClass}`}>Team Members</h3>
                {isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMemberForm(true)}
                    className={buttonPrimary}
                  >
                    <div className="flex items-center">
                      <UserPlus size={16} className="mr-2" />
                      Add Member
                    </div>
                  </motion.button>
                )}
              </div>
              
              {currentTeam.members.length === 0 ? (
                <div className={`${glassCard} rounded-lg p-6 text-center`}>
                  <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                  <h4 className={textClass}>No members yet</h4>
                  <p className={subTextClass}>Add members to start collaborating</p>
                </div>
              ) : (
                <div className={`${glassCard} rounded-lg overflow-hidden`}>
                  <table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr className="bg-gray-800/70 text-left">
                        <th className="px-6 py-3 text-sm font-medium text-gray-300">Member</th>
                        <th className="px-6 py-3 text-sm font-medium text-gray-300">Role</th>
                        <th className="px-6 py-3 text-sm font-medium text-gray-300">Joined</th>
                        {isOwner && (
                          <th className="px-6 py-3 text-sm font-medium text-gray-300 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {currentTeam.members.map((member) => (
                        <tr key={member._id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                {member.user.profilePicture ? (
                                  <img 
                                    src={member.user.profilePicture} 
                                    alt={member.user.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <p className={textClass}>{member.user.name}</p>
                                <p className={`text-sm ${subTextClass}`}>@{member.user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-sm">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(member.joinedAt)}
                          </td>
                          {isOwner && member.user._id !== user._id && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setRoleInput(member.role || 'Member');
                                  }}
                                  className="p-1 text-indigo-400 hover:text-indigo-300"
                                  title="Edit Role"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.user._id)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                  title="Remove Member"
                                  disabled={isLoadingRemoveMember}
                                >
                                  {isLoadingRemoveMember ? (
                                    <Clock size={16} className="animate-spin" />
                                  ) : (
                                    <X size={16} />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}
                          {isOwner && member.user._id === user._id && (
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm text-gray-500">Team Owner</span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div className={`min-h-screen ${backgroundGradient} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {teamId ? renderTeamDetailsTab() : renderMyTeamsTab()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamPage;