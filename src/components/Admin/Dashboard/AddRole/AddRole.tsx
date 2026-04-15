import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { 
  Shield, 
  ChevronLeft, 
  Check, 
  Info, 
  Save, 
  Loader2,
  Lock,
  Edit3,
  Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { rolesApi, type CreateRoleDto } from "@/api";
import { useToast } from "@/components/Toast/ToastContainer";

export default function AddRole() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [roleNameEn, setRoleNameEn] = useState("");
    const [roleNameAr, setRoleNameAr] = useState("");
    const [permissions, setPermissions] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handlePermissionToggle = (permission: string) => {
        setPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const presetRoles = [
        { name: "Author", nameAr: "كاتب", perms: ["AddPost"], color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100" },
        { name: "Member", nameAr: "عضو", perms: ["AddPost"], color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" },
        { name: "Writer", nameAr: "محرر", perms: ["AddPost", "CanReferPost"], color: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100" },
    ];

    const applyPreset = (preset: typeof presetRoles[0]) => {
        setPermissions(preset.perms);
        setRoleNameEn(preset.name);
        setRoleNameAr(preset.nameAr);
        toast.info(t('roles.presetApplied', { name: preset.name }));
    };

    const createRoleMutation = useMutation({
        mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
        onSuccess: () => {
            toast.success(t('roles.successCreate'));
            navigate("/admin/roles-permissions");
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                if (err.response?.status === 422 && responseData?.errors) {
                    const errors: Record<string, string> = {};
                    Object.keys(responseData.errors).forEach((key) => {
                        const messages = responseData.errors[key];
                        errors[key.toLowerCase()] = Array.isArray(messages) ? messages[0] : messages;
                    });
                    setFieldErrors(errors);
                    toast.error(t('common.validationError'));
                } else {
                    const msg = responseData?.title || responseData?.message || err.message;
                    setError(msg);
                    toast.error(msg);
                }
            } else {
                setError(t("users.errors.unexpected"));
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        if (!roleNameEn.trim()) {
            setFieldErrors({ name: t("roles.roleNameRequired") });
            return;
        }

        if (permissions.length === 0) {
            setError(t("roles.selectPermissionRequired"));
            toast.info(t("roles.selectPermissionRequired"));
            return;
        }

        createRoleMutation.mutate({
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
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('roles.addRole')}</h1>
                            <p className="text-sm text-slate-500 mt-0.5">{t("roles.addRoleSubtitle")}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin/roles-permissions"
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors duration-200 gap-2"
                        >
                            {t('roles.rolesAndPermissions')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-12">
                    {/* General Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Info size={18} className="text-primary" />
                                {t('roles.generalInfo', 'General Information')}
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* English Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                        {t('roles.roleNameEnglish')}
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={roleNameEn}
                                            onChange={(e) => setRoleNameEn(e.target.value)}
                                            placeholder={t("roles.roleNameExample")}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                                fieldErrors.name 
                                                  ? 'border-red-300 focus:ring-red-100' 
                                                  : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                            }`}
                                        />
                                    </div>
                                    {fieldErrors.name && (
                                        <p className="px-1 text-xs font-medium text-red-500">{fieldErrors.name}</p>
                                    )}
                                </div>

                                {/* Arabic Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                        {t('roles.roleNameArabic')}
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={roleNameAr}
                                            onChange={(e) => setRoleNameAr(e.target.value)}
                                            placeholder="مثال: مشرف"
                                            dir="rtl"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors duration-200 text-right"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Presets */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 block mb-3">
                                    {t('roles.quickRolePresets')}
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {presetRoles.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${preset.color}`}
                                        >
                                            {preset.name} ({preset.nameAr})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                            disabled={createRoleMutation.isPending}
                            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-semibold text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {createRoleMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {createRoleMutation.isPending ? t('roles.creating') : t('roles.addRole')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
