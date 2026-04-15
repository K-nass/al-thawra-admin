import { useQuery } from "@tanstack/react-query";
import DataTableSection from "./DataTableSection/DataTableSection";
import StatsCard from "./StatsCard/StatsCard";
import { apiClient } from "@/api/client";
import { postsApi } from "@/api";
import LatestUsersSection from "./LatestUsersSection/LatestUsersSection";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Calendar,
  LayoutDashboard
} from "lucide-react";

export interface CommentInterface {
  id: string;
  name: string;
  comment: string;
  date: string;
}

export interface MessageInterface {
  id: string;
  userId: string | null;
  username: string;
  email: string;
  message: string;
  date: string;
}

export default function DashboardHome() {
  const { t } = useTranslation();

  const { data: latestContactMessages, isLoading: loadingMessages, isError: isErrorLatestContactMessages, error: latestContactMessagesError } = useQuery({
    queryKey: ["latestContactMessages"],
    queryFn: () => apiClient.get("/contact-messages").then(res => res.data),
  });

  const { data: contactMessagesData } = useQuery({
    queryKey: ["contactMessagesCount"],
    queryFn: () => apiClient.get("/contact-messages").then(res => res.data),
  });

  const { data: postsData } = useQuery({
    queryKey: ["postsCount"],
    queryFn: () => postsApi.getArticles(),
  });

  const postsCount = postsData?.data?.totalCount || 0;
  const contactMessagesCount = contactMessagesData?.totalCount || 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-primary w-6 h-6" />
            {t('dashboard.overview')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('dashboard.welcomeSubtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            count={postsCount} 
            label={t('dashboard.stats.posts')} 
            bgColor="bg-emerald-500"
            icon={FileText}
            trend={{ value: "12%", isPositive: true }}
          />
          <StatsCard 
            count={contactMessagesCount} 
            label={t('dashboard.stats.contactMessages')} 
            bgColor="bg-rose-500"
            icon={MessageSquare}
          />
          <StatsCard 
            count={0} 
            label={t('dashboard.stats.drafts')} 
            bgColor="bg-indigo-500"
            icon={Clock}
          />
          <StatsCard 
            count={0} 
            label={t('dashboard.stats.scheduledPosts')} 
            bgColor="bg-amber-500"
            icon={Calendar}
          />
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="min-w-0">
            <DataTableSection
              label={t('dashboard.tables.latestContactMessages')}
              description={t('dashboard.tables.recentlyAddedContactMessages')}
              cols={[t('dashboard.tables.username'), t('dashboard.tables.message'), t('dashboard.tables.date')]}
              data={latestContactMessages?.items?.slice(0, 5)}
              isLoading={loadingMessages}
              isError={isErrorLatestContactMessages}
              error={(latestContactMessagesError as Error)?.message}
            />
          </div>
          <div className="min-w-0">
            <LatestUsersSection />
          </div>
        </div>
      </div>
    </div>
  );
}
