import { useState, useEffect, useRef } from "react";
import { useFetchMagazines, useDeleteMagazine, useMagazineByDate } from "@/hooks/useFetchMagazines";
import { useMutation } from "@tanstack/react-query";
import type { Magazine } from "@/api/magazines.api";
import { magazinesApi } from "@/api/magazines.api";
import Loader from "@/components/Common/Loader";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import MagazineViewer from "./MagazineViewer";
import { 
  Calendar, 
  Search, 
  Trash2, 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  CloudUpload,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Info,
  Clock,
  Sparkles,
  Loader2,
  History as HistoryIcon,
  AlertCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast/ToastContainer";

export default function Magazines() {
  const { t } = useTranslation();
  const toast = useToast();
  
  // State
  const [searchPhrase, setSearchPhrase] = useState("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [pageNumber, setPageNumber] = useState(1);
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

  // Upload Mutation
  const createMagazineMutation = useMutation({
    mutationFn: async (data: { issueNumber: string; pdfFile: File }) => {
      return magazinesApi.create(data);
    },
    onSuccess: () => {
      toast.success(t("magazines.uploadSuccess") || "Magazine uploaded successfully");
      refetchToday();
      magazines.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload magazine");
    }
  });

  const isUploading = createMagazineMutation.isPending;

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
        toast.success(t("magazines.deleteSuccess") || "Magazine deleted successfully");
        setConfirmDialog({ isOpen: false, issueNumber: null, magazineTitle: "" });
        magazines.refetch();
        refetchToday();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete magazine");
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

    if (file.type !== "application/pdf") {
      toast.error(t("magazines.selectPdfFile") || "Please select a valid PDF file");
      return;
    }

    const issueNumber = format(new Date(), 'yyyyMMdd');
    createMagazineMutation.mutate({ issueNumber, pdfFile: file });
    
    e.target.value = "";
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="text-primary w-6 h-6" />
              {t("magazines.title") || "Daily Magazine Management"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Archive and manage digital versions of the daily printed edition.</p>
          </div>
          <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={handleUploadClick}
               disabled={isUploading}
               className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed gap-2"
             >
               {isUploading ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
               {isUploading ? t("magazines.uploading") : t("magazines.uploadTodaysIssue") || "Upload New Issue"}
             </button>
             <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               accept="application/pdf"
               className="hidden"
             />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                          <Filter size={10} /> {t("magazines.fromDate") || "From Date"}
                      </label>
                      <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-slate-700"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                          <Filter size={10} /> {t("magazines.toDate") || "To Date"}
                      </label>
                      <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-slate-700"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                          <Search size={10} /> {t("magazines.searchIssueNumber") || "Issue Reference"}
                      </label>
                      <input
                          type="text"
                          value={searchPhrase}
                          onChange={(e) => setSearchPhrase(e.target.value)}
                          placeholder={t("magazines.searchPlaceholder") || "Filter by number..."}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-slate-700"
                      />
                  </div>
              </div>
              <button 
                  onClick={handleSearch}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 border border-slate-200/50 h-[38px]"
              >
                  Apply Filters
              </button>
          </div>

          {/* Featured / Today's Section */}
          <div className="relative group rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-white/10 p-6 sm:p-8 min-h-[300px] flex flex-col justify-center">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
             
             {isLoadingToday ? (
               <div className="flex flex-col items-center justify-center p-12">
                 <Loader2 size={40} className="text-primary animate-spin" />
                 <p className="mt-4 text-white/50 text-sm font-bold uppercase tracking-widest">Checking Library...</p>
               </div>
             ) : todayIssue ? (
               <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
                 {/* Thumbnail Column */}
                 <div className="md:col-span-1 lg:col-span-1">
                    <div className="relative aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                      <img
                        src={todayIssue.thumbnailUrl}
                        alt={`Issue ${todayIssue.issueNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%231e293b' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2364748b' font-size='16'%3ENo Cover%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-lg">
                        <FileText size={12} />
                        PDF FORMAT
                      </div>
                    </div>
                 </div>

                 {/* Details Column */}
                 <div className="md:col-span-3 lg:col-span-4 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full">
                       <Sparkles size={12} />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">{t("magazines.todaysIssue") || "Featured Today"}</span>
                    </div>
                    <div>
                      <h4 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                        {t("magazines.issue")} {todayIssue.issueNumber}
                      </h4>
                      <p className="text-lg text-slate-400 font-medium flex items-center gap-2 mt-2">
                        <Clock size={18} className="text-primary" />
                        {format(new Date(todayIssue.createdAt), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="pt-4 flex flex-wrap gap-4">
                      <button
                        onClick={() => handleViewPdf(todayIssue)}
                        className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl shadow-white/5 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center gap-2.5"
                      >
                        <Eye size={18} />
                        {t("magazines.viewPdf") || "Open Interactive Viewer"}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(todayIssue)}
                        className="px-8 py-3.5 bg-white/5 text-rose-500 border border-rose-500/30 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white active:scale-[0.98] transition-all flex items-center gap-2.5"
                      >
                        <Trash2 size={18} />
                        {t("common.delete")}
                      </button>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="text-center py-12 space-y-6">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center border border-white/10 shadow-inner">
                   <Info className="text-primary w-10 h-10 animate-pulse" />
                 </div>
                 <div className="max-w-md mx-auto">
                   <h4 className="text-2xl font-black text-white mb-2">{t("magazines.noIssueForToday") || "Pending Upload"}</h4>
                   <p className="text-slate-400 font-medium leading-relaxed">
                     {t("magazines.noIssueMessage") || "The digital PDF for today's printed edition hasn't been archived yet. Upload it now to make it available."}
                   </p>
                 </div>
                 <button
                    onClick={handleUploadClick}
                    className="mt-4 px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    Publish Today's Issue
                 </button>
               </div>
             )}
          </div>

          {/* Grid View */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <HistoryIcon size={14} className="text-primary" />
                    Archive Repository
                 </h3>
                 <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-tighter">
                    {magazines.data?.totalCount || 0} Total Records
                 </span>
             </div>

             <AnimatePresence mode="wait">
               {magazines.isLoading ? (
                 <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                   <Loader2 size={48} className="text-primary animate-spin" />
                   <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Archive...</p>
                 </div>
               ) : magazines.error ? (
                 <div className="p-12 bg-rose-50/50 border border-rose-100 rounded-3xl text-center space-y-3">
                   <AlertCircle className="text-rose-500 mx-auto w-12 h-12" />
                   <h4 className="font-bold text-rose-800 text-lg">Repository Error</h4>
                   <p className="text-rose-600/70 max-w-sm mx-auto font-medium">Unable to connect to the archive server. Please verify your connection.</p>
                 </div>
               ) : magazines.data?.items && magazines.data.items.length > 0 ? (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                 >
                   {magazines.data.items.map((magazine, index) => (
                     <motion.div
                       key={magazine.issueNumber}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.05 }}
                       className="group relative bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col"
                     >
                       {/* Thumbnail Area */}
                       <div className="aspect-[3/4.2] bg-slate-50 relative overflow-hidden">
                         {magazine.thumbnailUrl ? (
                           <img
                             src={magazine.thumbnailUrl}
                             alt={`Issue ${magazine.issueNumber}`}
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             loading="lazy"
                           />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 space-y-2">
                             <FileText size={48} />
                             <span className="text-[10px] font-black uppercase text-slate-300">No Cover Available</span>
                           </div>
                         )}
                         
                         {/* Action HUD */}
                         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                           <button
                             onClick={() => handleViewPdf(magazine)}
                             className="w-12 h-12 bg-white text-slate-900 rounded-2xl hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 flex items-center justify-center shadow-lg active:scale-90"
                             title="View Resource"
                           >
                             <Eye size={20} />
                           </button>
                           <button
                             onClick={() => handleDeleteClick(magazine)}
                             className="w-12 h-12 bg-white text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 duration-300 flex items-center justify-center shadow-lg active:scale-90"
                             title="Wipe Record"
                           >
                             <Trash2 size={20} />
                           </button>
                         </div>
                       </div>

                       {/* Descriptive Info */}
                       <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10 tracking-widest uppercase">Archive</span>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <FileText size={10} /> PDF
                             </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-800 leading-tight flex-1">
                             {t("magazines.issue") || "Issue"} {magazine.issueNumber}
                          </h4>
                          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                             <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tight">
                                <Calendar size={12} className="text-slate-300" />
                                {format(new Date(magazine.createdAt), 'MMM dd, yyyy')}
                             </p>
                             <button
                               onClick={() => handleViewPdf(magazine)}
                               className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                             >
                                <ChevronRight size={14} />
                             </button>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                 </motion.div>
               ) : (
                 <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                        <BookOpen size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{t("magazines.noMagazinesFound") || "Digital Library Empty"}</h3>
                    <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                        {t("magazines.noMagazinesMessage") || "No digital editions match your current filter parameters. Try adjusting the dates or reference number."}
                    </p>
                    <button 
                        onClick={() => {
                            setSearchPhrase("");
                            setDateRange({ from: "", to: "" });
                            setTimeout(() => magazines.refetch(), 50);
                        }}
                        className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Reset Archive View
                    </button>
                 </div>
               )}
             </AnimatePresence>

             {/* Premium Pagination */}
             {magazines.data?.totalPages && magazines.data.totalPages > 1 && (
               <div className="flex justify-center items-center gap-2 py-12">
                 <button
                   onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                   disabled={pageNumber === 1}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <ChevronLeft size={18} />
                 </button>
                 
                 <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                    {Array.from({ length: magazines.data.totalPages }, (_, i) => i + 1)
                      .filter(num => {
                          if (magazines.data!.totalPages <= 7) return true;
                          return num === 1 || num === magazines.data!.totalPages || (num >= pageNumber - 2 && num <= pageNumber + 2);
                      })
                      .map((num, i, arr) => {
                        const showEllipsis = i > 0 && num - arr[i-1] > 1;
                        return (
                           <div key={num} className="flex items-center gap-1">
                             {showEllipsis && <span className="px-1 text-slate-300 text-xs font-bold">...</span>}
                             <button
                               onClick={() => setPageNumber(num)}
                               className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-black transition-all ${
                                 pageNumber === num
                                   ? "bg-primary text-white shadow-lg shadow-primary/20"
                                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                               }`}
                             >
                               {num}
                             </button>
                           </div>
                        );
                      })
                    }
                 </div>

                 <button
                   onClick={() => setPageNumber((prev) => Math.min(prev + 1, magazines.data!.totalPages))}
                   disabled={pageNumber === magazines.data.totalPages}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <ChevronRight size={18} />
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("magazines.confirmDeleteTitle") || "Confirm Wipe"}
        message={t("magazines.confirmDeleteMessage", { magazineTitle: confirmDialog.magazineTitle }) || `Are you sure you want to permanently delete Issue ${confirmDialog.issueNumber}? This action is irreversible.`}
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
    </div>
  );
}
