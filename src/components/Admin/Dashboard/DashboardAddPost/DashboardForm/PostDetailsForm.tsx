import { useState } from "react";
import type { HandleChangeType } from "./types";
import type { ArticleInitialStateInterface, GalleryInitialStateInterface, SortedListInitialStateInterface } from "./usePostReducer/postData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { apiClient } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import type { ApiValidationError } from './types';
import { useTranslation } from "react-i18next";

export interface TagInterface {
  id: string; 
  language: string;
  name: string;
  postsCount: number;
}
interface PostDetailsForm {
  state: ArticleInitialStateInterface | GalleryInitialStateInterface | SortedListInitialStateInterface;
  handleChange: HandleChangeType;
  isLoading: boolean;
  tags: TagInterface[];
  errors?: ApiValidationError['errors'];
  fieldErrors?: Record<string, string[]>;
  type: string | null;
}


export default function PostDetailsForm({ 
  state, 
  handleChange, 
  tags,
  errors,
  fieldErrors = {},
  type
}: PostDetailsForm) {
  const { t } = useTranslation();
  // store selected tags as objects so we preserve id + name
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");

  // use react-query mutation to create tags on server
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = {
        tags: [
          {
            name,
            language: "English",
          },
        ],
      };
      const res = await apiClient.post(`/tags`, payload);
      // according to your example the API returns an array of created tags
      return res.data as Array<{ id: string; name: string; language?: string }>;
    },
  });

  // adds an existing tag (from tags list) by id
  const handleAddExistingTag = (tag: TagInterface) => {
    if (selectedTags.find((t) => t.id === tag.id)) return;
    const newSelected = [...selectedTags, { id: tag.id, name: tag.name }];
    setSelectedTags(newSelected);
    const ids = newSelected.map((t) => t.id);
    const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
    handleChange(syntheticEvent, ids);
    setInputValue("");
  };

  // adds a tag typed by the user: create it on server then add
  const handleAddTag = async (tagName: string) => {
    if (!tagName) return;
    // if an existing tag with same name exists, add that one
    const existing = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
    if (existing) {
      handleAddExistingTag(existing);
      return;
    }

    try {
      const created = await createTagMutation.mutateAsync(tagName);
      // created is expected to be an array; pick first created item's id
      const createdItem = Array.isArray(created) ? created[0] : created;
      const createdId: string | undefined = createdItem?.id;
      if (!createdId) throw new Error("Tag creation returned no id");

      const newSelected = [...selectedTags, { id: createdId, name: tagName }];
      setSelectedTags(newSelected);
      const ids = newSelected.map((t) => t.id);
      const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
      handleChange(syntheticEvent, ids)
    } catch (err) {
      
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
    const newSelected = selectedTags.filter((t) => t.id !== id);
    setSelectedTags(newSelected);
    const ids = newSelected.map((t) => t.id);
    const syntheticEvent = { target: { name: "tagIds", value: ids, type: "text" } } as Parameters<HandleChangeType>[0];
    handleChange(syntheticEvent, ids);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-base sm:text-lg font-semibold border-b border-slate-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
        {t('post.postDetails')}
      </h3>

      <div className="space-y-4 sm:space-y-6">
        {/* title */}
        <div data-error-field={fieldErrors.title ? true : undefined}>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            {t('post.title')}
          </label>
          <input
            className={`w-full bg-slate-50 border rounded focus:ring-primary focus:border-primary p-2 ${
              fieldErrors.title ? 'border-red-500' : 'border-slate-300'
            }`}
            type="text"
            id="title"
            name="title"
            placeholder={t('post.title')}
            value={state.title}
            onChange={handleChange}
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* slug */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="slug">
            {t('post.slug')}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t('post.slugHint')}
          </p>
          <input
            className="w-full bg-slate-50  border-slate-300  rounded focus:ring-primary focus:border-primary p-2"
            type="text"
            id="slug"
            name="slug"
            placeholder={t('post.slug')}
            value={state.slug ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* Meta Tag */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="summary">
            {t('formLabels.metaDescription')}
          </label>
          <textarea
            className={`w-full bg-slate-50 border-slate-300 rounded focus:ring-primary focus:border-primary ${
              fieldErrors?.metadescription ? 'border-red-500' : ''
            }`}
            id="summary"
            name="metaDescription"
            placeholder={t('post.description')}
            value={state.metaDescription ?? ""}
            onChange={handleChange}
          ></textarea>
          {fieldErrors?.metadescription && (
            <div className="mt-1 text-sm text-red-600">
              {fieldErrors.metadescription.map((error, idx) => (
                <div key={idx}>• {error}</div>
              ))}
            </div>
          )}
        </div>

        {/* metaKeywords */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="keywords">
            {t('formLabels.metaKeywords')}
          </label>
          <input
            className={`w-full bg-slate-50 border-slate-300 rounded focus:ring-primary focus:border-primary p-2 ${
              fieldErrors?.metakeywords ? 'border-red-500' : ''
            }`}
            type="text"
            id="keywords"
            name="metaKeywords"
            placeholder={t('formLabels.metaKeywords')}
            value={state.metaKeywords ?? ""}
            onChange={handleChange}
          />
          {fieldErrors?.metakeywords && (
            <div className="mt-1 text-sm text-red-600">
              {fieldErrors.metakeywords.map((error, idx) => (
                <div key={idx}>• {error}</div>
              ))}
            </div>
          )}
        </div>

        {/* {Visibility} */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('formLabels.visibility')}</label>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <label className="flex items-center" htmlFor="visibility-true">
              <input
                className="text-primary focus:ring-primary"
                name="visibility"
                type="radio"
                value="true"
                id="visibility-true"
                checked={state.visibility === true}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.show')}</span>
            </label>
            <label className="flex items-center" htmlFor="visibility-false">
              <input
                className="text-primary focus:ring-primary"
                name="visibility"
                type="radio"
                value="false"
                id="visibility-false"
                checked={state.visibility === false}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.hide')}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Add to Slider */}
          {'addToSlider' in state && (
            <label className="flex items-center">
              <input
                className="rounded text-primary focus:ring-primary"
                name="addToSlider"
                type="checkbox"
                checked={(state as ArticleInitialStateInterface).addToSlider === true}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.addToSlider')}</span>
            </label>
          )}
          {/* Add to Featured */}
          {'addToFeatured' in state && (
            <label className="flex items-center">
              <input
                className="rounded text-primary focus:ring-primary"
                name="addToFeatured"
                type="checkbox"
                checked={(state as ArticleInitialStateInterface).addToFeatured === true}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.addToFeatured')}</span>
            </label>
          )}
          {/* Add to Breaking */}
          {'addToBreaking' in state && (
            <label className="flex items-center">
              <input
                className="rounded text-primary focus:ring-primary"
                name="addToBreaking"
                type="checkbox"
                checked={(state as ArticleInitialStateInterface).addToBreaking === true}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.addToBreaking')}</span>
            </label>
          )}
          {/* Add to Recommended */}
          <label className="flex items-center">
            <input
              className="rounded text-primary focus:ring-primary"
              type="checkbox"
              name="addToRecommended"
              checked={state.addToRecommended === true}
              onChange={handleChange}
            />
            <span className="ml-2">{t('formLabels.addToRecommended')}</span>
          </label>
          {/* Show Only to Registered Users */}
          <label className="flex items-center">
            <input
              className="rounded text-primary focus:ring-primary"
              type="checkbox"
              name="showOnlyToRegisteredUsers"
              checked={state.showOnlyToRegisteredUsers === true}
              onChange={handleChange}
            />
            <span className="ml-2">{t('formLabels.showOnlyToRegisteredUsers')}</span>
          </label>

          {/* Show Item Numbers in Post Details Page */}
          {type === "gallery" && (
            <label className="flex items-center">
              <input
                className="rounded text-primary focus:ring-primary"
                type="checkbox"
                name="showItemNumbersInPostDetailsPage"
                checked={(state as GalleryInitialStateInterface).showItemNumbersInPostDetailsPage === true}
                onChange={handleChange}
              />
              <span className="ml-2">{t('formLabels.showItemNumbers')}</span>
            </label>
          )}
          {/* Show Numbers (for sorted-list) */}
          {type === "sorted-list" && (
            <label className="flex items-center">
              <input
                className="rounded text-primary focus:ring-primary"
                type="checkbox"
                name="showNumbers"
                checked={(state as SortedListInitialStateInterface).showNumbers === true}
                onChange={handleChange}
              />
              <span className="ml-2">Show Numbers</span>
            </label>
          )}
        </div>
        
        <div data-error-field={fieldErrors.tagIds ? true : undefined}>
          <label className="block text-sm font-medium mb-1" htmlFor="tags">
            Tags
          </label>

          <div className={`flex flex-wrap items-center gap-2 border p-2 sm:p-3 rounded bg-slate-50 ${
            fieldErrors.tagIds ? 'border-red-500' : ''
          }`}>
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary px-2 py-1 rounded cursor-pointer"
                title="Click to remove"
              >
                {tag.name}
                <FontAwesomeIcon icon={faXmark} className="ml-1 text-sm hover:text-red-400" onClick={() => handleRemoveTag(tag.id)} />
              </span>
            ))}

            <input
              className="flex-1 bg-transparent outline-none p-1"
              id="tags"
              name="tagIds"
              placeholder="Type tag and hit Enter"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                className={`px-2 sm:px-3 py-1.5 sm:p-2 text-sm sm:text-base rounded font-semibold cursor-pointer ${selectedTags.find((t) => t.id === tag.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-black hover:bg-gray-400"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddExistingTag(tag);
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          {fieldErrors.tagIds && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.tagIds}</p>
          )}
        </div>

        {/* Optional URL */}
        <div data-error-field={fieldErrors.optionalURL ? true : undefined}>
          <label className="block text-sm font-medium mb-1" htmlFor="optional-url">
            Optional URL
          </label>
          <input
            className={`w-full bg-slate-50 border ${
              fieldErrors.optionalURL || errors?.OptionalURL ? 'border-red-500' : 'border-slate-300'
            } rounded focus:ring-primary focus:border-primary p-2`}
            id="optional-url"
            name="optionalURL"
            placeholder="Enter URL (http:// will be added if missing)"
            type="url"
            value={state.optionalURL ?? ''}
            onChange={handleChange}
          />
          {(fieldErrors.optionalURL || errors?.OptionalURL) && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.optionalURL || errors?.OptionalURL}</p>
          )}
        </div>

        {/* URL Validation Errors Section */}

      </div>
    </div>
  );
}
