import { useLocation, useNavigate } from "react-router-dom";
import FormHeader from "./FormHeader";
import PostDetailsForm, { type TagInterface } from "./PostDetailsForm";
import ContentEditor from "./ContentEditor";
import ReelForm from "./ReelForm";
import AdvancedOptionsTab from "./AdvancedOptionsTab";
import { authApi } from "@/api/auth.api";

import CategorySelect from "./CategorySelect";
import PublishSection from "./PublishSection";
import ReelPublishSection from "./ReelPublishSection";
import ImageUpload from "./ImageUpload";
import MediaUploadComponent from "./MediaUploadComponent";
import { useEffect, type ChangeEvent, useMemo, useState } from "react";
import axios from "axios";
import { apiClient, getAuthToken } from "@/api/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePostReducer } from "./usePostReducer/usePostReducer";
import type {
  ArticleInitialStateInterface,
  ReelInitialStateInterface,
} from "./usePostReducer/postData";
import { postConfig } from "./usePostReducer/postConfig";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast/ToastContainer";
import { Layout, Settings, ChevronLeft, Eye } from "lucide-react";
import ArticlePreviewModal from "../Preview/ArticlePreviewModal";
import ArticlePreview from "../Preview/ArticlePreview";
import { useDebouncedValue } from "../Preview/useDebouncedValue";
import {
  clearFieldErrorByName,
  getValidationToastMessage,
  normalizeErrorMap,
  type FieldErrors,
  useFormErrorNavigation,
} from "./formErrorUtils";

interface TagResponse {
  data: {
    items: TagInterface[];
  };
}

