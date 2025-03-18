import React, { useState, useEffect } from 'react';
import Login from '../component/Login';
import { motion, AnimatePresence } from 'framer-motion';
import Waves from '../Pages/creative/linebc';

const Loginpage = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Enhanced feature highlights with impact words
  const featureHighlights = [
    {
      title: "Workflow Revolution",
      description: <>Transform your process with <span className="font-bold text-white">40% faster</span> task completion. <span className="text-white opacity-75">Streamline</span> your way to success.</>,
      icon: "⚡"
    },
    {
      title: "AI-Powered Organization",
      description: <>Discover intelligent categorization that makes teams <span className="font-bold text-white">3x more efficient</span>. <span className="text-white opacity-75">Smart</span> solutions for modern challenges.</>,
      icon: "🎯"
    },
    {
      title: "Seamless Synergy",
      description: <>Unite teams with <span className="font-bold text-white">real-time collaboration</span>. Break down silos and <span className="text-white opacity-75">amplify</span> results.</>,
      icon: "🤝"
    },
    {
      title: "Data Mastery",
      description: <>Harness <span className="font-bold text-white">predictive analytics</span> for decisions that drive <span className="text-white opacity-75">unprecedented</span> growth.</>,
      icon: "📊"
    },
    {
      title: "Fortress Security",
      description: <>Protect your assets with <span className="font-bold text-white">military-grade</span> encryption. <span className="text-white opacity-75">Unbreakable</span> security you can trust.</>,
      icon: "🔒"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => {
          setActiveFeatureIndex(prev => (prev + 1) % featureHighlights.length);
          setIsAnimating(false);
        }, 500);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featureHighlights.length, isAnimating]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <div className="flex h-screen w-full bg-black">
      <motion.div 
        className="w-1/2 relative overflow-hidden hidden md:block bg-[#080808]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Waves Background with adjusted properties */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <Waves
            lineColor="rgba(255, 255, 255, 0.15)"  // Reduced opacity for subtle effect
            backgroundColor="transparent"
            waveSpeedX={0.015}  // Slightly slower for smoother animation
            waveSpeedY={0.008}
            waveAmpX={50}       // Increased amplitude for more visible waves
            waveAmpY={25}
            friction={0.95}     // Adjusted for smoother movement
            tension={0.02}
            maxCursorMove={150}
            xGap={16}          // Increased gap for clearer lines
            yGap={40}
            style={{ mixBlendMode: 'overlay' }} // Blend mode for better integration
          />
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" style={{ zIndex: 2 }} />

        {/* Content Container - Increased z-index */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-16">
          {/* Feature Display with enhanced animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeatureIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="text-center max-w-xl"
            >
              {/* Enhanced Icon */}
              <motion.div
                className="text-5xl mb-8 opacity-90"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2 
                }}
              >
                {featureHighlights[activeFeatureIndex].icon}
              </motion.div>

              {/* Enhanced Title */}
              <motion.h2
                className="text-white text-4xl font-extralight mb-6 tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                <span className="gradient-text">{featureHighlights[activeFeatureIndex].title}</span>
              </motion.h2>

              {/* Enhanced Description */}
              <motion.p
                className="text-gray-400 text-lg leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {featureHighlights[activeFeatureIndex].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Progress Indicators */}
          <div className="mt-20 flex gap-3">
            {featureHighlights.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setActiveFeatureIndex(index)}
                className={`group relative transition-all duration-500 ease-out ${
                  index === activeFeatureIndex ? 'w-12' : 'w-2'
                }`}
              >
                <div className={`
                  h-0.5 rounded-full transition-all duration-500
                  ${index === activeFeatureIndex 
                    ? 'bg-white shadow-glow' 
                    : 'bg-gray-700 group-hover:bg-gray-600'
                  }
                `} />
                {index === activeFeatureIndex && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full blur-sm"
                    layoutId="indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Corner Elements - Increased z-index */}
        <div className="absolute top-8 right-8 w-24 h-24" style={{ zIndex: 15 }}>
          <motion.div 
            className="w-full h-full border-t border-r border-white/30" // Increased opacity
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
        </div>
        <div className="absolute bottom-8 left-8 w-24 h-24" style={{ zIndex: 15 }}>
          <motion.div 
            className="w-full h-full border-b border-l border-white/30" // Increased opacity
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Right Column - Login Form */}
      <div className="w-full md:w-1/2 bg-[#0a0a0a]">
        <div className="w-full h-full flex items-center justify-center">
          <Login />
        </div>
      </div>
    </div>
  );
};

// Add these styles to your global CSS or create a new CSS module
const styles = `
  .shadow-glow {
    box-shadow: 0 0 10px rgba(255,255,255,0.3);
  }
  
  .gradient-text {
    background: linear-gradient(to right, #fff, #ccc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

export default Loginpage;