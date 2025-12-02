import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { rolesApi } from "@/api";
import Loader from "@/components/Common/Loader";

export default function EditRole() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const [roleNameEn, setRoleNameEn] = useState("");
    const [roleNameAr, setRoleNameAr] = useState("");
    const [permissions, setPermissions] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Fetch all roles and find the specific one
    const { data: rolesResponse, isLoading: isLoadingRole } = useQuery({
        queryKey: ["roles"],
        queryFn: () => rolesApi.getAll({ pageSize: 90 }),
    });

    // Find the specific role from the list
    const roleData = rolesResponse?.items.find(role => role.id === id);

    // Populate form when role data is loaded
    useEffect(() => {
        if (roleData) {
            console.log("Loading role data:", roleData);
            console.log("Role permissions:", roleData.permissions);
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
    };

    // Update role mutation
    const updateRoleMutation = useMutation({
        mutationFn: (data: { roleId: string; name: string; permissions: string[] }) =>
            rolesApi.update(id!, data),
        onSuccess: () => {
            // Invalidate roles cache to refetch updated data
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            // Navigate back to roles list
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
                    setError(err.message || "Failed to update role");
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
        updateRoleMutation.mutate({
            roleId: id!,
            name: roleNameEn,
            permissions,
        });
    };

    if (isLoadingRole) {
        return <Loader />;
    }

    if (!roleData) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Role not found</h2>
                    <Link to="/admin/roles-permissions" className="text-primary hover:underline">
                        Back to Roles
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Edit Role</h1>
                <Link
                    to="/admin/roles-permissions"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-emerald-700 transition-colors text-sm"
                >
                    <FontAwesomeIcon icon={faList} className="text-sm" />
                    Roles
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
                                Role Name (English)
                            </label>
                            <input
                                type="text"
                                id="role-name-en"
                                value={roleNameEn}
                                onChange={(e) => setRoleNameEn(e.target.value)}
                                placeholder="Role Name"
                                disabled={roleData.isDefault}
                                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                    fieldErrors.name ? "border-red-500" : "border-slate-300"
                                }`}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                            )}
                            {roleData.isDefault && (
                                <p className="mt-1 text-xs text-slate-500">Default roles cannot be renamed</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="role-name-ar"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Role Name (Arabic)
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
                    </div>

                    {/* Permissions */}
                    <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">
                            Permissions
                        </h3>
                        
                        {/* Hardcoded permissions for Author and Member roles */}
                        {(roleNameEn === "Author" || roleNameEn === "Member") && (
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddPost")}
                                        onChange={() => handlePermissionToggle("AddPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Post</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddReels")}
                                        onChange={() => handlePermissionToggle("AddReels")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Reels</span>
                                </label>
                            </div>
                        )}

                        {/* Hardcoded permissions for Writer role */}
                        {roleNameEn === "Writer" && (
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddPost")}
                                        onChange={() => handlePermissionToggle("AddPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Post</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddReels")}
                                        onChange={() => handlePermissionToggle("AddReels")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Reels</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CanReferPost")}
                                        onChange={() => handlePermissionToggle("CanReferPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Can Refer Post</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CanReferReels")}
                                        onChange={() => handlePermissionToggle("CanReferReels")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Can Refer Reels</span>
                                </label>
                            </div>
                        )}

                        {/* All permissions for other roles */}
                        {roleNameEn !== "Author" && roleNameEn !== "Member" && roleNameEn !== "Writer" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-3 sm:gap-y-4">
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddPost")}
                                        onChange={() => handlePermissionToggle("AddPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Post</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AddReels")}
                                        onChange={() => handlePermissionToggle("AddReels")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Add Reels</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CanReferPost")}
                                        onChange={() => handlePermissionToggle("CanReferPost")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Can Refer Post</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CanReferReels")}
                                        onChange={() => handlePermissionToggle("CanReferReels")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Can Refer Reels</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("ManageAllPosts")}
                                        onChange={() => handlePermissionToggle("ManageAllPosts")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Manage All Posts</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Navigation")}
                                        onChange={() => handlePermissionToggle("Navigation")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Navigation</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Pages")}
                                        onChange={() => handlePermissionToggle("Pages")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Pages</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RSSFeeds")}
                                        onChange={() => handlePermissionToggle("RSSFeeds")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">RSS Feeds</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Categories")}
                                        onChange={() => handlePermissionToggle("Categories")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Categories</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Tags")}
                                        onChange={() => handlePermissionToggle("Tags")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Tags</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Widgets")}
                                        onChange={() => handlePermissionToggle("Widgets")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Widgets</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Polls")}
                                        onChange={() => handlePermissionToggle("Polls")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Polls</span>
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
                                    <span className="ml-3 text-sm text-slate-700">Gallery</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("CommentsAndContactMessages")}
                                        onChange={() => handlePermissionToggle("CommentsAndContactMessages")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Comments & Contact Messages</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Newsletter")}
                                        onChange={() => handlePermissionToggle("Newsletter")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Newsletter</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AdSpaces")}
                                        onChange={() => handlePermissionToggle("AdSpaces")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Ad Spaces</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Users")}
                                        onChange={() => handlePermissionToggle("Users")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Users</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RolesAndPermissions")}
                                        onChange={() => handlePermissionToggle("RolesAndPermissions")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Roles & Permissions</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("SEOTools")}
                                        onChange={() => handlePermissionToggle("SEOTools")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">SEO Tools</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("Settings")}
                                        onChange={() => handlePermissionToggle("Settings")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Settings</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("RewardSystem")}
                                        onChange={() => handlePermissionToggle("RewardSystem")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Reward System</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes("AIWriter")}
                                        onChange={() => handlePermissionToggle("AIWriter")}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">AI Writer</span>
                                </label>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end p-4 sm:p-6 bg-gray-50">
                        <button
                            onClick={handleSubmit}
                            disabled={updateRoleMutation.isPending || roleData.isDefault}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
