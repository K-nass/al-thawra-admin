import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Save,
  ChevronLeft,
  Loader2,
  Volume2,
  Link as LinkIcon,
  Image,
  Globe,
  Star,
  AlertCircle,
  Layers,
  Megaphone,
  Settings,
  FileText,
  Video,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import { audiosApi, type AudioFormData } from "@/api/audios.api";
import { categoriesApi } from "@/api/categories.api";
import { authApi } from "@/api/auth.api";
import { useToast } from "@/components/Toast/ToastContainer";
import {
  extractApiErrorMessage,
  focusFirstErrorField,
  parseApiValidationErrors,
  type ModalFieldErrors,
} from "@/utils/apiFormErrors";

const DEFAULT_FORM_DATA: AudioFormData = {
  categoryId: "",
  language: "Arabic",
  title: "",
  slug: "",
  content: "",
  audioUrl: "",
  imageUrl: null,
  authorId: "",
  metaDescription: null,
  metaKeywords: null,
  addToBreaking: false,
  addToFeatured: false,
  addToSlider: false,
  addToRecommended: false,
  status: "Published",
  scheduledAt: null,
  visibility: true,
  showOnlyToRegisteredUsers: false,
  tagIds: [],
};

const serverFieldAliases = {
  audioUrl: "audioUrl",
  title: "title",
  slug: "slug",
  content: "content",
  language: "language",
  categoryId: "categoryId",
  imageUrl: "imageUrl",
  authorId: "authorId",
  metaDescription: "metaDescription",
  metaKeywords: "metaKeywords",
  addToBreaking: "addToBreaking",
  addToFeatured: "addToFeatured",
  addToSlider: "addToSlider",
  addToRecommended: "addToRecommended",
  status: "status",
  scheduledAt: "scheduledAt",
  visibility: "visibility",
  showOnlyToRegisteredUsers: "showOnlyToRegisteredUsers",
  tagIds: "tagIds",
} as const;

