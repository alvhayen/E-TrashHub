import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Block pending or suspended users from accessing protected routes
  if (user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.status === 'suspended') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Perform case-insensitive check
  const roleMatches = allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());

  if (!roleMatches) {
    // If not allowed, redirect to their designated dashboard
    const roleRoutes: Record<string, string> = {
      RUMAH_TANGGA: 'household',
      DRIVER: 'driver',
      ADMIN_TPS3R: 'admin',
      MITRA_B2B: 'mitra',
      PEMDA: 'pemda',
      SUPER_ADMIN: 'superadmin'
    };
    const targetPath = roleRoutes[user.role.toUpperCase()] || user.role.toLowerCase();
    return <Navigate to={`/${targetPath}`} replace />;
  }

  return <>{children}</>;
}
