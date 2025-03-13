import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, PlusCircle, Briefcase, Lock, Globe, User,
  Eye, Search, X, Loader, Star, Award, Trophy, 
  ChevronUp, ChevronRight, Clock, Zap, MoreHorizontal, FilterX
} from 'lucide-react';

const TeamsList = ({ 
  isCreating,
  setIsCreating,
  ownedTeams,
  memberTeams,
  pagination,
  setPagination,
  renderTeamForm,
  backgroundGradient,
  glassCard,
  textClass,
  headingClass,
  subTextClass,
  buttonPrimary,
  user,
  loading, // Add loading prop
}) => {
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'owned', 'member'
  
  // Filter teams based on search query
  const filteredOwnedTeams = ownedTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredMemberTeams = memberTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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

  // Mock leaderboard data
  const leaderboardData = [
    { name: "Marketing Team", activity: 98, members: 8, streak: 14 },
    { name: "Dev Squad", activity: 87, members: 12, streak: 21 },
    { name: "Design Wizards", activity: 76, members: 5, streak: 7 },
    { name: "Sales Heroes", activity: 72, members: 9, streak: 5 },
    { name: "Customer Support", activity: 65, members: 11, streak: 3 },
  ];

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
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
          <Loader size={48} className="text-indigo-400" />
        </motion.div>
        <h3 className={`text-xl mb-2 ${headingClass}`}>Loading teams...</h3>
        <p className={subTextClass}>Preparing your collaboration spaces</p>
      </div>
    );
  }

  return (
    <>
      {isCreating ? (
        renderTeamForm()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Teams */}
          <div className="lg:col-span-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Create Team Header with Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className={`text-2xl ${headingClass}`}>My Teams</h2>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className={`${glassCard} rounded-lg flex items-center px-3 py-2 flex-1 sm:flex-auto`}>
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent outline-none text-gray-200 placeholder-gray-500 w-full"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-gray-500 hover:text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreating(true)}
                    className={`${buttonPrimary} whitespace-nowrap`}
                  >
                    <div className="flex items-center">
                      <PlusCircle size={16} className="mr-2" />
                      New Team
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeFilter === 'all' 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  All Teams
                </button>
                <button 
                  onClick={() => setActiveFilter('owned')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeFilter === 'owned' 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  Teams I Own
                </button>
                <button 
                  onClick={() => setActiveFilter('member')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeFilter === 'member' 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  Teams I'm In
                </button>
              </div>

              {/* Search status */}
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-300">
                      Results for: <span className="text-indigo-300 font-medium">{searchQuery}</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <FilterX size={14} />
                  </button>
                </motion.div>
              )}

              {/* Owned Teams Section */}
              {(activeFilter === 'all' || activeFilter === 'owned') && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className={`text-lg ${textClass} flex items-center gap-2`}>
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Teams I Own
                  </h3>
                  
                  {filteredOwnedTeams.length === 0 ? (
                    <div className={`${glassCard} rounded-lg p-6 text-center`}>
                      {searchQuery ? (
                        <>
                          <Search className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <h4 className={textClass}>No matching teams found</h4>
                          <p className={subTextClass}>Try different search terms</p>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <h4 className={textClass}>No teams created yet</h4>
                          <p className={subTextClass}>Create your first team to start collaborating</p>
                          <button
                            onClick={() => setIsCreating(true)}
                            className="mt-4 text-indigo-400 hover:text-indigo-300"
                          >
                            Create a team
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Owned Teams Cards */}
                      {filteredOwnedTeams.map(team => (
                        <TeamCard 
                          key={team._id} 
                          team={team} 
                          isOwned={true}
                          glassCard={glassCard}
                          textClass={textClass}
                          subTextClass={subTextClass}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Member Teams Section */}
              {(activeFilter === 'all' || activeFilter === 'member') && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className={`text-lg ${textClass} flex items-center gap-2`}>
                    <Users className="w-4 h-4 text-indigo-400" />
                    Teams I'm In
                  </h3>
                  
                  {filteredMemberTeams.length === 0 ? (
                    <div className={`${glassCard} rounded-lg p-6 text-center`}>
                      {searchQuery ? (
                        <>
                          <Search className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <h4 className={textClass}>No matching teams found</h4>
                          <p className={subTextClass}>Try different search terms</p>
                        </>
                      ) : (
                        <>
                          <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <h4 className={textClass}>You're not a member of any teams</h4>
                          <p className={subTextClass}>When you're added to a team, it will appear here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Member Teams Cards */}
                      {filteredMemberTeams.map(team => (
                        <TeamCard 
                          key={team._id} 
                          team={team} 
                          isOwned={false}
                          user={user}
                          glassCard={glassCard}
                          textClass={textClass}
                          subTextClass={subTextClass}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && !searchQuery && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ 
                        ...prev, 
                        page: Math.max(1, prev.page - 1) 
                      }))}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 rounded ${
                        pagination.page === 1
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 bg-indigo-600/20 rounded text-indigo-300 border border-indigo-500/20">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPagination(prev => ({ 
                        ...prev, 
                        page: Math.min(pagination.totalPages, prev.page + 1) 
                      }))}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 rounded ${
                        pagination.page === pagination.totalPages
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants} className={`${glassCard} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg ${textClass} flex items-center gap-2`}>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Team Leaderboard
                  </h3>
                  <div className="bg-gray-800/40 text-xs text-gray-400 px-2 py-1 rounded">
                    This Week
                  </div>
                </div>

                <div className="space-y-4">
                  {leaderboardData.map((team, index) => (
                    <div 
                      key={index}
                      className="flex items-center p-3 rounded-lg relative overflow-hidden group transition-all duration-300 hover:bg-gray-800/40"
                    >
                      {/* Position marker */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                          index === 2 ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' :
                          'bg-gray-700/40 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Team info */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className={`${textClass} text-sm font-medium`}>
                            {team.name}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center">
                              <Zap size={12} className="text-yellow-400 mr-1" />
                              <span className="text-xs text-yellow-300">{team.activity}%</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-1 justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span className="flex items-center">
                              <Users size={10} className="mr-1" />
                              {team.members}
                            </span>
                            <span className="flex items-center">
                              <Clock size={10} className="mr-1" />
                              {team.streak} day streak
                            </span>
                          </div>
                          <div 
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              index < 3 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-700/40 text-gray-400'
                            }`}
                          >
                            {index === 0 ? '🔥 Hot!' : 
                             index === 1 ? '🚀 Rising' : 
                             index === 2 ? '⭐ Active' : 'Normal'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar - Absolute positioned at bottom */}
                      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600" style={{
                        width: `${team.activity}%`
                      }}></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700/30">
                  <h4 className={`${textClass} text-sm mb-3`}>Your Activity</h4>
                  
                  <div className="bg-gray-800/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Weekly goal</span>
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
                        On Track
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" 
                           style={{ width: '65%' }}></div>
                    </div>
                    
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>65%</span>
                      <span>Target: 100%</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors">
                    View All Stats
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced Team Card Component
const TeamCard = ({ team, isOwned, user, glassCard, textClass, subTextClass }) => {
  // Generate a consistent color for each team
  const getTeamColor = (id) => {
    const colors = [
      'from-black-500 to-purple-600',
      'from-blue-500 to-purple-600',
      'from-black-500 to-purple-600',
      'from-black-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-teal-500 to-cyan-600',
      'from-violet-500 to-purple-600',
    ];
    
    // Use the sum of character codes as a hash function
    const hash = team._id.split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hash % colors.length];
  };
  
  // Format member count for display
  const formatMemberCount = () => {
    const count = team.members.length + 1; // +1 for the owner
    return count;
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 20px -5px rgba(79, 70, 229, 0.15)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${glassCard} rounded-lg overflow-hidden`}
    >
      <Link to={`/teams/${team._id}`} className="flex items-center p-4 gap-4">
        {/* Team Icon - Left Side Rounded */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getTeamColor(team._id)} flex items-center justify-center text-white font-bold text-lg`}>
          {team.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Team Details - Middle */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${textClass} truncate`}>
              {team.name}
            </h4>
            {isOwned && <Star size={12} className="text-yellow-400 flex-shrink-0" />}
            {team.isPrivate ? 
              <Lock size={12} className="text-gray-400 flex-shrink-0" /> : 
              <Globe size={12} className="text-green-400 flex-shrink-0" />
            }
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 truncate max-w-[100px]">
              {team.category || 'General'}
            </span>
            
            <span className="flex items-center text-xs text-gray-400">
              <Users size={10} className="mr-1 flex-shrink-0" />
              {formatMemberCount()}
            </span>
          </div>
        </div>
        
        {/* Action Button - Right */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-full ${
            isOwned ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-700/50 text-gray-300'
          }`}>
            {isOwned ? 
              <Eye size={16} className="flex-shrink-0" /> : 
              <ChevronRight size={16} className="flex-shrink-0" />
            }
          </div>
        </div>
      </Link>
      
      {/* Member Avatars - Bottom */}
      <div className="px-4 pb-4 -mt-1">
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 border-2 border-[#0F172A] flex items-center justify-center text-xs font-bold text-white z-10">
              {team.owner.name.charAt(0)}
            </div>
            {team.members.slice(0, 2).map((member, index) => (
              <div 
                key={index}
                className="w-6 h-6 rounded-full border-2 border-[#0F172A] overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                style={{ zIndex: 9 - index }}
              >
                {member.user?.profilePicture ? (
                  <img 
                    src={member.user.profilePicture} 
                    alt={`${member.user.name || 'Member'}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    {member.user?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            ))}
            {team.members.length > 2 && (
              <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#0F172A] flex items-center justify-center text-xs text-gray-400">
                +{team.members.length - 2}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {team.members.length > 0 ? `+${team.members.length} others` : 'Just the owner'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamsList;