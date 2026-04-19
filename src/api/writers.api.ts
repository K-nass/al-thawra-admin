import { apiClient } from './client';

export interface Writer {
  id: string;
  name: string;
  bio: string | null;
  birthDate: string;
  dateOfDeath: string | null;
  imageUrl: string | null;
}

export interface WritersResponse {
  data: Writer[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetWritersParams {
  page?: number;
  limit?: number;
  SearchPhrase?: string;
}

export interface CreateWriterRequest {
  name: string;
  bio: string | null;
  birthDate: string;
  dateOfDeath: string | null;
  imageUrl: string | null;
}

export interface UpdateWriterRequest extends CreateWriterRequest {
  id: string;
}

export const writersApi = {
  getAll: async (params?: GetWritersParams): Promise<WritersResponse> => {
    const response = await apiClient.get<WritersResponse>('/writers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Writer> => {
    const response = await apiClient.get<Writer>(`/writers/${id}`);
    return response.data;
  },

  create: async (data: CreateWriterRequest): Promise<Writer> => {
    const response = await apiClient.post<Writer>('/writers', data);
    return response.data;
  },

  update: async (id: string, data: CreateWriterRequest): Promise<Writer> => {
    const response = await apiClient.put<Writer>(`/writers/${id}`, { ...data, id });
    return response.data;
  },

  delete: async (id: string): Promise<{ data: string }> => {
    const response = await apiClient.delete<{ data: string }>(`/writers/${id}`);
    return response.data;
  },
};