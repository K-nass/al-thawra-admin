import { apiClient } from "./client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  language: string;
  description: string;
  colorHex: string;
  order: number;
  isActive: boolean;
  showOnMenu: boolean;
  showOnHomepage: boolean;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  parentCategorySlug: string | null;
  postsCount: number;
  subCategoriesCount: number;
  subCategories: Category[];
}

export interface GetCategoriesParams {
  Language?: string;
  IsActive?: boolean;
  WithSub?: boolean;
  SearchPhrase?: string;
  SortBy?: string;
}

export const categoriesApi = {
  getAll: async (params?: GetCategoriesParams) => {
    const response = await apiClient.get<Category[]>("/categories", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>) => {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>) => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
