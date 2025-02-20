import React, { useEffect, useState } from "react";
import API from "./api/api.js";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, Calendar, User, Settings, 
  BarChart2, Files, Bell, Users, PlusCircle, Edit2, Trash2, Check, Moon, Sun
} from "lucide-react";
import { Calendar as CalendarIcon, Search, Activity } from 'lucide-react';
import { useProjects } from './context/ProjectContext';
import { useTheme } from './context/themeContext';
import CreateProjectForm from './component/ProjectForm.jsx';
import Projects from './component/Projects.jsx';
import UpcomingTasks from './component/Tasks/UpcomingTasks.jsx';
import CalendarWidget from "./component/CalenderWidget.jsx";

const getThemeClasses = (darkMode) => ({
  background: darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
  sidebar: darkMode ? 'bg-gray-800/95' : 'bg-white/95',
  card: darkMode ? 'bg-gray-800/90' : 'bg-white/90',
  text: darkMode ? 'text-gray-200' : 'text-gray-900',
  subtext: darkMode ? 'text-gray-400' : 'text-gray-600',
  border: darkMode ? 'border-purple-500/20' : 'border-gray-200',
  input: darkMode ? 'bg-gray-700/50' : 'bg-gray-100',
});

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation();
  const { projects, loading, error, fetchProjects } = useProjects();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const themeClasses = getThemeClasses(darkMode);

  // Navigation items
  const navItems = [
    { icon: Home, text: "Dashboard", path: "/" },
    { icon: Calendar, text: "Calendar", path: "/calender" },
    { icon: Files, text: "Projects", path: "/projects" },
    { icon: Users, text: "Team", path: "/team" },
    { icon: BarChart2, text: "Analytics", path: "/analytics" },
    { icon: User, text: "Profile", path: "/profile" },
    { icon: Settings, text: "Settings", path: "/settings" },
  ];

  useEffect(() => {
    API.get("/api/dashboard")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLogout = () => {
    API.post("/api/auth/logout").then(() => (window.location.href = "/"));
  };

  // Analytics data
  const analyticsData = {
    totalProjects: projects?.length || 0,
    completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
    inProgressProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
    projectProgress: 75
  };

  const upcomingTasks = [
    {
      id: 1,
      title: "Project Review",
      deadline: "Tomorrow",
      status: "urgent"
    },
    {
      id: 2,
      title: "Team Meeting",
      deadline: "Today",
      status: "pending"
    },
    // Add more tasks as needed
  ];

  return (
    <div className={`min-h-screen ${themeClasses.background} flex`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-y-0 left-0 z-50 w-64 ${themeClasses.sidebar} border-r ${themeClasses.border} shadow-lg backdrop-blur-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              Project Manager
            </motion.h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6 text-gray-400 hover:text-purple-400 transition-colors" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.li
                    key={item.path}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "text-gray-400 hover:bg-gray-700/50 hover:text-purple-400"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                      <span className="font-medium">{item.text}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          {user && (
            <div className="border-t border-purple-500/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-300">
                    {user.message?.split(",")[0]}
                  </p>
                  <p className="text-sm text-purple-400">Online</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-0"
      }`}>
        {/* Header Section */}
        <header className={`${themeClasses.card} border-b ${themeClasses.border} sticky top-0 z-40 px-6 py-4 backdrop-blur-md shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6 text-gray-400 hover:text-purple-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-200">
                Welcome back, {user?.message?.split(",")[0]}
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className={`${themeClasses.input} text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-transparent focus:border-purple-500 focus:outline-none w-64 transition-all duration-200`}
                />
              </div>
              <button className="relative group">
                <Bell className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-xs text-white flex items-center justify-center"
                >
                  3
                </motion.span>
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700/50 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200/50 text-gray-900 hover:bg-gray-300'
                } transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              <button
                onClick={handleLogout}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-purple-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 space-y-6">
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticCard
              darkMode={darkMode}
              title="Total Projects"
              value={analyticsData.totalProjects}
              icon={Files}
              trend="+5%"
            />
            <AnalyticCard
              darkMode={darkMode}
              title="Completed"
              value={analyticsData.completedProjects}
              icon={Check}
              trend="+12%"
              trendUp={true}
            />
            <AnalyticCard
              darkMode={darkMode}
              title="In Progress"
              value={analyticsData.inProgressProjects}
              icon={Activity}
              trend="-3%"
              trendUp={false}
            />
            <AnalyticCard
              darkMode={darkMode}
              title="Team Members"
              value={12}
              icon={Users}
              trend="+2"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Projects Section (3/4 width) */}
            <div className="lg:col-span-3 space-y-6">
                <Projects darkMode={darkMode} />
             
              
            </div>

            {/* Right Sidebar (1/4 width) - Keep this section unchanged */}
            <div className="lg:col-span-1 space-y-6">
              {/* Calendar Widget */}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${themeClasses.card} rounded-xl border ${themeClasses.border} p-4 backdrop-blur-sm shadow-lg`}
              >
                <CalendarWidget darkMode={darkMode} />
              </motion.div>
                
                
             

              {/* Upcoming Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${themeClasses.card} rounded-xl border ${themeClasses.border} p-4 backdrop-blur-sm shadow-lg`}
              >
                <h3 className={`${themeClasses.text} font-semibold mb-4`}>Upcoming Tasks</h3>
                <UpcomingTasks darkMode={darkMode} tasks={upcomingTasks} />
              </motion.div>
            </div>
          </div>
        </main>
        {showNewProjectModal && (
          <CreateProjectForm onClose={() => setShowNewProjectModal(false)} />
        )}
      </div>
    </div>
  );
};

// Analytics Card Component
const AnalyticCard = ({ title, value, icon: Icon, trend, trendUp, darkMode }) => {
  const themeClasses = getThemeClasses(darkMode);
  
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`${themeClasses.card} rounded-xl border ${themeClasses.border} p-6 
                  backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${themeClasses.subtext} font-medium`}>{title}</h3>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
          <Icon className="w-5 h-5 text-purple-500" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className={`${themeClasses.text} text-2xl font-bold`}>{value}</p>
        <span className={`text-sm px-2 py-1 rounded-full ${
          trendUp 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
};

export default Dashboard;