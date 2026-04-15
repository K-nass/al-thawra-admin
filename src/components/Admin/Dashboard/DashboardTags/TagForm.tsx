import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Tags, 
  ChevronLeft, 
  Save, 
  Loader2, 
  Globe, 
  Type, 
  BarChart3,
  Info
} from "lucide-react";
import { tagsApi } from "@/api/tags.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";

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
    const [errors, setErrors] = useState<{name?: string, language?: string}>({});

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
            toast.success(t("tags.createSuccess") || "Tag created successfully");
            navigate("/admin/tags");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("tags.createError") || "Failed to create tag");
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
            toast.success(t("tags.updateSuccess") || "Tag updated successfully");
            navigate("/admin/tags");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("tags.updateError") || "Failed to update tag");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {name?: string, language?: string} = {};
        
        if (!formData.name.trim()) {
            newErrors.name = t("tags.nameRequired") || "Tag name is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error(t("common.fixErrors") || "Please fix the errors in the form");
            return;
        }

        setErrors({});
        if (isEditMode) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    if (isEditMode && isLoadingTag) {
        return (
            <div className="flex-1 flex items-center justify-center p-20 bg-surface">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/tags")}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {isEditMode ? t("tags.editTag") : t("tags.addTag")}
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {isEditMode ? "Modify existing tag attributes and properties." : "Create a new tag to help readers find related content."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 font-sans">
                    {/* Main Config Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Info size={16} className="text-primary" />
                                    {t("tags.tagConfig") || "Tag Information"}
                                </h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* Tag Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="name">
                                        {t("tags.tagName")} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={t("tags.tagNamePlaceholder") || "Enter tag name..."}
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                                              errors.name ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                            }`}
                                        />
                                    </div>
                                    {errors.name && (
                                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Language Toggle */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                        {t("tags.language")} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: "English", label: "English", desc: "LTR Content" },
                                            { id: "Arabic", label: "Arabic", desc: "RTL Content" }
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, language: lang.id as any })}
                                                className={`px-4 py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                                                    formData.language === lang.id
                                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                                }`}
                                            >
                                                <Globe size={20} className={formData.language === lang.id ? "text-primary" : "text-slate-300"} />
                                                <span className="font-bold text-sm mt-1">{lang.label}</span>
                                                <span className="text-[10px] opacity-60 font-medium">{lang.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
                                <Save size={14} />
                                {t("common.publishing") || "Management"}
                            </h3>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                                >
                                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isPending ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? t("common.save") : t("tags.addTag"))}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/tags")}
                                    className="w-full px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
                                >
                                    {t("common.cancel")}
                                </button>
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        {isEditMode && tag && (
                            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BarChart3 size={14} />
                                    {t("tags.usageStats") || "Usage Statistics"}
                                </h4>
                                <div className="flex justify-between items-center group">
                                    <span className="text-sm font-medium text-emerald-800/70">Related Content:</span>
                                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100">
                                        <span className="font-bold text-lg text-emerald-600 leading-none">
                                            {tag.postsCount}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Items</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-xl border border-emerald-100/50 text-[11px] text-emerald-700/70 italic leading-relaxed">
                                    This tag is currently used in {tag.postsCount} posts and across multiple categories.
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
