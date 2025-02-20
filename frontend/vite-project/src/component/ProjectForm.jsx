import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const CreateProjectForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const { createProject } = useProjects();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Validate current step
  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
      }
    } else if (stepNumber === 2) {
      if (!formData.deadline) {
        newErrors.deadline = 'Deadline is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const hasNameError = !formData.name.trim();
    const hasDeadlineError = !formData.deadline;

    if (hasNameError || hasDeadlineError) {
      setErrors({
        ...(hasNameError && { name: 'Project name is required' }),
        ...(hasDeadlineError && { deadline: 'Deadline is required' })
      });
      return;
    }

    setLoading(true);
    try {
      await createProject(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: error.message || 'Failed to create project' });
    } finally {
      setLoading(false);
    }
  };

  // Update the steps array to include error display
  const steps = [
    {
      title: 'Basic Info',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-200 mb-2">Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-gray-700 text-gray-200 border ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500`}
              placeholder="Enter project name"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-200 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Enter project description"
              rows="4"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Timeline & Priority',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-200 mb-2">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`w-full bg-gray-700 text-gray-200 border ${
                errors.deadline ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500`}
              required
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-200 mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-200">Create New Project</h2>
          <p className="text-gray-400">Step {step} of {steps.length}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-6"
            >
              {steps[step - 1].component}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div /> // Empty div for spacing
            )}
            
            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProjectForm;