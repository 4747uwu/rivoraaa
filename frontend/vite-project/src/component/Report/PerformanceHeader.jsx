import React from 'react';
import { Loader } from 'lucide-react';

const PerformanceHeader = ({ username, generatedAt, isGenerating, onRefresh }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 flex justify-between items-center border-b border-gray-200">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
            {username?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          Performance Report: {username || "User"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Generated {new Date(generatedAt).toLocaleString()}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={isGenerating}
        className={`px-4 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-600 text-sm
                  hover:bg-blue-100 transition-colors flex items-center ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isGenerating ? (
          <>
            <Loader size={14} className="mr-1.5 animate-spin" />
            Updating...
          </>
        ) : (
          'Refresh Analysis'
        )}
      </button>
    </div>
  );
};

export default PerformanceHeader;