import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { 
  User, 
  ChevronLeft, 
  Save, 
  Upload, 
  Info, 
  Globe, 
  MessageCircle, 
  Share2,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { usersApi, type UpdateUserParams } from "@/api/users.api";
import Loader from "@/components/Common/Loader";
import FileModal from "../DashboardAddPost/DashboardForm/FileModal";
import { useToast } from "@/components/Toast/ToastContainer";

export default function EditUser() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { id } = useParams<{ id: string; username: string }>();

    const [formData, setFormData] = useState<UpdateUserParams>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [errors, setErrors] = useState<{UserName?: string, Email?: string}>({});

    // Fetch user profile
    const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ["currentUserProfile"],
        queryFn: () => usersApi.getCurrentProfile(),
    });

    useEffect(() => {
        if (userProfile) {
            const socialData: Record<string, string> = {};
            if (userProfile.socialAccounts) {
                Object.entries(userProfile.socialAccounts).forEach(([key, value]) => {
                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    socialData[normalizedKey] = (value as string) || "";
                });
            }

            setFormData({
                UserId: id,
                UserName: userProfile.userName,
                Email: userProfile.email,
                Slug: userProfile.slug || "", 
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

            if (userProfile.avatarImageUrl) {
                setAvatarPreview(userProfile.avatarImageUrl);
            }
        }
    }, [userProfile, id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarModalChange = (e: any) => {
        if (e.target.name === 'imageUrl') {
            setFormData((prev) => ({ ...prev, AvatarImage: e.target.value }));
            setAvatarPreview(e.target.value);
        }
    };

    const updateUserMutation = useMutation({
        mutationFn: (data: UpdateUserParams) => usersApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
            toast.success(t("users.updateSuccess", "User profile updated successfully"));
            setTimeout(() => navigate("/admin/users"), 1000);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                const responseData = err.response?.data;
                const msg = responseData?.title || responseData?.message || err.message;
                toast.error(msg);
            } else {
                toast.error(t("users.errors.generic", "An unexpected error occurred"));
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {UserName?: string, Email?: string} = {};
        
        if (!formData.UserName || formData.UserName.trim() === "") {
            newErrors.UserName = t("users.validation.userNameRequired") || "Username is required";
        }

        if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
            newErrors.Email = t("users.validation.emailInvalid") || "Invalid email address";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error(t("common.fixErrors") || "Please fix the errors in the form");
            return;
        }

        setErrors({});
        updateUserMutation.mutate(formData);
    };

    if (isLoadingProfile) return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );

    if (!userProfile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">User Not Found</h2>
                <button 
                  onClick={() => navigate("/admin/users")}
                  className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-emerald-600 transition-all"
                >
                  Return to Users
                </button>
            </div>
        );
    }

    const socialIcons: Record<string, string> = {
        Facebook: "facebook", Twitter: "twitter", Instagram: "instagram", TikTok: "tiktok",
        WhatsApp: "whatsapp", YouTube: "youtube", Discord: "discord", Telegram: "send",
        Pinterest: "pinterest", LinkedIn: "linkedin", Twitch: "twitch", VK: "vk",
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface h-screen">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/users")}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Manage user details, biography and social connections.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-sans">
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    
                    {/* Left Column: Avatar & Account Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Avatar Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <User size={16} className="text-primary" />
                                    Profile Image
                                </h3>
                            </div>
                            <div className="p-8 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-slate-50 shadow-inner group-hover:ring-primary/10 transition-all duration-300">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAvatarModal(true)}
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all shadow-lg shadow-primary/30"
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div>
                                <div className="mt-8 text-center space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Image Requirements</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Max size: 3MB. Formats: JPG, PNG, GIF.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <Info size={16} className="text-primary" />
                                    Account Identity
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                        Username <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="UserName"
                                        value={formData.UserName || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                                          errors.UserName ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                        }`}
                                    />
                                    {errors.UserName && (
                                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.UserName}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                                          errors.Email ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                        }`}
                                    />
                                    {errors.Email && (
                                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.Email}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Profile Slug (URL)</label>
                                    <input
                                        type="text"
                                        name="Slug"
                                        value={formData.Slug || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio & Social */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Biography Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <MessageCircle size={16} className="text-primary" />
                                    Professional Biography
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">About Me / Bio</label>
                                    <textarea
                                        name="AboutMe"
                                        value={formData.AboutMe || ""}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder="Write a short biography about yourself..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Personal Website URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            name="PersonalWebsiteUrl"
                                            value={formData.PersonalWebsiteUrl || ""}
                                            onChange={handleInputChange}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <Share2 size={16} className="text-primary" />
                                    Social Connect
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { name: "Facebook", label: "Facebook" },
                                        { name: "Twitter", label: "Twitter" },
                                        { name: "Instagram", label: "Instagram" },
                                        { name: "TikTok", label: "TikTok" },
                                        { name: "WhatsApp", label: "WhatsApp" },
                                        { name: "YouTube", label: "YouTube" },
                                        { name: "LinkedIn", label: "LinkedIn" },
                                        { name: "Telegram", label: "Telegram" },
                                        { name: "Twitch", label: "Twitch" },
                                    ].map((social) => (
                                        <div key={social.name} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{social.label}</label>
                                            <input
                                                type="text"
                                                name={social.name}
                                                value={(formData as any)[social.name] || ""}
                                                onChange={handleInputChange}
                                                placeholder={`Username`}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updateUserMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {updateUserMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {updateUserMutation.isPending ? "Saving..." : "Save Profile Details"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {showAvatarModal && (
                <FileModal
                    header="images"
                    onClose={() => setShowAvatarModal(false)}
                    handleChange={handleAvatarModalChange}
                />
            )}
        </div>
    );
}
