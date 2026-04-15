import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetchReelsFeed } from "@/hooks/useFetchReelsFeed";
import Loader from "@/components/Common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import type { Reel } from "@/api";
import { Eye, Pen, Trash2 as Trash, X, Plus, Video as VideoIcon, User, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteReel } from "@/hooks/useDeleteReel";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/Toast/ToastContainer";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardReels() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { 
        data, 
        isLoading, 
        isError, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useFetchReelsFeed(10);

    const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        reelId: string | null;
        reelCaption: string;
    }>({
        isOpen: false,
        reelId: null,
        reelCaption: "",
    });

    const deleteMutation = useDeleteReel();

    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleDeleteClick = (reel: Reel) => {
        setConfirmDelete({
            isOpen: true,
            reelId: reel.id,
            reelCaption: reel.caption || "this reel",
        });
    };

    const handleConfirmDelete = async () => {
        if (confirmDelete.reelId) {
            try {
                await deleteMutation.mutateAsync(confirmDelete.reelId);
                toast.success(t("reels.deleteSuccess") || "Reel deleted successfully");
            } catch (error) {
                toast.error(t("reels.deleteError") || "Failed to delete reel");
            } finally {
                setConfirmDelete({ isOpen: false, reelId: null, reelCaption: "" });
            }
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

    const reels = data?.pages.flatMap(page => page.reels) || [];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {t("dashboard.reels")}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage short-form video content and analytics.
                        </p>
                    </div>
                    <a 
                        href="/admin/add-post?type=reel"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-emerald-600 transition-all duration-200 gap-2 group"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        {t("common.createReel") || "Create Reel"}
                    </a>
                </div>

                {/* Content Section */}
                {isLoading && reels.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <Loader />
                        <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading reels...</p>
                    </div>
                ) : isError ? (
                    <div className="p-8 bg-error-background/50 border border-error-border rounded-xl text-center">
                        <div className="w-12 h-12 bg-error-background rounded-full flex items-center justify-center mx-auto mb-4">
                            <VideoIcon className="w-6 h-6 text-error-hover" />
                        </div>
                        <h3 className="text-lg font-semibold text-error-hover mb-2">
                            {t("error.failedToLoadReels") || "Error loading reels"}
                        </h3>
                    </div>
                ) : reels.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <VideoIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">{t("common.noDataFound") || "No reels found"}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">{t("post.id")}</TableHead>
                                    <TableHead className="min-w-[250px]">{t("dashboard.reel")}</TableHead>
                                    <TableHead>{t("post.author")}</TableHead>
                                    <TableHead className="w-[100px]">{t("post.views")}</TableHead>
                                    <TableHead className="w-[100px]">{t("post.likes")}</TableHead>
                                    <TableHead className="w-[150px]">{t("post.date")}</TableHead>
                                    <TableHead className="w-[120px]">{t("post.status")}</TableHead>
                                    <TableHead className="text-right w-[150px]">{t("post.options")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reels.map((reel: Reel) => (
                                    <TableRow key={reel.id}>
                                        <TableCell className="text-xs font-mono text-slate-400">
                                            #{reel.id.slice(-4)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {reel.thumbnailUrl ? (
                                                    <div className="relative group flex-shrink-0">
                                                        <img 
                                                            src={reel.thumbnailUrl} 
                                                            alt={reel.caption} 
                                                            className="w-12 h-16 object-cover rounded-lg shadow-sm bg-slate-100"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <VideoIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <VideoIcon className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                                                        {reel.caption || "Untitled Reel"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MessageSquare size={10} />
                                                        {reel.duration || "0:00"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {reel.userAvatarUrl ? (
                                                    <img src={reel.userAvatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User size={12} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-slate-700">{reel.userName || "Admin"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="info" className="bg-slate-50 text-slate-600 border-none">
                                                <Eye className="w-3 h-3 mr-1" />
                                                {reel.viewsCount.toLocaleString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="info" className="bg-slate-50 text-slate-600 border-none">
                                                <span className="text-red-400 mr-1">♥</span>
                                                {reel.likesCount.toLocaleString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-slate-500">
                                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                                    <Calendar size={12} />
                                                    {formatDate(reel.createdAt)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={reel.isPublished ? "success" : "warning"}>
                                                {reel.isPublished ? t("post.published") : t("post.draft")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setViewingVideoUrl(reel.videoUrl)}
                                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t("common.view")}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/edit-reel/${reel.id}`)}
                                                    className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title={t("common.edit")}
                                                >
                                                    <Pen className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(reel)}
                                                    className="p-2 text-slate-600 hover:text-error-hover hover:bg-error-background rounded-lg transition-colors"
                                                    title={t("common.delete")}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                                {/* Observer for Infinite Load */}
                                <tr ref={observerTarget}>
                                    <td colSpan={8} className="py-8 text-center">
                                        {isFetchingNextPage ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader />
                                                <span className="text-xs text-slate-400">Loading more...</span>
                                            </div>
                                        ) : hasNextPage ? (
                                            <div className="h-1 text-transparent">Scroll trigger</div>
                                        ) : reels.length > 0 ? (
                                            <span className="text-sm text-slate-400 italic">{t("common.noMoreData")}</span>
                                        ) : null}
                                    </td>
                                </tr>
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Video View Modal */}
            <AnimatePresence>
                {viewingVideoUrl && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setViewingVideoUrl(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full aspect-video group"
                        >
                            <button
                                onClick={() => setViewingVideoUrl(null)}
                                className="absolute top-4 right-4 z-20 bg-black/40 text-white hover:bg-black/60 transition-all p-2 rounded-full backdrop-blur-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <video
                                src={viewingVideoUrl}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                title={t("post.deletePost") || "Delete Reel"}
                message={t("post.deleteConfirm", { title: confirmDelete.reelCaption }) || `Are you sure you want to delete "${confirmDelete.reelCaption}"?`}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, reelId: null, reelCaption: "" })}
                type="danger"
            />
        </div>
    );
}
