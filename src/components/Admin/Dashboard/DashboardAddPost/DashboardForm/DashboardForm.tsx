import { useLocation, useNavigate } from "react-router-dom";
import FormHeader from "./FormHeader";
import PostDetailsForm, { type TagInterface } from "./PostDetailsForm";
import ContentEditor from "./ContentEditor";
import GalleryItems from "./GalleryItems";
import SortedListItems from "./SortedListItems";

import AdditionalImages from "./AdditionalImages";
import FileUpload from "./FileUpload";
import CategorySelect from "./CategorySelect";
import PublishSection from "./PublishSection";
import ImageUpload from "./ImageUpload";
import MediaUploadComponent from "./MediaUploadComponent";
import { useEffect, type ChangeEvent, useState } from "react";
import axios from "axios";
import { apiClient, getAuthToken } from "@/api/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import ApiNotification from "../../../../Common/ApiNotification";
import { usePostReducer } from "./usePostReducer/usePostReducer";
import type {
  ArticleInitialStateInterface,
  GalleryInitialStateInterface,
  SortedListInitialStateInterface,
} from "./usePostReducer/postData";
import { postConfig } from "./usePostReducer/postConfig";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";

interface TagResponse {
  data: {
    items: TagInterface[];
  };
}

export default function DashboardForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const navigate = useNavigate();
  const [state, dispatch] = usePostReducer(type);
  const token = getAuthToken();

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
      let payload: any = state;
      const categoryId = payload.categoryId;
      if (!categoryId) throw new Error("categoryId missing");
      if (!type) throw new Error("Post type is required");

      const config = postConfig[type as keyof typeof postConfig];
      if (!config) throw new Error(`Unknown post type: ${type}`);

      // Client-side validation for articles - imageUrl cannot be null
      // Note: Empty string is allowed by the API
      if (type === "article" && payload.imageUrl === null) {
        payload.imageUrl = "";
      }

      // Client-side validation for video posts
      // Check if at least one video source is provided with actual content
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

      const endpoint = config.endpoint;

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

      // Clean up empty strings from array fields to prevent API validation errors
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
      // Note: imageUrl is required for articles, so don't convert to null
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

      // For articles, keep imageUrl as empty string if not provided (required field)
      // For other types, convert empty imageUrl to null if needed
      if (type !== "article" && payload.imageUrl === '') {
        payload.imageUrl = null;
      }

      const response = await apiClient.post(
        `/posts/categories/${categoryId}/${endpoint}`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      const msg =
        (data && (data.message || data.title)) ?? "Post created successfully";
      setFieldErrors({});
      setNotification({ type: "success", message: String(msg) });
    },
    onError: (error: unknown) => {
      console.error("Post creation error:", error);
      let message = "Failed to create post";
      const errors: Record<string, string[]> = {};

      if (axios.isAxiosError(error)) {
        const d = error.response?.data;
        const status = error.response?.status;
        console.error("API Error Response:", { status, data: d });

        // Handle 401 Unauthorized - only redirect if token refresh failed
        // The axios interceptor will automatically try to refresh the token
        // If we get here with 401, it means refresh failed
        if (status === 401) {
          message = t('common.sessionExpired');
          setNotification({ type: "error", message });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // Check for title first (general error message)
        if (d?.title) message = String(d.title);
        else if (d?.message) message = String(d.message);
        else if (d?.errors) {
          // Extract field-level errors from API response
          if (typeof d.errors === 'object') {
            Object.entries(d.errors).forEach(([field, messages]) => {
              // Normalize field name to lowercase for matching form fields
              const normalizedField = field.toLowerCase();
              if (Array.isArray(messages)) {
                errors[normalizedField] = messages;
              } else if (typeof messages === 'string') {
                errors[normalizedField] = [messages];
              }
            });
          }
          message = d.message || 'Validation failed';
        }
        else message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setFieldErrors(errors);
      setNotification({ type: "error", message });
    },
  });

  // #505458 new color i will use for form
  console.log(state);

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
        <FormHeader type={type} />
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
