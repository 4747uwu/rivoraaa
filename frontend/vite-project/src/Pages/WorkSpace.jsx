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
import ProjectDashboard from '../component/ProjectPage';
import ChatComponent from '../component/Chat/chat';
import { useProjects } from '../context/ProjectContext';
// import ProjectDocuments from '../component/ProjectDocuments';
// import ProjectDiscussion from '../component/ProjectDiscussion';
// import ProjectTeam from '../component/ProjectTeam';
// import { useAuth } from '../context/authContext';
// import { useProjects } from '../context/ProjectContext';

// const {user} = useAuth();
// console.log(user);

const WorkSpace = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  
  // Set the document title based on the project name
  useEffect(() => {
    if (selectedProject?.name) {
      document.title = `${selectedProject.name} | WorkSpace`;
    }
    return () => {
      document.title = 'Project Management';
    };
  }, [selectedProject]);

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
    // {
    //   name: 'Team',
    //   icon: Users,
    //   component: <ProjectTeam projectId={projectId} />,
    // },
  ];

  const activeComponent = navigation.find(item => item.name === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button & Project Title */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Back to Projects"
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedProject?.name || 'Project Workspace'}
                </h1>
                {selectedProject?.deadline && (
                  <span className="ml-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                    Due {new Date(selectedProject.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Navigation Tabs */}
            <nav className="flex items-center">
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  if (!item.component) return null; // Skip items without components
                  
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                        ${isActive 
                          ? 'text-blue-700 bg-blue-50 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <Icon 
                        className={`mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                        size={18}
                      />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Navigation Dropdown */}
              <div className="md:hidden relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {navigation.map((item) => (
                    item.component && (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    )
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronRight size={16} className="transform rotate-90" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Project Info Bar */}
      
      
      {/* Main Content Area */}
      <div className="flex-1">
        {activeComponent ? (
          <div className="h-full">
            {activeComponent}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Coming Soon</h2>
              <p className="text-gray-500 max-w-md">
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