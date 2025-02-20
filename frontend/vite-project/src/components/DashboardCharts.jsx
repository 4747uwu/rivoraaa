import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCharts = ({ darkMode, glassCard, textClass }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#e2e8f0' : '#1e293b'
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: { 
          color: darkMode ? '#e2e8f0' : '#1e293b',
          beginAtZero: true
        }
      },
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: { 
          color: darkMode ? '#e2e8f0' : '#1e293b' 
        }
      }
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129, 140, 248, 0.5)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <motion.div 
      className={`${glassCard} rounded-xl p-6 h-[300px]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Performance Overview</h2>
      <Line data={chartData} options={chartOptions} />
    </motion.div>
  );
};

export default DashboardCharts;
