import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/api/tags.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faSpinner, faTags } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/Common/Loader";

export default function TagForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const toast = useToast();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: "",
        language: "English" as "English" | "Arabic",
    });

    // Fetch tag data if in edit mode
    const { data: tag, isLoading: isLoadingTag } = useQuery({
        queryKey: ["tag", id],
        queryFn: () => tagsApi.getById(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (tag) {
            setFormData({
                name: tag.name,
                language: tag.language as "English" | "Arabic",
            });
        }
    }, [tag]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: () => tagsApi.create({
            tags: [{ name: formData.name, language: formData.language }]
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            toast.success(t("tags.createSuccess"));
            navigate("/admin/tags");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("tags.createError"));
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: () => tagsApi.update(id!, {
            tagId: id!,
            name: formData.name,
            language: formData.language
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            queryClient.invalidateQueries({ queryKey: ["tag", id] });
            toast.success(t("tags.updateSuccess"));
            navigate("/admin/tags");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("tags.updateError"));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error(t("tags.nameRequired"));
            return;
        }

        if (isEditMode) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    if (isEditMode && isLoadingTag) {
        return (
            <div className="flex-1 flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/tags")}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditMode ? t("tags.editTag") : t("tags.addTag")}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditMode ? "Modify existing tag details" : "Create a new tag for your content"}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <div className="flex items-center gap-3 text-blue-600 font-semibold border-b border-slate-100 pb-4 mb-2">
                            <FontAwesomeIcon icon={faTags} />
                            <span>Tag Configuration</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="name">
                                {t("tags.tagName")}
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t("tags.tagNamePlaceholder")}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="language">
                                {t("tags.language")}
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: "English" })}
                                    className={`px-4 py-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                        formData.language === "English"
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                    }`}
                                >
                                    <span className="font-bold">English</span>
                                    <span className="text-xs opacity-70">LTR Content</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: "Arabic" })}
                                    className={`px-4 py-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                        formData.language === "Arabic"
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                    }`}
                                >
                                    <span className="font-bold">Arabic</span>
                                    <span className="text-xs opacity-70">RTL Content</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
                            Actions
                        </h3>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#605CA8] text-white rounded-lg font-bold hover:bg-[#4a478a] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                        >
                            {isPending ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faSave} />
                            )}
                            {isPending ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? t("common.save") : t("tags.addTag"))}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/tags")}
                            className="w-full mt-3 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all font-medium"
                        >
                            {t("common.cancel")}
                        </button>
                    </div>

                    {isEditMode && tag && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statistics</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Related Posts:</span>
                                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm">
                                    {tag.postsCount}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
