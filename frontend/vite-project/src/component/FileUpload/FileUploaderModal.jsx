import React from 'react';
import { X, Upload, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploader from './FileUploader';

const FileUploaderModal = ({ isOpen, onClose, taskId, projectId, onUploadComplete }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2"></div>
          
          {/* Modal header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <FileUp size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Upload File</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Modal content */}
          <div className="p-5">
            <FileUploader 
              taskId={taskId}
              projectId={projectId}
              onUploadComplete={(file) => {
                onUploadComplete(file);
                onClose();
              }}
            />
          </div>
          
          {/* Modal footer */}
          <div className="bg-gray-50 px-5 py-4 flex justify-between items-center border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Max file size: 10MB
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUploaderModal;