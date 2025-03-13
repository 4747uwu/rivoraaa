import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, Calendar, LayoutGrid, List, MoreHorizontal, Plus, UserPlus, 
  Clock, AlertTriangle, Calendar as CalendarIcon, CheckCircle, 
  TrendingUp, Timer, Users, ChevronDown, ArrowRight
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import API from '../api/api';
import { useParams } from 'react-router-dom';
import InviteModal from './InviteModal';
import ProjectTasks from './Tasks/ProjectTask';
import { useAuth } from '../context/authContext';
import GenerateAITasks from './Tasks/aiGenerate';
// import AIInsightsCard from './Tasks/aiAnalysis';
import ProjectInsightCard from './Tasks/aiAnalysis';
import TeamDeploymentModal from './Team/FastDeploy';

// Helper function
const userHasPermission = (user, project, requiredRole = 'member') => {
  if (!user || !project) return false;
  const member = project.members?.find(m => m.userId?._id === user._id);
  if (!member) return false;
  
  if (requiredRole === 'admin') {
    return member?.role === 'admin';
  }
  return ['admin', 'member'].includes(member?.role);
};

// Enhanced loading skeleton with smoother animation
const ProjectSkeleton = () => (
  <div className="min-h-screen bg-white p-6">
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex justify-between">
          <div className="space-y-3 w-2/3">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-28"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        
        {/* Search and view toggle skeleton */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <div className="h-10 bg-gray-200 rounded-lg w-96"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Columns skeleton */}
    <div className="grid grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-6 bg-gray-200 rounded-full w-6"></div>
            </div>
            {[1, 2, 3].map((task) => (
              <div key={task} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Helper function for calculating days remaining
const getDaysRemaining = (deadline) => {
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper for priority badge styling
const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100',
        icon: <AlertTriangle size={14} className="text-red-500" />
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-100',
        icon: <Clock size={14} className="text-yellow-500" />
      };
    case 'low':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-100',
        icon: <CheckCircle size={14} className="text-green-500" />
      };
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100',
        icon: <Clock size={14} className="text-blue-500" />
      };
  }
};

