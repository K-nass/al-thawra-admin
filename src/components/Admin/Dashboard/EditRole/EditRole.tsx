import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, 
  ChevronLeft, 
  Check, 
  Info, 
  Save, 
  Loader2,
  Lock,
  Globe,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { rolesApi } from "@/api";
import Loader from "@/components/Common/Loader";
import { useToast } from "@/components/Toast/ToastContainer";
import {
    extractApiErrorMessage,
    focusFirstErrorField,
    parseApiValidationErrors,
    type ModalFieldErrors,
} from "@/utils/apiFormErrors";

export default function EditRole() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { id } = useParams<{ id: string }>();
    const serverFieldAliases = {
        roleid: "roleId",
        name: "name",
        rolename: "name",
        permissions: "permissions",
        permissions0: "permissions",
    } as const;
    
    const [roleNameEn, setRoleNameEn] = useState("");
    const [roleNameAr, setRoleNameAr] = useState("");
    const [permissions, setPermissions] = useState<string[]>([]);
    const [apiError, setApiError] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<ModalFieldErrors>({});

    useEffect(() => {
        focusFirstErrorField(fieldErrors);
    }, [fieldErrors]);

    const { data: rolesResponse, isLoading: isLoadingRole } = useQuery({
        queryKey: ["roles"],
        queryFn: () => rolesApi.getAll({ pageSize: 90 }),
    });

    const roleData = rolesResponse?.items.find(role => role.id === id);

    useEffect(() => {
        if (roleData) {
            setRoleNameEn(roleData.name);
            setPermissions(roleData.permissions || []);
        }
    }, [roleData]);

    const handlePermissionToggle = (permission: string) => {
        setPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
        setFieldErrors((prev) => {
            if (!prev.permissions) return prev;
            const next = { ...prev };
            delete next.permissions;
            return next;
        });
        setApiError("");
    };

    const updateRoleMutation = useMutation({
        mutationFn: (data: { roleId: string; name: string; permissions: string[] }) =>
            rolesApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success(t('roles.successUpdate'));
            navigate("/admin/roles-permissions");
        },
        onError: (err) => {
            const parsed = parseApiValidationErrors(err, serverFieldAliases);
            if (Object.keys(parsed.fieldErrors).length > 0) {
                setFieldErrors(parsed.fieldErrors);
                setApiError("");
                toast.error(parsed.messages[0] || t('common.validationError'));
                return;
            }

            const message = extractApiErrorMessage(err, t("users.errors.unexpected"));
            setApiError(message);
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");
        setFieldErrors({});

        if (!roleNameEn.trim()) {
            setFieldErrors({ name: t("roles.roleNameRequired") });
            return;
        }

        if (permissions.length === 0) {
            setFieldErrors({ permissions: t("roles.selectPermissionRequired") });
            toast.error(t("roles.selectPermissionRequired"));
            return;
        }

        updateRoleMutation.mutate({
            roleId: id!,
            name: roleNameEn,
            permissions,
        });
    };

    const allAvailablePermissions = [
        { id: "AddPost", label: t('roles.addPost') },
        { id: "CanReferPost", label: t('roles.canReferPost') },
        { id: "ManageAllPosts", label: t('roles.manageAllPosts') },
        { id: "Navigation", label: t('roles.navigation') },
        { id: "Pages", label: t('roles.pages') },
        { id: "RSSFeeds", label: t('roles.rssFeeds') },
        { id: "Categories", label: t('roles.categories') },
        { id: "Tags", label: t('roles.tags') },
        { id: "Widgets", label: t('roles.widgets') },
        { id: "Polls", label: t('roles.polls') },
        { id: "CommentsAndContactMessages", label: t('roles.commentsAndContactMessages') },
        { id: "Newsletter", label: t('roles.newsletter') },
        { id: "AdSpaces", label: t('roles.adSpaces') },
        { id: "Users", label: t('roles.users') },
        { id: "RolesAndPermissions", label: t('roles.rolesAndPermissionsOption') },
        { id: "SEOTools", label: t('roles.seoTools') },
        { id: "Settings", label: t('roles.settings') },
        { id: "RewardSystem", label: t('roles.rewardSystem') },
        { id: "AIWriter", label: t('roles.aiWriter') },
    ];

    if (isLoadingRole) {
        return (
            <div className="flex-1 flex items-center justify-center bg-surface">
                <Loader />
            </div>
        );
    }

    if (!roleData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{t("roles.roleNotFound")}</h2>
                <p className="text-slate-500 mt-2">{t("roles.roleNotFoundMessage")}</p>
                <button 
                  onClick={() => navigate("/admin/roles-permissions")}
                  className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-emerald-600 transition-colors duration-200"
                >
                  {t("roles.returnToRoles")}
                </button>
            </div>
        );
    }

    const isSystemRole = roleData.isDefault;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                {t('roles.editRole')}
                                {isSystemRole && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest font-bold border border-slate-200 ml-2">{t("roles.systemRoot")}</span>}
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">{t("roles.editRoleSubtitle", { name: roleData.name })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-sans">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-12">
                    {/* General Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Info size={18} className="text-primary" />
                                {t('roles.generalInfo', 'General Information')}
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Role Name */}
                                <div className="space-y-1.5 flex flex-col">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                        {t('roles.roleNameEnglish')}
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={roleNameEn}
                                            onChange={(e) => {
                                                setRoleNameEn(e.target.value);
                                                setApiError("");
                                                setFieldErrors((prev) => {
                                                    if (!prev.name) return prev;
                                                    const next = { ...prev };
                                                    delete next.name;
                                                    return next;
                                                });
                                            }}
                                            placeholder={t("roles.roleNameExample")}
                                            disabled={isSystemRole}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                                isSystemRole ? 'opacity-70 cursor-not-allowed bg-slate-100 border-slate-200' :
                                                fieldErrors.name 
                                                  ? 'border-red-300 focus:ring-red-100' 
                                                  : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                            }`}
                                        />
                                    </div>
                                    {isSystemRole && <p className="text-[10px] text-slate-400 mt-1 ml-1">{t("roles.systemRoleRenameHint")}</p>}
                                    {fieldErrors.name && (
                                        <p className="px-1 text-xs font-medium text-red-500">{fieldErrors.name}</p>
                                    )}
                                </div>

                                {/* Placeholder for Arabic name/future use */}
                                <div className="space-y-1.5 flex flex-col opacity-50">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                        {t('roles.roleNameArabic')}
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={roleNameAr}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none cursor-not-allowed text-right"
                                            dir="rtl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div
                        className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                            fieldErrors.permissions ? "border-rose-300" : "border-slate-200"
                        }`}
                        data-error-field={fieldErrors.permissions ? "permissions" : undefined}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Lock size={18} className="text-primary" />
                                {t('roles.permissions')}
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setPermissions(permissions.length === allAvailablePermissions.length ? [] : allAvailablePermissions.map(p => p.id))}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                {permissions.length === allAvailablePermissions.length ? t('common.unselectAll') : t('common.selectAll')}
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                                {allAvailablePermissions.map((perm) => (
                                    <label 
                                        key={perm.id} 
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors duration-200 ${
                                            permissions.includes(perm.id) 
                                                ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10' 
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="mt-0.5 relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={permissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-colors duration-200 checked:border-primary checked:bg-primary"
                                            />
                                            <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-semibold transition-colors ${permissions.includes(perm.id) ? 'text-primary' : 'text-slate-700'}`}>
                                                {perm.label}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {fieldErrors.permissions && (
                                <p className="px-1 mt-4 text-xs font-medium text-red-500">{fieldErrors.permissions}</p>
                            )}
                            {apiError && (
                                <p className="px-1 mt-2 text-xs font-medium text-red-500">{apiError}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-semibold text-sm shadow-sm"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={updateRoleMutation.isPending}
                            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-semibold text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {updateRoleMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {updateRoleMutation.isPending ? t('common.saving') : t('common.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
