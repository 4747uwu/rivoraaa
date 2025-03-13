import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedGreeting = ({ name }) => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetings = [
    `Hello,`,
    `Bonjour,`,
    `Hola,`,
    `नमस्ते,`,
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % greetings.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.span
      key={greetingIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {greetings[greetingIndex]}
    </motion.span>
  );
};

export default AnimatedGreeting;