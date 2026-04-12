import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetchReelsFeed } from "@/hooks/useFetchReelsFeed";
import Loader from "@/components/Common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import type { Reel } from "@/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useDeleteReel } from "@/hooks/useDeleteReel";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/Toast/ToastContainer";

export default function DashboardReels() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
    const toast = useToast();

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
                toast.success(t("reels.deleteSuccess"));
            } catch (error) {
                toast.error(t("reels.deleteError"));
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
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">{t("dashboard.reels")}</h2>
                    <a 
                        href="/admin/add-post?type=reel"
                        className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> {t("common.createReel")}
                    </a>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-sm text-left text-gray-600 border-collapse table-auto">
                            <thead className="text-xs uppercase text-gray-700 bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">{t("post.id")}</th>
                                    <th className="px-6 py-3 min-w-[200px]">{t("dashboard.reel")}</th>
                                    <th className="px-6 py-3">{t("post.author")}</th>
                                    <th className="px-6 py-3">{t("post.views")}</th>
                                    <th className="px-6 py-3">{t("post.likes")}</th>
                                    <th className="px-6 py-3">{t("post.date")}</th>
                                    <th className="px-6 py-3">{t("post.status")}</th>
                                    <th className="px-6 py-3 text-right">{t("post.options")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reels.map((reel: Reel) => (
                                    <tr key={reel.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                        <td className="px-6 py-4 text-gray-700">
                                            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: "150px" }}>
                                                {reel.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            {reel.thumbnailUrl ? (
                                                <img 
                                                    src={reel.thumbnailUrl} 
                                                    alt={reel.caption} 
                                                    className="w-16 h-24 object-cover rounded-md shadow-sm bg-gray-200"
                                                />
                                            ) : (
                                                <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">No Image</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 line-clamp-2">{reel.caption || "No caption"}</span>
                                                <span className="text-xs text-gray-500">{reel.duration}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {reel.userAvatarUrl && (
                                                    <img src={reel.userAvatarUrl} className="w-6 h-6 rounded-full" alt="" />
                                                )}
                                                <span>{reel.userName || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{reel.viewsCount}</td>
                                        <td className="px-6 py-4">{reel.likesCount}</td>
                                        <td className="px-6 py-4">{formatDate(reel.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${reel.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {reel.isPublished ? t("post.published") : t("post.draft")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center space-x-2">
                                                <button
                                                    onClick={() => setViewingVideoUrl(reel.videoUrl)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title={t("common.view")}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/edit-reel/${reel.id}`)}
                                                    className="p-1.5 text-[#13967B] hover:bg-[#13967B]/10 rounded-md transition-colors"
                                                    title={t("common.edit")}
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(reel)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title={t("common.delete")}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Loading & Observer Target */}
                                <tr ref={observerTarget}>
                                    <td colSpan={8} className="py-4 text-center">
                                        {isFetchingNextPage ? (
                                            <Loader />
                                        ) : hasNextPage ? (
                                            <div className="h-10"></div>
                                        ) : reels.length > 0 ? (
                                            <span className="text-gray-400">{t("common.noMoreData")}</span>
                                        ) : null}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {isLoading && reels.length === 0 && (
                        <div className="py-20 flex justify-center">
                            <Loader />
                        </div>
                    )}

                    {isError && (
                        <div className="py-20 text-center text-red-500">
                            {t("error.failedToLoadReels")}
                        </div>
                    )}
                </div>
            </div>

            {/* Video View Modal */}
            <AnimatePresence>
                {viewingVideoUrl && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setViewingVideoUrl(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-black rounded-lg overflow-hidden shadow-2xl max-w-4xl w-full aspect-video"
                        >
                            <button
                                onClick={() => setViewingVideoUrl(null)}
                                className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors p-2"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
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
                title={t("post.deletePost")}
                message={t("post.deleteConfirm", { title: confirmDelete.reelCaption })}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, reelId: null, reelCaption: "" })}
                type="danger"
            />
        </div>
    );
}
