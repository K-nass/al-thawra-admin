import { useState, useRef, useEffect } from "react";
import { magazinesApi } from "@/api/magazines.api";
import { signalRService } from "@/services/signalr.service";

interface UseMagazineUploadResult {
  uploadProgress: number;
  uploadStatus: string;
  isUploading: boolean;
  error: string | null;
  uploadPdf: (file: File, issueNumber: string) => Promise<void>;
  resetUpload: () => void;
}

export const useMagazineUpload = (onSuccess?: () => void): UseMagazineUploadResult => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track state in callbacks
  const uploadIdRef = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);

  // Cleanup SignalR on unmount
  useEffect(() => {
    return () => {
      if (uploadIdRef.current) {
        signalRService.leaveUploadGroup(uploadIdRef.current);
      }
    };
  }, []);

  const resetUpload = () => {
    setUploadProgress(0);
    setUploadStatus("");
    setIsUploading(false);
    setError(null);
    uploadIdRef.current = null;
    fileRef.current = null;
  };

  const handleSuccess = async (issueNumber: string) => {
    try {
      if (!fileRef.current) {
        throw new Error("Original file not available");
      }
      
      console.log(`Creating magazine issue. IssueNumber: ${issueNumber}, File: ${fileRef.current.name}`);
      setUploadStatus("Creating magazine issue...");
      const result = await magazinesApi.create({ issueNumber, pdfFile: fileRef.current });
      console.log('Magazine created successfully:', result);
      
      setUploadStatus("Completed");
      setUploadProgress(100);
      setIsUploading(false);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create magazine:", err);
      setError("Failed to create magazine record.");
      setIsUploading(false);
    }
  };

  const pollUploadStatus = async (uploadId: string, issueNumber: string) => {
    const maxAttempts = 60; // Poll for up to 60 attempts (2 minutes at 2s intervals)
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        console.log(`Polling upload status (attempt ${attempts}/${maxAttempts})...`);
        
        const status = await magazinesApi.getUploadStatus(uploadId);
        console.log('Upload status:', status);
        
        if (status.status === "Completed" && status.url) {
          console.log(`Upload completed! URL: ${status.url}`);
          await handleSuccess(issueNumber);
          return; // Stop polling
        } else if (status.status === "Failed") {
          console.error('Upload failed:', status.message);
          setError(status.message || "Upload failed on server");
          setIsUploading(false);
          return; // Stop polling
        } else {
          // Update progress if available
          if (status.progressPercentage !== undefined) {
            setUploadProgress(status.progressPercentage);
            setUploadStatus(status.message || `Processing... ${status.progressPercentage}%`);
          }
          
          // Continue polling if not max attempts
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000); // Poll every 2 seconds
          } else {
            console.error('Polling timeout: Maximum attempts reached');
            setError("Upload took too long. Please refresh and check.");
            setIsUploading(false);
          }
        }
      } catch (err) {
        console.error('Error polling upload status:', err);
        // Retry on error unless max attempts reached
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError("Failed to check upload status");
          setIsUploading(false);
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 1000);
  };

  const uploadPdf = async (file: File, issueNumber: string) => {
    try {
      resetUpload();
      setIsUploading(true);
      setUploadStatus("Starting upload...");

      // 1. Initiate Upload
      const { uploadId, signalRHubUrl } = await magazinesApi.uploadPdf(file, (percent) => {
        setUploadProgress(percent);
        setUploadStatus(`Uploading file to server... ${percent}%`);
      });
      uploadIdRef.current = uploadId;
      fileRef.current = file; // Store file reference for later use
      console.log(`Upload initiated. UploadId: ${uploadId}, SignalR Hub: ${signalRHubUrl}`);
      console.log(`Issue Number: ${issueNumber}`);
      console.log(`File: ${file.name} (${file.size} bytes)`);

      // 2. Connect to SignalR
      try {
        await signalRService.startConnection(signalRHubUrl);
        await signalRService.joinUploadGroup(uploadId);

        // Setup SignalR listeners
        signalRService.onUploadProgress((data) => {
          if (data.mediaId === uploadId) {
            setUploadProgress(data.percentage);
            setUploadStatus(data.message);
          }
        });

        signalRService.onUploadCompleted((data) => {
          console.log('SignalR UploadCompleted event received:', data);
          if (data.mediaId === uploadId) {
            console.log(`Upload completed for ${uploadId}. URL: ${data.url}`);
            handleSuccess(issueNumber);
            signalRService.leaveUploadGroup(uploadId);
          } else {
            console.log(`Received completion for different upload. Expected: ${uploadId}, Got: ${data.mediaId}`);
          }
        });

        signalRService.onUploadFailed((data) => {
          if (data.mediaId === uploadId) {
            setError(`Upload failed: ${data.error}`);
            setIsUploading(false);
          }
        });
        
        signalRService.onUploadFailedPermanently((data) => {
            if (data.mediaId === uploadId) {
              setError("Upload failed permanently.");
              setIsUploading(false);
              signalRService.leaveUploadGroup(uploadId);
            }
        });

      } catch (signalRError) {
        console.error("SignalR connection failed:", signalRError);
        console.log("Falling back to polling upload status...");
        // Fallback to polling if SignalR fails
        pollUploadStatus(uploadId, issueNumber);
      }

      // Also start polling as a backup even if SignalR connected
      // In case SignalR events don't fire
      console.log("Starting backup polling for upload status...");
      pollUploadStatus(uploadId, issueNumber);

    } catch (err) {
      console.error("Upload initialization failed:", err);
      setError("Failed to start upload.");
      setIsUploading(false);
    }
  };

  return {
    uploadProgress,
    uploadStatus,
    isUploading,
    error,
    uploadPdf,
    resetUpload
  };
};
