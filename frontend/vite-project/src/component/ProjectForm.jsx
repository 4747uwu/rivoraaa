import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, Send, AlertCircle, CheckCircle, XCircle, Loader, X,
  ArrowLeft, ArrowRight, CheckSquare, Settings, MessageSquare, Layers, 
  Calendar, Tag, Lock, Globe, Target, Clock, FileText, Upload, Image
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../api/api.js';
import { useTeam } from '../context/teamContext';
import { useAuth } from '../context/authContext';

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Step indicators component
const StepIndicator = memo(({ currentStep, totalSteps, stepTitles }) => {
  return (
    <div className="mb-8 pt-4">
      <div className="flex justify-between px-2">
        {stepTitles.map((title, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center ${
              i === currentStep 
                ? 'text-indigo-400' 
                : i < currentStep 
                  ? 'text-green-400' 
                  : 'text-gray-500'
            }`}
            style={{ width: `${100 / totalSteps}%` }}
          >
            <div className={`
              h-8 w-8 rounded-full flex items-center justify-center mb-2
              ${i === currentStep 
                ? 'bg-indigo-500/20 border-2 border-indigo-500' 
                : i < currentStep 
                  ? 'bg-green-500/20 border-2 border-green-500' 
                  : 'bg-gray-800 border-2 border-gray-700'}
            `}>
              {i < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm">{i + 1}</span>
              )}
            </div>
            <span className="text-xs text-center hidden md:block">{title}</span>
          </div>
        ))}
      </div>
      
      <div className="relative mt-2">
        <div className="absolute top-0 h-1 bg-gray-700 w-full"></div>
        <div 
          className="absolute top-0 h-1 bg-indigo-500 transition-all duration-300"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
});

// Project visibility option component
const VisibilityOption = memo(({ value, selectedValue, onChange, title, description, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onChange(value)}
    className={`p-4 rounded-lg border cursor-pointer transition-all ${
      selectedValue === value
        ? 'bg-indigo-900/30 border-indigo-500/50'
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
    }`}
  >
    <div className="flex items-start">
      <div className={`p-2 rounded-md mr-3 flex-shrink-0 ${
        selectedValue === value 
          ? 'bg-indigo-500/20 text-indigo-400'
          : 'bg-gray-700/50 text-gray-500'
      }`}>
        <Icon size={20} />
      </div>
      
      <div className="flex-1">
        <div className="text-gray-200 font-medium">{title}</div>
        <div className="text-gray-400 text-xs mt-1">{description}</div>
      </div>
      
      <div className={`w-5 h-5 rounded-full border flex-shrink-0 ${
        selectedValue === value 
          ? 'bg-indigo-500 border-indigo-500'
          : 'bg-transparent border-gray-600'
      }`}>
        {selectedValue === value && (
          <div className="w-3 h-3 bg-white rounded-full m-auto" />
        )}
      </div>
    </div>
  </motion.div>
));

// Category tag component
const CategoryTag = memo(({ category, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(category)}
    className={`px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all ${
      isSelected 
        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' 
        : 'bg-gray-800/40 text-gray-400 border border-gray-700/50 hover:bg-gray-800/80'
    }`}
  >
    {category}
  </motion.div>
));

// Team Card component
const TeamCard = memo(({ team, isSelected, onSelect }) => (
  <motion.div
    key={team._id}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(team)}
    className={`p-4 rounded-lg border transition-all cursor-pointer ${
      isSelected
        ? 'bg-indigo-900/30 border-indigo-500/50'
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
    }`}
  >
    <div className="flex items-start">
      {/* Team Icon */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
          {team.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      {/* Team Details */}
      <div className="flex-grow">
        <h5 className="text-gray-200 font-medium">{team.name}</h5>
        <div className="flex items-center text-sm text-gray-400 mt-1">
          <Users size={14} className="mr-1" />
          <span>{team.members.length + 1} members</span>
          
          {team.category && (
            <>
              <span className="mx-2">•</span>
              <span className="text-indigo-400">{team.category}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Selection Indicator */}
      <div className="flex-shrink-0 w-5 h-5">
        {isSelected && (
          <CheckSquare className="text-indigo-500" size={20} />
        )}
      </div>
    </div>
  </motion.div>
));

// Role selection component
const RoleOption = memo(({ value, selectedRole, onChange, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onChange(value)}
    className={`p-3 rounded-lg border cursor-pointer transition-all ${
      selectedRole === value
        ? 'bg-indigo-900/30 border-indigo-500/50'
        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
    }`}
  >
    <div className="flex items-center">
      <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 ${
        selectedRole === value 
          ? 'bg-indigo-500 border-indigo-500'
          : 'bg-transparent border-gray-600'
      }`}>
        {selectedRole === value && (
          <div className="w-2 h-2 bg-white rounded-full m-auto" />
        )}
      </div>
      
      <div>
        <div className="text-gray-200 font-medium">{title}</div>
        <div className="text-gray-400 text-xs">{description}</div>
      </div>
    </div>
  </motion.div>
));

// Main component
const CreateProjectForm = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMyTeams } = useTeam(); // Use getMyTeams function instead of the hook
  
  // State for teams data
  const [teamsData, setTeamsData] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const result = await getMyTeams();
        console.log('Teams fetched:', result);
        setTeamsData(result);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err);
      } finally {
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [getMyTeams]);
  
  // Extract owned teams from the response
  const teams = useMemo(() => {
    console.log('Teams data for extraction:', teamsData);
    return teamsData?.ownedTeams?.data || [];
  }, [teamsData]);
  
  console.log('Extracted teams:', teams);
  
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const stepTitles = ["Project Info", "Details & Settings", "Team Selection", "Review & Create"];
  const totalSteps = stepTitles.length;
  
  // Form state
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    category: "",
    startDate: new Date().toISOString().split('T')[0], // This will be used as deadline
    endDate: "",
    priority: "medium", // Add priority field with default value
    visibility: "private",
    coverImage: null,
    selectedTeam: null,
    teamRole: "member",
    teamMessage: ""
  });
  
  // Available categories
  const availableCategories = [
    "Web Development", "Mobile App", "Design", "Marketing", 
    "Research", "Data Analysis", "Education", "Event", "Other"
  ];
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [createdProjectId, setCreatedProjectId] = useState(null);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setProjectData(prev => ({
      ...prev,
      category: prev.category === category ? "" : category
    }));
  };
  
  // Handle team selection
  const handleTeamSelect = (team) => {
    setProjectData(prev => ({
      ...prev,
      selectedTeam: prev.selectedTeam?._id === team._id ? null : team
    }));
  };
  
  // Handle role selection
  const handleRoleChange = (role) => {
    setProjectData(prev => ({ ...prev, teamRole: role }));
  };
  
  // File upload handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setProjectData(prev => ({ ...prev, coverImage: file }));
    }
  };
  
  // Navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep, totalSteps]);
  
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);
  
  // Validation for each step
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        if (!projectData.name.trim()) {
          toast.error("Project name is required");
          return false;
        }
        if (projectData.name.length < 3) {
          toast.error("Project name should be at least 3 characters");
          return false;
        }
        return true;
        
      case 1:
        if (!projectData.description.trim()) {
          toast.error("Project description is required");
          return false;
        }
        if (!projectData.category) {
          toast.error("Please select a category");
          return false;
        }
        return true;
        
      case 2:
        // Team selection is optional
        return true;
        
      default:
        return true;
    }
  }, [currentStep, projectData]);
  
  // Handle next button click with validation
  const handleNextClick = useCallback(() => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  }, [validateCurrentStep, goToNextStep]);
  
  // Deploy team to project
  const deployTeam = async (projectId) => {
    try {
      if (!projectData.selectedTeam) return;
      
      await API.post(
        `/api/${projectData.selectedTeam._id}/deploy/${projectId}`,
        { 
          role: projectData.teamRole, 
          message: projectData.teamMessage 
        }
      );
      
      toast.success("Team successfully deployed to project!");
    } catch (error) {
      console.error("Failed to deploy team:", error);
      toast.error("Team deployment failed. You can add team members later.");
    }
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    // Additional comprehensive validation
    if (!projectData.name.trim()) {
      toast.error("Project name is required");
      setCurrentStep(0);
      return;
    }
    
    // Convert the startDate to deadline format expected by backend
    if (!projectData.startDate) {
      toast.error("Start date is required");
      setCurrentStep(1);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', projectData.name);
      formData.append('description', projectData.description || '');
      
      // Use startDate as deadline since backend expects deadline
      formData.append('deadline', projectData.startDate);
      
      // Add priority (default to medium if not provided)
      formData.append('priority', projectData.priority || 'medium');
      
      // Additional fields that the backend model supports
      formData.append('visibility', projectData.visibility);
      formData.append('category', projectData.category);
      
      // Optional end date
      if (projectData.endDate) {
        formData.append('endDate', projectData.endDate);
      }
      
      // Cover image
      if (projectData.coverImage) {
        formData.append('coverImage', projectData.coverImage);
      }
      
      // console.log('Submitting project with data:', {
      //   name: projectData.name,
      //   description: projectData.description,
      //   deadline: projectData.startDate,
      //   priority: projectData.priority || 'medium',
      //   visibility: projectData.visibility,
      //   category: projectData.category
      // });
      
      // Send API request
      const response = await API.post('/api/projects', formData);
      
      setCreatedProjectId(response.data.project._id);
      setSubmitStatus('success');
      
      // If team is selected, deploy it
      if (projectData.selectedTeam) {
        await deployTeam(response.data.project._id);
      }
      
      toast.success("Project created successfully!");
      
      // Close form and navigate after success
      setTimeout(() => {
        onClose(); // Close the form
        // console.log('Navigating to project:', response.data.project._id);
        navigate(`/project/${response.data.project._id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Failed to create project:", error);
      setSubmitStatus('error');
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 1: Basic Project Info
  const BasicInfoStep = useMemo(() => (
    <motion.div
      key="basic-info"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          Create a New Project
        </h2>
        <p className="text-gray-400">
          Let's start with the basic information for your project.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Project Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={projectData.name}
            onChange={handleInputChange}
            placeholder="Enter project name"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Project Visibility */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-4">
            Project Visibility<span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <VisibilityOption
              value="private"
              selectedValue={projectData.visibility}
              onChange={(val) => setProjectData(prev => ({ ...prev, visibility: val }))}
              title="Private"
              description="Only you and invited members can see this project"
              icon={Lock}
            />
            
            <VisibilityOption
              value="public"
              selectedValue={projectData.visibility}
              onChange={(val) => setProjectData(prev => ({ ...prev, visibility: val }))}
              title="Public"
              description="Anyone with the link can view this project"
              icon={Globe}
            />
          </div>
        </div>
        
        {/* Cover Image */}
        {/* <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Cover Image <span className="text-gray-500">(Optional)</span>
          </label>
          
          <div className="mt-2">
            {projectData.coverImage ? (
              <div className="relative rounded-lg overflow-hidden w-full h-48 bg-gray-800/50 border border-gray-700">
                <img
                  src={URL.createObjectURL(projectData.coverImage)}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setProjectData(prev => ({ ...prev, coverImage: null }))}
                  className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="text-indigo-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    PNG, JPG or WebP (max. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div> */}
      </div>
      
      <div className="flex justify-end pt-4">
        <motion.button
          onClick={handleNextClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  ), [projectData.name, projectData.visibility, projectData.coverImage, handleNextClick, handleInputChange, handleFileChange]);
  
  // Step 2: Project Details
  const DetailsStep = useMemo(() => (
    <motion.div
      key="details"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          Project Details & Settings
        </h2>
        <p className="text-gray-400">
          Add more information about your project to help team members understand it better.
        </p>
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={projectData.description}
          onChange={handleInputChange}
          placeholder="Describe your project..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none"
        />
      </div>
      
      {/* Category */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Category<span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map(category => (
            <CategoryTag
              key={category}
              category={category}
              isSelected={projectData.category === category}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Start Date<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="date"
              name="startDate"
              value={projectData.startDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Target End Date <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="date"
              name="endDate"
              value={projectData.endDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
      
      {/* Priority Selection */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Priority
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setProjectData(prev => ({ ...prev, priority: 'low' }))}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              projectData.priority === 'low'
                ? 'bg-blue-900/30 border-blue-500/50'
                : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-200 font-medium">Low</div>
              <div className={`w-4 h-4 rounded-full border ${
                projectData.priority === 'low' 
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-transparent border-gray-600'
              }`}>
                {projectData.priority === 'low' && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setProjectData(prev => ({ ...prev, priority: 'medium' }))}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              projectData.priority === 'medium'
                ? 'bg-yellow-900/30 border-yellow-500/50'
                : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-200 font-medium">Medium</div>
              <div className={`w-4 h-4 rounded-full border ${
                projectData.priority === 'medium' 
                  ? 'bg-yellow-500 border-yellow-500'
                  : 'bg-transparent border-gray-600'
              }`}>
                {projectData.priority === 'medium' && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setProjectData(prev => ({ ...prev, priority: 'high' }))}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              projectData.priority === 'high'
                ? 'bg-red-900/30 border-red-500/50'
                : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-200 font-medium">High</div>
              <div className={`w-4 h-4 rounded-full border ${
                projectData.priority === 'high' 
                  ? 'bg-red-500 border-red-500'
                  : 'bg-transparent border-gray-600'
              }`}>
                {projectData.priority === 'high' && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={goToPreviousStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </motion.button>
        <motion.button
          onClick={handleNextClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  ), [
    projectData.description, projectData.category, projectData.startDate, 
    projectData.endDate, handleInputChange, handleCategorySelect, 
    goToPreviousStep, handleNextClick, availableCategories, projectData.priority
  ]);
  
  // Step 3: Team Selection
  const TeamSelectionStep = useMemo(() => (
    <motion.div
      key="team-selection"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-2"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          Add Your Team
        </h2>
        <p className="text-gray-400">
          Invite your team members to start collaborating on this project.
          <span className="block mt-1 text-gray-500 text-sm">(Optional: You can also add members later)</span>
        </p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h4 className="text-red-300 mb-2 text-lg">Error Loading Teams</h4>
          <p className="text-gray-400 mb-4">
            {error.message || "Failed to load your teams. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/30 text-red-300 rounded-lg text-sm hover:bg-red-500/40 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loadingTeams ? (
        <div className="flex justify-center py-8">
          <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-gray-800/40 rounded-lg p-6 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
          <h4 className="text-gray-300 mb-2 text-lg">No teams available</h4>
          <p className="text-gray-500 mb-4">
            You haven't created any teams yet. Create a team first to add members to this project.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-indigo-500/30 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/40 transition-colors"
            onClick={() => {
              window.open('/teamBuilder/new', '_blank');
            }}
          >
            Create a Team
          </motion.button>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Select a Team to Deploy
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-1">
              {teams.map(team => (
                <TeamCard
                  key={team._id}
                  team={team}
                  isSelected={projectData.selectedTeam?._id === team._id}
                  onSelect={handleTeamSelect}
                />
              ))}
            </div>
          </div>
          
          {projectData.selectedTeam && (
            <>
              {/* Role Selection */}
              <div className="pt-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Team Member Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <RoleOption 
                    value="member" 
                    selectedRole={projectData.teamRole} 
                    onChange={handleRoleChange}
                    title="Member"
                    description="Can view and edit project content"
                  />
                  
                  <RoleOption 
                    value="admin" 
                    selectedRole={projectData.teamRole} 
                    onChange={handleRoleChange}
                    title="Admin"
                    description="Full access to project management"
                  />
                  
                  <RoleOption 
                    value="viewer" 
                    selectedRole={projectData.teamRole} 
                    onChange={handleRoleChange}
                    title="Viewer"
                    description="Read-only access"
                  />
                </div>
              </div>
              
              {/* Invitation Message */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-indigo-400" />
                    <span>Invitation Message</span>
                    <span className="text-gray-500 font-normal">(Optional)</span>
                  </div>
                </label>
                <textarea
                  name="teamMessage"
                  value={projectData.teamMessage}
                  onChange={handleInputChange}
                  placeholder="Add a personal message to your team members..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
                />
              </div>
              
              {/* Team Member Preview */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-indigo-400 mr-2" />
                    <h5 className="text-gray-300 font-medium">Team Members</h5>
                  </div>
                  <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">
                    {projectData.selectedTeam.members.length + 1} members
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectData.selectedTeam.members.map(member => (
                    <div 
                      key={member._id} 
                      className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-md text-sm"
                    >
                      {member.name}
                    </div>
                  ))}
                  <div className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-md text-sm">
                    {user.name} (You)
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={goToPreviousStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </motion.button>
        <motion.button
          onClick={handleNextClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  ), [
    error, loadingTeams, teams, projectData.selectedTeam, projectData.teamRole, 
    projectData.teamMessage, handleTeamSelect, handleRoleChange, 
    handleInputChange, goToPreviousStep, handleNextClick, user
  ]);
  
  // Step 4: Review & Create - optimized for space
const ReviewStep = useMemo(() => (
  <motion.div
    key="review"
    variants={pageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="space-y-4" // Reduced spacing
  >
    <div className="mb-2"> {/* Reduced margin */}
      <h2 className="text-xl font-bold text-gray-200 mb-1"> {/* Smaller heading */}
        Review & Create
      </h2>
      <p className="text-gray-400 text-sm"> {/* Smaller text */}
        Review the details of your project before creating it.
      </p>
    </div>
    
    {/* Status Message */}
    {submitStatus === 'success' && (
      <div className="bg-green-900/20 border border-green-700/30 text-green-400 px-3 py-2 rounded-lg flex items-center gap-2 mb-2">
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">Project created successfully!</span>
      </div>
    )}
    
    {submitStatus === 'error' && (
      <div className="bg-red-900/20 border border-red-700/30 text-red-400 px-3 py-2 rounded-lg flex items-center gap-2 mb-2">
        <XCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">Failed to create project. Please try again.</span>
      </div>
    )}
    
    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1"> {/* Scrollable area with height limit */}
      {/* Two Column Layout for basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Project Name
          </label>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm">
            {projectData.name}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Category
          </label>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm">
            {projectData.category}
          </div>
        </div>
      </div>
      
      {/* Project Description */}
      <div>
        <label className="block text-gray-400 text-xs font-medium mb-1">
          Description
        </label>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm max-h-24 overflow-y-auto">
          {projectData.description}
        </div>
      </div>
      
      {/* Three Column Layout for metadata */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Visibility
          </label>
          <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            {projectData.visibility === "private" ? (
              <><Lock className="w-3 h-3 mr-1 text-gray-400" /> Private</>
            ) : (
              <><Globe className="w-3 h-3 mr-1 text-gray-400" /> Public</>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Priority
          </label>
          <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              projectData.priority === 'low' 
                ? 'bg-blue-500' 
                : projectData.priority === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}></div>
            {projectData.priority.charAt(0).toUpperCase() + projectData.priority.slice(1)}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Start Date
          </label>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm">
            {projectData.startDate}
          </div>
        </div>
      </div>
      
      {/* Conditionally shown end date */}
      {projectData.endDate && (
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            End Date
          </label>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm">
            {projectData.endDate}
          </div>
        </div>
      )}
      
      {/* Team Information - Collapsible section */}
      {projectData.selectedTeam && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h5 className="text-sm font-medium text-gray-300">Team: {projectData.selectedTeam.name}</h5>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Team Role</label>
              <span className="text-sm text-gray-300 capitalize">{projectData.teamRole}</span>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Members</label>
              <span className="text-sm text-gray-300">{projectData.selectedTeam.members.length + 1} members</span>
            </div>
          </div>
          
          {projectData.teamMessage && (
            <div>
              <label className="block text-gray-400 text-xs mb-1">Message</label>
              <div className="text-xs text-gray-400 italic bg-gray-800/40 p-2 rounded">
                "{projectData.teamMessage}"
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Cover Image - smaller version */}
      {projectData.coverImage && (
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1">
            Cover Image
          </label>
          <div className="relative rounded-lg overflow-hidden w-full h-32 bg-gray-800/50 border border-gray-700">
            <img
              src={URL.createObjectURL(projectData.coverImage)}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
    
    <div className="flex justify-between pt-3 mt-2 border-t border-gray-700/50">
      <motion.button
        onClick={goToPreviousStep}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </motion.button>
      <motion.button
        onClick={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Creating...</span>
          </>
        ) : (
          <>
            <CheckSquare size={16} />
            <span>Create Project</span>
          </>
        )}
      </motion.button>
    </div>
  </motion.div>
), [
  projectData, goToPreviousStep, handleSubmit, isSubmitting, submitStatus
]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl relative"
      >
        <button
          onClick={onClose} // Add onClick handler here
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>
        
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          stepTitles={stepTitles} 
        />
        
        <AnimatePresence mode="wait">
          {currentStep === 0 && BasicInfoStep}
          {currentStep === 1 && DetailsStep}
          {currentStep === 2 && TeamSelectionStep}
          {currentStep === 3 && ReviewStep}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Update the default export to include PropTypes validation
import PropTypes from 'prop-types';

CreateProjectForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default CreateProjectForm;