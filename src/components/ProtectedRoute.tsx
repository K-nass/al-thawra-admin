import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '@/api/client';
import { usePermissions } from '@/contexts/PermissionsContext';
import { getRequiredPermissionForRoute } from '@/config/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackPath = '/admin' 
}: ProtectedRouteProps) {
  const token = getAuthToken();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific permission is required, check it
  if (requiredPermission) {
    try {
      const { canAccess } = usePermissions();
      if (!canAccess(requiredPermission)) {
        return <Navigate to={fallbackPath} replace />;
      }
    } catch {
      // PermissionsContext not available yet - allow access while loading
      // The permission check will happen when the context is available
    }
  }

  return <>{children}</>;
}

// =============================================================================
// HELPER COMPONENT FOR ROUTE-LEVEL PERMISSION CHECKING
// =============================================================================
// This component checks permissions based on the current route path

export function RoutePermissionGuard({ 
  children, 
  fallbackPath = '/admin' 
}: { 
  children: ReactNode;
  fallbackPath?: string;
}) {
  const location = useLocation();
  
  try {
    const { canAccess, isLoading } = usePermissions();
    
    // Don't block while permissions are loading
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
    // PermissionsContext not available - allow access
    return <>{children}</>;
  }
}