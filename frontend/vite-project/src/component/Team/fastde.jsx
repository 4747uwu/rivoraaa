import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Send, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/api';

const TeamDeployment = ({ team, user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null); // null, 'success', 'error'
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await API.get('/api/projects');
        
        // Filter projects where user is owner or admin
        const eligibleProjects = response.data.projects.filter(project => {
          return project.owner._id === user._id || 
            (project.members.some(m => m.user._id === user._id && m.role === 'admin'));
        });
        
        setProjects(eligibleProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load your projects");
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, [user._id]);
  
  // Handle team deployment
  const handleDeployTeam = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    
    try {
      setIsLoading(true);
      setDeployStatus(null);
      
      const response = await API.post(
        `/api/teams/${team._id}/deploy/${selectedProject._id}`,
        { role, message }
      );
      
      setDeployStatus('success');
      toast.success(response.data.message);
      
      // Reset form
      setSelectedProject(null);
      setRole('member');
      setMessage('');
      
    } catch (error) {
      console.error("Failed to deploy team:", error);
      setDeployStatus('error');
      toast.error(error.response?.data?.message || "Failed to deploy team to project");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate deployment stats
  const memberCount = team.members.length + 1; // +1 for owner
  const deployableMembers = team.members.filter(m => m.user._id !== user._id).length;
  
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Send className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-200">Deploy Team to Project</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-300 text-sm">
          Deploy this team to one of your projects to quickly onboard all 
          team members. This will send invitations to {deployableMembers} team members.
        </p>
      </div>
      
      {loadingProjects ? (
        <div className="flex justify-center py-8">
          <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-gray-800/40 rounded-lg p-5 text-center">
          <Briefcase className="w-10 h-10 mx-auto text-gray-500 mb-2" />
          <h4 className="text-gray-300 mb-1">No eligible projects found</h4>
          <p className="text-gray-500 text-sm">
            Create a project first or get admin access to deploy this team.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-4 py-2 bg-indigo-500/30 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/40 transition-colors"
            onClick={() => window.location.href = '/projects/new'}
          >
            Create Project
          </motion.button>
        </div>
      ) : (
        <form onSubmit={handleDeployTeam} className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Project
            </label>
            <select
              value={selectedProject?._id || ""}
              onChange={(e) => {
                const project = projects.find(p => p._id === e.target.value);
                setSelectedProject(project || null);
              }}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">-- Select a project --</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Assign Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="member">Member (Standard Access)</option>
              <option value="admin">Admin (Full Access)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>
          
          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your team members..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
            />
          </div>
          
          {/* Team Member Summary */}
          {selectedProject && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-gray-300">Team Members</span>
                </div>
                <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">
                  {deployableMembers} members to invite
                </span>
              </div>
              
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {team.members.map((member, index) => (
                  <li 
                    key={index} 
                    className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                      member.user._id === user._id 
                        ? 'bg-gray-700/30 text-gray-500' 
                        : 'bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {member.user.profilePicture ? (
                          <img 
                            src={member.user.profilePicture} 
                            alt={member.user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.user.name.charAt(0)
                        )}
                      </div>
                      <span className="text-gray-300">{member.user.name}</span>
                    </div>
                    
                    {member.user._id === user._id ? (
                      <span className="text-xs text-gray-500">You (not invited)</span>
                    ) : (
                      <span className="text-xs text-indigo-300">Will be invited as {role}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Status Message */}
          {deployStatus === 'success' && (
            <div className="bg-green-900/20 border border-green-700/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Team successfully deployed! Invitations have been sent.</span>
            </div>
          )}
          
          {deployStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-700/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>Failed to deploy team. Please try again.</span>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isLoading || !selectedProject}
              whileHover={!isLoading && selectedProject ? { scale: 1.02 } : {}}
              whileTap={!isLoading && selectedProject ? { scale: 0.98 } : {}}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-white ${
                !selectedProject 
                  ? 'bg-gray-700/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Deploying Team...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Deploy Team to Project</span>
                </>
              )}
            </motion.button>
            
            <p className="text-gray-500 text-xs mt-2 text-center">
              This will send invitation emails to all team members
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default TeamDeployment;