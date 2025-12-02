import Loader from "@/components/Common/Loader";
import PostActionsDropdown from "@/components/Common/PostActionsDropdown";
import { useCategories } from "@/hooks/useCategories";
import { useFetchPosts } from "@/hooks/useFetchPosts";
import { useFetchPages, useDeletePage } from "@/hooks/useFetchPages";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { postsApi } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ApiNotification from "@/components/Common/ApiNotification";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";

export default function DashboardPosts({ label }: { label?: string }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: categories } = useCategories();
    const [category, setCategory] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [searchPhrase, setSearchPhrase] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const pageNumber = Number(searchParams.get("page")) || 1;
    const setPageNumber = (page: number | ((prev: number) => number)) => {
        const newPage = typeof page === "function" ? page(pageNumber) : page;
        setSearchParams((prev) => {
            prev.set("page", newPage.toString());
            return prev;
        });
    };
    const [pageSize, setPageSize] = useState<number>(15);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        itemId: string | null;
        itemTitle: string;
    }>({
        isOpen: false,
        itemId: null,
        itemTitle: "",
    });
    let isSlider = false;
    let isFeatured = false;
    let isBreaking = false;
    const isPages = label === "pages";



    if (label == "Slider Posts") isSlider = true;
    if (label === "Featured Posts") isFeatured = true
    if (label === "Breaking News") isBreaking = true

    // Use different API based on label
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

    const { data: pages, isLoading: isLoadingPages, error: pagesError } = useFetchPages({
        language: language === "all" ? null : language,
        pageNumber,
        pageSize,
        visibility: true,
    });

    // Use pages data if label is "pages", otherwise use posts data
    const data = isPages ? pages : posts;
    const isLoading = isPages ? isLoadingPages : isLoadingPosts;
    const hasError = isPages && pagesError;

    // Delete mutation for posts
    const deletePostMutation = useMutation({
        mutationFn: async ({ postId, categoryId, postType }: { postId: string; categoryId: string; postType: string }) => {
            return await postsApi.deletePost(categoryId, postId, postType);
        },
        onSuccess: () => {
            setNotification({ type: "success", message: "Post deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.title || error?.response?.data?.message || "Failed to delete post";
            setNotification({ type: "error", message });
        },
    });

    // Delete mutation for pages
    const deletePageMutation = useDeletePage();

    const handleDelete = (itemId: string) => {
        if (isPages) {
            // Handle page deletion
            const page = (data as any)?.items?.find((p: any) => p.id === itemId);
            if (!page) return;

            setConfirmDialog({
                isOpen: true,
                itemId: itemId,
                itemTitle: page.title,
            });
        } else {
            // Handle post deletion
            const post = (data as any)?.data?.items?.find((p: any) => p.id === itemId);
            if (!post) return;

            console.log('Post data for deletion:', post);

            const postType = post?.postType?.toLowerCase() || 'article';
            const categoryId = post?.categoryId || post?.category_id;

            if (!categoryId) {
                console.error('Category ID not found in post:', post);
                setNotification({ type: "error", message: "Category ID not found. Please refresh the page and try again." });
                return;
            }

            console.log('Deleting post:', { postId: itemId, categoryId, postType });

            setConfirmDialog({
                isOpen: true,
                itemId: itemId,
                itemTitle: post.title,
            });
        }
    };

    const handleConfirmDelete = () => {
        if (!confirmDialog.itemId) return;

        if (isPages) {
            deletePageMutation.mutate(confirmDialog.itemId, {
                onSuccess: () => {
                    setNotification({ type: "success", message: "Page deleted successfully" });
                    setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.title || error?.response?.data?.message || "Failed to delete page";
                    setNotification({ type: "error", message });
                    setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
                },
            });
        } else {
            const post = (data as any)?.data?.items?.find((p: any) => p.id === confirmDialog.itemId);
            if (!post) return;

            const postType = post?.postType?.toLowerCase() || 'article';
            const categoryId = post?.categoryId || post?.category_id;

            deletePostMutation.mutate(
                { postId: confirmDialog.itemId, categoryId, postType },
                {
                    onSuccess: () => {
                        setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
                    },
                    onError: () => {
                        setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" });
                    },
                }
            );
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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
                    <h2 className="text-2xl font-semibold text-gray-800">{label}</h2>
                    <button
                        type="button"
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-[#13967B] hover:bg-[#0e7a64] text-white rounded-lg shadow-md transition-all"
                        onClick={() => navigate(isPages ? "/admin/add-page" : "/admin/add-post")}
                    >
                        <span>{isPages ? "Add Page" : t('post.addPost')}</span>
                    </button>
                </div>


                {/* Filters */}
                <form className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-100">
                    <div className={`grid grid-cols-1 ${label === "pages" ? "md:grid-cols-2 lg:grid-cols-2" : "md:grid-cols-4 lg:grid-cols-8"} gap-4`}>
                        {/* Page size */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('filter.show')}</label>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
                            >
                                {[15, 30, 60, 90].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('filter.language')}</label>
                            <select
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
                            >
                                <option value="all">{t('common.all')}</option>
                                <option value="English">{t('post.english')}</option>
                                <option value="Arabic">{t('post.arabic')}</option>
                            </select>
                        </div>

                        {/* Show remaining filters only if NOT pages */}
                        {label !== "pages" && (
                            <>
                                {/* Post Type */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t('filter.postType')}</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900">
                                        <option>{t('common.all')}</option>
                                        <option>{t('post.article')}</option>
                                        <option>{t('post.video')}</option>
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t('filter.category')}</label>
                                    <select
                                        value={category ?? ""}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900"
                                    >
                                        <option value="all">{t('common.all')}</option>
                                        {categories?.data.map((option: { id: string; slug: string; name: string }) => (
                                            <option key={option.id} value={option.slug}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t('filter.subcategory')}</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900">
                                        <option>{t('common.all')}</option>
                                    </select>
                                </div>

                                {/* User */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t('filter.user')}</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm text-gray-900">
                                        <option>{t('common.select')}</option>
                                    </select>
                                </div>

                                {/* Search */}
                                <div className="col-span-2 flex items-end space-x-2">
                                    <input
                                        id="search"
                                        placeholder={t('filter.search')}
                                        value={searchPhrase ?? ""}
                                        onChange={(e) => setSearchPhrase(e.target.value)}
                                        className="grow mt-1 block p-2 border-gray-300 rounded-md focus:ring-[#13967B] focus:border-[#13967B] sm:text-sm"
                                        type="text"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-sm text-left text-gray-600 border-collapse table-auto">
                            <thead className="text-xs uppercase text-gray-700 bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4"><input type="checkbox" className="rounded border-gray-300 text-[#13967B]" /></th>
                                    <th className="px-6 py-3">{t('post.id')}</th>
                                    <th className="px-6 py-3 min-w-[300px]">{t('post.posts')}</th>
                                    <th className="px-6 py-3">{t('post.language')}</th>
                                    <th className="px-6 py-3">{t('post.type')}</th>
                                    <th className="px-6 py-3">{t('post.category')}</th>
                                    <th className="px-6 py-3">{t('post.author')}</th>
                                    <th className="px-6 py-3">{t('post.views')}</th>
                                    <th className="px-6 py-3">{t('post.date')}</th>
                                    <th className="px-6 py-3 text-right">{t('post.options')}</th>
                                </tr>
                            </thead>

                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.tbody
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <tr>
                                            <td colSpan={10} className="text-center py-10">
                                                <Loader />
                                            </td>
                                        </tr>
                                    </motion.tbody>
                                ) : hasError ? (
                                    <motion.tbody
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <tr>
                                            <td colSpan={10} className="text-center py-16">
                                                <div className="flex flex-col items-center space-y-4">
                                                    <svg
                                                        className="h-16 w-16 text-red-500"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            {t('error.apiNotAvailable') || 'API Endpoint Not Available'}
                                                        </h3>
                                                        <p className="text-gray-600 mb-4">
                                                            {t('error.pagesEndpointNotFound') || 'The pages endpoint is not yet implemented on the backend.'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {t('error.contactDeveloper') || 'Please contact your system administrator.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </motion.tbody>
                                ) : (
                                    <motion.tbody
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        {isPages ? (
                                            // Render pages data
                                            (data as any)?.items?.map((item: any) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-[#13967B]" /></td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: "150px" }}>
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 flex items-center space-x-3 cursor-pointer">
                                                        <span className="font-medium text-gray-900">{item.title}</span>
                                                    </td>
                                                    <td className="px-6 py-4">{item.language}</td>
                                                    <td className="px-6 py-4">Page</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 text-xs font-medium text-white bg-[#13967B] rounded-full">
                                                            {item.location || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{item.parentName || "-"}</td>
                                                    <td className="px-6 py-4">{item.menuOrder}</td>
                                                    <td className="px-6 py-4">
                                                        {formatDate(item.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <PostActionsDropdown
                                                            postId={item.id}
                                                            onEdit={(id) => navigate(`/admin/edit-page/${id}`)}
                                                            onDelete={handleDelete}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            // Render posts data
                                            (data as any)?.data?.items?.map((item: any) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-[#13967B]" /></td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: "150px" }}>
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 flex items-center space-x-3 cursor-pointer">
                                                        <img
                                                            src={item.image}
                                                            alt={item.imageDescription}
                                                            className="w-24 h-16 object-cover rounded-md shadow-sm"
                                                        />
                                                        <span className="font-medium text-gray-900">{item.title}</span>
                                                    </td>
                                                    <td className="px-6 py-4">{item.language}</td>
                                                    <td className="px-6 py-4">{item.postType}</td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="px-2 py-1 text-xs font-medium text-white rounded-full inline-block"
                                                            style={{
                                                                backgroundColor: categories?.data?.find((c: any) => c.slug === item.categorySlug || c.name === item.categoryName)?.colorHex || "#13967B",
                                                                whiteSpace: "nowrap"
                                                            }}
                                                        >
                                                            {item.categoryName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{item.authorName || "Created by"}</td>
                                                    <td className="px-6 py-4">{item.viewsCount}</td>
                                                    <td className="px-6 py-4">
                                                        {formatDate(item.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <PostActionsDropdown
                                                            postId={item.id}
                                                            onEdit={(id) => {
                                                                const post = (data as any)?.data?.items?.find((p: any) => p.id === id);
                                                                // Convert postType to lowercase (API returns "Article", "Gallery", etc.)
                                                                const postType = post?.postType?.toLowerCase();
                                                                navigate(`/admin/edit-post/${id}?type=${postType}`, {
                                                                    state: {
                                                                        post,
                                                                        categorySlug: post?.categorySlug,
                                                                        slug: post?.slug
                                                                    }
                                                                });
                                                            }}
                                                            onAddToSlider={(id) => console.log('Add to slider:', id)}
                                                            onAddToFeatured={(id) => console.log('Add to featured:', id)}
                                                            onAddToBreaking={(id) => console.log('Add to breaking:', id)}
                                                            onAddToRecommended={(id) => console.log('Add to recommended:', id)}
                                                            onDelete={handleDelete}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </motion.tbody>
                                )}
                            </AnimatePresence>
                        </table>
                    </div>

                    {/* Pagination */}
                    {((isPages && (data as any)?.totalPages && (data as any).totalPages > 1) ||
                        (!isPages && (data as any)?.data?.totalPages && (data as any).data.totalPages > 1)) && (
                            <div className="flex justify-center items-center space-x-2 py-4 bg-gray-50 cursor-pointer">
                                <button
                                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                                    disabled={pageNumber === 1}
                                    className={`px-3 py-1 border rounded-md cursor-pointer ${pageNumber === 1
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    ‹
                                </button>
                                {Array.from({
                                    length: isPages ? ((data as any)?.totalPages || 0) : ((data as any)?.data?.totalPages || 0)
                                }, (_, i) => i + 1).map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPageNumber(num)}
                                        className={`px-3 py-1 border rounded-md cursor-pointer ${pageNumber === num
                                            ? "bg-[#13967B] text-white border-[#13967B]"
                                            : "text-gray-700 hover:bg-gray-100 border-gray-200"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setPageNumber((prev) => {
                                            const totalPages = isPages ? (data as any)?.totalPages : (data as any)?.data?.totalPages;
                                            return totalPages ? Math.min(prev + 1, totalPages) : prev;
                                        })
                                    }
                                    disabled={pageNumber === (isPages ? (data as any)?.totalPages : (data as any)?.data?.totalPages)}
                                    className={`px-3 py-1 border rounded-md cursor-pointer ${pageNumber === (isPages ? (data as any)?.totalPages : (data as any)?.data?.totalPages)
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    ›
                                </button>
                            </div>
                        )}                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={`Delete ${isPages ? 'Page' : 'Post'}`}
                message={`Are you sure you want to delete "${confirmDialog.itemTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, itemId: null, itemTitle: "" })}
                type="danger"
            />
        </div>
    );
}
