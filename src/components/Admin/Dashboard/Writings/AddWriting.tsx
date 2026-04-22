import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Layout, Settings, ChevronRight, Eye, PenLine } from "lucide-react";

import { apiClient, getAuthToken } from "@/api/client";
import { authApi } from "@/api/auth.api";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/components/Toast/ToastContainer";
import { usePostReducer } from "../DashboardAddPost/DashboardForm/usePostReducer/usePostReducer";
import type { ArticleInitialStateInterface } from "../DashboardAddPost/DashboardForm/usePostReducer/postData";
import type { TagInterface } from "../DashboardAddPost/DashboardForm/PostDetailsForm";

import PostDetailsForm from "../DashboardAddPost/DashboardForm/PostDetailsForm";
import ContentEditor from "../DashboardAddPost/DashboardForm/ContentEditor";
import AdvancedOptionsTab from "../DashboardAddPost/DashboardForm/AdvancedOptionsTab";
import PublishSection from "../DashboardAddPost/DashboardForm/PublishSection";
import ArticlePreviewModal from "../DashboardAddPost/Preview/ArticlePreviewModal";
import ArticlePreview from "../DashboardAddPost/Preview/ArticlePreview";
import { useDebouncedValue } from "../DashboardAddPost/Preview/useDebouncedValue";
import WriterSelect from "./WriterSelect";
import type { Writer } from "@/api/writers.api";
import ArticleImageFallback from "@/components/Common/ArticleImageFallback";

import {
  clearFieldErrorByName,
  getValidationToastMessage,
  normalizeErrorMap,
  type FieldErrors,
  useFormErrorNavigation,
} from "../DashboardAddPost/DashboardForm/formErrorUtils";

interface TagResponse {
  data: { items: TagInterface[] };
}

