import { useState } from "react";
import FileModal from "./FileModal";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";

interface FileUploadProps {
  handleChange: HandleChangeType;
  fieldErrors?: Record<string, string[]>;
}
export default function FileUpload({  handleChange, fieldErrors = {} }: FileUploadProps) {
  const [fileName] = useState<string | null>()
  const [open, setOpen] = useState<boolean>(false)
  const { t } = useTranslation();

  return (
    <div className="bg-white  p-4 rounded-lg shadow-sm border border-slate-200  space-y-3">
      <h3 className="text-base font-semibold  ">{t('imageUpload.files')}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
        {t('imageUpload.downloadableFiles')}
      </p>
      <div data-error-field={fieldErrors.files ? true : undefined}>
        <label className={`block text-center w-full text-sm px-3 py-2 bg-[#605CA8] text-white rounded hover:bg-indigo-700 cursor-pointer ${
          fieldErrors.files ? 'border-2 border-red-500' : ''
        }`}>

          <button 
            type="button"
            onClick={() => setOpen(true)}
          >
            {t('imageUpload.selectFile')}
          </button>
        </label>
        {open && <FileModal onClose={() => setOpen(false)} header="files" handleChange={handleChange} />}
        {fileName && (
          <p className="text-xs text-gray-700 mt-2">
            {t('common.selectedFile')}: <span className="font-medium">{fileName}</span>
          </p>
        )}
        {fieldErrors.files && (
          <ul className="mt-1 space-y-1">
            {fieldErrors.files.map((error, idx) => (
              <li key={idx} className="text-red-600 text-xs">• {error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
