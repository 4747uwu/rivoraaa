import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
    const { login, register, googleLogin} = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showVerifyMessage, setShowVerifyMessage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFormSubmitted(true);
        
        // Basic validation
        const errors = {};
        if (!isLogin) {
            if (!formData.name || formData.name.length < 2) 
                errors.name = "Name must be at least 2 characters";
            if (!formData.username || formData.username.length < 3) 
                errors.username = "Username must be at least 3 characters";
            if (formData.password.length < 6)
                errors.password = "Password must be at least 6 characters";
        }
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsLoading(false);
            return;
        }
        
        try {
            if (isLogin) {
                await login({
                    email: formData.email,
                    password: formData.password
                });
                toast.success('Logged in successfully!');
                navigate('/dashboard');
            } else {
                // Log the registration data for debugging
                console.log('Sending registration data:', formData);
                
                // Make sure we're sending the exact fields the backend expects
                const registrationData = {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };
                
                await register(registrationData);
                
                // Show verification message
                setShowVerifyMessage(true);
                toast.success('Account created successfully! Please check your email for verification.');
            }
        } catch (err) {
            console.error(isLogin ? 'Login error:' : 'Registration error:', err);
            // Show more specific error message
            const errorMsg = err.response?.data?.message || 
                            err.message || 
                            (isLogin ? 'Login failed' : 'Registration failed');
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setValidationErrors({});
        setFormSubmitted(false);
        setShowVerifyMessage(false);
        setFormData({
            name: '',
            username: '',
            email: '',
            password: ''
        });
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Animated background elements - no changes */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Your existing animated elements */}
            </div>

            {/* Main content */}
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                {/* Logo and company name */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-900">ProjectFlow</h1>
                    <p className="mt-2 text-gray-600">
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </p>
                </motion.div>

                {/* Main card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8"
                >
                    <AnimatePresence mode="wait">
                        {/* Email verification message */}
                        {showVerifyMessage ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-6"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Verify your email address
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    We've sent a verification link to:
                                    <span className="block font-medium mt-1 text-gray-800">
                                        {formData.email}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Please check your inbox and click the verification link to complete your registration.
                                </p>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        onClick={() => setShowVerifyMessage(false)}
                                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Use a different email
                                    </button>
                                    <button
                                        onClick={toggleMode}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Return to login
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {isLogin ? 'Sign in' : 'Create Account'}
                                    </h2>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r"
                                        role="alert"
                                    >
                                        <p className="text-sm text-red-700">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Form fields - no changes */}
                                    <div className="space-y-4">
                                        {!isLogin && (
                                            <>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        name="name"
                                                        type="text"
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                        placeholder="Full Name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        name="username"
                                                        type="text"
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                        placeholder="Username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isLogin && (
                                        <div className="flex items-center justify-start mb-2">
                                            <Link 
                                                to="/forgotPassword"
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    )}

                                    {/* Submit button with loading state */}
                                    <motion.button
                                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                                {isLogin ? 'Signing in...' : 'Creating account...'}
                                            </>
                                        ) : (
                                            <>
                                                {isLogin ? 'Sign in' : 'Create account'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Other sign-in options */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Google login button */}
                                <motion.button
                                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                    onClick={googleLogin}
                                    type="button"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <FcGoogle className="h-5 w-5 mr-2" />
                                    <span className="font-medium text-gray-700">Sign in with Google</span>
                                </motion.button>

                                {/* Toggle login/signup */}
                                <div className="text-center mt-6">
                                    <button
                                        onClick={toggleMode}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        disabled={isLoading}
                                    >
                                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;