
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, UserMinus, LogOut, Loader } from 'lucide-react';

const RemoveMemberConfirmation = ({ member, leaveProject = false, onConfirm, onCancel, isLoading }) => {
  const isRemovingSelf = leaveProject;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-center mb-5">
          <div className="bg-red-50 p-3 rounded-full">
            {isRemovingSelf ? (
              <LogOut size={28} className="text-red-500" />
            ) : (
              <UserMinus size={28} className="text-red-500" />
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {isRemovingSelf ? 'Leave Project' : 'Remove Member'}
        </h3>
        
        <p className="text-center text-gray-600 mb-6">
          {isRemovingSelf ? (
            <>
              Are you sure you want to leave this project? You'll lose access to all project data unless someone adds you back.
            </>
          ) : (
            <>
              Are you sure you want to remove <span className="font-semibold">{member?.username}</span> from this project? They will lose access to all project data.
            </>
          )}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                {isRemovingSelf ? 'Leaving...' : 'Removing...'}
              </>
            ) : (
              <>
                {isRemovingSelf ? 'Yes, Leave Project' : 'Yes, Remove Member'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RemoveMemberConfirmation;