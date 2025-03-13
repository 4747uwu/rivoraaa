import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TeamCalendar from './TeamCalendar';
import TeamTasks from './TeamTask';

// Simple loading and error icons
const Loader = () => (
  <div className="animate-spin h-6 w-6 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
);

const ErrorIcon = () => (
  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600">!</div>
);

const TeamCalendarAndTasks = ({ teamId, team, isTeamAdmin }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState({
    tasks: false,
    events: false,
    analytics: false
  });
  const [error, setError] = useState({
    tasks: null,
    events: null,
    analytics: null
  });
  const [analytics, setAnalytics] = useState(null);

  // API instance
  const API = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      setError(prev => ({ ...prev, tasks: null }));
      
      const response = await API.get(`/teams/${teamId}/tasks`);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch team tasks:', err);
      setError(prev => ({ 
        ...prev, 
        tasks: err.response?.data?.message || 'Failed to load tasks' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [teamId]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      setError(prev => ({ ...prev, events: null }));
      
      // Get current date
      const now = new Date();
      
      // Get dates for 3 months before and 12 months after
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 12);
      
      const response = await API.get(`/teams/${teamId}/calendar`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
      
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch team events:', err);
      setError(prev => ({ 
        ...prev, 
        events: err.response?.data?.message || 'Failed to load calendar events' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, [teamId]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, analytics: true }));
      setError(prev => ({ ...prev, analytics: null }));
      
      const response = await API.get(`/teams/${teamId}/task-analytics`);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch task analytics:', err);
      setError(prev => ({ 
        ...prev, 
        analytics: err.response?.data?.message || 'Failed to load analytics' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  }, [teamId]);

  // Load data when component mounts or teamId changes
  useEffect(() => {
    if (teamId) {
      fetchTasks();
      fetchEvents();
      fetchAnalytics();
    }
  }, [teamId, fetchTasks, fetchEvents, fetchAnalytics]);

  // Handle task creation
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Handle task update
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => task._id === updatedTask._id ? updatedTask : task)
    );
  };

  // Handle task deletion
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task._id !== taskId)
    );
  };

  // Handle event creation
  const handleEventCreated = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Handle event update
  const handleEventUpdated = (updatedEvent) => {
    setEvents(prevEvents => 
      prevEvents.map(event => event._id === updatedEvent._id ? updatedEvent : event)
    );
  };

  // Handle event deletion
  const handleEventDeleted = (eventId) => {
    setEvents(prevEvents => 
      prevEvents.filter(event => event._id !== eventId)
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        if (loading.events) {
          return (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader />
              <p className="mt-2 text-sm text-gray-500">Loading calendar...</p>
            </div>
          );
        }
        
        if (error.events) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
              <ErrorIcon />
              <p className="mt-2">{error.events}</p>
              <button 
                onClick={fetchEvents} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          );
        }
        
        return (
          <div className="calendar-container">
            <p>This is where the TeamCalendar component would go.</p>
            <p>You would need to implement the TeamCalendar component separately.</p>
            <pre>{JSON.stringify({ eventsCount: events.length }, null, 2)}</pre>
          </div>
        );

      case 'tasks':
        if (loading.tasks) {
          return (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader />
              <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
            </div>
          );
        }
        
        if (error.tasks) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
              <ErrorIcon />
              <p className="mt-2">{error.tasks}</p>
              <button 
                onClick={fetchTasks} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          );
        }
        
        return (
          <div className="tasks-container">
            <p>This is where the TeamTasks component would go.</p>
            <p>You would need to implement the TeamTasks component separately.</p>
            <pre>{JSON.stringify({ tasksCount: tasks.length }, null, 2)}</pre>
          </div>
        );

      case 'analytics':
        if (loading.analytics) {
          return (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader />
              <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
            </div>
          );
        }
        
        if (error.analytics) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
              <ErrorIcon />
              <p className="mt-2">{error.analytics}</p>
              <button 
                onClick={fetchAnalytics} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          );
        }
        
        return (
          <div className="analytics-container">
            <p>This is where the TeamTaskAnalytics component would go.</p>
            <p>You would need to implement the TeamTaskAnalytics component separately.</p>
            <pre>{JSON.stringify({ analytics }, null, 2)}</pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Custom tabs navigation */}
      <div className="border-b px-4">
        <div className="flex h-12">
          <button
            className={`px-4 py-2 ${activeTab === 'calendar' ? 'text-blue-600 border-blue-600 border-b-2' : 'text-gray-500'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'tasks' ? 'text-blue-600 border-blue-600 border-b-2' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'analytics' ? 'text-blue-600 border-blue-600 border-b-2' : 'text-gray-500'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TeamCalendarAndTasks;