import React, { useEffect, useState } from "react";
import API from "./api/api.js";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, Calendar, User, Settings, 
  BarChart2, Files, Bell, Users, PlusCircle, Edit2, Trash2, Check, Moon, Sun,
  Award, FileText, Clock, Zap, ArrowUp, ArrowDown, TrendingUp, ChevronRight
} from "lucide-react";
import { Calendar as CalendarIcon, Search, Activity } from 'lucide-react';
import { useProjects } from './context/ProjectContext';
import { useTheme } from './context/themeContext';
import CreateProjectForm from './component/ProjectForm.jsx';
import Projects from './component/Projects.jsx';
import UpcomingTasks from './component/Tasks/UpcomingTasks.jsx';
import CalendarWidget from "./component/CalenderWidget.jsx";
import { useAuth } from "./context/authContext.jsx";
import AnimatedGreeting from "./AnimatedGreeting.jsx";
import Sidebar from "./sideNavbar.jsx";
import Header from "./Header.jsx";
import QuotesWidget from "./yayaComponent.jsx";

// Enhanced getThemeClasses function with improved dark mode styling
const getThemeClasses = (darkMode) => ({
  background: darkMode 
    ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]' 
    : 'bg-gradient-to-br from-gray-600 via-white to-gray-50',
  sidebar: darkMode 
    ? 'bg-[#0F172A]/95 backdrop-blur-lg border-r border-indigo-500/20' 
    : 'bg-white/95',
  card: darkMode 
    ? 'bg-[#1E293B]/80 hover:bg-[#1E293B]/95 border border-indigo-500/20 backdrop-blur-md' 
    : 'bg-white/90',
  text: darkMode ? 'text-gray-100' : 'text-gray-900',
  subtext: darkMode ? 'text-gray-400' : 'text-gray-600',
  border: darkMode ? 'border-indigo-500/20' : 'border-gray-200',
  input: darkMode ? 'bg-[#1E293B]/80 focus:bg-[#1E293B] border-indigo-500/20' : 'bg-gray-100',
  shadow: darkMode ? 'shadow-lg shadow-indigo-500/10' : 'shadow-md',
  highlight: darkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
  button: darkMode 
    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30' 
    : 'bg-indigo-500 hover:bg-indigo-600 text-white',
  navActive: darkMode 
    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
    : 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  navInactive: darkMode 
    ? 'text-gray-400 hover:bg-[#1E293B]/80 hover:text-indigo-300' 
    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700',
  cardHover: darkMode ? 'hover:border-indigo-500/40 hover:shadow-indigo-500/20' : 'hover:border-indigo-200',
});

const Dashboard = () => {
  // const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation();
  const { projects, loading, error, fetchProjects } = useProjects();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const themeClasses = getThemeClasses(darkMode);
  const{user} = useAuth();
  console.log(user);

  

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

  // useEffect(() => {
  //   API.get("/api/dashboard")
  //     .then((res) => setUser(res.data))
  //     .catch(() => setUser(null));
  // }, []);

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
    <div className={`min-h-screen ${themeClasses.background} flex px-4`}>
      {/* Sidebar */}
      <motion.div>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? "ml-72" : "ml-0"
      }`}>
        {/* Header Section */}
        {/* <header className={`${themeClasses.card} border-b ${themeClasses.border} sticky top-0 z-40 px-6 py-4 backdrop-blur-md shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6 text-gray-400 hover:text-purple-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-200">
                Welcome back, {user?.name}
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
        </header> */}

        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          themeClasses={themeClasses} 
        />

        {/* Main Content Area */}
        <main className="p-5 pt-2 space-y-4">
          {/* ===== NEW USER PROFILE & ANALYTICS SECTION ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* User Profile Compact Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${themeClasses.card} rounded-xl border ${themeClasses.border} overflow-hidden backdrop-blur-sm shadow-lg`}
            >
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left: User Info Section */}
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-500/30 shadow-lg">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover scale-150 object-center"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  
                  {/* User Info with Animated Greeting */}
                <div className="">
                  <h3 className="text-xl font-bold text-gray-100">
                    <div className="flex flex- items-baseline gap-2">
                      <div className="inline-block flex flex-col">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={Math.random()} // Force re-render for animation
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block"
                          >
                            <AnimatedGreeting />
                          </motion.span>
                        </AnimatePresence>
                         <span className="text-gray-100">{user?.name || 'User'}!</span>
                      </div>
                     
                    </div>
                  </h3>
                  <p className="text-sm text-indigo-400 flex items-center gap-1">
                    {/* <span className="w-2 h-2 rounded-full bg-green-500"></span> */}
                    LinkUps- <div>
                      <span className="text-gray-100 font-bold">{ user.connections.linkUps.length || 0}</span>
                      </div>
                  </p>
                </div>
              </div>

                {/* Center: Recent Trend */}
                <div className="flex flex-col sticky fixed  items-center">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300 mr-2">Recent Trend</h4>
                    <div className="flex items-center text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <ArrowUp className="w-3 h-3 mr-1" /> 8%
                    </div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="h-10 flex items-end gap-1">
                    {[35, 45, 30, 50, 65, 45, 70].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="w-3 rounded-t bg-gradient-to-t from-indigo-500/60 to-purple-500/60"
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Total Projects */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-indigo-500/10 rounded-lg p-2 border border-indigo-500/20"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-base font-bold text-gray-200">{projects?.length || 0}</h4>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </motion.div>
                  
                  {/* Completed */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-green-500/10 rounded-lg p-2 border border-green-500/20"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-base font-bold text-gray-200">
                        {projects?.filter(p => p.status === 'completed').length || 0}
                      </h4>
                      <p className="text-xs text-gray-400">Complete</p>
                    </div>
                  </motion.div>
                  
                  {/* In Progress */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-base font-bold text-gray-200">
                        {projects?.filter(p => p.status === 'in_progress').length || 0}
                      </h4>
                      <p className="text-xs text-gray-400">Active</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              
            </motion.div>

            {/* Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${themeClasses.card} h-[120px] rounded-xl border ${themeClasses.border} overflow-hidden backdrop-blur-sm shadow-lg flex items-center justify-between p-0`}
            >
              <QuotesWidget/>
              
           
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Projects Section (3/4 width) */}
            <div className="lg:col-span-3 space-y-6">
                <Projects darkMode={darkMode} />
            </div>

            {/* Right Sidebar (1/4 width) */}
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

// No longer need the AnalyticCard component since we replaced it

export default Dashboard;