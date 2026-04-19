import { useState } from "react";
import FileModal from "./FileModal";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";
import { ImagePlus, AlertCircle, Plus } from "lucide-react";

interface AdditionalImagesProps {
  handleChange: HandleChangeType;
  fieldErrors?: Record<string, string[]>;
}

export default function AdditionalImages({ handleChange, fieldErrors = {} }: AdditionalImagesProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <ImagePlus size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">{t('imageUpload.additionalImages')}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{t("imageUpload.supplementalVisuals")}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          {t('imageUpload.moreMainImages')}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Plus size={14} className="text-primary" />
          {t('imageUpload.selectImage')}
        </button>
      </div>

      {open && (
        <FileModal
          onClose={() => setOpen(false)}
          header="additional images"
          handleChange={handleChange}
        />
      )}

      <div data-error-field={fieldErrors.additionalImageUrls ? "additionalImageUrls" : undefined}>
        {fieldErrors.additionalImageUrls && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
            <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {fieldErrors.additionalImageUrls.map((error, idx) => (
                <li key={idx} className="text-rose-600 text-[10px] font-black uppercase tracking-tight">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
