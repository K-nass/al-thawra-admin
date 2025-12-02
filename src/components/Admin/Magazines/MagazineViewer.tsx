import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
  faSearchPlus,
  faSearchMinus,
} from "@fortawesome/free-solid-svg-icons";
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
      
      // If URL is absolute and matches our backend, convert to relative to use proxy
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
      setError('Failed to load PDF. Please try again.');
      setIsLoading(false);
    }
  };

  // Load PDF when component opens or URL changes
  useEffect(() => {
    if (isOpen && pdfUrl) {
      loadPdf();
    }
    
    // Cleanup blob URL when component unmounts or closes
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
    setError("Failed to load PDF. Please try again.");
    setIsLoading(false);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-screen flex flex-col bg-white rounded-lg shadow-2xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            Issue {issueNumber}
          </h2>
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-3">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="p-2 text-gray-600 hover:text-[#13967B] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <FontAwesomeIcon icon={faSearchMinus} />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 2.0}
                className="p-2 text-gray-600 hover:text-[#13967B] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <FontAwesomeIcon icon={faSearchPlus} />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13967B] mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              </div>
            )}

            {!error && blobUrl && (
              <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
                className="shadow-lg"
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
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-600 hover:text-[#13967B] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= numPages) {
                    setPageNumber(value);
                  }
                }}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-[#13967B] focus:border-[#13967B]"
              />
              <span className="text-sm text-gray-600">of {numPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-600 hover:text-[#13967B] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
