import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, User, Settings, BarChart2, 
  Files, Users, X, ChevronRight, LogOut, Zap, Cable, Loader, Bell,
  Bookmark, Clock, Search, Heart, Briefcase
} from 'lucide-react';

import { useTheme } from './context/themeContext';
import { useAuth } from './context/authContext';
import { useTeam } from './context/teamContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('main'); // 'main' or 'teams'
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [quickAccess, setQuickAccess] = useState(true);
  
  const { getMyTeams } = useTeam();
  const [teamsData, setTeamsData] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const result = await getMyTeams();
        setTeamsData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
    
    // Load recently visited from localStorage
    const storedRecent = localStorage.getItem('recentlyVisited');
    if (storedRecent) {
      setRecentlyVisited(JSON.parse(storedRecent).slice(0, 3));
    }
  }, []);

  // Track visited pages
  useEffect(() => {
    const currentPage = navItems.find(item => item.path === location.pathname);
    if (currentPage && !recentlyVisited.some(item => item.path === currentPage.path)) {
      const updatedRecent = [
        currentPage,
        ...recentlyVisited.filter(item => item.path !== currentPage.path)
      ].slice(0, 3);
      
      setRecentlyVisited(updatedRecent);
      localStorage.setItem('recentlyVisited', JSON.stringify(updatedRecent));
    }
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { icon: Home, text: "Dashboard", path: "/dashboard", section: 'main' },
    { icon: Calendar, text: "Calendar", path: "/calender", section: 'main' },
    { icon: Files, text: "Projects", path: "/projects", section: 'main' },
    { icon: Users, text: "Invitation", path: "/team", section: 'main' },
    { icon: BarChart2, text: "TeamBuilder", path: "/teamBuilder", section: 'main' },
    { icon: User, text: "Profile", path: "/profile", section: 'main' },
    { icon: Bell, text: "Notification", path: "/notification", section: 'main' },
    { icon: Cable, text: "LinkUps", path: "/linkups", section: 'main' },
  ];

  // Filter navigation items based on search term
  const filteredNavItems = searchTerm 
    ? navItems.filter(item => 
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : navItems;

  // Define monochromatic team patterns
  const teamPatterns = [
    "bg-gradient-to-br from-white/20 to-transparent",
    "bg-gradient-to-br from-white/15 to-transparent",
    "bg-gradient-to-br from-white/10 to-transparent",
    "bg-gradient-to-br from-white/5 to-transparent",
    "bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent)]",
    "bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)]",
    "bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,transparent_70%)]",
    "bg-gradient-to-tr from-white/10 via-white/5 to-transparent"
  ];

  // Get teams from both owned and member teams
  const ownedTeams = teamsData?.ownedTeams?.data || [];
  const memberTeams = teamsData?.memberTeams?.data || [];
  
  // Combine owned and member teams
  const allTeams = [...ownedTeams, ...memberTeams];
  
  // Filter teams based on search term if in teams section
  const filteredTeams = searchTerm && activeSection === 'teams'
    ? allTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allTeams;

  const themeClasses = {
    sidebar: darkMode 
      ? 'bg-black/95 backdrop-blur-lg border-r border-white/10' 
      : 'bg-white/95 backdrop-blur-lg border-r border-black/10',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    subtext: darkMode ? 'text-gray-400' : 'text-gray-600',
    border: darkMode ? 'border-white/10' : 'border-gray-200',
    navActive: darkMode 
      ? 'bg-white/10 text-white border border-white/20' 
      : 'bg-black text-white border border-black',
    navInactive: darkMode 
      ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
      : 'text-gray-600 hover:bg-black/5 hover:text-black',
    accent: darkMode ? 'bg-white/10' : 'bg-black/10',
    header: darkMode 
      ? 'from-white/10 to-transparent' 
      : 'from-black/5 to-transparent',
    iconBg: darkMode ? 'bg-white/10' : 'bg-black/10',
    iconColor: darkMode ? 'text-white' : 'text-black',
  };

  // Handle navigation to create a new team
  const handleNewTeam = () => {
    navigate('/teamBuilder');
    setSidebarOpen(false);
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed inset-y-0 left-0 z-50 w-72 ${themeClasses.sidebar} border-r ${themeClasses.border} shadow-lg backdrop-blur-lg`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header with minimalist design */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.header} opacity-80 rounded-br-xl`}></div>
          <div className="flex items-center justify-between p-5 relative z-10">
            <div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-2xl font-light tracking-wider ${themeClasses.text}`}
              >
                Rivora
              </motion.h2>
              <p className={`text-xs ${themeClasses.subtext} mt-1`}>Workspace</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className={`lg:hidden rounded-full p-1.5 ${themeClasses.accent} hover:opacity-80 transition-colors`}
            >
              <X className={`w-5 h-5 ${themeClasses.text}`} />
            </button>
          </div>
        </div>

        {/* Search Bar - New Feature */}
        <div className="px-4 py-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${themeClasses.border} bg-opacity-50 focus-within:bg-opacity-100 transition-all`}>
            <Search className={`w-4 h-4 ${themeClasses.subtext}`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`bg-transparent border-none w-full text-sm outline-none ${themeClasses.text} placeholder:${themeClasses.subtext}`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Toggle between main and team navigation */}
        <div className="flex items-center gap-1 px-3 py-2 mx-3 my-2">
          <button
            onClick={() => setActiveSection('main')}
            className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeSection === 'main' 
                ? themeClasses.navActive
                : `${themeClasses.navInactive} border border-transparent`
            }`}
          >
            Main
          </button>
          <button
            onClick={() => setActiveSection('teams')}
            className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeSection === 'teams' 
                ? themeClasses.navActive
                : `${themeClasses.navInactive} border border-transparent`
            }`}
          >
            Teams
          </button>
        </div>

        {/* Quick Access - New Feature */}
        {/* {quickAccess && recentlyVisited.length > 0 && !searchTerm && (
          <div className="px-4 mb-2">
            <div className="flex items-center justify-between">
              <p className={`text-xs font-medium ${themeClasses.subtext} uppercase tracking-wider px-2 py-1`}>
                Quick Access
              </p>
              <button 
                onClick={() => setQuickAccess(!quickAccess)}
                className={`text-xs ${themeClasses.subtext} hover:${themeClasses.text}`}
              >
                <Clock size={12} />
              </button>
            </div>
            <div className="flex gap-2 mt-1 overflow-x-auto pb-2 px-1 no-scrollbar">
              {recentlyVisited.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex flex-col items-center p-2 rounded-lg ${themeClasses.navInactive} min-w-[60px] border ${themeClasses.border}`}
                  >
                    <div className={`rounded-md p-1.5 mb-1 ${themeClasses.iconBg}`}>
                      <Icon size={14} className={themeClasses.iconColor} />
                    </div>
                    <span className="text-xs truncate max-w-[50px]">{item.text}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <div className="px-3 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeSection === 'main' ? (
              <motion.div
                key="main-navigation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <p className={`text-xs font-medium ${themeClasses.subtext} uppercase tracking-wider`}>
                    Navigation
                  </p>
                  {searchTerm && (
                    <span className={`text-xs ${themeClasses.subtext}`}>
                      {filteredNavItems.length} found
                    </span>
                  )}
                </div>
                <nav className="overflow-y-auto">
                  <ul className="space-y-1">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.li
                          key={item.path}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              isActive
                                ? themeClasses.navActive
                                : themeClasses.navInactive
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`rounded-md p-1.5 ${isActive ? themeClasses.accent : 'bg-transparent'}`}>
                                <Icon className={`w-4 h-4 ${isActive ? themeClasses.iconColor : themeClasses.subtext}`} />
                              </div>
                              <span className="font-medium text-sm">{item.text}</span>
                            </div>
                            {isActive && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`}
                              />
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.div>
            ) : (
              <motion.div
                key="teams-navigation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-[calc(100vh-200px)]"
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <p className={`text-xs font-medium ${themeClasses.subtext} uppercase tracking-wider`}>
                    Your Teams
                  </p>
                  {!loadingTeams && (
                    <div className={`text-xs ${themeClasses.subtext}`}>
                      {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
                    </div>
                  )}
                </div>
                
                {/* Team list with loading state */}
                <nav className="overflow-y-auto flex-1">
                  {loadingTeams ? (
                    <div className="h-32 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      >
                        <Loader size={20} className={darkMode ? "text-white" : "text-black"} />
                      </motion.div>
                    </div>
                  ) : error ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-red-400">Failed to load teams</p>
                      <button 
                        className={`mt-2 text-xs ${themeClasses.text} hover:opacity-80`}
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredTeams.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className={`text-sm ${themeClasses.text}`}>
                        {searchTerm ? 'No matching teams' : 'No teams yet'}
                      </p>
                      <p className={`mt-1 text-xs ${themeClasses.subtext}`}>
                        {searchTerm ? 'Try a different search term' : 'Create one to get started'}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {filteredTeams.map((team, index) => {
                        const teamPath = `/teams/${team._id}`;
                        const isActive = location.pathname === teamPath;
                        const patternIndex = index % teamPatterns.length;
                        const isOwned = ownedTeams.some(t => t._id === team._id);
                        
                        return (
                          <motion.li
                            key={team._id}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Link
                              to={teamPath}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${
                                isActive
                                  ? themeClasses.navActive
                                  : themeClasses.navInactive
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-md ${teamPatterns[patternIndex]} flex items-center justify-center text-xs font-bold ${themeClasses.text} relative border ${themeClasses.border}`}>
                                  {team.name?.charAt(0) || 'T'}
                                  {isOwned && (
                                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${darkMode ? 'bg-white' : 'bg-black'} rounded-full`}></span>
                                  )}
                                </div>
                                <div className="max-w-[140px]">
                                  <p className="font-medium text-sm truncate" title={team.name}>
                                    {team.name}
                                  </p>
                                  <p className={`text-xs ${themeClasses.subtext}`}>
                                    {team.members?.length + 1} members
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className={`w-4 h-4 ${themeClasses.subtext}`} />
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="pt-2 pb-1">
                    <button 
                      onClick={handleNewTeam}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm ${themeClasses.text} hover:${themeClasses.accent} rounded-lg transition-colors border ${themeClasses.border}`}
                    >
                      <span>New Team</span>
                      <span className={`w-5 h-5 rounded-full ${themeClasses.accent} flex items-center justify-center`}>+</span>
                    </button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className={`mt-auto border-t ${themeClasses.border} p-3 mx-3`}>
            <div className={`${themeClasses.accent} rounded-lg p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center border ${themeClasses.border} overflow-hidden`}>
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-lg font-bold ${themeClasses.text}`}>{user.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${themeClasses.text} text-sm`}>
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <p className={`text-xs ${themeClasses.subtext}`}>Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className={`p-2 rounded-md hover:${themeClasses.accent} transition-colors`}
                title="Logout"
              >
                <LogOut className={`w-4 h-4 ${themeClasses.subtext}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;