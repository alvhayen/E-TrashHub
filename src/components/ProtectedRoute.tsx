// TODO: RESTORE AUTH — ProtectedRoute bypassed, renders children directly
import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // TODO: RESTORE AUTH — re-enable auth check, role check, status check
  // Original behavior:
  //   - If loading, show spinner
  //   - If no user, redirect to /login
  //   - If pending, redirect to /pending-approval
  //   - If suspended, redirect to /unauthorized
  //   - If role mismatch, redirect to user's dashboard
  return <>{children}</>;
}
