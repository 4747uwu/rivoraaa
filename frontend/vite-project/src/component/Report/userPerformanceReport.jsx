import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/api';
import {
  AlertCircle,
  Award,
  Clock,
  TrendingUp,
  Zap,
  UserCheck,
  Loader,
  BarChart4,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PerformanceHeader from './PerformanceHeader';
import PerformanceScoreCard from './PerformanceScoreCard';
import PerformanceMetrics from './PerformanceMetrics';
import PerformanceInsights from './PerformanceInsight';
import PerformanceBottlenecks from './PerformanceBottlenecks';
import PerformanceRecommendations from './PerformanceRecommandations';

const UserPerformanceReport = ({ userId, projectId }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Modified version of your useQuery hook
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userPerformance', userId, projectId],
    queryFn: async () => {
      try {
        const response = await API.get(`/api/analytics/user-performance?userId=${userId}&projectId=${projectId}`);
        return response.data;
      } catch (err) {
        // If status is 404, return null instead of throwing error
        // This way isError will remain false, but report will be null
        if (err.response?.status === 404) {
          return null;
        }
        // For other errors, throw the error so React Query can handle it
        throw err;
      }
    },
    enabled: !!userId && userId !== 'all' && !!projectId,
    staleTime: 1000 * 60 * 15 // 15 minutes
  });

  // Handle report generation
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await API.post('/api/analytics/user-performance/generate', {
        userId,
        projectId
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Generate a new AI report
  const generateNewReport = async () => {
    if (!userId || userId === 'all' || !projectId) return;
    setIsGenerating(true);
    try {
      await mutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  // If no user is selected, show a message
  if (userId === 'all') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-center h-40 text-gray-500 flex-col gap-3">
          <UserCheck size={40} />
          <p>Please select a specific user to view their performance report</p>
        </div>
      </motion.div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-center h-40">
          <Loader size={40} className="animate-spin text-blue-500" />
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-lg p-6 border border-red-200"
      >
        <div className="flex items-center text-red-700 mb-4">
          <AlertCircle className="mr-2" size={20} />
          <h3 className="font-semibold">Failed to load performance report</h3>
        </div>
        <p className="text-red-600 mb-4">{error?.message || "Unknown error occurred"}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // If no report exists yet, show generate button
  if (!report || !report.analysis) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      >
        <div className="text-center py-8">
          <div className="bg-blue-50 inline-block p-3 rounded-full mb-4">
            <Zap className="text-blue-500" size={30} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Generate Performance Report</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Use our AI to generate a comprehensive performance report based on this user's tasks and activity.
          </p>
          <button
            onClick={generateNewReport}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium 
                      hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ${
                        isGenerating ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
          >
            {isGenerating ? (
              <>
                <Loader size={16} className="inline mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              'Generate AI Report'
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Display the full report when available
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    >
      <PerformanceHeader 
        username={report.username} 
        generatedAt={report.generatedAt}
        isGenerating={isGenerating}
        onRefresh={generateNewReport}
      />
      
      <div className="p-6 space-y-6">
        <PerformanceScoreCard score={report.performanceScore} />
        
        <PerformanceMetrics metrics={report.metrics} />
        
        <PerformanceInsights 
          strengths={report.analysis.strengths} 
          improvements={report.analysis.improvements}
          insights={report.analysis.insights}
        />
        
        <PerformanceRecommendations recommendations={report.recommendations} />
      </div>
    </motion.div>
  );
};

export default UserPerformanceReport;