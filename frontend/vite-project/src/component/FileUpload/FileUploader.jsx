import React, { useState, useRef } from 'react';
import { FileUp, X, Loader, AlertCircle, FileText, Image, FileArchive, Paperclip } from 'lucide-react';
import API from '../../api/api';

const FileUploader = ({ taskId, projectId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <Paperclip size={24} />;
    
    if (fileType.startsWith('image/')) {
      return <Image size={24} className="text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText size={24} className="text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText size={24} className="text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText size={24} className="text-green-500" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileArchive size={24} className="text-yellow-500" />;
    } else {
      return <Paperclip size={24} className="text-gray-500" />;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  // Handle drag & drop functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    // File size validation (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('fileType', selectedFile.type);
      formData.append('fileSize', selectedFile.size);
      
      // Upload directly to our API endpoint
      const response = await API.post(`/api/tasks/${taskId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      // Reset state
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      if (onUploadComplete) {
        console.log("Upload complete, file data:", response.data.file);
        onUploadComplete(response.data.file);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Attach File</h3>
      
      {/* File Input */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center w-full">
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
              isUploading ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader size={24} className="text-blue-500 mb-2 animate-spin" />
                  <p className="mb-2 text-sm text-blue-600">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-40 h-2 bg-blue-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </>
              ) : selectedFile ? (
                <>
                  {getFileIcon(selectedFile.type)}
                  <p className="mb-1 text-sm text-gray-800 mt-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <FileUp size={24} className="text-gray-400 mb-2" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, Word, Excel, Images (Max 10MB)
                  </p>
                </>
              )}
            </div>
            <input 
              id="dropzone-file" 
              type="file" 
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            <AlertCircle size={16} className="mr-1" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-2">
          {selectedFile && !isUploading && (
            <button
              type="button"
              onClick={cancelUpload}
              className="py-1.5 px-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`py-1.5 px-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              !selectedFile || isUploading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;