// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isRefreshing, setIsRefreshing] = useState(false); 

//     // Configure axios defaults
//       useEffect(() => {
//         axios.defaults.baseURL = import.meta.env.VITE_API_URL;
//         axios.defaults.withCredentials = true; // Important for cookies
//         axios.defaults.headers.common['Content-Type'] = 'application/json';
        
//         // Initial auth check
//         checkAuth();
//     }, []);


//     // Check if user is authenticated
// const checkAuth = async () => {
   
    
//     try {
//         const { data } = await axios.get('/api/auth/user', {
//             withCredentials: true,
          
//         });
//         console.log('Auth check response:', data);
        
//         if (data.user) {
//             setUser(data.user);
//             console.log('User set:', data.user);
//         } else {
//             setUser(null);
//             localStorage.removeItem('accessToken');
//             console.log('No user data received');
//         }
//     } catch (error) {
//         console.error('Auth check failed:', error.response?.data || error.message);
//         setUser(null);
//         localStorage.removeItem('accessToken');
//     } finally {
//         setLoading(false);
//     }
// };


//     // Register new user
//     const register = async (userData) => {
//         try {
//             const { data } = await axios.post('/api/auth/register', userData);
//             setError(null);
//             return data;
//         } catch (error) {
//             setError(error.response?.data?.message || 'Registration failed');
//             throw error;
//         }
//     };

//     // Login user
//     const login = async (credentials) => {
//         try {
//             const { data } = await axios.post('/api/auth/login', credentials);
//             console.log(data);
//             setUser(data.user);
//             localStorage.setItem('accessToken', data.accessToken);
//             const token = localStorage.getItem('accessToken');
//             console.log(token);
//             setError(null);
//             await checkAuth();
//             return data;
//               // Refresh user data
//         } catch (error) {
//             setError(error.response?.data?.message || 'Login failed');
//             throw error;
//         }
//     };

//     // Google OAuth login
//     const googleLogin = () => {
//         window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
//     };

//     // Logout user
//     const logout = async () => {
//         try {
//             setIsRefreshing(true); // Prevent refresh attempts
//             await axios.post('/api/auth/logout', {}, { 
//                 withCredentials: true,
//             });
            
//             // Clear all auth state
//             localStorage.clear();
//             delete axios.defaults.headers.common['Authorization'];
//             setUser(null);
//             setError(null);
            
//             // Clear cookies
//             document.cookie.split(";").forEach((c) => {
//                 document.cookie = c
//                     .replace(/^ +/, "")
//                     .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
//             });
            
//             window.location.href = '/';
//         } catch (error) {
//             console.error('Logout failed:', error);
//             setError(error.response?.data?.message || 'Logout failed');
//         }
//     };

//     // Forgot password
//     const forgotPassword = async (email) => {
//         try {
//             const { data } = await axios.post('/api/auth/forgot-password', { email });
//             setError(null);
//             return data;
//         } catch (error) {
//             setError(error.response?.data?.message || 'Failed to send reset email');
//             throw error;
//         }
//     };

//     // Reset password
//     const resetPassword = async (token, newPassword) => {
//         try {
//             const { data } = await axios.post('/api/auth/reset-password', {
//                 token,
//                 newPassword
//             });
//             setError(null);
//             return data;
//         } catch (error) {
//             setError(error.response?.data?.message || 'Password reset failed');
//             throw error;
//         }
//     };

//     // Verify email
//     const verifyEmail = async (token) => {
//         try {
//             const { data } = await axios.post('/api/auth/verify-email', { token });
//             setError(null);
//             return data;
//         } catch (error) {
//             setError(error.response?.data?.message || 'Email verification failed');
//             throw error;
//         }
//     };

//     // Setup axios interceptor for token refresh
// // useEffect(() => {
// //     const interceptor = axios.interceptors.response.use(
// //         (response) => response,
// //         async (error) => {
// //             // Only attempt refresh if 401 and not already refreshing
// //             if (error.response?.status === 401 && !isRefreshing) {
// //                 try {
// //                     setIsRefreshing(true); // Prevent multiple refresh attempts
                    
// //                     // Call refresh endpoint with withCredentials for cookies
// //                     const { data } = await axios.post('/api/auth/refresh', {}, {
// //                         withCredentials: true
// //                     });

// //                     if (data.accessToken) {
// //                         // Update localStorage and axios headers
// //                         localStorage.setItem('accessToken', data.accessToken);
// //                         axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

// //                         // Retry the original request with new token
// //                         const newConfig = {
// //                             ...error.config,
// //                             headers: {
// //                                 ...error.config.headers,
// //                                 Authorization: `Bearer ${data.accessToken}`
// //                             }
// //                         };
// //                         return axios(newConfig);
// //                     }
// //                 } catch (refreshError) {
// //                     // Handle refresh failure
// //                     console.error('Token refresh failed:', refreshError);
// //                     setUser(null);
// //                     localStorage.clear();
// //                     window.location.replace('/');
// //                 } finally {
// //                     setIsRefreshing(false);
// //                 }
// //             }
// //             return Promise.reject(error);
// //         }
// //     );

// //     return () => {
// //         axios.interceptors.response.eject(interceptor);
// //     };
// // }, [isRefreshing]);

//     const value = {
//         user,
//         loading,
//         error,
//         register,
//         login,
//         googleLogin,
//         logout,
//         forgotPassword,
//         resetPassword,
//         verifyEmail,
//         setError
//     };

//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };