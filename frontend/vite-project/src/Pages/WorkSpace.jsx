import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  FileText, 
  MessageSquare, 
  Users,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProjectDashboard from '../component/ProjectPage';
import ChatComponent from '../component/Chat/chat';
import { useProjects } from '../context/ProjectContext';
import TeamManagement from '../component/Team/TeamMembers';
import { useAuth } from '../context/authContext';
import API from '../api/api';

const formatDueDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'long' });
  return `Due ${day} ${month}`;
};

const WorkSpace = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById } = useProjects();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Add state to track when we need to refresh project data
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set the document title based on the project name
  useEffect(() => {
    if (selectedProject?.name) {
      document.title = `${selectedProject.name} | WorkSpace`;
    }
    return () => {
      document.title = 'Project Management';
    };
  }, [selectedProject]);

  useEffect(() => {
    if (projectId) {
      // Fetch fresh project data
      fetchProjectById(projectId)
        .catch(err => console.error("Error refreshing project data:", err));
    }
  }, [projectId, refreshTrigger, fetchProjectById]);

  // Use the direct project query to get real-time data
  const { data: currentProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await API.get(`/api/projects/${projectId}`);
      return response.data.project;
    },
    enabled: !!projectId
  });
  
  // Use the most up-to-date project data
  const projectData = currentProject || selectedProject;

  // Fetch project tasks for the team management component
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await API.get(`/api/tasks?projectId=${projectId}`);
      return response.data;
    },
    enabled: !!projectId && activeTab === 'Team'
  });

  // Define navigation with the new Team tab
  const navigation = [
    {
      name: 'Dashboard',
      icon: LayoutGrid,
      component: <ProjectDashboard projectId={projectId} />,
    },
    {
      name: 'Documents',
      icon: FileText,
    //   component: <ProjectDocuments projectId={projectId} />,
    },
    {
      name: 'Discussion',
      icon: MessageSquare,
      component: <ChatComponent />
    },
    {
      name: 'Team',
      icon: Users,
      component: (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TeamManagement 
            key={`team-${refreshTrigger}`} // Add key to force re-render when data changes
            projectMembers={projectData?.members || []}
            tasks={tasks}
            currentUser={currentUser}
            projectId={projectId}
            onUpdateSuccess={async () => {
              // Invalidate queries first
              queryClient.invalidateQueries(['project', projectId]);
              queryClient.invalidateQueries(['projects']);
              queryClient.invalidateQueries(['projectTasks', projectId]);
              
              // Immediately fetch fresh data
              try {
                await Promise.all([
                  fetchProjectById(projectId),
                  refetchTasks()
                ]);
                
                setRefreshTrigger(prev => prev + 1);
              } catch (error) {
                console.error("Error refreshing data after role update:", error);
              }
            }}
          />
        </div>
      ),
    },
  ];

  const activeComponent = navigation.find(item => item.name === activeTab)?.component;

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-gray-800/40 sticky top-0 z-[50] shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button & Project Title */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 
                         transition-all duration-200 hover:text-gray-200
                         hover:shadow-inner active:scale-95"
                aria-label="Back to Projects"
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-100 tracking-tight">
                  {projectData?.name || 'Project Workspace'}
                </h1>
                {projectData?.deadline && (
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 
                               text-indigo-400 text-xs font-medium rounded-full 
                               border border-indigo-500/20 shadow-inner shadow-indigo-500/5">
                    {formatDueDate(projectData.deadline)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Navigation Tabs */}
            <nav className="flex items-center">
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  if (!item.component) return null;
                  
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md 
                                transition-all duration-200 relative group
                                ${isActive 
                                  ? 'text-indigo-400 bg-gradient-to-r from-indigo-500/10 to-purple-500/10' 
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                    >
                      <Icon 
                        className={`mr-2 transition-transform group-hover:scale-110 duration-200
                                  ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}
                        size={18}
                      />
                      {item.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 
                                     bg-gradient-to-r from-indigo-500 to-purple-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Navigation Dropdown - Updated styling */}
              <div className="md:hidden relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="appearance-none bg-[#1A1A1A] border border-gray-800/40 
                           rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-300
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                           focus:border-indigo-500/30 transition-all duration-200
                           hover:bg-white/5"
                >
                  {navigation.map((item) => (
                    item.component && (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    )
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 
                            flex items-center px-2 text-gray-500">
                  <ChevronRight size={16} className="transform rotate-90" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 h-screen mb-0 bg-[#121212]">
        {activeComponent ? (
          <div className="h-full">
            {activeComponent}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="p-4 bg-indigo-500/10 rounded-full inline-block mb-4">
                <FileText className="text-indigo-400" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-200 mb-2">
                Feature Coming Soon
              </h2>
              <p className="text-gray-400 max-w-md">
                This section is currently under development and will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSpace;