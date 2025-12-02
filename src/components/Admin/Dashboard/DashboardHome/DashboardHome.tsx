import { useQuery } from "@tanstack/react-query";
import DataTableSection from "./DataTableSection/DataTableSection";
import StatsCard from "./StatsCard/StatsCard";
import { apiClient } from "@/api/client";
import { postsApi } from "@/api";
import LatestUsersSection from "./LatestUsersSection/LatestUsersSection";
import { useTranslation } from "react-i18next";

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

  function fetchLatestContactMessages() {
    return apiClient.get("/contact-messages", {
      params: {
        PageNumber: 1,
        PageSize: 15
      }
    });
  }

  function fetchContactMessagesCount() {
    return apiClient.get("/contact-messages", {
      params: {
        PageNumber: 1,
        PageSize: 15
      }
    });
  }

  function fetchPostsCount() {
    return postsApi.getAll();
  }
  
  const { data: latestContactMessages, isLoading: loadingMessages, isError: isErrorLatestContactMessages, error: latestContactMessagesError } = useQuery({
    queryKey: ["latestContactMessages"],
    queryFn: fetchLatestContactMessages,
  });

  const { data: contactMessagesData } = useQuery({
    queryKey: ["contactMessagesCount"],
    queryFn: fetchContactMessagesCount,
  });

  const { data: postsData } = useQuery({
    queryKey: ["postsCount"],
    queryFn: fetchPostsCount,
  });

  const postsCount = postsData?.data?.totalCount || 0;
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#F3F6F8]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard count={postsCount} label={t('dashboard.stats.posts')} bgColor="bg-teal-500" />
        <StatsCard count={contactMessagesData?.data?.totalCount || 0} label={t('dashboard.stats.contactMessages')} bgColor="bg-red-500" />
        <StatsCard count={0} label={t('dashboard.stats.drafts')} bgColor="bg-indigo-500" />
        <StatsCard count={0} label={t('dashboard.stats.scheduledPosts')} bgColor="bg-amber-500" />
      </div>
      <div className="mb-6">
        <DataTableSection
          label={t('dashboard.tables.latestContactMessages')}
          description={t('dashboard.tables.recentlyAddedContactMessages')}
          cols={[t('dashboard.tables.id'), t('dashboard.tables.username'), t('dashboard.tables.email'), t('dashboard.tables.message'), t('dashboard.tables.date')]}
          data={latestContactMessages?.data?.items?.slice(0, 5)}
          isLoading={loadingMessages}
          isError={isErrorLatestContactMessages}
          error={latestContactMessagesError?.message}
        />
      </div>

      <LatestUsersSection />
    </div>
  );
}
