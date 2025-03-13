import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import TeamsList from './TeamList';
import TeamDetails from './TeamDetails';
import { useTeam } from '../../context/teamContext';
import { useAuth } from '../../context/authContext';
import { X, Clock, Check, Search, User } from 'lucide-react';
import { toast } from 'react-toastify';

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
  const { teamId } = useParams();
  const { user } = useAuth();
  const {
    getMyTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    leaveTeam,
    getAvailableConnections,
    isLoadingCreateTeam,
    isLoadingUpdateTeam,
    isLoadingDeleteTeam,
    isLoadingAddMember,
    isLoadingUpdateMember,
    isLoadingRemoveMember,
    isLoadingLeaveTeam
  } = useTeam();

  // Teams list state
  const [ownedTeams, setOwnedTeams] = useState([]);
  const [memberTeams, setMemberTeams] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalPages: 1
  });

  // Team details state
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [roleInput, setRoleInput] = useState('');
  const [availableConnections, setAvailableConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFormData, setTeamFormData] = useState({
  name: '',
  category: '',
  description: '',
  isPrivate: false
});
  const [selectedConnection, setSelectedConnection] = useState(null);
  console.log(availableConnections)

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation variants
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

  // Load teams list
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { ownedTeams: owned, memberTeams: member } = await getMyTeams(
          pagination.page,
          pagination.limit
        );
        setOwnedTeams(owned.data);
        setMemberTeams(member.data);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.max(owned.pagination.totalPages, member.pagination.totalPages)
        }));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!teamId) {
      fetchTeams();
    }
  }, [pagination.page, pagination.limit, teamId]);

  // Update the team details effect
useEffect(() => {
  const fetchTeamDetails = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      const response = await getTeam(teamId);
      setCurrentTeam(response.team);
      
      // Add debugging
      console.log('Team response:', response);
      
      // Load available connections if owner
      if (response.team.owner._id === user._id) {
        const connectionsResponse = await getAvailableConnections(teamId);
        console.log('Connections response:', connectionsResponse);
        
        // Make sure we're setting the correct data structure
        setAvailableConnections(connectionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      setError(error.message);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  fetchTeamDetails();
}, [teamId, user._id]);

console.log(availableConnections)

  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setTeamFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// Add useEffect to populate form when editing
useEffect(() => {
  if (currentTeam && isEditing) {
    setTeamFormData({
      name: currentTeam.name,
      category: currentTeam.category,
      description: currentTeam.description || '',
      isPrivate: currentTeam.isPrivate
    });
  } else if (!isEditing) {
    // Reset form when creating new team
    setTeamFormData({
      name: '',
      category: '',
      description: '',
      isPrivate: false
    });
  }
}, [currentTeam, isEditing]);

const fetchTeams = async () => {
  try {
    setLoading(true);
    const { ownedTeams: owned, memberTeams: member } = await getMyTeams(
      pagination.page,
      pagination.limit
    );
    setOwnedTeams(owned.data);
    setMemberTeams(member.data);
    setPagination(prev => ({
      ...prev,
      totalPages: Math.max(owned.pagination.totalPages, member.pagination.totalPages)
    }));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Add the fetchAvailableConnections function
const fetchAvailableConnections = async () => {
  if (!teamId) return;
  
  try {
    const { connections } = await getAvailableConnections(teamId, searchQuery);
    setAvailableConnections(connections || []);
  } catch (error) {
    console.error('Error fetching connections:', error);
    toast.error('Failed to load available connections');
  }
};

// Update the team details effect to use the new function
useEffect(() => {
  const fetchTeamDetails = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      const response = await getTeam(teamId);
      setCurrentTeam(response.team);
      
      // Load available connections if owner
      if (response.team.owner._id === user._id) {
        await fetchAvailableConnections();
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      setError(error.message);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  fetchTeamDetails();
}, [teamId, user?._id]);

// Add effect to handle search query changes
useEffect(() => {
  if (teamId && currentTeam?.owner._id === user._id && showMemberForm) {
    const debounceTimer = setTimeout(() => {
      fetchAvailableConnections();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }
}, [searchQuery, showMemberForm]);

  // Handle team actions
  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await deleteTeam(teamId);
      navigate('/teamBuilder');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      await leaveTeam(teamId);
      navigate('/teamBuilder');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeTeamMember(teamId, memberId);
      
      // Update local state
      setCurrentTeam(prev => ({
        ...prev,
        members: prev.members.filter(m => m.user._id !== memberId)
      }));

      toast.success('Team member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

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

  // Update handleAddMember function
const handleAddMember = async () => {
  if (!selectedConnection || !roleInput.trim()) {
    toast.error("Please select a connection and assign a role");
    return;
  }

  try {
    // First call the API
    await addTeamMember(teamId, {
      memberId: selectedConnection._id,
      role: roleInput.trim()
    });

    // Then update local state
    setCurrentTeam(prev => ({
      ...prev,
      members: [...prev.members, {
        user: selectedConnection,
        role: roleInput.trim(),
        joinedAt: new Date(),
        _id: Date.now() // Temporary ID until refresh
      }]
    }));

    // Reset form state
    setSelectedConnection(null);
    setRoleInput('Member');
    setShowMemberForm(false);

    // Refresh available connections
    await fetchAvailableConnections();
    
    toast.success(`${selectedConnection.name} has been added to the team`);
  } catch (error) {
    console.error('Error adding member:', error);
    toast.error(error.response?.data?.message || 'Failed to add member');
  }
};

  // Add this handler function for updating members
  const handleUpdateMember = async () => {
    if (!editingMember || !roleInput.trim()) {
      toast.error('Please assign a valid role');
      return;
    }
  
    try {
      await updateTeamMember(teamId, editingMember.user._id, {
        role: roleInput.trim()
      });
  
      // Update local state
      setCurrentTeam(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.user._id === editingMember.user._id
            ? { ...member, role: roleInput.trim() }
            : member
        )
      }));
  
      // Reset form
      setEditingMember(null);
      setRoleInput('Member');
      
      toast.success('Member role updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error(error.response?.data?.message || 'Failed to update member role');
    }
  };

  // Format date utility
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      
      {!availableConnections ? (
        <div className="text-center py-4 bg-gray-800/50 rounded-lg">
          <p className={subTextClass}>Loading connections...</p>
        </div>
      ) : availableConnections.length === 0 ? (
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
  

  return (
    <div className={`min-h-screen ${backgroundGradient} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {teamId ? (
            <TeamDetails
              currentTeam={currentTeam}
              user={user}
              isOwner={currentTeam?.owner._id === user._id}
              isMember={currentTeam?.members.some(m => m.user._id === user._id)}
              userRole={currentTeam?.members.find(m => m.user._id === user._id)?.role}
              isEditing={isEditing}
              showMemberForm={showMemberForm}
              editingMember={editingMember}
              renderTeamForm={renderTeamForm}
              renderAddMemberForm={renderAddMemberForm}
              renderEditMemberForm={renderEditMemberForm}
              setIsEditing={setIsEditing}
              setShowMemberForm={setShowMemberForm}
              handleDeleteTeam={handleDeleteTeam}
              handleLeaveTeam={handleLeaveTeam}
              handleRemoveMember={handleRemoveMember}
              setEditingMember={setEditingMember}
              setRoleInput={setRoleInput}
              isLoadingDeleteTeam={isLoadingDeleteTeam}
              isLoadingLeaveTeam={isLoadingLeaveTeam}
              isLoadingRemoveMember={isLoadingRemoveMember}
              formatDate={formatDate}
              // Pass all your style constants
              glassCard={glassCard}
              textClass={textClass}
              headingClass={headingClass}
              subTextClass={subTextClass}
              buttonPrimary={buttonPrimary}
              buttonSecondary={buttonSecondary}
              buttonDanger={buttonDanger}
              // Pass animation variants
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          ) : (
            <TeamsList
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              ownedTeams={ownedTeams}
              memberTeams={memberTeams}
              pagination={pagination}
              setPagination={setPagination}
              renderTeamForm={renderTeamForm}
              user={user}
              // Pass all your style constants
              backgroundGradient={backgroundGradient}
              glassCard={glassCard}
              textClass={textClass}
              headingClass={headingClass}
              subTextClass={subTextClass}
              buttonPrimary={buttonPrimary}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamPage;