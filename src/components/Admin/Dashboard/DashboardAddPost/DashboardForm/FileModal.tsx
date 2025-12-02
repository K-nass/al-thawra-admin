import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { apiClient } from "@/api/client";
import type { HandleChangeType } from "./types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { signalRService } from "@/services/signalr.service";

interface UploadResponse {
    uploadId: string;
    fileName: string;
    status: string;
    message: string;
    uploadedAt: string;
    signalRHubUrl: string;
    url?: string; // Sometimes returned directly if immediate
}

interface MediaItem {
    id: string;
    url: string;
    fileName: string;
    type: string;
    sizeInBytes: number;
    mimeType: string;
    uploadedAt: string;
    duration?: string | number;
}

interface MediaResponse {
    items: MediaItem[];
    totalCount: number;
}

export type MediaType = "images" | "additional images" | "files" | "video" | "audio";

interface FileModalProps {
    onClose: () => void;
    header: MediaType;
    handleChange: HandleChangeType;
}

export default function FileModal({ onClose, header, handleChange }: FileModalProps) {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    // Upload State
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

    // Helper function to format duration
    const formatDuration = (duration: string | number | null | undefined): string => {
        if (!duration) return "";

        // If it's a number (seconds), convert to readable format
        if (typeof duration === "number") {
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const seconds = Math.floor(duration % 60);

            if (hours > 0) {
                return `${hours}h ${minutes}m ${seconds}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${seconds}s`;
            } else {
                return `${seconds} seconds`;
            }
        }

        // If it's a string like "00:00:42.0571428", parse it
        if (typeof duration === "string") {
            const parts = duration.split(":");
            if (parts.length === 3) {
                const hours = parseInt(parts[0]);
                const minutes = parseInt(parts[1]);
                const seconds = Math.floor(parseFloat(parts[2]));

                if (hours > 0) {
                    return `${hours}h ${minutes}m ${seconds}s`;
                } else if (minutes > 0) {
                    return `${minutes}m ${seconds}s`;
                } else {
                    return `${seconds} seconds`;
                }
            }
        }

        return String(duration);
    };

    // Determine upload endpoint and media type based on header
    const getUploadEndpoint = () => {
        if (header === "video") return "/media/upload-video";
        if (header === "audio") return "/media/upload-audio";
        return "/media/upload-image";
    };

    const getMediaTypeFilter = () => {
        if (header === "video") return "Video";
        if (header === "audio") return "Audio";
        return "Image";
    };

    // --- Upload Mutation ---
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("File", file);
            const response = await apiClient.post<UploadResponse>(
                getUploadEndpoint(),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return response.data;
        },
    });

    // --- Get Media Query (useQuery is better for GET requests) ---
    const { data: mediaData, isLoading: isLoadingMedia, refetch: refetchMedia } = useQuery<MediaResponse>({
        queryKey: ["media", getMediaTypeFilter()],
        queryFn: async () => {
            const response = await apiClient.get<MediaResponse>(`/media`, {
                params: {
                    Type: getMediaTypeFilter(),
                },
            });
            return response.data;
        },
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
    });

    const mediaList = mediaData?.items ?? [];

    // --- Show Modal Animation ---
    useEffect(() => {
        setTimeout(() => setShowModal(true), 10);

        // Cleanup SignalR on unmount
        return () => {
            signalRService.stopConnection();
        };
    }, []);

    // --- Upload Handler ---
    async function handleFiles(filesList: FileList | null) {
        if (!filesList || filesList.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus("Starting upload...");

        // Ref to track if we've handled completion to avoid double-handling (SignalR vs Polling)
        let isHandled = false;
        const pollingIntervalRef = { current: null as NodeJS.Timeout | null };

        const cleanup = () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };

        const handleSuccess = (url: string, mediaId: string) => {
            if (isHandled) return;
            isHandled = true;
            cleanup();

            setUploadProgress(100);
            setUploadStatus("Upload complete!");

            const fieldName =
                header === "images"
                    ? "imageUrl"
                    : header === "additional images"
                        ? "additionalImageUrls"
                        : header === "video"
                            ? "videoUrl"
                            : header === "audio"
                                ? "audioUrl"
                                : "fileUrls";

            const value = (header === "images" || header === "video" || header === "audio") ? url : [url];

            const payload = {
                target: {
                    name: fieldName,
                    value,
                    type: "text",
                },
            };

            handleChange(payload);
            signalRService.leaveUploadGroup(mediaId);
            void refetchMedia();
            setIsUploading(false);
            setShowModal(false);
            setTimeout(onClose, 180);
        };

        const handleFailure = (error: string, mediaId: string) => {
            if (isHandled) return;
            // Don't mark as handled immediately for retryable errors, but for permanent ones yes.
            // For simplicity, if we get a failure status, we show it.
            setUploadStatus(`Upload failed: ${error}`);
            // If it's a permanent failure, we might want to stop polling.
            if (error.includes("permanently")) {
                isHandled = true;
                cleanup();
                setIsUploading(false);
                signalRService.leaveUploadGroup(mediaId);
            }
        };

        try {
            const file = filesList[0]; // Handle single file for now with SignalR

            // 1. Start upload via API
            const response = await uploadMutation.mutateAsync(file);
            const { uploadId, signalRHubUrl } = response;
            setCurrentUploadId(uploadId);

            // 2. Setup Polling Fallback (Start immediately)
            pollingIntervalRef.current = setInterval(async () => {
                if (isHandled) return;
                try {
                    const statusRes = await apiClient.get(`/media/upload-status/${uploadId}`);
                    const statusData = statusRes.data;

                    if (statusData.status === "Completed" && statusData.url) {
                        handleSuccess(statusData.url, uploadId);
                    } else if (statusData.status === "Failed") {
                        handleFailure("Upload failed permanently.", uploadId);
                    } else if (statusData.progressPercentage) {
                        setUploadProgress(statusData.progressPercentage);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 2000); // Poll every 2 seconds

            // 3. Try to Connect to SignalR (Optional)
            try {
                await signalRService.startConnection(signalRHubUrl);
                await signalRService.joinUploadGroup(uploadId);

                // Listen for events only if connected
                signalRService.onUploadProgress((data) => {
                    if (data.mediaId === uploadId && !isHandled) {
                        setUploadProgress(data.percentage);
                        setUploadStatus(data.message);
                    }
                });

                signalRService. onUploadCompleted((data) => {
                    if (data.mediaId === uploadId) {
                        handleSuccess(data.url, uploadId);
                    }
                });

                signalRService.onUploadFailed((data) => {
                    if (data.mediaId === uploadId) {
                        setUploadStatus(`Upload failed: ${data.error}. Retrying...`);
                    }
                });

                signalRService.onUploadFailedPermanently((data) => {
                    if (data.mediaId === uploadId) {
                        handleFailure("Upload failed permanently.", uploadId);
                    }
                });
            } catch (signalRError) {
                console.warn("SignalR connection failed, relying on polling:", signalRError);
                // We don't fail the upload, we just continue with polling
            }

            setUploadStatus("Processing...");

        } catch (err) {
            console.error(err);
            setUploadStatus("Failed to start upload.");
            setIsUploading(false);
            cleanup();
            alert("Failed to upload file. Please try again.");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
            <div
                className={`bg-white w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg transform transition-all duration-500 ease-out flex flex-col ${showModal ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                    <h2 className="text-base sm:text-lg font-semibold capitalize">{header}</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setShowModal(false);
                            setTimeout(onClose, 180);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        <FontAwesomeIcon icon={faXmark} className="cursor-pointer" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 sm:p-4">
                    <input
                        type="text"
                        placeholder={`Search ${header}...`}
                        className="w-full rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Upload Area */}
                <div className="p-4 sm:p-6 rounded-md text-center mx-2 sm:mx-4 my-2 sm:my-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-2">
                        {header === "video" ? "MP4, WebM, Ogg" : header === "audio" ? "MP3, WAV, OGG, WebM" : "JPG, JPEG, WEBP, PNG, GIF"}
                    </p>

                    {isUploading ? (
                        <div className="w-full max-w-md mx-auto">
                            <div className="flex justify-between text-xs mb-1">
                                <span>{uploadStatus}</span>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-[#605CA8] h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="bg-gray-100 p-4 rounded-full">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 16v-8m0 0l-3 3m3-3l3 3m4 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m14 0a2 2 0 00-2-2H7a2 2 0 00-2 2"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Drag and drop files here or
                            </p>
                            <input
                                type="file"
                                multiple={false} // Restrict to single file for SignalR flow for now
                                accept={
                                    header === "video"
                                        ? "video/mp4,video/webm,video/ogg"
                                        : header === "audio"
                                            ? "audio/mpeg,audio/wav,audio/ogg,audio/webm"
                                            : "image/*"
                                }
                                className="text-center text-sm px-3 py-2 bg-[#605CA8] text-white rounded hover:bg-indigo-700 cursor-pointer"
                                onChange={(e) => void handleFiles(e.target.files)}
                            />
                        </div>
                    )}
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-3 sm:px-6 pb-4 sm:pb-6 overflow-y-auto flex-1 max-h-96">
                    {isLoadingMedia ? (
                        <p className="col-span-2 sm:col-span-3 md:col-span-4 text-center text-gray-500 text-sm sm:text-base">{t('common.loading')}</p>
                    ) : mediaList.length === 0 ? (
                        <p className="col-span-2 sm:col-span-3 md:col-span-4 text-center text-gray-500 text-sm sm:text-base">{t('common.noItems')}</p>
                    ) : (
                        mediaList.map((item) => {
                            const fieldName =
                                header === "images"
                                    ? "imageUrl"
                                    : header === "additional images"
                                        ? "additionalImageUrls"
                                        : header === "video"
                                            ? "videoUrl"
                                            : header === "audio"
                                                ? "audioUrl"
                                                : "fileUrls";

                            const handleSelectMedia = () => {
                                const value = (header === "images" || header === "video" || header === "audio") ? item.url : [item.url];
                                const payload = {
                                    target: {
                                        name: fieldName,
                                        value,
                                        type: "text",
                                        // Include details if available
                                        ...(header === "audio" || header === "video" ? {
                                            fileName: item.fileName,
                                            sizeInBytes: item.sizeInBytes,
                                            mimeType: item.mimeType,
                                            duration: item.duration,
                                        } : {}),
                                    },
                                };
                                handleChange(payload);
                                setShowModal(false);
                                setTimeout(onClose, 180);
                            };

                            // For images, show thumbnail
                            if (header === "images" || header === "additional images") {
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={handleSelectMedia}
                                        className="relative cursor-pointer rounded overflow-hidden group"
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.fileName}
                                            className="w-full h-32 object-cover rounded-md hover:opacity-80 transition"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition text-xs font-semibold">Select</span>
                                        </div>
                                    </button>
                                );
                            }

                            // For video, audio, and files - show file info with all details
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={handleSelectMedia}
                                    className="relative cursor-pointer rounded overflow-hidden group bg-gray-100 p-3 flex flex-col items-start justify-start hover:bg-gray-200 transition h-auto"
                                >
                                    <div className="flex items-center gap-2 mb-2 w-full">
                                        <div className="text-2xl">
                                            {header === "video" ? "🎬" : header === "audio" ? "🎵" : "📄"}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700 truncate flex-1">
                                            {item.fileName}
                                        </p>
                                    </div>
                                    <div className="w-full space-y-1 text-xs text-gray-600">
                                        {item.sizeInBytes && (
                                            <p className="truncate">
                                                <span className="font-medium">Size:</span> {(item.sizeInBytes / 1024).toFixed(2)} KB
                                            </p>
                                        )}
                                        {item.mimeType && (
                                            <p className="truncate">
                                                <span className="font-medium">Type:</span> {item.mimeType}
                                            </p>
                                        )}
                                        {item.duration && (
                                            <p className="truncate">
                                                <span className="font-medium">Duration:</span> {formatDuration(item.duration)}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-3 sm:p-4 border-t">
                    <button
                        type="button"
                        onClick={() => {
                            setShowModal(false);
                            setTimeout(onClose, 180);
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-200 rounded hover:bg-gray-300"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
