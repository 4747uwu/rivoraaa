import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserCog, UserX, Shield, Award, 
  AlertCircle, Check, X, MoreHorizontal, ArrowUpDown, Search,
  LogOut, UserMinus
} from 'lucide-react';
import API from '../../api/api';
import RoleChangeConfirmation from './RoleChangeConfirmation';
import RemoveMemberConfirmation from './RemoveConfirmation';
import MemberTaskList from './MemberTaskList';

const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

const TeamManagement = ({ projectMembers = [], tasks = [], currentUser = {}, projectId, onUpdateSuccess }) => {
  // Existing state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  
  // New state for remove member confirmation
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Current user's role in this project
  const currentUserRole = useMemo(() => {
    const member = projectMembers.find(m => 
      m.userId?._id === currentUser?._id || m._id === currentUser?._id
    );
    return member?.role || ROLES.MEMBER;
  }, [projectMembers, currentUser]);

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    return currentUserRole === ROLES.ADMIN;
  }, [currentUserRole]);
  
  // Get current user's member record from this project
  const currentUserMember = useMemo(() => {
    return projectMembers.find(m => 
      m.userId?._id === currentUser?._id || m._id === currentUser?._id
    );
  }, [projectMembers, currentUser]);

  // Enhanced member data with task statistics
  const membersWithStats = useMemo(() => {
    return projectMembers.map(member => {
      const userId = member.userId?._id || member._id;
      const username = member.userId?.username || member.username || 'Unknown User';
      
      // Count tasks assigned to this user
      const memberTasks = tasks.filter(task => 
        task.assignedTo?.includes(userId) || task.assignedTo?.some(u => u._id === userId)
      );
      
      const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = memberTasks.filter(task => task.status === 'in_progress').length;
      const todoTasks = memberTasks.filter(task => task.status === 'todo').length;
      const reviewTasks = memberTasks.filter(task => task.status === 'in_review').length;
      const totalTasks = memberTasks.length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;
        
      return {
        _id: userId,
        username,
        email: member.userId?.email || member.email || '',
        role: member.role || ROLES.MEMBER,
        avatar: member.userId?.avatar || member.avatar,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        completionRate,
        joinedAt: member.createdAt || new Date()
      };
    });
  }, [projectMembers, tasks]);

  // Search and sort logic
  const filteredMembers = useMemo(() => {
    let result = [...membersWithStats];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(member => 
        member.username.toLowerCase().includes(search) || 
        member.email.toLowerCase().includes(search)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'username') {
        comparison = a.username.localeCompare(b.username);
      } else if (sortBy === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (sortBy === 'tasks') {
        comparison = a.totalTasks - b.totalTasks;
      } else if (sortBy === 'completion') {
        comparison = a.completionRate - b.completionRate;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [membersWithStats, searchTerm, sortBy, sortOrder]);

  // Role change mutation (existing)
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, projectId, newRole }) => {
      const response = await API.patch(`/api/projects/${projectId}/members/${userId}/role`, {
        role: newRole
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects query to update UI
      queryClient.invalidateQueries(['project', projectId]);
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    }
  });

  // New mutation: Remove member from project
  const removeMemberMutation = useMutation({
    mutationFn: async ({ userId, projectId }) => {
      const response = await API.delete(`/api/projects/${projectId}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    }
  });

  // New mutation: Leave project (self removal)
  const leaveProjectMutation = useMutation({
    mutationFn: async ({ projectId }) => {
      // Use the current user's ID for self-removal
      const response = await API.delete(`/api/projects/${projectId}/members/leave`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries(['projects']);
      
      // Redirect to projects page after leaving
      if (window) {
        window.location.href = '/dashboard'; 
      }
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    }
  });

  // Existing function: Handle role change request
  const handleRoleChangeRequest = (member, role) => {
    // Don't allow changing your own role as admin (prevent accidental demotion)
    if (member._id === currentUser._id) {
      alert("You cannot change your own role. Ask another admin to do this if needed.");
      return;
    }
    
    setSelectedMember(member);
    setNewRole(role);
    setIsConfirmationOpen(true);
  };

  // New function: Handle remove member request
  const handleRemoveMemberRequest = (member) => {
    // Don't allow removing yourself through this flow
    if (member._id === currentUser._id) {
      alert("To leave the project, use the 'Leave Project' button at the bottom of the page.");
      return;
    }
    
    // Don't allow non-admins to remove members
    if (!isAdmin) {
      return;
    }
    
    setSelectedMember(member);
    setIsRemoveConfirmOpen(true);
  };

  // New function: Handle leave project request
  const handleLeaveProjectRequest = () => {
    // Check if user is the last admin
    const adminCount = projectMembers.filter(m => 
      (m.role === ROLES.ADMIN) && 
      (m.userId?._id !== currentUser._id && m._id !== currentUser._id)
    ).length;
    
    if (isAdmin && adminCount === 0) {
      alert("You are the only admin of this project. You must promote another member to admin before leaving.");
      return;
    }
    
    setIsLeaveConfirmOpen(true);
  };

  // Existing function: Confirm role change
  const confirmRoleChange = async () => {
    if (!selectedMember || !newRole || !projectId) return;
    
    try {
      await changeRoleMutation.mutateAsync({
        userId: selectedMember._id,
        projectId,
        newRole
      });
      
      setIsConfirmationOpen(false);
      setSelectedMember(null);
      setNewRole('');
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  // New function: Confirm remove member
  const confirmRemoveMember = async () => {
    if (!selectedMember || !projectId) return;
    
    try {
      await removeMemberMutation.mutateAsync({
        userId: selectedMember._id,
        projectId
      });
      
      setIsRemoveConfirmOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  // New function: Confirm leave project
  const confirmLeaveProject = async () => {
    if (!projectId) return;
    
    try {
      await leaveProjectMutation.mutateAsync({
        projectId
      });
      
      setIsLeaveConfirmOpen(false);
    } catch (error) {
      console.error('Failed to leave project:', error);
    }
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case ROLES.MEMBER:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Member
          </span>
        );
      case ROLES.VIEWER:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <UserX className="w-3 h-3 mr-1" />
            Viewer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {role}
          </span>
        );
    }
  };

  // Add this effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && 
          dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown].contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Updated renderActionDropdown function with remove option
  const renderActionDropdown = (member) => {
    if (member._id === currentUser._id) {
      return <span className="text-gray-400 text-xs">Current User</span>;
    }
    
    return (
      <div className="relative" ref={el => dropdownRefs.current[member._id] = el}>
        <button 
          onClick={() => setActiveDropdown(prev => prev === member._id ? null : member._id)}
          className="text-blue-600 hover:text-blue-900 focus:outline-none p-1 rounded-full hover:bg-blue-50"
          aria-label="Member options"
        >
          <MoreHorizontal size={20} />
        </button>
        
        {/* Improved dropdown with fixed positioning */}
        {activeDropdown === member._id && (
          <div className="fixed-dropdown absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100" 
               style={{
                 zIndex: 100,
                 minWidth: '12rem',
                 filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
               }}
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                Change role
              </div>
              
              <button
                onClick={() => handleRoleChangeRequest(member, ROLES.ADMIN)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${member.role === ROLES.ADMIN ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
              >
                <div className="flex items-center">
                  <Shield className="mr-2" size={16} />
                  Make Admin
                </div>
              </button>
              
              <button
                onClick={() => handleRoleChangeRequest(member, ROLES.MEMBER)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${member.role === ROLES.MEMBER ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                <div className="flex items-center">
                  <UserCheck className="mr-2" size={16} />
                  Make Member
                </div>
              </button>
              
              <button
                onClick={() => handleRoleChangeRequest(member, ROLES.VIEWER)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${member.role === ROLES.VIEWER ? 'bg-gray-50 text-gray-700' : 'text-gray-700'}`}
              >
                <div className="flex items-center">
                  <UserX className="mr-2" size={16} />
                  Make Viewer
                </div>
              </button>
              
              {/* Add remove member option */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => handleRemoveMemberRequest(member)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <div className="flex items-center">
                    <UserMinus className="mr-2" size={16} />
                    Remove from project
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add this state inside your TeamManagement component:
  const [selectedTaskMember, setSelectedTaskMember] = useState(null);

  // Add this handler in your TeamManagement component:
  const handleViewMemberTasks = (member) => {
    setSelectedTaskMember(member);
  };

  return (
    <div className="bg-white h-[900px] rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <style jsx>{`
        .fixed-dropdown {
          position: absolute;
          z-index: 100;
        }
      `}</style>
      
      {/* Header remains the same */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users className="mr-2 text-blue-500" size={20} />
            Project Team ({projectMembers.length} members)
          </h2>
          
          {/* Add Leave Project button */}
          {currentUserMember && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLeaveProjectRequest();
              }}
              className="text-sm flex items-center py-1.5 px-3 text-red-600 border border-red-200 rounded hover:bg-red-50"
            >
              <LogOut size={16} className="mr-1.5" />
              Leave Project
            </button>
          )}
        </div>
        
        {/* Search and filters remain the same */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search members..."
            />
          </div>
          
          <div className="flex items-center gap-2 self-end">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="username">Name</option>
              <option value="role">Role</option>
              <option value="tasks">Task Count</option>
              <option value="completion">Completion Rate</option>
            </select>
            
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'text-gray-600' : 'text-blue-600'} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Members list with flex-grow to take available space */}
      <div className="flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Stats
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion
              </th>
              {isAdmin && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50">
                {/* Wrap the member and task stats columns in a clickable div */}
                <td 
                  colSpan={isAdmin ? 4 : 5} 
                  className="cursor-pointer"
                  onClick={() => handleViewMemberTasks(member)}
                >
                  <div className="flex">
                    {/* Member column */}
                    <div className="px-6 py-4 whitespace-nowrap flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={member.avatar} 
                              alt={`${member.username}'s avatar`} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.username}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Role column */}
                    <div className="px-6 py-4 whitespace-nowrap flex-1">
                      {renderRoleBadge(member.role)}
                      {member._id === currentUser._id && (
                        <span className="ml-2 text-xs text-gray-500">(You)</span>
                      )}
                    </div>

                    {/* Task stats column */}
                    <div className="px-6 py-4 whitespace-nowrap flex-1">
                      <div className="flex space-x-2 text-sm text-gray-700">
                        <div className="bg-blue-50 rounded-md px-2 py-1">
                          <span className="font-semibold">{member.totalTasks}</span> Total
                        </div>
                        <div className="bg-green-50 rounded-md px-2 py-1">
                          <span className="font-semibold">{member.completedTasks}</span> Done
                        </div>
                        <div className="bg-yellow-50 rounded-md px-2 py-1">
                          <span className="font-semibold">{member.inProgressTasks}</span> Active
                        </div>
                      </div>
                    </div>

                    {/* Completion column */}
                    <div className="px-6 py-4 whitespace-nowrap flex-1">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 mr-2">
                            {member.completionRate}%
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${member.completionRate}%`,
                                backgroundColor: member.completionRate > 75 ? '#10B981' : 
                                              member.completionRate > 50 ? '#3B82F6' : 
                                              member.completionRate > 25 ? '#F59E0B' : 
                                              '#EF4444' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Actions column - separate from clickable area */}
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
                    {renderActionDropdown(member)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMembers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-4 text-gray-300" />
            <p>{searchTerm ? 'No members match your search' : 'No members in this project'}</p>
          </div>
        )}
      </div>
      
      {/* Legend at the bottom */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Role Permissions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="flex items-start">
            <Shield className="text-purple-500 mr-1 mt-0.5 flex-shrink-0" size={14} />
            <span>
              <span className="font-medium">Admin:</span> Full access including member management
            </span>
          </div>
          <div className="flex items-start">
            <UserCheck className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" size={14} />
            <span>
              <span className="font-medium">Member:</span> Can edit tasks and add comments
            </span>
          </div>
          <div className="flex items-start">
            <UserX className="text-gray-500 mr-1 mt-0.5 flex-shrink-0" size={14} />
            <span>
              <span className="font-medium">Viewer:</span> Read-only access to project
            </span>
          </div>
        </div>
      </div>
      
      {/* Confirmation modal for role change */}
      <AnimatePresence>
        {isConfirmationOpen && (
          <RoleChangeConfirmation
            member={selectedMember}
            newRole={newRole}
            onConfirm={confirmRoleChange}
            onCancel={() => setIsConfirmationOpen(false)}
            isLoading={changeRoleMutation.isLoading}
          />
        )}
        
        {/* Add modal for remove member confirmation */}
        {isRemoveConfirmOpen && (
          <RemoveMemberConfirmation
            member={selectedMember}
            onConfirm={confirmRemoveMember}
            onCancel={() => setIsRemoveConfirmOpen(false)}
            isLoading={removeMemberMutation.isLoading}
          />
        )}
        
        {/* Add modal for leave project confirmation */}
        {isLeaveConfirmOpen && (
          <RemoveMemberConfirmation
            leaveProject={true}
            onConfirm={confirmLeaveProject}
            onCancel={() => setIsLeaveConfirmOpen(false)}
            isLoading={leaveProjectMutation.isLoading}
          />
        )}

        {/* Add Member Task List Modal */}
        {selectedTaskMember && (
          <MemberTaskList
            member={selectedTaskMember}
            tasks={tasks}
            onClose={() => setSelectedTaskMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;