import type { ChangeEvent } from "react";
import { memo } from "react";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  description: string;
  isActive: boolean;
  language: string;
  order: number;
  postsCount: number;
  showOnHomepage: boolean;
  showOnMenu: boolean;
  subCategoriesCount: number
}

interface Props {
  categories: Category[];
  isLoading?: boolean;
  handleChange: HandleChangeType;
  value?: string | null;
  errors?: Record<string, string[]>;
}

export default memo(function CategorySelect({ categories = [], isLoading, handleChange, value, errors = {} }: Props) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3" data-error-field={errors.categoryId ? true : undefined}>
      <label className="block text-sm font-medium mb-1" htmlFor="categoryId">{t('formLabels.category')}</label>
      <select
        id="categoryId"
        name="categoryId"
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e)}
        className={`w-full bg-slate-50 border rounded p-2 ${
          errors.categoryId ? 'border-red-500' : 'border-slate-300'
        }`}
        disabled={isLoading}
      >
        <option value="">{t('formLabels.selectCategory')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {errors.categoryId && (
        <ul className="mt-1 space-y-1">
          {errors.categoryId.map((error, idx) => (
            <li key={idx} className="text-red-600 text-xs">• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
});