import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '@/api/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
