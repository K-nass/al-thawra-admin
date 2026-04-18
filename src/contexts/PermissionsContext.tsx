import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import type { CurrentUserProfileDto } from '@/api/users.api';
import { canAccess, hasAnyPermission, hasAllPermissions } from '@/utils/permissions';

// =============================================================================
// PERMISSIONS CONTEXT
// =============================================================================

interface PermissionsContextType {
  permissions: string[];
  hasAllPermissions: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  canAccess: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissionsCheck: (permissions: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

// Key for sessionStorage persistence
const STORAGE_KEY = 'user_permissions';

function storePermissions(permissions: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
  } catch {
    // Ignore storage errors
  }
}

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { data: profile, isLoading, isError, error } = useQuery<CurrentUserProfileDto, Error>({
    queryKey: ['currentUserProfile'],
    queryFn: () => usersApi.getCurrentProfile(),
    staleTime: Infinity, // Cache indefinitely until manual invalidation
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const permissions = profile?.permissions ?? [];
  const userHasAllPermissions = profile?.hasAllPermissions ?? false;

  // Persist permissions to sessionStorage when we get them
  if (!isLoading && profile && permissions.length > 0) {
    storePermissions(permissions);
  }

  // memoized permission check functions
  const value = useMemo<PermissionsContextType>(() => ({
    permissions,
    hasAllPermissions: userHasAllPermissions,
    isLoading,
    isError,
    error: error ?? null,
    canAccess: (permission: string) => canAccess(permissions, userHasAllPermissions, permission),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, userHasAllPermissions, perms),
    hasAllPermissionsCheck: (perms: string[]) => hasAllPermissions(permissions, userHasAllPermissions, perms),
  }), [permissions, userHasAllPermissions, isLoading, isError, error]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}