import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, X, User,
  UserPlus, Users, Clock, Check, Shield,
  MessageSquare, Mail, MoreHorizontal, Activity,
  Loader, Layout, Calendar, Settings
} from 'lucide-react';
import TeamCalendarAndTasks from './teamFeatures/TeamCalendarAndTask';

const TeamDetails = ({
  currentTeam,
  user,
  isOwner,
  isMember,
  userRole,
  isEditing,
  showMemberForm,
  editingMember,
  renderTeamForm,
  renderAddMemberForm,
  renderEditMemberForm,
  setIsEditing,
  setShowMemberForm,
  handleDeleteTeam,
  handleLeaveTeam,
  handleRemoveMember,
  setEditingMember,
  setRoleInput,
  isLoadingDeleteTeam,
  isLoadingLeaveTeam,
  isLoadingRemoveMember,
  formatDate,
  glassCard,
  textClass,
  headingClass,
  subTextClass,
  buttonPrimary,
  buttonSecondary,
  buttonDanger,
  containerVariants,
  itemVariants,
  loading
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Loading screen component
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center"
      >
        <div className={`${glassCard} p-12 rounded-xl flex flex-col items-center`}>
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 1.5, ease: "linear" },
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            className="mb-6"
          >
            <Loader size={52} className="text-indigo-400" />
          </motion.div>
          <h3 className={`text-xl mb-2 ${headingClass}`}>Loading team...</h3>
          <p className={`${subTextClass}`}>Please wait while we fetch the team details</p>
        </div>
      </motion.div>
    );
  }

  // Handle status indicators for team members (online, away, offline)
  const getStatusIndicator = (member) => {
    // This is a placeholder - in a real app, you'd use WebSocket/presence data
    const statuses = ['online', 'away', 'offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const statusColors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };
    
    return (
      <div className="flex items-center">
        <span className={`w-2 h-2 rounded-full mr-1.5 ${statusColors[randomStatus]}`}></span>
        <span className="text-sm capitalize">{randomStatus}</span>
      </div>
    );
  };

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layout size={16} /> },
    { id: 'members', label: 'Members', icon: <Users size={16} /> },
    { id: 'calendar', label: 'Calendar & Tasks', icon: <Calendar size={16} /> }
  ];

  // If user is owner, add settings tab
  if (isOwner) {
    tabs.push({ id: 'settings', label: 'Settings', icon: <Settings size={16} /> });
  }

  const MemberCard = ({ member }) => {
    const isCurrentUser = member.user._id === user._id;
    const isTeamOwner = currentTeam?.owner?._id === member.user._id;
    
    return (
      <motion.div 
        variants={itemVariants}
        className={`${glassCard} w-[350px] h-full rounded-lg p-4 flex items-start space-x-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20`}
      >
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-700 overflow-hidden flex items-center justify-center border-2 border-indigo-500/20">
          {member.user.profilePicture ? (
            <img 
              src={member.user.profilePicture} 
              alt={member.user.name}
              className="w-full h-full object-cover scale-150"
            />
          ) : (
            <User size={20} className="text-gray-400" />
          )}
        </div>
        
        {/* Member Details */}
        <div className="flex-grow">
          <div className="flex justify-between">
            <div>
              <h3 className={textClass}>
                {member.user.name}
                {isCurrentUser && <span className="ml-2 text-xs bg-indigo-800/50 text-indigo-200 px-2 py-0.5 rounded">You</span>}
                {isTeamOwner && <Shield size={14} className="inline ml-1 text-indigo-400" />}
              </h3>
              <p className="text-sm text-gray-400 truncate max-w-[160px]">@{member.user.username}</p>
            </div>
            {getStatusIndicator(member)}
          </div>
          
          {/* Role Badge */}
          <div className="mt-2">
            <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-xs">
              {member.role}
            </span>
          </div>
          
          {/* Joined Date */}
          <div className="mt-1 text-xs text-gray-500">
            Joined {formatDate(member.joinedAt)}
          </div>
          
          {/* Actions */}
          <div className="mt-3 flex space-x-2">
            {!isCurrentUser && (
              <button className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors">
                <MessageSquare size={14} />
              </button>
            )}
            <button className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors">
              <Mail size={14} />
            </button>
            
            {/* Edit/Remove Actions (owner only) */}
            {isOwner && !isCurrentUser && (
              <>
                <button 
                  onClick={() => {
                    setEditingMember(member);
                    setRoleInput(member.role);
                  }}
                  className="p-1.5 rounded-full bg-indigo-800/30 hover:bg-indigo-700/50 text-indigo-300 hover:text-white transition-colors"
                  title="Edit Role"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleRemoveMember(member.user._id)}
                  disabled={isLoadingRemoveMember}
                  className="p-1.5 rounded-full bg-red-800/30 hover:bg-red-700/50 text-red-300 hover:text-white transition-colors"
                  title="Remove Member"
                >
                  {isLoadingRemoveMember ? (
                    <Clock size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

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
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <Link to="/teamBuilder" className="group">
              <motion.div
                whileHover={{ x: -4 }}
                className="flex items-center text-indigo-400 group-hover:text-indigo-300"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Teams</span>
              </motion.div>
            </Link>

            <div className="flex space-x-3">
              {isOwner && (
                <>
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
                </>
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
                      <X size={16} className="mr-2" />
                      Leave Team
                    </div>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Team Info Card */}
          <motion.div variants={itemVariants} className={`${glassCard} rounded-xl p-6`}>
            <div className="flex items-center space-x-6">
              {/* Team Avatar */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center border border-indigo-500/20">
                {currentTeam?.avatar ? (
                  <img 
                    src={currentTeam?.avatar} 
                    alt={currentTeam?.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Users size={36} className="text-indigo-300" />
                )}
              </div>
              
              {/* Team Details */}
              <div className="flex-grow">
                <div className="flex items-center space-x-3">
                  <h1 className={`text-3xl font-bold ${headingClass}`}>
                    {currentTeam?.name}
                  </h1>
                  <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded text-sm">
                    {currentTeam?.category}
                  </span>
                  {currentTeam?.isPrivate && (
                    <span className="bg-gray-800/40 text-gray-300 px-2 py-1 rounded-md text-xs">
                      Private
                    </span>
                  )}
                </div>
                
                <p className={`mt-2 ${subTextClass}`}>
                  {currentTeam?.description || "No description provided"}
                </p>
                
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    <span>{currentTeam?.members.length + 1} Members</span>
                  </div>
                  <div>
                    Created {formatDate(currentTeam?.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div variants={itemVariants} className="border-b border-gray-700 mb-6">
            <div className="flex flex-wrap -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center py-3 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Stats/Activity Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center mb-4">
                  <Activity size={18} className="text-indigo-400 mr-2" />
                  <h3 className={`text-xl ${headingClass}`}>Team Activity</h3>
                </div>
                
                <div className={`${glassCard} rounded-lg p-6 text-center`}>
                  <p className={subTextClass}>Team activity tracking coming soon</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl ${headingClass}`}>Meet the Team</h2>
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

              {/* Owner Card - Special Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <motion.div 
                  variants={itemVariants}
                  className={`${glassCard} w-auto rounded-lg p-4 border-l-4 border-indigo-500 flex items-start space-x-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20`}
                >
                  <div className="w-16 h-16 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-700 overflow-hidden flex items-center justify-center border-2 border-indigo-500/20">
                    {currentTeam?.owner.profilePicture ? (
                      <img 
                        src={currentTeam?.owner.profilePicture} 
                        alt={currentTeam?.owner.name}
                        className="w-full h-full object-cover scale-150"
                      />
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className={textClass}>
                          {currentTeam?.owner.name}
                          {currentTeam?.owner._id === user._id && 
                            <span className="ml-2 text-xs bg-indigo-800/50 text-indigo-200 px-2 py-0.5 rounded">You</span>
                          }
                        </h3>
                        <p className="text-sm text-gray-400">@{currentTeam?.owner.username}</p>
                      </div>
                      <div className="flex items-center">
                        <Shield size={16} className="text-indigo-400 mr-1.5" />
                        <span className="text-indigo-300">Team Owner</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      {currentTeam?.owner._id !== user?._id && (
                        <button className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors">
                          <MessageSquare size={14} />
                        </button>
                      )}
                      <button className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors">
                        <Mail size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Team Members */}
              {currentTeam?.members.length === 0 ? (
                <div className={`${glassCard} rounded-lg p-10 text-center`}>
                  <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                  <h4 className={textClass}>No other members yet</h4>
                  <p className={subTextClass}>Add members to start collaborating</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentTeam?.members.map((member) => (
                    <MemberCard key={member._id} member={member} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Calendar & Tasks Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`${glassCard} rounded-lg overflow-hidden`}
            >
              <TeamCalendarAndTasks 
                teamId={currentTeam?._id}
                team={currentTeam}
                isTeamAdmin={isOwner || userRole === 'admin'}
              />
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && isOwner && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`${glassCard} rounded-lg p-6`}
            >
              <h2 className={`text-xl ${headingClass} mb-6`}>Team Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className={`${textClass} font-medium mb-3`}>Team Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={buttonPrimary}
                    >
                      Edit Team
                    </button>
                    <button
                      onClick={handleDeleteTeam}
                      disabled={isLoadingDeleteTeam}
                      className={buttonDanger}
                    >
                      {isLoadingDeleteTeam ? (
                        <div className="flex items-center">
                          <Clock size={16} className="animate-spin mr-2" />
                          Deleting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Trash2 size={16} className="mr-2" />
                          Delete Team
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* More settings can be added here */}
                <div>
                  <h3 className={`${textClass} font-medium mb-3`}>Team Privacy</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`${currentTeam?.isPrivate ? 'bg-indigo-500' : 'bg-gray-600'} w-11 h-6 rounded-full relative transition-all duration-300`}>
                      <div className={`absolute top-1 ${currentTeam?.isPrivate ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all duration-300`}></div>
                    </div>
                    <span className={textClass}>
                      {currentTeam?.isPrivate ? 'Private Team' : 'Public Team'}
                    </span>
                  </div>
                  <p className={`${subTextClass} mt-2 text-sm`}>
                    {currentTeam?.isPrivate 
                      ? 'Only invited members can join this team.' 
                      : 'Anyone with the link can request to join this team.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default TeamDetails;