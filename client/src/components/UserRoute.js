import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoute = ({ role = null }) => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin always goes to admin dashboard
  if (user.is_admin || user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Role-based route protection (student / alumni)
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Routes that require verification
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/events/register',
    '/jobs/apply',
    '/jobs/create',
    '/mentorship/apply',
    '/mentorship/create',
    '/donations'
  ];

  const currentPath = window.location.pathname;

  // Block unverified users from protected routes
  if (
    protectedRoutes.some(route => currentPath.startsWith(route)) &&
    !user.is_verified
  ) {
    return <Navigate to="/verification-pending" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
