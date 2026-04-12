import { useState, useCallback, useRef } from "react";
import {
  mediaApi,
  type ConfirmUploadResponse,
  type CloudinaryUploadResult,
  type UploadSignatureResponse,
} from "@/api/media.api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UploadStatus =
  | "idle"
  | "requesting-signature"
  | "uploading"
  | "confirming"
  | "success"
  | "error";

export interface CloudinaryUploadState {
  /** Current step in the upload flow */
  status: UploadStatus;
  /** Human-readable status message */
  message: string;
  /** Upload progress percentage (0–100), only meaningful during "uploading" */
  progress: number;
  /** Error message if status is "error" */
  error: string | null;
  /** Final confirmed media record from the backend */
  result: ConfirmUploadResponse | null;
}

export interface UseCloudinaryUploadReturn extends CloudinaryUploadState {
  /** Trigger the full 3-step upload flow for a given file */
  upload: (file: File, forcedMediaType?: string) => Promise<ConfirmUploadResponse | null>;
  /** Reset the hook to idle state */
  reset: () => void;
  /** Whether an upload is currently in progress */
  isUploading: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive the mediaType value from a File's MIME type.
 * The backend expects "image" or "video".
 */
function deriveMediaType(file: File): string {
  if (file.type.startsWith("image/")) return "Image";
  if (file.type.startsWith("video/")) return "Video";
  if (file.type.startsWith("audio/")) return "Audio";
  if (file.type === "application/pdf") return "Magazine"; 
  // Fallback: let the backend validate and reject if unsupported
  return "Image";
}

// ─── Initial State ───────────────────────────────────────────────────────────

const INITIAL_STATE: CloudinaryUploadState = {
  status: "idle",
  message: "",
  progress: 0,
  error: null,
  result: null,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Reusable hook for the 3-step Cloudinary signed upload flow:
 *
 * 1. Request an upload signature from our backend
 * 2. Upload the file directly to Cloudinary
 * 3. Confirm the upload with our backend to create the Media record
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [state, setState] = useState<CloudinaryUploadState>(INITIAL_STATE);

  // Abort controller ref so we can cancel in-flight requests if needed
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    // Abort any in-flight upload
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState(INITIAL_STATE);
  }, []);

  const upload = useCallback(
    async (file: File, forcedMediaType?: string): Promise<ConfirmUploadResponse | null> => {
      // Reset before starting
      abortRef.current = new AbortController();

      try {
        // ── Step 1: Request Upload Signature ──────────────────────────────
        setState({
          status: "requesting-signature",
          message: "Requesting upload permission…",
          progress: 0,
          error: null,
          result: null,
        });

        const signatureData: UploadSignatureResponse =
          await mediaApi.requestUploadSignature({
            mediaType: forcedMediaType || deriveMediaType(file),
            fileType: file.type,
            fileSize: file.size,
          });

        // ── Step 2: Upload to Cloudinary ──────────────────────────────────
        setState((prev) => ({
          ...prev,
          status: "uploading",
          message: "Uploading file…",
          progress: 0,
        }));

        const cloudinaryResult: CloudinaryUploadResult =
          await mediaApi.uploadToCloudinary(file, signatureData);

        setState((prev) => ({
          ...prev,
          progress: 100,
          message: "Upload complete, confirming…",
        }));

        // ── Step 3: Confirm Upload with Backend ───────────────────────────
        setState((prev) => ({
          ...prev,
          status: "confirming",
          message: "Saving media record…",
        }));

        const confirmed = await mediaApi.confirmUpload({
          publicId: cloudinaryResult.public_id,
          secureUrl: cloudinaryResult.secure_url,
          resourceType: cloudinaryResult.resource_type,
          fileSize: cloudinaryResult.bytes,
          mimeType: file.type, // Use the original file's MIME type
        });

        setState({
          status: "success",
          message: "Upload successful!",
          progress: 100,
          error: null,
          result: confirmed,
        });

        return confirmed;
      } catch (err: any) {
        // Don't treat abort as an error
        if (err?.name === "AbortError" || err?.name === "CanceledError") {
          setState(INITIAL_STATE);
          return null;
        }

        // Extract the most useful error message
        const errorMessage =
          err?.response?.data?.title ||
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Upload failed. Please try again.";

        setState({
          status: "error",
          message: errorMessage,
          progress: 0,
          error: errorMessage,
          result: null,
        });

        return null;
      }
    },
    []
  );

  return {
    ...state,
    upload,
    reset,
    isUploading:
      state.status === "requesting-signature" ||
      state.status === "uploading" ||
      state.status === "confirming",
  };
}
