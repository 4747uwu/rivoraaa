// import React, { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { TrendingUp, AlertTriangle, Sparkles, Brain, Maximize2, X, RotateCcw } from 'lucide-react';
// import axios from 'axios';

// const AIInsightsCard = ({ project, setProject, userHasPermission, currentUser }) => {
//   const [activeInsight, setActiveInsight] = useState('risk');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [error, setError] = useState(null);
//   const [showFullInsights, setShowFullInsights] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const timeoutRef = useRef(null);
//   const mountedRef = useRef(true);
  
//   // Short alias for AI insights
//   const aiInsights = project?.aiInsights || {};

//   // Check if any previous insights exist
//   const hasInsights = Boolean(
//     aiInsights.workloadAnalysis ||
//     aiInsights.riskAnalysis ||
//     aiInsights.recommendation ||
//     aiInsights.predictedDeadline
//   );

//   // Clean up timeouts on unmount and set mounted flag
//   useEffect(() => {
//     mountedRef.current = true;
    
//     return () => {
//       mountedRef.current = false;
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   // Improved refresh function with loading state and error handling
//   const refreshProjectData = async () => {
//     if (!project?._id || isRefreshing) return false;
    
//     setIsRefreshing(true);
    
//     try {
//       console.log('Fetching latest project data...');
//       const response = await axios.get(`/api/projects/${project._id}?_=${Date.now()}`);
      
//       // Only update state if the component is still mounted
//       if (mountedRef.current) {
//         console.log('Project data refreshed successfully');
//         setProject(response.data);
//         setIsRefreshing(false);
//         setError(null);
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error('Error fetching project data:', err);
//       if (mountedRef.current) {
//         setError(err.response?.data?.message || 'Failed to refresh project data');
//         setIsRefreshing(false);
//       }
//       return false;
//     }
//   };

//   // Handle generating insights with improved error and state management
//   const handleGenerateInsights = async () => {
//     if (!project?._id || isGenerating) return;
    
//     // Set loading state
//     setIsGenerating(true);
//     setError(null);
    
//     // Clear any existing timeouts
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
    
//     try {
//       // Trigger insight generation
//       console.log('Requesting AI analysis generation...');
//       await axios.post(`/api/ai/projects/${project._id}/analysis?_=${Date.now()}`);
      
//       // Use a recursive function for checking data with exponential backoff
//       const checkForInsights = (attempt = 1, maxAttempts = 6) => {
//         if (!mountedRef.current) return;
        
//         const delayMs = Math.min(5000 * attempt, 15000); // Exponential backoff, max 15s
        
//         console.log(`Scheduled check for insights (attempt ${attempt}, delay ${delayMs}ms)...`);
        
//         timeoutRef.current = setTimeout(async () => {
//           if (!mountedRef.current) return;
          
//           console.log(`Checking for insights (attempt ${attempt})...`);
//           const success = await refreshProjectData();
          
//           // Check if insights are available or we've reached max attempts
//           const hasNewInsights = Boolean(
//             project?.aiInsights?.workloadAnalysis ||
//             project?.aiInsights?.riskAnalysis ||
//             project?.aiInsights?.recommendation
//           );
          
//           if (hasNewInsights || attempt >= maxAttempts) {
//             if (mountedRef.current) {
//               setIsGenerating(false);
//             }
//           } else if (mountedRef.current) {
//             // Schedule next check
//             checkForInsights(attempt + 1, maxAttempts);
//           }
//         }, delayMs);
//       };
      
//       // Start checking process
//       checkForInsights();
      
//       // Show loading animation for at least 3 seconds for better UX
//       timeoutRef.current = setTimeout(() => {
//         if (!mountedRef.current) return;
        
//         console.log('Initial loading period complete');
//         // Refresh once to see if insights already exist
//         refreshProjectData().then(success => {
//           if (!mountedRef.current) return;
          
