import { useState } from "react";
import type { HandleChangeType } from "./types";
import type { ArticleInitialStateInterface } from "./usePostReducer/postData";
import { X, Link as LinkIcon, FileText, Hash, Eye, EyeOff, Tag as TagIcon, Plus, Compass, Key, Database, Info, ChevronRight, Sparkles } from "lucide-react";
import { apiClient } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiValidationError } from "./types";
import { useTranslation } from "react-i18next";
import { type TagInterface } from "./PostDetailsForm";
import AdditionalImages from "./AdditionalImages";
import FileUpload from "./FileUpload";
import MediaUploadComponent from "./MediaUploadComponent";

interface AdvancedOptionsTabProps {
  state: ArticleInitialStateInterface;
  handleChange: HandleChangeType;
  isLoading: boolean;
  tags: TagInterface[];
  errors?: ApiValidationError["errors"];
  fieldErrors?: Record<string, string[]>;
  type: string | null;
}

export default function AdvancedOptionsTab({ state, handleChange, tags, errors, fieldErrors = {}, type }: AdvancedOptionsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const tagErrors = fieldErrors.tagIds ?? fieldErrors.tags;
  const metaDescriptionErrors = fieldErrors.metaDescription ?? fieldErrors.metadescription;
  const metaKeywordsErrors = fieldErrors.metaKeywords ?? fieldErrors.metakeywords;

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = {
        tags: [{ name, language: state.language || "English" }],
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
    const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
    handleChange(syntheticEvent, ids);
    setInputValue("");
  };

  const handleAddTag = async (tagName: string) => {
    if (!tagName) return;
    const existing = tags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase());
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
      const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
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
    const newSelected = selectedTags.filter((tag) => tag.id !== id);
    setSelectedTags(newSelected);
    const ids = newSelected.map((tag) => tag.id);
    const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
    handleChange(syntheticEvent, ids);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("post.advancedOptions")}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("post.seoNavigation")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5" data-error-field={fieldErrors.slug ? "slug" : undefined}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="slug">
                <LinkIcon size={10} /> {t("post.slug")}
              </label>
              <div className="relative group">
                <input
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-colors ${
                    fieldErrors.slug ? "border-rose-200 focus:ring-rose-500/10 text-rose-600" : "border-slate-200 focus:ring-primary/10 text-slate-700"
                  }`}
                  type="text"
                  id="slug"
                  name="slug"
                  placeholder={t("post.slugPlaceholder")}
                  value={state.slug ?? ""}
                  onChange={handleChange}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-primary transition-colors" title={t("post.generateFromTitle")}>
                  <Sparkles size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium px-1 flex items-center gap-1">
                <Info size={10} /> {t("post.slugHint")}
              </p>
              {fieldErrors.slug && <p className="text-rose-500 text-xs font-black uppercase tracking-tight mt-1 ml-1">{fieldErrors.slug}</p>}
            </div>

            <div className="space-y-1.5" data-error-field={fieldErrors.optionalURL ? "optionalURL" : undefined}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="optional-url">
                <Database size={10} /> {t("post.externalSourceUrl")}
              </label>
              <input
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-colors ${
                  fieldErrors.optionalURL || errors?.OptionalURL ? "border-rose-200 focus:ring-rose-500/10 text-rose-600" : "border-slate-200 focus:ring-primary/10 text-slate-700"
                }`}
                id="optional-url"
                name="optionalURL"
                placeholder={t("post.externalSourcePlaceholder")}
                type="url"
                value={state.optionalURL ?? ""}
                onChange={handleChange}
              />
              {fieldErrors.optionalURL && <p className="text-rose-500 text-xs font-black uppercase tracking-tight mt-1 ml-1">{fieldErrors.optionalURL}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <TagIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("post.discoveryTags")}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("post.taxonomyKeywords")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5" data-error-field={tagErrors ? "tagIds" : undefined}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="tags">
                <Hash size={10} /> {t("post.repositoryTags", { language: state.language || t("common.all") })}
              </label>

              <div
                className={`group relative transition-colors duration-200 border rounded-2xl bg-white focus-within:ring-4 ${
                  tagErrors ? "border-rose-200 focus-within:ring-rose-500/10" : "border-slate-200 focus-within:ring-primary/10 focus-within:border-primary"
                }`}
              >
                <div className="flex flex-wrap gap-2 p-3">
                  {selectedTags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-lg border border-slate-200 hover:border-slate-300 select-none">
                      {tag.name}
                      <button type="button" onClick={() => handleRemoveTag(tag.id)} className="hover:text-rose-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    className="flex-1 min-w-[150px] outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-300 py-1"
                    placeholder={selectedTags.length === 0 ? t("post.searchOrCreate") : t("post.addMore")}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                </div>

                {inputValue && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
                    {tags
                      .filter(
                        (tag) =>
                          tag.language === state.language &&
                          tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
                          !selectedTags.find((item) => item.id === tag.id),
                      )
                      .slice(0, 5)
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddExistingTag(tag)}
                          className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-between group"
                        >
                          <span className="text-slate-700">{tag.name}</span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </button>
                      ))}

                    {!tags.find(
                      (tag) =>
                        tag.language === state.language &&
                        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
                        !selectedTags.find((item) => item.id === tag.id),
                    ) && (
                      <button
                        type="button"
                        onClick={() => handleAddTag(inputValue)}
                        className="w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-primary/5 transition-colors border-t border-slate-50 mt-1"
                      >
                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <Plus size={14} />
                        </div>
                        <span className="text-primary italic">{t("post.createTag", { value: inputValue })}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {tagErrors && (
                <div className="flex flex-col gap-1 mt-1 ml-1 text-rose-500">
                  {tagErrors.map((error, idx) => (
                    <p key={idx} className="text-xs font-bold uppercase">
                      • {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Eye size={10} /> {t("formLabels.visibility")}
              </label>
              <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: "visibility", value: true, type: "radio" } } as never)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    state.visibility === true ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Eye size={12} /> {t("formLabels.show")}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: "visibility", value: false, type: "radio" } } as never)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    state.visibility === false ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <EyeOff size={12} /> {t("formLabels.hide")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("post.searchEngineMetadata")}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("post.indexingDiscovery")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5" data-error-field={metaDescriptionErrors ? "metaDescription" : undefined}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="summary">
              <FileText size={10} /> {t("formLabels.metaDescription")}
            </label>
            <textarea
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 transition-colors min-h-[120px] resize-none ${
                metaDescriptionErrors ? "border-rose-200 focus:ring-rose-500/10" : "border-slate-200 focus:ring-primary/10"
              }`}
              id="summary"
              name="metaDescription"
              placeholder={t("post.searchSummaryPlaceholder")}
              value={state.metaDescription ?? ""}
              onChange={handleChange}
            />
            {metaDescriptionErrors && (
              <div className="flex flex-col gap-1 mt-1 ml-1 text-rose-500">
                {metaDescriptionErrors.map((error, idx) => (
                  <p key={idx} className="text-xs font-bold uppercase">
                    • {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5" data-error-field={metaKeywordsErrors ? "metaKeywords" : undefined}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="keywords">
              <Hash size={10} /> {t("formLabels.metaKeywords")}
            </label>
            <input
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-colors ${
                metaKeywordsErrors ? "border-rose-200 focus:ring-rose-500/10" : "border-slate-200 focus:ring-primary/10"
              }`}
              type="text"
              id="keywords"
              name="metaKeywords"
              placeholder={t("post.keywordsPlaceholder")}
              value={state.metaKeywords ?? ""}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-400 font-medium px-1 flex items-center gap-1 mt-1">
              <Info size={10} /> {t("post.internalSearchHint")}
            </p>
            {metaKeywordsErrors && (
              <div className="flex flex-col gap-1 mt-1 ml-1 text-rose-500">
                {metaKeywordsErrors.map((error, idx) => (
                  <p key={idx} className="text-xs font-bold uppercase">
                    • {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {!["audio", "reel"].includes(type || "") && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
            <AdditionalImages handleChange={handleChange} fieldErrors={fieldErrors} />
          </div>
        )}

        {!["audio", "reel"].includes(type || "") && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
            <FileUpload handleChange={handleChange} fieldErrors={fieldErrors} />
          </div>
        )}
      </div>
    </div>
  );
}
