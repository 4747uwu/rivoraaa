import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Users, User, Clock, Plus, Edit, Trash2, 
  Check, X, AlertTriangle, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import API from '../../../api/api';

// Add these Tailwind CSS custom colors at the top of your file
const colors = {
  darkBlue: {
    50: '#E6F0FF',
    100: '#B3D1FF',
    200: '#80B3FF',
    300: '#4D94FF',
    400: '#1A75FF',
    500: '#0052CC',
    600: '#003D99',
    700: '#002966',
    800: '#001433',
    900: '#000A1A',
  }
};

const TeamCalendarAndTask = ({ teamId, team, isAdmin }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This is the working fetchEvents function
  const fetchEvents = async () => {
    if (!teamId) return;
    
    try {
      console.log("Fetching events for team:", teamId);
      setLoading(true);
      
      // Request with full date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // 3 months ago
      const endDate = new Date(now.getFullYear(), now.getMonth() + 9, 0); // 9 months ahead
      
      const response = await API.get(`/api/teams/${teamId}/calendar`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
      
      console.log("Calendar events response:", response.data);
      setEvents(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError(`Failed to load calendar events: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks function
  const fetchTasks = async () => {
    if (!teamId) return;
    
    try {
      setLoading(true);
      const response = await API.get(`/api/teams/${teamId}/tasks`);
      console.log("Tasks response:", response.data);
      setTasks(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching team tasks:", err);
      setError(`Failed to load team tasks: ${err.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when teamId changes
  useEffect(() => {
    if (teamId) {
      if (activeTab === 'calendar') {
        fetchEvents();
      } else {
        fetchTasks();
      }
    }
  }, [teamId, activeTab]);
  
  // Event handlers
  const handleEventCreated = async (newEvent) => {
    try {
      // First add the event to local state to make UI responsive
      setEvents(prev => [...prev, newEvent]);
      
      // Then refetch all events to ensure we have the latest data
      await fetchEvents();
      
      return newEvent;
    } catch (error) {
      console.error("Error handling event creation:", error);
      throw error;
    }
  };

  const handleEventUpdated = async (updatedEvent) => {
    try {
      // Update the event in local state
      setEvents(prev => 
        prev.map(event => event._id === updatedEvent._id ? updatedEvent : event)
      );
      
      // Then refetch all events
      await fetchEvents();
      
      return updatedEvent;
    } catch (error) {
      console.error("Error handling event update:", error);
      throw error;
    }
  };

  const handleEventDeleted = async (eventId) => {
    try {
      // Remove the event from local state
      setEvents(prev => prev.filter(event => event._id !== eventId));
      
      // Then refetch all events
      await fetchEvents();
      
      return true;
    } catch (error) {
      console.error("Error handling event deletion:", error);
      throw error;
    }
  };

  // Task handlers - similar pattern
  const handleTaskCreated = async (newTask) => {
    try {
      setTasks(prev => [...prev, newTask]);
      await fetchTasks();
      return newTask;
    } catch (error) {
      console.error("Error handling task creation:", error);
      throw error;
    }
  };

  const handleTaskUpdated = async (updatedTask) => {
    try {
      setTasks(prev => 
        prev.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
      await fetchTasks();
      return updatedTask;
    } catch (error) {
      console.error("Error handling task update:", error);
      throw error;
    }
  };

  const handleTaskDeleted = async (taskId) => {
    try {
      setTasks(prev => prev.filter(task => task._id !== taskId));
      await fetchTasks();
      return true;
    } catch (error) {
      console.error("Error handling task deletion:", error);
      throw error;
    }
  };

  return (
    <div className="bg-darkBlue-900 rounded-lg shadow-xl border border-darkBlue-800">
      {/* Tab navigation */}
      <div className="border-b border-darkBlue-800">
        <div className="flex">
          <button
            className={`px-6 py-3 focus:outline-none transition-colors duration-200 ${
              activeTab === 'calendar' 
                ? 'border-b-2 border-darkBlue-400 text-darkBlue-400 font-medium' 
                : 'text-gray-400 hover:text-darkBlue-300'
            }`}
            onClick={() => {
              setActiveTab('calendar');
              fetchEvents(); // Fetch events when tab is clicked
            }}
          >
            <div className="flex items-center">
              <Calendar size={18} className="mr-2" />
              Calendar
            </div>
          </button>
          <button
            className={`px-6 py-3 focus:outline-none transition-colors duration-200 ${
              activeTab === 'tasks' 
                ? 'border-b-2 border-darkBlue-400 text-darkBlue-400 font-medium' 
                : 'text-gray-400 hover:text-darkBlue-300'
            }`}
            onClick={() => {
              setActiveTab('tasks');
              fetchTasks(); // Fetch tasks when tab is clicked
            }}
          >
            <div className="flex items-center">
              <Users size={18} className="mr-2" />
              Tasks
            </div>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 bg-darkBlue-900 text-gray-200">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <Clock size={24} className="animate-spin text-darkBlue-400 mr-2" />
            <span className="text-darkBlue-100">Loading...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 p-4 rounded-md text-red-300 mb-4 border border-red-900/50">
            <div className="flex items-center mb-2">
              <AlertTriangle size={20} className="mr-2 text-red-400" />
              <strong>Error</strong>
            </div>
            <p>{error}</p>
            <button 
              onClick={activeTab === 'calendar' ? fetchEvents : fetchTasks}
              className="mt-2 px-3 py-1 bg-red-800/50 text-white rounded-md text-sm 
                         hover:bg-red-700/50 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && activeTab === 'calendar' && (
          <div>
            <TeamCalendar
              teamId={teamId}
              team={team}
              events={events} 
              isAdmin={isAdmin}
              onEventCreated={handleEventCreated}
              onEventUpdated={handleEventUpdated}
              onEventDeleted={handleEventDeleted}
              refreshEvents={fetchEvents}
            />
            
            {/* Debug info */}
            <div className="mt-2 p-2 border-t border-gray-800 text-xs text-gray-500">
              <strong className="text-gray-400">Debug Info:</strong> {events.length} events loaded.
              <button 
                onClick={() => {
                  console.log("Current events:", events);
                  fetchEvents();
                }}
                className="ml-2 px-2 py-0.5 bg-gray-800 rounded hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'tasks' && (
          <div>
            <TeamTasks
              teamId={teamId}
              team={team}
              tasks={tasks}
              isAdmin={isAdmin}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              refreshTasks={fetchTasks}
            />
            
            {/* Debug info */}
            <div className="mt-2 p-2 border-t border-gray-800 text-xs text-gray-500">
              <strong className="text-gray-400">Debug Info:</strong> {tasks.length} tasks loaded.
              <button 
                onClick={() => {
                  console.log("Current tasks:", tasks);
                  fetchTasks();
                }}
                className="ml-2 px-2 py-0.5 bg-gray-800 rounded hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// This is your existing TeamCalendar component which receives events as props
const TeamCalendar = ({ 
  teamId, 
  team, 
  events = [], 
  isAdmin = false, 
  onEventCreated, 
  onEventUpdated, 
  onEventDeleted,
  refreshEvents 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
    location: '',
    allDay: false,
    color: '#4169E1', // Royal blue as default color
    attendeeIds: []
  });
  
  // Log received events for debugging
  useEffect(() => {
    console.log("TeamCalendar received events:", events);
  }, [events]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
  };

  // Format date for input fields
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Update the generateCalendar function with fixed sizing and cleaner styling
const generateCalendar = () => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get days in month and starting day of week
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  // Generate calendar rows
  const rows = [];
  let day = 1;
  
  for (let i = 0; i < 6; i++) {
    const cells = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDay) {
        // Empty cells before the first day
        cells.push(
          <td 
            key={`empty-${j}`} 
            className="w-32 h-32 border-darkBlue-800 border bg-darkBlue-900/30"
          ></td>
        );
      } else if (day > daysInMonth) {
        // Empty cells after the last day
        cells.push(
          <td 
            key={`empty-end-${j}`} 
            className="w-32 h-32 border-darkBlue-800 border bg-darkBlue-900/30"
          ></td>
        );
      } else {
        // Regular day cell
        const currentDate = new Date(year, month, day);
        
        // Get events for this day
        const dayEvents = Array.isArray(events) ? events.filter(event => {
          if (!event || !event.startDate) return false;
          
          const eventDate = new Date(event.startDate);
          return eventDate.getDate() === day && 
                eventDate.getMonth() === month && 
                eventDate.getFullYear() === year;
        }) : [];
        
        // Check if today
        const isToday = new Date().toDateString() === currentDate.toDateString();
        
        cells.push(
          <td 
            key={day} 
            className={`
              w-32 h-32 border-darkBlue-800 border p-0 relative
              ${isToday ? 'bg-darkBlue-800/30' : 'bg-darkBlue-900/20'} 
              hover:bg-darkBlue-800/40 transition-colors duration-200
              cursor-pointer
            `}
            onClick={() => handleDateClick(currentDate)}
          >
            {/* Date indicator - circle for today, subtle for other dates */}
            <div className={`
              absolute top-2 left-2 flex items-center justify-center
              ${isToday 
                ? 'w-7 h-7 rounded-full bg-darkBlue-600 text-white' 
                : 'text-darkBlue-100'
              }
              font-medium text-sm
            `}>
              <span className={`${isToday ? '' : 'text-gray-400'} ${isToday ? '' : 'opacity-80'}`}>
                {day}
              </span>
            </div>
            
            {/* Events container with fixed height and scrollable */}
            <div className="absolute top-10 left-0 right-0 px-1.5 pb-1 max-h-16 overflow-y-auto scrollbar-none">
              {dayEvents.slice(0, 3).map((event) => (
                <div 
                  key={event._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  className="mb-1 rounded-sm flex items-center"
                >
                  <div 
                    className="flex-shrink-0 w-1.5 h-6 mr-1 rounded-sm" 
                    style={{ backgroundColor: event.color || '#1A75FF' }}
                  ></div>
                  <div 
                    className="px-2 py-0.5 text-xs font-medium truncate flex-1 rounded-sm"
                    style={{ 
                      backgroundColor: `${event.color}15`,
                      color: 'currentColor' 
                    }}
                  >
                    {event.title}
                  </div>
                </div>
              ))}
              
              {/* Show +X more if there are more events */}
              {dayEvents.length > 3 && (
                <div className="text-xs text-center mt-1">
                  <span className="text-darkBlue-300 font-medium">
                    +{dayEvents.length - 3} more
                  </span>
                </div>
              )}
            </div>
          </td>
        );
        day++;
      }
    }
    rows.push(<tr key={i}>{cells}</tr>);
    if (day > daysInMonth) break;
  }
  
  return rows;
};

  const handleDateClick = (date) => {
    // Reset the form and update the selected date
    setNewEvent({
      title: '',
      description: '',
      startDate: date,
      endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour from selected date
      location: '',
      allDay: false,
      color: '#4169E1',
      attendeeIds: []
    });
    
    setShowNewEventModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
    setIsEditMode(false);
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title) {
        setError('Title is required');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const eventData = {
        ...newEvent,
        startDate: newEvent.startDate instanceof Date ? 
          newEvent.startDate.toISOString() : newEvent.startDate,
        endDate: newEvent.endDate instanceof Date ? 
          newEvent.endDate.toISOString() : newEvent.endDate
      };
      
      const response = await axios.post(`/api/teams/${teamId}/calendar`, eventData, {
        withCredentials: true
      });
      
      console.log("Event created:", response.data);
      
      // Call the callback
      if (onEventCreated) {
        onEventCreated(response.data);
      }
      
      // Close modal
      setShowNewEventModal(false);
      
      // Optionally refresh all events
      if (refreshEvents) {
        refreshEvents();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      setError(error.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      if (!selectedEvent.title) {
        setError('Title is required');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const eventData = {
        ...selectedEvent,
        startDate: selectedEvent.startDate instanceof Date ? 
          selectedEvent.startDate.toISOString() : selectedEvent.startDate,
        endDate: selectedEvent.endDate instanceof Date ? 
          selectedEvent.endDate.toISOString() : selectedEvent.endDate
      };
      
      const response = await axios.put(`/api/calendar/${selectedEvent._id}`, eventData, {
        withCredentials: true
      });
      
      // Call the callback
      if (onEventUpdated) {
        onEventUpdated(response.data);
      }
      
      // Close modal
      setShowEventDetailsModal(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      
      // Optionally refresh all events
      if (refreshEvents) {
        refreshEvents();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      setError(error.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(`/api/calendar/${selectedEvent._id}`, {
        withCredentials: true
      });
      
      // Call the callback
      if (onEventDeleted) {
        onEventDeleted(selectedEvent._id);
      }
      
      // Close modal
      setShowEventDetailsModal(false);
      setSelectedEvent(null);
      
      // Optionally refresh all events
      if (refreshEvents) {
        refreshEvents();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  const handleAttendeeChange = (userId, checked) => {
    if (isEditMode) {
      setSelectedEvent(prev => ({
        ...prev,
        attendeeIds: checked 
          ? [...(prev.attendeeIds || []), userId]
          : (prev.attendeeIds || []).filter(id => id !== userId)
      }));
    } else {
      setNewEvent(prev => ({
        ...prev,
        attendeeIds: checked 
          ? [...(prev.attendeeIds || []), userId]
          : (prev.attendeeIds || []).filter(id => id !== userId)
      }));
    }
  };

  const startEventEdit = () => {
    // Prepare the event for editing
    const attendeeIds = selectedEvent.attendees?.map(att => att.user._id) || [];
    
    setSelectedEvent({
      ...selectedEvent,
      attendeeIds
    });
    
    setIsEditMode(true);
  };

  return (
    <div className="calendar-wrapper bg-darkBlue-900 p-6 rounded-xl shadow-2xl border border-darkBlue-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-400 flex items-center">
          <Calendar className="mr-2" size={20} />
          Team Calendar
        </h2>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md hover:bg-gray-800 text-gray-400" 
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="mx-4 font-medium text-gray-200">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            className="p-2 rounded-md hover:bg-gray-800 text-gray-400" 
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
          {isAdmin && (
            <button 
              className="ml-4 px-3 py-1.5 bg-blue-700 text-white rounded hover:bg-blue-600 flex items-center"
              onClick={() => {
                setNewEvent({
                  title: '',
                  description: '',
                  startDate: new Date(),
                  endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
                  location: '',
                  allDay: false,
                  color: '#4169E1',
                  attendeeIds: []
                });
                setShowNewEventModal(true);
              }}
            >
              <Plus size={16} className="mr-1" />
              Add Event
            </button>
          )}
        </div>
      </div>
      
      <div className="border border-darkBlue-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th 
                    key={day} 
                    className="p-3 text-darkBlue-200 font-medium text-sm tracking-wider 
                            border-b-2 border-darkBlue-700"
                >
                    {day}
                </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {generateCalendar()}
          </tbody>
        </table>
      </div>
      
      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-darkBlue-900/90 z-10">
          <div className="bg-darkBlue-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-darkBlue-700">
            <h3 className="text-lg font-bold mb-4 flex items-center text-blue-400">
              <Calendar className="mr-2" size={20} />
              Create New Event
            </h3>
            
            {error && (
              <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 flex items-center border border-red-900">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-darkBlue-900 border border-darkBlue-700 rounded-md focus:ring focus:ring-darkBlue-500/50 focus:border-darkBlue-500 outline-none text-gray-200 placeholder-gray-500"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-darkBlue-900 border border-darkBlue-700 rounded-md focus:ring focus:ring-darkBlue-500/50 focus:border-darkBlue-500 outline-none text-gray-200 placeholder-gray-500"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Event description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-darkBlue-900 border border-darkBlue-700 rounded-md focus:ring focus:ring-darkBlue-500/50 focus:border-darkBlue-500 outline-none text-gray-200 placeholder-gray-500"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                placeholder="Location (optional)"
              />
            </div>
            
            <div className="flex items-center mb-4">
              <input
                id="allDay"
                type="checkbox"
                checked={newEvent.allDay}
                onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
              />
              <label htmlFor="allDay" className="ml-2 block text-sm text-gray-300">
                All day event
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium text-gray-300">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-darkBlue-900 border border-darkBlue-700 rounded-md focus:ring focus:ring-darkBlue-500/50 focus:border-darkBlue-500 outline-none text-gray-200 placeholder-gray-500"
                  value={formatDateForInput(newEvent.startDate)}
                  onChange={(e) => setNewEvent({...newEvent, startDate: new Date(e.target.value)})}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-darkBlue-900 border border-darkBlue-700 rounded-md focus:ring focus:ring-darkBlue-500/50 focus:border-darkBlue-500 outline-none text-gray-200 placeholder-gray-500"
                  value={formatDateForInput(newEvent.endDate)}
                  onChange={(e) => setNewEvent({...newEvent, endDate: new Date(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Color</label>
              <input
                type="color"
                className="w-full h-10 rounded-md cursor-pointer bg-gray-800 border border-gray-700"
                value={newEvent.color}
                onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
              />
            </div>
            
            {team && team.members && team.members.length > 0 && (
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-300">Attendees</label>
                <div className="border border-gray-700 rounded-md p-2 max-h-40 overflow-y-auto bg-gray-800">
                  <div className="flex items-center p-2 hover:bg-gray-700 rounded mb-1">
                    <input
                      type="checkbox"
                      id={`owner-${team.owner._id}`}
                      checked={newEvent.attendeeIds?.includes(team.owner._id)}
                      onChange={(e) => handleAttendeeChange(team.owner._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900"
                    />
                    <label htmlFor={`owner-${team.owner._id}`} className="ml-2 flex items-center text-gray-300">
                      {team.owner.avatar ? (
                        <img src={team.owner.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                      ) : (
                        <User size={16} className="mr-2 text-gray-400" />
                      )}
                      {team.owner.name} <span className="ml-1 text-xs text-gray-500">(Owner)</span>
                    </label>
                  </div>
                  {team.members.map(member => (
                    <div key={member.user._id} className="flex items-center p-2 hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        id={`member-${member.user._id}`}
                        checked={newEvent.attendeeIds?.includes(member.user._id)}
                        onChange={(e) => handleAttendeeChange(member.user._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900"
                      />
                      <label htmlFor={`member-${member.user._id}`} className="ml-2 flex items-center text-gray-300">
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                        ) : (
                          <User size={16} className="mr-2 text-gray-400" />
                        )}
                        {member.user.name} <span className="ml-1 text-xs text-gray-500">({member.role})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border border-darkBlue-600 text-darkBlue-300 rounded-md hover:bg-darkBlue-800/50 transition-colors duration-200"
                onClick={() => {
                  setShowNewEventModal(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-darkBlue-600 text-white rounded-md hover:bg-darkBlue-500 disabled:bg-darkBlue-700 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                onClick={handleCreateEvent}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Clock size={16} className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-darkBlue-900/90 z-10">
          <div className="bg-darkBlue-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-darkBlue-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {isEditMode ? 'Edit Event' : selectedEvent.title}
              </h3>
              <button 
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                  setIsEditMode(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}
            
            {isEditMode ? (
              // Edit Mode Form
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                    rows="3"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
                    value={selectedEvent.location}
                    onChange={(e) => setSelectedEvent({...selectedEvent, location: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="editAllDay"
                    type="checkbox"
                    checked={selectedEvent.allDay}
                    onChange={(e) => setSelectedEvent({...selectedEvent, allDay: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editAllDay" className="ml-2 block text-sm text-gray-900">
                    All day event
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Start Date</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
                      value={formatDateForInput(selectedEvent.startDate)}
                      onChange={(e) => setSelectedEvent({...selectedEvent, startDate: new Date(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">End Date</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
                      value={formatDateForInput(selectedEvent.endDate)}
                      onChange={(e) => setSelectedEvent({...selectedEvent, endDate: new Date(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded-md cursor-pointer"
                    value={selectedEvent.color || '#3788d8'}
                    onChange={(e) => setSelectedEvent({...selectedEvent, color: e.target.value})}
                  />
                </div>
                
                {team && team.members && (
                  <div>
                    <label className="block mb-2 font-medium">Attendees</label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      <div className="flex items-center p-2 hover:bg-gray-50 rounded mb-1">
                        <input
                          type="checkbox"
                          id={`edit-owner-${team.owner._id}`}
                          checked={selectedEvent.attendeeIds?.includes(team.owner._id)}
                          onChange={(e) => handleAttendeeChange(team.owner._id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-owner-${team.owner._id}`} className="ml-2 flex items-center">
                          {team.owner.avatar ? (
                            <img src={team.owner.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                          ) : (
                            <User size={16} className="mr-2 text-gray-400" />
                          )}
                          {team.owner.name} <span className="ml-1 text-xs text-gray-500">(Owner)</span>
                        </label>
                      </div>
                      {team.members.map(member => (
                        <div key={member.user._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`edit-member-${member.user._id}`}
                            checked={selectedEvent.attendeeIds?.includes(member.user._id)}
                            onChange={(e) => handleAttendeeChange(member.user._id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`edit-member-${member.user._id}`} className="ml-2 flex items-center">
                            {member.user.avatar ? (
                              <img src={member.user.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                            ) : (
                              <User size={16} className="mr-2 text-gray-400" />
                            )}
                            {member.user.name} <span className="ml-1 text-xs text-gray-500">({member.role})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    onClick={() => {
                      setIsEditMode(false);
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                    onClick={handleUpdateEvent}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Clock size={16} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                {/* Event color indicator */}
                <div 
                  className="h-2 rounded-full mb-4" 
                  style={{ backgroundColor: selectedEvent.color || '#3788d8' }}
                ></div>
                
                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm text-white font-medium mb-1">Description</h4>
                    <p className="text-white whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-200 font-medium mb-1">Start Date</h4>
                    <p className="text-white">{formatDate(selectedEvent.startDate)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-200 font-medium mb-1">End Date</h4>
                    <p className="text-white">{formatDate(selectedEvent.endDate)}</p>
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <h4 className="text-sm text-gray-500 font-medium mb-1">Location</h4>
                    <p className="text-white">{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-100 font-medium mb-1">Attendees</h4>
                    <div className="space-y-2">
                      {selectedEvent.attendees.map(attendee => (
                        <div key={attendee.user._id} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 mr-3 flex items-center justify-center overflow-hidden">
                            {attendee.user.profilePicture ? (
                              <img src={attendee.user.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{attendee.user.name}</p>
                            <p className="text-xs text-gray-500">{attendee.status || 'No response'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Created by / metadata */}
                {selectedEvent.createdBy && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Info size={12} className="mr-1" />
                      Created by {selectedEvent.createdBy.name || 'Unknown'}
                    </p>
                  </div>
                )}
                
                {/* Buttons */}
                {isAdmin && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <button
                      className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                      onClick={startEventEdit}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 flex items-center"
                      onClick={handleDeleteEvent}
                      disabled={loading}
                    >
                      {loading ? (
                        <Clock size={16} className="animate-spin mr-1" />
                      ) : (
                        <Trash2 size={16} className="mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// TeamTasks component (simplified version)
const TeamTasks = ({ 
  teamId, 
  team, 
  tasks = [], 
  isAdmin, 
  onTaskCreated, 
  onTaskUpdated, 
  onTaskDeleted,
  refreshTasks 
}) => {
  useEffect(() => {
    console.log("TeamTasks received tasks:", tasks);
  }, [tasks]);

  // Tasks implementation...
  
  return (
    // Tasks UI
    <div>
      {/* Tasks implementation */}
    </div>
  );
};

export default TeamCalendarAndTask;