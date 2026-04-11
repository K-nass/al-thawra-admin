import type {
  VideoCreateRequest, 
  VideoResponse, 
  VideoValidationError, 
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
