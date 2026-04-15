import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Fetch PDF and create blob URL to bypass CORS
  const loadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let fetchUrl = pdfUrl;
      if (pdfUrl.includes('new-cms-dev.runasp.net/uploads')) {
        fetchUrl = pdfUrl.replace('https://new-cms-dev.runasp.net', '');
      }
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to synchronize with the PDF repository. Please verify connectivity.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pdfUrl) {
      loadPdf();
    }
    
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Encryption or structure failure. Unable to render document.");
    setIsLoading(false);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        {/* Header - Premium Navigation */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <FileText size={20} />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Magazine Archive</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Issue Reference: {issueNumber}</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 px-6 border-x border-slate-200">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 shadow-sm"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                <span className="text-[10px] font-black text-slate-900 min-w-[3rem] text-center block">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <button
                onClick={zoomIn}
                disabled={scale >= 2.0}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 shadow-sm"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 group"
              title="Close Portal"
            >
              <X size={20} className="transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-8 custom-scrollbar">
          <div className="flex justify-center min-h-full">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <Loader2 size={48} className="text-primary animate-spin mb-6" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Document Edges...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-10 max-w-md text-center">
                  <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-2">Registry Error</h3>
                  <p className="text-xs text-rose-600 leading-relaxed font-medium">{error}</p>
                </div>
              </div>
            )}

            {!error && blobUrl && (
              <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden transition-all duration-500"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white"
                />
              </Document>
            )}
          </div>
        </div>

        {/* Footer - Page Navigation */}
        {!error && numPages > 0 && (
          <div className="flex items-center justify-center gap-8 py-6 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-primary rounded-2xl transition-all shadow-sm border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              title="Previous Page"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence</span>
              <div className="flex items-center gap-3">
                 <input
                   type="number"
                   min={1}
                   max={numPages}
                   value={pageNumber}
                   onChange={(e) => {
                     const value = parseInt(e.target.value);
                     if (value >= 1 && value <= numPages) setPageNumber(value);
                   }}
                   className="w-14 h-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">of {numPages}</span>
              </div>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-primary rounded-2xl transition-all shadow-sm border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              title="Next Page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
