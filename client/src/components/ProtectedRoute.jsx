import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdminAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Checking credentials..." />;
  }

  if (requireAdmin) {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
