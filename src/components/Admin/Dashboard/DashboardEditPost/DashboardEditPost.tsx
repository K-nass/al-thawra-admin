import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormHeader from "../DashboardAddPost/DashboardForm/FormHeader";
import PostDetailsForm, { type TagInterface } from "../DashboardAddPost/DashboardForm/PostDetailsForm";
import ContentEditor from "../DashboardAddPost/DashboardForm/ContentEditor";
import GalleryItems from "../DashboardAddPost/DashboardForm/GalleryItems";
import SortedListItems from "../DashboardAddPost/DashboardForm/SortedListItems";
import AdditionalImages from "../DashboardAddPost/DashboardForm/AdditionalImages";
import FileUpload from "../DashboardAddPost/DashboardForm/FileUpload";
import CategorySelect from "../DashboardAddPost/DashboardForm/CategorySelect";
import PublishSection from "../DashboardAddPost/DashboardForm/PublishSection";
import ImageUpload from "../DashboardAddPost/DashboardForm/ImageUpload";
import MediaUploadComponent from "../DashboardAddPost/DashboardForm/MediaUploadComponent";
import { useEffect, type ChangeEvent, useState } from "react";
import axios from "axios";
import { apiClient, getAuthToken } from "@/api/client";
import { postsApi } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import ApiNotification from "../../../Common/ApiNotification";
import { usePostReducer } from "../DashboardAddPost/DashboardForm/usePostReducer/usePostReducer";
import type {
  ArticleInitialStateInterface,
  GalleryInitialStateInterface,
  SortedListInitialStateInterface,
} from "../DashboardAddPost/DashboardForm/usePostReducer/postData";
import { postConfig } from "../DashboardAddPost/DashboardForm/usePostReducer/postConfig";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Common/Loader";

interface TagResponse {
  data: {
    items: TagInterface[];
  };
}

