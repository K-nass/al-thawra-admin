import { useState, useMemo } from "react";
import { useFetchMagazines, useDeleteMagazine, useMagazineByDate } from "@/hooks/useFetchMagazines";
import { useToast } from "@/components/Toast/ToastContainer";
import type { Magazine } from "@/api/magazines.api";
import Loader from "@/components/Common/Loader";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import MagazineViewer from "./MagazineViewer";
import MagazineFormModal from "./MagazineFormModal";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Calendar,
  Eye,
  FileText,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  if (typeof window !== "undefined") {
    setTimeout(() => setDebounced(value), delay);
  }
  return debounced;
}

export default function Magazines() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const isRTL = i18n.language === "ar";

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [pageNumber, setPageNumber] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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

  const magazines = useFetchMagazines({
    pageNumber,
    pageSize: 15,
    searchPhrase: debouncedSearch,
    from: dateRange.from,
    to: dateRange.to,
  });

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const { data: todayIssue, isLoading: isLoadingToday } = useMagazineByDate(todayDate);
  const deleteMagazine = useDeleteMagazine();

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

  const formatLongDate = (dateValue: Date) =>
    dateValue.toLocaleDateString(dateLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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

  const totalPages = magazines.data?.totalPages ?? 0;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageNumber > 3) pages.push("ellipsis");
      for (let i = Math.max(2, pageNumber - 1); i <= Math.min(totalPages - 1, pageNumber + 1); i++) {
        pages.push(i);
      }
      if (pageNumber < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.25 },
    }),
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <BookOpen size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("magazines.issue")}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("magazines.title")}</h1>
            {magazines.data && (
              <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
                {t("magazines.magazineCount", { count: magazines.data.totalCount })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("magazines.createMagazine")}
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />

          <div className="flex flex-col md:flex-row gap-6 relative">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPageNumber(1);
                }}
                placeholder={t("magazines.searchPlaceholder")}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3.5 rounded-2xl font-medium transition-colors text-sm flex items-center gap-2 ${
                showFilters || hasFilters
                  ? "bg-primary text-white"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Filter size={16} />
              {t("common.filter")}
              {hasFilters && (
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        {t("magazines.fromDate")}
                      </label>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        {t("magazines.toDate")}
                      </label>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 text-xs font-medium text-primary hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                    >
                      <X size={12} />
                      {t("magazines.clearFilters")}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {magazines.isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("common.loading")}</p>
            </motion.div>
          ) : magazines.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-16 bg-rose-50 border border-rose-100 rounded-[2rem] text-center"
            >
              <div className="w-16 h-16 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">{t("magazines.failedToLoad")}</h3>
              <p className="text-sm text-rose-600/80 max-w-md mx-auto font-medium mb-6">
                {(magazines.error as any)?.response?.data?.title || (magazines.error as any)?.message || ""}
              </p>
              <button
                type="button"
                onClick={() => magazines.refetch()}
                className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-colors"
              >
                {t("common.retry")}
              </button>
            </motion.div>
          ) : magazines.data?.items && magazines.data.items.length > 0 ? (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("magazines.todaysIssue")}</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {formatLongDate(new Date())}
                  </span>
                </div>

                <div className="p-8">
                  {isLoadingToday ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader />
                    </div>
                  ) : todayIssue ? (
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-40 flex-shrink-0">
                        <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                          {todayIssue.thumbnailUrl ? (
                            <img
                              src={todayIssue.thumbnailUrl}
                              alt={`${t("magazines.issue")} ${todayIssue.issueNumber}`}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                              <FileText size={48} />
                            </div>
                          )}
                          <div className="absolute top-3 end-3 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <FileText size={10} />
                            PDF
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 mb-2">
                            {t("magazines.issue")} {todayIssue.issueNumber}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">
                            {t("magazines.createdOn")}{" "}
                            {new Date(todayIssue.createdAt).toLocaleDateString(dateLocale, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => handleViewPdf(todayIssue)}
                            className="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                          >
                            <Eye size={16} />
                            {t("magazines.viewPdf")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(todayIssue)}
                            className="px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                          >
                            <Pencil size={16} />
                            {t("common.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(todayIssue)}
                            className="px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            {t("common.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                        <BookOpen size={32} className="text-slate-300" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700 mb-2">{t("magazines.noIssueForToday")}</h4>
                      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{t("magazines.noIssueMessage")}</p>
                      <button
                        type="button"
                        onClick={handleCreate}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-primary transition-colors inline-flex items-center gap-2"
                      >
                        <Plus size={16} />
                        {t("magazines.createMagazine")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("magazines.totalIssues")}</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t("magazines.magazineCount", { count: magazines.data.totalCount })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
                  {magazines.data.items.map((magazine, index) => (
                    <motion.div
                      key={magazine.issueNumber}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                        {magazine.thumbnailUrl ? (
                          <img
                            src={magazine.thumbnailUrl}
                            alt={`${t("magazines.issue")} ${magazine.issueNumber}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                            <FileText size={40} />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">PDF</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center pb-6">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewPdf(magazine)}
                              className="w-11 h-11 bg-white rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
                              title={t("magazines.viewPdf")}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(magazine)}
                              className="w-11 h-11 bg-white rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-sm"
                              title={t("common.edit")}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(magazine)}
                              className="w-11 h-11 bg-white rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                              title={t("common.delete")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="absolute top-3 end-3 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <FileText size={10} />
                          PDF
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-black text-slate-900">{t("magazines.issue")} {magazine.issueNumber}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                              <Calendar size={10} />
                              {formatDate(magazine.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 py-8 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                      disabled={pageNumber === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {getPageNumbers().map((num, idx) =>
                      num === "ellipsis" ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
                          ...
                        </span>
                      ) : (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPageNumber(num)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                            pageNumber === num
                              ? "bg-primary text-white shadow-sm"
                              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {num}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                      disabled={pageNumber === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[2rem] border border-slate-200 p-16 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center">
                <BookOpen size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t("magazines.noMagazinesFound")}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-medium">{t("magazines.noMagazinesMessage")}</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-3 text-sm font-bold text-primary bg-primary/5 rounded-2xl hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
                >
                  <X size={14} />
                  {t("magazines.clearFilters")}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("magazines.confirmDeleteTitle")}
        message={t("magazines.confirmDeleteMessage", { magazineTitle: confirmDialog.magazineTitle })}
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