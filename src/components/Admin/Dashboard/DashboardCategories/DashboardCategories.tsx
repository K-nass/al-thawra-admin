import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type Category } from "@/api/categories.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  EyeOff,
  Globe2,
  LayoutDashboard,
  Home as HomeIcon,
  ChevronRight,
  TrendingUp,
  Hash,
  Activity,
  FolderTree,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardCategories() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", languageFilter],
    queryFn: () =>
      categoriesApi.getAll({
        Language: languageFilter === "all" ? undefined : languageFilter,
        WithSub: true,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("categories.deleteSuccess"));
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("categories.deleteError"));
    },
  });

  const filteredCategories = categories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const parentCategories = filteredCategories.filter((cat: Category) => !cat.parentCategoryId);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FolderTree size={16} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t("categories.taxonomyController")}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("categories.title")}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{t("categories.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/add-category")}
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("categories.addCategory")}
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />

          <div className="flex flex-col md:flex-row gap-6 relative">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("categories.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors"
              />
            </div>
            <div className="w-full md:w-72">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="all">{t("categories.allLanguages")}</option>
                <option value="English">{t("formLabels.english")}</option>
                <option value="Arabic">{t("formLabels.arabic")}</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.loadingTaxonomy")}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t("categories.emptyStateTitle")}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none italic">{t("categories.noCategories")}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                  <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.hierarchyType")}</TableHead>
                  <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.localization")}</TableHead>
                  <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.visualMarker")}</TableHead>
                  <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.sequence")}</TableHead>
                  <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.population")}</TableHead>
                  <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.portalState")}</TableHead>
                  <TableHead className="text-right px-8 text-xs font-black text-slate-400 uppercase tracking-widest">{t("categories.registry")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentCategories.map((category: Category) => (
                  <CategoryRows
                    key={category.id}
                    category={category}
                    t={t}
                    navigate={navigate}
                    handleDelete={(id: string, name: string) => setDeleteConfirm({ id, name })}
                    isPending={deleteMutation.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={`${t("categories.deleteTitle")}: ${deleteConfirm?.name ?? ""}`}
        message={t("categories.deleteMessage")}
        confirmText={deleteMutation.isPending ? t("common.deleting") : t("categories.confirmDelete")}
        cancelText={t("common.cancel")}
        onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        type="danger"
      />
    </div>
  );
}

function CategoryRows({
  category,
  t,
  navigate,
  handleDelete,
  isPending,
  isSub = false,
}: {
  category: Category;
  t: (key: string, options?: Record<string, unknown>) => string;
  navigate: (path: string) => void;
  handleDelete: (id: string, name: string) => void;
  isPending: boolean;
  isSub?: boolean;
}) {
  return (
    <>
      <TableRow className={`group transition-colors border-b border-slate-100 last:border-0 ${isSub ? "bg-slate-50/20" : "hover:bg-slate-50/50"}`}>
        <TableCell className="px-8 flex items-center gap-3">
          <div className="flex items-center gap-2 py-4">
            {isSub ? (
              <div className="flex items-center gap-2 opacity-40">
                <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Hash size={16} />
              </div>
            )}
            <div className="flex flex-col">
              <span className={`font-black tracking-tight text-sm uppercase transition-colors ${isSub ? "text-slate-500 text-xs" : "text-slate-900 group-hover:text-primary"}`}>{category.name}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isSub ? t("categories.terminalLink") : t("categories.clusterNode")}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={category.language === "Arabic" ? "warning" : "primary"} className="rounded-lg px-2.5 py-1">
            <Globe2 className="w-3 h-3 mr-1.5 opacity-70" />
            {category.language === "Arabic" ? "AR" : "EN"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-lg shadow-sm border-2 border-white transition-transform group-hover:scale-110"
              style={{ backgroundColor: category.colorHex }}
            />
            <code className="text-xs font-black text-slate-400 uppercase tracking-tighter ring-1 ring-slate-100 px-1.5 py-0.5 rounded bg-slate-50">{category.colorHex}</code>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5 font-black text-slate-400 text-xs ring-1 ring-slate-100 w-fit px-2 py-0.5 rounded-md bg-slate-50/50">#{category.order}</div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-black tracking-tight text-xs">
              <TrendingUp size={12} className="text-emerald-500" />
              {category.postsCount}
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("categories.contentRecords")}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {category.showOnMenu && (
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/50 shadow-sm" title={t("categories.showOnMenu")}>
                  <LayoutDashboard size={12} />
                </div>
              )}
              {category.showOnHomepage && (
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/50 shadow-sm" title={t("categories.showOnHomepage")}>
                  <HomeIcon size={12} />
                </div>
              )}
            </div>
            {category.isActive ? (
              <Badge variant="success" className="px-2.5 py-1 rounded-lg">
                <Activity className="w-3 h-3 mr-1.5 opacity-70" />
                {t("categories.live")}
              </Badge>
            ) : (
              <Badge variant="info" className="px-2.5 py-1 rounded-lg text-slate-400">
                <EyeOff className="w-3 h-3 mr-1.5 opacity-70" />
                {t("categories.hidden")}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="px-8">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/edit-category/${category.slug}`)}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors border border-transparent hover:border-primary/20"
              title={t("common.edit")}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(category.id, category.name)}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
              title={t("common.delete")}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </TableCell>
      </TableRow>
      {category.subCategories &&
        category.subCategories.length > 0 &&
        category.subCategories.map((subCat: Category) => (
          <CategoryRows
            key={subCat.id}
            category={subCat}
            t={t}
            navigate={navigate}
            handleDelete={handleDelete}
            isPending={isPending}
            isSub={true}
          />
        ))}
    </>
  );
}
