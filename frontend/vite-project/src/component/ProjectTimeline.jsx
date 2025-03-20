import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // State for current hover info
  const [hoverInfo, setHoverInfo] = useState(null);
  
  // If single project is provided, use it, otherwise use projects from context
  const allProjects = singleProject ? [singleProject] : 
                    (projects && projects.length > 0 ? 
                      [...projects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) : 
                      []);
  
  // Calculate days remaining and progress
  const getProjectTimeInfo = (project) => {
    const today = new Date();
    const startDate = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const dueDate = new Date(project.deadline);
    
    // Calculate days remaining
    const diffTimeRemaining = dueDate - today;
    const daysRemaining = Math.ceil(diffTimeRemaining / (1000 * 60 * 60 * 24));
    
    // Calculate total project duration
    const totalDuration = dueDate - startDate;
    const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
    
    // Calculate elapsed time (progress from start to now)
    const elapsedTime = today - startDate;
    const daysElapsed = Math.ceil(elapsedTime / (1000 * 60 * 60 * 24));
    
    // Calculate time progress percentage (how much time has elapsed relative to total duration)
    let timeProgressPercent = Math.round((daysElapsed / totalDays) * 100);
    // Ensure values between 0-100
    timeProgressPercent = Math.max(0, Math.min(100, timeProgressPercent));
    
    return {
      daysRemaining,
      daysElapsed,
      totalDays,
      timeProgressPercent,
      isOverdue: daysRemaining < 0,
      isNearDeadline: daysRemaining >= 0 && daysRemaining < 3,
      startDate,
      dueDate
    };
  };
  
  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date for tooltip
  const formatDateFull = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
  const handleProjectClick = (projectId, e) => {
    e.stopPropagation();
    navigate(`/project/${projectId}`);
  };

  // Update the hoverInfo state to include the mouse position or element reference
  const handleProjectMouseEnter = (project, idx, timeInfo, labelText, event) => {
    // Get the position of the hovered element
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate the relative position within the container
    const relativeLeft = rect.left - containerRect.left + (rect.width / 2);
    
    setHoverInfo({ 
      project, 
      position: idx, 
      timeInfo,
      labelText,
      xPos: relativeLeft // Store the x position relative to the container
    });
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
      <div className="bg-gradient-to-b from-[#0A0A0A] to-[#0C0C0C] rounded-lg px-4 py-3 mb-4 relative
                    border border-gray-800/30 shadow-lg
                    flex items-center justify-center h-16">
        <div className="flex flex-col items-center gap-1">
          <CalendarIcon size={16} className="text-gray-500" />
          <span className="text-gray-400 text-xs">No timeline data available</span>
        </div>
      </div>
    );
  }
  
  const days = getDaysOfMonth();
  const daySpacing = getDynamicSpacing();
  
  return (
    <div 
      ref={containerRef} 
      className="bg-gradient-to-b from-[#0A0A0A] to-[#0C0C0C] rounded-lg p-3 mb-4 relative
                border border-gray-800/30 shadow-lg"
    >
      {/* Header with glass morphism effect */}
      <div className="flex flex-wrap items-center justify-between mb-1 px-1 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Calendar size={14} className="text-indigo-400" />
          </div>
          <h3 className="text-white text-sm font-medium">Project Timeline</h3>
        </div>
        
        {/* Month Navigation with glass effect */}
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/5 px-1">
          <button 
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          
          <span className="text-white text-xs font-medium px-1.5 py-1">
            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          </span>
          
          <button 
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
          
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="ml-1 px-2 py-0.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 
                     text-indigo-300 rounded-md transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      
      {/* Timeline scroll container */}
      <div className="relative">
        {/* Timeline scroll shadow indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
        
        {/* Timeline Navigation Buttons */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20
                   p-1 rounded-full bg-[#161616]/80 hover:bg-[#202020] text-gray-500 hover:text-white 
                   transition-colors border border-gray-800/50 backdrop-blur-sm shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
        
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20
                   p-1 rounded-full bg-[#161616]/80 hover:bg-[#202020] text-gray-500 hover:text-white
                   transition-colors border border-gray-800/50 backdrop-blur-sm shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
        
        {/* Timeline Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 hide-scrollbar relative h-[85px]"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Timeline Track */}
          <div className="h-0.5 bg-gradient-to-r from-indigo-900/20 via-gray-800/80 to-indigo-900/20 absolute left-0 right-4 top-[28px] rounded-full"></div>
          
          {/* Days with improved styling */}
          <div 
            className="flex min-w-max pt-1 pr-4" 
            style={{ gap: `${daySpacing}px` }}
          >
            {days.map((date, index) => {
              const dateProjects = getProjectsForDate(date);
              const hasProjects = dateProjects.length > 0;
              const _isToday = isToday(date);
              
              // Determine if this day should show full date
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
                  {/* Date Display with improved typography */}
                  <div className={`text-[9px] sm:text-[10px] font-medium mb-1 
                                ${_isToday ? 'text-indigo-400' : (date.getDay() === 0 || date.getDay() === 6) ? 'text-gray-600' : 'text-gray-500'}`}>
                    {dateDisplay}
                  </div>
                  
                  {/* Date Marker with enhanced styling */}
                  <div 
                    className={`w-1.5 h-1.5 rounded-full z-10 relative ${_isToday ? 'today-marker' : ''}
                              ${_isToday 
                                ? 'bg-indigo-500 ring-2 ring-indigo-500/30 shadow-sm shadow-indigo-500/30' 
                                : hasProjects 
                                  ? 'bg-white/80 ring-1 ring-white/10' 
                                  : (date.getDay() === 0 || date.getDay() === 6) 
                                    ? 'bg-gray-800/50' 
                                    : 'bg-gray-700/70'}`}
                  />
                  
                  {/* Projects for this day with enhanced styling */}
                  {hasProjects && (
                    <div className="absolute top-[33px] flex flex-row gap-1 items-center justify-center">
                      {dateProjects.slice(0, 3).map((project, idx) => {
                        const timeInfo = getProjectTimeInfo(project);
                        
                        // Determine the color theme based on project status
                        let colorTheme = "";
                        let progressRingColor = "";
                        let labelText = "";
                        
                        if (timeInfo.isOverdue) {
                          colorTheme = "from-red-950/80 to-red-900/50 border-red-800/30 hover:border-red-700/50";
                          progressRingColor = "stroke-red-500";
                          labelText = "Overdue";
                        } else if (timeInfo.isNearDeadline) {
                          colorTheme = "from-amber-950/80 to-amber-900/50 border-amber-800/30 hover:border-amber-700/50";
                          progressRingColor = "stroke-amber-500";
                          labelText = "Due Soon";
                        } else {
                          colorTheme = "from-indigo-950/80 to-indigo-900/50 border-indigo-800/30 hover:border-indigo-700/50";
                          progressRingColor = "stroke-indigo-500";
                          labelText = `${timeInfo.daysRemaining} days left`;
                        }
                        
                        return (
                          <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            onClick={(e) => handleProjectClick(project._id, e)}
                            onMouseEnter={(e) => handleProjectMouseEnter(project, idx, timeInfo, labelText, e)}
                            onMouseLeave={() => setHoverInfo(null)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 group rounded-full cursor-pointer 
                                      flex flex-col items-center justify-center
                                      border shadow-lg transition-all
                                      bg-gradient-to-b hover:shadow-xl ${colorTheme}`}
                            title={`${project.name} - ${labelText}`}
                            aria-label={`Project ${project.name}, ${project.progress}% complete. ${labelText}. Click to view details.`}
                          >
                            {/* Project Icon with Progress Rings */}
                            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                              {/* Task completion progress */}
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                {/* Background circle */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="16" 
                                  fill="none"
                                  stroke="#2A2A2A" 
                                  strokeWidth="2"
                                />
                                {/* Task progress circle */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="16" 
                                  fill="none" 
                                  className={`${progressRingColor}/30`}
                                  strokeWidth="2.5" 
                                  strokeDasharray={`${2 * Math.PI * 16 * (project.progress / 100)} ${2 * Math.PI * 16}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 18 18)" 
                                />
                                {/* Time progress circle (smaller, inner ring) */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="13" 
                                  fill="none" 
                                  className={`${progressRingColor}/70`}
                                  strokeWidth="1.5" 
                                  strokeDasharray={`${2 * Math.PI * 13 * (timeInfo.timeProgressPercent / 100)} ${2 * Math.PI * 13}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 18 18)" 
                                />
                              </svg>
                              
                              {project.image ? (
                                <img 
                                  src={project.image} 
                                  alt={project.name} 
                                  className="w-5 h-5 sm:w-6 sm:h-6 absolute inset-0 m-auto rounded-full object-cover
                                         border border-gray-800/80 shadow-inner shadow-black/50 group-hover:scale-110 transition-transform"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white/90 group-hover:scale-110 transition-transform">
                                    {project.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {/* Indicator for additional projects */}
                      {dateProjects.length > 3 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-b from-gray-800 to-gray-900/80 
                                   flex items-center justify-center
                                   text-[8px] sm:text-[9px] text-gray-300 border border-gray-700/50
                                   shadow-lg hover:shadow-xl cursor-pointer hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Could show a modal with all projects for this date
                          }}
                        >
                          +{dateProjects.length - 3}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Project Hover Info - Enhanced floating card */}
      <AnimatePresence>
        {hoverInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-[95px] z-30
                     bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800
                     p-3 shadow-xl min-w-[220px] max-w-[280px]"
            style={{
              // Position directly above the hovered element using absolute positioning
              left: `${hoverInfo.xPos-128}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 
                          w-2 h-2 bg-gray-900 border-r border-b border-gray-800 rotate-45"></div>
                          
            <div className="flex items-start gap-3">
              {/* Project image/icon */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-indigo-900/30">
                {hoverInfo.project.image ? (
                  <img 
                    src={hoverInfo.project.image} 
                    alt={hoverInfo.project.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                    <span className="text-lg font-semibold text-white">{hoverInfo.project.name.charAt(0)}</span>
                  </div>
                )}
                
                {/* Status indicator */}
                <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border border-black
                            ${hoverInfo.timeInfo.isOverdue ? 'bg-red-500' : 
                              hoverInfo.timeInfo.isNearDeadline ? 'bg-amber-500' : 'bg-green-500'}`}></div>
              </div>
              
              {/* Project details */}
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm line-clamp-1">{hoverInfo.project.name}</h4>
                
                {/* Progress bars */}
                <div className="mt-2 space-y-2">
                  {/* Task completion progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400">Task Completion</span>
                      <span className="text-[10px] font-medium text-white">{hoverInfo.project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          hoverInfo.timeInfo.isOverdue ? 'bg-red-600' : 
                          hoverInfo.timeInfo.isNearDeadline ? 'bg-amber-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${hoverInfo.project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Time progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400">Time Elapsed</span>
                      <span className="text-[10px] font-medium text-white">{hoverInfo.timeInfo.timeProgressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          hoverInfo.timeInfo.isOverdue ? 'bg-red-600/60' : 
                          hoverInfo.timeInfo.isNearDeadline ? 'bg-amber-600/60' : 'bg-indigo-600/60'
                        }`}
                        style={{ width: `${hoverInfo.timeInfo.timeProgressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="mt-3 flex items-center text-[10px] gap-1.5">
                  <span className="text-gray-400">
                    {formatDateFull(hoverInfo.timeInfo.startDate)}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={`font-medium ${
                    hoverInfo.timeInfo.isOverdue ? 'text-red-400' : 
                    hoverInfo.timeInfo.isNearDeadline ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    {formatDateFull(hoverInfo.timeInfo.dueDate)}
                  </span>
                </div>
                
                {/* Status text */}
                <div className={`mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block
                              ${hoverInfo.timeInfo.isOverdue ? 'bg-red-500/20 text-red-400' : 
                                hoverInfo.timeInfo.isNearDeadline ? 'bg-amber-500/20 text-amber-400' : 
                                'bg-indigo-500/20 text-indigo-400'}`}>
                  {hoverInfo.labelText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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