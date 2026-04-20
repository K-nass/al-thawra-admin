import { apiClient } from './client';

export interface Audio {
  id: string;
  title: string;
  slug: string;
  content: string;
  audioUrl: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  authorId: string;
  authorName: string | null;
  authorImageUrl: string | null;
  categoryId: string;
  categoryName: string | null;
  categorySlug: string | null;
  language: string;
  metaDescription: string | null;
  metaKeywords: string | null;
  addToBreaking: boolean;
  addToFeatured: boolean;
  addToSlider: boolean;
  addToRecommended: boolean;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudioFormData {
  categoryId: string;
  language: "English" | "Arabic";
  title: string;
  slug?: string;
  content: string;
  audioUrl: string;
  imageUrl?: string | null;
  authorId?: string;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  addToBreaking?: boolean;
  addToFeatured?: boolean;
  addToSlider?: boolean;
  addToRecommended?: boolean;
  status?: "Draft" | "Scheduled" | "Published";
  scheduledAt?: string | null;
  visibility?: boolean;
  showOnlyToRegisteredUsers?: boolean;
  tagIds?: string[];
}

export interface GetAudiosParams {
  categorySlug?: string;
  authorName?: string;
  hasAuthor?: boolean;
  status?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isSlider?: boolean;
  isRecommended?: boolean;
  language?: string;
  from?: string;
  to?: string;
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string;
}

export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: T[];
}

export const audiosApi = {
  getAudios: async (categoryId: string, params: GetAudiosParams = {}) => {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params.status) queryParams.Status = params.status;
    if (params.language) queryParams.Language = params.language;
    if (params.from) queryParams.From = params.from;
    if (params.to) queryParams.To = params.to;
    if (params.searchPhrase) queryParams.SearchPhrase = params.searchPhrase;

    if (params.isFeatured === true) queryParams.IsFeatured = true;
    if (params.isBreaking === true) queryParams.IsBreaking = true;
    if (params.isSlider === true) queryParams.IsSlider = true;
    if (params.isRecommended === true) queryParams.IsRecommended = true;

    queryParams.PageNumber = params.pageNumber ?? 1;
    queryParams.PageSize = params.pageSize ?? 15;

    const response = await apiClient.get<PaginatedResponse<Audio>>(`/posts/categories/${categoryId}/audios`, {
      params: queryParams,
    });
    return response.data;
  },

  getAudioById: async (categoryId: string, audioId: string) => {
    const response = await apiClient.get<Audio>(`/posts/categories/${categoryId}/audios/${audioId}`);
    return response.data;
  },

  getAudioBySlug: async (categorySlug: string, audioSlug: string) => {
    const response = await apiClient.get<Audio>(`/posts/categories/${categorySlug}/audios/${audioSlug}`);
    return response.data;
  },

  create: async (categoryId: string, data: AudioFormData) => {
    const response = await apiClient.post<Audio>(`/posts/categories/${categoryId}/audios`, data);
    return response.data;
  },

  update: async (categoryId: string, audioId: string, data: Partial<AudioFormData>) => {
    const response = await apiClient.put<Audio>(`/posts/categories/${categoryId}/audios/${audioId}`, data);
    return response.data;
  },

  delete: async (categoryId: string, audioId: string) => {
    const response = await apiClient.delete(`/posts/categories/${categoryId}/audios/${audioId}`);
    return response.data;
  },
};