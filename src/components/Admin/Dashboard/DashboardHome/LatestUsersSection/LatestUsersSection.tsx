import { apiClient } from "@/api/client";
import DataTableHeader from "../DataTableSection/DataTableHeader";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Common/Loader";
import UserCard from "./UserCard/UserCard";
import { useTranslation } from "react-i18next";

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

  async function fetchLatestUsers() {
    const res = await apiClient.get("/users/all", {
      params: {
        Role: "",
        Status: "",
        EmailConfirmed: true,
        PageNumber: 1,
        PageSize: 15, // Backend only accepts [15, 30, 60, 90]
        SearchPhrase: ""
      }
    });
    return res.data;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["latestUsers"],
    queryFn: fetchLatestUsers,
    retry: false, // Don't retry on 403
  });

  // Don't render if there's an error (403 Forbidden - insufficient permissions)
  if (isError) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <DataTableHeader
        label={t('dashboard.tables.latestUsers')}
        description={t('dashboard.tables.recentlyRegisteredUsers')}
      />
      <div className="p-6">
        <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
          {isLoading ? (
            <Loader />
          ) : (
            data?.items?.slice(0, 5).map((user: UserInterface) => <UserCard key={user.id} user={user} />)
          )}
        </div>
      </div>
    </div>
  );
}


