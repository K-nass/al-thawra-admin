import { useState } from "react";
import { useTranslation } from "react-i18next";
import FileModal from "./FileModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPlay } from "@fortawesome/free-solid-svg-icons";

export type MediaType = "video" | "audio";

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  type: string;
  sizeInBytes: number;
  mimeType: string;
  uploadedAt: string | null;
  altText: string | null;
  description: string | null;
  duration: number | null;
}

interface MediaUploadComponentProps {
  mediaType: MediaType;
  onMediaSelect: (media: MediaItem) => void;
}

export default function MediaUploadComponent({
  mediaType,
  onMediaSelect,
}: MediaUploadComponentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [showFileModal, setShowFileModal] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem | null>(null);

  // Helper function to format duration
  const formatDuration = (duration: string | number | null): string => {
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

  const mediaLabel =
    mediaType === "video"
      ? t("formLabels.videoEmbedCode")
      : t("formLabels.audioEmbedCode") || "Audio Embed Code";

  const uploadLabel =
    mediaType === "video"
      ? t("formLabels.uploadVideo")
      : t("formLabels.uploadAudio") || "Upload Audio";

  const selectFileLabel =
    mediaType === "video"
      ? t("imageUpload.selectFile")
      : t("imageUpload.selectFile");

  const acceptedFormats =
    mediaType === "video" ? "MP4, WebM, Ogg" : "MP3, WAV, OGG, WebM";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Required indicator */}
      <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-800">
          {mediaType === "video" ? t("formLabels.videoUpload") || "Video Upload" : t("formLabels.audioUpload") || "Audio Upload"}
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {mediaType === "video" 
            ? "Please provide a video URL, upload a video file, or paste embed code" 
            : "Please provide an audio URL or upload an audio file"}
        </p>
      </div>
      {/* Tabs Header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <nav className="flex" aria-label="Tabs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("url");
            }}
            className={`flex-1 px-4 sm:px-6 py-3 text-center font-medium text-sm sm:text-base transition-all ${
              activeTab === "url"
                ? "border-b-2 border-primary text-primary bg-white"
                : "border-b-2 border-transparent text-slate-600 hover:text-primary hover:bg-slate-100"
            }`}
          >
            {t("formLabels.getVideoFromURL")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("upload");
            }}
            className={`flex-1 px-4 sm:px-6 py-3 text-center font-medium text-sm sm:text-base transition-all ${
              activeTab === "upload"
                ? "border-b-2 border-primary text-primary bg-white"
                : "border-b-2 border-transparent text-slate-600 hover:text-primary hover:bg-slate-100"
            }`}
          >
            {uploadLabel}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Get from URL Tab */}
        {activeTab === "url" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Media URL Field */}
            <div className="space-y-2">
              <label
                htmlFor={`${mediaType}-url`}
                className="block text-sm font-semibold text-slate-800"
              >
                {t("formLabels.videoURL")}
                <span className="text-xs font-normal text-slate-500 ml-2">
                  {mediaType === "video"
                    ? t("formLabels.videoURLSources")
                    : "(Streaming URL)"}
                </span>
              </label>
              <input
                id={`${mediaType}-url`}
                name={`${mediaType}-url`}
                type="url"
                placeholder={t("formLabels.enterVideoURL")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Media Embed Field */}
            <div className="space-y-2">
              <label
                htmlFor={`${mediaType}-embed-url`}
                className="block text-sm font-semibold text-slate-800"
              >
                {mediaLabel}
              </label>
              <textarea
                id={`${mediaType}-embed-url`}
                name={`${mediaType}-embed-url`}
                placeholder={t("formLabels.pasteVideoEmbedCode")}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Upload Area - Clickable */}
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFileModal(true);
              }}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer"
            >
              <div className="space-y-4">
                <div className="text-4xl text-slate-400">
                  <FontAwesomeIcon icon={mediaType === "video" ? faVideo : faPlay} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {uploadLabel}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {acceptedFormats}
                  </p>
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="inline-block px-6 py-2 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary/90 cursor-pointer transition"
                >
                  {selectFileLabel}
                </button>
              </div>
            </div>

            {/* Uploaded Media Details */}
            {uploadedMedia && uploadedMedia.url && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-3">Uploaded {mediaType === "video" ? "Video" : "Audio"} Details</h4>
                <div className="space-y-2 text-sm text-green-700">
                  {uploadedMedia.fileName && (
                    <div className="flex">
                      <span className="font-medium w-24">File Name:</span>
                      <span className="flex-1 truncate">{uploadedMedia.fileName}</span>
                    </div>
                  )}
                  {uploadedMedia.sizeInBytes > 0 && (
                    <div className="flex">
                      <span className="font-medium w-24">Size:</span>
                      <span>{(uploadedMedia.sizeInBytes / 1024).toFixed(2)} KB ({uploadedMedia.sizeInBytes.toLocaleString()} bytes)</span>
                    </div>
                  )}
                  {uploadedMedia.mimeType && (
                    <div className="flex">
                      <span className="font-medium w-24">Type:</span>
                      <span>{uploadedMedia.mimeType}</span>
                    </div>
                  )}
                  {uploadedMedia.duration && (
                    <div className="flex">
                      <span className="font-medium w-24">Duration:</span>
                      <span>{formatDuration(uploadedMedia.duration)}</span>
                    </div>
                  )}
                  {uploadedMedia.url && (
                    <div className="flex">
                      <span className="font-medium w-24">URL:</span>
                      <a href={uploadedMedia.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-blue-600 hover:underline">
                        {uploadedMedia.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Embed Field for Upload */}
            <div className="space-y-2">
              <label
                htmlFor={`${mediaType}-embed-upload`}
                className="block text-sm font-semibold text-slate-800"
              >
                {mediaLabel}
              </label>
              <textarea
                id={`${mediaType}-embed-upload`}
                name={`${mediaType}-embed-upload`}
                placeholder={t("formLabels.pasteVideoEmbedCode")}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>
          </div>
        )}

      </div>

      {/* FileModal for Upload */}
      {showFileModal && (
        <FileModal
          header={mediaType}
          onClose={() => setShowFileModal(false)}
          handleChange={(e: any) => {
            // Handle the uploaded media URL
            if (e.target.name === "videoUrl" || e.target.name === "audioUrl") {
              const mediaItem = {
                id: "",
                url: e.target.value,
                fileName: e.target.fileName || "",
                type: mediaType,
                sizeInBytes: e.target.sizeInBytes || 0,
                mimeType: e.target.mimeType || "",
                uploadedAt: null,
                altText: null,
                description: null,
                duration: e.target.duration || null,
              };
              setUploadedMedia(mediaItem);
              onMediaSelect(mediaItem);
            }
            setShowFileModal(false);
          }}
        />
      )}
    </div>
  );
}
