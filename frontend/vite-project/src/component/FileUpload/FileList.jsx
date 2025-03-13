import React, { useState, useEffect } from 'react';
import { X, Paperclip, Plus, Download, Trash2, Sparkles, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUploader from './FileUploader';
import API from '../../api/api';
import AIAnalysisButton from './buttonAi';
import AIAnalysisViewer from './AiAnalysisviewer';
import ExcelAnalysisButton from './ExcelAnalysisButton';
import ExcelAnalysisViewer from './ExcelAnalysisViewer';

const FileListModal = ({ 
  isOpen, 
  onClose, 
  files: initialFiles = [], // Rename to avoid conflicts
  taskId, 
  projectId, 
  onDelete, 
  currentUser, 
  isOwner, 
  onUploadComplete,
  onFilesUpdate // Add this prop if you want to notify parent component of changes
}) => {
  // Add local state for files
  const [files, setFiles] = useState(initialFiles);
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  
  // Add states for AI analysis
  const [analyzingFileId, setAnalyzingFileId] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [analysisError, setAnalysisError] = useState(null);
  const [viewingAnalysis, setViewingAnalysis] = useState(null);
  const [viewingInsights, setViewingInsights] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingFileId, setProcessingFileId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add these states for Excel analysis
  const [isExcelAnalyzing, setIsExcelAnalyzing] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [viewingExcelAnalysis, setViewingExcelAnalysis] = useState(null);

  // Add this helper function to check Excel files
  const isExcelFile = (fileType, fileName) => {
    const types = ['spreadsheet', 'excel', 'xls', 'csv'];
    const extensions = ['.xlsx', '.xls', '.csv'];
    
    return types.some(t => fileType?.toLowerCase().includes(t)) ||
           extensions.some(ext => fileName?.toLowerCase().endsWith(ext));
  };

  // Add this handler for Excel analysis completion
  const handleExcelAnalysisComplete = (updatedFile) => {
    // Update files with new analysis
    const updatedFiles = files.map(f => 
      f._id === updatedFile._id ? updatedFile : f
    );
    
    setFiles(updatedFiles);
    if (onFilesUpdate) onFilesUpdate(updatedFiles);
    
    // Show analysis viewer
    setViewingExcelAnalysis(updatedFile.excelAnalysis);
    setCurrentFile(updatedFile);
  };

  // Add this function to handle Excel analysis viewing
  const handleViewExcelAnalysis = (file) => {
    setCurrentFile(file);
    setViewingExcelAnalysis(file.excelAnalysis);
  };

  // Update local files when initialFiles changes
  useEffect(() => {
    console.log("initialFiles changed:", initialFiles);
    setFiles(initialFiles);
  }, [initialFiles]);

  if (!isOpen) return null;
  
  // Determine if the user can upload files
  const canUpload = 
    currentUser?.role === 'admin' || 
    isOwner ||
    (taskId && currentUser && Array.isArray(currentUser?.assignedTasks) && 
     currentUser.assignedTasks.some(task => task._id === taskId || task === taskId));

  // Format file size helper function
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Determine file icon
  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      );
    } 
    if (fileType?.includes('pdf')) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      </div>
    );
  };

  console.log("Files in FileListModal:", files);

  // Add this function to handle file deletion
  const handleDelete = async (fileId, fileName) => {
    try {
      setDeletingFileId(fileId);
      setDeleteError(null);
      
      if (!fileId) {
        throw new Error("File ID is missing");
      }
      
      // Call API to delete the file
      await API.delete(`/api/files/${fileId}`);      
      // If successful, call the parent's onDelete handler
      if (onDelete) {
        onDelete(fileId);
      }
      
    } catch (err) {
      console.error("Failed to delete file:", err);
      setDeleteError(`Failed to delete ${fileName}: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingFileId(null);
    }
  };

  // AI analysis function with updated file handling
  const handleAnalyzeFile = async (file) => {
    try {
      setIsAnalyzing(true);
      setProcessingFileId(file._id);
      setCurrentFile(file);
      setAnalysisError(null);
      
      console.log(`Starting analysis for file: ${file.name} (${file._id})`);
      
      const response = await API.post(`/api/ai/analyze/${file._id}`);
      const data = response.data || response;
      
      console.log('Analysis complete, data:', data);
      
      if (!data || !data.insights) {
        throw new Error('No insights returned from analysis');
      }
      
      // Create a new file object with the insights
      const updatedFile = { 
        ...file, 
        aiInsights: data.insights, 
        isProcessed: true 
      };
      
      // Update the file in our local state
      const updatedFiles = files.map(f => 
        f._id === file._id ? updatedFile : f
      );
      
      console.log('Updating files with:', updatedFile);
      
      // Update local state
      setFiles(updatedFiles);
      
      // Notify parent component if callback provided
      if (typeof onFilesUpdate === 'function') {
        console.log('Notifying parent of file updates');
        onFilesUpdate(updatedFiles);
      }
      
      // Force refresh to ensure child components update
      setRefreshTrigger(prev => prev + 1);
      
      // Keep track of the current file with insights for the viewer
      setCurrentFile(updatedFile);
      setViewingInsights(data.insights);
      
      return updatedFile;
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(`Failed to analyze file: ${error.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
      setProcessingFileId(null);
    }
  };
  
  // Toggle analysis visibility
  const toggleAnalysis = (fileId) => {
    if (analysisResults[fileId]) {
      // If we have results, we're toggling visibility by updating state
      setAnalysisResults(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          visible: !prev[fileId]?.visible
        }
      }));
    }
  };

  // Function to check if a file has AI insights
  const hasAiInsights = (file) => {
    return file.aiInsights && file.aiInsights.summary;
  };

  // Function to handle view analysis request
  const handleViewAnalysis = (file) => {
    setCurrentFile(file);
    setViewingInsights(file.aiInsights);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header with AI capability mention */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Paperclip size={18} className="text-blue-500 mr-2" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Task Attachments ({files.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">With AI analysis capabilities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canUpload && (
              <button
                onClick={() => setIsFileUploaderOpen(true)}
                className="flex items-center text-sm py-1 px-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Upload File
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Analysis error message display */}
        {analysisError && (
          <div className="p-3 mx-4 mt-4 bg-amber-50 text-amber-700 text-sm rounded-md flex items-start">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span>{analysisError}</span>
            <button 
              className="ml-auto text-amber-400 hover:text-amber-600" 
              onClick={() => setAnalysisError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Add this to your FileList component's JSX, near the top of the return: */}
        {isAnalyzing && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 flex items-center">
            <Loader2 size={18} className="animate-spin mr-2" />
            <span>Analyzing file: {currentFile?.name}</span>
          </div>
        )}

        {/* File list with AI button */}
        <div className="flex-1 overflow-y-auto p-4">
          {files && files.length > 0 ? (
            <div className="space-y-4">
              {files.map((file) => {
                // Your existing code for file display
                const fileName = file.fileName || file.name || "Unnamed file";
                const fileType = file.fileType || file.type || "";
                const fileSize = file.fileSize || file.size || 0;
                const fileUrl = file.fileUrl || file.url || "";
                const fileId = file._id || "";
                
                // Check if we have analysis results for this file
                const hasAnalysis = !!analysisResults[fileId];
                const isAnalysisVisible = analysisResults[fileId]?.visible;
                
                return (
                  <div key={fileId || Math.random().toString(36).substring(7)}>
                    {/* File row */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100">
                      <div className="flex items-center">
                        {getFileIcon(fileType)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {fileName}
                            {!fileName && <span className="text-red-500">(Missing file name)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileSize)} • {formatDate(file.uploadedAt || file.createdAt || new Date())}
                            {!fileUrl && <span className="text-red-500 ml-2">(Missing URL)</span>}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Conditional rendering for Excel vs AI analysis */}
                        {isExcelFile(fileType, fileName) ? (
                          <ExcelAnalysisButton
                            file={file}
                            onAnalysisComplete={(updatedFile) => {
                              // Update files with new analysis
                              setFiles(prevFiles => 
                                prevFiles.map(f => f._id === updatedFile._id ? updatedFile : f)
                              );
                              if (onFilesUpdate) {
                                onFilesUpdate(files.map(f => 
                                  f._id === updatedFile._id ? updatedFile : f
                                ));
                              }
                              
                              // Show the analysis
                              handleViewExcelAnalysis(updatedFile);
                            }}
                            onError={(error) => setExcelError(error.message)}
                            onViewAnalysis={handleViewExcelAnalysis}
                          />
                        ) : (
                          <AIAnalysisButton 
                            key={`${file._id}-${refreshTrigger}`} // Force re-render when refreshTrigger changes
                            file={file}
                            onViewAnalysis={() => {
                              setCurrentFile(file);
                              setViewingInsights(file.aiInsights);
                            }}
                            onRequestAnalysis={handleAnalyzeFile}
                            isProcessing={processingFileId === file._id && isAnalyzing}
                            forceRefresh={refreshTrigger} // Pass the refresh trigger
                          />
                        )}
                      
                        {/* Download button - with improved error handling */}
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            download={fileName}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(fileUrl, '_blank');
                            }}
                          >
                            <Download size={16} />
                          </a>
                        ) : (
                          <button 
                            className="p-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                            title="Download URL not available"
                            disabled
                          >
                            <Download size={16} />
                          </button>
                        )}
                        
                        {/* Delete button - only show if user has permission */}
                        {(currentUser?.role === 'admin' || isOwner || file.uploadedBy === currentUser?._id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete this file${fileName ? ': ' + fileName : ''}?`)) {
                                handleDelete(fileId, fileName);
                              }
                            }}
                            disabled={deletingFileId === fileId}
                            className={`p-2 ${deletingFileId === fileId 
                              ? 'bg-red-100 text-red-300 cursor-not-allowed' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'} rounded-md flex items-center`}
                          >
                            {deletingFileId === fileId ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* AI Analysis Results (conditionally rendered) */}
                    {hasAnalysis && isAnalysisVisible && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-4 bg-purple-50 rounded-md border border-purple-100"
                      >
                        <div className="flex items-center mb-2">
                          <Sparkles size={16} className="text-purple-500 mr-2" />
                          <h4 className="text-sm font-medium text-purple-800">AI Insights</h4>
                        </div>
                        
                        {analysisResults[fileId].summary && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">Summary</h5>
                            <p className="text-sm text-purple-900">{analysisResults[fileId].summary}</p>
                          </div>
                        )}
                        
                        {analysisResults[fileId].keyPoints && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">Key Points</h5>
                            <ul className="list-disc list-inside text-sm text-purple-900 space-y-1">
                              {analysisResults[fileId].keyPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysisResults[fileId].recommendations && (
                          <div>
                            <h5 className="text-xs font-semibold text-purple-700 mb-1">Recommendations</h5>
                            <p className="text-sm text-purple-900">{analysisResults[fileId].recommendations}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Add Excel error display */}
                    {excelError && (
                      <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md">
                        {excelError}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Paperclip size={40} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No attachments yet</h3>
              {canUpload && (
                <p className="text-sm text-gray-400 max-w-sm">
                  Upload files to share with team members working on this task.
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Modal footer with AI capability note */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="flex items-center">
                <Sparkles size={12} className="text-purple-500 mr-1" />
                AI analysis available for documents, images and PDFs
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* File uploader modal */}
        {isFileUploaderOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 z-10 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Upload New File</h2>
                <button 
                  onClick={() => setIsFileUploaderOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <FileUploader 
                  taskId={taskId}
                  projectId={projectId}
                  onUploadComplete={(file) => {
                    onUploadComplete(file);
                    setIsFileUploaderOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Add error message display if delete fails */}
        {deleteError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mt-3 flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{deleteError}</span>
            <button 
              className="ml-auto text-red-400 hover:text-red-600" 
              onClick={() => setDeleteError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      {/* Add the AI Analysis Viewer component */}
      <AIAnalysisViewer 
        isOpen={isAnalyzing || !!viewingInsights} 
        onClose={() => {
          setViewingInsights(null);
          setCurrentFile(null);
          setIsAnalyzing(false);
        }} 
        insights={viewingInsights}
        onRequestAnalysis={handleAnalyzeFile}
        currentFile={currentFile}
        isLoading={isAnalyzing}  // Pass the loading state here
      />
      {/* Add Excel Analysis Viewer near the bottom of your component */}
      <ExcelAnalysisViewer
        isOpen={!!viewingExcelAnalysis}
        onClose={() => {
          setViewingExcelAnalysis(null);
          setCurrentFile(null);
        }}
        analysis={viewingExcelAnalysis}
        file={currentFile}
      />
     
    </div>
  );
};

export default FileListModal;