//           const hasNewInsights = Boolean(
//             project?.aiInsights?.workloadAnalysis ||
//             project?.aiInsights?.riskAnalysis ||
//             project?.aiInsights?.recommendation
//           );
          
//           // If insights already exist, end loading early
//           if (hasNewInsights) {
//             setIsGenerating(false);
//           }
//         });
//       }, 3000);
      
//     } catch (err) {
//       console.error('Error generating insights:', err);
//       if (mountedRef.current) {
//         setError(err.response?.data?.message || 'Failed to generate AI insights');
//         setIsGenerating(false);
//       }
//     }
//   };

//   // Simplified helper functions
//   const getProjectStatus = () => {
//     if (!project) return '';
//     const daysRemaining = Math.ceil(
//       (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
//     );
//     if (project.progress < 30 && daysRemaining < 7) return 'is at risk of delay';
//     if (project.progress > 70) return 'is on track for completion';
//     if (daysRemaining < 0) return 'is overdue';
//     return 'needs attention to meet deadline';
//   };

//   const formatPredictedDate = () => {
//     if (!aiInsights.predictedDeadline) return 'Not calculated';
//     const dateObj = new Date(aiInsights.predictedDeadline);
//     return isNaN(dateObj.getTime())
//       ? 'Not available'
//       : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const getDeadlineComparison = () => {
//     if (!aiInsights.predictedDeadline || !project?.deadline) return null;
//     const predictedDateObj = new Date(aiInsights.predictedDeadline);
//     if (isNaN(predictedDateObj.getTime())) return null;
//     const actualDateObj = new Date(project.deadline);
//     if (isNaN(actualDateObj.getTime())) return null;
    
//     const diffDays = Math.round(
//       (predictedDateObj - actualDateObj) / (1000 * 60 * 60 * 24)
//     );
//     if (diffDays > 0) {
//       return { text: `${diffDays} days later than planned`, color: 'text-red-400' };
//     } else if (diffDays < 0) {
//       return { text: `${Math.abs(diffDays)} days earlier than planned`, color: 'text-green-400' };
//     } else {
//       return { text: 'On target with plan', color: 'text-blue-400' };
//     }
//   };

//   const deadlineComparison = getDeadlineComparison();

//   const insightOptions = [
//     { id: 'workload', label: 'Workload', icon: <TrendingUp size={14} /> },
//     { id: 'risk', label: 'Risk', icon: <AlertTriangle size={14} /> },
//     { id: 'recommendations', label: 'Actions', icon: <Sparkles size={14} /> },
//   ];

//   const getActiveContent = () => {
//     switch (activeInsight) {
//       case 'workload':
//         return aiInsights.workloadAnalysis || 'No workload analysis available yet.';
//       case 'risk':
//         return aiInsights.riskAnalysis || 'No risk analysis available yet.';
//       case 'recommendations':
//         return aiInsights.recommendation || 'No recommendations available yet.';
//       default:
//         return 'Select an insight to view analysis.';
//     }
//   };

//   // Function to handle manual refresh with better state management
//   const handleManualRefresh = async () => {
//     console.log('Manual refresh requested');
//     await refreshProjectData();
//   };

//   // Get latest updated timestamp
//   const getLastUpdatedTime = () => {
//     if (!project) return '';
    
//     const timestamp = project.lastUpdated || project.updatedAt || new Date();
//     return new Date(timestamp).toLocaleString();
//   };

//   return (
//     <>
//       {/* Card */}
//       <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 text-white">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-sm font-medium text-gray-300">AI Insights</h3>
//           <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
//             <Brain size={12} className="text-white" />
//           </div>
//         </div>

//         {/* No insights yet */}
//         {!hasInsights && !isGenerating ? (
//           <div className="space-y-2">
//             <p className="text-gray-300 text-sm mb-1">
//               Based on current progress, this project {getProjectStatus()}.
//             </p>
//             {userHasPermission(currentUser, project, 'admin') && (
//               <button
//                 onClick={handleGenerateInsights}
//                 className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 
//                            text-white rounded-lg flex items-center justify-center 
//                            gap-2 transition-colors text-sm font-medium"
//                 disabled={isGenerating || isRefreshing}
//               >
//                 {isRefreshing ? (
//                   <>
//                     <div className="animate-spin mr-1">
//                       <RotateCcw size={14} />
//                     </div>
//                     <span>Refreshing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles size={14} />
//                     <span>Generate AI Insights</span>
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-3">