// Helper for status styling
const getStatusStyles = (status) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: <CheckCircle size={14} className="mr-1 text-green-500" />
      };
    case 'in_progress':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <TrendingUp size={14} className="mr-1 text-blue-500" />
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: <Clock size={14} className="mr-1 text-gray-500" />
      };
  }
};

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const { fetchProjectById, loading, error } = useProjects();
  const [project, setProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [view, setView] = useState('board');
  const [inviting, setInviting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const {user} = useAuth();
  const [teamDeployModalOpen, setTeamDeployModalOpen] = useState(false);

  
  useEffect(() => {
    if(user) setCurrentUser(user);
  }, [user]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const getProject = async () => {
      if (!projectId) return;
      
      try {
        const data = await fetchProjectById(projectId);
        if (isMounted) {
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    getProject();

    return () => { isMounted = false; };
  }, [projectId, fetchProjectById]);


    useEffect(() => {
    if (!projectId || initialLoading) return;
    
    console.log('Starting project progress polling');
    
    // Set up polling for updates
    const pollInterval = setInterval(async () => {
      try {
        const data = await fetchProjectById(projectId);
        
        // Only update if project data has changed
        if (data && project) {
          // Check for progress changes specifically
          if (data.progress !== project.progress) {
            console.log(`Project progress updated: ${project.progress}% → ${data.progress}%`);
          }
          
          // Check for other relevant changes
          const hasRelevantChanges = 
            data.progress !== project.progress ||
            data.currentStatus !== project.currentStatus ||
            data.members.length !== project.members.length;
            
          if (hasRelevantChanges) {
            setProject(data);
          }
        }
      } catch (error) {
        console.error('Error polling project data:', error);
      }
    }, 3000); // Poll every 5 seconds
    
    return () => {
      clearInterval(pollInterval);
      console.log('Polling stopped');
    };
  }, [projectId, project, fetchProjectById, initialLoading]);

  // Search users using API
  const handleSearch = async (query) => {
    try {
      setSearching(true);
      const response = await API.get(`/invites/search?query=${query}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleTasksGenerated = async (newTasks) => {
    // Refresh the tasks list
    try {
      const response = await API.get(`/api/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Invite user using API
  const handleInvite = async (userId) => {
    try {
      setInviting(true);
      await API.post('/invites/send-invitation', {
        id: projectId,
        userId,
        role: selectedRole
      });
      setShowInviteModal(false);
    } catch (error) {
      console.error('Invitation error:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleInviteSuccess = () => {
    // Refresh project data to show new member
    fetchProjectById(projectId);
  };

  const handleAssignTaskToMember = async (task, memberId) => {
    try {
      await API.patch(`/tasks/${task._id}/assign`, { assignedTo: memberId });
      // Refresh project tasks after assignment
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  // Update the loading check
  if (initialLoading || loading) {
    return <ProjectSkeleton />;
  }

  // Early return for error or no project
  if (error || !project)  {
    return (
      <div className="min-h-screen bg-white backdrop-blur-sm p-6 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 inline-flex mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested project could not be loaded.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const daysRemaining = getDaysRemaining(project.deadline);
  const priorityStyles = getPriorityStyles(project.priority);
  const statusStyles = getStatusStyles(project.currentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {/* Project Banner */}
        {/* <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600"></div> */}
        
        <div className="p-6">
          {/* Project Title & Status */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                
                <div className={`${statusStyles.bg} ${statusStyles.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`}>
                  {statusStyles.icon}
                  <span>{project.currentStatus?.replace('_', ' ')}</span>
                </div>
                
                <div className={`${priorityStyles.bg} ${priorityStyles.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`}>
                  {priorityStyles.icon}
                  <span className="ml-1 capitalize">{project.priority} Priority</span>
                </div>
              </div>
              
              <p className="text-gray-600 max-w-2xl">{project.description}</p>
            </div>
            
            {/* Project Actions with Team Members */}
            <div className="flex items-center gap-3">
              {/* Team Members Preview */}
              <div className="relative group">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((member) => (
                    <div
                      key={member.userId?._id || member.userId}
                      className="w-9 h-9 rounded-full ring-2 ring-white bg-gray-50 
                            shadow-sm hover:z-10 transition-transform hover:scale-110
                            overflow-hidden relative group"
                      title={`${member.userId?.username || 'Unknown'} (${member.role})`}
                    >
                      {member.userId?.profilePicture ? (
                        <img
                          src={member.userId.profilePicture}
                          alt={member.userId.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${
                              member.userId.username?.charAt(0) || 'U'
                            }&background=0D8ABC&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {member.userId?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {project.members?.length > 3 && (
                    <div
                      className="w-9 h-9 rounded-full ring-2 ring-white bg-gray-100 
                            flex items-center justify-center text-xs font-medium text-gray-600"
                    >
                      +{project.members?.length - 3}
                    </div>
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg 
                          border border-gray-200 p-2 w-64 opacity-0 group-hover:opacity-100 
                          transition-opacity invisible group-hover:visible z-50">
                  <div className="space-y-2">
                    {project.members?.map((member) => (
                      <div key={member.userId?._id} className="flex items-center gap-2 p-1">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          {member.userId?.profilePicture ? (
                            <img
                              src={member.userId.profilePicture}
                              alt={member.userId.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {member.userId?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.userId?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invite Button */}
              {userHasPermission(currentUser, project, 'admin') && (
                <>
                <button
                  onClick={() => setTeamDeployModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                            hover:bg-indigo-700 transition-colors flex items-center gap-2
                            shadow-sm mr-2"
                >
                  <Users size={16} />
                  <span className="font-medium">Deploy Team</span>
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg 
                          hover:bg-gray-800 transition-colors flex items-center gap-2
                          shadow-sm"
                >
                  <UserPlus size={16} />
                  <span className="font-medium">Invite</span>
                </button>
                </>
              )}
                
            </div>
          </div>
          
          {/* Project Stats & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Progress Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
                <TrendingUp size={16} className="text-blue-500" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{project.progress}% Complete</span>
                  <span className="text-gray-500">100%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500 rounded-full"
                    initial={false}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 60, 
                      damping: 15 
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {project.progress < 100 
                  ? `${100 - project.progress}% remaining to complete` 
                  : "Project is complete!"}
              </p>
            </div>
            
            {/* Deadline Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                <CalendarIcon size={16} className="text-blue-500" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(project.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className={`text-sm ${daysRemaining < 0 ? 'text-red-500' : 
                                          daysRemaining < 3 ? 'text-orange-500' : 
                                          'text-gray-500'}`}>
                    {daysRemaining < 0 
                      ? `Overdue by ${Math.abs(daysRemaining)} days` 
                      : daysRemaining === 0 
                        ? 'Due today' 
                        : `${daysRemaining} days remaining`}
                  </p>
                </div>
                {daysRemaining < 3 && daysRemaining >= 0 && (
                  <span className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock size={14} className="text-orange-500" />
                  </span>
                )}
                {daysRemaining < 0 && (
                  <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-red-500" />
                  </span>
                )}
              </div>
            </div>

            {/* AI Insights Card */}
            {/* <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">AI Insights</h3>
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold">AI</span>
                </div>
              </div>
              <div>
                <p className="text-gray-300 text-sm mb-3">
                  Based on current progress, this project {daysRemaining < 0 ? 'is overdue' : 
                    project.progress < 30 && daysRemaining < 7 ? 'is at risk of delay' : 
                    project.progress > 70 ? 'is on track for completion' : 
                    'needs attention to meet deadline'}.
                </p>
                {userHasPermission(currentUser, project, 'admin') && (
                  <button
                    onClick={() => {
                      // Toggle AI task generation modal here
                      setShowAIModal ? setShowAIModal(true) : null;
                    }}
                    className="w-full mt-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 
                            text-white rounded-lg flex items-center justify-center 
                            gap-2 transition-colors text-sm font-medium"
                  >
                    <TrendingUp size={14} />
                    <span>Generate Task Recommendations</span>
                  </button>
                )}
              </div>
            </div> */}

            {/* <AIInsightsCard
              project={project}
              setProject={setProject}
              userHasPermission={userHasPermission}
              currentUser={currentUser}
            /> */}
             <ProjectInsightCard 
            project={project} 
            setProject={setProject}
            userHasPermission={userHasPermission}
            currentUser={currentUser}
          />

      



          </div>
        </div>
      </div>

      {/* Team Members in Header */}
      

      

      {/* Task Columns */}
      <ProjectTasks 
        projectId={projectId}
        canAssignTasks={userHasPermission(currentUser, project, 'admin')}
        canBeAssigned={userHasPermission(currentUser, project, 'member')}
        currentUser={currentUser}
        projectMembers={project.members}
      />

      

      {showInviteModal && userHasPermission(currentUser, project, 'admin') && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          projectId={projectId}
          onInvite={handleInviteSuccess}
        />
      )}

      {showAssignModal && (
        <AssignTaskModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          task={selectedTask}
          members={project.members}
          onAssign={handleAssignTaskToMember}
        />
      )}

      <TeamDeploymentModal
        isOpen={teamDeployModalOpen}
        onClose={() => setTeamDeployModalOpen(false)}
        projectId={projectId}
        user={currentUser}
      />

      
    
    </div>
  );
};

export default ProjectDashboard;