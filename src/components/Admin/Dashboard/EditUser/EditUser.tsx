import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  User, 
  ChevronLeft, 
  Save, 
  Upload, 
  Info, 
  Globe, 
  MessageCircle, 
  Share2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { usersApi, type UpdateUserParams } from "@/api/users.api";
import FileModal from "../DashboardAddPost/DashboardForm/FileModal";
import { useToast } from "@/components/Toast/ToastContainer";
import {
  extractApiErrorMessage,
  focusFirstErrorField,
  parseApiValidationErrors,
  type ModalFieldErrors,
} from "@/utils/apiFormErrors";

function normalizeSocialAccounts(accounts?: Record<string, string>) {
    const normalized: Record<string, string> = {};
    if (!accounts) return normalized;
    for (const [key, value] of Object.entries(accounts)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (typeof value === "string" && value.trim()) {
            normalized[normalizedKey] = value;
        }
    }
    return normalized;
}

export default function EditUser() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { id, username } = useParams<{ id: string; username: string }>();
    const serverFieldAliases = {
        userid: "UserId",
        username: "UserName",
        email: "Email",
        slug: "Slug",
        aboutme: "AboutMe",
        avatarimage: "AvatarImage",
        personalwebsiteurl: "PersonalWebsiteUrl",
    } as const;

    const [formData, setFormData] = useState<UpdateUserParams>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [errors, setErrors] = useState<ModalFieldErrors>({});

    useEffect(() => {
        focusFirstErrorField(errors);
    }, [errors]);

    // Fetch user profile
    const { data: userProfile, isLoading: isLoadingProfile, isError: isProfileError } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: () => usersApi.getProfile(username!, { PageNumber: 1, PageSize: 10 }),
        enabled: Boolean(username),
    });

    useEffect(() => {
        if (userProfile) {
            const social = normalizeSocialAccounts(userProfile.socialAccounts);

            setFormData({
                UserId: id,
                UserName: userProfile.userName,
                Email: userProfile.email,
                Slug: userProfile.slug || "", 
                AboutMe: userProfile.aboutMe || "",
                Facebook: social.facebook || "",
                Twitter: social.twitter || "",
                Instagram: social.instagram || "",
                TikTok: social.tiktok || "",
                WhatsApp: social.whatsapp || "",
                YouTube: social.youtube || "",
                Discord: social.discord || "",
                Telegram: social.telegram || "",
                Pinterest: social.pinterest || "",
                LinkedIn: social.linkedin || "",
                Twitch: social.twitch || "",
                VK: social.vk || "",
                PersonalWebsiteUrl: social.personalwebsiteurl || "",
            });

            const imageUrl = userProfile.profileImageUrl || userProfile.avatarImageUrl || null;
            setAvatarPreview(imageUrl);
        }
    }, [userProfile, id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
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
            queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
            toast.success(t("users.updateSuccess"));
            setTimeout(() => navigate("/admin/users"), 1000);
        },
        onError: (err) => {
            const parsed = parseApiValidationErrors(err, serverFieldAliases);
            if (Object.keys(parsed.fieldErrors).length > 0) {
                setErrors(parsed.fieldErrors);
                toast.error(parsed.messages[0] || t("common.fixErrors"));
                return;
            }

            toast.error(extractApiErrorMessage(err, t("users.errors.unexpected")));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: ModalFieldErrors = {};
        
        if (!formData.UserName || formData.UserName.trim() === "") {
            newErrors.UserName = t("users.validation.userNameRequired");
        }

        if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
            newErrors.Email = t("users.validation.emailInvalid");
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error(t("common.fixErrors"));
            return;
        }

        setErrors({});
        updateUserMutation.mutate({ ...formData, UserId: id });
    };

    if (!id || !username) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{t("users.invalidUser")}</h2>
                <button 
                  onClick={() => navigate("/admin/users")}
                  className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-emerald-600 transition-colors duration-200"
                >
                  {t("users.returnToUsers")}
                </button>
            </div>
        );
    }

    if (isLoadingProfile) return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );

    if (isProfileError || !userProfile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{t("users.userNotFound")}</h2>
                <button 
                  onClick={() => navigate("/admin/users")}
                  className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-emerald-600 transition-colors duration-200"
                >
                  {t("users.returnToUsers")}
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface">
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
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("users.editProfile")}</h1>
                            <p className="text-sm text-slate-500 mt-0.5">{t("users.editProfileSubtitle")}</p>
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
                                    {t("users.profileImage")}
                                </h3>
                            </div>
                            <div className="p-8 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-slate-50 shadow-inner group-hover:ring-primary/10 transition-colors duration-300">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={t("users.profileImage")}
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
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors duration-200 shadow-sm"
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div>
                                <div className="mt-8 text-center space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("users.imageRequirements")}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {t("users.imageRequirementsHint")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <Info size={16} className="text-primary" />
                                    {t("users.accountIdentity")}
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">
                                        {t("users.userName")} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="UserName"
                                        value={formData.UserName || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 font-semibold text-slate-800 ${
                                          errors.UserName ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                        }`}
                                    />
                                    {errors.UserName && (
                                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.UserName}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">
                                        {t("users.emailAddress")} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 font-semibold text-slate-800 ${
                                          errors.Email ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                                        }`}
                                    />
                                    {errors.Email && (
                                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight mt-1 ml-1">{errors.Email}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">{t("users.profileSlug")}</label>
                                    <input
                                        type="text"
                                        name="Slug"
                                        value={formData.Slug || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors duration-200 font-semibold text-slate-800"
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
                                    {t("users.professionalBiography")}
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">{t("users.aboutMe")}</label>
                                    <textarea
                                        name="AboutMe"
                                        value={formData.AboutMe || ""}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder={t("users.placeholders.aboutMe")}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors duration-200 font-medium resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">{t("users.personalWebsiteUrl")}</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            name="PersonalWebsiteUrl"
                                            value={formData.PersonalWebsiteUrl || ""}
                                            onChange={handleInputChange}
                                            placeholder={t("users.placeholders.website")}
                                            className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors duration-200"
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
                                    {t("users.socialConnect")}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { name: "Facebook", labelKey: "users.socialPlatforms.facebook" },
                                        { name: "Twitter", labelKey: "users.socialPlatforms.twitter" },
                                        { name: "Instagram", labelKey: "users.socialPlatforms.instagram" },
                                        { name: "TikTok", labelKey: "users.socialPlatforms.tikTok" },
                                        { name: "WhatsApp", labelKey: "users.socialPlatforms.whatsApp" },
                                        { name: "YouTube", labelKey: "users.socialPlatforms.youTube" },
                                        { name: "LinkedIn", labelKey: "users.socialPlatforms.linkedIn" },
                                        { name: "Telegram", labelKey: "users.socialPlatforms.telegram" },
                                        { name: "Twitch", labelKey: "users.socialPlatforms.twitch" },
                                    ].map((social) => (
                                        <div key={social.name} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">{t(social.labelKey)}</label>
                                            <input
                                                type="text"
                                                name={social.name}
                                                value={(formData as any)[social.name] || ""}
                                                onChange={handleInputChange}
                                                placeholder={t("users.placeholders.socialUserName")}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors duration-200 font-medium"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updateUserMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {updateUserMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {updateUserMutation.isPending ? t("common.saving") : t("users.saveProfileDetails")}
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