//             {/* Loading State */}
//             {isGenerating ? (
//               <div className="flex flex-col items-center justify-center py-4">
//                 <div className="animate-spin mb-2">
//                   <RotateCcw size={16} />
//                 </div>
//                 <span className="text-sm">
//                   Generating AI insights...
//                 </span>
//                 <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
//                   <motion.div
//                     className="h-full bg-blue-500 rounded-full"
//                     initial={{ width: '0%' }}
//                     animate={{ width: '100%' }}
//                     transition={{ duration: 15, ease: 'linear' }}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {/* Predicted Deadline Info */}
//                 {aiInsights.predictedDeadline && (
//                   <div className="flex justify-between items-center pb-0 mb-0">
//                     <div>
//                       <div className="text-xs text-gray-400">Predicted Completion</div>
//                       <div className="font-medium text-sm">{formatPredictedDate()}</div>
//                     </div>
//                     {deadlineComparison && (
//                       <div className={`text-sm ${deadlineComparison.color} font-medium`}>
//                         {deadlineComparison.text}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <div className="text-gray-300 text-sm mb-1">
//                   View detailed insights about workload distribution, risk factors, and recommended actions.
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={async () => {
//                       // Refresh data before showing modal
//                       setIsRefreshing(true);
//                       await refreshProjectData();
//                       setShowFullInsights(true);
//                     }}
//                     className="w-1/2 px-3 py-2 bg-gray-700 hover:bg-gray-600 
//                                text-white rounded-lg flex items-center justify-center 
//                                gap-2 transition-colors text-sm font-medium"
//                     disabled={isRefreshing}
//                   >
//                     {isRefreshing ? (
//                       <>
//                         <div className="animate-spin mr-1">
//                           <RotateCcw size={14} />
//                         </div>
//                         <span>Loading...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Maximize2 size={14} />
//                         <span>View Full Insights</span>
//                       </>
//                     )}
//                   </button>

//                   {userHasPermission(currentUser, project, 'admin') && (
//                     <button
//                       onClick={handleGenerateInsights}
//                       className="px-3 w-1/2 py-2 bg-blue-600 hover:bg-blue-700 
//                                  text-white rounded-lg flex items-center justify-center 
//                                  gap-2 transition-colors text-sm font-medium"
//                       disabled={isGenerating || isRefreshing}
//                     >
//                       {isGenerating || isRefreshing ? (
//                         <div className="animate-spin">
//                           <RotateCcw size={14} />
//                         </div>
//                       ) : (
//                         <Sparkles size={14} />
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Error */}
//             {error && (
//               <div className="text-red-400 text-xs mt-2">
//                 {error}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Full Insights Modal */}
//       {showFullInsights && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-900">AI Project Insights</h3>
//               <div className="flex items-center">
//                 {/* Manual refresh button */}
//                 <button
//                   onClick={handleManualRefresh}
//                   className="text-gray-400 hover:text-gray-600 mr-3"
//                   title="Refresh insights"
//                   disabled={isRefreshing}
//                 >
//                   {isRefreshing ? (
//                     <div className="animate-spin">
//                       <RotateCcw size={16} />
//                     </div>
//                   ) : (
//                     <RotateCcw size={16} />
//                   )}
//                 </button>
//                 <button
//                   onClick={() => setShowFullInsights(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-auto p-6">
//               {aiInsights.predictedDeadline && (
//                 <div className="mb-8">
//                   <h4 className="text-sm font-medium text-gray-500 mb-2">Completion Prediction</h4>
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <div className="text-sm text-gray-500">Official Deadline</div>
//                         <div className="font-medium text-lg text-gray-900">
//                           {project?.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {
//                             month: 'short',
//                             day: 'numeric',
//                             year: 'numeric',
//                           }) : 'Not set'}
//                         </div>
//                       </div>
//                       <div className="text-2xl text-gray-300 mx-4">→</div>
//                       <div>
//                         <div className="text-sm text-gray-500">Predicted Completion</div>
//                         <div className="font-medium text-lg text-gray-900">
//                           {formatPredictedDate()}
//                         </div>
//                       </div>
//                       {deadlineComparison && (
//                         <div
//                           className={`text-sm font-medium ${
//                             deadlineComparison.color.includes('red')
//                               ? 'text-red-600'
//                               : deadlineComparison.color.includes('green')
//                               ? 'text-green-600'
//                               : 'text-blue-600'
//                           } ml-4 px-3 py-1 rounded-full border ${
//                             deadlineComparison.color.includes('red')
//                               ? 'border-red-200 bg-red-50'
//                               : deadlineComparison.color.includes('green')
//                               ? 'border-green-200 bg-green-50'
//                               : 'border-blue-200 bg-blue-50'
//                           }`}
//                         >
//                           {deadlineComparison.text}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/** Tabbed Insights **/}
//               <div className="mb-6">
//                 <div className="flex space-x-2 mb-4 border-b">
//                   {insightOptions.map(option => (
//                     <button
//                       key={option.id}
//                       onClick={() => setActiveInsight(option.id)}
//                       className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
//                         activeInsight === option.id
//                           ? 'border-blue-600 text-blue-600'
//                           : 'border-transparent text-gray-600 hover:text-gray-900'
//                       }`}
//                     >
//                       {option.icon}
//                       <span>{option.label} Analysis</span>
//                     </button>
//                   ))}
//                 </div>

//                 <div className="bg-white border border-gray-200 rounded-lg p-5">
//                   <div className="prose max-w-none text-gray-700">
//                     {isGenerating || isRefreshing ? (
//                       <div className="flex items-center justify-center py-10">
//                         <div className="animate-spin mr-3">
//                           <RotateCcw size={20} />
//                         </div>
//                         <span className="text-lg">
//                           {isGenerating ? 'Generating insights...' : 'Refreshing data...'}
//                         </span>
//                       </div>
//                     ) : (
//                       <div>
//                         {getActiveContent().split('\n').map((line, idx) => (
//                           <React.Fragment key={idx}>
//                             {line}
//                             <br />
//                           </React.Fragment>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="text-sm text-gray-500 mt-4 flex items-center justify-between">
//                 <span>Last updated: {getLastUpdatedTime()}</span>
//                 <button
//                   onClick={handleManualRefresh}
//                   className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
//                   disabled={isRefreshing}
//                 >
//                   {isRefreshing ? (
//                     <div className="animate-spin mr-1">
//                       <RotateCcw size={12} />
//                     </div>
//                   ) : (
//                     <RotateCcw size={12} />
//                   )}
//                   <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
//                 </button>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="border-t p-4 bg-gray-50 flex justify-end space-x-3">
//               {userHasPermission(currentUser, project, 'admin') && (
//                 <button
//                   onClick={handleGenerateInsights}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
//                              text-white rounded-lg flex items-center justify-center 
//                              gap-2 transition-colors text-sm font-medium"
//                   disabled={isGenerating || isRefreshing}
//                 >
//                   {isGenerating ? (
//                     <>
//                       <div className="animate-spin">
//                         <RotateCcw size={16} />
//                       </div>
//                       <span>Analyzing Project...</span>
//                     </>
//                   ) : isRefreshing ? (
//                     <>
//                       <div className="animate-spin">
//                         <RotateCcw size={16} />
//                       </div>
//                       <span>Refreshing Data...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles size={16} />
//                       <span>Generate New Insights</span>
//                     </>
//                   )}
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowFullInsights(false)}
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 
//                            text-gray-800 rounded-lg flex items-center 
//                            gap-2 transition-colors text-sm font-medium"
//               >
//                 <span>Close</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AIInsightsCard;
import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Sparkles, Brain, Maximize2, X, RotateCcw } from 'lucide-react';
import axios from 'axios';

