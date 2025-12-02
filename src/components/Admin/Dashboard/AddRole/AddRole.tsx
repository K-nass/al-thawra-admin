import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { rolesApi, type CreateRoleDto } from "@/api";

export default function AddRole() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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

    // Preset role permissions
    // Note: Using AddPost for both posts and reels, CanReferPost for both referring posts and reels
    // until backend adds AddReels and CanReferReels permissions
    const setAuthorPermissions = () => {
        setPermissions(["AddPost"]);
        setRoleNameEn("Author");
        setRoleNameAr("كاتب");
    };

    const setMemberPermissions = () => {
        setPermissions(["AddPost"]);
        setRoleNameEn("Member");
        setRoleNameAr("عضو");
    };

    const setWriterPermissions = () => {
        setPermissions(["AddPost", "CanReferPost"]);
        setRoleNameEn("Writer");
        setRoleNameAr("محرر");
    };

    // Create role mutation
    const createRoleMutation = useMutation({
        mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
        onSuccess: () => {
            // Navigate back to roles list on success
            navigate("/admin/roles-permissions");
        },
        onError: (err) => {
            setError("");
            setFieldErrors({});

            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;

                // Handle validation errors (422)
                if (err.response?.status === 422 && responseData?.errors) {
                    const errors: Record<string, string> = {};
                    Object.keys(responseData.errors).forEach((key) => {
                        const messages = responseData.errors[key];
                        errors[key.toLowerCase()] = Array.isArray(messages)
                            ? messages[0]
                            : messages;
                    });
                    setFieldErrors(errors);
                }
                // Handle general errors
                else if (responseData?.title) {
                    setError(responseData.title);
                } else if (responseData?.message) {
                    setError(responseData.message);
                } else {
                    setError(err.message || "Failed to create role");
                }
            } else {
                setError("An unexpected error occurred");
            }
        },
    });

    const handleSubmit = () => {
        // Clear previous errors
        setError("");
        setFieldErrors({});

        // Client-side validation
        if (!roleNameEn.trim()) {
            setFieldErrors({ name: "Role name is required" });
            return;
        }

        if (permissions.length === 0) {
            setError("Please select at least one permission");
            return;
        }

        // Submit the form
        createRoleMutation.mutate({
            name: roleNameEn,
            permissions,
        });
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{t('roles.addRole')}</h1>
                <Link
                    to="/admin/roles-permissions"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-emerald-700 transition-colors text-sm"
                >
                    <FontAwesomeIcon icon={faList} className="text-sm" />
                    {t('roles.rolesAndPermissions')}
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Error Message */}
                    {error && (
                        <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Role Name Inputs */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div>
                            <label
                                htmlFor="role-name-en"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                {t('roles.roleNameEnglish')}
                            </label>
                            <input
                                type="text"
                                id="role-name-en"
                                value={roleNameEn}
                                onChange={(e) => setRoleNameEn(e.target.value)}
                                placeholder="Role Name"
                                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    fieldErrors.name ? "border-red-500" : "border-slate-300"
                                }`}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="role-name-ar"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                {t('roles.roleNameArabic')}
                            </label>
                            <input
                                type="text"
                                id="role-name-ar"
                                value={roleNameAr}
                                onChange={(e) => setRoleNameAr(e.target.value)}
                                placeholder="Role Name"
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Quick Role Presets */}
                        <div className="border-t border-slate-200 pt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                {t('roles.quickRolePresets')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={setAuthorPermissions}
                                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                    {t('roles.authorPreset')}
                                </button>
                                <button
                                    type="button"
                                    onClick={setMemberPermissions}
                                    className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                >
                                    {t('roles.memberPreset')}
                                </button>
                                <button
                                    type="button"
                                    onClick={setWriterPermissions}
                                    className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                >
                                    {t('roles.writerPreset')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">
                            {t('roles.permissions')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-3 sm:gap-y-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddPost")}
                                        onChange={() => handlePermissionToggle("AddPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.addPost')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CanReferPost")}
                                        onChange={() => handlePermissionToggle("CanReferPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.canReferPost')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("ManageAllPosts")}
                                        onChange={() => handlePermissionToggle("ManageAllPosts")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.manageAllPosts')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Navigation")}
                                        onChange={() => handlePermissionToggle("Navigation")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.navigation')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Pages")}
                                        onChange={() => handlePermissionToggle("Pages")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.pages')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RSSFeeds")}
                                        onChange={() => handlePermissionToggle("RSSFeeds")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.rssFeeds')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Categories")}
                                        onChange={() => handlePermissionToggle("Categories")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.categories')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Tags")}
                                        onChange={() => handlePermissionToggle("Tags")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.tags')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Widgets")}
                                        onChange={() => handlePermissionToggle("Widgets")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.widgets')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Polls")}
                                        onChange={() => handlePermissionToggle("Polls")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.polls')}</span>
                                </label>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Gallery")}
                                        onChange={() => handlePermissionToggle("Gallery")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.gallery')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CommentsAndContactMessages")}
                                        onChange={() => handlePermissionToggle("CommentsAndContactMessages")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.commentsAndContactMessages')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Newsletter")}
                                        onChange={() => handlePermissionToggle("Newsletter")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.newsletter')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AdSpaces")}
                                        onChange={() => handlePermissionToggle("AdSpaces")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.adSpaces')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Users")}
                                        onChange={() => handlePermissionToggle("Users")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.users')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RolesAndPermissions")}
                                        onChange={() => handlePermissionToggle("RolesAndPermissions")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.rolesAndPermissionsOption')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("SEOTools")}
                                        onChange={() => handlePermissionToggle("SEOTools")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.seoTools')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Settings")}
                                        onChange={() => handlePermissionToggle("Settings")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.settings')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RewardSystem")}
                                        onChange={() => handlePermissionToggle("RewardSystem")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.rewardSystem')}</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AIWriter")}
                                        onChange={() => handlePermissionToggle("AIWriter")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{t('roles.aiWriter')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end p-4 sm:p-6 bg-gray-50">
                        <button
                            onClick={handleSubmit}
                            disabled={createRoleMutation.isPending}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createRoleMutation.isPending ? "Creating..." : "Add Role"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}