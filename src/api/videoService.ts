import type { 
  VideoCreateRequest, 
  VideoResponse, 
  VideoValidationError, 
  VideoUploadResponse, 
  VideoUploadProgress,
  MediaUploadRequest 
} from '../types/video';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://cms-dev.runasp.net';

export class VideoService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 422) {
        // Validation error
        const validationError: VideoValidationError = errorData;
        throw new Error(
          validationError.errors?.['']?.[0] || 
          'Validation failed. Please check your input.'
        );
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async createVideo(
    categoryId: string, 
    videoData: VideoCreateRequest
  ): Promise<VideoResponse> {
    // Validate required fields before sending
    const validationResult = this.validateVideoData(videoData);
    if (!validationResult.isValid) {
      const firstError = Object.values(validationResult.errors)[0];
      throw new Error(firstError);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/posts/categories/${categoryId}/videos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(videoData)
      }
    );

    return this.handleResponse<VideoResponse>(response);
  }

  static validateVideoData(data: VideoCreateRequest): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    }

    if (!data.content?.trim()) {
      errors.content = 'Content is required';
    }

    if (!data.videoThumbnailUrl?.trim()) {
      errors.videoThumbnailUrl = 'Video thumbnail URL is required';
    }

    if (!data.categoryId?.trim()) {
      errors.categoryId = 'Category ID is required';
    }

    // Video URL and embed code validation
    if (data.videoUrl && !data.videoEmbedCode) {
      errors.videoEmbedCode = 'Video embed code is required when using an external video URL';
    }

    // Duration format validation
    if (data.duration && !/^-?(\d+\.)?\d{2}:\d{2}:\d{2}(\.\d{1,7})?$/.test(data.duration)) {
      errors.duration = 'Duration must be in format HH:MM:SS or HH:MM:SS.mmm';
    }

    // Either video URL or video files should be provided
    if (!data.videoUrl && (!data.videoFileUrls || data.videoFileUrls.length === 0)) {
      errors.video = 'Either video URL or video files must be provided';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static async getVideos(categoryId?: string): Promise<VideoResponse[]> {
    const url = categoryId 
      ? `${API_BASE_URL}/api/v1/posts/categories/${categoryId}/videos`
      : `${API_BASE_URL}/api/v1/posts/videos`;

    const response = await fetch(url);
    return this.handleResponse<VideoResponse[]>(response);
  }

  static async getVideo(videoId: string): Promise<VideoResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/videos/${videoId}`);
    return this.handleResponse<VideoResponse>(response);
  }

  static async updateVideo(
    videoId: string, 
    videoData: Partial<VideoCreateRequest>
  ): Promise<VideoResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData)
    });

    return this.handleResponse<VideoResponse>(response);
  }

  static async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/videos/${videoId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`);
    }
  }

  // Video upload methods
  static async uploadVideo(request: MediaUploadRequest): Promise<VideoUploadResponse> {
    const { file, onProgress } = request;

    // Validate file
    const validation = this.validateVideoFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/media/upload-video`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for FormData
    });

    const uploadResponse = await this.handleResponse<VideoUploadResponse>(response);

    // Start monitoring upload progress if callback provided
    if (onProgress && uploadResponse.signalRHubUrl) {
      this.monitorUploadProgress(uploadResponse.uploadId, uploadResponse.signalRHubUrl, onProgress);
    }

    return uploadResponse;
  }

  // New method: Upload and wait for completion automatically
  static async uploadVideoAndWaitForCompletion(
    request: MediaUploadRequest & { maxWaitTime?: number }
  ): Promise<VideoUploadResponse> {
    const { file, onProgress, maxWaitTime = 300000 } = request; // 5 minutes default

    // Start the upload
    const initialResponse = await this.uploadVideo({ file, onProgress });

    // Wait for processing to complete
    const finalResponse = await this.waitForProcessingComplete(
      initialResponse.uploadId, 
      maxWaitTime,
      onProgress
    );

    return finalResponse;
  }

  // Enhanced method to wait for processing with progress updates
  static async waitForProcessingComplete(
    uploadId: string, 
    maxWaitTime = 300000, // 5 minutes
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResponse> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getUploadStatus(uploadId);
      
      // Update progress if callback provided
      if (onProgress) {
        const progress: VideoUploadProgress = {
          uploadId,
          progress: status.status === 'Completed' ? 100 : 
                   status.status === 'Processing' ? 75 : 
                   status.status === 'Pending' ? 25 : 0,
          status: status.status === 'Completed' ? 'Completed' :
                 status.status === 'Processing' ? 'Processing' :
                 status.status === 'Failed' ? 'Failed' : 'Uploading',
          message: status.message,
          thumbnailUrl: status.thumbnailUrl,
          videoUrl: status.videoUrl
        };
        onProgress(progress);
      }

      // Check if processing is complete
      if (status.status === 'Completed') {
        if (!status.videoUrl || !status.thumbnailUrl) {
          throw new Error('Processing completed but video URLs are missing');
        }
        return status;
      }

      if (status.status === 'Failed') {
        throw new Error(`Video processing failed: ${status.message}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video processing timeout - please check status manually');
  }

  static validateVideoFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > 100 * 1024 * 1024) { // 100MB
      return { isValid: false, error: 'File size must be less than 100MB' };
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported video format. Please use MP4, AVI, MOV, or WebM' };
    }

    return { isValid: true };
  }

  static async getUploadStatus(uploadId: string): Promise<VideoUploadResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/media/upload-status/${uploadId}`);
    return this.handleResponse<VideoUploadResponse>(response);
  }

  // Monitor upload progress using polling (simplified version)
  // In a real implementation, you'd use SignalR for real-time updates
  private static async monitorUploadProgress(
    uploadId: string, 
    _signalRHubUrl: string, // Prefixed with _ to indicate intentionally unused
    onProgress: (progress: VideoUploadProgress) => void
  ): Promise<void> {
    const pollInterval = 2000; // Poll every 2 seconds
    let isCompleted = false;

    const poll = async () => {
      try {
        const status = await this.getUploadStatus(uploadId);
        
        const progress: VideoUploadProgress = {
          uploadId,
          progress: status.status === 'Completed' ? 100 : 
                   status.status === 'Processing' ? 75 : 
                   status.status === 'Pending' ? 25 : 0,
          status: status.status === 'Completed' ? 'Completed' :
                 status.status === 'Processing' ? 'Processing' :
                 status.status === 'Failed' ? 'Failed' : 'Uploading',
          message: status.message,
          thumbnailUrl: status.thumbnailUrl,
          videoUrl: status.videoUrl
        };

        onProgress(progress);

        if (status.status === 'Completed' || status.status === 'Failed') {
          isCompleted = true;
        }
      } catch (error) {
        console.error('Error polling upload status:', error);
        onProgress({
          uploadId,
          progress: 0,
          status: 'Failed',
          message: 'Failed to check upload status'
        });
        isCompleted = true;
      }

      if (!isCompleted) {
        setTimeout(poll, pollInterval);
      }
    };

    // Start polling
    setTimeout(poll, pollInterval);
  }

  // Helper method to generate embed code from common video URLs
  static generateEmbedCode(videoUrl: string, width = 560, height = 315): string | null {
    try {
      const url = new URL(videoUrl);
      
      // YouTube
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = '';
        
        if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.slice(1);
        } else {
          videoId = url.searchParams.get('v') || '';
        }
        
        if (videoId) {
          return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
      }
      
      // Vimeo
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `<iframe src="https://player.vimeo.com/video/${videoId}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }
}
