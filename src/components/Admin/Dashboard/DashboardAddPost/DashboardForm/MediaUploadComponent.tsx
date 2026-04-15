import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Video, 
  Play, 
  Upload, 
  Link as LinkIcon, 
  Code, 
  CheckCircle2, 
  Clock, 
  FileText,
  MousePointerClick,
  Info
} from "lucide-react";
import FileModal from "./FileModal";

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
  forcedMediaType?: string;
  hideUrlTab?: boolean;
  hideEmbedCode?: boolean;
}

export default function MediaUploadComponent({
  mediaType,
  onMediaSelect,
  forcedMediaType,
  hideUrlTab = false,
  hideEmbedCode = false,
}: MediaUploadComponentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"url" | "upload">(hideUrlTab ? "upload" : "url");
  const [showFileModal, setShowFileModal] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem | null>(null);

  const formatDuration = (duration: string | number | null): string => {
    if (!duration) return "";
    if (typeof duration === "number") {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);
      return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
    if (typeof duration === "string") {
      const parts = duration.split(":");
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = Math.floor(parseFloat(parts[2]));
        return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      }
    }
    return String(duration);
  };

  const uploadLabel = mediaType === "video" ? t("formLabels.uploadVideo") : t("formLabels.uploadAudio");
  const acceptedFormats = mediaType === "video" ? "MP4, WebM, Ogg" : "MP3, WAV, OGG, WebM";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            {mediaType === "video" ? <Video size={16} className="text-primary" /> : <Play size={16} className="text-primary" />}
            {mediaType === "video" ? t("formLabels.videoUpload") : t("formLabels.audioUpload")}
            <span className="text-rose-500 font-bold">*</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full">
            <Info size={12} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t("formLabels.requiredResource")}</span>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="p-1.5 bg-slate-100/50 flex gap-1 mx-6 mt-6 rounded-xl border border-slate-200/60">
        {!hideUrlTab && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setActiveTab("url"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === "url"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <LinkIcon size={14} />
            {t("formLabels.getVideoFromURL")}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setActiveTab("upload"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === "upload"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Upload size={14} />
          {t("formLabels.uploadLocal")}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === "url" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label htmlFor={`${mediaType}-url`} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {t("formLabels.videoURL")}
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id={`${mediaType}-url`}
                  name={`${mediaType}-url`}
                  type="url"
                  placeholder={t("formLabels.enterVideoURL")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {!hideEmbedCode && (
              <div className="space-y-2">
                <label htmlFor={`${mediaType}-embed-url`} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  <span className="flex items-center gap-1.5"><Code size={12} /> {t("formLabels.embedCode")}</span>
                </label>
                <textarea
                  id={`${mediaType}-embed-url`}
                  name={`${mediaType}-embed-url`}
                  placeholder={t("formLabels.pasteVideoEmbedCode")}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono text-slate-600 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Upload Area */}
            <div 
              onClick={() => setShowFileModal(true)}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                uploadedMedia?.url 
                  ? 'border-emerald-200 bg-emerald-50/30' 
                  : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <div className="space-y-4">
                {uploadedMedia?.url ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                        {mediaType === "video" ? <Video className="text-emerald-500" size={32} /> : <Play className="text-emerald-500" size={32} />}
                    </div>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> {t("formLabels.readyToUse")}
                    </p>
                    <p className="text-[10px] text-emerald-600/70 font-semibold mt-1 truncate max-w-xs">{uploadedMedia.fileName}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {mediaType === "video" ? <Video className="text-slate-400 group-hover:text-primary transition-colors" size={28} /> : <Play className="text-slate-400 group-hover:text-primary transition-colors" size={28} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {uploadLabel}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Formats: {acceptedFormats}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all active:scale-95">
                      <MousePointerClick size={14} />
                      {t("formLabels.browseFiles")}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Media Details Card */}
            {uploadedMedia?.url && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} /> {t("formLabels.resourceMetadata")}
                    </span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setUploadedMedia(null);
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                        {t("common.delete")}
                    </button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t("formLabels.mimeType")}</p>
                    <p className="text-xs font-bold text-slate-700">{uploadedMedia.mimeType || t("common.notAvailable")}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t("formLabels.fileSize")}</p>
                    <p className="text-xs font-bold text-slate-700">{(uploadedMedia.sizeInBytes / 1024).toFixed(1)} KB</p>
                  </div>
                  {uploadedMedia.duration && (
                    <div className="col-span-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <Clock size={12} /> {t("formLabels.playbackDuration")}
                      </span>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{formatDuration(uploadedMedia.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showFileModal && (
        <FileModal
          header={mediaType}
          onClose={() => setShowFileModal(false)}
          forcedMediaType={forcedMediaType}
          handleChange={(e: any) => {
            if (e.target.name === "videoUrl" || e.target.name === "audioUrl") {
              const mediaItem: MediaItem = {
                id: e.target.id || "",
                url: e.target.value,
                fileName: e.target.fileName || t("formLabels.unnamedResource"),
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
