import { Image as ImageIcon, MousePointerClick, FileText, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import FileModal from "./FileModal";
import { isValidUrl } from "./types";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  state: {
    imageUrl?: string;
    imageDescription?: string[] | string | null;
  };
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | {
          target: {
            name: string;
            value: string | string[];
            type: string;
          };
        }
  ) => void;
  type: string | null;
  fieldErrors?: Record<string, string[]>;
}

export default function ImageUpload({
  state,  
  handleChange,
  type,
  fieldErrors = {}
}: ImageUploadProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const title = type === "video" ? t('imageUpload.videoThumbnail') || "Video Thumbnail" : t('imageUpload.imageUrl') || "Main Image";
  const description = type === "video" ? t('imageUpload.imageForVideo') || "This image will be used as the preview for your video." : t('imageUpload.mainPostImage') || "This is the primary image displayed in headers and lists.";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <ImageIcon size={16} className="text-primary" />
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{description}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Preview & Selector Area */}
        <div 
          onClick={() => setOpen(true)}
          className={`group relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer overflow-hidden ${
             state.imageUrl && isValidUrl(state.imageUrl)
               ? 'border-slate-200 bg-slate-50/30'
               : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
          {state.imageUrl && isValidUrl(state.imageUrl) ? (
            <div className="relative w-full">
              <img 
                src={state.imageUrl} 
                alt="Preview" 
                className="w-full h-auto max-h-56 object-contain rounded-xl shadow-sm group-hover:scale-[1.02] transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                 <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center gap-2">
                    <ImageIcon size={14} /> Change Image
                 </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="text-slate-400 group-hover:text-primary transition-colors" size={28} />
              </div>
              <p className="text-sm font-bold text-slate-800">{t('imageUpload.selectImage')}</p>
              {/* <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <MousePointerClick size={12} />
                {t("imageUpload.portalLibrary")}
              </div> */}
            </div>
          )}
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
            {/* URL Input */}
            <div className="space-y-1.5 flex flex-col" data-error-field={fieldErrors.imageUrl ? true : undefined}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <LinkIcon size={12} /> {t('imageUpload.addImageUrl') || "Manual URL Input"}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="imageUrl"
                        value={state.imageUrl || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                            fieldErrors.imageUrl ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                        }`}
                    />
                    {state.imageUrl && isValidUrl(state.imageUrl) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">{t('imageUpload.useFullUrl')}</p>
                
                {state.imageUrl && !isValidUrl(state.imageUrl) && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg mt-2">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700">{t('imageUpload.invalidUrlFormat')}</span>
                    </div>
                )}
                
                {fieldErrors.imageUrl && (
                    <ul className="mt-2 space-y-1 px-1">
                        {fieldErrors.imageUrl.map((err, idx) => (
                            <li key={idx} className="text-rose-600 text-[11px] font-semibold flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-rose-500" /> {err}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Description Input */}
            <div className="space-y-1.5 flex flex-col" data-error-field={fieldErrors.imageDescription ? true : undefined}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} /> {t('imageUpload.imageDescription') || "Alt Text & Description"}
                </label>
                <input
                    type="text"
                    name="imageDescription"
                    value={Array.isArray(state.imageDescription) ? "" : state.imageDescription ?? ""}
                    onChange={handleChange}
                    placeholder={t('imageUpload.imageDescriptionPlaceholder') || "Describe this image for better SEO and accessibility..."}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                        fieldErrors.imageDescription ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                    }`}
                />
                {fieldErrors.imageDescription && (
                    <ul className="mt-2 space-y-1 px-1">
                        {fieldErrors.imageDescription.map((err, idx) => (
                            <li key={idx} className="text-rose-600 text-[11px] font-semibold flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-rose-500" /> {err}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>

      {open && (
        <FileModal
          onClose={() => setOpen(false)}
          header="images"
          handleChange={handleChange}
        />
      )}
    </div>
  );
}

// Simple helper component for validation check
function CheckCircle2({ size, className }: { size: number; className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
