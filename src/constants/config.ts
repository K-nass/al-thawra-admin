/**
 * Application configuration constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_IMAGES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Form validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 50000,
  MAX_EXCERPT_LENGTH: 500,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
} as const;

// Application metadata
export const APP_CONFIG = {
  NAME: 'Al-Qabas',
  DESCRIPTION: 'Content Management System',
  VERSION: '1.0.0',
  AUTHOR: 'Al-Qabas Team',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
} as const;

// Post status options
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const POST_STATUS_OPTIONS = [
  { value: POST_STATUS.DRAFT, label: 'Draft' },
  { value: POST_STATUS.PUBLISHED, label: 'Published' },
  { value: POST_STATUS.ARCHIVED, label: 'Archived' },
] as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  SUBSCRIBER: 'subscriber',
} as const;

// Content types
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  PODCAST: 'podcast',
  GALLERY: 'gallery',
} as const;

export const CONTENT_TYPE_OPTIONS = [
  { value: CONTENT_TYPES.ARTICLE, label: 'Article', icon: '📝' },
  { value: CONTENT_TYPES.VIDEO, label: 'Video', icon: '🎥' },
  { value: CONTENT_TYPES.PODCAST, label: 'Podcast', icon: '🎙️' },
  { value: CONTENT_TYPES.GALLERY, label: 'Gallery', icon: '🖼️' },
] as const;
