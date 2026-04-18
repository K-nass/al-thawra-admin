import type { ReactNode } from "react";
import { Expand, Minimize, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArticlePreviewModalProps {
  isOpen: boolean;
  isFullscreen: boolean;
  title?: string;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onPublish: () => void;
  publishDisabled?: boolean;
  publishLabel?: string;
  children: ReactNode;
}

export default function ArticlePreviewModal({
  isOpen,
  isFullscreen,
  title,
  onClose,
  onToggleFullscreen,
  onPublish,
  publishDisabled,
  publishLabel,
  children,
}: ArticlePreviewModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const publishText = publishLabel ?? t("post.publishPost");
  const modalTitle = title ?? t("post.preview");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div
        className={[
          "relative bg-[#1A1F2B] text-slate-300 rounded-2xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col",
          isFullscreen ? "h-[100vh] max-h-[100vh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[75vh]",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#2A3143] flex items-center justify-between bg-[#1A1F2B]/50">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-white truncate">{modalTitle}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("post.visibilityAndScheduling")}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#2A3143] rounded-xl transition-colors"
              aria-label={isFullscreen ? t("common.exitFullscreen") : t("common.fullscreen")}
              title={isFullscreen ? t("common.exitFullscreen") : t("common.fullscreen")}
            >
              {isFullscreen ? <Minimize size={18} /> : <Expand size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#2A3143] rounded-xl transition-colors"
              aria-label={t("common.close")}
              title={t("common.close")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-[#2A3143] bg-[#1A1F2B]">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#2A3143] text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-[#2A3143] hover:text-white transition-colors"
            >
              {t("common.close")}
            </button>
            <button
              type="button"
              disabled={!!publishDisabled}
              onClick={onPublish}
              className="flex items-center justify-center gap-3 py-3 px-5 bg-primary text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

