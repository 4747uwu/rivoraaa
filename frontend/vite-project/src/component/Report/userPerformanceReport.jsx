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

  // Update the No User Selected view
  if (userId === 'all') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800/40 
                  shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-center h-40 text-gray-400 flex-col gap-3">
          <UserCheck size={40} className="text-indigo-400/70" />
          <p className="text-gray-400">Please select a specific user to view their performance report</p>
        </div>
      </motion.div>
    );
  }

  // Update the Loading state
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800/40 
                  shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-center h-40">
          <Loader size={40} className="animate-spin text-indigo-400" />
        </div>
      </motion.div>
    );
  }

  // Update the Error state
  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] rounded-lg p-6 border border-red-500/20 
                  shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center text-red-400 mb-4">
          <AlertCircle className="mr-2" size={20} />
          <h3 className="font-semibold">Failed to load performance report</h3>
        </div>
        <p className="text-red-400/80 mb-4">{error?.message || "Unknown error occurred"}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-red-500/10 border border-red-500/20 
                   rounded-md text-red-400 hover:bg-red-500/20 
                   transition-all duration-200"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Update the Generate Report view
  if (!report || !report.analysis) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800/40 
                  shadow-lg backdrop-blur-sm"
      >
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
                       inline-block p-3 rounded-full mb-4 border border-indigo-500/20">
            <Zap className="text-indigo-400" size={30} />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-200">Generate Performance Report</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Use our AI to generate a comprehensive performance report based on this user's tasks and activity.
          </p>
          <button
            onClick={generateNewReport}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 
                     text-white font-medium shadow-lg shadow-indigo-500/20
                     hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 
                     ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
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

  // Update the main report view
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1A1A1A] to-[#141414] rounded-lg 
                border border-gray-800/40 shadow-lg overflow-hidden
                backdrop-blur-sm"
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