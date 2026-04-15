import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface MagazineViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  issueNumber: string;
}

export default function MagazineViewer({
  isOpen,
  onClose,
  pdfUrl,
  issueNumber,
}: MagazineViewerProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let mounted = true;
    let localBlobUrl: string | null = null;

    const loadPdf = async () => {
      if (!isOpen || !pdfUrl) return;
      try {
        setIsLoading(true);
        setError(null);
        setPageNumber(1);

        let fetchUrl = pdfUrl;
        if (pdfUrl.includes("new-cms-dev.runasp.net/uploads")) {
          fetchUrl = pdfUrl.replace("https://new-cms-dev.runasp.net", "");
        }

        const response = await fetch(fetchUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.status}`);
        }

        const blob = await response.blob();
        localBlobUrl = window.URL.createObjectURL(blob);
        if (mounted) setBlobUrl(localBlobUrl);
      } catch (loadError) {
        console.error("Error loading PDF:", loadError);
        if (mounted) {
          setError(t("magazines.viewerLoadError"));
          setIsLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      mounted = false;
      if (localBlobUrl) window.URL.revokeObjectURL(localBlobUrl);
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [isOpen, pdfUrl, t]);

  const onDocumentLoadSuccess = ({ numPages: totalPages }: { numPages: number }) => {
    setNumPages(totalPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (loadError: Error) => {
    console.error("Error rendering PDF:", loadError);
    setError(t("magazines.viewerRenderError"));
    setIsLoading(false);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full h-full max-w-[96vw] max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                {t("magazines.archiveTitle")}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {t("magazines.issueReference")}: {issueNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200"
                title={t("magazines.zoomOut")}
              >
                <ZoomOut size={16} />
              </button>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 min-w-[58px] text-center">
                {Math.round(scale * 100)}%
              </div>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= 2.0}
                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200"
                title={t("magazines.zoomIn")}
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200 border border-slate-200"
              title={t("common.close")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-6">
          <div className="flex justify-center min-h-full">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={42} className="text-primary animate-spin mb-4" />
                <p className="text-sm text-slate-500">{t("magazines.loadingDocument")}</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-md text-center">
                  <AlertCircle size={34} className="text-rose-500 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-rose-900 mb-2">
                    {t("magazines.viewerErrorTitle")}
                  </h3>
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              </div>
            )}

            {!error && blobUrl && (
              <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="shadow-sm rounded-lg overflow-hidden"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer
                  renderAnnotationLayer
                  className="bg-white"
                />
              </Document>
            )}
          </div>
        </div>

        {!error && numPages > 0 && (
          <div className="flex items-center justify-center gap-3 sm:gap-5 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-500 hover:text-primary rounded-lg transition-colors duration-200 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title={t("magazines.previousPage")}
            >
              <ChevronLeft size={18} className={isRtl ? "rotate-180" : ""} />
            </button>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500">{t("magazines.page")}</span>
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 1 && value <= numPages) setPageNumber(value);
                }}
                className="w-14 h-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <span className="text-xs font-medium text-slate-700">
                {t("magazines.of")} {numPages}
              </span>
            </div>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-500 hover:text-primary rounded-lg transition-colors duration-200 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title={t("magazines.nextPage")}
            >
              <ChevronRight size={18} className={isRtl ? "rotate-180" : ""} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
