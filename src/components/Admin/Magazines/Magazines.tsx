
import { useState, useEffect, useRef } from "react";
import { useFetchMagazines, useDeleteMagazine, useMagazineByDate } from "@/hooks/useFetchMagazines";
import { useMagazineUpload } from "@/hooks/useMagazineUpload";
import type { Magazine } from "@/api/magazines.api";
import { magazinesApi } from "@/api/magazines.api";
import Loader from "@/components/Common/Loader";
import ApiNotification from "@/components/Common/ApiNotification";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import MagazineViewer from "./MagazineViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faSearch,
  faTrash,
  faFilePdf,
  faEye,
  faDownload,
  faUpload,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function Magazines() {
  const { t } = useTranslation();
  // State
  const [searchPhrase, setSearchPhrase] = useState("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    issueNumber: string | null;
    magazineTitle: string;
  }>({
    isOpen: false,
    issueNumber: null,
    magazineTitle: "",
  });
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    issueNumber: string;
    pdfUrl: string;
  }>({
    isOpen: false,
    issueNumber: "",
    pdfUrl: "",
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const magazines = useFetchMagazines({
    pageNumber,
    pageSize: 15,
    searchPhrase,
    from: dateRange.from,
    to: dateRange.to,
  });

  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const { data: todayIssue, refetch: refetchToday, isLoading: isLoadingToday } = useMagazineByDate(todayDate);
  
  const deleteMagazine = useDeleteMagazine();

  // Upload Hook
  const { 
    uploadPdf, 
    uploadProgress, 
    uploadStatus, 
    isUploading, 
    error: uploadError,
    resetUpload 
  } = useMagazineUpload(() => {
    setNotification({ type: "success", message: t("magazines.uploadSuccess") });
    refetchToday();
    magazines.refetch();
  });

  // Handle upload error
  useEffect(() => {
    if (uploadError) {
      setNotification({ type: "error", message: uploadError });
    }
  }, [uploadError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    magazines.refetch();
  };

  const handleDeleteClick = (magazine: Magazine) => {
    setConfirmDialog({
      isOpen: true,
      issueNumber: magazine.issueNumber,
      magazineTitle: `Issue ${magazine.issueNumber}`,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDialog.issueNumber) return;

    deleteMagazine.mutate(confirmDialog.issueNumber, {
      onSuccess: () => {
        setNotification({ type: "success", message: t("magazines.deleteSuccess") });
        setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" });
        magazines.refetch();
        refetchToday();
      },
      onError: () => {
        const message =
          deleteMagazine.error instanceof Error
            ? deleteMagazine.error.message
            : "Failed to delete magazine";
        setNotification({ type: "error", message });
        setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" });
      },
    });
  };

  const handleViewPdf = (magazine: Magazine) => {
    setViewerState({ 
      isOpen: true, 
      issueNumber: magazine.issueNumber, 
      pdfUrl: magazine.pdfUrl 
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setNotification({ type: "error", message: t("magazines.selectPdfFile") });
      return;
    }

    // Use today's date as issue number for now (or prompt user)
    // Format: YYYYMMDD to be safe as issue number
    const issueNumber = format(new Date(), 'yyyyMMdd');
    uploadPdf(file, issueNumber);
    
    // Reset input
    e.target.value = "";
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {notification && (
        <ApiNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">{t("magazines.title")}</h2>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* From Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">{t("magazines.fromDate")}</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">{t("magazines.toDate")}</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
              />
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700">{t("magazines.searchIssueNumber")}</label>
              <input
                type="text"
                value={searchPhrase}
                onChange={(e) => setSearchPhrase(e.target.value)}
                placeholder={t("magazines.searchPlaceholder")}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Today's Issue */}
        <div className="bg-gradient-to-r from-[#13967B] to-[#0e7a64] rounded-lg shadow-lg mb-6 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-xl" />
              <h3 className="text-xl font-bold">{t("magazines.todaysIssue")}</h3>
            </div>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-4 py-2 bg-white text-[#13967B] rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="animate-bounce" />
                  {t("magazines.uploading")} {uploadProgress}%
                </>
              ) : (
                t("magazines.uploadTodaysIssue")
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
          </div>

          {isLoadingToday ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : todayIssue ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Thumbnail */}
              <div className="relative aspect-[3/4] bg-white/10 rounded-lg overflow-hidden">
                <img
                  src={todayIssue.thumbnailUrl}
                  alt={`Issue ${todayIssue.issueNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <FontAwesomeIcon icon={faFilePdf} />
                  PDF
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-2xl font-bold mb-2">{t("magazines.issue")} {todayIssue.issueNumber}</h4>
                  <p className="text-white/90 mb-4">
                    {new Date(todayIssue.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleViewPdf(todayIssue)}
                    className="px-6 py-3 bg-white text-[#13967B] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    {t("magazines.viewPdf")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(todayIssue)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="h-16 w-16 text-white/50 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h4 className="text-xl font-semibold mb-2">{t("magazines.noIssueForToday")}</h4>
              <p className="text-white/80">
                {t("magazines.noIssueMessage")}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {magazines.isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <Loader />
            </motion.div>
          ) : magazines.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600"
            >
              Failed to load magazines. Please try again.
            </motion.div>
          ) : magazines.data?.items && magazines.data.items.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {magazines.data.items.map((magazine) => (
                  <div
                    key={magazine.issueNumber}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                      {magazine.thumbnailUrl ? (
                        <img
                          src={magazine.thumbnailUrl}
                          alt={`Issue ${magazine.issueNumber}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FontAwesomeIcon icon={faFilePdf} className="text-5xl" />
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewPdf(magazine)}
                          className="p-3 bg-white text-gray-800 rounded-full hover:bg-[#13967B] hover:text-white transition-colors"
                          title="View PDF"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(magazine)}
                          className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete Issue"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {t("magazines.issue")} {magazine.issueNumber}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                            {format(new Date(magazine.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleViewPdf(magazine)}
                          className="flex-1 px-3 py-2 bg-[#13967B] text-white rounded-md hover:bg-[#0e7a64] transition-colors text-center text-sm font-medium"
                        >
                          {t("magazines.viewPdf")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {magazines.data.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-6 mt-6">
                  <button
                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                    disabled={pageNumber === 1}
                    className={`px-3 py-1 border rounded-md ${
                      pageNumber === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ‹
                  </button>
                  {Array.from({ length: magazines.data.totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setPageNumber(num)}
                      className={`px-3 py-1 border rounded-md ${
                        pageNumber === num
                          ? "bg-[#13967B] text-white border-[#13967B]"
                          : "text-gray-700 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, magazines.data.totalPages))}
                    disabled={pageNumber === magazines.data.totalPages}
                    className={`px-3 py-1 border rounded-md ${
                      pageNumber === magazines.data.totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ›
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-md p-10 text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <svg
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("magazines.noMagazinesFound")}
                  </h3>
                  <p className="text-gray-600">
                    {t("magazines.noMagazinesMessage")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("magazines.confirmDeleteTitle")}
        message={t("magazines.confirmDeleteMessage", { magazineTitle: confirmDialog.magazineTitle })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" })
        }
        type="danger"
      />

      {/* Magazine Viewer Modal */}
      <MagazineViewer
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, issueNumber: "", pdfUrl: "" })}
        pdfUrl={viewerState.pdfUrl}
        issueNumber={viewerState.issueNumber}
      />
    </div>
  );
}
