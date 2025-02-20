import React, { useState, useEffect } from 'react';
import { SearchIcon, Calendar, LayoutGrid, List, MoreHorizontal, Plus, UserPlus } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import API from '../api/api';
import { useParams } from 'react-router-dom';
import InviteModal from './InviteModal';
import ProjectTasks from './Tasks/ProjectTask';
import { useAuth } from '../context/authContext';

// Add this helper function at the top of the file
const userHasPermission = (user, project, requiredRole = 'member') => {
  if (!user || !project) return false;
  const member = project.members.find(m => m.userId?._id === user._id);
  if (!member) return false;
  
  if (requiredRole === 'admin') {
    return member.role === 'admin';
  }
  return ['admin', 'member'].includes(member.role);
};

// First, add a loading skeleton component
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
  console.log(user);

//  setCurrentUser(user);
//  console.log(currentUser);

useEffect(() => {
  if(user) setCurrentUser(user);
  console.log(currentUser);
}, [user]);


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

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [projectId, fetchProjectById]); // Only re-run when projectId or fetchProjectById changes

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

  // Invite user using API
  const handleInvite = async (userId) => {
    try {
      setInviting(true);
      await API.post('/invites/send-invitation', {
        id,
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

  // Task columns configuration
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'in_review', label: 'In Review' },
    { id: 'completed', label: 'Done' }
  ];

  // Update the loading check
  if (initialLoading || loading) {
    return <ProjectSkeleton />;
  }

  // Early return for error or no project
  if (error || !project)  {
    return (
      <div className="min-h-screen bg-white backdrop-blur-sm p-6 text-black">
        {error || 'Project not found'}
      </div>
    );
  }

  // Replace the main container's className and update color schemes
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header Section */}
      <div className="mb-2 bg-white-50 rounded-xl shadow-sm border border-gray-300 p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.currentStatus === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                project.currentStatus === 'completed' ? 'bg-green-50 text-green-600' :
                'bg-gray-50 text-gray-600'
              }`}>
                {project.currentStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Priority:</span>
                <span className={`px-2 py-1 rounded-full ${
                  project.priority === 'high' ? 'bg-red-50 text-red-600' :
                  project.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-green-50 text-green-600'
                }`}>{project.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Progress:</span>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span>{project.progress}%</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Deadline:</span>
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Team Members & Invite */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="flex -space-x-2">
                {/* Show first 5 members by default, or all if showAllMembers is true */}
                {(showAllMembers ? project.members : project.members.slice(0, 5)).map((member) => (
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
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {member.role?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Show count of remaining members if not showing all */}
                {!showAllMembers && project.members.length > 5 && (
                  <button
                    onClick={() => setShowAllMembers(true)}
                    className="w-9 h-9 rounded-full ring-2 ring-white bg-gray-100 
                             shadow-sm hover:bg-gray-200 transition-colors
                             flex items-center justify-center text-sm font-medium text-gray-600"
                  >
                    +{project.members.length - 5}
                  </button>
                )}
              </div>

              {/* Members tooltip on hover */}
              <div className="absolute top-full -left-44 mt-2 bg-white rounded-lg shadow-lg 
                             border border-gray-200 p-2 w-64 opacity-0 group-hover:opacity-100 
                             transition-opacity invisible group-hover:visible z-50">
                <div className="space-y-2">
                  {project.members.map((member) => (
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

            {userHasPermission(currentUser, project, 'admin') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-black text-white rounded-lg 
                         hover:bg-white hover:text-black transition-colors flex items-center gap-2
                         border border-blue-100"
              >
                <UserPlus size={16} />
                <span className="font-medium">Invite</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and View Toggle */}
       
      </div>

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
    </div>
  );
};

export default ProjectDashboard;