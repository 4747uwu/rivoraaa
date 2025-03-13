import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, Tag, BarChart4, FileCode, PanelRight, AlertTriangle, Loader2, Brain } from 'lucide-react';

const AIAnalysisViewer = ({ 
  isOpen, 
  onClose, 
  insights, 
  onRequestAnalysis = null, 
  currentFile = null,
  isLoading = false 
}) => {
  // Early return if not open
  if (!isOpen) return null;
  
  // Debug logs to help troubleshoot when loading state isn't working
  console.log("AIAnalysisViewer rendering with:", { 
    isOpen, isLoading, 
    hasInsights: !!insights, 
    currentFile: currentFile?.name 
  });
  
  // Make sure loading state takes priority over other states
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Loading Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Brain className="text-white" size={24} />
                <h2 className="text-xl font-semibold text-white">Analyzing File</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Loading Content */}
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                AI Analysis in Progress
              </h3>
              <p className="text-gray-600 max-w-xs">
                {currentFile?.name ? `Analyzing "${currentFile.name}"...` : 'Analyzing your file...'}
              </p>
              <div className="mt-6 space-y-2 w-full max-w-sm">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Extracting text</span>
                  <span>Generating insights</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-8">
              This may take a moment depending on the file size and complexity.
            </p>
            
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Check if we have valid insights
  const hasValidInsights = insights && insights.summary;
  
  // If insights aren't available, show a fallback view with an option to request analysis
  if (!hasValidInsights) {
    // Your existing no insights UI - unchanged
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Rest of your no insights UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* No insights UI */}
       
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-xl py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-white" size={24} />
                <h2 className="text-xl font-semibold text-white">No Analysis Available</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-gray-700 mb-4">
              This file hasn't been analyzed by AI yet. Would you like to analyze it now?
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              
              {onRequestAnalysis && currentFile && (
                <button
                  onClick={() => {
                    onRequestAnalysis(currentFile);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Sparkles size={16} className="mr-2" />
                  Analyze Now
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Rest of your component for displaying insights
  // Extract data from valid insights
  const {
    summary,
    keyPoints = [],
    sentiment = 'neutral',
    tags = [],
    extractedData = {},
    processedAt
  } = insights;
  
  // Rest of your render code is unchanged
  
  // Format the processed date
  const formattedDate = processedAt 
    ? new Date(processedAt).toLocaleString() 
    : 'Unknown';
    
  // Your existing getSentimentColor and renderExtractedData functions
  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };
  
  const renderExtractedData = (data, level = 0) => {
    if (!data || typeof data !== 'object') return null;
    
    return (
      <div className={`${level > 0 ? 'pl-4 border-l border-gray-200 ml-2' : ''}`}>
        {Object.entries(data).map(([key, value]) => {
          // Skip empty values
          if (value === null || value === undefined) return null;
          
          // Handle arrays
          if (Array.isArray(value)) {
            return (
              <div key={key} className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                <div className="space-y-2">
                  {value.map((item, i) => (
                    <div key={i} className="ml-2">
                      {typeof item === 'object' ? (
                        renderExtractedData(item, level + 1)
                      ) : (
                        <div className="text-sm text-gray-600">{item}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          // Handle nested objects
          if (typeof value === 'object') {
            return (
              <div key={key} className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                {renderExtractedData(value, level + 1)}
              </div>
            );
          }
          
          // Handle simple values
          return (
            <div key={key} className="mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>{' '}
              <span className="text-sm text-gray-600">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Return insights UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Rest of your insights display UI */}
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-xl py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-white" size={24} />
              <h2 className="text-xl font-semibold text-white">AI Analysis Insights</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Analyzed on {formattedDate}
          </p>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Section */}
          <div>
            <div className="flex items-center mb-3">
              <FileText className="text-purple-600 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{summary}</p>
          </div>
          
          {/* Key Points */}
          {keyPoints && keyPoints.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <BarChart4 className="text-blue-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Key Points</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                {keyPoints.map((point, i) => (
                  <li key={i} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Sentiment */}
          {sentiment && (
            <div>
              <div className="flex items-center mb-3">
                <PanelRight className="text-green-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Overall Sentiment</h3>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full capitalize ${getSentimentColor(sentiment)}`}>
                {sentiment}
              </div>
            </div>
          )}
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <Tag className="text-amber-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Extracted Data */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <FileCode className="text-indigo-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Extracted Information</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {renderExtractedData(extractedData)}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <Sparkles size={14} className="text-purple-500 mr-1.5" />
              Powered by Google Gemini AI
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAnalysisViewer;