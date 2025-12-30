import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Define public routes that should NEVER redirect
  const PUBLIC_ROUTES = [
    '/',
    '/services',
    '/about', 
    '/contact',
    '/investment-platform',
    '/login',
    '/register',
    '/member-login',
    '/gldmf-login', 
    '/sian-login',
    '/unauthorized'
  ];

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If this is a public route, allow access to everyone
  if (isPublicRoute) {
    return children;
  }

  // For protected routes, check authentication
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  const hasRequiredRole = 
    requiredRole ? user.role === requiredRole :
    requiredRoles.length > 0 ? requiredRoles.includes(user.role) :
    true;

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Access granted
  return children;
};

export default ProtectedRoute;