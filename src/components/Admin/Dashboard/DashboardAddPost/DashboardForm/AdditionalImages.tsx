import { useState } from "react";
import FileModal from "./FileModal";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";

interface AdditionalImagesProps {
  handleChange: HandleChangeType;
  fieldErrors?: Record<string, string[]>;
}

export default function AdditionalImages({ handleChange, fieldErrors = {} }: AdditionalImagesProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
      <h3 className="text-base font-semibold">{t('imageUpload.additionalImages')}</h3>
      <p className="text-sm text-slate-500">
        {t('imageUpload.moreMainImages')}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-sm px-3 py-2 bg-[#605CA8] text-white rounded hover:bg-indigo-700 cursor-pointer"
      >
        {t('imageUpload.selectImage')}
      </button>
      {open && (
        <FileModal
          onClose={() => setOpen(false)}
          header="additional images"
          handleChange={handleChange}
        />
      )}

      <div data-error-field={fieldErrors.additionalImageUrls ? true : undefined}>
        {fieldErrors.additionalImageUrls && (
          <ul className="mt-1 space-y-1">
            {fieldErrors.additionalImageUrls.map((error, idx) => (
              <li key={idx} className="text-red-600 text-xs">• {error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}