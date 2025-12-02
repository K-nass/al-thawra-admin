import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { categoriesApi, type Category } from "@/api/categories.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface CategoryFormData {
  categoryId?: string;
  name: string;
  slug: string | null;
  language: "English" | "Arabic";
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
  const { t } = useLanguage();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: null,
    language: "English",
    description: "",
    colorHex: "#000000",
    order: 1,
    isActive: true,
    showOnMenu: true,
    showOnHomepage: true,
    parentCategoryId: null,
  });

  // Fetch category data if editing
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["category", id],
    queryFn: () => categoriesApi.getById(id!),
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
        description: categoryData.description,
        colorHex: categoryData.colorHex,
        order: categoryData.order,
        isActive: categoryData.isActive,
        showOnMenu: categoryData.showOnMenu,
        showOnHomepage: categoryData.showOnHomepage,
        parentCategoryId: categoryData.parentCategoryId,
      });
    }
  }, [categoryData, isEditMode]);

  // Fetch all categories to check orders
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.getAll({ WithSub: true }),
  });

  // Get parent categories (top-level only)
  const parentCategories = allCategories.filter((cat: Category) => !cat.parentCategoryId);

  const saveMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      if (isEditMode) {
        // Update existing category
        const updateData = {
          categoryId: data.categoryId!,
          name: data.name,
          slug: data.slug || undefined,
          language: data.language,
          description: data.description,
          colorHex: data.colorHex,
          order: data.order,
          isActive: data.isActive,
          showOnMenu: data.showOnMenu,
          showOnHomepage: data.showOnHomepage,
        };
        return categoriesApi.update(id!, updateData);
      } else {
        // Create new category
        const apiData = {
          ...data,
          slug: data.slug || undefined,
          parentCategoryId: data.parentCategoryId || undefined,
        };
        return categoriesApi.create(apiData);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? t("categories.updateSuccess") : t("categories.createSuccess"));
      navigate("/admin/categories");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      let errorMessage = isEditMode ? t("categories.updateError") : t("categories.createError");
      
      if (errorData?.title) {
        errorMessage = errorData.title;
      }
      
      if (errorData?.errors) {
        const errorDetails = Object.values(errorData.errors).flat().join("\n");
        errorMessage += "\n\n" + errorDetails;
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
    
    if (!formData.name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }
    
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? t("categories.editCategory") : t("categories.addCategory")}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("categories.name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("categories.namePlaceholder")}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("categories.slug")}
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("categories.slugPlaceholder")}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t("categories.slugHelp")}
          </p>
        </div>

        {/* Language & Parent Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("categories.language")} <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
              disabled={isEditMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
            </select>
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-1">
                {t("categories.languageCannotChange")}
              </p>
            )}
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("categories.parentCategory")}
              </label>
              <select
                name="parentCategoryId"
                value={formData.parentCategoryId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("categories.noParent")}</option>
                {parentCategories
                  .filter((cat: Category) => !cat.parentCategoryId)
                  .map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("categories.description")}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("categories.descriptionPlaceholder")}
          />
        </div>

        {/* Color & Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("categories.color")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="colorHex"
                value={formData.colorHex}
                onChange={handleChange}
                className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.colorHex}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, colorHex: e.target.value }))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("categories.order")}
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("categories.orderHelp")}
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnMenu"
              name="showOnMenu"
              checked={formData.showOnMenu}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOnMenu" className="ms-2 text-sm text-gray-700">
              {t("categories.showOnMenu")}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnHomepage"
              name="showOnHomepage"
              checked={formData.showOnHomepage}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOnHomepage" className="ms-2 text-sm text-gray-700">
              {t("categories.showOnHomepage")}
            </label>
          </div>

          {isEditMode && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ms-2 text-sm text-gray-700">
                {t("categories.isActive")}
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending || isLoadingCategory}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                {t("common.save")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
