import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User as UserIcon,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  PenLine,
} from "lucide-react";

import { useFetchPosts } from "@/hooks/useFetchPosts";
import { useCategories } from "@/hooks/useCategories";
import { postsApi } from "@/api";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/Toast/ToastContainer";
import PostActionsDropdown from "@/components/Common/PostActionsDropdown";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

export default function Writings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: categoriesData } = useCategories();

  const [searchInput, setSearchInput] = useState("");
  const [searchPhrase, setSearchPhrase] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [pageSize, setPageSize] = useState(15);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const newPhrase = searchInput || null;
      if (searchPhrase !== newPhrase) {
        setSearchPhrase(newPhrase);
        setPageNumber(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchPhrase]);

  const pageNumber = Number(searchParams.get("page")) || 1;
  const setPageNumber = (page: number) =>
    setSearchParams((prev) => { prev.set("page", page.toString()); return prev; });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; itemId: string | null; itemTitle: string;
    categoryId: string | null; postType: string;
  }>({ isOpen: false, itemId: null, itemTitle: "", categoryId: null, postType: "article" });

  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";

  // Fetch only articles that have a writer
  const { data: posts, isLoading } = useFetchPosts({
    language,
    searchPhrase,
    pageNumber,
    pageSize,
    hasWriter: true,
  } as any);

  const filteredItems = React.useMemo(() => {
    const items = (posts as any)?.data?.items || (posts as any)?.items || [];
    if (statusFilter === "all") return items;
    return items.filter((item: any) => {
      if (statusFilter === "published") return !!item.publishedAt;
      if (statusFilter === "draft") return !item.publishedAt;
      return true;
    });
  }, [posts, statusFilter]);

  const deletePostMutation = useMutation({
    mutationFn: async ({ postId, categoryId, postType }: { postId: string; categoryId: string; postType: string }) =>
      postsApi.deletePost(categoryId, postId, postType),
    onSuccess: () => {
      toast.success("تم حذف الكتابة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "فشل في حذف الكتابة"),
  });

  const handleEditClick = (item: any) => {
    const postType = item.postType?.toLowerCase() || "article";
    navigate(`/admin/edit-post/${item.id}?type=${postType}`, {
      state: {
        slug: item.slug,
        categorySlug: item.categorySlug
      }
    });
  };

  const handleDeleteClick = (item: any) => {
    setConfirmDialog({
      isOpen: true,
      itemId: item.id,
      itemTitle: item.title,
      categoryId: item.categoryId,
      postType: item.postType?.toLowerCase() || "article",
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDialog.itemId || !confirmDialog.categoryId) return;
    deletePostMutation.mutate(
      { postId: confirmDialog.itemId, categoryId: confirmDialog.categoryId, postType: confirmDialog.postType },
      { onSuccess: () => setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "", categoryId: null, postType: "article" }) },
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pageNumber]);

  const totalPages = (posts as any)?.data?.totalPages || (posts as any)?.totalPages || 0;
  const totalCount = (posts as any)?.data?.totalCount || (posts as any)?.totalCount || 0;
  const itemsFrom = (posts as any)?.data?.itemsFrom || (posts as any)?.itemsFrom || 0;
  const itemsTo = (posts as any)?.data?.itemsTo || (posts as any)?.itemsTo || 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <PenLine size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                محتوى الكتّاب
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">كتابات</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
              إدارة المقالات المرتبطة بكتّاب بعينهم
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/writings/add")}
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            إضافة كتابة
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          <div className="flex items-center gap-2 mb-6">
            <Filter size={14} className="text-primary" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الفلاتر</h3>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="ابحث في الكتابات..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full ps-12 pe-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-start focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <select
                onChange={(e) => { setLanguage(e.target.value === "all" ? null : e.target.value); setPageNumber(1); }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">جميع اللغات</option>
                <option value="English">🇬🇧 إنجليزي</option>
                <option value="Arabic">🇸🇦 عربي</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPageNumber(1); }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">جميع الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </select>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {[15, 30, 60].map((n) => <option key={n} value={n}>{n} عنصر</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">جاري التحميل...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">المقال</TableHead>
                    <TableHead className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الكاتب</TableHead>
                    <TableHead className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</TableHead>
                    <TableHead className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التصنيف</TableHead>
                    <TableHead className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <PenLine size={28} />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            لا توجد كتابات
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item: any) => (
                      <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                        {/* Article */}
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-4 py-2">
                            <div className="relative shrink-0">
                              <img
                                src={item.image || "/placeholder-post.jpg"}
                                className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm"
                                alt=""
                                onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400/f8fafc/64748b?text=مقال")}
                              />
                              <div className="absolute -top-1 -end-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <FileText size={10} className="text-primary" />
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1 text-sm tracking-tight leading-none mb-1.5">
                                {item.title}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Badge variant={item.language === "Arabic" ? "warning" : "primary"} className="rounded-lg text-[9px]">
                                  {item.language === "Arabic" ? "AR" : "EN"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Writer */}
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                              {item.authorImageUrl || item.writerImageUrl ? (
                                <img src={item.authorImageUrl || item.writerImageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <UserIcon size={14} />
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                              {item.authorName || item.writerName || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-4 py-4">
                          {item.status === "Published" ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <CheckCircle2 size={13} />
                              </div>
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">منشور</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <Clock size={13} />
                              </div>
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">مسودة</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Category */}
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                              style={{
                                backgroundColor:
                                  categoriesData?.data?.find((c: any) => c.slug === item.categorySlug || c.name === item.categoryName)?.colorHex || "#cbd5e1",
                              }}
                            />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">
                              {item.categoryName || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-900 font-bold tracking-tight">
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 flex items-center gap-1">
                              <Calendar size={9} /> تاريخ الإنشاء
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-8 py-4">
                          <PostActionsDropdown
                            postId={item.id}
                            onEdit={(id) => handleEditClick(item)}
                            onDelete={() => handleDeleteClick(item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination
                  pageNumber={pageNumber}
                  totalPages={totalPages}
                  itemsFrom={itemsFrom}
                  itemsTo={itemsTo}
                  totalCount={totalCount}
                  onPageChange={setPageNumber}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={`حذف: ${confirmDialog.itemTitle}`}
        message="هل أنت متأكد من حذف هذه الكتابة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText={deletePostMutation.isPending ? "جاري الحذف..." : "حذف"}
        cancelText="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "", categoryId: null, postType: "article" })}
        type="danger"
      />
    </div>
  );
}
