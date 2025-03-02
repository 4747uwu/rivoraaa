import { createContext, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    // Check if user is authenticated
    const { data: user, isLoading } = useQuery({
        queryKey: ['authUser'], // Fixed: queryKey instead of querykey
        queryFn: async () => {
            const { data } = await axios.get('/api/auth/user');
            return data.user; // Extract user from response
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
        onError: (error) => {
            console.error('Auth check error:', error);
            // Handle authentication errors gracefully
        }
    });
        console.log(user);


    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async ({ username, name, email, password }) => {
            const { data } = await axios.post('/api/auth/register', {
                username,
                name,
                email,
                password
            });
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.invalidateQueries(['authUser']);
        }
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async ({ email, password }) => {
            const { data } = await axios.post('/api/auth/login', { email, password });
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.invalidateQueries(['authUser']);
            queryClient.clear(); // Clear all queries on login
        }
    });

    // Google login function (define this based on your implementation)
   const googleLogin = async () => {
    try {
        // Clear any existing cache before Google login
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies
        // document.cookie.split(";").forEach((cookie) => {
        //     const eqPos = cookie.indexOf("=");
        //     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        //     document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        // });

        // Store the return URL in sessionStorage
        sessionStorage.setItem('returnUrl', window.location.href);

        // Redirect to Google OAuth endpoint
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } catch (error) {
        console.error('Google login error:', error);
        // Handle error appropriately
        throw new Error('Failed to initiate Google login');
    }
};

    // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
        const userId = user?._id;
        await axios.post('/api/auth/logout', { userId });
        
        // Clear all storage mechanisms
        localStorage.clear(); // Clear localStorage
        sessionStorage.clear(); // Clear sessionStorage
        
        // Clear cookies
        document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        // Remove axios default headers
        delete axios.defaults.headers.common['Authorization'];
    },
    onSuccess: () => {
        // Clear React Query cache
        queryClient.clear();
        queryClient.removeQueries(); // Remove all queries from cache
        queryClient.invalidateQueries(); // Invalidate all queries
        
        // Force reload to clear any remaining state
        window.location.href = '/login';
    },
    onError: (error) => {
        console.error('Logout failed:', error);
        // Still attempt to clear frontend state even if logout request fails
        localStorage.clear();
        sessionStorage.clear();
        queryClient.clear();
    }
});

    // Forgot password
    const forgotPasswordMutation = useMutation({
        mutationFn: (email) => axios.post('/api/auth/forgot-password', { email })
    });

    // Reset password
    const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }) => {
        try {
            const { data } = await axios.post('/api/auth/reset-password', {
                token,
                newPassword
            });
            return data;
        } catch (error) {
            console.error('Password reset error:', error.response?.data?.message || 'Reset failed');
            throw error;
        }
    }
});

    // Verify email
    const verifyEmailMutation = useMutation({
        mutationFn: (token) => axios.post('/api/auth/verify-email', { token })
    });

    const value = {
        user,
        loading: isLoading,
        googleLogin,
        register: registerMutation.mutateAsync,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        forgotPassword: forgotPasswordMutation.mutateAsync,
        resetPassword: resetPasswordMutation.mutateAsync,
        verifyEmail: verifyEmailMutation.mutateAsync,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;





