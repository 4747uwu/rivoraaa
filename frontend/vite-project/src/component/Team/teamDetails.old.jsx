import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Clock, Lock, Globe,
  User, UserPlus, X, Users
} from 'lucide-react';

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
  itemVariants
}) => {
  if (!currentTeam) return null;

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
          {/* Team Header Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* Back Button */}
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

            {/* Team Actions */}
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

            {/* Leave Team Button */}
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

export default TeamDetails;