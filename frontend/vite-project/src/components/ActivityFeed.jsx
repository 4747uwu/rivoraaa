import React from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Calendar } from 'lucide-react';

const ActivityFeed = ({ darkMode, glassCard, textClass, subTextClass }) => {
  return (
    <div className={`${glassCard} rounded-xl p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Recent Activity</h2>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'} rounded-lg`}
          >
            <Activity className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div className="flex-1">
              <p className={textClass}>Task completed: Project Update</p>
              <span className={`text-xs ${subTextClass}`}>2 hours ago</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
