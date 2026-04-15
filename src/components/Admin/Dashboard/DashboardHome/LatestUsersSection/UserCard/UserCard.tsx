import type { UserInterface } from "../LatestUsersSection";
import { User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserCard({ user }: { user: UserInterface }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";
  const formattedDate = new Date(user.createdAt).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="relative mb-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
          {user.avatarImageUrl ? (
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={user.avatarImageUrl}
              alt={`${user.userName} picture`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <UserIcon size={24} />
            </div>
          )}
        </div>
        {user.isActive && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
        )}
      </div>
      <div className="text-center w-full min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate px-1" title={user.userName}>
          {user.userName}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            {user.isActive ? t("users.active") : t("users.inactive")}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <p className="text-[10px] font-medium text-slate-400">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
