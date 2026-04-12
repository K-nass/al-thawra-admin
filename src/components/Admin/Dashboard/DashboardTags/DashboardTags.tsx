import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/api/tags.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faSpinner,
    faTags,
} from "@fortawesome/free-solid-svg-icons";

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

    // Fetch tags
    const { data: tagResponse, isLoading } = useQuery({
        queryKey: ["tags", languageFilter, searchTerm, pageNumber, pageSize],
        queryFn: () =>
            tagsApi.getAll({
                Language: languageFilter === "all" ? undefined : languageFilter,
                SearchPhrase: searchTerm || undefined,
                PageNumber: pageNumber,
                PageSize: pageSize,
            }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => tagsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            toast.success(t("tags.deleteSuccess"));
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("tags.deleteError"));
        },
    });

    const handleDelete = (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteMutation.mutate(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faTags} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {t("tags.title")}
                        </h1>
                        <p className="text-sm text-gray-500">Manage your portal tags and keywords</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/admin/add-tag")}
                    className="px-4 py-2 bg-[#605CA8] text-white rounded-lg hover:bg-[#4a478a] transition-colors flex items-center gap-2 w-fit shadow-sm"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t("tags.addTag")}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPageNumber(1);
                            }}
                            placeholder={t("tags.searchPlaceholder")}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Language Filter */}
                    <select
                        value={languageFilter}
                        onChange={(e) => {
                            setLanguageFilter(e.target.value);
                            setPageNumber(1);
                        }}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="all">{t("tags.allLanguages")}</option>
                        <option value="English">{t("formLabels.english")}</option>
                        <option value="Arabic">{t("formLabels.arabic")}</option>
                    </select>
                </div>
            </div>

            {/* Tags Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-3">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600" />
                        <span className="text-gray-500 font-medium">{t("common.loading")}</span>
                    </div>
                ) : !tagResponse?.items || tagResponse.items.length === 0 ? (
                    <div className="text-center p-20 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl">
                            <FontAwesomeIcon icon={faTags} />
                        </div>
                        <div className="text-gray-500 text-lg font-medium">
                            {t("tags.noTagsFound")}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {t("tags.tagName")}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {t("tags.language")}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {t("tags.postsCount")}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {t("common.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tagResponse.items.map((tag) => (
                                        <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">
                                                    {tag.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                    tag.language === "Arabic" 
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}>
                                                    {tag.language}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                                                        {tag.postsCount}
                                                    </span>
                                                    <span>{t("dashboard.posts")}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3 text-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/admin/edit-tag/${tag.id}`)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title={t("common.edit")}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(tag.id, tag.name)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                        title={t("common.delete")}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {tagResponse.totalPages > 1 && (
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    {t("roles.showing")} <span className="font-semibold text-slate-900">{tagResponse.itemsFrom}</span> {t("roles.to")} <span className="font-semibold text-slate-900">{tagResponse.itemsTo}</span> {t("roles.of")} <span className="font-semibold text-slate-900">{tagResponse.totalCount}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                        disabled={pageNumber === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 transition-colors"
                                    >
                                        {t("roles.previous")}
                                    </button>
                                    <button
                                        onClick={() => setPageNumber(p => Math.min(tagResponse.totalPages, p + 1))}
                                        disabled={pageNumber === tagResponse.totalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 transition-colors"
                                    >
                                        {t("roles.next")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title={t("tags.deleteTitle")}
                message={`${t("tags.deleteMessage")} "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(null)}
                type="danger"
            />
        </div>
    );
}
