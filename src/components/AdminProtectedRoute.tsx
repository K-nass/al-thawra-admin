import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken, getUserRole } from '@/api/client';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = getAuthToken();
  const userRole = getUserRole();

  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role is Member or Author, redirect to home
  if (userRole === 'Member' || userRole === 'Author') {
    return <Navigate to="/home" replace />;
  }

  // Admin, Writer, and other roles can access
  return <>{children}</>;
}