export default function AddWriting() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const token = getAuthToken();

  const [state, dispatch] = usePostReducer("article");
  const [writerId, setWriterId] = useState<string | null>(null);
  const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "advanced">("main");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Auth guard
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const { data: tags, isLoading: isLoadingTags } = useQuery<TagResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await apiClient.get<{ items: TagInterface[] }>("/tags");
      // Normalise: backend may return { items: [] } directly or wrapped in { data: { items: [] } }
      return { data: { items: (res.data as any)?.items ?? (res.data as any)?.data?.items ?? [] } };
    },
  });

  const { data: categories } = useCategories();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getUserProfile,
  });

  // Auto-assign the category behind the scenes for the Writings endpoint
  useEffect(() => {
    if (categories?.data && !state.categoryId) {
      const writingsCat = categories.data.find(
        (c: any) => c.slug === "writings" || c.name === "كتابات" || c.slug === "writers" || c.name === "مقالات"
      ) || categories.data[0];
      
      if (writingsCat) {
        dispatch({ type: "set-field", field: "categoryId", payload: writingsCat.id });
      }
    }
  }, [categories?.data, state.categoryId, dispatch]);

  type CustomChangeEvent =
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    | { target: { name: string; value: string | string[] | any; type: string; checked?: boolean } };

  function handleChange(e: CustomChangeEvent, newTags?: string[]) {
    const { type, value, name } = e.target;
    let payload: string | boolean | string[] | object[] | undefined = value;
    if ("checked" in e.target && type === "checkbox") payload = e.target.checked;
    else if (type === "radio" && (value === "true" || value === "false")) payload = value === "true";
    else if ((name === "tagIds" || name === "tags") && newTags) payload = newTags;
    dispatch({ type: "set-field", field: name, payload });
    setFieldErrors((prev) => clearFieldErrorByName(prev, name));
  }

  const validate = () => {
    const errors: FieldErrors = {};
    const s = state as ArticleInitialStateInterface;
    if (!s.title?.trim()) errors.title = [t("validation.titleRequired")];
    if (!s.content?.trim()) errors.content = [t("validation.contentRequired")];
    if (!state.categoryId) errors.categoryId = [t("validation.categoryRequired")];
    if (!writerId) errors.writerId = [t("validation.writerRequired")];
    return errors;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const errors = validate();
      if (Object.keys(errors).length > 0) {
        const validationError = new Error("CLIENT_VALIDATION_ERROR") as Error & {
          validationErrors?: FieldErrors;
        };
        validationError.validationErrors = errors;
        throw validationError;
      }

      let payload: any = JSON.parse(JSON.stringify(state));
      const categoryId = payload.categoryId;
      if (!categoryId) throw new Error("categoryId missing");

      // Inject writer fields
      payload.writerId = writerId;
      payload.hasWriter = true;
      if (!payload.authorId && userProfile?.id) {
        payload.authorId = userProfile.id;
      }

      // Writings do not support homepage placement flags.
      delete payload.addToSlider;
      delete payload.addToFeatured;
      delete payload.addToBreaking;
      delete payload.addToRecommended;
      delete payload.isSlider;
      delete payload.isFeatured;
      delete payload.isBreaking;
      delete payload.isRecommended;

      // Sanitize
      if (payload.imageUrl === null || payload.imageUrl === undefined) payload.imageUrl = "";
      if (payload.metaDescription === null || payload.metaDescription === undefined) payload.metaDescription = "";
      if (payload.metaKeywords === null || payload.metaKeywords === undefined) payload.metaKeywords = "";
      if (payload.additionalImageUrls) {
        payload.additionalImageUrls = payload.additionalImageUrls.filter((url: string) => url?.trim());
        if (payload.additionalImageUrls.length === 0) payload.additionalImageUrls = null;
      }
      if (payload.tagIds) {
        payload.tagIds = payload.tagIds.filter((id: string) => id?.trim());
        if (payload.tagIds.length === 0) delete payload.tagIds;
      }

      const response = await apiClient.post(`/posts/categories/${categoryId}/articles`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      const msg = data?.message || data?.title || "تم إنشاء الكتابة بنجاح";
      setFieldErrors({});
      toast.success(String(msg));
      navigate("/admin/writings");
    },
    onError: (error: Error & { validationErrors?: FieldErrors } & Record<string, any>) => {
      if (error.message === "CLIENT_VALIDATION_ERROR") {
        const clientErrors = error.validationErrors ?? {};
        if (Object.keys(clientErrors).length > 0) {
          setFieldErrors(clientErrors);
          toast.error(getValidationToastMessage(t, clientErrors));
          return;
        }
        toast.error(t("validation.formHasErrors"));
        return;
      }

      let message = t("errors.failedToCreatePost");
      let serverErrors: FieldErrors = {};

      if (axios.isAxiosError(error)) {
        const d = error.response?.data;
        const status = error.response?.status;
        
        if (status === 401) { 
          toast.error(t("common.sessionExpired")); 
          navigate("/login"); 
          return; 
        }
        
        if (status === 422 && d?.errors) {
          if (typeof d.errors === 'object') {
            serverErrors = normalizeErrorMap(d.errors as Record<string, unknown>);
            message = getValidationToastMessage(t, serverErrors);
          }
        } else {
          message = d?.title || d?.message || error.message;
        }
      } else {
        message = error.message;
      }

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      }
      toast.error(message);
    },
  });

  const tabByField = useMemo<Partial<Record<string, "main" | "advanced">>>(
    () => ({
      title: "main",
      content: "main",
      language: "main",
      slug: "advanced",
      optionalURL: "advanced",
      tagIds: "advanced",
      tags: "advanced",
      metaDescription: "advanced",
      metaKeywords: "advanced",
      additionalImageUrls: "advanced",
      fileUrls: "advanced",
    }),
    [],
  );

  useFormErrorNavigation({
    activeTab,
    fieldErrors,
    setActiveTab,
    tabByField,
  });

  const selectedCategory = useMemo(() => {
    const list = categories?.data ?? [];
    return list.find((c: any) => c.id === (state as any)?.categoryId) ?? null;
  }, [categories?.data, (state as any)?.categoryId]);

  const debouncedTitle = useDebouncedValue(String((state as any)?.title ?? ""), 150);
  const debouncedContent = useDebouncedValue(String((state as any)?.content ?? ""), 250);
  const debouncedImageUrl = useDebouncedValue(String((state as any)?.imageUrl ?? ""), 150);

  const previewModel = useMemo(() => {
    const language = String((state as any)?.language ?? "Arabic");
    const dir = (language === "Arabic" ? "rtl" : "ltr") as "rtl" | "ltr";
    const publishedAtLabel = new Date().toLocaleDateString(language === "Arabic" ? "ar-EG" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    return {
      dir, title: debouncedTitle.trim() || t("post.title"),
      categoryName: selectedCategory?.name || t("formLabels.selectCategory"),
      authorName: userProfile?.userName,
      authorImageUrl: userProfile?.avatarImageUrl ?? null,
      publishedAtLabel, imageUrl: debouncedImageUrl,
      imageAlt: Array.isArray((state as any)?.imageDescription)
        ? undefined
        : String((state as any)?.imageDescription ?? ""),
      contentHtml: debouncedContent || "",
    };
  }, [debouncedContent, debouncedImageUrl, debouncedTitle, selectedCategory?.name, state, t, userProfile]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/writings")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-200/50"
            >
              <ChevronRight size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <PenLine size={18} className="text-primary" />
                <h1 className="text-lg font-black text-slate-900 tracking-tight">إضافة كتابة</h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10 tracking-widest uppercase">
                  Article · Writer
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/50 bg-white text-slate-700 hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <Eye size={14} className="text-primary" />
              {t("post.preview")}
            </button>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setActiveTab("main")}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "main"
                    ? "bg-white text-slate-900 shadow-lg border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Layout size={14} className={activeTab === "main" ? "text-primary" : ""} />
                {t("post.mainOptions")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("advanced")}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "advanced"
                    ? "bg-white text-slate-900 shadow-lg border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Settings size={14} className={activeTab === "advanced" ? "text-primary" : ""} />
                {t("post.advancedOptions")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ArticlePreviewModal
        isOpen={isPreviewOpen}
        isFullscreen={isPreviewFullscreen}
        onClose={() => { setIsPreviewOpen(false); setIsPreviewFullscreen(false); }}
        onToggleFullscreen={() => setIsPreviewFullscreen((v) => !v)}
        onPublish={() => mutation.mutate()}
        publishDisabled={mutation.isPending}
      >
        <ArticlePreview model={previewModel} />
      </ArticlePreviewModal>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          className="max-w-7xl mx-auto"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {fieldErrors.categoryId && (
                <div data-error-field="categoryId" className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">
                  {fieldErrors.categoryId[0]}
                </div>
              )}
              {activeTab === "main" ? (
                <>
                  <PostDetailsForm
                    type="article"
                    state={state as ArticleInitialStateInterface}
                    handleChange={handleChange}
                    fieldErrors={fieldErrors}
                    hidePublishingFlags
                  />
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                    <ContentEditor
                      state={state as ArticleInitialStateInterface}
                      handleChange={handleChange}
                      errors={fieldErrors}
                    />
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <AdvancedOptionsTab
                    type="article"
                    state={state as ArticleInitialStateInterface}
                    handleChange={handleChange}
                    tags={tags?.data.items ?? []}
                    isLoading={isLoadingTags}
                    fieldErrors={fieldErrors}
                  />
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Writer Select — required, at top of sidebar */}
              <div data-error-field="writerId" className="relative rounded-[2rem]">
                <WriterSelect
                  value={writerId}
                  onChange={(value) => {
                    setWriterId(value);
                    setFieldErrors((prev) => clearFieldErrorByName(prev, "writerId"));
                  }}
                  onSelectWriter={setSelectedWriter}
                  error={fieldErrors.writerId}
                />
              </div>

              {/* Writer image preview — replaces ImageUpload for writings */}
              <ArticleImageFallback
                writerImageUrl={selectedWriter?.imageUrl ?? null}
                writerName={selectedWriter?.name}
                className="w-full rounded-[2rem] shadow-sm border border-slate-200"
                style={{ aspectRatio: '4/3', minHeight: 180 } as React.CSSProperties}
              />

              <PublishSection
                mutation={mutation}
                state={state}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
