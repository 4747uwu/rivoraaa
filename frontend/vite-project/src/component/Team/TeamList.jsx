import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, PlusCircle, Briefcase, Lock, Globe, User,
  Eye, Search, X, Loader, Star, Award, Trophy, 
  ChevronUp, ChevronRight, Clock, Zap, MoreHorizontal, FilterX
} from 'lucide-react';

// Extracted reusable components for better performance
// Update EmptyState component
const EmptyState = memo(({ icon: Icon, title, description, actionButton, glassCard, textClass, subTextClass }) => (
  <div className={`${glassCard} rounded-lg p-6 text-center bg-gradient-to-br from-gray-900 to-black border border-gray-800/50`}>
    <Icon className="w-12 h-12 mx-auto text-gray-600 mb-2" />
    <h4 className="text-gray-400">{title}</h4>
    <p className="text-gray-600">{description}</p>
    {actionButton && (
      <div className="mt-4">
        {React.cloneElement(actionButton, {
          className: "text-gray-400 hover:text-gray-300"
        })}
      </div>
    )}
  </div>
));

// Update FilterButton component
const FilterButton = memo(({ label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm transition-all ${
      isActive 
        ? 'bg-gray-800/50 text-gray-300 border border-gray-700/50' 
        : 'bg-gray-900/30 text-gray-500 hover:bg-gray-800/30 hover:text-gray-400'
    }`}
  >
    {label}
  </button>
));

const FilterButtons = memo(({ activeFilter, setActiveFilter }) => (
  <div className="flex space-x-2 mb-4">
    <FilterButton 
      label="All Teams"
      isActive={activeFilter === 'all'}
      onClick={() => setActiveFilter('all')}
    />
    <FilterButton 
      label="Teams I Own"
      isActive={activeFilter === 'owned'}
      onClick={() => setActiveFilter('owned')}
    />
    <FilterButton 
      label="Teams I'm In"
      isActive={activeFilter === 'member'}
      onClick={() => setActiveFilter('member')}
    />
  </div>
));

// Update SearchBar component
const SearchBar = memo(({ searchQuery, setSearchQuery, glassCard }) => (
  <div className={`${glassCard} rounded-lg flex items-center px-3 py-2 flex-1 sm:flex-auto bg-gray-900/50 border border-gray-800/50`}>
    <Search size={16} className="text-gray-500 mr-2" />
    <input
      type="text"
      placeholder="Search teams..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="bg-transparent outline-none text-gray-300 placeholder-gray-600 w-full"
    />
    {searchQuery && (
      <button 
        onClick={() => setSearchQuery('')}
        className="text-gray-600 hover:text-gray-400"
      >
        <X size={14} />
      </button>
    )}
  </div>
));

// Memoized team card component
const TeamCard = memo(({ team, isOwned, user, glassCard, textClass, subTextClass }) => {
  // Generate a consistent color for each team (memoized)
  const teamColor = useMemo(() => {
    const colors = [
      'from-gray-800 to-gray-900',
      'from-gray-900 to-black',
      'from-black to-gray-900',
      'from-gray-800 to-gray-950',
      'from-gray-900 to-gray-800',
      'from-black to-gray-800',
      'from-gray-950 to-black',
      'from-gray-800 to-black',
    ];
    
    // Use the sum of character codes as a hash function
    const hash = team._id.split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hash % colors.length];
  }, [team._id]);
  
  // Format member count for display
  const memberCount = useMemo(() => {
    return team.members.length + 1; // +1 for the owner
  }, [team.members.length]);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.3)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${glassCard} rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800/50`}
    >
      <Link to={`/teams/${team._id}`} className="flex items-center p-4 gap-4">
        {/* Team Icon - Left Side Rounded */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${teamColor} flex items-center justify-center text-white font-bold text-lg`}>
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
              {memberCount}
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
});

// Memoized TeamGridSection component
const TeamGridSection = memo(({ 
  title, 
  icon: Icon, 
  teams, 
  isOwned,
  user,
  searchQuery,
  onCreateTeam,
  glassCard,
  textClass,
  subTextClass
}) => (
  <motion.div variants={itemVariants} className="space-y-4">
    <h3 className={`text-lg ${textClass} flex items-center gap-2`}>
      <Icon className="w-4 h-4 text-indigo-400" />
      {title}
    </h3>
    
    {teams.length === 0 ? (
      searchQuery ? (
        <EmptyState 
          icon={Search}
          title="No matching teams found"
          description="Try different search terms"
          glassCard={glassCard}
          textClass={textClass}
          subTextClass={subTextClass}
        />
      ) : (
        <EmptyState 
          icon={isOwned ? Briefcase : Users}
          title={isOwned ? "No teams created yet" : "You're not a member of any teams"}
          description={isOwned 
            ? "Create your first team to start collaborating" 
            : "When you're added to a team, it will appear here"
          }
          actionButton={isOwned && (
            <button
              onClick={onCreateTeam}
              className="mt-4 text-indigo-400 hover:text-indigo-300"
            >
              Create a team
            </button>
          )}
          glassCard={glassCard}
          textClass={textClass}
          subTextClass={subTextClass}
        />
      )
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map(team => (
          <TeamCard 
            key={team._id} 
            team={team} 
            isOwned={isOwned}
            user={user}
            glassCard={glassCard}
            textClass={textClass}
            subTextClass={subTextClass}
          />
        ))}
      </div>
    )}
  </motion.div>
));

// Memoized LeaderboardSection component
const LeaderboardSection = memo(({ 
  glassCard, 
  textClass, 
  subTextClass, 
  itemVariants 
}) => {
  // Mock leaderboard data (static)
  const leaderboardData = [
    { name: "Marketing Team", activity: 98, members: 8, streak: 14 },
    { name: "Dev Squad", activity: 87, members: 12, streak: 21 },
    { name: "Design Wizards", activity: 76, members: 5, streak: 7 },
    { name: "Sales Heroes", activity: 72, members: 9, streak: 5 },
    { name: "Customer Support", activity: 65, members: 11, streak: 3 },
  ];
  
  return (
    <motion.div variants={itemVariants} className={`${glassCard} rounded-lg p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800/50`}>
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
              ${index === 0 ? 'bg-gray-800/50 text-gray-300 border border-gray-700/50' :
                index === 1 ? 'bg-gray-800/40 text-gray-400 border border-gray-700/40' :
                index === 2 ? 'bg-gray-800/30 text-gray-500 border border-gray-700/30' :
                'bg-gray-800/20 text-gray-600'
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
                    index < 3 ? 'bg-gray-800/50 text-gray-300 border border-gray-700/50' : 'bg-gray-800/20 text-gray-500'
                  }`}
                >
                  {index === 0 ? '🔥 Hot!' : 
                   index === 1 ? '🚀 Rising' : 
                   index === 2 ? '⭐ Active' : 'Normal'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar - Absolute positioned at bottom */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-700" style={{
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
  );
});

