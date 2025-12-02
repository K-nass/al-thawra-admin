import { apiClient } from "./client";

export interface Magazine {
  issueNumber: string;
  pdfUrl: string;
  thumbnailUrl: string;
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

export const magazinesApi = {
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

  getByDate: async (date: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append("Date", date);

    const response = await apiClient.get<Magazine>(`/magazines/by-date?${queryParams.toString()}`);
    return response.data;
  },

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

  // Upload PDF file
  uploadPdf: async (file: File, onUploadProgress?: (progressPercent: number) => void) => {
    const formData = new FormData();
    formData.append("File", file);
    
    const response = await apiClient.post<{ uploadId: string; signalRHubUrl: string }>(
      "/media/upload-file", 
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, // Disable timeout for uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress?.(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },

  // Get upload status
  getUploadStatus: async (uploadId: string) => {
    const response = await apiClient.get<{ 
      status: string; 
      progressPercentage: number; 
      url?: string;
      message?: string;
    }>(`/media/upload-status/${uploadId}`);
    return response.data;
  },

  // Create new magazine issue
  create: async (data: { issueNumber: string; pdfFile: File }) => {
    console.log('magazinesApi.create called with:', data);
    
    // Validate input
    if (!data.issueNumber || !data.pdfFile) {
      const error = `Invalid data for magazine creation. IssueNumber: ${data.issueNumber}, PdfFile: ${data.pdfFile}`;
      console.error(error);
      throw new Error(error);
    }
    
    const formData = new FormData();
    formData.append("IssueNumber", data.issueNumber);
    formData.append("Pdf", data.pdfFile); // Send the actual file

    console.log('Sending POST to /magazines with FormData:', {
      IssueNumber: data.issueNumber,
      Pdf: `File: ${data.pdfFile.name} (${data.pdfFile.size} bytes)`
    });

    const response = await apiClient.post("/magazines", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log('Magazine creation response:', response.data);
    return response.data;
  },
};
