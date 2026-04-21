import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { writersApi, type Writer } from "@/api/writers.api";
import { Search, ChevronDown, X, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface WriterSelectProps {
  value: string | null;
  onChange: (writerId: string | null) => void;
  onSelectWriter?: (writer: Writer | null) => void;
  error?: string[];
}

const PAGE_LIMIT = 10;

export default function WriterSelect({ value, onChange, onSelectWriter, error }: WriterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Store the full selected writer object so we can display name + avatar
  const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Debounce search ─────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // ── Infinite query ───────────────────────────────────────────────────────────
  // NOTE: Only fetch when the dropdown is open. Reset query key on search change.
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["writers-select", debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const res = await writersApi.getAll({
        page: pageParam as number,
        limit: PAGE_LIMIT,
        SearchPhrase: debouncedSearch || undefined,
      });
      return res; // WritersResponse: { data: Writer[], meta: { total, page, limit } }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Guard: gracefully handle different possible meta locations
      const meta = lastPage?.meta || lastPage?.data?.meta;
      if (!meta) return undefined;
      const { page, total, limit } = meta;
      const totalPages = Math.ceil(total / limit);
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: isOpen,
  });

  // Flatten pages robustly handling possible API wrapper disparities
  const writers: Writer[] = data?.pages.flatMap((page: any) => {
    if (Array.isArray(page)) return page;
    if (Array.isArray(page.data)) return page.data;
    if (Array.isArray(page.items)) return page.items;
    if (Array.isArray(page.data?.items)) return page.data.items;
    return [];
  }) ?? [];

  // ── Infinite scroll sentinel ─────────────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, writers.length]);

  // ── Auto-focus search on open; clear search on close ────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 60);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // ── Click outside to close ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Resolve selectedWriter from loaded pages when value prop changes ─────────
  // Avoid adding `writers` to dep array — use data instead to prevent loop
  useEffect(() => {
    if (!value) {
      setSelectedWriter(null);
      return;
    }
    const allWriters = data?.pages.flatMap((page: any) => {
      if (Array.isArray(page)) return page;
      if (Array.isArray(page.data)) return page.data;
      if (Array.isArray(page.items)) return page.items;
      if (Array.isArray(page.data?.items)) return page.data.items;
      return [];
    }) ?? [];
    const found = allWriters.find((w) => w.id === value);
    if (found) setSelectedWriter(found);
  }, [value, data]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = useCallback((writer: Writer) => {
    setSelectedWriter(writer);
    onChange(writer.id);
    onSelectWriter?.(writer);
    setIsOpen(false);
  }, [onChange, onSelectWriter]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWriter(null);
    onChange(null);
    onSelectWriter?.(null);
  }, [onChange, onSelectWriter]);

  const hasError = !!error?.length;
  const showLoader = isLoading || (isFetching && writers.length === 0);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-300 relative ${
        hasError ? "border-rose-200" : "border-slate-200"
      }`}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-colors ${
          hasError ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-primary/10 text-primary border-primary/20"
        }`}>
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            الكاتب <span className="text-rose-500 me-1 font-bold">*</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            اختر كاتب المقال
          </p>
        </div>
      </div>

      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            hasError
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : isOpen
              ? "border-primary bg-white ring-4 ring-primary/10 text-slate-700"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
          }`}
        >
          {selectedWriter ? (
            <>
              <WriterAvatar writer={selectedWriter} size="sm" />
              <span className="flex-1 text-start font-semibold text-slate-800 truncate" dir="auto">
                {selectedWriter.name}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="w-6 h-6 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <User size={16} />
              </div>
              <span className="flex-1 text-start text-slate-400">اختر كاتباً...</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {/* ── Dropdown panel ──────────────────────────────────────────────── */}
        {isOpen && (
          <div className="absolute top-full inset-x-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم الكاتب..."
                  className="w-full pe-9 ps-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-start focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-slate-700 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto overscroll-contain">
              {showLoader ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-primary" />
                  <span className="text-xs font-medium">جاري التحميل...</span>
                </div>
              ) : writers.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <User size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium">لم يتم العثور على كتّاب</p>
                </div>
              ) : (
                <>
                  {writers.map((writer) => (
                    <WriterOption
                      key={writer.id}
                      writer={writer}
                      isSelected={value === writer.id}
                      onSelect={handleSelect}
                    />
                  ))}
                  {/* Sentinel for infinite scroll */}
                  <div ref={sentinelRef} className="h-6 flex items-center justify-center">
                    {isFetchingNextPage && (
                      <Loader2 size={16} className="animate-spin text-primary" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Validation feedback ─────────────────────────────────────────────── */}
      {hasError && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 mt-3">
          <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
          <ul className="space-y-1">
            {error!.map((msg, i) => (
              <li key={i} className="text-rose-600 text-[10px] font-black uppercase tracking-tight">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasError && selectedWriter && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 mt-3 animate-in fade-in zoom-in-95">
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
            تم اختيار الكاتب
          </span>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function WriterAvatar({ writer, size = "md" }: { writer: Writer; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-sm`}>
      {writer.imageUrl ? (
        <img
          src={writer.imageUrl}
          alt={writer.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement!.classList.add("flex", "items-center", "justify-center");
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
          <User size={size === "sm" ? 14 : 18} />
        </div>
      )}
    </div>
  );
}

function WriterOption({
  writer,
  isSelected,
  onSelect,
}: {
  writer: Writer;
  isSelected: boolean;
  onSelect: (w: Writer) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(writer)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
        isSelected ? "bg-primary/5 border-s-2 border-primary" : ""
      }`}
    >
      <WriterAvatar writer={writer} size="md" />
      <div className="flex-1 min-w-0 text-start" dir="auto">
        <p className={`text-sm font-bold truncate ${isSelected ? "text-primary" : "text-slate-800"}`}>
          {writer.name}
        </p>
        {writer.bio && (
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {writer.bio}
          </p>
        )}
      </div>
      {isSelected && <CheckCircle2 size={16} className="text-primary shrink-0" />}
    </button>
  );
}
