import axios from "axios";
import { apiClient } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Request body for POST /api/v1/media/request-upload-signature */
export interface UploadSignatureRequest {
  mediaType: string;
  fileType: string;
  fileSize: number;
}

/** Response from POST /api/v1/media/request-upload-signature */
export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
  expiresAt: string;
  transformation: string;
}

/** Request body for POST /api/v1/media/confirm-cloudinary-upload */
export interface ConfirmUploadRequest {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  fileSize: number;
  mimeType: string;
}

/** Response from POST /api/v1/media/confirm-cloudinary-upload */
export interface ConfirmUploadResponse {
  url: string | null;
  fileName: string | null;
  sizeInBytes: number | null;
  mimeType: string | null;
  duration: string | null;
}

/** Cloudinary's upload response (relevant fields only) */
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  format: string;
  original_filename: string;
  width?: number;
  height?: number;
  duration?: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export const mediaApi = {
  /**
   * Step 1: Request a signed upload token from the backend.
   * The backend generates the signature, folder, publicId, etc.
   */
  requestUploadSignature: async (
    request: UploadSignatureRequest
  ): Promise<UploadSignatureResponse> => {
    const response = await apiClient.post<UploadSignatureResponse>(
      "/media/request-upload-signature",
      request
    );
    return response.data;
  },

  /**
   * Step 2: Upload the file directly to Cloudinary using the signed params.
   * Uses a raw axios instance to avoid the apiClient's baseURL and auth interceptors.
   */
  uploadToCloudinary: async (
    file: File,
    signatureData: UploadSignatureResponse
  ): Promise<CloudinaryUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);
    formData.append("public_id", signatureData.publicId);
    
    // The backend signature calculates this transformation parameter automatically.
    // It must be included here so Cloudinary evaluates identical string-to-sign payloads!
    formData.append("transformation", signatureData.transformation || "q_auto,f_auto");

    // Use a plain axios call — the uploadUrl points to Cloudinary, not our backend
    const response = await axios.post<CloudinaryUploadResult>(
      signatureData.uploadUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        // No timeout — large files may take a while
        timeout: 0,
      }
    );

    return response.data;
  },

  /**
   * Step 3: Confirm the successful upload with our backend.
   * The backend creates the Media record in the database.
   */
  confirmUpload: async (
    request: ConfirmUploadRequest
  ): Promise<ConfirmUploadResponse> => {
    const response = await apiClient.post<ConfirmUploadResponse>(
      "/media/confirm-cloudinary-upload",
      request
    );
    return response.data;
  },
};
