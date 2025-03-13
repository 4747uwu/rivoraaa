import React, { useState } from 'react';
import InvitationHandler from '../component/Invite/InvitationHandler';
import Sidebar from '../sideNavbar';
import Header from '../Header';

const Invitations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode] = useState(true); // Set to true for dark mode by default

  const getThemeClasses = (darkMode) => ({
    background: darkMode 
      ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
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

  const themeClasses = getThemeClasses(darkMode);

  return (
    <div className={`flex h-screen overflow-hidden ${themeClasses.background}`}>
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        className={themeClasses.sidebar}
      />

      {/* Main content area */}
      <div className={`flex flex-col flex-1   duration-300 ease-in-out
        `}>
        {/* Header */} 
          <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          themeClasses={themeClasses}
        />
      

        {/* Main content wrapper */}
        <div className={`relative flex-1 overflow-y-auto overflow-x-hidden mt-2
        ${sidebarOpen ? 'lg:ml-64' : ''}
        `}>
            
          <main className="p-0">
            <InvitationHandler />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Invitations;