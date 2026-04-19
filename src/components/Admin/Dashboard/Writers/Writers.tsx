import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { writersApi, type Writer } from "@/api/writers.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { Plus, Pencil, Trash2, Search, Loader2, User, Calendar, BookOpen } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import WriterModal from "./WriterModal";

export default function Writers() {
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (debouncedSearch !== searchTerm) {
        setPageNumber(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const { data: writersResponse, isLoading, isError, error } = useQuery({
    queryKey: ["writers", debouncedSearch, pageNumber, pageSize],
    queryFn: () =>
      writersApi.getAll({
        SearchPhrase: debouncedSearch || undefined,
        page: pageNumber,
        limit: pageSize,
      }),
  });

  const writersList = writersResponse 
    ? Array.isArray(writersResponse) 
      ? writersResponse 
      : (writersResponse.data || (writersResponse as any).items || [])
    : [];

  const writersMeta = writersResponse && !Array.isArray(writersResponse) ? writersResponse.meta : null;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => writersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writers"] });
      toast.success(t("writers.deleteSuccess"));
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("writers.deleteError"));
    },
  });

  const handleEdit = (writer: Writer) => {
    setEditingWriter(writer);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingWriter(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingWriter(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User size={16} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t("writers.metadataIndex")}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("writers.title")}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{t("writers.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("writers.addWriter")}
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />

          <div className="flex flex-col md:flex-row gap-6 relative">
            <div className="flex-1 relative group">
              <div className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("writers.searchPlaceholder")}
                className="w-full ps-12 pe-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-start focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("writers.scanningRegistry")}</p>
          </div>
        ) : isError ? (
          <div className="p-16 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
            <div className="w-16 h-16 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <User size={32} />
            </div>
            <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">{t("writers.indexCorruption")}</h3>
            <p className="text-sm text-rose-600/80 max-w-md mx-auto font-medium">
              {error instanceof Error ? error.message : t("writers.metadataServiceError")}
            </p>
          </div>
        ) : !writersList || writersList.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <User size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t("writers.emptyTitle")}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none italic">{t("writers.noWritersFound")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("writers.metadataToken")}</TableHead>
                    <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("writers.localization")}</TableHead>
                    <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("writers.impactAnalytics")}</TableHead>
                    <TableHead className="px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("writers.registry")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writersList.map((writer: any) => (
                    <TableRow key={writer.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4 py-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors overflow-hidden">
                            {writer.imageUrl ? (
                              <img src={writer.imageUrl} alt={writer.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm uppercase tracking-tight leading-none mb-1.5">{writer.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("writers.keywordToken")}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-black tracking-tight text-xs">
                            <Calendar size={12} className="text-primary" />
                            {new Date(writer.birthDate).getFullYear()}
                            {writer.dateOfDeath && ` - ${new Date(writer.dateOfDeath).getFullYear()}`}
                          </div>
                          <Badge variant={writer.dateOfDeath ? "warning" : "success"} className="rounded-lg px-2.5 py-1 w-fit">
                            {writer.dateOfDeath ? t("writers.deceased") : t("writers.alive")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-xs">
                          <div className="flex items-start gap-1.5 text-slate-600 font-medium text-xs line-clamp-2">
                            <BookOpen size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            {writer.bio || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(writer)}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors border border-transparent hover:border-primary/20"
                            title={t("common.edit")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ id: writer.id, name: writer.name })}
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

              {writersMeta && writersMeta.total > 0 && (
                <div className="pt-6">
                  <Pagination
                    pageNumber={writersMeta.page || 1}
                    totalPages={Math.ceil((writersMeta.total || 0) / (writersMeta.limit || 15))}
                    itemsFrom={((writersMeta.page || 1) - 1) * (writersMeta.limit || 15) + 1}
                    itemsTo={Math.min((writersMeta.page || 1) * (writersMeta.limit || 15), (writersMeta.total || 0))}
                    totalCount={writersMeta.total || 0}
                    onPageChange={setPageNumber}
                  />
                </div>
              )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={`${t("writers.deleteTitle")}: ${deleteConfirm?.name ?? ""}`}
        message={t("writers.deleteMessage")}
        confirmText={deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        type="danger"
      />

      <WriterModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        writer={editingWriter}
      />
    </div>
  );
}