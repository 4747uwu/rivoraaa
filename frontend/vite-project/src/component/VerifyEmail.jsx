import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/authContext';

const VerifyEmail = () => {
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const { verifyEmail } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = new URLSearchParams(location.search).get('token');
            
            if (!token) {
                setVerificationStatus('error');
                setMessage('Verification token is missing');
                return;
            }

            try {
                await verifyEmail(token);
                setVerificationStatus('success');
                setMessage('Email verified successfully');
            } catch (error) {
                setVerificationStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed');
            }
        };

        verifyToken();
    }, [location, verifyEmail]);

    const statusIcons = {
        verifying: <Loader className="h-12 w-12 text-indigo-600 animate-spin" />,
        success: <CheckCircle className="h-12 w-12 text-green-500" />,
        error: <XCircle className="h-12 w-12 text-red-500" />
    };

    const statusColors = {
        verifying: 'text-indigo-600',
        success: 'text-green-500',
        error: 'text-red-500'
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center mb-6"
                    >
                        {statusIcons[verificationStatus]}
                    </motion.div>

                    <h2 className={`text-2xl font-bold mb-4 ${statusColors[verificationStatus]}`}>
                        {verificationStatus === 'verifying' && 'Verifying Email'}
                        {verificationStatus === 'success' && 'Email Verified'}
                        {verificationStatus === 'error' && 'Verification Failed'}
                    </h2>

                    <p className="text-gray-600 mb-8">
                        {message || 'Please wait while we verify your email...'}
                    </p>

                    {(verificationStatus === 'success' || verificationStatus === 'error') && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            {verificationStatus === 'success' ? 'Proceed to Login' : 'Back to Login'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </motion.button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyEmail;