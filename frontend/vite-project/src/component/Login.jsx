import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';

const Login = () => {
    const { login, register, googleLogin, error, setError } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login({
                    email: formData.email,
                    password: formData.password
                });
                 navigate('/dashboard');
            } else {
                await register(formData);
                navigate('/');
            }
           
        } catch (err) {
            console.error(isLogin ? 'Login error:' : 'Registration error:', err);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({
            name: '',
            username: '',
            email: '',
            password: ''
        });
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-30"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        style={{
                            width: `${200 + i * 100}px`,
                            height: `${200 + i * 100}px`,
                            background: i % 2 === 0 ? '#818CF8' : '#60A5FA',
                            left: `${i * 20}%`,
                            top: `${i * 15}%`,
                        }}
                    />
                ))}
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
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/90"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
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


                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    {isLogin ? 'Sign in' : 'Create account'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </motion.button>
                            </form>


                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={googleLogin}
                                type="button"
                                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
                            >
                                <FcGoogle className="h-5 w-5 mr-2" />
                                <span className="font-medium text-gray-700">Sign in with Google</span>
                            </motion.button>

                            <div className="text-center mt-6">
                                <button
                                    onClick={toggleMode}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;