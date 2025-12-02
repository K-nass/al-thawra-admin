import { VideoService } from '../api/videoService';
import type { VideoCreateRequest, VideoUploadResponse } from '../types/video';

/**
 * Integration utility for handling video uploads and creating video posts
 * Based on your actual API response structure
 */
export class VideoIntegration {
  /**
   * Complete workflow: Upload video file and create video post (AUTOMATIC)
   * This method automatically waits for processing to complete and gets the URLs
   */
  static async uploadAndCreateVideo(
    file: File,
    categoryId: string,
    videoData: Omit<VideoCreateRequest, 'videoFileUrls' | 'videoThumbnailUrl'>
  ): Promise<{ uploadResponse: VideoUploadResponse; videoPost?: any }> {
    
    // Step 1: Upload the video file and wait for completion automatically
    const finalUploadStatus = await VideoService.uploadVideoAndWaitForCompletion({
      file,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress.progress}% - ${progress.message}`);
      },
      maxWaitTime: 300000 // 5 minutes
    });

    console.log('✅ Video processing completed automatically:', finalUploadStatus);

    // Step 2: Create video post with the uploaded video URLs
    let videoPost = null;
    if (finalUploadStatus.status === 'Completed' && finalUploadStatus.videoUrl && finalUploadStatus.thumbnailUrl) {
      const completeVideoData: VideoCreateRequest = {
        ...videoData,
        videoFileUrls: [finalUploadStatus.videoUrl],
        videoThumbnailUrl: finalUploadStatus.thumbnailUrl,
        duration: finalUploadStatus.duration || null
      };

      videoPost = await VideoService.createVideo(categoryId, completeVideoData);
      console.log('✅ Video post created successfully:', videoPost);
    } else {
      throw new Error('Video processing completed but URLs are missing');
    }

    return {
      uploadResponse: finalUploadStatus,
      videoPost
    };
  }

  /**
   * Wait for video processing to complete
   */
  static async waitForProcessingComplete(
    uploadId: string, 
    maxWaitTime = 300000 // 5 minutes
  ): Promise<VideoUploadResponse> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await VideoService.getUploadStatus(uploadId);
      
      console.log(`Processing status: ${status.status} - ${status.message}`);

      if (status.status === 'Completed' || status.status === 'Failed') {
        return status;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video processing timeout');
  }

  /**
   * Handle your actual upload response format
   */
  static processUploadResponse(response: VideoUploadResponse): {
    isProcessing: boolean;
    canCreatePost: boolean;
    message: string;
  } {
    const isProcessing = response.status === 'Pending' || response.status === 'Processing';
    const canCreatePost = response.status === 'Completed' && 
                         !!response.videoUrl && 
                         !!response.thumbnailUrl;

    let message = response.message;
    
    switch (response.status) {
      case 'Pending':
        message = 'تم رفع الفيديو وبدء المعالجة في الخلفية (يتضمن إنشاء الصورة المصغرة)';
        break;
      case 'Processing':
        message = 'جاري معالجة الفيديو وإنشاء الصورة المصغرة...';
        break;
      case 'Completed':
        message = 'تم الانتهاء من معالجة الفيديو بنجاح';
        break;
      case 'Failed':
        message = 'فشل في معالجة الفيديو';
        break;
    }

    return {
      isProcessing,
      canCreatePost,
      message
    };
  }

  /**
   * Example usage with your actual response
   */
  static exampleUsage() {
    // Your actual response:
    const actualResponse: VideoUploadResponse = {
      uploadId: "fc0f0789-7efc-4c62-a713-ab417b36eafe",
      fileName: "Dummy Video For Website.mp4",
      status: "Pending",
      message: "Video upload started. Processing in background (includes thumbnail generation).",
      uploadedAt: "2025-11-12T18:00:06.1990794Z",
      signalRHubUrl: "/hubs/media-upload"
    };

    const processedInfo = this.processUploadResponse(actualResponse);
    console.log('Processed info:', processedInfo);

    // Example of creating a complete video post
    const exampleVideoData = {
      title: "فيديو تجريبي للموقع",
      content: "هذا فيديو تجريبي تم رفعه للموقع",
      categoryId: "20422779-69b1-4d49-a404-43c1869a9728",
      language: "Arabic" as const,
      visibility: true,
      addToSlider: false,
      addToFeatured: true,
      addToBreaking: false,
      addToRecommended: true,
      showOnlyToRegisteredUsers: false,
      tagIds: [],
      status: "Published" as const,
      slug: null,
      metaDescription: null,
      metaKeywords: null,
      optionalURL: null,
      videoUrl: null,
      videoEmbedCode: null,
      authorId: null,
      scheduledAt: null
    };

    return {
      actualResponse,
      processedInfo,
      exampleVideoData
    };
  }
}

// Export utility functions
export const createVideoFromUpload = VideoIntegration.uploadAndCreateVideo;
export const waitForVideoProcessing = VideoIntegration.waitForProcessingComplete;
export const processVideoUploadResponse = VideoIntegration.processUploadResponse;