// Animation variants - defined outside component to prevent recreation
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

// Main TeamsList component
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
  loading
}) => {
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'owned', 'member'
  
  // Memoized filtering function
  const filterTeams = useCallback((teams, query) => {
    const lowercaseQuery = query.toLowerCase();
    return teams.filter(team => 
      team.name.toLowerCase().includes(lowercaseQuery) ||
      team.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, []);
  
  // Memoized filtered teams
  const filteredOwnedTeams = useMemo(() => 
    filterTeams(ownedTeams, searchQuery)
  , [ownedTeams, searchQuery, filterTeams]);
  
  const filteredMemberTeams = useMemo(() => 
    filterTeams(memberTeams, searchQuery)
  , [memberTeams, searchQuery, filterTeams]);
  
  // Handlers
  const handleCreateTeam = useCallback(() => {
    setIsCreating(true);
  }, [setIsCreating]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handlePageChange = useCallback((direction) => {
    setPagination(prev => ({ 
      ...prev, 
      page: direction === 'next' 
        ? Math.min(pagination.totalPages, prev.page + 1)
        : Math.max(1, prev.page - 1) 
    }));
  }, [pagination.totalPages, setPagination]);

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

  // Team creation form
  if (isCreating) {
    return renderTeamForm();
  }

  return (
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
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                glassCard={glassCard}
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateTeam}
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
          <FilterButtons 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

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
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-200"
              >
                <FilterX size={14} />
              </button>
            </motion.div>
          )}

          {/* Owned Teams Section */}
          {(activeFilter === 'all' || activeFilter === 'owned') && (
            <TeamGridSection
              title="Teams I Own"
              icon={Briefcase}
              teams={filteredOwnedTeams}
              isOwned={true}
              user={user}
              searchQuery={searchQuery}
              onCreateTeam={handleCreateTeam}
              glassCard={glassCard}
              textClass={textClass}
              subTextClass={subTextClass}
            />
          )}

          {/* Member Teams Section */}
          {(activeFilter === 'all' || activeFilter === 'member') && (
            <TeamGridSection
              title="Teams I'm In"
              icon={Users}
              teams={filteredMemberTeams}
              isOwned={false}
              user={user}
              searchQuery={searchQuery}
              glassCard={glassCard}
              textClass={textClass}
              subTextClass={subTextClass}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && !searchQuery && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange('prev')}
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
                  onClick={() => handlePageChange('next')}
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
          <LeaderboardSection
            glassCard={glassCard}
            textClass={textClass}
            subTextClass={subTextClass}
            itemVariants={itemVariants}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default memo(TeamsList);