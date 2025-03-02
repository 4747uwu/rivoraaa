import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/authContext';

const PasswordReset = () => {
    const [mode, setMode] = useState('forgot'); // 'forgot' or 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const { forgotPassword, resetPassword, error, setError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
            setMode('reset');
            setResetToken(token);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'forgot') {
                await forgotPassword(email);
                setError('Password reset link has been sent to your email');
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await resetPassword({ token: resetToken, newPassword: password });
                navigate('/login', { 
                    state: { message: 'Password has been reset successfully' }
                });
            }
        } catch (err) {
            console.error('Password reset error:', err);
        }
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-900">Password Reset</h1>
                    <p className="mt-2 text-gray-600">
                        {mode === 'forgot' 
                            ? 'Enter your email to receive a reset link' 
                            : 'Enter your new password'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r"
                                >
                                    <p className="text-sm text-red-700">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {mode === 'forgot' ? (
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                placeholder="New password"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    {mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </motion.button>

                                <div className="text-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to login
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default PasswordReset;