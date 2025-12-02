import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePage, useCreatePage, useUpdatePage, useFetchPages } from "@/hooks/useFetchPages";
import type { CreatePageRequest } from "@/api/pages.api";
import { useToast } from "@/components/Toast/ToastContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function PageForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreatePageRequest>({
    title: "",
    slug: null,
    language: "English",
    location: "DontAddToMenu",
    content: "",
    description: "",
    keywords: [],
    menuOrder: 1,
    parentMenuLinkId: null,
    parentPageId: null,
    showBreadcrumb: true,
    showOnlyToRegisteredUsers: false,
    showRightColumn: true,
    showTitle: true,
  });

  const [keywordInput, setKeywordInput] = useState("");

  // Fetch page data if editing
  const { data: pageData, isLoading: isLoadingPage } = usePage(id || "", isEditMode);

  // Fetch all pages for parent selection
  const { data: allPages } = useFetchPages({
    pageSize: 90,
  });


  // Populate form when editing
  useEffect(() => {
    if (pageData && isEditMode) {
      setFormData({
        title: pageData.title,
        slug: pageData.slug,
        language: pageData.language,
        location: pageData.location,
        content: pageData.content,
        description: pageData.description,
        keywords: pageData.keywords || [],
        menuOrder: pageData.menuOrder,
        parentMenuLinkId: pageData.parentMenuLinkId,
        parentPageId: pageData.parentPageId,
        showBreadcrumb: pageData.showBreadcrumb,
        showOnlyToRegisteredUsers: pageData.showOnlyToRegisteredUsers,
        showRightColumn: pageData.showRightColumn,
        showTitle: pageData.showTitle,
      });
    }
  }, [pageData, isEditMode]);

  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "menuOrder") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else if (name === "parentPageId" || name === "parentMenuLinkId") {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data: formData },
        {
          onSuccess: () => {
            toast.success("Page updated successfully");
            navigate("/admin/pages");
          },
          onError: (error: any) => {
            const errorData = error.response?.data;
            let errorMessage = "Failed to update page";

            if (errorData?.title) {
              errorMessage = errorData.title;
            }

            if (errorData?.errors) {
              const errorDetails = Object.values(errorData.errors).flat().join("\n");
              errorMessage += "\n\n" + errorDetails;
            }

            toast.error(errorMessage);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Page created successfully");
          navigate("/admin/pages");
        },
        onError: (error: any) => {
          const errorData = error.response?.data;
          let errorMessage = "Failed to create page";

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
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/pages")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Page" : "Add Page"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter page title"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="auto-generated-from-title"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate from title
          </p>
        </div>

        {/* Language & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TopMenu">Top Menu</option>
              <option value="MainMenu">Main Menu</option>
              <option value="Footer">Footer</option>
              <option value="DontAddToMenu">Don't Add to Menu</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description for SEO"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Page content (HTML supported)"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add keyword and press Enter"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Menu Order & Parent Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Order</label>
            <input
              type="number"
              name="menuOrder"
              value={formData.menuOrder}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Page</label>
            <select
              name="parentPageId"
              value={formData.parentPageId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Parent</option>
              {allPages?.items
                ?.filter((page) => page.id !== id)
                .map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTitle"
              name="showTitle"
              checked={formData.showTitle}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showTitle" className="ms-2 text-sm text-gray-700">
              Show Title
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBreadcrumb"
              name="showBreadcrumb"
              checked={formData.showBreadcrumb}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showBreadcrumb" className="ms-2 text-sm text-gray-700">
              Show Breadcrumb
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showRightColumn"
              name="showRightColumn"
              checked={formData.showRightColumn}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showRightColumn" className="ms-2 text-sm text-gray-700">
              Show Right Column
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnlyToRegisteredUsers"
              name="showOnlyToRegisteredUsers"
              checked={formData.showOnlyToRegisteredUsers}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOnlyToRegisteredUsers" className="ms-2 text-sm text-gray-700">
              Show Only to Registered Users
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/pages")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isLoadingPage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
