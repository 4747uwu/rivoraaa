import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Users, Settings } from 'lucide-react';

const QuickActions = ({ darkMode, glassCard, textClass }) => {
  const actions = [
    { icon: Plus, label: 'New Project', color: 'text-green-500' },
    { icon: FileText, label: 'Create Report', color: 'text-blue-500' },
    { icon: Users, label: 'Team Meeting', color: 'text-purple-500' },
    { icon: Settings, label: 'Settings', color: 'text-gray-500' }
  ];

  return (
    <div className={`${glassCard} rounded-xl p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 ${darkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg flex flex-col items-center gap-2`}
          >
            <action.icon className={`w-6 h-6 ${action.color}`} />
            <span className={textClass}>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
