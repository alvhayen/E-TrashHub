import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ROLE_DASHBOARDS: Record<string, string> = {
  rumah_tangga: '/household',
  driver: '/driver',
  admin_tps3r: '/admin',
  customer: '/customer',
  pemda: '/pemda',
  super_admin: '/superadmin',
  admin_pemda: '/admin-pemda',
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318' }}>
        <div style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 600 }}>Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.status === 'pending') {
    return <Navigate to="/auth/pending-verification" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard instead of /unauthorized
    const userDashboard = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
}