export default function DashboardEditPost() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const [state, dispatch] = usePostReducer(type);
  const token = getAuthToken();
  const [isLoadingPost, setIsLoadingPost] = useState(true);

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
          // Fallback to ID-based API (may not work for all post types)
          postData = await postsApi.getById(postId);
        }

        // Populate form with existing data
        Object.entries(postData).forEach(([key, value]) => {
          dispatch({ type: "set-field", field: key, payload: value as string | boolean | string[] | object[] | undefined });
        });
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setNotification({
          type: "error",
          message: "Failed to load post data"
        });
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId, location.state]);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
    // Handle items array (for gallery)
    else if (name === "items" && Array.isArray(value)) {
      payload = value;
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

      let payload: any = { ...state };
      const categoryId = payload.categoryId;
      if (!categoryId) throw new Error("categoryId missing");
      if (!type) throw new Error("Post type is required");

      const config = postConfig[type as keyof typeof postConfig];
      if (!config) throw new Error(`Unknown post type: ${type}`);

      // Add the appropriate ID field based on post type
      if (type === 'article') {
        payload.articleId = postId;
      } else if (type === 'gallery') {
        payload.galleryId = postId;
      } else if (type === 'video') {
        payload.videoId = postId;
      } else if (type === 'audio') {
        payload.audioId = postId;
      } else if (type === 'sorted-list') {
        payload.sortedListId = postId;
      }

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
      // Handle description field - map from summary if exists, otherwise keep description
      if (payload.summary !== undefined) {
        payload.description = payload.summary;
      }
      delete payload.summary;

      // Handle optionalURL vs optionalUrl (case sensitivity)
      if (payload.optionalURL !== undefined) {
        payload.optionalUrl = payload.optionalURL;
        delete payload.optionalURL;
      }

      // Remove fields that shouldn't be sent to the API (read-only response fields)
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.publishedAt;
      delete payload.authorName;
      delete payload.authorImage;
      delete payload.ownerIsAuthor;
      delete payload.categoryName;
      delete payload.categorySlug;
      delete payload.tags;
      delete payload.likedByUsers;
      delete payload.viewsCount;
      delete payload.likesCount;
      delete payload.isLikedByCurrentUser;
      delete payload.postType;
      delete payload.image; // Response field, not request field
      delete payload.additionalImages; // Response field, not request field
      delete payload.summary; // Already mapped to description

      // Client-side validation for articles - imageUrl cannot be null
      if (type === "article" && payload.imageUrl === null) {
        payload.imageUrl = "";
      }

      // Handle imageDescription - API expects null or string, not array
      if (payload.imageDescription && Array.isArray(payload.imageDescription)) {
        payload.imageDescription = payload.imageDescription.length > 0 ? payload.imageDescription[0] : null;
      }
      if (payload.imageDescription === "") {
        payload.imageDescription = null;
      }

      // Ensure required string fields are not empty strings
      // Note: metaDescription and metaKeywords are REQUIRED by the API
      if (payload.slug === "") {
        payload.slug = null;
      }
      // Don't set these to null - they're required fields
      // if (payload.metaDescription === "") {
      //   payload.metaDescription = null;
      // }
      // if (payload.metaKeywords === "") {
      //   payload.metaKeywords = null;
      // }
      if (payload.description === "") {
        payload.description = "";
      }
      if (payload.content === "") {
        payload.content = "";
      }

      // Handle authorId - set to null to use current user as author
      // This prevents 403 errors when the authorId doesn't have the Author role
      payload.authorId = null;

      // Client-side validation for video posts
      const hasVideoUrl = payload.videoUrl && payload.videoUrl.trim() !== '';
      const hasVideoFiles = payload.videoFileUrls && Array.isArray(payload.videoFileUrls) &&
        payload.videoFileUrls.some((url: string) => url && url.trim() !== '');
      const hasEmbedCode = payload.videoEmbedCode && payload.videoEmbedCode.trim() !== '';

      if (type === "video" && !hasVideoUrl && !hasVideoFiles && !hasEmbedCode) {
        const validationError = new Error("Please provide at least one video source: Video URL, video file, or embed code");
        (validationError as any).isAxiosError = true;
        (validationError as any).response = {
          status: 422,
          data: {
            errors: {
              VideoUrl: ["Please provide at least one video source: Video URL, video file, or embed code"]
            },
            message: "Please provide at least one video source: Video URL, video file, or embed code"
          }
        };
        throw validationError;
      }

      // Client-side validation for audio posts
      if (type === "audio" && !payload.audioUrl && !payload.audioFileUrls?.length) {
        const validationError = new Error("Audio URL or audio file is required");
        (validationError as any).isAxiosError = true;
        (validationError as any).response = {
          status: 422,
          data: {
            errors: {
              AudioUrl: ["Audio URL or audio file is required"]
            },
            message: "Audio URL or audio file is required"
          }
        };
        throw validationError;
      }

      // For video posts, copy imageUrl to videoThumbnailUrl
      if (type === "video" && "imageUrl" in payload) {
        payload = {
          ...payload,
          videoThumbnailUrl: payload.imageUrl || null,
        };
      }

      // For audio posts, copy imageUrl to thumbnailUrl
      if (type === "audio" && "imageUrl" in payload) {
        payload = {
          ...payload,
          thumbnailUrl: payload.imageUrl || null,
        };
      }

      // Clean up empty strings from array fields
      if (payload.additionalImageUrls) {
        payload.additionalImageUrls = payload.additionalImageUrls.filter((url: string) => url && url.trim() !== '');
        if (payload.additionalImageUrls.length === 0) {
          payload.additionalImageUrls = null;
        }
      }

      if (payload.fileUrls) {
        payload.fileUrls = payload.fileUrls.filter((url: string) => url && url.trim() !== '');
        if (payload.fileUrls.length === 0) {
          payload.fileUrls = null;
        }
      }

      if (payload.videoFileUrls) {
        payload.videoFileUrls = payload.videoFileUrls.filter((url: string) => url && url.trim() !== '');
        if (payload.videoFileUrls.length === 0) {
          payload.videoFileUrls = null;
        }
      }

      if (payload.audioFileUrls) {
        payload.audioFileUrls = payload.audioFileUrls.filter((url: string) => url && url.trim() !== '');
        if (payload.audioFileUrls.length === 0) {
          payload.audioFileUrls = null;
        }
      }

      // Clean up empty strings in tagIds array
      if (payload.tagIds) {
        payload.tagIds = payload.tagIds.filter((id: string) => id && id.trim() !== '');
        if (payload.tagIds.length === 0) {
          payload.tagIds = null;
        }
      }

      // Clean up empty string values for single URL fields
      if (type === "video") {
        if (payload.videoThumbnailUrl === '') {
          payload.videoThumbnailUrl = null;
        }
        if (payload.videoUrl === '') {
          payload.videoUrl = null;
        }
      }

      if (type === "audio") {
        if (payload.thumbnailUrl === '') {
          payload.thumbnailUrl = null;
        }
        if (payload.audioUrl === '') {
          payload.audioUrl = null;
        }
      }

      // For articles, keep imageUrl as empty string if not provided
      if (type !== "article" && payload.imageUrl === '') {
        payload.imageUrl = null;
      }

      // Log the cleaned payload for debugging
      console.log('Cleaned payload being sent to API:', payload);

      // Use the generic update method for all post types
      const response = await postsApi.updatePost(categoryId, postId, type, payload);
      return response;
    },
    onSuccess: (data) => {
      const msg =
        (data && (data.message || data.title)) ?? "Post updated successfully";
      setFieldErrors({});
      setNotification({ type: "success", message: String(msg) });

      // Redirect to posts list after 2 seconds
      setTimeout(() => {
        navigate('/admin/posts');
      }, 2000);
    },
    onError: (error: unknown) => {
      console.error("Post update error:", error);
      let message = "Failed to update post";
      const errors: Record<string, string[]> = {};

      if (axios.isAxiosError(error)) {
        const d = error.response?.data;
        const status = error.response?.status;
        console.error("API Error Response:", { status, data: d });

        // Handle 401 Unauthorized
        if (status === 401) {
          message = t('common.sessionExpired');
          setNotification({ type: "error", message });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // Handle 403 Forbidden (Author role issue)
        if (status === 403) {
          if (d?.title && d.title.includes('Author role')) {
            message = "The selected author does not have the Author role. Please select a valid author or leave it empty to use your account.";
          } else {
            message = d?.title || "You don't have permission to perform this action";
          }
        }

        // Handle validation errors (422)
        else if (status === 422 && d?.errors) {
          // Extract field-level errors from API response
          if (typeof d.errors === 'object') {
            const errorMessages: string[] = [];
            Object.entries(d.errors).forEach(([field, messages]) => {
              const normalizedField = field.toLowerCase();
              if (Array.isArray(messages)) {
                errors[normalizedField] = messages;
                // Add to error messages for notification
                messages.forEach(msg => errorMessages.push(`${field}: ${msg}`));
              } else if (typeof messages === 'string') {
                errors[normalizedField] = [messages];
                errorMessages.push(`${field}: ${messages}`);
              }
            });
            // Show all validation errors in the notification
            message = errorMessages.join('\n');
          }
        }
        // Check for title first (general error message)
        else if (d?.title) message = String(d.title);
        else if (d?.message) message = String(d.message);
        else message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setFieldErrors(errors);
      setNotification({ type: "error", message });
    },
  });

  if (isLoadingPost) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {notification && (
        <ApiNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <FormHeader type={type} isEditMode={true} />
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="grow space-y-4 md:space-y-6">
            {/* left column */}
            <PostDetailsForm
              type={type}
              state={state}
              handleChange={handleChange}
              tags={tags?.data.items ?? []}
              isLoading={isLoadingTags}
              fieldErrors={fieldErrors}
            />
            {type === "gallery" ? (
              <GalleryItems
                state={state as GalleryInitialStateInterface}
                handleChange={handleChange}
                errors={fieldErrors}
              />
            ) : type === "sorted-list" ? (
              <SortedListItems
                state={state as SortedListInitialStateInterface}
                handleChange={handleChange}
                errors={fieldErrors}
              />
            ) : (
              <ContentEditor
                state={state as ArticleInitialStateInterface}
                handleChange={handleChange}
                errors={fieldErrors}
              />
            )}
          </div>
          <div className="w-full lg:w-80 lg:shrink-0 space-y-4 md:space-y-6">
            {/* right column */}
            <ImageUpload
              state={state}
              handleChange={handleChange}
              type={type}
              fieldErrors={fieldErrors}
            />
            {!["gallery", "sorted-list", "audio", "video"].includes(
              type || ""
            ) && (
                <>
                  <AdditionalImages handleChange={handleChange} fieldErrors={fieldErrors} />
                  <FileUpload handleChange={handleChange} fieldErrors={fieldErrors} />
                </>
              )}
            {type === "video" && (
              <MediaUploadComponent
                mediaType="video"
                onMediaSelect={(media) => {
                  handleChange({
                    target: {
                      name: "videoUrl",
                      value: media.url,
                      type: "text",
                    },
                  } as any);
                }}
              />
            )}
            {type === "audio" && (
              <MediaUploadComponent
                mediaType="audio"
                onMediaSelect={(media) => {
                  handleChange({
                    target: {
                      name: "audioUrl",
                      value: media.url,
                      type: "text",
                    },
                  } as any);
                }}
              />
            )}
            <CategorySelect
              handleChange={handleChange}
              categories={categories?.data ?? []}
              isLoading={isLoadingCategories}
              value={state.categoryId}
              errors={fieldErrors}
            />
            <PublishSection
              mutation={mutation}
              isEditMode={true}
              state={state}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
            />
          </div>
        </div>
      </form>
    </>
  );
}
