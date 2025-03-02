import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ProjectQueryProvider } from '../context/ProjectContext';
// import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ProtectedProjectRoutes component
 * 
 * Wraps project-related routes with:
 * 1. Authentication protection - redirects to login if not authenticated
 * 2. ProjectQueryProvider - provides React Query context for projects
 */
const ProtectedProjectRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* <LoadingSpinner size="lg" /> */}
        <h1>Loading...</h1>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render child routes with ProjectQueryProvider
  return (
    <ProjectQueryProvider>
      <Outlet />
    </ProjectQueryProvider>
  );
};

export default ProtectedProjectRoutes;