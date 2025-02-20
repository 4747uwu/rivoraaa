import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarManagement = () => {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    start: '',
    end: ''
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/calendars', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCalendars(data.calendars);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch calendars: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (calendarId) => {
    if (!calendarId) return;
    
    setLoading(true);
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 1);

    try {
      const response = await fetch(
        `http://localhost:4000/api/events?calendarId=${calendarId}&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    if (!selectedCalendar) return;

    // Format the event data properly for Google Calendar API
    const formattedEvent = {
        summary: newEvent.summary,
        description: newEvent.description,
        start: {
            dateTime: new Date(newEvent.start).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
            dateTime: new Date(newEvent.end).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };

    setLoading(true);
    try {
        const response = await fetch('http://localhost:4000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                calendarId: selectedCalendar,
                event: formattedEvent
            })
        });
        const data = await response.json();
        
        if (data.success) {
            fetchEvents(selectedCalendar);
            setIsAddingEvent(false);
            setNewEvent({ summary: '', description: '', start: '', end: '' });
        } else {
            throw new Error(data.message || 'Failed to create event');
        }
    } catch (err) {
        setError('Failed to create event: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!selectedCalendar || !eventId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/events/${eventId}?calendarId=${selectedCalendar}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchEvents(selectedCalendar);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to delete event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendar) {
      fetchEvents(selectedCalendar);
    }
  }, [selectedCalendar]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Calendar Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </motion.button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Calendars</h2>
          <div className="grid grid-cols-3 gap-4">
            {calendars.map(calendar => (
              <motion.button
                key={calendar.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCalendar(calendar.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedCalendar === calendar.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>{calendar.summary}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Events</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{event.summary}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(event.start.dateTime).toLocaleString()} - 
                      {new Date(event.end.dateTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        <AnimatePresence>
          {isAddingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
                <form onSubmit={createEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.summary}
                      onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAddingEvent(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Event
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CalendarManagement;