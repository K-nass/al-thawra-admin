import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Users } from "lucide-react";
import { apiClient } from "@/api/client";
import Loader from "@/components/Common/Loader";
import UserCard from "./UserCard/UserCard";

export interface UserInterface {
  id: string;
  userName: string;
  email: string;
  avatarImageUrl: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  role: string;
}

export default function LatestUsersSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  async function fetchLatestUsers() {
    const res = await apiClient.get("/users/all", {
      params: {
        Role: "",
        Status: "",
        EmailConfirmed: true,
        PageNumber: 1,
        PageSize: 15,
        SearchPhrase: ""
      }
    });
    return res.data;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["latestUsers"],
    queryFn: fetchLatestUsers,
    retry: false,
  });

  if (isError) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full font-sans">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t('dashboard.tables.latestUsers') || "Latest Users"}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{t('dashboard.tables.recentlyRegisteredUsers')}</p>
        </div>
        <button 
          onClick={() => navigate("/admin/users")}
          className="text-xs font-bold text-primary hover:text-emerald-700 flex items-center gap-1 transition-colors group"
        >
          {t('common.viewAll')}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      
      <div className="p-6 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 py-8">
            <Loader />
            <p className="mt-4 text-sm text-slate-400 animate-pulse">{t("dashboard.fetchingUsers")}</p>
          </div>
        ) : (!data?.items || data.items.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 py-8 text-slate-400">
            <Users size={40} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">{t("users.noUsersFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-8">
            {data?.items?.slice(0, 5).map((user: UserInterface) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
