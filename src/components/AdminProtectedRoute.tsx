import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '@/api/client';
import { usePermissions } from '@/contexts/PermissionsContext';
import { getRequiredPermissionForRoute } from '@/config/permissions';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = getAuthToken();

  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access - permissions are checked by PermissionRouteGuard
  // Users without admin permissions will see a filtered sidebar and be redirected at route level
  return <>{children}</>;
}

// =============================================================================
// PERMISSION ROUTE GUARD COMPONENT
// =============================================================================
// Use this to wrap routes that need permission checking
// Looks up the required permission from the route configuration

interface PermissionRouteGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function PermissionRouteGuard({ 
  children, 
  fallbackPath = '/admin' 
}: PermissionRouteGuardProps) {
  const location = useLocation();
  
  try {
    const { canAccess, isLoading } = usePermissions();
    
    // Don't block while permissions are loading
    // The user will see the page briefly, but we'll redirect if needed
    if (isLoading) {
      return <>{children}</>;
    }
    
    // Get required permission for current route
    const requiredPermission = getRequiredPermissionForRoute(location.pathname);
    
    // If no permission required, allow access
    if (!requiredPermission) {
      return <>{children}</>;
    }
    
    // Check if user has the required permission
    if (!canAccess(requiredPermission)) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    return <>{children}</>;
  } catch {
    // PermissionsContext not available - allow access (will be checked on next render)
    return <>{children}</>;
  }
}