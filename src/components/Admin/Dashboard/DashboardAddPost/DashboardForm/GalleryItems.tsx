import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { GalleryInitialStateInterface } from "./usePostReducer/postData";
import { useState } from "react";
import FileModal from "./FileModal";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";

interface GalleryItemsProps {
  state: GalleryInitialStateInterface;
  handleChange: HandleChangeType;
  errors?: Record<string, string[]>;
}

export default function GalleryItems({ state, handleChange, errors = {} }: GalleryItemsProps) {
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...state.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    const syntheticEvent = {
      target: {
        name: "items",
        value: updatedItems,
        type: "text",
      },
    };

    handleChange(syntheticEvent as any);
    
    // Clear error for this specific field when user starts typing
    if (errors[`items.${index}.${field}`]) {
      // Error clearing is handled by parent component's handleChange
    }
  };

  const handleAddItem = () => {
    const newItem = {
      title: "",
      imageUrl: "",
      imageDescription: "",
      content: "",
    };
    const updatedItems = [...state.items, newItem];
    const syntheticEvent = {
      target: {
        name: "items",
        value: updatedItems,
        type: "text",
      },
    };
    handleChange(syntheticEvent as any);
  };

  const handleRemoveItem = (index: number) => {
    if (state.items.length <= 1) return; // Keep at least one item
    const updatedItems = state.items.filter((_, i) => i !== index);
    const syntheticEvent = {
      target: {
        name: "items",
        value: updatedItems,
        type: "text",
      },
    };
    handleChange(syntheticEvent as any);
  };

  const handleImageModalChange = (index: number, imageUrl: string) => {
    handleItemChange(index, "imageUrl", imageUrl);
    setOpenModalIndex(null);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200" data-error-field={errors.items ? true : undefined}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold">Gallery Items</h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-primary text-white rounded hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Item
        </button>
      </div>
      {errors.items && (
        <ul className="mb-2 space-y-1">
          {errors.items.map((error, idx) => (
            <li key={idx} className="text-red-600 text-xs">• {error}</li>
          ))}
        </ul>
      )}
      <div className="space-y-4 sm:space-y-6">
        {state.items.map((item, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-medium text-slate-700">Item {index + 1}</h4>
              {state.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                className={`w-full bg-slate-50 border rounded focus:ring-primary focus:border-primary p-2 ${
                  errors[`items.${index}.title`] ? 'border-red-500' : 'border-slate-300'
                }`}
                type="text"
                placeholder="Item title"
                value={item.title}
                onChange={(e) => handleItemChange(index, "title", e.target.value)}
                data-error-field={errors[`items.${index}.title`] ? true : undefined}
              />
              {errors[`items.${index}.title`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.title`]}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('imageUpload.imageUrl')}
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center mb-2">
                <button
                  type="button"
                  onClick={() => setOpenModalIndex(index)}
                  className="text-sm px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  {t('imageUpload.selectImage')}
                </button>
              </div>
              {openModalIndex === index && (
                <FileModal
                  onClose={() => setOpenModalIndex(null)}
                  header="images"
                  handleChange={(e) => {
                    if (e.target.name === "imageUrl" && typeof e.target.value === "string") {
                      handleImageModalChange(index, e.target.value);
                    }
                  }}
                />
              )}
              <p className="text-center text-xs text-slate-500 mb-2">{t('imageUpload.addImageUrl')}</p>
              <input
                className={`w-full bg-slate-50 border rounded focus:ring-primary focus:border-primary p-2 ${
                  errors[`items.${index}.imageUrl`] ? 'border-red-500' : 'border-slate-300'
                }`}
                type="text"
                placeholder="Image URL"
                value={item.imageUrl}
                onChange={(e) => handleItemChange(index, "imageUrl", e.target.value)}
                data-error-field={errors[`items.${index}.imageUrl`] ? true : undefined}
              />
              {errors[`items.${index}.imageUrl`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.imageUrl`]}</p>
              )}
            </div>

            {/* Image Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Image Description
              </label>
              <input
                className="w-full bg-slate-50 border-slate-300 rounded focus:ring-primary focus:border-primary p-2"
                type="text"
                placeholder="Image description"
                value={item.imageDescription}
                onChange={(e) => handleItemChange(index, "imageDescription", e.target.value)}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Content
              </label>
              <textarea
                className="w-full bg-slate-50 border-slate-300 rounded focus:ring-primary focus:border-primary p-2 min-h-[100px]"
                placeholder="Item content"
                value={item.content}
                onChange={(e) => handleItemChange(index, "content", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

