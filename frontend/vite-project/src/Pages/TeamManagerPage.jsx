import React from 'react'
import TeamPage from '../component/Team/TeamPage'
import Sidebar from '../sideNavbar'
import { useState } from 'react'

const TeamManagerPage = () => {
        const [sidebarOpen, setSidebarOpen] = useState(true);
    
  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div 
                className={`${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 fixed lg:relative w-72 min-h-screen h-screen z-30 lbg-black border-r border-gray-800`}
            >
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <TeamPage />
            </div>
        </div>
  )
}

export default TeamManagerPage
