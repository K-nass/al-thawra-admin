import { apiClient } from "./client";

export interface Page {
  id: string;
  title: string;
  slug: string | null;
  language: "English" | "Arabic";
  location: "TopMenu" | "MainMenu" | "Footer" | "DontAddToMenu";
  content: string;
  description: string;
  keywords: string[];
  menuOrder: number;
  parentMenuLinkId: string | null;
  parentPageId: string | null;
  showBreadcrumb: boolean;
  showOnlyToRegisteredUsers: boolean;
  showRightColumn: boolean;
  showTitle: boolean;
  visibility: boolean;
  createdAt: string;
  updatedAt: string;
  parentName: string | null;
  parentType: string | null;
}

export interface CreatePageRequest {
  content: string;
  description: string;
  keywords: string[];
  language: "English" | "Arabic";
  location: "TopMenu" | "MainMenu" | "Footer" | "DontAddToMenu";
  menuOrder: number;
  parentMenuLinkId?: string | null;
  parentPageId?: string | null;
  showBreadcrumb: boolean;
  showOnlyToRegisteredUsers: boolean;
  showRightColumn: boolean;
  showTitle: boolean;
  slug?: string | null;
  title: string;
}

export interface UpdatePageRequest extends CreatePageRequest {
  id: string;
}

export interface GetPagesParams {
  language?: string | null;
  location?: string | null;
  visibility?: boolean;
  parentMenuLinkId?: string | null;
  parentPageId?: string | null;
  sortBy?: string | null;
  sortDirection?: string | null;
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string | null;
}

export interface PagesResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: Page[];
}

export const pagesApi = {
  getAll: async (params?: GetPagesParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.language) queryParams.append("Language", params.language);
    if (params?.location) queryParams.append("Location", params.location);
    if (params?.visibility !== undefined) queryParams.append("Visibility", String(params.visibility));
    if (params?.parentMenuLinkId) queryParams.append("ParentMenuLinkId", params.parentMenuLinkId);
    if (params?.parentPageId) queryParams.append("ParentPageId", params.parentPageId);
    if (params?.sortBy) queryParams.append("SortBy", params.sortBy);
    if (params?.sortDirection) queryParams.append("SortDirection", params.sortDirection);
    if (params?.pageNumber) queryParams.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize) queryParams.append("PageSize", String(params.pageSize));
    if (params?.searchPhrase) queryParams.append("SearchPhrase", params.searchPhrase);

    const response = await apiClient.get<PagesResponse>(`/pages?${queryParams.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Page>(`/pages/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string, language?: "English" | "Arabic") => {
    const queryParams = new URLSearchParams();
    if (language) queryParams.append("language", language);
    
    const response = await apiClient.get<Page>(`/pages/slug/${slug}?${queryParams.toString()}`);
    return response.data;
  },

  create: async (data: CreatePageRequest) => {
    const response = await apiClient.post<Page>("/pages", data);
    return response.data;
  },

  update: async (id: string, data: CreatePageRequest) => {
    const response = await apiClient.put<Page>(`/pages/${id}`, {
      ...data,
      id, // Include id in the request body as required by the API
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/pages/${id}`);
    return response.data;
  },
};
