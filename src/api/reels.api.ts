import { apiClient } from "./client";
import type {
    Reel,
    CreateReelRequest,
    UpdateReelRequest,
    GetReelsParams,
    GetReelsFeedParams,
    ReelsResponse,
    ReelFeedResponse,
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
     * Get reels feed with infinite scrolling (cursor-based)
     */
    getFeed: async (params?: GetReelsFeedParams) => {
        const queryParams = new URLSearchParams();

        if (params?.cursor) queryParams.append("Cursor", params.cursor);
        if (params?.limit) queryParams.append("Limit", String(params.limit));

        const response = await apiClient.get<ReelFeedResponse>(`/reels`, { params: queryParams });
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
     * Note: videoUrl must be obtained first by uploading via Cloudinary signed upload
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

};

// Re-export types for convenience
export type {
    Reel,
    CreateReelRequest,
    UpdateReelRequest,
    GetReelsParams,
    GetReelsFeedParams,
    ReelsResponse,
    ReelFeedResponse,
};
