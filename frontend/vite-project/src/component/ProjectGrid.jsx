// ZenProjectCard Component - Image-focused card with separate content section
import { ArrowUpRight, Clock, Edit2, Trash2 } from 'react-feather';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ZenProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  
  // Default project image if none provided
  const projectImage = project.image || 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  
  // Calculate progress
  const getProgressPercentage = () => {
    if (project.progress !== undefined) {
      const progress = typeof project.progress === 'number' ? project.progress : 0;
      return progress > 1 ? progress : progress * 100;
    }
    
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 50;
    return 0;
  };
  
  const progressPercent = getProgressPercentage();
  
  // Priority colors
  const getPriorityColor = () => {
    switch(project.priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default: return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 h-[500px] flex flex-col group"
    >
      {/* Image section - 60% height */}
      <div className="relative h-[60%]">
        <img 
          src={projectImage} 
          alt={project.name || 'Project'}
          className="w-full h-full object-cover"
          onClick={() => navigate(`/project/${project._id}`)}
        />
        
        {/* Priority badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor()} border shadow-md backdrop-blur-sm`}>
            {project.priority || 'Low'}
          </span>
        </div>
        
        {/* Action buttons, only visible on hover */}
        <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-200 hover:bg-purple-600/80 transition-all"
            title="Edit Project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project._id);
            }}
            className="p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-200 hover:bg-red-600/80 transition-all"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Text content section - 40% height */}
      <div 
        className="p-5 flex flex-col h-[40%] border-t border-indigo-500/20"
        onClick={() => navigate(`/project/${project._id}`)}
      >
        {/* Project title */}
        <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1">{project.name}</h3>
        
        {/* Project description */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-auto">{project.description}</p>
        
        {/* Bottom row with deadline and status */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(project.deadline)}</span>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}>
            {formatStatus(project.status)}
          </span>
        </div>
        
        {/* View button */}
        <div className="mt-3 flex justify-end">
          <button 
            onClick={() => navigate(`/project/${project._id}`)}
            className="flex items-center gap-1 text-white bg-indigo-600/70 hover:bg-indigo-600 transition-colors px-3 py-1.5 rounded-lg text-xs"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};