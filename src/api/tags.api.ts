import { apiClient } from "./client";
import type { 
  Tag, 
  TagPaginationResponse, 
  GetTagsParams, 
  CreateTagsRequest, 
  UpdateTagRequest 
} from "@/types/tag.types";

export const tagsApi = {
  /**
   * Get a paginated list of tags.
   */
  getAll: async (params?: GetTagsParams): Promise<TagPaginationResponse> => {
    const response = await apiClient.get<TagPaginationResponse>("/tags", { params });
    return response.data;
  },

  /**
   * Get a single tag by ID.
   */
  getById: async (id: string): Promise<Tag> => {
    const response = await apiClient.get<Tag>(`/tags/${id}`);
    return response.data;
  },

  /**
   * Create multiple tags.
   */
  create: async (data: CreateTagsRequest): Promise<Tag[]> => {
    const response = await apiClient.post<Tag[]>("/tags", data);
    return response.data;
  },

  /**
   * Update an existing tag.
   */
  update: async (id: string, data: UpdateTagRequest): Promise<void> => {
    await apiClient.put(`/tags/${id}`, data);
  },

  /**
   * Delete a tag.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tags/${id}`);
  },
};
