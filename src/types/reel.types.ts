// Reel types based on API documentation

export interface Reel {
    id: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    caption: string;
    duration: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isPublished: boolean;
    createdAt: string;
    userId: string;
    userName: string | null;
    userAvatarUrl: string | null;
    tags: string[];
    isLikedByCurrentUser: boolean | null;
}

export interface CreateReelRequest {
    videoUrl: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    tags?: string[];
    authorId?: string | null;
}

export interface UpdateReelRequest extends CreateReelRequest {
    id: string;
}

export interface GetReelsParams {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    searchPhrase?: string;
    userId?: string;
    isPublished?: boolean;
}

export interface ReelsResponse {
    pageSize: number;
    pageNumber: number;
    totalCount: number;
    totalPages: number;
    itemsFrom: number;
    itemsTo: number;
    items: Reel[];
}

// Media Upload Types
export interface MediaUploadResponse {
    uploadId: string;
    fileName: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    message: string;
    uploadedAt: string;
    signalRHubUrl: string;
}

export interface MediaUploadStatusResponse {
    uploadId: string;
    fileName: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    progressPercentage: number;
    url: string;  // This is the videoUrl or thumbnailUrl to use when creating a reel
    retryCount: number;
    uploadedAt: string;
    processingStartedAt: string;
    processingCompletedAt: string;
    processingDuration: string;
}
