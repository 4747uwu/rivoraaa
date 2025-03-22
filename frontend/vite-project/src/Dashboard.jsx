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
import ProjectTimelineBar from "./component/ProjectTimeline.jsx";

// Add this new component near your other components
const ProgressRing = ({ progress, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-white transition-all duration-1000 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm font-medium text-white">
        {progress}%
      </span>
    </div>
  );
};

// Update the getThemeClasses function
const getThemeClasses = (darkMode) => ({
  background: darkMode 
    ? 'bg-gradient-to-br from-black via-[#111] to-black' 
    : 'bg-gradient-to-br from-gray-100 via-white to-gray-50',
  sidebar: darkMode 
    ? 'bg-black/95 backdrop-blur-lg border-r border-white/10' 
    : 'bg-white/95',
  card: darkMode 
    ? 'bg-[#111]/80 hover:bg-[#111]/95 border border-white/10 backdrop-blur-md' 
    : 'bg-white/90',
  text: darkMode ? 'text-gray-100' : 'text-gray-900',
  subtext: darkMode ? 'text-gray-400' : 'text-gray-600',
  border: darkMode ? 'border-white/10' : 'border-gray-200',
  input: darkMode ? 'bg-black/50 focus:bg-black/70 border-white/10' : 'bg-gray-100',
  shadow: darkMode ? 'shadow-lg shadow-black/20' : 'shadow-md',
  highlight: darkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black',
  button: darkMode 
    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
    : 'bg-black hover:bg-gray-900 text-white',
  navActive: darkMode 
    ? 'bg-white/10 text-white border border-white/20' 
    : 'bg-black text-white border border-black',
  navInactive: darkMode 
    ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
    : 'text-gray-600 hover:bg-black/5 hover:text-black',
  cardHover: darkMode ? 'hover:border-white/20 hover:shadow-white/5' : 'hover:border-black/20',
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
        {/* <ProgressRing progress={analyticsData.projectProgress} size={60} strokeWidth={4} /> */}
        
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          themeClasses={themeClasses} 
        />

        <main className="p-5 pt-2 space-y-4 sm:space-y-6">
          {/* Two-row grid layout */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* First Row: Two-column layout for user profile and quotes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* User Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${themeClasses.card} rounded-xl border ${themeClasses.border} overflow-hidden backdrop-blur-sm shadow-lg`}
              >
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left: User Info Section */}
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-500/30 shadow-lg">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover scale-150 object-center"
                        />
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    
                    {/* User Info with Animated Greeting */}
                    <div className="">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-100">
                        <div className="flex items-baseline gap-2">
                          <div className="inline-block flex flex-col">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={Math.random()}
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
                      <p className="text-xs sm:text-sm text-indigo-400 flex items-center gap-1">
                        LinkUps- <div>
                          <span className="text-gray-100 font-bold">{user.connections.linkUps.length || 0}</span>
                        </div>
                      </p>
                    </div>
                  </div>

                  {/* Center: Recent Trend - Only display on larger screens */}
                  <div className="hidden md:flex flex-col items-center">
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
                          className="w-2 sm:w-3 rounded-t bg-gradient-to-t from-indigo-500/60 to-purple-500/60"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right: Stats Grid */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    {/* Total Projects */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-indigo-500/10 rounded-lg p-1 sm:p-2 border border-indigo-500/20"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm sm:text-base font-bold text-gray-200">{projects?.length || 0}</h4>
                        <p className="text-[10px] sm:text-xs text-gray-400">Total</p>
                      </div>
                    </motion.div>
                    
                    {/* Other stat cards... */}
                    {/* Completed */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-500/10 rounded-lg p-1 sm:p-2 border border-green-500/20"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm sm:text-base font-bold text-gray-200">
                          {projects?.filter(p => p.status === 'completed').length || 0}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-400">Complete</p>
                      </div>
                    </motion.div>
                    
                    {/* In Progress */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-blue-500/10 rounded-lg p-1 sm:p-2 border border-blue-500/20"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm sm:text-base font-bold text-gray-200">
                          {projects?.filter(p => p.status === 'in_progress').length || 0}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-400">Active</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Quotes Widget Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${themeClasses.card} h-auto sm:h-[120px] lg:h-auto xl:h-[120px] rounded-xl border ${themeClasses.border} overflow-hidden backdrop-blur-sm shadow-lg flex items-center justify-between p-0`}
              >
                <QuotesWidget/>
              </motion.div>
            </div>

            {/* Second Row: Full width timeline component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full  rounded-xl" 
            >
              <div className={`${themeClasses.card} border ${themeClasses.border} rounded-xl  backdrop-blur-sm shadow-lg`}>
                <ProjectTimelineBar />
              </div>
            </motion.div>
          </div>

          {/* Rest of your dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Projects Section (3/4 width) */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              <Projects darkMode={darkMode} />
            </div>

            {/* Right Sidebar (1/4 width) */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Calendar Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${themeClasses.card} rounded-xl border ${themeClasses.border} p-4 backdrop-blur-sm shadow-lg`}
              >
                <CalendarWidget darkMode={darkMode} />
              </motion.div>

              {/* Upcoming Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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