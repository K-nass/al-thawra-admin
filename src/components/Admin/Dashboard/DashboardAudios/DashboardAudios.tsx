import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { audiosApi, type Audio, type PaginatedResponse } from "@/api/audios.api";
import { categoriesApi, type Category } from "@/api/categories.api";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Volume2,
  Globe2,
  Star,
  AlertCircle,
  Layers,
  Megaphone,
  Video,
  Layout,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ─── Inline Audio Player ────────────────────────────────────────────────────

function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1));
    const onMeta = () => setDuration(audio.duration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <div
      className="flex items-center gap-2 bg-slate-50 rounded-xl px-2 py-1.5 border border-slate-100 min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={toggle}
        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white transition-all active:scale-95 ${
          playing
            ? "bg-primary shadow-sm shadow-primary/20"
            : "bg-slate-700 hover:bg-primary"
        }`}
        title={title}
      >
        {playing ? <Pause size={12} /> : <Play size={12} />}
      </button>

      {/* Progress track */}
      <div
        className="flex-1 h-1.5 bg-slate-200 rounded-full cursor-pointer overflow-hidden min-w-[48px]"
        onClick={seek}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {duration > 0 && (
        <span className="text-[9px] font-bold text-slate-400 tabular-nums w-7 text-right flex-shrink-0">
          {fmt(duration)}
        </span>
      )}
    </div>
  );
}

// ─── Flag types ─────────────────────────────────────────────────────────────

type FlagFilter = "isFeatured" | "isBreaking" | "isSlider" | "isRecommended";

const FLAG_FILTERS: {
  key: FlagFilter;
  icon: React.ElementType;
  label_i18n: string;
}[] = [
  { key: "isFeatured",    icon: Star,        label_i18n: "audios.flagFeatured"    },
  { key: "isSlider",      icon: Layers,      label_i18n: "audios.flagSlider"      },
  { key: "isBreaking",    icon: AlertCircle, label_i18n: "audios.flagBreaking"    },
  { key: "isRecommended", icon: Megaphone,   label_i18n: "audios.flagRecommended" },
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function DashboardAudios() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";

  // ─── Filter state ──────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [searchPhrase, setSearchPhrase]   = useState<string | undefined>();
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [activeFlags, setActiveFlags] = useState<Partial<Record<FlagFilter, boolean>>>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [pageSize,   setPageSize]   = useState(15);
  const [pageNumber, setPageNumber] = useState(1);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string; title: string; categoryId: string;
  } | null>(null);

  // ─── Search debounce ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      const phrase = searchInput.trim() || undefined;
      if (phrase !== searchPhrase) {
        setSearchPhrase(phrase);
        setPageNumber(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const resetPage = useCallback(() => setPageNumber(1), []);

  // ─── Queries ───────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.getAll({ WithSub: false }),
  });

  const { data: audiosData, isLoading } = useQuery<PaginatedResponse<Audio>>({
    queryKey: [
      "audios", selectedCategoryId, languageFilter, statusFilter,
      searchPhrase, activeFlags, fromDate, toDate, pageNumber, pageSize,
    ],
    queryFn: () => {
      if (!selectedCategoryId)
        return Promise.resolve({
          items: [], totalCount: 0, pageSize, pageNumber,
          totalPages: 0, itemsFrom: 0, itemsTo: 0,
        });
      return audiosApi.getAudios(selectedCategoryId, {
        language:     languageFilter !== "all" ? languageFilter : undefined,
        status:       statusFilter   !== "all" ? statusFilter   : undefined,
        searchPhrase: searchPhrase || undefined,
        isFeatured:    activeFlags.isFeatured    || undefined,
        isBreaking:    activeFlags.isBreaking    || undefined,
        isSlider:      activeFlags.isSlider      || undefined,
        isRecommended: activeFlags.isRecommended || undefined,
        from: fromDate ? `${fromDate}T00:00:00Z` : undefined,
        to:   toDate   ? `${toDate}T23:59:59Z`   : undefined,
        pageNumber,
        pageSize,
      });
    },
    enabled: !!selectedCategoryId,
  });

  // ─── Delete ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: ({ categoryId, audioId }: { categoryId: string; audioId: string }) =>
      audiosApi.delete(categoryId, audioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audios"] });
      toast.success(t("audios.deleteSuccess"));
      setDeleteConfirm(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || t("audios.deleteError")),
  });

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteMutation.mutateAsync({
      categoryId: deleteConfirm.categoryId,
      audioId: deleteConfirm.id,
    }).catch(() => {/* handled in onError */});
  };

  // ─── Helpers ───────────────────────────────────────────────────────
  const formatDate = (d: string | null) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  };

  const toggleFlag = (key: FlagFilter) => {
    setActiveFlags((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
    resetPage();
  };

  const clearAllFilters = () => {
    setSearchInput(""); setSearchPhrase(undefined);
    setLanguageFilter("all"); setStatusFilter("all");
    setActiveFlags({}); setFromDate(""); setToDate(""); setPageNumber(1);
  };

  const hasActiveFilters = !!searchPhrase || languageFilter !== "all" ||
    statusFilter !== "all" || Object.keys(activeFlags).length > 0 || !!fromDate || !!toDate;

  const audios     = audiosData?.items     || [];
  const totalPages = audiosData?.totalPages ?? 0;
  const totalCount = audiosData?.totalCount ?? 0;

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Layout size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t("audios.audioController")}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("audios.title")}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{t("audios.subtitle")}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Add Video Post */}
            <button
              type="button"
              onClick={() => navigate("/admin/add-post?type=video")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all group active:scale-95"
            >
              <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t("audios.addVideoPost")}
            </button>

            {/* Add Audio — goes through unified post form */}
            <button
              type="button"
              onClick={() => navigate("/admin/add-post?type=audio")}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 group active:scale-95"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              {t("audios.addAudio")}
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 ml-1">
              <Filter size={14} className="text-primary" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t("dashboardPosts.activeFilters")}
              </h3>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-wider">
                  {t("common.filter")}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                <X size={12} />{t("magazines.clearFilters")}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
                placeholder={t("audios.searchPlaceholder")}
                disabled={!selectedCategoryId}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <select
                value={selectedCategoryId}
                onChange={(e) => { setSelectedCategoryId(e.target.value); resetPage(); clearAllFilters(); }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">{t("audios.selectCategory")}</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.language})</option>
                ))}
              </select>

              <select
                value={languageFilter}
                onChange={(e) => { setLanguageFilter(e.target.value); resetPage(); }}
                disabled={!selectedCategoryId}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="all">{t("dashboardPosts.allLanguages")}</option>
                <option value="English">🇬🇧 {t("post.english")}</option>
                <option value="Arabic">🇸🇦 {t("post.arabic")}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                disabled={!selectedCategoryId}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="all">{t("dashboardPosts.allStatuses")}</option>
                <option value="Published">{t("common.published")}</option>
                <option value="Draft">{t("common.draft")}</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
                disabled={!selectedCategoryId}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {[15, 30, 60].map((n) => (
                  <option key={n} value={n}>{t("dashboardPosts.showRows", { count: n })}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); resetPage(); }}
                  disabled={!selectedCategoryId}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); resetPage(); }}
                  disabled={!selectedCategoryId}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Flag pills */}
            <div className="flex flex-wrap gap-2">
              {FLAG_FILTERS.map(({ key, icon: Icon, label_i18n }) => {
                const active = !!activeFlags[key];
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!selectedCategoryId}
                    onClick={() => toggleFlag(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      active
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={11} />{t(label_i18n)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {!selectedCategoryId ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Volume2 size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              {t("audios.selectCategoryFirst")}
            </h3>
            <p className="text-sm font-bold text-slate-400">{t("audios.selectCategoryHint")}</p>
          </div>

        ) : isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t("audios.loadingAudios")}
            </p>
          </div>

        ) : audios.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Volume2 size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              {hasActiveFilters ? t("dashboardPosts.noMatchingRecords") : t("audios.emptyStateTitle")}
            </h3>
            <p className="text-sm font-bold text-slate-400">
              {hasActiveFilters ? t("audios.tryAdjustingFilters") : t("audios.noAudios")}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
              >
                <X size={14} />{t("magazines.clearFilters")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/admin/add-post?type=audio")}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all"
              >
                <Plus size={16} />{t("audios.addAudio")}
              </button>
            )}
          </div>

        ) : (
          <div className="space-y-6">
            {/* ── Desktop table ── */}
            <div className="hidden lg:block bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("audios.tableAudio")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-64">
                      {t("audios.tablePlayer")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("audios.tableStatus")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("audios.tableFlags")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("audios.tableAuthor")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("audios.tableDate")}
                    </TableHead>
                    <TableHead className="text-right px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.registry")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audios.map((audio: Audio) => (
                    <TableRow
                      key={audio.id}
                      className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      {/* Identity */}
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-violet-100 shadow-sm transition-transform group-hover:scale-110">
                            {audio.thumbnailUrl || audio.imageUrl ? (
                              <img
                                src={audio.thumbnailUrl || audio.imageUrl || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Volume2 size={22} className="text-violet-400" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1 text-sm tracking-tight leading-none mb-1.5">
                              {audio.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Globe2 size={10} />{audio.language === "Arabic" ? "AR" : "EN"}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]">
                                {audio.categoryName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Player */}
                      <TableCell>
                        {audio.audioUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <AudioPlayer src={audio.audioUrl} title={audio.title} />
                            </div>
                            <a
                              href={audio.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                              title={t("audios.openInNewTab")}
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={audio.status === "Published" ? "success" : "warning"}
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            audio.status === "Published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {audio.status === "Published" ? t("common.published") : t("common.draft")}
                        </Badge>
                      </TableCell>

                      {/* Flags */}
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {audio.addToFeatured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Star size={10} />{t("audios.flagFeatured")}
                            </span>
                          )}
                          {audio.addToSlider && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Layers size={10} />{t("audios.flagSlider")}
                            </span>
                          )}
                          {audio.addToBreaking && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <AlertCircle size={10} />{t("audios.flagBreaking")}
                            </span>
                          )}
                          {audio.addToRecommended && (
                            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Megaphone size={10} />{t("audios.flagRecommended")}
                            </span>
                          )}
                          {!audio.addToFeatured && !audio.addToSlider &&
                           !audio.addToBreaking && !audio.addToRecommended && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Author */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {audio.authorImageUrl ? (
                            <img
                              src={audio.authorImageUrl}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase">
                                {audio.authorName?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                          <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
                            {audio.authorName || t("dashboardPosts.systemAgent")}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-900 font-bold tracking-tight">
                            {formatDate(audio.publishedAt)}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                            {t("dashboardPosts.creationLog")}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/add-post?type=audio&editId=${audio.id}&categoryId=${selectedCategoryId}`)}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title={t("common.edit")}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ id: audio.id, title: audio.title, categoryId: selectedCategoryId })
                            }
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t("common.delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="lg:hidden space-y-4">
              {audios.map((audio: Audio) => (
                <div
                  key={audio.id}
                  className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  {/* Top */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-violet-100">
                      {audio.thumbnailUrl || audio.imageUrl ? (
                        <img src={audio.thumbnailUrl || audio.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Volume2 size={22} className="text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={audio.language === "Arabic" ? "warning" : "primary"}
                          className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                          {audio.language === "Arabic" ? "AR" : "EN"}
                        </Badge>
                        <Badge
                          variant={audio.status === "Published" ? "success" : "warning"}
                          className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                          {audio.status === "Published" ? t("dashboardPosts.live") : t("dashboardPosts.draft")}
                        </Badge>
                      </div>
                      <h3 className="font-black text-slate-900 line-clamp-2 leading-tight tracking-tight text-sm">
                        {audio.title}
                      </h3>
                    </div>
                  </div>

                  {/* Inline player */}
                  {audio.audioUrl && (
                    <AudioPlayer src={audio.audioUrl} title={audio.title} />
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("dashboardPosts.taxonomy")}</p>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                        {audio.categoryName || t("dashboardPosts.notAvailable")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("dashboardPosts.timeline")}</p>
                      <span className="text-[11px] font-bold text-slate-600">{formatDate(audio.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {audio.authorName || t("dashboardPosts.systemAgent")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/add-post?type=audio&editId=${audio.id}&categoryId=${selectedCategoryId}`)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ id: audio.id, title: audio.title, categoryId: selectedCategoryId })
                        }
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t("audios.showingItems", {
                    from:  audiosData?.itemsFrom ?? 0,
                    to:    audiosData?.itemsTo   ?? 0,
                    total: totalCount,
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-700 px-3">{pageNumber} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={pageNumber >= totalPages}
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {totalPages <= 1 && totalCount > 0 && (
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                {t("audios.showingItems", {
                  from:  audiosData?.itemsFrom ?? 0,
                  to:    audiosData?.itemsTo   ?? 0,
                  total: totalCount,
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={t("audios.deleteConfirmTitle")}
        message={`${t("audios.deleteConfirmMessage")} "${deleteConfirm?.title}"`}
        confirmText={deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        type="danger"
      />
    </div>
  );
}