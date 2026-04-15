import { apiClient } from "./client";

export interface Magazine {
  issueNumber: string;
  pdfUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface GetMagazinesParams {
  from?: string; // RFC 3339 date-time format
  to?: string; // RFC 3339 date-time format
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string;
}

export interface MagazinesResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: Magazine[];
}

export interface CreateMagazineRequest {
  issueNumber: string;
  pdfUrl: string;
  thumbnailUrl?: string | null;
}

export interface UpdateMagazineRequest {
  issueNumber: string;
  pdfUrl: string;
  thumbnailUrl?: string | null;
}

export const magazinesApi = {
  /** GET /magazines — paginated list with optional filters */
  getAll: async (params?: GetMagazinesParams) => {
    const queryParams = new URLSearchParams();

    if (params?.from) queryParams.append("From", params.from);
    if (params?.to) queryParams.append("To", params.to);
    if (params?.pageNumber) queryParams.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize) queryParams.append("PageSize", String(params.pageSize));
    if (params?.searchPhrase) queryParams.append("SearchPhrase", params.searchPhrase);

    const response = await apiClient.get<MagazinesResponse>(
      `/magazines?${queryParams.toString()}`
    );
    return response.data;
  },

  /** GET /magazines/by-date — single magazine by date */
  getByDate: async (date: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append("Date", date);

    const response = await apiClient.get<Magazine>(`/magazines/by-date?${queryParams.toString()}`);
    return response.data;
  },

  /** GET /magazines/{issueNumber} — single magazine by issue number */
  getByIssueNumber: async (issueNumber: string) => {
    const response = await apiClient.get<Magazine>(`/magazines/${issueNumber}`);
    return response.data;
  },

  /** POST /magazines — create a new magazine issue (JSON body) */
  create: async (data: CreateMagazineRequest) => {
    const response = await apiClient.post<Magazine>("/magazines", {
      issueNumber: data.issueNumber,
      pdfUrl: data.pdfUrl,
      thumbnailUrl: data.thumbnailUrl ?? null,
    });
    return response.data;
  },

  /** PUT /magazines — update an existing magazine issue (JSON body) */
  update: async (data: UpdateMagazineRequest) => {
    const response = await apiClient.put<Magazine>("/magazines", {
      issueNumber: data.issueNumber,
      pdfUrl: data.pdfUrl,
      thumbnailUrl: data.thumbnailUrl ?? null,
    });
    return response.data;
  },

  /** DELETE /magazines/{issueNumber} */
  delete: async (issueNumber: string) => {
    const response = await apiClient.delete(`/magazines/${issueNumber}`);
    return response.data;
  },

  // Fetch PDF through backend API to avoid CORS issues
  getPdfBlob: async (issueNumber: string): Promise<Blob> => {
    const response = await apiClient.get(`/magazines/${issueNumber}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get proxy URL for PDF viewing (uses backend API endpoint)
  getPdfProxyUrl: (issueNumber: string): string => {
    const baseURL = apiClient.defaults.baseURL || '';
    return `${baseURL}/magazines/${issueNumber}/pdf`;
  },
};