export default function DashboardAddAudio() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { categoryId: routeCategoryId, audioId } = useParams<{
    categoryId: string;
    audioId: string;
  }>();

  const categoryIdFromQuery = searchParams.get("categoryId");
  const categoryId = routeCategoryId || categoryIdFromQuery || "";
  const isEditMode = !!audioId;

  const [formData, setFormData] = useState<AudioFormData>({
    ...DEFAULT_FORM_DATA,
    categoryId,
  });
  const [errors, setErrors] = useState<ModalFieldErrors>({});

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUserProfile(),
    enabled: !isEditMode,
  });

  const { data: audioData, isLoading: isLoadingAudio } = useQuery({
    queryKey: ["audio", categoryId, audioId],
    queryFn: () => audiosApi.getAudioById(categoryId, audioId!),
    enabled: isEditMode && !!categoryId && !!audioId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.getAll({ WithSub: false }),
  });

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (audioData) {
      setFormData({
        categoryId: audioData.categoryId,
        language: audioData.language as "English" | "Arabic",
        title: audioData.title,
        slug: audioData.slug,
        content: audioData.content,
        audioUrl: audioData.audioUrl,
        imageUrl: audioData.imageUrl,
        authorId: audioData.authorId,
        metaDescription: audioData.metaDescription,
        metaKeywords: audioData.metaKeywords,
        addToBreaking: audioData.addToBreaking,
        addToFeatured: audioData.addToFeatured,
        addToSlider: audioData.addToSlider,
        addToRecommended: audioData.addToRecommended,
        status: audioData.status as "Draft" | "Scheduled" | "Published",
        scheduledAt: audioData.scheduledAt,
        visibility: true,
        showOnlyToRegisteredUsers: false,
        tagIds: [],
      });
    }
  }, [audioData]);

  useEffect(() => {
    focusFirstErrorField(errors);
  }, [errors]);

  useEffect(() => {
    if (!isEditMode && userProfile?.id && !formData.authorId) {
      setFormData((prev) => ({ ...prev, authorId: userProfile.id }));
    }
  }, [userProfile?.id, isEditMode]);

  // ─── Mutation ───────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (data: AudioFormData) => {
      if (isEditMode) {
        return audiosApi.update(categoryId, audioId!, data);
      }
      return audiosApi.create(categoryId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audios"] });
      toast.success(
        isEditMode ? t("audios.updateSuccess") : t("audios.createSuccess"),
      );
      navigate("/admin/audios");
    },
    onError: (error) => {
      const parsed = parseApiValidationErrors(error, serverFieldAliases);
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setErrors(parsed.fieldErrors);
        toast.error(
          parsed.messages[0] ||
            (isEditMode ? t("audios.updateError") : t("audios.createError")),
        );
        return;
      }
      toast.error(
        extractApiErrorMessage(
          error,
          isEditMode ? t("audios.updateError") : t("audios.createError"),
        ),
      );
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ModalFieldErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("validation.titleRequired");
    }
    if (!formData.audioUrl?.trim()) {
      newErrors.audioUrl = t("validation.audioUrlRequired");
    }
    if (!formData.categoryId) {
      newErrors.categoryId = t("validation.categoryRequired");
    }
    if (!formData.language) {
      newErrors.language = t("validation.languageRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("common.fixErrors"));
      return;
    }

    setErrors({});
    saveMutation.mutate(formData);
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (isEditMode && isLoadingAudio) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 h-full">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  // ─── Field helper ───────────────────────────────────────────────────────────

  const fieldClass = (name: string) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
      errors[name]
        ? "border-rose-400 focus:ring-rose-500/10"
        : "border-slate-200 focus:ring-primary/10 focus:border-primary"
    }`;

  const iconFieldClass = (name: string) =>
    `w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
      errors[name]
        ? "border-rose-400 focus:ring-rose-500/10"
        : "border-slate-200 focus:ring-primary/10 focus:border-primary"
    }`;

  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">
        {errors[name]}
      </p>
    ) : null;

  const Label = ({
    children,
    required,
  }: {
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
        {icon}
        {title}
      </h3>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      {/* Sticky Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/audios")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Volume2 size={22} className="text-primary" />
                {isEditMode ? t("audios.editAudio") : t("audios.addAudio")}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEditMode
                  ? t("audios.editSubtitle")
                  : t("audios.createSubtitle")}
              </p>
            </div>
          </div>

          {/* Navigate to Add Video Post */}
          <button
            type="button"
            onClick={() => navigate("/admin/add-post?type=video")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            <Video size={14} />
            {t("audios.addVideoPost")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="max-w-7xl mx-auto pb-12"
          noValidate
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Left column (main content) ─────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Audio Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<Volume2 size={14} className="text-primary" />}
                  title={t("audios.audioInfo")}
                />
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={errors.title ? "title" : undefined}
                  >
                    <Label required>{t("post.title")}</Label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder={t("post.titlePlaceholder") || t("post.title")}
                      className={fieldClass("title")}
                    />
                    <ErrorMsg name="title" />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>{t("post.slug")}</Label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug || ""}
                      onChange={handleChange}
                      placeholder={t("post.slugPlaceholder")}
                      className={fieldClass("slug")}
                    />
                    <p className="text-[10px] font-medium text-slate-400 ml-1">
                      {t("post.slugHint")}
                    </p>
                  </div>

                  {/* Audio URL */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={errors.audioUrl ? "audioUrl" : undefined}
                  >
                    <Label required>{t("audios.audioUrl")}</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="audioUrl"
                        value={formData.audioUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/audio.mp3"
                        className={iconFieldClass("audioUrl")}
                      />
                    </div>
                    <ErrorMsg name="audioUrl" />
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={errors.imageUrl ? "imageUrl" : undefined}
                  >
                    <Label>{t("audios.thumbnail")}</Label>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className={iconFieldClass("imageUrl")}
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content/Description */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={errors.content ? "content" : undefined}
                  >
                    <Label>{t("post.content")}</Label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={4}
                      placeholder={t("post.contentPlaceholder") || t("post.content")}
                      className={`${fieldClass("content")} resize-none`}
                    />
                    <ErrorMsg name="content" />
                  </div>
                </div>
              </div>

              {/* SEO & Discovery */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<FileText size={14} className="text-primary" />}
                  title={t("audios.seoSettings")}
                />
                <div className="p-6 space-y-5">
                  {/* Meta Description */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>{t("audios.metaDescription")}</Label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder={t("post.searchSummaryPlaceholder")}
                      className={`${fieldClass("metaDescription")} resize-none`}
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>{t("audios.metaKeywords")}</Label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords || ""}
                      onChange={handleChange}
                      placeholder={t("post.keywordsPlaceholder")}
                      className={fieldClass("metaKeywords")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column (sidebar) ─────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publishing Controls */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<Save size={14} className="text-primary" />}
                  title={t("audios.publishingControls")}
                />
                <div className="p-6 space-y-4">
                  {/* Status */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>{t("formLabels.status")}</Label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium appearance-none"
                    >
                      <option value="Published">{t("common.published")}</option>
                      <option value="Draft">{t("common.draft")}</option>
                    </select>
                  </div>

                  {/* Save */}
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {saveMutation.isPending
                      ? t("common.saving")
                      : t("common.save")}
                  </button>

                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={() => navigate("/admin/audios")}
                    className="w-full px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>

              {/* Settings (Language & Category) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<Settings size={14} className="text-primary" />}
                  title={t("audios.settings")}
                />
                <div className="p-6 space-y-5">
                  {/* Language */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={errors.language ? "language" : undefined}
                  >
                    <Label required>{t("post.language")}</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className={`${iconFieldClass("language")} appearance-none`}
                      >
                        <option value="English">{t("formLabels.english")}</option>
                        <option value="Arabic">{t("formLabels.arabic")}</option>
                      </select>
                    </div>
                    <ErrorMsg name="language" />
                  </div>

                  {/* Category */}
                  <div
                    className="space-y-1.5 flex flex-col"
                    data-error-field={
                      errors.categoryId ? "categoryId" : undefined
                    }
                  >
                    <Label required>{t("post.category")}</Label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      disabled={isEditMode}
                      className={`${fieldClass("categoryId")} appearance-none disabled:opacity-70`}
                    >
                      <option value="">{t("post.selectCategory")}</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.language})
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="categoryId" />
                  </div>
                </div>
              </div>

              {/* Content Meta */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<Activity size={14} className="text-primary" />}
                  title={t("audios.contentMeta")}
                />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Eye size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                        {t("reels.visibility")}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                      {t("reels.public")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visibility Flags */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader
                  icon={<Star size={14} className="text-primary" />}
                  title={t("audios.visibilityFlags")}
                />
                <div className="p-6 space-y-3">
                  {(
                    [
                      {
                        name: "addToFeatured",
                        icon: Star,
                        label: t("formLabels.addToFeatured"),
                        color: "amber",
                      },
                      {
                        name: "addToSlider",
                        icon: Layers,
                        label: t("formLabels.addToSlider"),
                        color: "blue",
                      },
                      {
                        name: "addToBreaking",
                        icon: AlertCircle,
                        label: t("formLabels.addToBreaking"),
                        color: "rose",
                      },
                      {
                        name: "addToRecommended",
                        icon: Megaphone,
                        label: t("formLabels.addToRecommended"),
                        color: "violet",
                      },
                    ] as const
                  ).map(({ name, icon: Icon, label, color }) => {
                    const active = !!formData[name];
                    return (
                      <label
                        key={name}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                          active
                            ? `bg-${color}-50 border-${color}-200`
                            : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            active
                              ? `bg-${color}-100 text-${color}-600`
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span
                          className={`text-xs font-bold flex-1 uppercase tracking-tight transition-colors ${
                            active ? `text-${color}-700` : "text-slate-600"
                          }`}
                        >
                          {label}
                        </span>
                        <input
                          type="checkbox"
                          name={name}
                          checked={active}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}