import { apiClient } from "./client";
import type {
    Reel,
    CreateReelRequest,
    UpdateReelRequest,
    GetReelsParams,
    ReelsResponse,
    MediaUploadResponse,
    MediaUploadStatusResponse,
} from "../types/reel.types";

export const reelsApi = {
    /**
     * Get all reels with optional filters and pagination
     */
    getAll: async (params?: GetReelsParams) => {
        const queryParams = new URLSearchParams();

        if (params?.pageNumber) queryParams.append("PageNumber", String(params.pageNumber));
        if (params?.pageSize) queryParams.append("PageSize", String(params.pageSize));
        if (params?.sortBy) queryParams.append("SortBy", params.sortBy);
        if (params?.sortDirection) queryParams.append("SortDirection", params.sortDirection);
        if (params?.searchPhrase) queryParams.append("SearchPhrase", params.searchPhrase);
        if (params?.userId) queryParams.append("UserId", params.userId);
        if (params?.isPublished !== undefined) queryParams.append("IsPublished", String(params.isPublished));

        const response = await apiClient.get<ReelsResponse>(`/reels?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Get a single reel by ID
     */
    getById: async (id: string) => {
        const response = await apiClient.get<Reel>(`/reels/${id}`);
        return response.data;
    },

    /**
     * Create a new reel
     * Note: videoUrl must be obtained first by uploading via /media/upload-video
     * Video must be 1-90 seconds. Requires AddReels permission.
     */
    create: async (data: CreateReelRequest) => {
        const response = await apiClient.post<Reel>("/reels", data);
        return response.data;
    },

    /**
     * Update an existing reel
     */
    update: async (id: string, data: Partial<CreateReelRequest>) => {
        const response = await apiClient.put<Reel>(`/reels/${id}`, {
            ...data,
            id,
        });
        return response.data;
    },

    /**
     * Delete a reel
     */
    delete: async (id: string) => {
        const response = await apiClient.delete(`/reels/${id}`);
        return response.data;
    },

    /**
     * Publish a reel (make it visible to users)
     */
    publish: async (id: string) => {
        const response = await apiClient.post<Reel>(`/reels/${id}/publish`);
        return response.data;
    },

    /**
     * Unpublish a reel (hide it from users)
     */
    unpublish: async (id: string) => {
        const response = await apiClient.post<Reel>(`/reels/${id}/unpublish`);
        return response.data;
    },

    // ==================== Media Upload Methods ====================

    /**
     * Upload a video file for use in a reel
     * Maximum size: 500 MB. Rate limit: 2 per minute, 10 per hour.
     * Returns uploadId to track processing status
     */
    uploadVideo: async (file: File): Promise<MediaUploadResponse> => {
        // Validate file size (500MB max)
        if (file.size > 500 * 1024 * 1024) {
            throw new Error("Video file size must be less than 500MB");
        }

        // Validate file type
        const allowedTypes = ["video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("Unsupported video format. Please use MP4, AVI, MOV, or WebM");
        }

        const formData = new FormData();
        formData.append("File", file);

        const response = await apiClient.post<MediaUploadResponse>("/media/upload-video", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    /**
     * Upload an image file for use as a thumbnail
     * Maximum size: 10 MB. Rate limit: 5 per minute, 50 per hour.
     */
    uploadImage: async (file: File): Promise<MediaUploadResponse> => {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("Image file size must be less than 10MB");
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("Unsupported image format. Please use JPEG, PNG, GIF, or WebP");
        }

        const formData = new FormData();
        formData.append("File", file);

        const response = await apiClient.post<MediaUploadResponse>("/media/upload-image", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    /**
     * Get the upload status and progress of a media file by uploadId
     */
    getUploadStatus: async (uploadId: string): Promise<MediaUploadStatusResponse> => {
        const response = await apiClient.get<MediaUploadStatusResponse>(`/media/upload-status/${uploadId}`);
        return response.data;
    },

    /**
     * Wait for media processing to complete by polling the upload status
     * @param uploadId - The upload ID returned from uploadVideo or uploadImage
     * @param maxWaitTime - Maximum time to wait in milliseconds (default: 5 minutes)
     * @param pollInterval - How often to check status in milliseconds (default: 3 seconds)
     * @returns Final upload status with url field populated
     */
    waitForProcessingComplete: async (
        uploadId: string,
        maxWaitTime = 300000, // 5 minutes
        pollInterval = 3000 // 3 seconds
    ): Promise<MediaUploadStatusResponse> => {
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            const status = await reelsApi.getUploadStatus(uploadId);

            // Check if processing is complete
            if (status.status === "Completed") {
                if (!status.url) {
                    throw new Error("Processing completed but URL is missing");
                }
                return status;
            }

            if (status.status === "Failed") {
                throw new Error(`Media processing failed: ${status.fileName}`);
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        throw new Error("Media processing timeout - please check status manually");
    },

    /**
     * Upload video and wait for completion automatically
     * This is a convenience method that combines uploadVideo and waitForProcessingComplete
     */
    uploadVideoAndWait: async (file: File, maxWaitTime = 300000): Promise<MediaUploadStatusResponse> => {
        const uploadResponse = await reelsApi.uploadVideo(file);
        const finalStatus = await reelsApi.waitForProcessingComplete(uploadResponse.uploadId, maxWaitTime);
        return finalStatus;
    },

    /**
     * Upload image and wait for completion automatically
     * This is a convenience method that combines uploadImage and waitForProcessingComplete
     */
    uploadImageAndWait: async (file: File, maxWaitTime = 300000): Promise<MediaUploadStatusResponse> => {
        const uploadResponse = await reelsApi.uploadImage(file);
        const finalStatus = await reelsApi.waitForProcessingComplete(uploadResponse.uploadId, maxWaitTime);
        return finalStatus;
    },
};

// Re-export types for convenience
export type {
    Reel,
    CreateReelRequest,
    UpdateReelRequest,
    GetReelsParams,
    ReelsResponse,
    MediaUploadResponse,
    MediaUploadStatusResponse,
};
