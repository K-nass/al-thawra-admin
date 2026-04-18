import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FilePlus,
  Files,
  Rss,
  Star,
  Zap,
  Video,
  Layers,
  Tags,
  BookOpen,
  Users,
  Key,
} from 'lucide-react';

// =============================================================================
// KNOWN PERMISSIONS - Only permissions for IMPLEMENTED modules in the dashboard
// =============================================================================
// These are mapped from the backend permissions that match actual frontend routes
// Backend may send additional permissions (e.g., RSSFeeds, AIWriter) that aren't implemented yet - these are ignored

export const KNOWN_PERMISSIONS = {
  // Posts module
  AddPost: 'AddPost',
  CanReferPost: 'CanReferPost',
  ManageAllPosts: 'ManageAllPosts',

  // Reels module
  AddReels: 'AddReels',
  CanReferReel: 'CanReferReel',
  ManageAllReels: 'ManageAllReels',

  // Categories module
  Categories: 'Categories',

  // Tags module
  Tags: 'Tags',

  // Users module
  Users: 'Users',

  // Roles & Permissions module
  RolesAndPermissions: 'RolesAndPermissions',

  // Magazines module
  Magazines: 'Magazines',
} as const;

export type KnownPermission = typeof KNOWN_PERMISSIONS[keyof typeof KNOWN_PERMISSIONS];

// =============================================================================
// ROUTE TO PERMISSION MAPPING
// =============================================================================
// Maps each route to its required permission (from implemented modules only)
// Unimplemented module permissions are commented/skipped to avoid confusion

export const ROUTE_PERMISSIONS: Record<string, string> = {
  // Dashboard home - accessible to all authenticated users
  '/admin': '',

  // Posts routes
  '/admin/post-format': 'AddPost',
  '/admin/add-post': 'AddPost',
  '/admin/edit-post/:postId': 'AddPost',
  '/admin/posts/all': 'ManageAllPosts',
  '/admin/posts/slider-posts': 'ManageAllPosts',
  '/admin/posts/featured-posts': 'ManageAllPosts',
  '/admin/posts/breaking-news': 'ManageAllPosts',

  // Reels routes
  '/admin/reels': 'AddReels',
  '/admin/edit-reel/:id': 'AddReels',

  // Categories routes
  '/admin/categories': 'Categories',
  '/admin/add-category': 'Categories',
  '/admin/edit-category/:slug': 'Categories',

  // Tags routes
  '/admin/tags': 'Tags',
  '/admin/add-tag': 'Tags',
  '/admin/edit-tag/:id': 'Tags',

  // Magazines route
  '/admin/magazines': 'Magazines',

  // Users routes
  '/admin/users': 'Users',
  '/admin/edit-user/:id/:username': 'Users',

  // Roles & Permissions routes
  '/admin/roles-permissions': 'RolesAndPermissions',
  '/admin/add-role': 'RolesAndPermissions',
  '/admin/edit-role/:id': 'RolesAndPermissions',
};

// =============================================================================
// SIDEBAR ITEMS WITH PERMISSIONS
// =============================================================================
// Maps sidebar items to their required permissions

export interface SidebarItemConfig {
  id: number;
  labelKey: string;
  icon: LucideIcon;
  path: string;
  requiredPermission?: string;
}

export const SIDEBAR_PERMISSIONS: SidebarItemConfig[] = [
  { id: 0, labelKey: 'dashboard.home', icon: Home, path: '/admin' },
  { id: 2, labelKey: 'dashboard.addPost', icon: FilePlus, path: '/admin/post-format', requiredPermission: 'AddPost' },
  { id: 3, labelKey: 'dashboard.allPosts', icon: Files, path: '/admin/posts/all', requiredPermission: 'ManageAllPosts' },
  { id: 4, labelKey: 'dashboard.sliderPosts', icon: Rss, path: '/admin/posts/slider-posts', requiredPermission: 'ManageAllPosts' },
  { id: 5, labelKey: 'dashboard.featuredPosts', icon: Star, path: '/admin/posts/featured-posts', requiredPermission: 'ManageAllPosts' },
  { id: 6, labelKey: 'dashboard.breakingNews', icon: Zap, path: '/admin/posts/breaking-news', requiredPermission: 'ManageAllPosts' },
  { id: 7, labelKey: 'dashboard.reels', icon: Video, path: '/admin/reels', requiredPermission: 'AddReels' },
  { id: 8, labelKey: 'dashboard.categories', icon: Layers, path: '/admin/categories', requiredPermission: 'Categories' },
  { id: 9, labelKey: 'dashboard.tags', icon: Tags, path: '/admin/tags', requiredPermission: 'Tags' },
  { id: 10, labelKey: 'dashboard.magazines', icon: BookOpen, path: '/admin/magazines', requiredPermission: 'Magazines' },
  { id: 11, labelKey: 'dashboard.users', icon: Users, path: '/admin/users', requiredPermission: 'Users' },
  { id: 12, labelKey: 'dashboard.rolesAndPermissions', icon: Key, path: '/admin/roles-permissions', requiredPermission: 'RolesAndPermissions' },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the required permission for a given route path
 * @param pathname - The route path to check
 * @returns The required permission string or empty if no permission required
 */
export function getRequiredPermissionForRoute(pathname: string): string {
  // Direct match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Check with dynamic segments replaced
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes(':')) {
      const regex = new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}$`);
      if (regex.test(pathname)) {
        return permission;
      }
    }
  }

  return '';
}

/**
 * Check if a permission is known/implemented
 * @param permission - The permission string to check
 * @returns True if the permission is in KNOWN_PERMISSIONS
 */
export function isKnownPermission(permission: string): boolean {
  return Object.values(KNOWN_PERMISSIONS).includes(permission as KnownPermission);
}