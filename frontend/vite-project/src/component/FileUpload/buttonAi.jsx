import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const AIAnalysisButton = ({ 
  file, 
  onViewAnalysis, 
  onRequestAnalysis,
  isProcessing = false,
  forceRefresh = 0
}) => {
  // Local state to track if this file has insights
  const [hasInsights, setHasInsights] = useState(false);
  
  // This effect runs on initial render and whenever dependencies change
  useEffect(() => {
    // More robust check for insights
    const fileHasInsights = !!(
      file && 
      file.aiInsights && 
      (file.aiInsights.summary || 
       (file.aiInsights.keyPoints && file.aiInsights.keyPoints.length) ||
       file.aiInsights.insights || 
       file.aiInsights.analysis
      )
    );
    
    // Update local state
    setHasInsights(fileHasInsights);
    
    // Debug log
    console.log(`Button state updated for ${file?.name || 'unknown file'}:`, {
      fileId: file?._id,
      hasInsights: fileHasInsights,
      aiInsightsExists: !!file?.aiInsights,
      aiInsights: file?.aiInsights,
      forceRefreshValue: forceRefresh
    });
  }, [file, forceRefresh]); // Don't rely on nested property that might be undefined
  
  if (!file) return null;
  
  // If processing this specific file
  if (isProcessing) {
    return (
      <button
        disabled
        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
        bg-purple-50 text-purple-500"
      >
        <Loader2 size={16} className="animate-spin" />
        Analyzing...
      </button>
    );
  }
  
  // Handle button click with more robust error handling
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      if (hasInsights && file.aiInsights) {
        console.log('Viewing analysis for:', file.name);
        onViewAnalysis(file);
      } else {
        console.log('Requesting analysis for:', file.name);
        onRequestAnalysis(file);
      }
    } catch (error) {
      console.error('Error in AI button click handler:', error);
    }
  };
  
  // Add additional check for insights right before rendering
  const displayHasInsights = hasInsights || !!(file?.aiInsights?.summary);
  
  return (
    <button
      onClick={handleClick}
      title={displayHasInsights ? "View AI analysis results" : "Generate AI analysis"}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium 
      ${displayHasInsights 
        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
      transition-colors`}
    >
      <Sparkles size={16} className={displayHasInsights ? "text-purple-500" : "text-gray-500"} />
      {displayHasInsights ? 'View Analysis' : 'Analyze with AI'}
    </button>
  );
};

export default AIAnalysisButton;