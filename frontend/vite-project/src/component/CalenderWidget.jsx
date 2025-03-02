import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

const CalendarWidget = ({ darkMode, glassCard, textClass, subTextClass }) => {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;


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

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

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

  const days = generateDays();

  const formatDay = (date) => date.getDate();

  return (
    <div className={`${glassCard} rounded-xl p-6 space-y-4`}>
      <div className="flex justify-between items-center">
        <h2 className={`text-lg font-semibold ${textClass}`}>Calendar</h2>
        <button
          onClick={syncCalendar}
          disabled={syncStatus === 'syncing'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
            ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-100 hover:bg-purple-200'}
            transition-colors duration-200`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className={`text-sm ${darkMode ? 'text-white' : 'text-purple-700'}`}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Google'}
          </span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          <div>{error}</div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dateStr = day.toISOString().split('T')[0];
          const hasEvent = eventsByDate[dateStr] !== undefined;
          const isHovered = hoveredDay === dateStr;

          // Base border class based on dark mode
          const borderClass = darkMode ? 'border-gray-700' : 'border-gray-300';
          // Conditional background for event days
          const eventBgClass = hasEvent
            ? isHovered
              ? darkMode ? 'bg-blue-700' : 'bg-blue-300'
              : darkMode ? 'bg-blue-800' : 'bg-blue-100'
            : '';

          return (
            <div
              key={index}
              className={`border rounded p-2 relative cursor-default ${borderClass} ${eventBgClass}`}
              onMouseEnter={() => setHoveredDay(dateStr)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDay(day)}
              </div>
              {isHovered && hasEvent && (
                <div className="absolute top-full -left-24 z-10 w-48 bg-white dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-700 rounded shadow-md mt-1 text-xs text-gray-900 dark:text-gray-100">
                  {eventsByDate[dateStr].map((event, idx) => (
                    <div key={idx} className="mb-1 last:mb-0">
                      <strong>{event.summary || 'Untitled Event'}</strong>
                      <div>
                        {new Date(
                          event.start.dateTime || event.start.date
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;
