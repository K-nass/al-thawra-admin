import type { ChangeEvent } from "react";
import { memo } from "react";
import type { HandleChangeType } from "./types";
import { useTranslation } from "react-i18next";
import { Layers, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

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
  language?: string;
}

export default memo(function CategorySelect({ categories = [], isLoading, handleChange, value, errors = {}, language = "Arabic" }: Props) {
  const { t } = useTranslation();
  
  // Filter categories by language
  const filteredCategories = categories.filter(cat => cat.language === language);
  
  const selectedCategory = categories.find(c => c.id === value);

  return (
    <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-300 relative ${
      errors.categoryId ? 'border-rose-200' : 'border-slate-200'
    }`} data-error-field={errors.categoryId ? true : undefined}>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-colors ${
            errors.categoryId ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {t('formLabels.category')} <span className="text-rose-500 ml-1 font-bold">*</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("formLabels.languageRepository", { language })}
            </p>
          </div>
        </div>
        {selectedCategory && (
          <div 
            className="w-4 h-4 rounded-full border border-white shadow-sm" 
            style={{ backgroundColor: selectedCategory.colorHex }}
            title={selectedCategory.name}
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <select
            id="categoryId"
            name="categoryId"
            value={value ?? ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all appearance-none ${
              errors.categoryId 
                ? 'border-rose-200 focus:ring-rose-500/10 text-rose-600' 
                : 'border-slate-200 focus:ring-primary/10 text-slate-700'
            }`}
            disabled={isLoading}
          >
            <option value="">{t('formLabels.selectCategory')}</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <ChevronDown size={16} />
          </div>
        </div>

        {errors.categoryId && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
            <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {errors.categoryId.map((error, idx) => (
                <li key={idx} className="text-rose-600 text-[10px] font-black uppercase tracking-tight leading-none">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {!errors.categoryId && value && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in zoom-in-95">
             <CheckCircle2 size={14} className="text-emerald-500" />
             <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t("formLabels.categorySelected")}</span>
          </div>
        )}
        
        {filteredCategories.length === 0 && !isLoading && (
          <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
             <p className="text-xs text-slate-400 font-medium italic">{t("categories.noCategoriesForLanguage", { language })}</p>
          </div>
        )}
      </div>
    </div>
  );
});
