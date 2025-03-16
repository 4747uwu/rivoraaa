import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from './context/themeContext';

const quotes = {
  humorous: [
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "The only thing I know is that I know nothing.", author: "Socrates" },
    { text: "People say nothing is impossible, but I do nothing every day.", author: "A.A. Milne" },
    { text: "A day without laughter is a day wasted.", author: "Charlie Chaplin" },
    { text: "Before you marry a person, you should first make them use a computer with slow internet.", author: "Will Ferrell" },
    { text: "I am an old man and have known many troubles, but most never happened.", author: "Mark Twain" },
    { text: "You can't have everything. Where would you put it?", author: "Steven Wright" },
    { text: "Age is something that doesn't matter unless you are a cheese.", author: "Luis Buñuel" },
    { text: "I can resist everything except temptation.", author: "Oscar Wilde" }
  ],
  serious: [
    { text: "Happiness depends upon ourselves.", author: "Aristotle" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "He who opens a school door, closes a prison.", author: "Victor Hugo" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" }
  ]
};

const QuotesWidget = () => {
  const [mode, setMode] = useState('humorous'); // 'humorous' or 'serious'
  const [currentQuote, setCurrentQuote] = useState({});
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { darkMode } = useTheme();

  // Select a random quote when mode changes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes[mode].length);
    setQuoteIndex(randomIndex);
    setCurrentQuote(quotes[mode][randomIndex]);
  }, [mode]);

  // Change quote every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      let newIndex = (quoteIndex + 1) % quotes[mode].length;
      setQuoteIndex(newIndex);
      setCurrentQuote(quotes[mode][newIndex]);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [quoteIndex, mode]);

  // Get a new quote manually
  const getNewQuote = (e) => {
    e.stopPropagation();
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes[mode].length);
    } while (newIndex === quoteIndex && quotes[mode].length > 1);
    
    setQuoteIndex(newIndex);
    setCurrentQuote(quotes[mode][newIndex]);
  };

  // Toggle between humorous and serious modes
  const toggleMode = (e) => {
    e.stopPropagation();
    setMode(prev => prev === 'humorous' ? 'serious' : 'humorous');
  };

  // Visual styles based on mode
  const modeStyles = {
    humorous: {
      gradient: darkMode 
        ? 'from-purple-600/30 via-indigo-600/20 to-blue-600/30' 
        : 'from-purple-200 via-indigo-100 to-blue-200',
      icon: 'text-purple-400',
      border: darkMode ? 'border-purple-500/30' : 'border-purple-300',
      highlight: darkMode ? 'text-purple-300' : 'text-purple-700'
    },
    serious: {
      gradient: darkMode 
        ? 'from-blue-600/30 via-cyan-600/20 to-teal-600/30' 
        : 'from-blue-200 via-cyan-100 to-teal-200',
      icon: 'text-blue-400',
      border: darkMode ? 'border-blue-500/30' : 'border-blue-300',
      highlight: darkMode ? 'text-blue-300' : 'text-blue-700'
    }
  };

  const currentStyle = modeStyles[mode];

  return (
    <motion.div 
      className={`
        bg-gradient-to-br ${currentStyle.gradient}
        backdrop-blur-sm px-4 py-3 rounded-xl 
        border ${currentStyle.border}
        shadow-lg relative overflow-hidden
        h-full w-full flex flex-col
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background decorative quote marks */}
      <div className="absolute -bottom-3 -right-3 opacity-10 pointer-events-none">
        <Quote className="w-16 h-16" />
      </div>
      
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-1 z-10">
        {/* Mode toggle */}
        <button 
          onClick={toggleMode}
          className={`
            p-1.5 rounded-full 
            ${mode === 'humorous' 
              ? 'bg-blue-500/20 hover:bg-blue-500/30' 
              : 'bg-purple-500/20 hover:bg-purple-500/30'} 
            transition-colors duration-300 flex items-center gap-1
          `}
          title={`Switch to ${mode === 'humorous' ? 'serious' : 'humorous'} quotes`}
        >
          {mode === 'humorous' 
            ? <><Moon className="w-3 h-3 text-blue-400" /><span className="text-xs text-blue-300">Serious</span></> 
            : <><Sun className="w-3 h-3 text-purple-400" /><span className="text-xs text-purple-300">Humor</span></>}
        </button>
        
        {/* Refresh quote button */}
        <button
          onClick={getNewQuote}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="New quote"
        >
          <RefreshCw className="w-3 h-3 text-white/70" />
        </button>
      </div>
      
      {/* Quote content with animation */}
      <div className="flex-1 flex flex-col justify-center min-h-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30
            }}
            className="flex flex-col pl-5 justify-center h-full"
          >
            <blockquote className="text-sm font-medium items-center flex justify-center leading-tight text-gray-100 italic line-clamp-2">
              "{currentQuote.text}"
            </blockquote>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right mt-1"
            >
              <p className="text-xs font-medium text-white/80">
                — {currentQuote.author}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuotesWidget;