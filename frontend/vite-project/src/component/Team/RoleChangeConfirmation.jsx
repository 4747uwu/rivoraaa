import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, UserCheck, UserX, Loader } from 'lucide-react';

const RoleChangeConfirmation = ({ member, newRole, onConfirm, onCancel, isLoading }) => {
  // Get role display information
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin',
          icon: Shield,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Full access including member management'
        };
      case 'member':
        return {
          title: 'Member',
          icon: UserCheck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Can edit tasks and add comments'
        };
      case 'viewer':
        return {
          title: 'Viewer',
          icon: UserX,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: 'Read-only access to project'
        };
      default:
        return {
          title: role,
          icon: UserCheck,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: 'Role permissions'
        };
    }
  };

  const currentRoleInfo = getRoleInfo(member?.role);
  const newRoleInfo = getRoleInfo(newRole);
  
  // Determine if this is a promotion or demotion
  const isPromotion = 
    (member?.role === 'viewer' && ['member', 'admin'].includes(newRole)) || 
    (member?.role === 'member' && newRole === 'admin');
  
  const isDemotion = 
    (member?.role === 'admin' && ['member', 'viewer'].includes(newRole)) || 
    (member?.role === 'member' && newRole === 'viewer');

  const NewRoleIcon = newRoleInfo.icon;
  const CurrentRoleIcon = currentRoleInfo.icon;

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
          <div className={`${isDemotion ? 'bg-amber-50' : 'bg-blue-50'} p-3 rounded-full`}>
            {isDemotion ? (
              <AlertTriangle size={28} className="text-amber-500" />
            ) : (
              <NewRoleIcon size={28} className={newRoleInfo.color} />
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {isDemotion ? 'Change Role (Demotion)' : isPromotion ? 'Change Role (Promotion)' : 'Change Role'}
        </h3>
        
        <p className="text-center text-gray-600 mb-6">
          Are you sure you want to change <span className="font-semibold">{member?.username}</span>'s role from{' '}
          <span className={`font-semibold ${currentRoleInfo.color}`}>{currentRoleInfo.title}</span> to{' '}
          <span className={`font-semibold ${newRoleInfo.color}`}>{newRoleInfo.title}</span>?
        </p>

        <div className="flex gap-3 mb-6">
          {/* Current role */}
          <div className="flex-1 p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CurrentRoleIcon size={16} className={currentRoleInfo.color} />
              <span className="font-medium">Current: {currentRoleInfo.title}</span>
            </div>
            <p className="text-xs text-gray-500">{currentRoleInfo.description}</p>
          </div>
          
          {/* New role */}
          <div className={`flex-1 p-3 border border-gray-200 rounded-lg ${newRoleInfo.bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <NewRoleIcon size={16} className={newRoleInfo.color} />
              <span className="font-medium">New: {newRoleInfo.title}</span>
            </div>
            <p className="text-xs text-gray-500">{newRoleInfo.description}</p>
          </div>
        </div>
        
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
            className={`flex-1 py-2 rounded-lg text-white transition-colors flex items-center justify-center
              ${isDemotion 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              `Confirm Change`
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoleChangeConfirmation;