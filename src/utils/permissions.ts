import { KNOWN_PERMISSIONS, isKnownPermission } from '../config/permissions';

// =============================================================================
// PERMISSION UTILITY FUNCTIONS
// =============================================================================
// These functions work with permissions from the user's profile
// They handle the "hasAllPermissions" admin override and unknown permissions

/**
 * Check if a user has a specific permission
 * - If hasAllPermissions is true, always returns true (admin override)
 * - Unknown permissions from backend are safely ignored (returns false)
 * 
 * @param userPermissions - Array of permissions from user's profile
 * @param hasAllPermissions - Whether user has full access
 * @param permission - The permission to check for
 * @returns boolean
 */
export function canAccess(
  userPermissions: string[],
  hasAllPermissions: boolean,
  permission: string
): boolean {
  // Admin override - grant full access
  if (hasAllPermissions) {
    return true;
  }

  // If no permission required, allow access
  if (!permission) {
    return true;
  }

  // Unknown permission - safely ignore (not in KNOWN_PERMISSIONS)
  if (!isKnownPermission(permission)) {
    return false;
  }

  // Check if user has the permission
  return userPermissions.includes(permission);
}

/**
 * Check if a user has ANY of the specified permissions
 * - If hasAllPermissions is true, always returns true
 * 
 * @param userPermissions - Array of permissions from user's profile
 * @param hasAllPermissions - Whether user has full access
 * @param permissions - Array of permissions to check
 * @returns boolean
 */
export function hasAnyPermission(
  userPermissions: string[],
  hasAllPermissions: boolean,
  permissions: string[]
): boolean {
  // Admin override
  if (hasAllPermissions) {
    return true;
  }

  // No permissions required
  if (!permissions || permissions.length === 0) {
    return true;
  }

  // Filter to only known permissions, then check
  const knownPermissions = permissions.filter(isKnownPermission);
  if (knownPermissions.length === 0) {
    return false;
  }

  return knownPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if a user has ALL of the specified permissions
 * - If hasAllPermissions is true, always returns true
 * 
 * @param userPermissions - Array of permissions from user's profile
 * @param hasAllPermissions - Whether user has full access
 * @param permissions - Array of permissions to check
 * @returns boolean
 */
export function hasAllPermissions(
  userPermissions: string[],
  hasAllPermissions: boolean,
  permissions: string[]
): boolean {
  // Admin override
  if (hasAllPermissions) {
    return true;
  }

  // No permissions required
  if (!permissions || permissions.length === 0) {
    return true;
  }

  // Filter to only known permissions, then check
  const knownPermissions = permissions.filter(isKnownPermission);
  if (knownPermissions.length === 0) {
    return false;
  }

  return knownPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Filter user's permissions to only known/implemented ones
 * Useful for display purposes to show only relevant permissions
 * 
 * @param userPermissions - Array of permissions from user's profile
 * @returns Array of only known permissions
 */
export function getKnownUserPermissions(userPermissions: string[]): string[] {
  return userPermissions.filter(isKnownPermission);
}