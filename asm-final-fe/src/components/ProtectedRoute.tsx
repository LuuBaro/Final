// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useStore();
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);

  if (!user || !allowedRoles.includes(user.role)) {
    console.log('Redirecting to /404');
    return <Navigate to="/404" replace />;
  }

  console.log('Rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoute;