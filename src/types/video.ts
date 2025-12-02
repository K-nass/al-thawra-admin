export interface VideoCreateRequest {
  title: string;
  slug?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  visibility: boolean;
  addToSlider: boolean;
  addToFeatured: boolean;
  addToBreaking: boolean;
  addToRecommended: boolean;
  showOnlyToRegisteredUsers: boolean;
  tagIds: string[];
  optionalURL?: string | null;
  content: string;
  videoUrl?: string | null;
  videoEmbedCode?: string | null;
  videoThumbnailUrl: string;
  duration?: string | null;
  videoFileUrls: string[];
  categoryId: string;
  language: 'English' | 'Arabic';
  authorId?: string | null;
  scheduledAt?: string | null;
  status: 'Draft' | 'Scheduled' | 'Published';
}

export interface VideoResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  videoEmbedCode?: string;
  videoThumbnailUrl: string;
  duration?: string;
  categoryId: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoValidationError {
  type: string;
  title: string;
  status: number;
  instance: string;
  errors: Record<string, string[]>;
  traceId: string;
  requestId: string;
}

export interface VideoFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface VideoUploadResponse {
  uploadId: string;
  fileName: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message: string;
  uploadedAt: string;
  signalRHubUrl: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: string;
}

export interface VideoUploadProgress {
  uploadId: string;
  progress: number;
  status: 'Uploading' | 'Processing' | 'Completed' | 'Failed';
  message: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface MediaUploadRequest {
  file: File;
  onProgress?: (progress: VideoUploadProgress) => void;
}

// Validation rules based on API requirements
export const VIDEO_VALIDATION_RULES = {
  // When videoUrl is provided, videoEmbedCode is required
  requireEmbedCodeWithUrl: (videoUrl: string | null, videoEmbedCode: string | null): boolean => {
    if (videoUrl && !videoEmbedCode) {
      return false;
    }
    return true;
  },
  
  // Duration pattern validation
  durationPattern: /^-?(\d+\.)?\d{2}:\d{2}:\d{2}(\.\d{1,7})?$/,
  
  // Required fields
  requiredFields: ['title', 'content', 'videoThumbnailUrl', 'categoryId'] as const,
  
  // Supported video formats
  supportedVideoFormats: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'] as const,
  
  // Max file size (100MB)
  maxFileSize: 100 * 1024 * 1024
} as const;
