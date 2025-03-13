import React, { useState } from 'react';
import axios from 'axios';

const TeamCalendar = ({ teamId, team, events, tasks, isAdmin, onEventCreated, onEventUpdated, onEventDeleted }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    attendeeIds: []
  });

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
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === month && 
                   eventDate.getFullYear() === year;
          });
          
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
    // Show event details
    console.log('Event clicked:', event);
    // Implement event details view
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title) {
        alert('Title is required');
        return;
      }
      
      const response = await axios.post(`/api/teams/${teamId}/calendar`, newEvent);
      onEventCreated(response.data);
      setShowNewEventModal(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
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
    <div className="calendar-wrapper">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Team Calendar</h2>
        <div className="flex items-center">
          <button 
            className="px-2 py-1 border rounded" 
            onClick={handlePrevMonth}
          >
            &lt;
          </button>
          <span className="mx-4">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            className="px-2 py-1 border rounded" 
            onClick={handleNextMonth}
          >
            &gt;
          </button>
          <button 
            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => setShowNewEventModal(true)}
          >
            + Add Event
          </button>
        </div>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Sun</th>
            <th className="border p-2">Mon</th>
            <th className="border p-2">Tue</th>
            <th className="border p-2">Wed</th>
            <th className="border p-2">Thu</th>
            <th className="border p-2">Fri</th>
            <th className="border p-2">Sat</th>
          </tr>
        </thead>
        <tbody>
          {generateCalendar()}
        </tbody>
      </table>
      
      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Create New Event</h3>
            
            <div className="mb-4">
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Event description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded"
                  value={newEvent.startDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({...newEvent, startDate: new Date(e.target.value)})}
                />
              </div>
              <div>
                <label className="block mb-1">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded"
                  value={newEvent.endDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({...newEvent, endDate: new Date(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowNewEventModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleCreateEvent}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCalendar;