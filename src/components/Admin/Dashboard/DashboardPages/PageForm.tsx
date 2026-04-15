import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePage, useCreatePage, useUpdatePage, useFetchPages } from "@/hooks/useFetchPages";
import type { CreatePageRequest } from "@/api/pages.api";
import { useToast } from "@/components/Toast/ToastContainer";
import {
  ChevronLeft,
  Save,
  Loader2,
  Layout,
  Globe2,
  Settings,
  FileText,
  Plus,
  X,
  Eye,
  Columns,
  Users,
  Route,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PageForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
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
  const [errors, setErrors] = useState<{ title?: string; content?: string; language?: string; location?: string }>({});
  const [keywordInput, setKeywordInput] = useState("");

  const { data: pageData, isLoading: isLoadingPage } = usePage(id || "", isEditMode);
  const { data: allPages } = useFetchPages({ pageSize: 90 });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "menuOrder") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 1 }));
    } else if (name === "parentPageId" || name === "parentMenuLinkId") {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({ ...prev, keywords: prev.keywords.filter((item) => item !== keyword) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; content?: string; language?: string; location?: string } = {};

    if (!formData.title.trim()) newErrors.title = t("pages.validation.titleRequired");
    if (!formData.content.trim()) newErrors.content = t("pages.validation.contentRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("pages.validation.fixErrors"));
      return;
    }

    setErrors({});
    if (isEditMode) {
      updateMutation.mutate(
        { id: id!, data: formData },
        {
          onSuccess: () => {
            toast.success(t("pages.updateSuccess"));
            navigate("/admin/pages");
          },
          onError: (error: any) => {
            const errorData = error.response?.data;
            let errorMessage = t("pages.updateError");
            if (errorData?.title) errorMessage = errorData.title;
            if (errorData?.errors) {
              const errorDetails = Object.values(errorData.errors).flat().join("\n");
              errorMessage += `\n\n${errorDetails}`;
            }
            toast.error(errorMessage);
          },
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(t("pages.createSuccess"));
          navigate("/admin/pages");
        },
        onError: (error: any) => {
          const errorData = error.response?.data;
          let errorMessage = t("pages.createError");
          if (errorData?.title) errorMessage = errorData.title;
          if (errorData?.errors) {
            const errorDetails = Object.values(errorData.errors).flat().join("\n");
            errorMessage += `\n\n${errorDetails}`;
          }
          toast.error(errorMessage);
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const locationOptions = [
    { value: "TopMenu", label: t("pages.locationTopMenu") },
    { value: "MainMenu", label: t("pages.locationMainMenu") },
    { value: "Footer", label: t("pages.locationFooter") },
    { value: "DontAddToMenu", label: t("pages.locationStandalone") },
  ];

  if (isLoadingPage && isEditMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface">
        <Loader2 size={48} className="text-primary animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("pages.loadingArchive")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface lg:flex-row lg:overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/pages")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 shadow-sm active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {isEditMode ? t("pages.documentRevision") : t("pages.newTerminalPage")}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <Route size={10} className="text-primary" />
                  {t("pages.contentInfrastructure")}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 group active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditMode ? t("pages.commitChanges") : t("pages.deployPage")}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <FileText size={16} />
                  </div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t("pages.pageParameters")}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      {t("pages.documentTitle")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-4 transition-colors ${
                        errors.title ? "border-rose-400 focus:ring-rose-500/10" : "border-slate-200 focus:ring-primary/10 focus:border-primary"
                      }`}
                      placeholder={t("pages.titlePlaceholder")}
                    />
                    {errors.title && <p className="text-rose-500 text-xs font-black uppercase tracking-tight mt-1 ml-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t("pages.archiveSlug")}</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
                        placeholder={t("pages.slugPlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        {t("pages.localizationNode")} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors appearance-none cursor-pointer"
                      >
                        <option value="English">{t("formLabels.english")}</option>
                        <option value="Arabic">{t("formLabels.arabic")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    {t("pages.systemContent")} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={12}
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-[2rem] text-sm font-medium placeholder:text-slate-300 focus:ring-4 transition-colors font-mono leading-relaxed ${
                      errors.content ? "border-rose-400 focus:ring-rose-500/10" : "border-slate-200 focus:ring-primary/10 focus:border-primary"
                    }`}
                    placeholder={t("pages.contentPlaceholder")}
                  />
                  {errors.content && <p className="text-rose-500 text-xs font-black uppercase tracking-tight mt-1 ml-1">{errors.content}</p>}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                    <Globe2 size={16} />
                  </div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t("pages.metadataStrategy")}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t("pages.metaDescriptor")}</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
                      placeholder={t("pages.metaPlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t("pages.keywordPulse")}</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
                        placeholder={t("pages.keywordPlaceholder")}
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-6 py-3 bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-200 transition-colors active:scale-95"
                      >
                        {t("pages.attachKeyword")}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword) => (
                        <div
                          key={keyword}
                          className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-tight hover:border-primary/30 transition-colors"
                        >
                          {keyword}
                          <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="hover:text-rose-500 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] shadow-sm p-8 text-white space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/20">
                    <Layout size={16} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest">{t("pages.portalCluster")}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">{t("pages.menuInjectionPoint")}</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors cursor-pointer appearance-none"
                    >
                      {locationOptions.map((option) => (
                        <option className="bg-slate-900" key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">{t("pages.sequence")}</label>
                      <input
                        type="number"
                        name="menuOrder"
                        value={formData.menuOrder}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">{t("pages.parentNode")}</label>
                      <select
                        name="parentPageId"
                        value={formData.parentPageId || ""}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors appearance-none cursor-pointer"
                      >
                        <option className="bg-slate-900" value="">
                          {t("pages.globalRoot")}
                        </option>
                        {allPages?.items
                          ?.filter((page) => page.id !== id)
                          .map((page) => (
                            <option className="bg-slate-900" key={page.id} value={page.id}>
                              {page.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
                    <Settings size={16} />
                  </div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t("pages.visibilityLogic")}</h2>
                </div>

                <div className="space-y-3">
                  <ToggleButton id="showTitle" label={t("pages.displayDocumentTitle")} checked={formData.showTitle} onChange={handleChange} icon={<Eye size={14} />} />
                  <ToggleButton
                    id="showBreadcrumb"
                    label={t("pages.enableNavigationTrail")}
                    checked={formData.showBreadcrumb}
                    onChange={handleChange}
                    icon={<Layout size={14} />}
                  />
                  <ToggleButton
                    id="showRightColumn"
                    label={t("pages.deploySidebarWidget")}
                    checked={formData.showRightColumn}
                    onChange={handleChange}
                    icon={<Columns size={14} />}
                  />
                  <ToggleButton
                    id="showOnlyToRegisteredUsers"
                    label={t("pages.restrictToAuthorizedAgents")}
                    checked={formData.showOnlyToRegisteredUsers}
                    onChange={handleChange}
                    icon={<Users size={14} />}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleButton({
  id,
  label,
  checked,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-pointer group ${
        checked ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-slate-50 border-slate-100 hover:border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${checked ? "bg-primary text-white" : "bg-white text-slate-300"}`}>
          {icon}
        </div>
        <span className={`text-xs font-black uppercase tracking-tight transition-colors ${checked ? "text-primary" : "text-slate-500"}`}>{label}</span>
      </div>
      <div className="relative inline-flex items-center">
        <input type="checkbox" id={id} name={id} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </div>
    </label>
  );
}
