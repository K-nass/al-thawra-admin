import type { ReelInitialStateInterface } from "./usePostReducer/postData";
import type { TagInterface } from "./PostDetailsForm";
import MediaUploadComponent from "./MediaUploadComponent";
import ImageUpload from "./ImageUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { apiClient } from "@/api/client";
import { useMutation } from "@tanstack/react-query";

interface ReelFormProps {
    state: ReelInitialStateInterface;
    handleChange: (e: any, newTags?: string[]) => void;
    fieldErrors: Record<string, string[]>;
    tags: TagInterface[];
    isLoading: boolean;
}

export default function ReelForm({ state, handleChange, fieldErrors, tags, isLoading }: ReelFormProps) {
    // EXACT same tag logic as PostDetailsForm
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
        const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
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
            const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
            handleChange(syntheticEvent, ids);
        } catch (err) {
            console.error("Failed to create tag:", err);
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
        const syntheticEvent = { target: { name: "tags", value: ids, type: "text" } } as Parameters<typeof handleChange>[0];
        handleChange(syntheticEvent, ids);
    };

    return (
        <div className="space-y-6">
            {/* Video Upload - Use existing MediaUploadComponent */}
            <MediaUploadComponent
                mediaType="video"
                onMediaSelect={(media) => {
                    handleChange({
                        target: {
                            name: "videoUrl",
                            value: media.url,
                            type: "text",
                        },
                    });
                }}
            />

            {/* Thumbnail Upload - Use existing ImageUpload */}
            <ImageUpload
                state={{
                    ...state,
                    imageUrl: state.thumbnailUrl || "",
                    imageDescription: null,
                } as any}
                handleChange={(e: any) => {
                    // Map imageUrl to thumbnailUrl
                    if (e.target.name === "imageUrl") {
                        handleChange({
                            target: {
                                name: "thumbnailUrl",
                                value: e.target.value,
                                type: "text",
                            },
                        });
                    }
                }}
                type="video"
                fieldErrors={fieldErrors}
            />

            {/* Caption Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-base sm:text-lg font-semibold border-b border-slate-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
                    Caption
                </h3>
                <textarea
                    name="caption"
                    value={state.caption || ""}
                    onChange={handleChange}
                    placeholder="Enter a caption for your reel..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-300 rounded focus:ring-primary focus:border-primary p-2 resize-none"
                />
                {fieldErrors.caption && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.caption[0]}</p>
                )}
            </div>

            {/* Tags Section - EXACT same as PostDetailsForm */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-base sm:text-lg font-semibold border-b border-slate-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
                    Tags
                </h3>

                <div data-error-field={fieldErrors.tags ? true : undefined}>
                    <label className="block text-sm font-medium mb-1" htmlFor="tags">
                        Tags
                    </label>

                    <div className={`flex flex-wrap items-center gap-2 border p-2 sm:p-3 rounded bg-slate-50 ${fieldErrors.tags ? 'border-red-500' : ''
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
                            name="tags"
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
                    {fieldErrors.tags && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.tags}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
