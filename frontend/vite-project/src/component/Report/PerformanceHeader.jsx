import React from 'react';
import { Loader, RefreshCw } from 'lucide-react';

const PerformanceHeader = ({ username, generatedAt, isGenerating, onRefresh }) => {
  return (
    <div className="bg-gradient-to-r from-[#1A1A1A] via-[#1E1E1E] to-[#1A1A1A] 
                  p-6 flex justify-between items-center border-b border-gray-800/40
                  backdrop-blur-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-100 flex items-center">
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 
                        text-white w-8 h-8 rounded-full flex items-center 
                        justify-center mr-2 shadow-lg shadow-indigo-500/20">
            {username?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          Performance Report: {username || "User"}
        </h2>
        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
          <span>Generated {new Date(generatedAt).toLocaleString()}</span>
        </p>
      </div>
      
      <button
        onClick={onRefresh}
        disabled={isGenerating}
        className={`px-4 py-2 rounded-lg bg-[#232323] text-gray-200 text-sm
                  border border-gray-800/40 hover:bg-[#2A2A2A] 
                  transition-all duration-200 flex items-center gap-2
                  hover:border-indigo-500/30 hover:shadow-lg 
                  hover:shadow-indigo-500/10 ${
                    isGenerating ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
      >
        {isGenerating ? (
          <>
            <Loader size={14} className="animate-spin text-indigo-400" />
            <span className="text-gray-400">Updating...</span>
          </>
        ) : (
          <>
            <RefreshCw size={14} className="text-indigo-400" />
            <span>Refresh Analysis</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PerformanceHeader;