const AIInsightsCard = ({ project, setProject, userHasPermission, currentUser }) => {
  const [activeInsight, setActiveInsight] = useState('risk');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFullInsights, setShowFullInsights] = useState(false);
  
  // Short alias for AI insights
  const aiInsights = project?.aiInsights || {};

  // Check if any previous insights exist
  const hasInsights = Boolean(
    aiInsights.workloadAnalysis ||
    aiInsights.riskAnalysis ||
    aiInsights.recommendation ||
    aiInsights.predictedDeadline
  );

  // Simple function to fetch the latest project data
  const refreshData = async () => {
    if (!project?._id) return false;
    
    setIsRefreshing(true);
    
    try {
      const response = await axios.get(`/api/projects/${project._id}?_=${Date.now()}`);
      setProject(response.data);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to refresh data');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simple function to generate insights
  const handleGenerateInsights = async () => {
    if (!project?._id) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // Step 1: Start generation
      await axios.post(`/api/ai/projects/${project._id}/analysis`);
      
      // Step 2: Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Fetch updated project data with generated insights
      const response = await axios.get(`/api/projects/${project._id}?_=${Date.now()}`);
      
      // Step 4: Update local state with new project data
      setProject(response.data);
      
      // Step 5: If no insights yet, try once more after additional delay
      const updatedAiInsights = response.data?.aiInsights || {};
      if (!updatedAiInsights.workloadAnalysis && 
          !updatedAiInsights.riskAnalysis && 
          !updatedAiInsights.recommendation) {
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const finalResponse = await axios.get(`/api/projects/${project._id}?_=${Date.now()}`);
        setProject(finalResponse.data);
      }
      
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simplified helper functions
  const getProjectStatus = () => {
    if (!project) return '';
    const daysRemaining = Math.ceil(
      (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (project.progress < 30 && daysRemaining < 7) return 'is at risk of delay';
    if (project.progress > 70) return 'is on track for completion';
    if (daysRemaining < 0) return 'is overdue';
    return 'needs attention to meet deadline';
  };

  const formatPredictedDate = () => {
    if (!aiInsights.predictedDeadline) return 'Not calculated';
    const dateObj = new Date(aiInsights.predictedDeadline);
    return isNaN(dateObj.getTime())
      ? 'Not available'
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDeadlineComparison = () => {
    if (!aiInsights.predictedDeadline || !project?.deadline) return null;
    const predictedDateObj = new Date(aiInsights.predictedDeadline);
    if (isNaN(predictedDateObj.getTime())) return null;
    const actualDateObj = new Date(project.deadline);
    if (isNaN(actualDateObj.getTime())) return null;
    
    const diffDays = Math.round(
      (predictedDateObj - actualDateObj) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 0) {
      return { text: `${diffDays} days later than planned`, color: 'text-red-400' };
    } else if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days earlier than planned`, color: 'text-green-400' };
    } else {
      return { text: 'On target with plan', color: 'text-blue-400' };
    }
  };

  const deadlineComparison = getDeadlineComparison();

  const insightOptions = [
    { id: 'workload', label: 'Workload', icon: <TrendingUp size={14} /> },
    { id: 'risk', label: 'Risk', icon: <AlertTriangle size={14} /> },
    { id: 'recommendations', label: 'Actions', icon: <Sparkles size={14} /> },
  ];

  const getActiveContent = () => {
    switch (activeInsight) {
      case 'workload':
        return aiInsights.workloadAnalysis || 'No workload analysis available yet.';
      case 'risk':
        return aiInsights.riskAnalysis || 'No risk analysis available yet.';
      case 'recommendations':
        return aiInsights.recommendation || 'No recommendations available yet.';
      default:
        return 'Select an insight to view analysis.';
    }
  };

  // Get latest updated timestamp
  const getLastUpdatedTime = () => {
    if (!project) return '';
    const timestamp = project.lastUpdated || project.updatedAt || new Date();
    return new Date(timestamp).toLocaleString();
  };

  // New loading skeleton component 
  const InsightSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
  
  const DeadlineSkeleton = () => (
    <div className="mb-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="w-1/3">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="text-2xl text-gray-200 mx-4">→</div>
          <div className="w-1/3">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="ml-4 px-8 py-2 rounded-full border border-gray-200 bg-gray-100">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // When project changes and we were generating, check if we actually got insights
    if (project && !isGenerating) {
      const updatedAiInsights = project.aiInsights || {};
      
      // If we should have insights but don't, try fetching once more
      if (!updatedAiInsights.workloadAnalysis && 
          !updatedAiInsights.riskAnalysis && 
          !updatedAiInsights.recommendation &&
          project.aiInsightsRequested) {
        
        // Refresh data after a short delay
        const timer = setTimeout(() => {
          refreshData();
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [project, isGenerating]);

  // Add this effect to ensure data freshness when modal opens
  useEffect(() => {
    if (showFullInsights) {
      // Refresh data whenever modal is opened
      refreshData();
    }
  }, [showFullInsights]); // Dependency on modal visibility

  return (
    <>
      {/* Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">AI Insights</h3>
          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
            <Brain size={12} className="text-white" />
          </div>
        </div>

        {/* No insights yet */}
        {(!hasInsights && !isGenerating) ? (
        <div className="space-y-2">
            <p className="text-gray-300 text-sm mb-1">
            Based on current progress, this project {getProjectStatus()}.
            </p>
            {userHasPermission(currentUser, project, 'admin') && (
            <button
                onClick={handleGenerateInsights}
                className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 
                        text-white rounded-lg flex items-center justify-center 
                        gap-2 transition-colors text-sm font-medium"
                disabled={isGenerating || isRefreshing}
            >
                <Sparkles size={14} />
                <span>Generate AI Insights</span>
            </button>
            )}
        </div>
        ) : (
            <div className="space-y-3">
    {isGenerating ? (
      <div className="flex flex-col items-center justify-center py-4">
        {/* Loading state */}
        <div className="animate-spin mb-2">
          <RotateCcw size={16} />
        </div>
        <span className="text-sm">
          Generating AI insights...
        </span>
        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3">
          <div className="h-full bg-blue-500 rounded-full w-1/2"></div>
        </div>
      </div>
            ) : (
              <>
                 {aiInsights.predictedDeadline && (
          <div className="flex justify-between items-center pb-0 mb-0">
            <div>
              <div className="text-xs text-gray-400">Predicted Completion</div>
              <div className="font-medium text-sm">{formatPredictedDate()}</div>
            </div>
            {deadlineComparison && (
              <div className={`text-sm ${deadlineComparison.color} font-medium`}>
                {deadlineComparison.text}
              </div>
            )}
          </div>
        )}
        

                <div className="text-gray-300 text-sm mb-0">
                Insights about workload distribution, risk factors, and recommended actions.
                </div>

                {/* Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // First show the modal with loading state
                      setShowFullInsights(true);
                      // Then refresh the data
                      refreshData();
                    }}
                    className="w-1/2 px-3 py-2 bg-gray-700 hover:bg-gray-600 
                               text-white rounded-lg flex items-center justify-center 
                               gap-2 transition-colors text-sm font-medium"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin mr-1">
                          <RotateCcw size={14} />
                        </div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 size={14} />
                        <span>View Full Insights</span>
                      </>
                    )}
                  </button>

                  {userHasPermission(currentUser, project, 'admin') && (
                    <button
                      onClick={handleGenerateInsights}
                      className="px-3 w-1/2 py-2 bg-blue-600 hover:bg-blue-700 
                                 text-white rounded-lg flex items-center justify-center 
                                 gap-2 transition-colors text-sm font-medium"
                      disabled={isGenerating || isRefreshing}
                    >
                      {isGenerating || isRefreshing ? (
                        <div className="animate-spin">
                          <RotateCcw size={14} />
                        </div>
                      ) : (
                        <Sparkles size={14} />
                      )}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="text-red-400 text-xs mt-2">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Insights Modal */}
      {showFullInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">AI Project Insights</h3>
              <div className="flex items-center">
                {/* Manual refresh button */}
                <button
                  onClick={refreshData}
                  className="text-gray-400 hover:text-gray-600 mr-3"
                  title="Refresh insights"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <div className="animate-spin">
                      <RotateCcw size={16} />
                    </div>
                  ) : (
                    <RotateCcw size={16} />
                  )}
                </button>
                <button
                  onClick={() => setShowFullInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {isGenerating || isRefreshing ? (
                <>
                  {/* Skeleton for deadline prediction */}
                  <DeadlineSkeleton />
                  
                  {/* Tab navigation skeleton */}
                  <div className="mb-6">
                    <div className="flex space-x-2 mb-4 border-b">
                      {insightOptions.map(option => (
                        <div 
                          key={option.id} 
                          className="px-4 py-2 border-b-2 border-transparent"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <InsightSkeleton />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Deadline prediction (actual content) */}
                  {aiInsights.predictedDeadline && (
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Completion Prediction</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {/* ... existing deadline content ... */}
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">Official Deadline</div>
                            <div className="font-medium text-lg text-gray-900">
                              {project?.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }) : 'Not set'}
                            </div>
                          </div>
                          <div className="text-2xl text-gray-300 mx-4">→</div>
                          <div>
                            <div className="text-sm text-gray-500">Predicted Completion</div>
                            <div className="font-medium text-lg text-gray-900">
                              {formatPredictedDate()}
                            </div>
                          </div>
                          {deadlineComparison && (
                            <div
                              className={`text-sm font-medium ${
                                deadlineComparison.color.includes('red')
                                  ? 'text-red-600'
                                  : deadlineComparison.color.includes('green')
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              } ml-4 px-3 py-1 rounded-full border ${
                                deadlineComparison.color.includes('red')
                                  ? 'border-red-200 bg-red-50'
                                  : deadlineComparison.color.includes('green')
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-blue-200 bg-blue-50'
                              }`}
                            >
                              {deadlineComparison.text}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabbed Insights (actual content) */}
                  <div className="mb-6">
                    <div className="flex space-x-2 mb-4 border-b">
                      {insightOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setActiveInsight(option.id)}
                          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
                            activeInsight === option.id
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {option.icon}
                          <span>{option.label} Analysis</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="prose max-w-none text-gray-700">
                        <div>
                          {getActiveContent().split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="text-sm text-gray-500 mt-4 flex items-center justify-between">
                <span>Last updated: {isGenerating || isRefreshing ? 
                  <div className="h-3 bg-gray-200 rounded w-32 inline-block align-middle"></div> : 
                  getLastUpdatedTime()}
                </span>
                <button
                  onClick={refreshData}
                  className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <div className="animate-spin mr-1">
                      <RotateCcw size={12} />
                    </div>
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 bg-gray-50 flex justify-end space-x-3">
              {userHasPermission(currentUser, project, 'admin') && (
                <button
                  onClick={handleGenerateInsights}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                             text-white rounded-lg flex items-center justify-center 
                             gap-2 transition-colors text-sm font-medium"
                  disabled={isGenerating || isRefreshing}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin">
                        <RotateCcw size={16} />
                      </div>
                      <span>Analyzing Project...</span>
                    </>
                  ) : isRefreshing ? (
                    <>
                      <div className="animate-spin">
                        <RotateCcw size={16} />
                      </div>
                      <span>Refreshing Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate New Insights</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowFullInsights(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 
                           text-gray-800 rounded-lg flex items-center 
                           gap-2 transition-colors text-sm font-medium"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIInsightsCard;