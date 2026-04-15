import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useTranslation } from "react-i18next";

export default function DashboardProfileCard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith("ar");
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getUserProfile,
  });

  if (isLoading) {
    return (
      <div className="flex items-center p-4 mt-3">
        <div className="w-12 h-12 rounded-full ltr:mr-4 rtl:ml-4 bg-slate-600 animate-pulse"></div>
        <div>
          <div className="h-4 w-20 bg-slate-600 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-16 bg-slate-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 mt-3">
      <div className="w-12 h-12 rounded-full ltr:mr-4 rtl:ml-4 overflow-hidden flex items-center justify-center bg-slate-600">
        {userProfile?.avatarImageUrl ? (
          <img
            alt={`${userProfile.userName} avatar`}
            className="w-full h-full object-cover"
            src={userProfile.avatarImageUrl}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 text-white text-xl font-bold">
            {userProfile?.userName?.charAt(0).toUpperCase() || "A"}
          </div>
        )}
      </div>
      <div>
        <p className="font-semibold text-white text-[15px]">{userProfile?.userName || t("dashboard.adminPanel")}</p>
        <div className="flex items-center text-xs text-green-400">
          <span className={`w-2 h-2 bg-green-400 rounded-full ${isRtl ? 'ml-1.5' : 'mr-1.5'}`}></span>
          {t('common.online')}
        </div>
      </div>
    </div>
  );
}
