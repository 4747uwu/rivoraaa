import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TeamCalendar = ({ teamId, team, events = [], isAdmin, onEventCreated, onEventUpdated, onEventDeleted }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    attendeeIds: []
  });

  // Add a useEffect to log and debug events
  useEffect(() => {
    console.log("Events received by calendar:", events);
  }, [events]);

  // Generate calendar grid for current month
  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get days in month
    const daysInMonth = lastDay.getDate();
    
    // Get starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startingDay = firstDay.getDay();
    
    // Generate calendar rows
    const rows = [];
    let day = 1;
    
    for (let i = 0; i < 6; i++) {
      const cells = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          // Empty cells before the first day
          cells.push(<td key={`empty-${j}`} className="p-2 border"></td>);
        } else if (day > daysInMonth) {
          // Empty cells after the last day
          cells.push(<td key={`empty-end-${j}`} className="p-2 border"></td>);
        } else {
          // Regular day cell
          const currentDate = new Date(year, month, day);
          
          // Make sure events is an array before filtering
          const dayEvents = Array.isArray(events) ? events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === month && 
                   eventDate.getFullYear() === year;
          }) : [];
          
          cells.push(
            <td 
              key={day} 
              className="p-2 border relative h-24 overflow-hidden"
              onClick={() => handleDateClick(currentDate)}
            >
              <div className="absolute top-1 left-1 font-semibold">{day}</div>
              {dayEvents.map(event => (
                <div 
                  key={event._id} 
                  className="mt-6 p-1 text-xs rounded truncate" 
                  style={{ backgroundColor: event.color || '#3788d8', color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
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
    setNewEvent(prev => ({
      ...prev,
      startDate: date,
      endDate: date
    }));
    setShowNewEventModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title) {
        alert('Title is required');
        return;
      }
      
      // Ensure dates are properly formatted for the API
      const formattedEvent = {
        ...newEvent,
        startDate: new Date(newEvent.startDate).toISOString(),
        endDate: new Date(newEvent.endDate).toISOString(),
      };
      
      const response = await axios.post(`/api/teams/${teamId}/calendar`, formattedEvent);
      
      // Call the callback AND also update local state
      if (onEventCreated) {
        onEventCreated(response.data);
      }
      
      setShowNewEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        attendeeIds: []
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/teams/${teamId}/calendar/${selectedEvent._id}`);
      if (onEventDeleted) {
        onEventDeleted(selectedEvent._id);
      }
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
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

  return (
    <div className="calendar-wrapper bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-200">Team Calendar</h2>
        <div className="flex items-center">
          <button 
            className="px-2 py-1 border rounded dark:border-gray-600 dark:text-gray-300" 
            onClick={handlePrevMonth}
          >
            &lt;
          </button>
          <span className="mx-4 dark:text-gray-300">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            className="px-2 py-1 border rounded dark:border-gray-600 dark:text-gray-300" 
            onClick={handleNextMonth}
          >
            &gt;
          </button>
          {isAdmin && (
            <button 
              className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowNewEventModal(true)}
            >
              + Add Event
            </button>
          )}
        </div>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Sun</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Mon</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Tue</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Wed</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Thu</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Fri</th>
            <th className="border p-2 dark:border-gray-700 dark:text-gray-400">Sat</th>
          </tr>
        </thead>
        <tbody>
          {generateCalendar()}
        </tbody>
      </table>
      
      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 dark:text-gray-200">Create New Event</h3>
            
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-300">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-300">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Event description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 dark:text-gray-300">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  value={new Date(newEvent.startDate).toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({...newEvent, startDate: new Date(e.target.value)})}
                />
              </div>
              <div>
                <label className="block mb-1 dark:text-gray-300">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  value={new Date(newEvent.endDate).toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({...newEvent, endDate: new Date(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded dark:border-gray-600 dark:text-gray-300"
                onClick={() => setShowNewEventModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleCreateEvent}
              >
                Create Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-4 dark:text-gray-200">{selectedEvent.title}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            
            {selectedEvent.description && (
              <div className="mb-4">
                <p className="dark:text-gray-300">{selectedEvent.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm text-gray-500 dark:text-gray-400">Start</label>
              <p className="dark:text-gray-300">
                {new Date(selectedEvent.startDate).toLocaleString()}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-500 dark:text-gray-400">End</label>
              <p className="dark:text-gray-300">
                {new Date(selectedEvent.endDate).toLocaleString()}
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 border rounded dark:border-gray-600 dark:text-gray-300"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamCalendar;