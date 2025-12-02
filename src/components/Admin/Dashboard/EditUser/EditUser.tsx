import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faUpload, faUser, faTrash, faBan } from "@fortawesome/free-solid-svg-icons";
import { usersApi, type UpdateUserParams } from "@/api/users.api";
import Loader from "@/components/Common/Loader";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";

export default function EditUser() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id, username } = useParams<{ id: string; username: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UpdateUserParams>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showBanDialog, setShowBanDialog] = useState(false);

    // Fetch user profile using username
    const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: () => usersApi.getProfile(username!),
        enabled: !!username,
    });

    // Populate form when user profile is loaded
    useEffect(() => {
        if (userProfile) {
            // Map social accounts from profile to form data
            const socialData: Record<string, string> = {};
            if (userProfile.socialAccounts) {
                Object.entries(userProfile.socialAccounts).forEach(([key, value]) => {
                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    socialData[normalizedKey] = value || "";
                });
            }

            setFormData({
                UserId: id,
                UserName: userProfile.userName,
                Email: userProfile.email,
                Slug: "", // Not available in profile
                AboutMe: userProfile.aboutMe || "",
                Facebook: socialData.Facebook || "",
                Twitter: socialData.Twitter || "",
                Instagram: socialData.Instagram || "",
                TikTok: socialData.TikTok || "",
                WhatsApp: socialData.WhatsApp || "",
                YouTube: socialData.YouTube || "",
                Discord: socialData.Discord || "",
                Telegram: socialData.Telegram || "",
                Pinterest: socialData.Pinterest || "",
                LinkedIn: socialData.LinkedIn || "",
                Twitch: socialData.Twitch || "",
                VK: socialData.Vk || socialData.VK || "",
                PersonalWebsiteUrl: socialData.PersonalWebsiteUrl || "",
            });

            if (userProfile.profileImageUrl) {
                setAvatarPreview(userProfile.profileImageUrl);
            }
        }
    }, [userProfile, id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, AvatarImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateUserMutation = useMutation({
        mutationFn: (data: UpdateUserParams) => usersApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", id] });
            setSuccessMessage("User updated successfully");
            setError("");
            setTimeout(() => {
                navigate("/admin/users");
            }, 1500);
        },
        onError: (err) => {
            setSuccessMessage("");
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                if (responseData?.title) {
                    setError(responseData.title);
                } else if (responseData?.message) {
                    setError(responseData.message);
                } else {
                    setError(err.message || "Failed to update user");
                }
            } else {
                setError("An unexpected error occurred");
            }
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: () => usersApi.delete(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setSuccessMessage("User deleted successfully");
            setError("");
            setTimeout(() => {
                navigate("/admin/users");
            }, 1500);
        },
        onError: (err) => {
            setSuccessMessage("");
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                if (responseData?.title) {
                    setError(responseData.title);
                } else if (responseData?.message) {
                    setError(responseData.message);
                } else {
                    setError(err.message || "Failed to delete user");
                }
            } else {
                setError("An unexpected error occurred");
            }
        },
    });

    const banUserMutation = useMutation({
        mutationFn: () => usersApi.ban(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
            setSuccessMessage("User banned successfully");
            setError("");
            setTimeout(() => {
                navigate("/admin/users");
            }, 1500);
        },
        onError: (err) => {
            setSuccessMessage("");
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                if (responseData?.title) {
                    setError(responseData.title);
                } else if (responseData?.message) {
                    setError(responseData.message);
                } else {
                    setError(err.message || "Failed to ban user");
                }
            } else {
                setError("An unexpected error occurred");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserMutation.mutate(formData);
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleBan = () => {
        setShowBanDialog(true);
    };

    const confirmDelete = () => {
        setShowDeleteDialog(false);
        deleteUserMutation.mutate();
    };

    const confirmBan = () => {
        setShowBanDialog(false);
        banUserMutation.mutate();
    };

    if (isLoadingProfile) return <Loader />;

    if (!userProfile) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">User not found</h2>
                    <Link to="/admin/users" className="text-primary hover:underline">
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white border-b border-slate-200">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Edit User</h1>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleBan}
                        disabled={banUserMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faBan} />
                        {banUserMutation.isPending ? "Banning..." : "Ban User"}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteUserMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                    </button>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Users
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Avatar & Basic Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Avatar Card */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Picture</h3>
                                <div className="flex flex-col items-center">
                                    <div className="relative w-32 h-32 mb-4">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="w-full h-full rounded-full object-cover border-4 border-slate-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <FontAwesomeIcon icon={faUser} className="text-4xl" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            <FontAwesomeIcon icon={faUpload} className="text-xs" />
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <p className="text-xs text-slate-500 text-center">
                                        Allowed *.jpeg, *.jpg, *.png, *.gif
                                        <br />
                                        Max size of 3.1 MB
                                    </p>
                                </div>
                            </div>

                            {/* Basic Info Card */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="UserName"
                                            value={formData.UserName || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="Email"
                                            value={formData.Email || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            name="Slug"
                                            value={formData.Slug || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">About Me</label>
                                        <textarea
                                            name="AboutMe"
                                            value={formData.AboutMe || ""}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Personal Website</label>
                                        <input
                                            type="url"
                                            name="PersonalWebsiteUrl"
                                            value={formData.PersonalWebsiteUrl || ""}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Social Media */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Social Media Profiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: "Facebook", label: "Facebook" },
                                        { name: "Twitter", label: "Twitter" },
                                        { name: "Instagram", label: "Instagram" },
                                        { name: "TikTok", label: "TikTok" },
                                        { name: "WhatsApp", label: "WhatsApp" },
                                        { name: "YouTube", label: "YouTube" },
                                        { name: "Discord", label: "Discord" },
                                        { name: "Telegram", label: "Telegram" },
                                        { name: "Pinterest", label: "Pinterest" },
                                        { name: "LinkedIn", label: "LinkedIn" },
                                        { name: "Twitch", label: "Twitch" },
                                        { name: "VK", label: "VK" },
                                    ].map((social) => (
                                        <div key={social.name}>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{social.label}</label>
                                            <input
                                                type="text"
                                                name={social.name}
                                                value={(formData as any)[social.name] || ""}
                                                onChange={handleInputChange}
                                                placeholder={`${social.label} URL or Username`}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button - Outside grid for better visibility */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={updateUserMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-green-500 rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {updateUserMutation.isPending ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />

            <ConfirmDialog
                isOpen={showBanDialog}
                title="Ban User"
                message="Are you sure you want to ban this user? This will deactivate their account."
                confirmText="Ban"
                cancelText="Cancel"
                onConfirm={confirmBan}
                onCancel={() => setShowBanDialog(false)}
                type="warning"
            />
        </div>
    );
}
