import React, { useState } from 'react';
import axios from 'axios';
import { Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 backdrop-blur-sm bg-black/60 flex items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-[#121212]/90 rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col items-center max-w-sm mx-4"
    >
      {/* Neural network animation */}
      <div className="relative w-28 h-28 mb-6">
        {/* Central node */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Orbital nodes */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const radius = 34;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <React.Fragment key={i}>
              {/* Connection line */}
              <motion.div
                className="absolute top-1/2 left-1/2 h-0.5 origin-left bg-gradient-to-r from-indigo-500/70 to-indigo-500/20"
                style={{
                  width: radius,
                  rotate: `${i * 30}deg`,
                  translateX: '0%',
                  translateY: '-50%',
                }}
                animate={{
                  opacity: [0.1, 0.6, 0.1],
                }}
                transition={{
                  duration: 3,
                  delay: i % 5 * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Node */}
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/50"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translateX(calc(${x}px - 50%)) translateY(calc(${y}px - 50%))`,
                }}
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </React.Fragment>
          );
        })}
        
        {/* Data transfer pulses */}
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={`pulse-${index}`}
            className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-indigo-400/10"
            animate={{
              scale: [0, 4],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 2,
              delay: index * 0.6,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
      
      {/* Text content with animation */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Generating Tasks
        </h3>
        <div className="space-y-2">
          <p className="text-gray-300 text-sm">
            AI is analyzing your project and creating optimized tasks...
          </p>
          
          {/* Animated progress bar */}
          <div className="h-1 w-full bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ 
                width: ["0%", "100%"],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 pt-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
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