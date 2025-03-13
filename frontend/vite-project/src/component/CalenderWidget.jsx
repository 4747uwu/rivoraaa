import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, AlertCircle, ChevronLeft, ChevronRight, Clock, MapPin, X, Loader, Edit2, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarWidget = ({ darkMode = true, glassCard, textClass, subTextClass }) => {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Event management states
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    summary: '',
    description: '',
    start: '',
    end: '',
    location: '',
  });

  const backendUrl = import.meta.env.VITE_API_URL;

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const fetchCalendars = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/calendars`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setCalendars(data.calendars);
        return data.calendars[0]?.id; // Return primary calendar ID
      }
      console.error('Raw Response:', data);
      throw new Error(data.message);
    } catch (err) {
      setError('Failed to fetch calendars');
      return null;
    }
  };

  const fetchEvents = async (calendarId) => {
    if (!calendarId) return;
    const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
    try {
      const response = await fetch(
        `${backendUrl}/api/events?calendarId=${calendarId}&timeMin=${timeMin}&timeMax=${timeMax}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
        setSyncStatus('synced');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch events');
      setSyncStatus('error');
    }
  };

  const syncCalendar = async () => {
    setSyncStatus('syncing');
    setError(null);
    const primaryCalendarId = await fetchCalendars();
    if (primaryCalendarId) {
      await fetchEvents(primaryCalendarId);
    } else {
      setSyncStatus('error');
    }
  };

  // Create a new event
  const createEvent = async (e) => {
    e.preventDefault();
    
    if (calendars.length === 0) {
      setError("No calendar available");
      return;
    }
    
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const calendarId = calendars[0].id;
      
      // Format dates for the API
      const formattedStart = new Date(eventForm.start).toISOString();
      const formattedEnd = new Date(eventForm.end).toISOString();
      
      const eventData = {
        summary: eventForm.summary,
        description: eventForm.description,
        location: eventForm.location || '',
        start: {
          dateTime: formattedStart,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: formattedEnd,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      const response = await fetch(`${backendUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          calendarId,
          event: eventData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchEvents(calendarId);
        closeEventForm();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(`Failed to create event: ${err.message}`);
      setSyncStatus('error');
    }
  };

  // Update an existing event
  const updateEvent = async (e) => {
    e.preventDefault();
    
    if (!currentEvent || !currentEvent.id || calendars.length === 0) {
      setError("Invalid event data");
      return;
    }
    
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const calendarId = calendars[0].id;
      
      // Format dates for the API
      const formattedStart = new Date(eventForm.start).toISOString();
      const formattedEnd = new Date(eventForm.end).toISOString();
      
      const eventData = {
        summary: eventForm.summary,
        description: eventForm.description,
        location: eventForm.location || '',
        start: {
          dateTime: formattedStart,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: formattedEnd,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      const response = await fetch(`${backendUrl}/api/events/${currentEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          calendarId,
          event: eventData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchEvents(calendarId);
        closeEventForm();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(`Failed to update event: ${err.message}`);
      setSyncStatus('error');
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    if (!eventId || calendars.length === 0) {
      return;
    }
    
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const calendarId = calendars[0].id;
      
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchEvents(calendarId);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(`Failed to delete event: ${err.message}`);
      setSyncStatus('error');
    }
  };

  // Open form to add a new event
  const openAddEventForm = () => {
    // Set default times to today at next hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0); // Next hour
    
    const start = now.toISOString().slice(0, 16);
    
    now.setHours(now.getHours() + 1); // One hour later
    const end = now.toISOString().slice(0, 16);
    
    setEventForm({
      summary: '',
      description: '',
      location: '',
      start,
      end
    });
    
    setCurrentEvent(null);
    setIsAddingEvent(true);
    setIsEditingEvent(false);
  };

  // Open form to edit an existing event
  const openEditEventForm = (event) => {
    // Format dates for the form inputs
    const startDateTime = new Date(event.start.dateTime || event.start.date);
    const endDateTime = new Date(event.end.dateTime || event.end.date);
    
    setEventForm({
      summary: event.summary || '',
      description: event.description || '',
      location: event.location || '',
      start: startDateTime.toISOString().slice(0, 16),
      end: endDateTime.toISOString().slice(0, 16)
    });
    
    setCurrentEvent(event);
    setIsEditingEvent(true);
    setIsAddingEvent(false);
  };

  // Close the event form
  const closeEventForm = () => {
    setIsAddingEvent(false);
    setIsEditingEvent(false);
    setCurrentEvent(null);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value
    });
  };

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days in month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Get days from previous month
    const prevMonthDays = [];
    if (daysFromPrevMonth > 0) {
      const prevMonth = new Date(year, month - 1, 0);
      const prevMonthDaysCount = prevMonth.getDate();
      
      for (let i = prevMonthDaysCount - daysFromPrevMonth + 1; i <= prevMonthDaysCount; i++) {
        prevMonthDays.push({
          date: new Date(year, month - 1, i),
          isCurrentMonth: false
        });
      }
    }
    
    // Get days from current month
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Get days for next month to fill the calendar grid (6 rows x 7 cols = 42 cells)
    const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = 42 - totalDaysSoFar;
    
    const nextMonthDays = [];
    for (let i = 1; i <= daysNeeded; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Process events by date
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date)
      .toISOString()
      .split('T')[0];
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {});

  useEffect(() => {
    syncCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Generate calendar days including days from prev/next months for a complete grid
  const calendarDays = generateCalendarData();

  // Get weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle tooltip positioning
  const handleDayHover = (dateStr, e) => {
    // Get the position of the hovered element
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position for tooltip
    // Adjust these values to position the tooltip correctly
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    
    setHoveredDay(dateStr);
  };

  return (
    <div className={`${glassCard} rounded-xl p-6 space-y-4`}>
      {/* Header with sync button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Calendar
        </h2>
        <div className="flex gap-2">
          <button
            onClick={openAddEventForm}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 
                    text-white transition-all duration-300 shadow-md border border-indigo-500/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Event</span>
          </button>
          
          <button
            onClick={syncCalendar}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 
                    text-white transition-all duration-300 shadow-md border border-indigo-500/40"
          >
            {syncStatus === 'syncing' ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CalendarIcon className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium">Sync</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role="alert"
            className="flex items-center justify-between bg-red-500/10 border border-red-500/30 
                      text-red-400 px-4 py-3 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div className="text-sm font-medium">{error}</div>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-sm font-medium text-gray-300">
          {formatMonthYear(currentDate)}
        </h3>
        
        <button 
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(day => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dateStr = day.date.toISOString().split('T')[0];
          const hasEvent = eventsByDate[dateStr] !== undefined;
          const isToday = new Date().toDateString() === day.date.toDateString();
          const isHovered = hoveredDay === dateStr;
          
          // Style classes based on day type
          let dayClasses = "aspect-square flex flex-col items-center justify-center relative rounded-md transition-all duration-200";
          
          if (day.isCurrentMonth) {
            dayClasses += " hover:bg-indigo-500/20 cursor-pointer";
          } else {
            dayClasses += " opacity-40 hover:opacity-60";
          }
          
          if (isToday) {
            dayClasses += " bg-indigo-500/30 border border-indigo-500/50 font-bold";
          }
          
          if (hasEvent) {
            dayClasses += " font-medium";
          }

          return (
            <div
              key={index}
              className={dayClasses}
              onMouseEnter={(e) => handleDayHover(dateStr, e)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => {
                if (day.isCurrentMonth) {
                  // Set default start time to 9 AM on selected date
                  const selectedDate = new Date(day.date);
                  selectedDate.setHours(9, 0, 0, 0);
                  
                  const endDate = new Date(selectedDate);
                  endDate.setHours(10, 0, 0, 0);
                  
                  setEventForm({
                    summary: '',
                    description: '',
                    location: '',
                    start: selectedDate.toISOString().slice(0, 16),
                    end: endDate.toISOString().slice(0, 16)
                  });
                  
                  setIsAddingEvent(true);
                  setIsEditingEvent(false);
                }
              }}
            >
              <div className={`text-sm ${isToday ? 'text-indigo-300' : 'text-gray-300'}`}>
                {day.date.getDate()}
              </div>
              
              {/* Event indicator */}
              {hasEvent && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              )}
              
              {/* Event tooltip */}
              <AnimatePresence>
                {isHovered && hasEvent && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full z-50 w-72 bg-gray-800/95 backdrop-blur-md p-3 border border-indigo-500/30 
                              rounded-lg shadow-xl mt-2 text-xs text-gray-200"
                    style={{
                      left: `${tooltipPosition.x - 120}px`, // Center tooltip
                      zIndex: 1000
                    }}
                  >
                    <div className="font-medium text-indigo-300 mb-2">
                      {day.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                    
                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                      {eventsByDate[dateStr].map((event, idx) => (
                        <div 
                          key={idx} 
                          className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-sm text-white mb-1">
                              {event.summary || 'Untitled Event'}
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditEventForm(event);
                                }}
                                className="p-1 hover:bg-indigo-500/20 rounded-full"
                                title="Edit event"
                              >
                                <Edit2 className="w-3 h-3 text-indigo-400" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded-full"
                                title="Delete event"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.start.dateTime || event.start.date)
                                .toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1 text-gray-400 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Upcoming events preview */}
      <div className="mt-4 pt-4 border-t border-indigo-500/20">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-indigo-300">Upcoming Events</h3>
          <button 
            onClick={openAddEventForm}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
        
        {events.length > 0 ? (
          <div className="space-y-2">
            {events.slice(0, 3).map((event, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 p-2 rounded-md bg-indigo-500/5 hover:bg-indigo-500/10 transition-all group relative"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-200 font-medium truncate">
                    {event.summary || 'Untitled Event'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.start.dateTime || event.start.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditEventForm(event)}
                    className="p-1 hover:bg-indigo-500/20 rounded-full"
                    title="Edit event"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className="p-1 hover:bg-red-500/20 rounded-full"
                    title="Delete event"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            
            {events.length > 3 && (
              <div className="text-xs text-center text-indigo-400 hover:text-indigo-300 cursor-pointer">
                +{events.length - 3} more events this month
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3 text-gray-500 text-xs">
            {syncStatus === 'idle' ? 'Sync to see your events' : 
             syncStatus === 'syncing' ? 'Loading events...' : 
             'No events for this month'}
          </div>
        )}
      </div>
      
      {/* Event Form Modal */}
      <AnimatePresence>
        {(isAddingEvent || isEditingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeEventForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-gray-900/95 border border-indigo-500/30 rounded-xl p-5 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-indigo-300">
                  {isAddingEvent ? 'Add New Event' : 'Edit Event'}
                </h3>
                <button
                  onClick={closeEventForm}
                  className="p-1 rounded-full bg-gray-800/70 hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={isEditingEvent ? updateEvent : createEvent} className="space-y-4">
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="summary"
                    name="summary"
                    value={eventForm.summary}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 bg-gray-800/70 border border-indigo-500/30 focus:border-indigo-500/70 
                              rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    placeholder="Event title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={eventForm.description}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 bg-gray-800/70 border border-indigo-500/30 focus:border-indigo-500/70 
                              rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    placeholder="Event description"
                    rows="2"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={eventForm.location}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 bg-gray-800/70 border border-indigo-500/30 focus:border-indigo-500/70 
                              rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    placeholder="Event location (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start" className="block text-sm font-medium text-gray-300 mb-1">
                      Start
                    </label>
                    <input
                      type="datetime-local"
                      id="start"
                      name="start"
                      value={eventForm.start}
                      onChange={handleFormChange}
                      className="w-full py-2 px-3 bg-gray-800/70 border border-indigo-500/30 focus:border-indigo-500/70 
                                rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end" className="block text-sm font-medium text-gray-300 mb-1">
                      End
                    </label>
                    <input
                      type="datetime-local"
                      id="end"
                      name="end"
                      value={eventForm.end}
                      onChange={handleFormChange}
                      className="w-full py-2 px-3 bg-gray-800/70 border border-indigo-500/30 focus:border-indigo-500/70 
                                rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEventForm}
                    className="px-4 py-2 rounded-lg bg-gray-700/70 hover:bg-gray-700 text-gray-300 hover:text-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all"
                  >
                    {isEditingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
