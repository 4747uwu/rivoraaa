// import React, { useState } from 'react';
// import { FileSpreadsheet, Loader2, ChevronRight } from 'lucide-react';
// import API from '../../api/api';

// const ExcelAnalysisButton = ({ file, onAnalysisComplete, onError }) => {
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Check if file is an Excel/spreadsheet
//   const fileType = file?.type?.toLowerCase() || '';
//   const fileName = file?.name?.toLowerCase() || '';
  
//   const isExcelFile = 
//     fileType.includes('spreadsheet') || 
//     fileType.includes('excel') || 
//     fileType.includes('xls') ||
//     fileType.includes('csv') ||
//     fileName.endsWith('.xlsx') || 
//     fileName.endsWith('.xls') ||
//     fileName.endsWith('.csv');
    
//   if (!isExcelFile) return null;
  
//   const hasExistingAnalysis = !!file.excelAnalysis;
  
//   const handleAnalyzeClick = async () => {
//     try {
//       setIsAnalyzing(true);
//       setError(null);
      
//       const response = await API.post(`/api/ai/excel/${file._id}/analyze`);
      
//       if (response && response.data) {
//         console.log('Excel analysis complete:', response.data);
        
//         // Call the callback with the updated file data
//         if (typeof onAnalysisComplete === 'function') {
//           onAnalysisComplete({
//             ...file,
//             excelAnalysis: response.data.excelAnalysis,
//             aiInsights: response.data.insights
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Excel analysis failed:', err);
//       setError(err.message || 'Analysis failed');
      
//       if (typeof onError === 'function') {
//         onError(err);
//       }
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };
  
//   return (
//     <>
//       <button
//         onClick={handleAnalyzeClick}
//         disabled={isAnalyzing}
//         className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium 
//           ${hasExistingAnalysis 
//             ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
//             : 'bg-green-100 text-green-700 hover:bg-green-200'} 
//           transition-colors ${isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''}`}
//       >
//         {isAnalyzing ? (
//           <>
//             <Loader2 size={16} className="animate-spin" />
//             Analyzing Spreadsheet...
//           </>
//         ) : (
//           <>
//             <FileSpreadsheet size={16} />
//             {hasExistingAnalysis ? 'View Excel Analysis' : 'Analyze Excel File'}
//             {!isAnalyzing && <ChevronRight size={14} />}
//           </>
//         )}
//       </button>
      
//       {error && (
//         <div className="mt-2 text-xs text-red-600">
//           {error}
//         </div>
//       )}
//     </>
//   );
// };

// export default ExcelAnalysisButton;

import React, { useState } from 'react';
import { FileSpreadsheet, Loader2, ChevronRight, RefreshCw } from 'lucide-react';
import API from '../../api/api';

const ExcelAnalysisButton = ({ file, onAnalysisComplete, onError, onViewAnalysis }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if file is an Excel/spreadsheet
  const fileType = file?.type?.toLowerCase() || '';
  const fileName = file?.name?.toLowerCase() || '';
  
  const isExcelFile = 
    fileType.includes('spreadsheet') || 
    fileType.includes('excel') || 
    fileType.includes('xls') ||
    fileType.includes('csv') ||
    fileName.endsWith('.xlsx') || 
    fileName.endsWith('.xls') ||
    fileName.endsWith('.csv');
    
  if (!isExcelFile) return null;
  
  const hasExistingAnalysis = !!file.excelAnalysis;
  
  // Handler for viewing existing analysis
  const handleViewAnalysis = () => {
    if (typeof onViewAnalysis === 'function') {
      onViewAnalysis(file);
    }
  };
  
  const handleAnalyzeClick = async () => {
    // If there's existing analysis, just view it
    if (hasExistingAnalysis && !isAnalyzing) {
      handleViewAnalysis();
      return;
    }
    
    try {
      setIsChecking(true);
      setError(null);
      
      // First check if analysis exists
      const checkResponse = await API.get(`/api/ai/excel/${file._id}/check-analysis`);
      
      // If analysis exists in the database but not in our local state
      if (checkResponse.data.hasAnalysis && !hasExistingAnalysis) {
        // Fetch the existing analysis
        const fetchResponse = await API.get(`/api/ai/excel/${file._id}/analysis`);
        
        if (fetchResponse && fetchResponse.data) {
          console.log('Fetched existing Excel analysis:', fetchResponse.data);
          
          // Call the callback with the fetched data
          if (typeof onAnalysisComplete === 'function') {
            onAnalysisComplete({
              ...file,
              excelAnalysis: fetchResponse.data.excelAnalysis,
              aiInsights: fetchResponse.data.insights
            });
          }
          
          setIsChecking(false);
          return;
        }
      }
      
      // If we get here, we need to generate new analysis
      setIsChecking(false);
      setIsAnalyzing(true);
      
      const response = await API.post(`/api/ai/excel/${file._id}/analyze`);
      
      
      if (response && response.data) {
        console.log('Excel analysis complete:', response.data);
        
        // Call the callback with the updated file data
        if (typeof onAnalysisComplete === 'function') {
          onAnalysisComplete({
            ...file,
            excelAnalysis: response.data.excelAnalysis,
            aiInsights: response.data.insights
          });
        }
      }
    } catch (err) {
      console.error('Excel analysis failed:', err);
      setError(err.message || 'Analysis failed');
      
      if (typeof onError === 'function') {
        onError(err);
      }
    } finally {
      setIsChecking(false);
      setIsAnalyzing(false);
    }
  };
  
  // Determine button appearance based on state
  let buttonText, buttonIcon, buttonClass;
  
  if (isChecking) {
    buttonText = "Checking Analysis...";
    buttonIcon = <Loader2 size={16} className="animate-spin" />;
    buttonClass = 'bg-gray-100 text-gray-700';
  } else if (isAnalyzing) {
    buttonText = "Analyzing Spreadsheet...";
    buttonIcon = <Loader2 size={16} className="animate-spin" />;
    buttonClass = 'bg-green-100 text-green-700';
  } else if (hasExistingAnalysis) {
    buttonText = "View Excel Analysis";
    buttonIcon = <FileSpreadsheet size={16} />;
    buttonClass = 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  } else {
    buttonText = "Analyze Excel File";
    buttonIcon = <FileSpreadsheet size={16} />;
    buttonClass = 'bg-green-100 text-green-700 hover:bg-green-200';
  }
  
  return (
    <>
      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzing || isChecking}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium 
          ${buttonClass} transition-colors ${(isAnalyzing || isChecking) ? 'opacity-75 cursor-not-allowed' : ''}`}
        title={hasExistingAnalysis ? 'View Excel file analysis' : 'Generate analysis for Excel file'}
      >
        {buttonIcon}
        {buttonText}
        {!isAnalyzing && !isChecking && <ChevronRight size={14} />}
      </button>
      
      {/* Add regenerate button if analysis exists */}
      {hasExistingAnalysis && !isAnalyzing && !isChecking && (
        <button
          onClick={() => handleAnalyzeClick(true)}
          className="ml-2 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="Regenerate Excel analysis"
        >
          <RefreshCw size={14} />
        </button>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </>
  );
};

export default ExcelAnalysisButton;