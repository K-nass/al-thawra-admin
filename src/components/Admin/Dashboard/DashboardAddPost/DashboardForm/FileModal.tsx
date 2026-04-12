import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCloudUploadAlt, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";

export type MediaType = "images" | "additional images" | "files" | "video" | "audio";

interface FileModalProps {
  onClose: () => void;
  header: MediaType;
  handleChange: HandleChangeType;
  forcedMediaType?: string;
}

export default function FileModal({ onClose, header, handleChange, forcedMediaType }: FileModalProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    status,
    message,
    progress,
    error,
    result,
    upload,
    reset,
    isUploading,
  } = useCloudinaryUpload();

  // Animate modal in
  useEffect(() => {
    setTimeout(() => setShowModal(true), 10);
    return () => {
      reset();
    };
  }, [reset]);

  // When upload succeeds, pass the URL back to the parent form
  useEffect(() => {
    if (status === "success" && result?.url) {
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

      const value =
        header === "images" || header === "video" || header === "audio"
          ? result.url
          : [result.url];

      const payload = {
        target: {
          name: fieldName,
          value,
          type: "text",
        },
      };

      handleChange(payload);

      // Auto-close after a short delay so user sees the success state
      setTimeout(() => {
        setShowModal(false);
        setTimeout(onClose, 180);
      }, 800);
    }
  }, [status, result, header, handleChange, onClose]);

  // Determine accepted file types based on the media type
  const getAcceptedTypes = (): string => {
    switch (header) {
      case "video":
        return "video/mp4,video/webm,video/ogg,video/quicktime";
      case "audio":
        return "audio/mpeg,audio/wav,audio/ogg,audio/webm";
      case "files":
        return "application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar";
      default:
        return "image/jpeg,image/jpg,image/png,image/gif,image/webp";
    }
  };

  const getFormatLabel = (): string => {
    switch (header) {
      case "video":
        return "MP4, WebM, Ogg";
      case "audio":
        return "MP3, WAV, OGG, WebM";
      case "files":
        return "PDF, DOC, XLS, PPT, TXT, ZIP";
      default:
        return "JPG, JPEG, WEBP, PNG, GIF";
    }
  };

  async function handleFileSelect(filesList: FileList | null) {
    if (!filesList || filesList.length === 0) return;
    const file = filesList[0];
    await upload(file, forcedMediaType);
  }

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 180);
  };

  // Render the progress/status indicator
  const renderUploadStatus = () => {
    if (status === "idle") return null;

    return (
      <div className="w-full max-w-md mx-auto space-y-3">
        {/* Progress bar */}
        {(status === "uploading" || status === "requesting-signature" || status === "confirming") && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{message}</span>
              {status === "uploading" && <span className="text-slate-500">{Math.round(progress)}%</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#605CA8] h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: status === "requesting-signature"
                    ? "15%"
                    : status === "confirming"
                      ? "95%"
                      : `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>{message}</span>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                reset();
                fileInputRef.current?.click();
              }}
              className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div
        className={`bg-white w-full max-w-lg max-h-[90vh] rounded-lg shadow-lg transform transition-all duration-500 ease-out flex flex-col ${
          showModal ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold capitalize">{header}</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 text-xl disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} className="cursor-pointer" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-4 sm:p-6">
          <div className="rounded-md text-center mx-auto">
            <p className="text-sm text-gray-500 mb-4">{getFormatLabel()}</p>

            {isUploading || status === "success" || status === "error" ? (
              renderUploadStatus()
            ) : (
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:border-[#605CA8]/50 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-gray-100 p-4 rounded-full">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="w-8 h-8 text-gray-400"
                  />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    Drag and drop files here or
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm px-4 py-2 bg-[#605CA8] text-white rounded hover:bg-indigo-700 transition"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              className="hidden"
              onChange={(e) => void handleFileSelect(e.target.files)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 sm:p-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
