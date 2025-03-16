import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, User, Settings, BarChart2, 
  Files, Users, X, ChevronRight, LogOut, Zap, Cable, Loader, Bell 
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
  }, []);

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

  // Define color gradients for teams
  const teamColors = [
    "from-pink-500 to-purple-500",
    "from-blue-500 to-indigo-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
    "from-orange-500 to-amber-500"
  ];

  // Get teams from both owned and member teams
  const ownedTeams = teamsData?.ownedTeams?.data || [];
  const memberTeams = teamsData?.memberTeams?.data || [];
  
  // Combine owned and member teams
  const allTeams = [...ownedTeams, ...memberTeams];

  const themeClasses = {
    sidebar: darkMode 
      ? 'bg-[#0F172A]/95 backdrop-blur-lg border-r border-indigo-500/20' 
      : 'bg-white/95',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    subtext: darkMode ? 'text-gray-400' : 'text-gray-600',
    border: darkMode ? 'border-indigo-500/20' : 'border-gray-200',
    navActive: darkMode 
      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
      : 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    navInactive: darkMode 
      ? 'text-gray-400 hover:bg-[#1E293B]/80 hover:text-indigo-300' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700',
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
        {/* Logo/Header with animated gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-80 rounded-br-xl"></div>
          <div className="flex items-center justify-between p-5 relative z-10">
            <div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
              >
                Project Manager
              </motion.h2>
              <p className="text-xs text-gray-400 mt-1">Workspace</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden rounded-full p-1.5 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Toggle between main and team navigation */}
        <div className="flex items-center gap-1 px-3 py-2 mx-3 my-2">
          <button
            onClick={() => setActiveSection('main')}
            className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeSection === 'main' 
                ? 'bg-indigo-500/20 text-indigo-300' 
                : 'hover:bg-gray-800/20 text-gray-400'
            }`}
          >
            Main
          </button>
          <button
            onClick={() => setActiveSection('teams')}
            className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeSection === 'teams' 
                ? 'bg-indigo-500/20 text-indigo-300' 
                : 'hover:bg-gray-800/20 text-gray-400'
            }`}
          >
            Teams
          </button>
        </div>

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
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</p>
                </div>
                <nav className="overflow-y-auto">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
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
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              isActive
                                ? themeClasses.navActive
                                : themeClasses.navInactive
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`rounded-md p-1.5 ${isActive ? 'bg-indigo-500/30' : 'bg-gray-800/20'}`}>
                                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-300" : "text-gray-400"}`} />
                              </div>
                              <span className="font-medium text-sm">{item.text}</span>
                            </div>
                            {isActive && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
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
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Teams</p>
                  {!loadingTeams && (
                    <div className="text-xs text-gray-500">
                      {allTeams.length} {allTeams.length === 1 ? 'team' : 'teams'}
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
                        <Loader size={20} className="text-indigo-400" />
                      </motion.div>
                    </div>
                  ) : error ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-red-400">Failed to load teams</p>
                      <button 
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </button>
                    </div>
                  ) : allTeams.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-400">No teams yet</p>
                      <p className="mt-1 text-xs text-gray-500">Create one to get started</p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {allTeams.map((team, index) => {
                        const teamPath = `/teams/${team._id}`;
                        const isActive = location.pathname === teamPath;
                        const colorIndex = index % teamColors.length;
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
                                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${teamColors[colorIndex]} flex items-center justify-center text-xs font-bold text-white relative`}>
                                  {team.name?.charAt(0) || 'T'}
                                  {isOwned && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border border-indigo-700 rounded-full"></span>
                                  )}
                                </div>
                                <div className="max-w-[140px]">
                                  <p className="font-medium text-sm truncate" title={team.name}>
                                    {team.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {team.members?.length + 1} members
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="pt-2 pb-1 bgf">
                  <button 
                    onClick={handleNewTeam}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  >
                    <span>New Team</span>
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">+</span>
                  </button>
                </div>
                </nav>
                
                {/* Create new team button */}
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="mt-auto border-t border-purple-500/20 p-3 mx-3">
            <div className="bg-indigo-500/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border border-purple-500/30">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">{user.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-200 text-sm">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-md hover:bg-gray-800/30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;