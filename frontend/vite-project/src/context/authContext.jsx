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
    const { data: user, isLoading, refetch } = useQuery({
        queryKey: ['authUser'], // Fixed: queryKey instead of querykey
        queryFn: async () => {
            const { data } = await axios.get('/api/auth/user');
            return data.user; // Extract user from response
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        onError: (error) => {
            console.error('Auth check error:', error);
            // Handle authentication errors gracefully
        }
    });
        console.log(user);


    // Register mutation
    // const registerMutation = useMutation({
    //     mutationFn: async ({ username, name, email, password }) => {
    //         const { data } = await axios.post('/api/auth/register', {
    //             username,
    //             name,
    //             email,
    //             password
    //         });
    //         return data;
    //     },
    //     onSuccess: (data) => {
    //         localStorage.setItem('accessToken', data.accessToken);
    //         queryClient.invalidateQueries(['authUser']);
    //     }
    // });

    const registerMutation = useMutation({
    mutationFn: async (userData) => {
        // Make sure we're sending all required fields
        const { username, name, email, password } = userData;
        
        // Log what we're sending for debugging
        console.log('Sending registration data to API:', { username, name, email });
        
        const response = await axios.post('/api/auth/register', {
            username,
            name,
            email,
            password
        });
        
        return response.data;
    },
    onSuccess: (data) => {
        // Check if we got an access token (immediate authentication)
        if (data.accessToken) {
            // User can login immediately
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.invalidateQueries(['authUser']);
            return true;
        } 
        
        // Email verification flow - don't set token
        // Just return success so the UI can show verification message
        return true;
    },
    onError: (error) => {
        console.error('Registration error:', error.response?.data || error);
        throw error;
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
// Replace your current logout mutation with this more robust version
const logoutMutation = useMutation({
  mutationFn: async () => {
    try {
      await axios.post('/api/auth/logout');
      return true;
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API fails
      return false;
    }
  },
  onSuccess: () => {
    // Clear all client state BEFORE redirecting
    localStorage.clear();
    sessionStorage.clear();
    
    // Aggressively clear cookies (may not affect HTTP-only cookies from server)
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.trim().substr(0, eqPos) : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    // Remove auth headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset React Query completely
    queryClient.clear();
    queryClient.resetQueries(['authUser'], { exact: true });
    
    // Force hard reload instead of React Router navigation
    window.location.replace('/');
  },
  onError: () => {
    // Same cleanup even on error, force hard reload
    localStorage.clear();
    sessionStorage.clear();
    queryClient.clear();
    window.location.replace('/');
  }
});

    const refreshUser = async () => {
    try {
        // Invalidate and refetch the user data
        await queryClient.invalidateQueries(['authUser']);
        // Force a refetch in case invalidation doesn't trigger it
        const { data } = await axios.get('/api/auth/user');
        return data.user;
    } catch (error) {
        console.error('Error refreshing user data:', error);
        throw error;
    }
    };



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
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;





