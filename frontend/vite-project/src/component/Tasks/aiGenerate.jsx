import React, { useState } from 'react';
import axios from 'axios';
import { Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingAnimation = () => (

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white rounded-lg p-8 flex flex-col items-center">
      <div className="flex items-center justify-center mb-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 text-blue-600"
        >
          <Wand2 size={64} />
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Tasks</h3>
      <p className="text-gray-600 text-center">
        AI is analyzing your project and creating optimized tasks...
      </p>
    </div>
  </motion.div>
);

const GenerateAITasks = ({ 
  projectId, 
  projectName, 
  projectDescription, 
  teamMembers, 
  projectDeadline,
  className,
  onTasksGenerated // Add this prop
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
      const backendUrl = import.meta.env.VITE_API_URL;

    const handleGenerateTasks = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            const response = await axios.post(`${backendUrl}/api/ai/generateAITasks`, {
                projectId,
                projectName,
                projectDescription,
                teamMembers: teamMembers.map(member => member._id) || [],
                projectDeadline,
            });

            if (response.data) {
                console.log('Generated tasks:', response.data);
                // Trigger parent component refresh
                if (onTasksGenerated) {
                    onTasksGenerated(response.data);
                }
            }
        } catch (err) {
            setError('Failed to generate tasks. Please try again.');
            console.error('Task generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {isGenerating && <LoadingAnimation />}
            <div className="flex flex-col items-center gap-4 my-2">
                <button
                    onClick={handleGenerateTasks}
                    disabled={isGenerating}
                    className={className || `px-4 py-2 bg-indigo-600 text-white rounded-lg 
                         hover:bg-indigo-700 transition-colors flex items-center gap-2
                         ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isGenerating ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <Wand2 size={16} />
                    )}
                    <span className="font-medium">
                        {isGenerating ? 'Generating...' : 'AI Tasks'}
                    </span>
                </button>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-md"
                    >
                        {error}
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default GenerateAITasks;