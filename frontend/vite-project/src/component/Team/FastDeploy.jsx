import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Send, AlertCircle, CheckCircle, XCircle, Loader, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/api';
import { useTeam } from '../../context/teamContext'; // Import the team context

const TeamDeploymentModal = ({ isOpen, onClose, projectId = null, user }) => {
  const { getMyTeams } = useTeam(); // Get the getMyTeams function from context
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null); // null, 'success', 'error'
  const [loadingTeams, setLoadingTeams] = useState(true);
    console.log("data", projectId, user)
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTeam(null);
      setRole('member');
      setMessage('');
      setDeployStatus(null);
    }
  }, [isOpen]);
  
  // Fetch user's teams using the context function
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        // Use the getMyTeams function from context
        const result = await getMyTeams();
        
        // Use owned teams from the result
        setTeams(result.ownedTeams.data || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load your teams");
      } finally {
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [isOpen, getMyTeams, user?._id]);
  
  // Handle team deployment
  const handleDeployTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }
    
    if (!projectId) {
      toast.error("Project not specified");
      return;
    }
    
    try {
      setIsLoading(true);
      setDeployStatus(null);
      
      const response = await API.post(
        `/api/${selectedTeam._id}/deploy/${projectId}`,
        { role, message }
      );
      
      setDeployStatus('success');
      toast.success(response.data.message);
      
      // Auto-close after success (optional)
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Failed to deploy team:", error);
      setDeployStatus('error');
      toast.error(error.response?.data?.message || "Failed to deploy team to project");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate number of deployable members if team is selected
  const deployableMembers = selectedTeam ? 
    selectedTeam.members.filter(m => m.user._id !== user._id).length : 0;
  
  // Modal backdrop click handler that prevents propagation
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
        >
          <motion.div 
            className="bg-[#0F172A] rounded-xl border border-indigo-500/20 shadow-lg w-full max-w-lg m-4 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Send className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200">Deploy Team to Project</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              <div className="mb-5">
                <p className="text-gray-300 text-sm">
                  Select one of your teams to quickly onboard all team members to this project. 
                  This will send invitation emails to team members.
                </p>
              </div>
              
              {loadingTeams ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              ) : teams.length === 0 ? (
                <div className="bg-gray-800/40 rounded-lg p-5 text-center">
                  <Users className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                  <h4 className="text-gray-300 mb-1">No teams available</h4>
                  <p className="text-gray-500 text-sm">
                    You must create a team first to use the fast deployment feature.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 px-4 py-2 bg-indigo-500/30 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/40 transition-colors"
                    onClick={() => {
                      onClose();
                      window.location.href = '/teamBuilder/new';
                    }}
                  >
                    Create Team
                  </motion.button>
                </div>
              ) : (
                <form onSubmit={handleDeployTeam} className="space-y-4">
                  {/* Team Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Select Team
                    </label>
                    <select
                      value={selectedTeam?._id || ""}
                      onChange={(e) => {
                        const team = teams.find(t => t._id === e.target.value);
                        setSelectedTeam(team || null);
                      }}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">-- Select a team --</option>
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>
                          {team.name} ({team.members.length + 1} members)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Assign Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="member">Member (Standard Access)</option>
                      <option value="admin">Admin (Full Access)</option>
                      <option value="viewer">Viewer (Read-only)</option>
                    </select>
                  </div>
                  
                  {/* Optional Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message to your team members..."
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
                    />
                  </div>
                  
                  {/* Team Member Summary */}
                  {selectedTeam && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-medium text-gray-300">Team Members</span>
                        </div>
                        <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">
                          {deployableMembers} members to invite
                        </span>
                      </div>
                      
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedTeam.members.map((member, index) => (
                          <li 
                            key={index} 
                            className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                              member.user._id === user._id 
                                ? 'bg-gray-700/30 text-gray-500' 
                                : 'bg-gray-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                                {member.user.profilePicture ? (
                                  <img 
                                    src={member.user.profilePicture} 
                                    alt={member.user.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  member.user.name.charAt(0)
                                )}
                              </div>
                              <span className="text-gray-300">{member.user.name}</span>
                            </div>
                            
                            {member.user._id === user._id ? (
                              <span className="text-xs text-gray-500">You (not invited)</span>
                            ) : (
                              <span className="text-xs text-indigo-300">Will be invited as {role}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Status Message */}
                  {deployStatus === 'success' && (
                    <div className="bg-green-900/20 border border-green-700/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Team successfully deployed! Invitations have been sent.</span>
                    </div>
                  )}
                  
                  {deployStatus === 'error' && (
                    <div className="bg-red-900/20 border border-red-700/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Failed to deploy team. Please try again.</span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isLoading || !selectedTeam}
                      whileHover={!isLoading && selectedTeam ? { scale: 1.02 } : {}}
                      whileTap={!isLoading && selectedTeam ? { scale: 0.98 } : {}}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-white ${
                        !selectedTeam 
                          ? 'bg-gray-700/50 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Deploying...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Deploy Team</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TeamDeploymentModal;