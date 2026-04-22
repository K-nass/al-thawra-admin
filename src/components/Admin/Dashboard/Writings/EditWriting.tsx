import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Layout,
  Settings,
  ChevronRight,
  Eye,
  PenLine,
  Loader2,
} from "lucide-react";

import { apiClient, getAuthToken } from "@/api/client";
import { postsApi } from "@/api";
import { authApi } from "@/api/auth.api";
import { writersApi } from "@/api/writers.api";
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

const API_TO_STATE_MAP: Record<string, string> = {
  isSlider: "addToSlider",
  isFeatured: "addToFeatured",
  isBreaking: "addToBreaking",
  isRecommended: "addToRecommended",
  image: "imageUrl",
};

const getFirstNonEmptyString = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
};

export default function EditWriting() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams<{ postId: string }>();
  const token = getAuthToken();

  const [state, dispatch] = usePostReducer("article");
  const [writerId, setWriterId] = useState<string | null>(null);
  const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "advanced">("main");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  const dispatchField = (key: string, value: unknown) => {
    const stateKey = API_TO_STATE_MAP[key] ?? key;
    dispatch({
      type: "set-field",
      field: stateKey,
      payload: value as string | boolean | string[] | object[] | undefined,
    });
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const { data: tags, isLoading: isLoadingTags } = useQuery<TagResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await apiClient.get<{ items: TagInterface[] }>("/tags");
      return {
        data: {
          items: (res.data as any)?.items ?? (res.data as any)?.data?.items ?? [],
        },
      };
    },
  });

  const { data: categories } = useCategories();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getUserProfile,
  });

  useEffect(() => {
    if (categories?.data && !state.categoryId) {
      const writingsCat =
        categories.data.find(
          (c: any) =>
            c.slug === "writings" ||
            c.name === "كتابات" ||
            c.slug === "writers" ||
            c.name === "مقالات",
        ) || categories.data[0];

      if (writingsCat) {
        dispatch({ type: "set-field", field: "categoryId", payload: writingsCat.id });
      }
    }
  }, [categories?.data, state.categoryId, dispatch]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setIsLoadingPost(true);

        const { categorySlug, slug, post: statePost } = (location.state as any) || {};

        if (statePost) {
          Object.entries(statePost as Record<string, unknown>).forEach(([key, value]) => {
            dispatchField(key, value);
          });
        }

        let postData: any;
        if (categorySlug && slug) {
          postData = await postsApi.getPostBySlug(categorySlug, slug, "article");
        } else {
          postData = await postsApi.getById(postId);
        }

        Object.entries(postData as Record<string, unknown>).forEach(([key, value]) => {
          dispatchField(key, value);
        });

        dispatch({
          type: "set-field",
          field: "addToBreaking",
          payload: false,
        });

        const resolvedWriterId = postData?.writerId || (statePost as any)?.writerId || null;
        const resolvedWriterName =
          getFirstNonEmptyString(
            postData?.writerName,
            postData?.authorName,
            (statePost as any)?.writerName,
            (statePost as any)?.authorName,
          ) ?? "";
        const resolvedWriterImage = getFirstNonEmptyString(
          postData?.writerImageUrl,
          postData?.authorImageUrl,
          postData?.authorImage,
          (statePost as any)?.writerImageUrl,
          (statePost as any)?.authorImageUrl,
          (statePost as any)?.authorImage,
        );
        setWriterId(resolvedWriterId);

        if (resolvedWriterId) {
          setSelectedWriter({
            id: resolvedWriterId,
            name: resolvedWriterName,
            imageUrl: resolvedWriterImage,
            bio: null,
            birthDate: "",
            dateOfDeath: null,
          });
        }
      } catch (error) {
        toast.error(t("error.failedToLoadPost"));
        navigate("/admin/writings");
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId, location.state, navigate, t, toast]);

  useEffect(() => {
    if (!writerId) return;
    if (selectedWriter?.imageUrl) return;

    let ignore = false;

    writersApi
      .getById(writerId)
      .then((writer) => {
        if (ignore) return;
        setSelectedWriter((prev) => ({
          id: writer.id || writerId,
          name: writer.name || prev?.name || "",
          imageUrl: writer.imageUrl ?? prev?.imageUrl ?? null,
          bio: writer.bio ?? prev?.bio ?? null,
          birthDate: writer.birthDate || prev?.birthDate || "",
          dateOfDeath: writer.dateOfDeath ?? prev?.dateOfDeath ?? null,
        }));
      })
      .catch(() => {
        // Keep current fallback UI if writer details cannot be loaded.
      });

    return () => {
      ignore = true;
    };
  }, [writerId, selectedWriter?.imageUrl]);

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
      if (!postId) throw new Error("Post ID is required");

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

      payload.articleId = postId;
      payload.writerId = writerId;
      payload.hasWriter = true;
      if (!payload.authorId && userProfile?.id) {
        payload.authorId = userProfile.id;
      }

      if (payload.addToSlider !== undefined) {
        payload.isSlider = payload.addToSlider;
        delete payload.addToSlider;
      }
      if (payload.addToFeatured !== undefined) {
        payload.isFeatured = payload.addToFeatured;
        delete payload.addToFeatured;
      }
      if (payload.addToRecommended !== undefined) {
        payload.isRecommended = payload.addToRecommended;
        delete payload.addToRecommended;
      }

      payload.isBreaking = false;
      delete payload.addToBreaking;
      delete payload.isUrgent;
      delete payload.addToUrgent;

      if (payload.summary !== undefined) payload.description = payload.summary;
      delete payload.summary;

      if (payload.optionalURL !== undefined) {
        payload.optionalUrl = payload.optionalURL;
        delete payload.optionalURL;
      }

      const readOnlyFields = [
        "id",
        "createdAt",
        "updatedAt",
        "createdBy",
        "publishedAt",
        "authorName",
        "authorImage",
        "ownerIsAuthor",
        "categoryName",
        "categorySlug",
        "tags",
        "likedByUsers",
        "viewsCount",
        "likesCount",
        "isLikedByCurrentUser",
        "postType",
        "image",
        "additionalImages",
      ];
      readOnlyFields.forEach((f) => delete payload[f]);

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

      return await postsApi.updatePost(categoryId, postId, "article", payload);
    },
    onSuccess: (data) => {
      const msg = data?.message || data?.title || "تم تحديث الكتابة بنجاح";
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

      let message = t("error.failedToUpdatePost");
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
          if (typeof d.errors === "object") {
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
      writerId: "main",
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      dir,
      title: debouncedTitle.trim() || t("post.title"),
      categoryName: selectedCategory?.name || t("formLabels.selectCategory"),
      authorName: selectedWriter?.name || userProfile?.userName,
      authorImageUrl: selectedWriter?.imageUrl ?? userProfile?.avatarImageUrl ?? null,
      publishedAtLabel,
      imageUrl: debouncedImageUrl,
      imageAlt: Array.isArray((state as any)?.imageDescription)
        ? undefined
        : String((state as any)?.imageDescription ?? ""),
      contentHtml: debouncedContent || "",
    };
  }, [
    debouncedContent,
    debouncedImageUrl,
    debouncedTitle,
    selectedCategory?.name,
    selectedWriter?.imageUrl,
    selectedWriter?.name,
    state,
    t,
    userProfile,
  ]);

  if (isLoadingPost) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {t("post.loadingFormData")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
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
                <h1 className="text-lg font-black text-slate-900 tracking-tight">تعديل كتابة</h1>
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
        onClose={() => {
          setIsPreviewOpen(false);
          setIsPreviewFullscreen(false);
        }}
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
            <div className="lg:col-span-8 space-y-6">
              {fieldErrors.categoryId && (
                <div
                  data-error-field="categoryId"
                  className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold"
                >
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
                    hideBreakingFlag
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

            <div className="lg:col-span-4 space-y-6">
              <div data-error-field="writerId" className="relative rounded-[2rem]">
                <WriterSelect
                  value={writerId}
                  preselectedWriter={selectedWriter}
                  onChange={(value) => {
                    setWriterId(value);
                    setFieldErrors((prev) => clearFieldErrorByName(prev, "writerId"));
                  }}
                  onSelectWriter={setSelectedWriter}
                  error={fieldErrors.writerId}
                />
              </div>

              <ArticleImageFallback
                writerImageUrl={selectedWriter?.imageUrl ?? null}
                writerName={selectedWriter?.name}
                className="w-full rounded-[2rem] shadow-sm border border-slate-200"
                style={{ aspectRatio: "4/3", minHeight: 180 } as React.CSSProperties}
              />

              <PublishSection
                mutation={mutation}
                isEditMode
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
