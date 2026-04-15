import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/api/tags.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { Plus, Pencil, Trash2, Search, Hash, Globe2, Loader2, TrendingUp, Tag as TagIcon } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

export default function DashboardTags() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data: tagResponse, isLoading, isError, error } = useQuery({
    queryKey: ["tags", languageFilter, searchTerm, pageNumber, pageSize],
    queryFn: () =>
      tagsApi.getAll({
        Language: languageFilter === "all" ? undefined : languageFilter,
        SearchPhrase: searchTerm || undefined,
        PageNumber: pageNumber,
        PageSize: pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(t("tags.deleteSuccess"));
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("tags.deleteError"));
    },
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Hash size={16} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t("tags.metadataIndex")}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("tags.title")}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{t("tags.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/add-tag")}
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("tags.addTag")}
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
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                placeholder={t("tags.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
              />
            </div>
            <div className="w-full md:w-72">
              <select
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="all">{t("tags.allLanguages")}</option>
                <option value="English">{t("formLabels.english")}</option>
                <option value="Arabic">{t("formLabels.arabic")}</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("tags.scanningRegistry")}</p>
          </div>
        ) : isError ? (
          <div className="p-16 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
            <div className="w-16 h-16 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <Hash size={32} />
            </div>
            <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">{t("tags.indexCorruption")}</h3>
            <p className="text-sm text-rose-600/80 max-w-md mx-auto font-medium">
              {error instanceof Error ? error.message : t("tags.metadataServiceError")}
            </p>
          </div>
        ) : !tagResponse?.items || tagResponse.items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <TagIcon size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t("tags.emptyTitle")}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none italic">{t("tags.noTagsFound")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("tags.metadataToken")}</TableHead>
                    <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("tags.localization")}</TableHead>
                    <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("tags.impactAnalytics")}</TableHead>
                    <TableHead className="text-right px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("tags.registry")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagResponse.items.map((tag) => (
                    <TableRow key={tag.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <TableCell className="px-8 flex items-center gap-3">
                        <div className="flex items-center gap-4 py-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Hash size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm uppercase tracking-tight leading-none mb-1.5">{tag.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("tags.keywordToken")}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tag.language === "Arabic" ? "warning" : "primary"} className="rounded-lg px-2.5 py-1">
                          <Globe2 className="w-3 h-3 mr-1.5 opacity-70" />
                          {tag.language === "Arabic" ? "AR" : "EN"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-black tracking-tight text-xs">
                            <TrendingUp size={12} className="text-emerald-500" />
                            {tag.postsCount}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("tags.globalPulseCount")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/edit-tag/${tag.id}`)}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors border border-transparent hover:border-primary/20"
                            title={t("common.edit")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ id: tag.id, name: tag.name })}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
                            title={t("common.delete")}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="pt-6">
              <Pagination
                pageNumber={tagResponse.pageNumber}
                totalPages={tagResponse.totalPages}
                itemsFrom={tagResponse.itemsFrom}
                itemsTo={tagResponse.itemsTo}
                totalCount={tagResponse.totalCount}
                onPageChange={setPageNumber}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={`${t("tags.deleteTitle")}: ${deleteConfirm?.name ?? ""}`}
        message={t("tags.deleteMessage")}
        confirmText={deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        type="danger"
      />
    </div>
  );
}
