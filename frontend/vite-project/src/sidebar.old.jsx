import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, User, Settings, BarChart2, 
  Files, Users, X, ChevronRight, LogOut, Zap, Cable 
} from 'lucide-react';

import { useTheme } from './context/themeContext';
import { useAuth } from './context/authContext';
import { useTeam } from './context/teamContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('main'); // 'main' or 'teams'
  const { getMyTeams } = useTeam();
  

  // Navigation items
  const navItems = [
    { icon: Home, text: "Dashboard", path: "/dashboard", section: 'main' },
    { icon: Calendar, text: "Calendar", path: "/calender", section: 'main' },
    { icon: Files, text: "Projects", path: "/projects", section: 'main' },
    { icon: Users, text: "Team", path: "/team", section: 'main' },
    { icon: BarChart2, text: "TeamBuilder", path: "/teamBuilder", section: 'main' },
    { icon: User, text: "Profile", path: "/profile", section: 'main' },
    { icon: Settings, text: "Settings", path: "/settings", section: 'main' },
    { icon:Cable , text: "LinkUps", path: "/linkups", section: 'main' },
  ];

  // Mock team items for navigation
  const teamItems = [
    { id: 1, name: "Design Team", path: "/team/design", memberCount: 5, color: "from-pink-500 to-purple-500" },
    { id: 2, name: "Development", path: "/team/dev", memberCount: 8, color: "from-blue-500 to-indigo-500" },
    { id: 3, name: "Marketing", path: "/team/marketing", memberCount: 4, color: "from-green-500 to-emerald-500" },
  ];

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
        <div className="px-3">
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
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Teams</p>
                  <button className="p-1 rounded-md hover:bg-gray-800/30">
                    <Zap className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <nav className="overflow-y-auto">
                  <ul className="space-y-1">
                    {teamItems.map((team) => {
                      const isActive = location.pathname === team.path;
                      return (
                        <motion.li
                          key={team.id}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Link
                            to={team.path}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${
                              isActive
                                ? themeClasses.navActive
                                : themeClasses.navInactive
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${team.color} flex items-center justify-center text-xs font-bold text-white`}>
                                {team.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{team.name}</p>
                                <p className="text-xs text-gray-500">{team.memberCount} members</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </Link>
                        </motion.li>
                      );
                    })}
                    <li className="pt-1">
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <span>New Team</span>
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">+</span>
                      </button>
                    </li>
                  </ul>
                </nav>
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