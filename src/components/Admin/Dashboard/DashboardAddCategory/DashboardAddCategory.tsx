import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Save, 
  ChevronLeft, 
  Loader2, 
  Info, 
  Layout, 
  Settings, 
  Globe, 
  Palette,
  Check
} from "lucide-react";
import { categoriesApi, type Category } from "@/api/categories.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import LayoutSelector from "./LayoutSelector";

interface CategoryFormData {
  categoryId?: string;
  name: string;
  slug: string | null;
  language: "English" | "Arabic";
  layout: string;
  description: string;
  colorHex: string;
  order: number;
  isActive: boolean;
  showOnMenu: boolean;
  showOnHomepage: boolean;
  parentCategoryId?: string | null;
}

export default function DashboardAddCategory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const toast = useToast();
  const { slug } = useParams<{ slug: string }>();
  const isEditMode = !!slug;
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: null,
    language: "English",
    layout: "Layout1",
    description: "",
    colorHex: "#10b981",
    order: 1,
    isActive: true,
    showOnMenu: true,
    showOnHomepage: true,
    parentCategoryId: null,
  });
  const [errors, setErrors] = useState<{name?: string, language?: string, order?: string}>({});

  // Fetch category data by slug if editing
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesApi.getBySlug(slug!, true),
    enabled: isEditMode,
  });

  // Populate form when editing
  useEffect(() => {
    if (categoryData && isEditMode) {
      setFormData({
        categoryId: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        language: categoryData.language as "English" | "Arabic",
        layout: categoryData.layout || "Layout1",
        description: categoryData.description,
        colorHex: categoryData.colorHex || "#10b981",
        order: categoryData.order,
        isActive: categoryData.isActive,
        showOnMenu: categoryData.showOnMenu,
        showOnHomepage: categoryData.showOnHomepage,
        parentCategoryId: categoryData.parentCategoryId,
      });
    }
  }, [categoryData, isEditMode]);

  // Fetch all categories
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.getAll({ WithSub: true }),
  });

  const parentCategories = allCategories.filter((cat: Category) => !cat.parentCategoryId);

  const saveMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      if (isEditMode) {
        const updateData = {
          categoryId: data.categoryId!,
          name: data.name,
          slug: data.slug ?? undefined,
          language: data.language,
          layout: data.layout,
          description: data.description,
          colorHex: data.colorHex,
          order: data.order,
          isActive: data.isActive,
          showOnMenu: data.showOnMenu,
          showOnHomepage: data.showOnHomepage,
        };
        return categoriesApi.update(data.categoryId!, updateData);
      } else {
        const apiData = {
          ...data,
          slug: data.slug || undefined,
          parentCategoryId: data.parentCategoryId || undefined,
        };
        return categoriesApi.create(apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(isEditMode ? t("categories.updateSuccess") : t("categories.createSuccess"));
      navigate("/admin/categories");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      let errorMessage = isEditMode ? t("categories.updateError") : t("categories.createError");
      if (errorData?.title) errorMessage = errorData.title;
      if (errorData?.errors) {
        const errorDetails = Object.values(errorData.errors).flat().join(", ");
        errorMessage += ": " + errorDetails;
      }
      toast.error(errorMessage);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "order") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else if (name === "parentCategoryId") {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {name?: string, language?: string, order?: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = t("categories.nameRequired") || "Category name is required";
    }
    
    if (!formData.language) {
      newErrors.language = t("categories.languageRequired");
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = t("categories.orderPositive");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("common.fixErrors") || "Please fix the errors in the form");
      return;
    }

    setErrors({});
    saveMutation.mutate(formData);
  };

  if (isEditMode && isLoadingCategory) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isEditMode ? t("categories.editCategory") : t("categories.addCategory")}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEditMode ? t("categories.editSubtitle") : t("categories.createSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-12">
          {/* Main Config Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Info size={18} className="text-primary" />
                 {t("categories.generalInfo") || "Category Information"}
               </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.name")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t("categories.namePlaceholder")}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                      errors.name ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.name}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.slug")}
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || ""}
                    onChange={handleChange}
                    placeholder={t("categories.slugPlaceholder")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">{t("categories.slugHelp")}</p>
                </div>

                {/* Language */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.language")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                     disabled={isEditMode}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none font-medium disabled:opacity-70 disabled:bg-slate-100"
                    >
                      <option value="English">{t("formLabels.english")}</option>
                      <option value="Arabic">{t("formLabels.arabic")}</option>
                    </select>
                  </div>
                  {errors.language && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.language}</p>
                  )}
                </div>

                {/* Parent */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.parentCategory")}
                  </label>
                  <select
                    name="parentCategoryId"
                    value={formData.parentCategoryId || ""}
                    onChange={handleChange}
                    disabled={isEditMode}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none font-medium disabled:opacity-70 disabled:bg-slate-100"
                  >
                    <option value="">{t("categories.noParent")}</option>
                    {parentCategories
                      .filter((cat: Category) => cat.id !== formData.categoryId)
                      .map((cat: Category) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  {t("categories.description")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t("categories.descriptionPlaceholder")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Style & Layout Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Palette size={18} className="text-primary" />
                 {t("categories.visualConfig") || "Visual Configuration"}
               </h3>
            </div>
            <div className="p-6 space-y-8">
              {/* Layout Selector */}
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Layout size={14} />
                  {t("categories.layout") || "Display Layout"}
                </label>
                <LayoutSelector
                  selectedLayout={formData.layout}
                  onLayoutChange={(layout) => setFormData((prev) => ({ ...prev, layout }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.color")}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        name="colorHex"
                        value={formData.colorHex}
                        onChange={handleChange}
                        className="h-10 w-16 border-none rounded-xl cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.colorHex}
                      onChange={(e) => setFormData((prev) => ({ ...prev, colorHex: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    {t("categories.order")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    required
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.order ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                    }`}
                  />
                  {errors.order && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.order}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility & Settings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Settings size={18} className="text-primary" />
                 {t("categories.visibility") || "Visibility & Active Settings"}
               </h3>
            </div>
            <div className="p-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { id: "showOnMenu", label: t("categories.showOnMenu") },
                   { id: "showOnHomepage", label: t("categories.showOnHomepage") },
                   { id: "isActive", label: t("categories.isActive"), visible: isEditMode }
                 ].map((item: any) => (
                   item.visible !== false && (
                    <label 
                      key={item.id} 
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          formData[item.id as keyof CategoryFormData] 
                              ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-100' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                          <input
                              type="checkbox"
                              name={item.id}
                              checked={formData[item.id as keyof CategoryFormData] as boolean}
                              onChange={handleChange}
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500"
                          />
                          <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${formData[item.id as keyof CategoryFormData] ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {item.label}
                      </span>
                    </label>
                   )
                 ))}
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saveMutation.isPending ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
