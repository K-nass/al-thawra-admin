import { apiClient } from './client';
import type { Post, CreatePostDto, UpdatePostDto } from '../types/post.types';

export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: T[];
}

export interface GetPostsParams {
  categorySlug?: string;
  authorName?: string;
  hasAuthor?: boolean;
  status?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isSlider?: boolean;
  isRecommended?: boolean;
  language?: string;
  type?: string;
  from?: string;
  to?: string;
  includeLikedByUsers?: boolean;
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string;
}

export const postsApi = {
  // Get posts with optional filters
  getPosts: async (params: GetPostsParams = {}) => {
    const queryParams: Record<string, string | number | boolean> = {};

    // Only add parameters that have actual values
    if (params.categorySlug) queryParams.CategorySlug = params.categorySlug;
    if (params.authorName) queryParams.AuthorName = params.authorName;
    if (params.hasAuthor !== undefined) queryParams.HasAuthor = params.hasAuthor;
    if (params.status) queryParams.Status = params.status;
    if (params.language) queryParams.Language = params.language;
    if (params.type) queryParams.Type = params.type;
    if (params.from) queryParams.From = params.from;
    if (params.to) queryParams.To = params.to;
    if (params.searchPhrase) queryParams.SearchPhrase = params.searchPhrase;

    // Always include boolean flags with explicit false values (backend expects them)
    queryParams.IsFeatured = params.isFeatured ?? false;
    queryParams.IsBreaking = params.isBreaking ?? false;
    queryParams.IsSlider = params.isSlider ?? false;
    queryParams.IsRecommended = params.isRecommended ?? false;
    queryParams.IncludeLikedByUsers = params.includeLikedByUsers ?? false;
    queryParams.PageNumber = params.pageNumber ?? 1;
    queryParams.PageSize = params.pageSize ?? 15;

    const response = await apiClient.get<PaginatedResponse<Post>>('/posts', { params: queryParams });
    return response;
  },

  // Get all posts (convenience method)
  getAll: async () => {
    return postsApi.getPosts();
  },

  // Get single post by ID (legacy - may not work for all endpoints)
  getById: async (id: string | number) => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },

  // Get article by slug (recommended method)
  getArticleBySlug: async (categorySlug: string, articleSlug: string) => {
    const response = await apiClient.get(`/posts/categories/${categorySlug}/articles/${articleSlug}`);
    return response.data;
  },

  // Get post by slug (generic method for all post types)
  getPostBySlug: async (categorySlug: string, postSlug: string, postType: string = 'article') => {
    // Map post types to their API endpoints
    const endpointMap: Record<string, string> = {
      'article': 'articles',
      'gallery': 'galleries',
      'video': 'videos',
      'audio': 'audios',
      'sorted-list': 'sorted-lists',
    };
    
    const endpoint = endpointMap[postType] || 'articles';
    const response = await apiClient.get(`/posts/categories/${categorySlug}/${endpoint}/${postSlug}`);
    return response.data;
  },

  // Create new post
  create: async (data: CreatePostDto) => {
    const response = await apiClient.post<Post>('/posts', data);
    return response.data;
  },

  // Update article
  updateArticle: async (categoryId: string, articleId: string, data: any) => {
    const response = await apiClient.put(`/posts/categories/${categoryId}/articles/${articleId}`, data);
    return response.data;
  },

  // Update post (generic method for all post types)
  updatePost: async (categoryId: string, postId: string, postType: string, data: any) => {
    // Map post types to their API endpoints
    const endpointMap: Record<string, string> = {
      'article': 'articles',
      'gallery': 'galleries',
      'video': 'videos',
      'audio': 'audios',
      'sorted-list': 'sorted-lists',
    };
    
    const endpoint = endpointMap[postType] || 'articles';
    const response = await apiClient.put(`/posts/categories/${categoryId}/${endpoint}/${postId}`, data);
    return response.data;
  },

  // Legacy update method (kept for backward compatibility)
  update: async (id: string | number, data: UpdatePostDto) => {
    const response = await apiClient.put<Post>(`/posts/${id}`, data);
    return response.data;
  },

  // Delete post (generic method for all post types)
  deletePost: async (categoryId: string, postId: string, postType: string) => {
    // Normalize post type (API returns "SortedList" which becomes "sortedlist" when lowercased)
    let normalizedType = postType.toLowerCase();
    if (normalizedType === 'sortedlist') {
      normalizedType = 'sorted-list';
    }
    
    // Map post types to their API endpoints
    const endpointMap: Record<string, string> = {
      'article': 'articles',
      'gallery': 'galleries',
      'video': 'videos',
      'audio': 'audios',
      'sorted-list': 'sorted-lists',
    };
    
    const endpoint = endpointMap[normalizedType] || 'articles';
    const response = await apiClient.delete(`/posts/categories/${categoryId}/${endpoint}/${postId}`);
    return response.data;
  },

  // Legacy delete method (kept for backward compatibility)
  delete: async (id: string | number) => {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },

  // Get posts by category (convenience method)
  getByCategory: async (category: string) => {
    return postsApi.getPosts({ categorySlug: category });
  },
};
