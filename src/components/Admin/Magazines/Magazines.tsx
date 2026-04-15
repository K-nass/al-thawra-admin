import { useState, useEffect, useMemo } from "react";
import { useFetchMagazines, useDeleteMagazine, useMagazineByDate } from "@/hooks/useFetchMagazines";
import { useToast } from "@/components/Toast/ToastContainer";
import type { Magazine } from "@/api/magazines.api";
import Loader from "@/components/Common/Loader";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import MagazineViewer from "./MagazineViewer";
import MagazineFormModal from "./MagazineFormModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faTrash,
  faFilePdf,
  faEye,
  faPlus,
  faPen,
  faXmark,
  faNewspaper,
  faSearch,
  faFilter,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast/ToastContainer";

// ────────────────────────── Debounce ──────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Magazines() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const isRTL = i18n.language === "ar";

  // ────────────────────────── State ──────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [pageNumber, setPageNumber] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    issueNumber: string | null;
    magazineTitle: string;
  }>({ isOpen: false, issueNumber: null, magazineTitle: "" });

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    issueNumber: string;
    pdfUrl: string;
  }>({ isOpen: false, issueNumber: "", pdfUrl: "" });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    magazine: Magazine | null;
  }>({ isOpen: false, magazine: null });

  // ────────────────────────── Data Hooks ──────────────────────────
  const magazines = useFetchMagazines({
    pageNumber,
    pageSize: 15,
    searchPhrase: debouncedSearch,
    from: dateRange.from,
    to: dateRange.to,
  });

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const {
    data: todayIssue,
    isLoading: isLoadingToday,
  } = useMagazineByDate(todayDate);

  const deleteMagazine = useDeleteMagazine();

  // ────────────────────────── Derived ──────────────────────────
  const hasFilters = !!dateRange.from || !!dateRange.to || !!debouncedSearch;

  const dateLocale = useMemo(() => {
    return isRTL ? "ar-EG" : "en-US";
  }, [isRTL]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ────────────────────────── Handlers ──────────────────────────
  const handleDeleteClick = (magazine: Magazine) => {
    setConfirmDialog({
      isOpen: true,
      issueNumber: magazine.issueNumber,
      magazineTitle: `${t("magazines.issue")} ${magazine.issueNumber}`,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDialog.issueNumber) return;

    deleteMagazine.mutate(confirmDialog.issueNumber, {
      onSuccess: () => {
        toast.success(t("magazines.deleteSuccess"));
        setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" });
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.title ||
          error?.response?.data?.message ||
          error?.message ||
          t("magazines.deleteError");
        toast.error(msg);
        setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" });
      },
    });
  };

  const handleViewPdf = (magazine: Magazine) => {
    setViewerState({
      isOpen: true,
      issueNumber: magazine.issueNumber,
      pdfUrl: magazine.pdfUrl,
    });
  };

  const handleEdit = (magazine: Magazine) => {
    setFormModal({ isOpen: true, magazine });
  };

  const handleCreate = () => {
    setFormModal({ isOpen: true, magazine: null });
  };

  const clearFilters = () => {
    setSearchInput("");
    setDateRange({ from: "", to: "" });
    setPageNumber(1);
  };

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, dateRange.from, dateRange.to]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  // ────────────────────────── Pagination Helpers ──────────────────────────
  const totalPages = magazines.data?.totalPages ?? 0;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageNumber > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, pageNumber - 1);
        i <= Math.min(totalPages - 1, pageNumber + 1);
        i++
      ) {
        pages.push(i);
      }
      if (pageNumber < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // ────────────────────────── Card animation variants ──────────────────────────
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
    }),
  };

  // ──────────────────────────── RENDER ────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* ═══════════ Page Header ═══════════ */}
        <div className="bg-gradient-to-br from-[#13967B] via-[#0e7a64] to-[#0a5e4d] px-6 py-8 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FontAwesomeIcon icon={faNewspaper} className="text-lg" />
                  </div>
                  {t("magazines.title")}
                </h1>
                {magazines.data && (
                  <p className="text-white/70 text-sm mt-2">
                    {t("magazines.magazineCount", {
                      count: magazines.data.totalCount,
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreate}
                className="px-5 py-2.5 bg-white text-[#13967B] rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl self-start sm:self-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                {t("magazines.createMagazine")}
              </button>
            </div>

            {/* Search & Filter Toggle */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("magazines.searchPlaceholder")}
                  className="w-full ps-11 pe-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl border font-medium transition-all duration-200 flex items-center gap-2 ${
                  showFilters || hasFilters
                    ? "bg-white text-[#13967B] border-white"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">{t("common.filter")}</span>
                {hasFilters && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Collapsible Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-white/70 mb-1 block">
                          {t("magazines.fromDate")}
                        </label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) =>
                            setDateRange((prev) => ({ ...prev, from: e.target.value }))
                          }
                          className="w-full px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/70 mb-1 block">
                          {t("magazines.toDate")}
                        </label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) =>
                            setDateRange((prev) => ({ ...prev, to: e.target.value }))
                          }
                          className="w-full px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                        {t("magazines.clearFilters")}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 space-y-6">
          {/* ═══════════ Today's Issue Hero ═══════════ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#13967B]/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendar} className="text-[#13967B] text-sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t("magazines.todaysIssue")}</h2>
              <span className="text-xs text-gray-400 ms-auto">
                {format(new Date(), "EEEE, MMMM dd, yyyy")}
              </span>
            </div>

            <div className="p-6">
              {isLoadingToday ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : todayIssue ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                      {todayIssue.thumbnailUrl ? (
                        <img
                          src={todayIssue.thumbnailUrl}
                          alt={`${t("magazines.issue")} ${todayIssue.issueNumber}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                          <FontAwesomeIcon icon={faFilePdf} className="text-5xl" />
                        </div>
                      )}
                      <div className="absolute top-2 end-2 bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <FontAwesomeIcon icon={faFilePdf} className="text-[10px]" />
                        PDF
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {t("magazines.issue")} {todayIssue.issueNumber}
                      </h3>
                      <p className="text-gray-500 text-sm mb-1">
                        {t("magazines.createdOn")}{" "}
                        {new Date(todayIssue.createdAt).toLocaleDateString(dateLocale, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleViewPdf(todayIssue)}
                        className="px-4 py-2 bg-[#13967B] text-white rounded-lg hover:bg-[#0e7a64] transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
                      >
                        <FontAwesomeIcon icon={faEye} />
                        {t("magazines.viewPdf")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(todayIssue)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 text-sm"
                      >
                        <FontAwesomeIcon icon={faPen} />
                        {t("common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(todayIssue)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Today State */
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faNewspaper} className="text-2xl text-gray-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-1">
                    {t("magazines.noIssueForToday")}
                  </h4>
                  <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
                    {t("magazines.noIssueMessage")}
                  </p>
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="px-5 py-2.5 bg-[#13967B] text-white rounded-xl font-medium hover:bg-[#0e7a64] transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#13967B]/20"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    {t("magazines.createMagazine")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════ Magazine Grid ═══════════ */}
          <AnimatePresence mode="wait">
            {magazines.isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-24"
              >
                <Loader />
              </motion.div>
            ) : magazines.error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faNewspaper} className="text-xl text-red-400" />
                </div>
                <p className="text-red-600 font-medium mb-1">
                  {t("magazines.failedToLoad")}
                </p>
                <p className="text-red-400 text-sm mb-4">
                  {(magazines.error as any)?.response?.data?.title ||
                    (magazines.error as any)?.message ||
                    ""}
                </p>
                <button
                  type="button"
                  onClick={() => magazines.refetch()}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  {t("common.retry") || "Retry"}
                </button>
              </motion.div>
            ) : magazines.data?.items && magazines.data.items.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Grid Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("magazines.totalIssues")}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {t("magazines.magazineCount", {
                      count: magazines.data.totalCount,
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {magazines.data.items.map((magazine, index) => (
                    <motion.div
                      key={magazine.issueNumber}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group hover:border-gray-200"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {magazine.thumbnailUrl ? (
                          <img
                            src={magazine.thumbnailUrl}
                            alt={`${t("magazines.issue")} ${magazine.issueNumber}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                            <FontAwesomeIcon icon={faFilePdf} className="text-4xl" />
                            <span className="text-xs font-medium text-gray-400">PDF</span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewPdf(magazine)}
                              className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-[#13967B] hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                              title={t("magazines.viewPdf")}
                            >
                              <FontAwesomeIcon icon={faEye} className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(magazine)}
                              className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                              title={t("common.edit")}
                            >
                              <FontAwesomeIcon icon={faPen} className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(magazine)}
                              className="w-10 h-10 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                              title={t("common.delete")}
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* PDF Badge */}
                        <div className="absolute top-3 end-3 bg-red-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <FontAwesomeIcon icon={faFilePdf} className="text-[10px]" />
                          PDF
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">
                              {t("magazines.issue")} {magazine.issueNumber}
                            </h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <FontAwesomeIcon icon={faCalendar} className="text-[10px]" />
                              {formatDate(magazine.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ═══════════ Pagination ═══════════ */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 py-8 mt-4">
                    <button
                      type="button"
                      onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                      disabled={pageNumber === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={isRTL ? faChevronRight : faChevronLeft}
                        className="text-xs"
                      />
                    </button>

                    {getPageNumbers().map((num, idx) =>
                      num === "ellipsis" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                        >
                          ···
                        </span>
                      ) : (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPageNumber(num)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                            pageNumber === num
                              ? "bg-[#13967B] text-white shadow-md shadow-[#13967B]/25"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {num}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPageNumber((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={pageNumber === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={isRTL ? faChevronLeft : faChevronRight}
                        className="text-xs"
                      />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ═══════════ Empty State ═══════════ */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-5 bg-gray-50 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faNewspaper}
                    className="text-3xl text-gray-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t("magazines.noMagazinesFound")}
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                  {t("magazines.noMagazinesMessage")}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-[#13967B] bg-[#13967B]/5 rounded-lg hover:bg-[#13967B]/10 transition-colors inline-flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                    {t("magazines.clearFilters")}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════ Modals ═══════════ */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("magazines.confirmDeleteTitle")}
        message={t("magazines.confirmDeleteMessage", {
          magazineTitle: confirmDialog.magazineTitle,
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" })}
        type="danger"
      />

      <MagazineViewer
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, issueNumber: "", pdfUrl: "" })}
        pdfUrl={viewerState.pdfUrl}
        issueNumber={viewerState.issueNumber}
      />

      <MagazineFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, magazine: null })}
        magazine={formModal.magazine}
      />
    </div>
  );
}
