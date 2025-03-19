import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const ProjectTimelineBar = ({ project: singleProject }) => {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const containerRef = useRef(null);
  
  // State for controlling which month to display
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // State to track container width for responsive sizing
  const [containerWidth, setContainerWidth] = useState(0);
  
  // If single project is provided, use it, otherwise use projects from context
  const allProjects = singleProject ? [singleProject] : 
                     (projects && projects.length > 0 ? 
                      [...projects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) : 
                      []);
  
  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
    });
  };

  // Navigate to previous month
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(scrollContainerRef.current.offsetWidth * 0.75, 200);
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Navigate to next month
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(scrollContainerRef.current.offsetWidth * 0.75, 200);
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Get the days of the current month
  const getDaysOfMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Get projects for a specific day
  const getProjectsForDate = (date) => {
    return allProjects.filter(project => {
      const deadline = new Date(project.deadline);
      return deadline.getDate() === date.getDate() && 
             deadline.getMonth() === date.getMonth() && 
             deadline.getFullYear() === date.getFullYear();
    });
  };
  
  // Handle click on a project
  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Calculate dynamic spacing based on container width
  const getDynamicSpacing = () => {
    if (containerWidth === 0) return 2;
    
    // Adjust day spacing based on available width
    const daysInMonth = getDaysOfMonth().length;
    const minSpacing = 2; // Minimum gap in pixels
    const maxSpacing = 11; // Maximum gap in pixels
    const availableWidth = containerWidth - 20; // Subtract padding
    
    // Target width per day including gap
    const idealDayWidth = 38; // Day width in pixels
    
    // Calculate how much space we have for gaps
    const totalWidthForItems = daysInMonth * idealDayWidth;
    const remainingWidthForGaps = availableWidth - totalWidthForItems;
    
    if (remainingWidthForGaps <= 0) return minSpacing;
    
    // Calculate gap size
    const calculatedGap = Math.min(maxSpacing, Math.max(minSpacing, remainingWidthForGaps / (daysInMonth - 1)));
    
    return calculatedGap;
  };

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width calculation
    updateWidth();
    
    // Add resize listener
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Auto scroll to today on initial render or month change
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Find today's element
      const todayElement = scrollContainerRef.current.querySelector('.today-marker');
      if (todayElement) {
        // Scroll to position today in the center
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const scrollPosition = todayElement.offsetLeft - (containerWidth / 2) + (todayElement.offsetWidth / 2);
        scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [currentMonth, containerWidth]);
  
  // If no projects are available
  if (allProjects.length === 0) {
    return (
      <div className="bg-[#0A0A0A] rounded-lg px-4 py-2 mb-4 relative
                    border border-gray-800/30 shadow-inner shadow-black/60
                    flex items-center justify-center h-12">
        <span className="text-gray-500 text-xs">No project timeline data available</span>
      </div>
    );
  }
  
  const days = getDaysOfMonth();
  const daySpacing = getDynamicSpacing();
  
  return (
    <div 
      ref={containerRef} 
      className="bg-[#0A0A0A] rounded-lg p-3 mb-4 relative
                border border-gray-800/30 shadow-inner shadow-black/60"
    >
      {/* Compact Timeline Header - Responsive */}
      <div className="flex flex-wrap items-center justify-between mb-0 gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          <h3 className="text-white text-sm font-medium">Project Timeline</h3>
        </div>
        
        {/* Month Navigation - Responsive */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
            className="p-1 rounded-full hover:bg-[#1A1A1A] text-gray-500 hover:text-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          
          <span className="text-white text-xs font-medium px-1 whitespace-nowrap">
            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          </span>
          
          <button 
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
            className="p-1 rounded-full hover:bg-[#1A1A1A] text-gray-500 hover:text-white transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
          
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="ml-1 px-2 py-0.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 
                     text-indigo-300 rounded-md transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      
      {/* Timeline Navigation - Fixed at each end */}
      <div className="flex items-center justify-between mb-1">
        <button 
          onClick={scrollLeft}
          className="p-0.5 rounded-full bg-[#161616] hover:bg-[#202020] text-gray-500 hover:text-white z-10 
                   transition-colors border border-gray-800/50"
          aria-label="Scroll left"
        >
          <ChevronLeft size={14} />
        </button>
        
        <button 
          onClick={scrollRight}
          className="p-0.5 rounded-full bg-[#161616] hover:bg-[#202020] text-gray-500 hover:text-white z-10 
                   transition-colors border border-gray-800/50"
          aria-label="Scroll right"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      
      {/* Compact Flat Timeline - Responsive */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-1 hide-scrollbar relative h-[68px]"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Timeline Track - Responsive */}
        <div className="h-0.5 bg-gray-800/80 absolute left-0 right-4 top-[28px] rounded-full"></div>
        
        {/* Days - Responsive spacing */}
        <div 
          className="flex min-w-max pt-1 pr-4" 
          style={{ gap: `${daySpacing}px` }}
        >
          {days.map((date, index) => {
            const dateProjects = getProjectsForDate(date);
            const hasProjects = dateProjects.length > 0;
            const _isToday = isToday(date);
            
            // Determine if this day should show full date (1st day, today, or start of month)
            const showFullDate = date.getDate() === 1 || index === 0 || _isToday;
            // Determine date display format
            const dateDisplay = showFullDate ? 
              (date.getDate() === 1 ? 
                date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).split(' ')[0] :
                formatDate(date)) : 
              date.getDate();
            
            return (
              <div 
                key={`day-${index}`}
                className={`flex flex-col items-center min-w-[32px] sm:min-w-[38px] ${index === days.length - 1 ? 'pr-0' : ''}`}
              >
                {/* Date Display - Responsive font size */}
                <div className={`text-[9px] sm:text-[10px] font-medium mb-1 
                              ${_isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
                  {dateDisplay}
                </div>
                
                {/* Date Marker */}
                <div 
                  className={`w-1.5 h-1.5 rounded-full z-10 relative ${_isToday ? 'today-marker' : ''}
                            ${_isToday ? 'bg-indigo-500 ring-2 ring-indigo-500/20' : 
                             hasProjects ? 'bg-white/80' : 'bg-gray-700'}`}
                />
                
                {/* Projects for this day - Responsive positioning */}
                {hasProjects && (
                  <div className="absolute top-[33px] flex flex-row gap-1 items-center justify-center">
                    {dateProjects.slice(0, 3).map((project, idx) => {
                      const daysRemaining = getDaysRemaining(project.deadline);
                      
                      return (
                        <motion.div
                          key={project._id}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          onClick={() => handleProjectClick(project._id)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 group rounded-full cursor-pointer 
                                    flex flex-col items-center justify-center
                                    border border-gray-800 shadow-sm shadow-black/60
                                    hover:shadow-md hover:shadow-black/40 transition-all
                                    ${daysRemaining < 0 
                                      ? 'bg-[#170A0A] hover:bg-[#1F0D0D] ring-1 ring-red-500/20' 
                                      : daysRemaining < 3 
                                      ? 'bg-[#171207] hover:bg-[#1E1507] ring-1 ring-amber-500/20' 
                                      : 'bg-[#0D0F1C] hover:bg-[#111528] ring-1 ring-indigo-500/20'}`}
                          title={`${project.name} (${project.progress}% complete)`}
                          aria-label={`Project ${project.name}, ${project.progress}% complete. Click to view details.`}
                        >
                          {/* Project Icon with Progress Ring - Responsive sizing */}
                          <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 32 32">
                              {/* Background circle */}
                              <circle 
                                cx="16" 
                                cy="16" 
                                r="15" 
                                fill="none"
                                stroke="#1A1A1A" 
                                strokeWidth="2"
                              />
                              {/* Progress circle */}
                              <circle 
                                cx="16" 
                                cy="16" 
                                r="15" 
                                fill="none" 
                                stroke={daysRemaining < 0 ? '#ef44444d' : daysRemaining < 3 ? '#f973164d' : '#6366f14d'}
                                strokeWidth="2" 
                                strokeDasharray={`${2 * Math.PI * 15 * (project.progress / 100)} ${2 * Math.PI * 15}`}
                                strokeLinecap="round"
                                transform="rotate(-90 16 16)" 
                              />
                              {/* Highlight stroke */}
                              <circle 
                                cx="16" 
                                cy="16" 
                                r="15" 
                                fill="none" 
                                stroke={daysRemaining < 0 ? '#ef4444' : daysRemaining < 3 ? '#f97316' : '#6366f1'}
                                strokeWidth="1" 
                                strokeDasharray={`${2 * Math.PI * 15 * (project.progress / 100)} ${2 * Math.PI * 15}`}
                                strokeLinecap="round"
                                transform="rotate(-90 16 16)" 
                              />
                            </svg>
                            
                            {project.image ? (
                              <img 
                                src={project.image} 
                                alt={project.name} 
                                className="w-3 h-3 sm:w-4 sm:h-4 absolute inset-0 m-auto rounded-full object-cover
                                         border border-gray-800/80"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center 
                                             text-[10px] sm:text-xs font-medium text-white/80">
                                {project.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {/* Show indicator for additional projects - Responsive sizing */}
                    {dateProjects.length > 3 && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#151515] flex items-center justify-center
                                   text-[8px] sm:text-[9px] text-gray-400 border border-gray-800
                                   shadow-sm shadow-black/60">
                        +{dateProjects.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Add this to hide scrollbars but keep functionality
const style = document.createElement('style');
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default ProjectTimelineBar;