export default function DashboardForm() {
  const { t } = useTranslation();
  const toast = useToast();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const navigate = useNavigate();
  const [state, dispatch] = usePostReducer(type);
  const token = getAuthToken();
  const [activeTab, setActiveTab] = useState<'main' | 'advanced'>('main');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  useEffect(() => {
    if (!type) {
      navigate("/admin/post-format");
    }
  }, [type, navigate]);

  // Check authorization
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  type CustomChangeEvent =
    | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    | {
      target: {
        name: string;
        value: string | string[] | any;
        type: string;
        checked?: boolean;
      };
    };

  function handleChange(e: CustomChangeEvent, newTags?: string[]) {
    const { type, value, name } = e.target;
    let payload: string | boolean | string[] | object[] | undefined = value;

    if ("checked" in e.target && type === "checkbox") {
      payload = e.target.checked;
    } else if (type === "radio" && (value === "true" || value === "false")) {
      payload = value === "true";
    } else if ((name === "tagIds" || name === "tags") && newTags) {
      payload = newTags;
    }
    dispatch({ type: "set-field", field: name, payload });
    setFieldErrors((prev) => clearFieldErrorByName(prev, name));
  }

  async function fetchTags() {
    return await apiClient.get(`/tags`);
  }

  const { data: tags, isLoading: isLoadingTags } = useQuery<TagResponse>({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getUserProfile,
  });

  // Validation function for article/audio forms
  const validateArticleForm = (payload: any, postType: string | null): FieldErrors => {
    const errors: FieldErrors = {};
    
    if (!payload.title || payload.title.trim() === '') {
      errors.title = [t('validation.titleRequired')];
    }
    
    // Content is required only for article/video types, not audio
    if (postType === 'article' && (!payload.content || payload.content.trim() === '')) {
      errors.content = [t('validation.contentRequired')];
    }
    
    if (!payload.categoryId) {
      errors.categoryId = [t('validation.categoryRequired')];
    }
    
    if (!payload.language) {
      errors.language = [t('validation.languageRequired')];
    }

    // Audio URL is required for audio type
    if (postType === 'audio' && !payload.audioUrl) {
      errors.audioUrl = [t('validation.audioUrlRequired')];
    }
    
    return errors;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let payload: any = JSON.parse(JSON.stringify(state)); // Deep clone to avoid mutation
      if (!type) throw new Error("Post type is required");

      const config = postConfig[type as keyof typeof postConfig];
      if (!config) throw new Error(`Unknown post type: ${type}`);

      // For reels, we don't need categoryId - post directly to /reels
      if (type === "reel") {
        if (!payload.authorId && userProfile?.id) {
          payload = { ...payload, authorId: userProfile.id };
        }
        const response = await apiClient.post("/reels", payload);
        return response.data;
      }

      // Client-side validation for articles and audio
      if (type === "article" || type === "audio") {
        if (!payload.authorId && userProfile?.id) {
          payload.authorId = userProfile.id;
        }

        const validationErrors = validateArticleForm(payload, type);
        if (Object.keys(validationErrors).length > 0) {
          const validationError = new Error("CLIENT_VALIDATION_ERROR") as Error & {
            validationErrors?: FieldErrors;
          };
          validationError.validationErrors = validationErrors;
          throw validationError;
        }
        
        if (payload.imageUrl === null || payload.imageUrl === undefined) payload.imageUrl = "";
        if (payload.metaDescription === null || payload.metaDescription === undefined) payload.metaDescription = "";
        if (payload.metaKeywords === null || payload.metaKeywords === undefined) payload.metaKeywords = "";
      }

      const categoryId = payload.categoryId;
      if (!categoryId) {
        const validationError = new Error("CLIENT_VALIDATION_ERROR") as Error & {
          validationErrors?: FieldErrors;
        };
        validationError.validationErrors = {
          categoryId: [t("validation.categoryRequired")],
        };
        throw validationError;
      }

      if (type === "audio" && !payload.audioUrl && !payload.audioFileUrls?.length) {
        throw new Error("Audio source missing");
      }

      const endpoint = config.endpoint;

      if (type === "audio" && "imageUrl" in payload) {
        payload.thumbnailUrl = payload.imageUrl || null;
      }

      if (payload.additionalImageUrls) {
        payload.additionalImageUrls = payload.additionalImageUrls.filter((url: string) => url && url.trim() !== '');
        if (payload.additionalImageUrls.length === 0) payload.additionalImageUrls = null;
      }

      if (payload.tagIds) {
        payload.tagIds = payload.tagIds.filter((id: string) => id && id.trim() !== '');
        if (payload.tagIds.length === 0) delete payload.tagIds;
      }

      const response = await apiClient.post(
        `/posts/categories/${categoryId}/${endpoint}`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      const msg = (data && (data.message || data.title)) ?? 
        (type === "article" ? t('success.articleCreated') : t('post.postCreatedSuccessfully'));
      setFieldErrors({});
      toast.success(String(msg));
      navigate('/admin/posts/all');
    },
    onError: (error: Error & { validationErrors?: FieldErrors } & Record<string, any>) => {
      console.error("Post creation error:", error);
      
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

      let message = t('errors.failedToCreatePost');
      let serverErrors: FieldErrors = {};

      if (axios.isAxiosError(error)) {
        const d = error.response?.data;
        const status = error.response?.status;

        if (status === 401) {
          toast.error(t('common.sessionExpired'));
          navigate('/login');
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
      audioUrl: "main",
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
    activeTab: type === "reel" ? undefined : activeTab,
    fieldErrors,
    setActiveTab: type === "reel" ? undefined : setActiveTab,
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      dir,
      title: debouncedTitle.trim() || t("post.title"),
      categoryName: selectedCategory?.name || t("formLabels.selectCategory"),
      authorName: userProfile?.userName,
      authorImageUrl: userProfile?.avatarImageUrl ?? null,
      publishedAtLabel,
      imageUrl: debouncedImageUrl,
      imageAlt: Array.isArray((state as any)?.imageDescription)
        ? undefined
        : String((state as any)?.imageDescription ?? ""),
      contentHtml: debouncedContent || "",
    };
  }, [debouncedContent, debouncedImageUrl, debouncedTitle, selectedCategory?.name, state, t, userProfile?.avatarImageUrl, userProfile?.userName]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      {/* Header Area */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-200/50"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <FormHeader type={type} />
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10 tracking-widest uppercase">
                  {type || 'Article'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Content Studio
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {type === "article" && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/50 bg-white text-slate-700 hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest shadow-sm"
              >
                <Eye size={14} className="text-primary" />
                {t("post.preview")}
              </button>
            )}

            {/* Tab Switcher */}
            {type !== "reel" && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('main')}
                  className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'main' 
                      ? 'bg-white text-slate-900 shadow-lg border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layout size={14} className={activeTab === 'main' ? 'text-primary' : ''} />
                  {t('post.mainOptions')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('advanced')}
                  className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'advanced' 
                      ? 'bg-white text-slate-900 shadow-lg border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Settings size={14} className={activeTab === 'advanced' ? 'text-primary' : ''} />
                  {t('post.advancedOptions')}
                </button>
              </div>
            )}
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
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Dynamic Content based on Tabs */}
            <div className="lg:col-span-8 space-y-6">
              {type === "reel" ? (
                <ReelForm
                  state={state as ReelInitialStateInterface}
                  handleChange={handleChange}
                  fieldErrors={fieldErrors}
                  tags={tags?.data.items ?? []}
                  isLoading={isLoadingTags}
                />
              ) : activeTab === 'main' ? (
                <>
                  <PostDetailsForm
                    type={type}
                    state={state}
                    handleChange={handleChange}
                    fieldErrors={fieldErrors}
                  />
                  {type === 'audio' ? (
                    // ── Audio: show media uploader + description textarea ──
                    <>
                      <MediaUploadComponent
                        mediaType="audio"
                        fieldErrors={fieldErrors}
                        onMediaSelect={(media) => {
                          handleChange({
                            target: { name: "audioUrl", value: media.url, type: "text" },
                          } as never);
                        }}
                      />
                      {/* Optional description for audio */}
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 mb-3">
                          {t('post.description')}
                        </label>
                        <textarea
                          name="content"
                          rows={4}
                          value={(state as any).content ?? ''}
                          onChange={handleChange as any}
                          placeholder={t('post.contentPlaceholder') || ''}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    // ── Article/Video: TinyMCE rich editor ──
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                      <ContentEditor
                        state={state as ArticleInitialStateInterface}
                        handleChange={handleChange}
                        errors={fieldErrors}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <AdvancedOptionsTab
                    type={type}
                    state={state as ArticleInitialStateInterface}
                    handleChange={handleChange}
                    tags={tags?.data.items ?? []}
                    isLoading={isLoadingTags}
                    fieldErrors={fieldErrors}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Sidebar Settings (Persistent) */}
            <div className="lg:col-span-4 space-y-6">
              {type !== "reel" && (
                <>
                  <CategorySelect
                    handleChange={handleChange}
                    categories={categories?.data ?? []}
                    isLoading={isLoadingCategories}
                    value={state.categoryId}
                    errors={fieldErrors}
                    language={state.language}
                  />
                  <ImageUpload
                    state={state}
                    handleChange={handleChange}
                    type={type}
                    fieldErrors={fieldErrors}
                  />
                </>
              )}
              
              {type === "reel" ? (
                <ReelPublishSection mutation={mutation} />
              ) : (
                <PublishSection
                  mutation={mutation}
                  state={state}
                  handleChange={handleChange}
                  fieldErrors={fieldErrors}
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
