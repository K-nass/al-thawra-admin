import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  User as UserIcon,
  Layers,
  Globe2,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  Layout,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Star,
  MoreHorizontal,
} from "lucide-react";

import { useCategories } from "@/hooks/useCategories";
import { useFetchPosts } from "@/hooks/useFetchPosts";
import { useFetchPages, useDeletePage } from "@/hooks/useFetchPages";
import { postsApi } from "@/api";
import PostActionsDropdown from "@/components/Common/PostActionsDropdown";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/Toast/ToastContainer";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

type DashboardPostsMode = "all" | "slider" | "featured" | "breaking" | "pages";

export default function DashboardPosts({
  mode = "all",
}: {
  mode?: DashboardPostsMode;
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: categoriesData } = useCategories();

  const [category, setCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchPhrase, setSearchPhrase] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchParams, setSearchParams] = useSearchParams();

  const pageNumber = Number(searchParams.get("page")) || 1;
  const setPageNumber = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  };
  const [pageSize, setPageSize] = useState<number>(15);

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

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemTitle: string;
  }>({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });

  const isPages = mode === "pages";
  const isSlider: boolean | undefined = mode === "slider" ? true : undefined;
  const isFeatured: boolean | undefined =
    mode === "featured" ? true : undefined;
  const isBreaking: boolean | undefined =
    mode === "breaking" ? true : undefined;
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";

  const titleByMode: Record<DashboardPostsMode, string> = {
    all: t("dashboard.posts"),
    slider: t("dashboard.sliderPosts"),
    featured: t("dashboard.featuredPosts"),
    breaking: t("dashboard.breakingNews"),
    pages: t("dashboard.pages"),
  };

  // Fetching
  const { data: posts, isLoading: isLoadingPosts } = useFetchPosts({
    category: category ?? undefined,
    language,
    searchPhrase,
    pageNumber,
    pageSize,
    isSlider,
    isFeatured,
    isBreaking,
  });

  const {
    data: pages,
    isLoading: isLoadingPages,
    error: pagesError,
  } = useFetchPages({
    language: language === "all" ? null : language,
    pageNumber,
    pageSize,
    visibility: true,
  });

  const data = isPages ? pages : posts;
  const isLoading = isPages ? isLoadingPages : isLoadingPosts;
  const hasError = isPages && !!pagesError;

  // Filter posts by status
  const filteredItems = React.useMemo(() => {
    const items = (data as any)?.data?.items || (data as any)?.items || [];
    if (statusFilter === "all") return items;
    return items.filter((item: any) => {
      if (statusFilter === "published") return !!item.publishedAt;
      if (statusFilter === "draft") return !item.publishedAt;
      return true;
    });
  }, [data, statusFilter]);

  // Mutations
  const deletePostMutation = useMutation({
    mutationFn: async ({
      postId,
      categoryId,
      postType,
    }: {
      postId: string;
      categoryId: string;
      postType: string;
    }) => {
      return await postsApi.deletePost(categoryId, postId, postType);
    },
    onSuccess: () => {
      toast.success(t("success.postDeleted"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("error.deleteFailed"));
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({
      postId,
      flag,
    }: {
      postId: string;
      flag: "isSlider" | "isFeatured" | "isBreaking" | "isRecommended";
    }) => {
      const items = (data as any)?.data?.items || (data as any)?.items;
      const post = items?.find((p: any) => p.id === postId);
      if (!post) throw new Error("Post not found");

      const postType = post?.postType?.toLowerCase() || "article";
      const categoryId = post?.categoryId;
      if (!categoryId) throw new Error("Category ID not found");

      const typeIdMap: Record<string, string> = {
        article: "articleId",
        video: "videoId",
        audio: "audioId",
      };

      const payload: any = {
        [typeIdMap[postType] || "articleId"]: postId,
        title: post.title || "",
        slug: post.slug || null,
        description: post.description || post.summary || "",
        content: post.content || "",
        categoryId,
        tagIds: post.tagIds || [],
        status: post.status || "Published",
        isSlider: post.isSlider ?? false,
        isFeatured: post.isFeatured ?? false,
        isBreaking: post.isBreaking ?? false,
        isRecommended: post.isRecommended ?? false,
        imageUrl: post.image || post.imageUrl || "",
        authorId: post.authorId || null,
        [flag]: !post[flag],
      };

      return await postsApi.updatePost(categoryId, postId, postType, payload);
    },
    onSuccess: () => {
      toast.success(t("success.postUpdated"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t("error.updateFailed"));
    },
  });

  const deletePageMutation = useDeletePage();

  const handleDeleteClick = (itemId: string) => {
    const items = (data as any)?.data?.items || (data as any)?.items;
    const item = items?.find((p: any) => p.id === itemId);
    if (!item) return;

    setConfirmDialog({
      isOpen: true,
      itemId: itemId,
      itemTitle: item.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDialog.itemId) return;

    if (isPages) {
      deletePageMutation.mutate(confirmDialog.itemId, {
        onSuccess: () => {
          toast.success(t("success.pageDeleted"));
          setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || t("error.deletePageFailed"),
          );
          setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
        },
      });
    } else {
      const items = (data as any)?.data?.items || (data as any)?.items;
      const post = items?.find((p: any) => p.id === confirmDialog.itemId);
      if (!post) return;

      const postType = post?.postType?.toLowerCase() || "article";
      const categoryId = post?.categoryId || post?.category_id;

      deletePostMutation.mutate(
        { postId: confirmDialog.itemId, categoryId, postType },
        {
          onSuccess: () =>
            setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" }),
          onError: () =>
            setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" }),
        },
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Header - Premium Alignment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Layout size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t("dashboardPosts.systemsPortal")}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {titleByMode[mode]}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
              {isPages
                ? t("dashboardPosts.pagesDescription")
                : t("dashboardPosts.postsDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(isPages ? "/admin/add-page" : "/admin/add-post")
            }
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>
              {isPages ? t("dashboardPosts.registerPage") : t("post.addPost")}
            </span>
          </button>
        </div>

        {/* Filters Card - Premium Redesign */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />

          <div className="flex items-center gap-2 mb-6 ml-1">
            <Filter size={14} className="text-primary" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t("dashboardPosts.activeFilters")}
            </h3>
          </div>

          <div className="space-y-6">
            {/* Search - Full width separate row */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder={t("dashboardPosts.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-start focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>

            {/* Filters - Same size, same row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Category */}
              {!isPages && (
                <select
                  value={category ?? ""}
                  onChange={(e) => {
                    setCategory(
                      e.target.value === "all" ? null : e.target.value,
                    );
                    setPageNumber(1);
                  }}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="all">
                    {t("dashboardPosts.allCategories")}
                  </option>
                  {categoriesData?.data.map((opt: any) => (
                    <option key={opt.id} value={opt.slug}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Language */}
              <select
                onChange={(e) => {
                  setLanguage(e.target.value === "all" ? null : e.target.value);
                  setPageNumber(1);
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">{t("dashboardPosts.allLanguages")}</option>
                <option value="English">🇬🇧 {t("post.english")}</option>
                <option value="Arabic">🇸🇦 {t("post.arabic")}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "all" | "published" | "draft");
                  setPageNumber(1);
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">{t("dashboardPosts.allStatuses")}</option>
                <option value="published">{t("dashboardPosts.published")}</option>
                <option value="draft">{t("dashboardPosts.draft")}</option>
              </select>

              {/* PageSize */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {[15, 30, 60].map((num) => (
                  <option key={num} value={num}>
                    {t("dashboardPosts.showRows", { count: num })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t("dashboardPosts.hydratingFeed")}
            </p>
          </div>
        ) : hasError ? (
          <div className="p-16 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
            <div className="w-16 h-16 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <Layout size={32} />
            </div>
            <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">
              {t("error.apiNotAvailable")}
            </h3>
            <p className="text-sm text-rose-600/80 max-w-md mx-auto font-medium">
              {t("error.pagesEndpointNotFound")}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="w-[100px] py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.idReference")}
                    </TableHead>
                    <TableHead className="min-w-[400px] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isPages
                        ? t("dashboardPosts.documentHeader")
                        : t("dashboardPosts.contentIdentity")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.globalState")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isPages
                        ? t("dashboardPosts.cluster")
                        : t("dashboardPosts.taxonomy")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.impact")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.timeline")}
                    </TableHead>
                    <TableHead className="text-right px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("dashboardPosts.registry")}
                    </TableHead>
                  </TableRow>
</TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-24 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Search size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {t("dashboardPosts.noMatchingRecords")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.map(
                    (item: any) => (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                      >
                          <TableCell className="px-6 py-5">
                            <code className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 group-hover:bg-white group-hover:text-primary transition-colors">
                              #{item.id.slice(-6).toUpperCase()}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4 py-2">
                              {!isPages && (
                                <div className="relative shrink-0">
                                  <img
                                    src={item.image || "/placeholder-post.jpg"}
                                    className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm transition-transform group-hover:scale-110"
                                    alt=""
                                    onError={(e) =>
                                      (e.currentTarget.src =
                                        "https://placehold.co/400x400/f8fafc/64748b?text=Post")
                                    }
                                  />
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                    {item.postType === "video" ? (
                                      <Zap
                                        size={10}
                                        className="text-amber-500"
                                      />
                                    ) : (
                                      <FileText
                                        size={10}
                                        className="text-primary"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1 text-sm tracking-tight leading-none mb-1.5">
                                  {item.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <UserIcon size={10} />{" "}
                                    {item.authorName ||
                                      item.parentName ||
                                      t("dashboardPosts.systemAgent")}
                                  </span>
                                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  {item.isSlider && (
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1.5 rounded">
                                      {t("dashboard.sliderPosts")}
                                    </span>
                                  )}
                                  {item.isFeatured && (
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-1.5 rounded">
                                      {t("dashboard.featuredPosts")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  item.language === "Arabic"
                                    ? "warning"
                                    : "primary"
                                }
                                className="rounded-lg px-2.5 py-1"
                              >
                                <Globe2 className="w-3 h-3 mr-1.5 opacity-70" />
                                {item.language === "Arabic" ? "AR" : "EN"}
                              </Badge>
                              {item.status === "Published" ? (
                                <div
                                  className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100"
                                  title="Published"
                                >
                                  <CheckCircle2 size={14} />
                                </div>
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100"
                                  title="Draft"
                                >
                                  <Clock size={14} />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!isPages && (
                                <div
                                  className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                                  style={{
                                    backgroundColor:
                                      categoriesData?.data?.find(
                                        (c: any) =>
                                          c.slug === item.categorySlug ||
                                          c.name === item.categoryName,
                                      )?.colorHex || "#cbd5e1",
                                  }}
                                />
                              )}
                              <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">
                                {item.categoryName ||
                                  item.location ||
                                  t("dashboardPosts.unlinked")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-slate-900 font-black tracking-tight text-xs">
                                <TrendingUp
                                  size={12}
                                  className="text-emerald-500"
                                />
                                {item.viewsCount || item.menuOrder || 0}
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                {t("dashboardPosts.globalImpact")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-900 font-bold tracking-tight">
                                {formatDate(item.createdAt)}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                {t("dashboardPosts.creationLog")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                            <PostActionsDropdown
                              postId={item.id}
                              onEdit={(id) =>
                                onEditHandler(id, item, isPages, navigate)
                              }
                              onAddToSlider={(id) =>
                                toggleFlagMutation.mutate({
                                  postId: id,
                                  flag: "isSlider",
                                })
                              }
                              onAddToFeatured={(id) =>
                                toggleFlagMutation.mutate({
                                  postId: id,
                                  flag: "isFeatured",
                                })
                              }
                              onAddToBreaking={(id) =>
                                toggleFlagMutation.mutate({
                                  postId: id,
                                  flag: "isBreaking",
                                })
                              }
                              onAddToRecommended={(id) =>
                                toggleFlagMutation.mutate({
                                  postId: id,
                                  flag: "isRecommended",
                                })
                              }
                              onDelete={handleDeleteClick}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View - Enhanced Cards */}
            <div className="lg:hidden space-y-4">
              {filteredItems.map(
                (item: any) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm space-y-4 relative overflow-hidden group active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {!isPages && item.image && (
                        <div className="relative">
                          <img
                            src={item.image}
                            className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shadow-sm"
                            alt=""
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://placehold.co/400x400/f8fafc/64748b?text=Post")
                            }
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <Activity size={12} className="text-primary" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              item.language === "Arabic" ? "warning" : "primary"
                            }
                            className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                          >
                            {item.language}
                          </Badge>
                          {item.status === "Published" ? (
                            <Badge
                              variant="success"
                              className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                            >
                              {t("dashboardPosts.live")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="info"
                              className="rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500"
                            >
                              {t("dashboardPosts.draft")}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-black text-slate-900 line-clamp-2 leading-tight tracking-tight text-sm">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {t("dashboardPosts.taxonomy")}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Layers size={10} className="text-primary" />
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">
                            {item.categoryName ||
                              item.location ||
                              t("dashboardPosts.notAvailable")}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {t("dashboardPosts.timeline")}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={10} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-600">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {item.viewsCount || 0}{" "}
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest ml-1">
                          {t("dashboardPosts.impact")}
                        </span>
                      </div>
                      <PostActionsDropdown
                        postId={item.id}
                        onEdit={(id) =>
                          onEditHandler(id, item, isPages, navigate)
                        }
                        onAddToSlider={(id) =>
                          toggleFlagMutation.mutate({
                            postId: id,
                            flag: "isSlider",
                          })
                        }
                        onAddToFeatured={(id) =>
                          toggleFlagMutation.mutate({
                            postId: id,
                            flag: "isFeatured",
                          })
                        }
                        onAddToBreaking={(id) =>
                          toggleFlagMutation.mutate({
                            postId: id,
                            flag: "isBreaking",
                          })
                        }
                        onAddToRecommended={(id) =>
                          toggleFlagMutation.mutate({
                            postId: id,
                            flag: "isRecommended",
                          })
                        }
                        onDelete={handleDeleteClick}
                      />
                    </div>
                  </div>
                ),
              )}
              {filteredItems.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                    {t("dashboardPosts.noRecordsDetected")}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6">
              <Pagination
                pageNumber={pageNumber}
                totalPages={
                  isPages
                    ? (data as any)?.totalPages
                    : (data as any)?.data?.totalPages ||
                      (data as any)?.totalPages
                }
                itemsFrom={
                  isPages
                    ? (data as any)?.itemsFrom
                    : (data as any)?.data?.itemsFrom || (data as any)?.itemsFrom
                }
                itemsTo={
                  isPages
                    ? (data as any)?.itemsTo
                    : (data as any)?.data?.itemsTo || (data as any)?.itemsTo
                }
                totalCount={
                  isPages
                    ? (data as any)?.totalCount
                    : (data as any)?.data?.totalCount ||
                      (data as any)?.totalCount
                }
                onPageChange={setPageNumber}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("dashboardPosts.deleteTitle", {
          type: isPages
            ? t("dashboardPosts.document")
            : t("dashboardPosts.contentRecord"),
        })}
        message={t("dashboardPosts.deleteMessage", {
          itemTitle: confirmDialog.itemTitle,
        })}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" })
        }
        type="danger"
      />
    </div>
  );
}

const onEditHandler = (
  id: string,
  item: any,
  isPages: boolean,
  navigate: any,
) => {
  if (isPages) {
    navigate(`/admin/edit-page/${id}`);
  } else {
    const postType = item?.postType?.toLowerCase() || "article";
    navigate(`/admin/edit-post/${id}?type=${postType}`, {
      state: {
        post: item,
        categorySlug: item?.categorySlug,
        slug: item?.slug,
      },
    });
  }
};
