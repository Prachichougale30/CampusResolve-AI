import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentRole } = useAuth();
  const location = useLocation();

  // 1. If user is NOT logged in, block access and redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If user is logged in but doesn't have the required role for this page
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    toast.error(`Access restricted: You are logged in as a ${currentRole?.toUpperCase() || 'user'}.`, {
      id: 'access-denied-toast',
    });

    // Redirect to their own dashboard
    if (currentRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentRole === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

