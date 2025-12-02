/**
 * Application route constants
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard/home',
  DASHBOARD_POSTS: '/dashboard/posts',
  DASHBOARD_ADD_POST: '/dashboard/posts/add',
  DASHBOARD_EDIT_POST: '/dashboard/posts/edit/:id',
  DASHBOARD_USERS: '/dashboard/users',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_PROFILE: '/dashboard/profile',
  
  // Post routes
  POSTS: '/posts',
  POST_DETAIL: '/posts/:id',
  POST_BY_CATEGORY: '/posts/category/:category',
  
  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
} as const;

// Helper function to generate route with params
export const generateRoute = (
  route: string,
  params: Record<string, string | number>
): string => {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });
  return path;
};

// Example usage: generateRoute(ROUTES.POST_DETAIL, { id: '123' }) => '/posts/123'
