import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, Send, AlertCircle, CheckCircle, XCircle, Loader, X,
  ArrowLeft, ArrowRight, CheckSquare, Settings, MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/api';
import { useTeam } from '../../context/teamContext';

// Step indicators component
const StepIndicator = memo(({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-6 mt-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div 
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === currentStep 
              ? 'w-8 bg-indigo-500' 
              : i < currentStep 
                ? 'w-6 bg-indigo-700' 
                : 'w-6 bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
});

// Animation variants (defined outside component)
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

const pageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Role option component extracted outside the main component
const RoleOption = memo(({ value, selectedRole, onChange, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onChange(value)}
    className={`p-3 rounded-lg border cursor-pointer transition-all ${
      selectedRole === value
        ? 'bg-indigo-900/30 border-indigo-500/50'
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
    }`}
  >
    <div className="flex items-center">
      <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 ${
        selectedRole === value 
          ? 'bg-indigo-500 border-indigo-500'
          : 'bg-transparent border-gray-600'
      }`}>
        {selectedRole === value && (
          <div className="w-2 h-2 bg-white rounded-full m-auto" />
        )}
      </div>
      
      <div>
        <div className="text-gray-200 font-medium">{title}</div>
        <div className="text-gray-400 text-xs">{description}</div>
      </div>
    </div>
  </motion.div>
));

// Team Card component extracted to prevent re-renders
const TeamCard = memo(({ team, selectedTeamId, onSelect }) => (
  <motion.div
    key={team._id}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(team)}
    className={`p-4 rounded-lg border transition-all cursor-pointer ${
      selectedTeamId === team._id
        ? 'bg-indigo-900/30 border-indigo-500/50'
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
    }`}
    // Important: prevent animation restart when parent re-renders
    layoutId={`team-${team._id}`}
  >
    <div className="flex items-start">
      {/* Team Icon */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
          {team.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      {/* Team Details */}
      <div className="flex-grow">
        <h5 className="text-gray-200 font-medium">{team.name}</h5>
        <div className="flex items-center text-sm text-gray-400 mt-1">
          <Users size={14} className="mr-1" />
          <span>{team.members.length + 1} members</span>
          
          {team.category && (
            <>
              <span className="mx-2">•</span>
              <span className="text-indigo-400">{team.category}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Selection Indicator */}
      <div className="flex-shrink-0 w-5 h-5">
        {selectedTeamId === team._id && (
          <CheckSquare className="text-indigo-500" size={20} />
        )}
      </div>
    </div>
  </motion.div>
));

// Main TeamDeploymentModal component
const TeamDeploymentModal = ({ isOpen, onClose, projectId = null, user }) => {
  const { getMyTeams } = useTeam();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTeam(null);
      setRole('member');
      setMessage('');
      setDeployStatus(null);
      setCurrentStep(0);
    }
  }, [isOpen]);
  
  // Fetch user's teams
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const result = await getMyTeams();
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
  
  // Handlers with useCallback to prevent recreation
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);
  
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  // Handle team deployment
  const handleDeployTeam = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedTeam || !projectId) {
      toast.error(selectedTeam ? "Project not specified" : "Please select a team");
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
  }, [selectedTeam, projectId, role, message, onClose]);
  
  // Team selection handler - memoized to prevent recreation
  const handleSelectTeam = useCallback((team) => {
    setSelectedTeam(team);
  }, []);

  // Modal backdrop click handler that prevents propagation
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  // Calculate number of deployable members if team is selected
  const deployableMembers = useMemo(() => selectedTeam ? 
    selectedTeam.members.filter(m => m.user._id !== user._id).length : 0
  , [selectedTeam, user?._id]);

  // Memoized steps to prevent unnecessary rerenders
  // Step 1: Team Selection Component - memoized to maintain state and prevent refreshing
  const TeamSelectionStep = useMemo(() => (
    <motion.div
      key="team-selection"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-2">
        <div className="flex items-center mb-2">
          <Briefcase className="w-5 h-5 text-indigo-400 mr-2" />
          <h4 className="text-lg font-medium text-gray-200">Select a Team</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Choose which team you want to deploy to this project
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
        <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-1">
          {teams.map(team => (
            <TeamCard
              key={team._id}
              team={team}
              selectedTeamId={selectedTeam?._id}
              onSelect={handleSelectTeam}
            />
          ))}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <motion.button
          onClick={goToNextStep}
          disabled={!selectedTeam}
          whileHover={selectedTeam ? { scale: 1.02 } : {}}
          whileTap={selectedTeam ? { scale: 0.98 } : {}}
          className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
            !selectedTeam 
              ? 'bg-gray-700/50 cursor-not-allowed text-gray-500' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          }`}
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  ), [teams, loadingTeams, selectedTeam, onClose, goToNextStep, handleSelectTeam]);
  
  // Step 2: Role Configuration Component - memoized
  const RoleConfigurationStep = useMemo(() => (
    <motion.div
      key="role-config"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-2">
        <div className="flex items-center mb-2">
          <Settings className="w-5 h-5 text-indigo-400 mr-2" />
          <h4 className="text-lg font-medium text-gray-200">Configure Settings</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Set permissions and options for the team deployment
        </p>
      </div>
      
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Assign Role to Team Members
        </label>
        <div className="space-y-2">
          <RoleOption 
            value="member" 
            selectedRole={role} 
            onChange={setRole}
            title="Member"
            description="Can view and edit project content"
          />
          
          <RoleOption 
            value="admin" 
            selectedRole={role} 
            onChange={setRole}
            title="Admin"
            description="Full access to manage the project and other members"
          />
          
          <RoleOption 
            value="viewer" 
            selectedRole={role} 
            onChange={setRole}
            title="Viewer"
            description="Read-only access to project content"
          />
        </div>
      </div>
      
      {/* Optional Message */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} className="text-indigo-400" />
            <span>Invitation Message</span>
            <span className="text-gray-500 font-normal">(Optional)</span>
          </div>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal message to your team members..."
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          This message will be included in the invitation emails sent to the team members.
        </p>
      </div>
      
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={goToPreviousStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </motion.button>
        <motion.button
          onClick={goToNextStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  ), [role, message, goToNextStep, goToPreviousStep]);
  
  // Step 3: Review & Deploy Component - memoized
  const ReviewDeployStep = useMemo(() => (
    <motion.div
      key="review-deploy"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-2">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-indigo-400 mr-2" />
          <h4 className="text-lg font-medium text-gray-200">Review & Deploy</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Review the deployment details and confirm
        </p>
      </div>
      
      {/* Summary Card */}
      <div className="space-y-4">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Briefcase className="w-5 h-5 text-indigo-400 mr-2" />
            <h5 className="text-gray-300 font-medium">Team Details</h5>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Team Name:</span>
              <span className="text-gray-200 font-medium">{selectedTeam?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Team Members:</span>
              <span className="text-gray-200 font-medium">{selectedTeam?.members.length + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Members to Invite:</span>
              <span className="text-indigo-300 font-medium">{deployableMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Assigned Role:</span>
              <span className="capitalize text-indigo-300 font-medium">{role}</span>
            </div>
          </div>
        </div>
        
        {/* Member List */}
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-indigo-400 mr-2" />
              <h5 className="text-gray-300 font-medium">Members to Deploy</h5>
            </div>
            <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">
              {deployableMembers} members
            </span>
          </div>
          
          {selectedTeam && (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {selectedTeam.members.map((member, index) => (
                <li 
                  key={index} 
                  className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                    member.user._id === user?._id 
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
                  
                  {member.user._id === user?._id ? (
                    <span className="text-xs text-gray-500">You (not invited)</span>
                  ) : (
                    <span className="text-xs text-indigo-300">Will be invited as {role}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Message Preview */}
        {message && (
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <MessageSquare className="w-5 h-5 text-indigo-400 mr-2" />
              <h5 className="text-gray-300 font-medium">Message Preview</h5>
            </div>
            <p className="text-gray-400 text-sm italic bg-gray-900/40 p-3 rounded border border-gray-700/30">
              "{message}"
            </p>
          </div>
        )}
      </div>
      
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
      
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={goToPreviousStep}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </motion.button>
        <motion.button
          onClick={handleDeployTeam}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
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
    </motion.div>
  ), [selectedTeam, role, message, deployableMembers, deployStatus, isLoading, goToPreviousStep, handleDeployTeam, user?._id]);

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
            
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            
            {/* Content */}
            <div className="p-5">
              {/* Use layoutId for stable animations */}
              <AnimatePresence mode="wait">
                {currentStep === 0 && TeamSelectionStep}
                {currentStep === 1 && RoleConfigurationStep}
                {currentStep === 2 && ReviewDeployStep}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(TeamDeploymentModal);