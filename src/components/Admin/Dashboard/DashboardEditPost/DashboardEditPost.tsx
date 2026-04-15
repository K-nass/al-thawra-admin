import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormHeader from "../DashboardAddPost/DashboardForm/FormHeader";
import PostDetailsForm, { type TagInterface } from "../DashboardAddPost/DashboardForm/PostDetailsForm";
import ContentEditor from "../DashboardAddPost/DashboardForm/ContentEditor";
import CategorySelect from "../DashboardAddPost/DashboardForm/CategorySelect";
import PublishSection from "../DashboardAddPost/DashboardForm/PublishSection";
import ImageUpload from "../DashboardAddPost/DashboardForm/ImageUpload";
import AdvancedOptionsTab from "../DashboardAddPost/DashboardForm/AdvancedOptionsTab";
import { useEffect, type ChangeEvent, useState } from "react";
import axios from "axios";
import { apiClient, getAuthToken } from "@/api/client";
import { postsApi } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePostReducer } from "../DashboardAddPost/DashboardForm/usePostReducer/usePostReducer";
import type {
  ArticleInitialStateInterface,
} from "../DashboardAddPost/DashboardForm/usePostReducer/postData";
import { postConfig } from "../DashboardAddPost/DashboardForm/usePostReducer/postConfig";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Common/Loader";
import { useToast } from "@/components/Toast/ToastContainer";
import { ChevronLeft, Layout, Settings, Loader2, Sparkles, Wand2 } from "lucide-react";

interface TagResponse {
  data: {
    items: TagInterface[];
  };
}

export default function DashboardEditPost() {
  const { t } = useTranslation();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const [state, dispatch] = usePostReducer(type);
  const token = getAuthToken();
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [activeTab, setActiveTab] = useState<'main' | 'advanced'>('main');

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

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setIsLoadingPost(true);

        // Get categorySlug and slug from location state
        const { categorySlug, slug } = location.state || {};

        let postData;

        // If we have categorySlug and slug, use the slug-based API
        if (categorySlug && slug && type) {
          postData = await postsApi.getPostBySlug(categorySlug, slug, type);
        } else {
          // Fallback to ID-based API
          postData = await postsApi.getById(postId);
        }

        // Populate form with existing data
        Object.entries(postData).forEach(([key, value]) => {
          dispatch({ type: "set-field", field: key, payload: value as string | boolean | string[] | object[] | undefined });
        });
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast.error(t("error.failedToLoadPost"));
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId, location.state, type]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
    } else if (name === "tagIds" && newTags) {
      payload = newTags;
    }

    dispatch({ type: "set-field", field: name, payload });
  }

  async function fetchTags() {
    return await apiClient.get(`/tags`);
  }

  const { data: tags, isLoading: isLoadingTags } = useQuery<TagResponse>({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post ID is required");

      let payload: any = JSON.parse(JSON.stringify(state));
      const categoryId = payload.categoryId;
      if (!categoryId) throw new Error("categoryId missing");
      if (!type) throw new Error("Post type is required");

      const config = postConfig[type as keyof typeof postConfig];
      if (!config) throw new Error(`Unknown post type: ${type}`);

      // Add the appropriate ID field based on post type
      if (type === 'article') payload.articleId = postId;
      else if (type === 'video') payload.videoId = postId;
      else if (type === 'audio') payload.audioId = postId;

      // Map frontend field names to API field names
      if (payload.addToBreaking !== undefined) {
        payload.isBreaking = payload.addToBreaking;
        delete payload.addToBreaking;
      }
      if (payload.addToFeatured !== undefined) {
        payload.isFeatured = payload.addToFeatured;
        delete payload.addToFeatured;
      }
      if (payload.addToSlider !== undefined) {
        payload.isSlider = payload.addToSlider;
        delete payload.addToSlider;
      }
      if (payload.addToRecommended !== undefined) {
        payload.isRecommended = payload.addToRecommended;
        delete payload.addToRecommended;
      }
      
      if (payload.summary !== undefined) payload.description = payload.summary;
      delete payload.summary;

      if (payload.optionalURL !== undefined) {
        payload.optionalUrl = payload.optionalURL;
        delete payload.optionalURL;
      }

      // Cleanup response-only fields
      const readOnlyFields = ['id', 'createdAt', 'updatedAt', 'createdBy', 'publishedAt', 'authorName', 'authorImage', 'ownerIsAuthor', 'categoryName', 'categorySlug', 'tags', 'likedByUsers', 'viewsCount', 'likesCount', 'isLikedByCurrentUser', 'postType', 'image', 'additionalImages'];
      readOnlyFields.forEach(f => delete payload[f]);

      if (type === "article" && payload.imageUrl === null) payload.imageUrl = "";
      if (!payload.metaDescription) payload.metaDescription = "";
      if (!payload.metaKeywords) payload.metaKeywords = "";
      
      payload.authorId = null; // System preference

      if (type === "video" && "imageUrl" in payload) payload.videoThumbnailUrl = payload.imageUrl || null;
      if (type === "audio" && "imageUrl" in payload) payload.thumbnailUrl = payload.imageUrl || null;

      const response = await postsApi.updatePost(categoryId, postId, type, payload);
      return response;
    },
    onSuccess: (data) => {
      const msg = (data && (data.message || data.title)) ?? t('success.articleUpdated');
      setFieldErrors({});
      toast.success(String(msg));
      setTimeout(() => navigate('/admin/posts/all'), 1500);
    },
    onError: (error: any) => {
      console.error("Post update error:", error);
      let message = t("error.failedToUpdatePost");
      const errors: Record<string, string[]> = {};

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
            Object.entries(d.errors).forEach(([field, messages]) => {
              errors[field.toLowerCase()] = Array.isArray(messages) ? messages : [String(messages)];
            });
            message = Object.values(errors).flat().join('\n') || t("error.validationErrors");
          }
        } else {
          message = d?.title || d?.message || error.message;
        }
      } else {
        message = error.message;
      }

      setFieldErrors(errors);
      toast.error(message);
    },
  });

  if (isLoadingPost) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface">
        <Loader2 size={48} className="text-primary animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t("post.loadingFormData")}</p>
      </div>
    );
  }

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
              <FormHeader type={type} isEditMode={true} />
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10 tracking-widest uppercase">
                  ID: {postId?.slice(-6)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Revision Mode
                </span>
              </div>
            </div>
          </div>
          
          {/* Tab Switcher */}
          {type !== "reel" && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === 'main' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layout size={14} className={activeTab === 'main' ? 'text-primary' : ''} />
                {t('post.mainOptions')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('advanced')}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === 'advanced' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
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

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          className="max-w-7xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          {activeTab === 'main' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-8 space-y-6">
                <PostDetailsForm
                  type={type}
                  state={state}
                  handleChange={handleChange}
                  fieldErrors={fieldErrors}
                />
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                   <ContentEditor
                     state={state as ArticleInitialStateInterface}
                     handleChange={handleChange}
                     errors={fieldErrors}
                   />
                </div>
              </div>

              {/* Right Column - Sidebar Settings */}
              <div className="lg:col-span-4 space-y-6">
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
                <PublishSection
                  mutation={mutation}
                  isEditMode={true}
                  state={state}
                  handleChange={handleChange}
                  fieldErrors={fieldErrors}
                />

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200 border-dashed text-center">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="text-primary w-6 h-6" />
                   </div>
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">{t("post.globalSync")}</h4>
                   <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                     {t("post.globalSyncDescription")}
                   </p>
                </div>
              </div>
            </div>
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
        </form>
      </div>
    </div>
  );
}
