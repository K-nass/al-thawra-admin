import type { ReelInitialStateInterface } from "./usePostReducer/postData";
import type { TagInterface } from "./PostDetailsForm";
import MediaUploadComponent from "./MediaUploadComponent";
import ImageUpload from "./ImageUpload";
import { X, Tag, MessageSquare, Loader2, Plus, Hash } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface ReelFormProps {
  state: ReelInitialStateInterface;
  handleChange: (e: any, newTags?: string[]) => void;
  fieldErrors: Record<string, string[]>;
  tags: TagInterface[];
  isLoading: boolean;
}

export default function ReelForm({ state, handleChange, fieldErrors, tags, isLoading }: ReelFormProps) {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = {
        tags: [{ name, language: i18n.language === "ar" ? "Arabic" : "English" }],
      };
      const res = await apiClient.post(`/tags`, payload);
      return res.data as Array<{ id: string; name: string; language?: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const handleAddExistingTag = (tag: TagInterface) => {
    if (selectedTags.find((item) => item.id === tag.id)) return;
    const newSelected = [...selectedTags, { id: tag.id, name: tag.name }];
    setSelectedTags(newSelected);
    const ids = newSelected.map((item) => item.id);
    const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
    handleChange(syntheticEvent, ids);
    setInputValue("");
  };

  const handleAddTag = async (tagName: string) => {
    if (!tagName) return;
    const existing = tags.find((item) => item.name.toLowerCase() === tagName.toLowerCase());
    if (existing) {
      handleAddExistingTag(existing);
      return;
    }

    try {
      const created = await createTagMutation.mutateAsync(tagName);
      const createdItem = Array.isArray(created) ? created[0] : created;
      const createdId: string | undefined = createdItem?.id;
      if (!createdId) throw new Error("Tag creation returned no id");

      const newSelected = [...selectedTags, { id: createdId, name: tagName }];
      setSelectedTags(newSelected);
      const ids = newSelected.map((item) => item.id);
      const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
      handleChange(syntheticEvent, ids);
    } finally {
      setInputValue("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      void handleAddTag(inputValue.trim());
    }
  };

  const handleRemoveTag = (id: string) => {
    const newSelected = selectedTags.filter((item) => item.id !== id);
    setSelectedTags(newSelected);
    const ids = newSelected.map((item) => item.id);
    const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
    handleChange(syntheticEvent, ids);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-2 ml-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t("reels.reelResources")}</p>
        <span className="text-rose-500 font-bold">*</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" data-error-field={fieldErrors.videoUrl ? "videoUrl" : undefined}>
        <MediaUploadComponent
          mediaType="video"
          forcedMediaType="Reel"
          hideUrlTab={true}
          hideEmbedCode={true}
          fieldErrors={fieldErrors}
          onMediaSelect={(media) => {
            handleChange({
              target: { name: "videoUrl", value: media.url, type: "text" },
            });
          }}
        />

        <div className={fieldErrors.thumbnailUrl ? "ring-4 ring-rose-50 rounded-2xl" : undefined} data-error-field={fieldErrors.thumbnailUrl ? "thumbnailUrl" : undefined}>
          <ImageUpload
            state={{
              ...state,
              imageUrl: state.thumbnailUrl || "",
              imageDescription: null,
            } as any}
            handleChange={(e: any) => {
              if (e.target.name === "imageUrl") {
                handleChange({
                  target: { name: "thumbnailUrl", value: e.target.value, type: "text" },
                });
              }
            }}
            type="video"
            fieldErrors={fieldErrors}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <MessageSquare size={16} className="text-primary" />
            {t("reels.captionLabel")} <span className="text-rose-500">*</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-1.5 flex flex-col" data-error-field={fieldErrors.caption ? "caption" : undefined}>
            <textarea
              name="caption"
              value={state.caption || ""}
              onChange={handleChange}
              placeholder={t("reels.captionPlaceholder")}
              rows={4}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-colors font-medium leading-relaxed resize-none ${
                fieldErrors.caption ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:ring-primary/10 focus:border-primary"
              }`}
            />
            {fieldErrors.caption && (
              <p className="px-1 text-sm font-semibold text-rose-500 mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-500" /> {fieldErrors.caption[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Tag size={16} className="text-primary" />
            {t("post.discoveryTags")}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4" data-error-field={fieldErrors.tags ? "tags" : undefined}>
            <div className={`p-4 bg-slate-50 border rounded-2xl transition-colors ${fieldErrors.tags ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/30"}`}>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm animate-in zoom-in-95 duration-200">
                    <Hash size={12} />
                    {tag.name}
                    <button type="button" onClick={() => handleRemoveTag(tag.id)} className="ml-1 hover:bg-white/20 rounded p-0.5 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <div className="flex-1 min-w-[200px] relative">
                  <input
                    className="w-full bg-transparent outline-none p-1 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    id="tags"
                    name="tags"
                    placeholder={t("reels.addTagPlaceholder")}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                  {createTagMutation.isPending && <Loader2 size={14} className="absolute right-0 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{t("reels.recentTags")}</p>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  tags.slice(0, 15).map((tag) => {
                    const isSelected = selectedTags.find((item) => item.id === tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        disabled={!!isSelected}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors border flex items-center gap-1.5 active:scale-95 ${
                          isSelected ? "bg-emerald-50 border-emerald-100 text-emerald-600 opacity-60" : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddExistingTag(tag);
                        }}
                      >
                        {!isSelected && <Plus size={12} />}
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {fieldErrors.tags && <p className="text-rose-500 text-sm font-bold mt-1 px-1">{fieldErrors.tags[0]}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
