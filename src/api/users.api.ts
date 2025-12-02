import { apiClient } from './client';

// Types
export interface User {
  id: string;
  userName: string;
  email: string;
  avatarImageUrl: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  role: string;
  slug?: string;
  aboutMe?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tikTok?: string;
  whatsApp?: string;
  youTube?: string;
  discord?: string;
  telegram?: string;
  pinterest?: string;
  linkedIn?: string;
  twitch?: string;
  vk?: string;
  personalWebsiteUrl?: string;
}

export interface UsersResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: User[];
}

export interface GetUsersParams {
  Role?: string;
  Status?: string;
  EmailConfirmed?: boolean;
  PageNumber?: number;
  PageSize?: number;
  SearchPhrase?: string;
}

export interface UpdateUserParams {
  UserId?: string;
  UserName?: string;
  Email?: string;
  Slug?: string;
  AboutMe?: string;
  AvatarImage?: File;
  Facebook?: string;
  Twitter?: string;
  Instagram?: string;
  TikTok?: string;
  WhatsApp?: string;
  YouTube?: string;
  Discord?: string;
  Telegram?: string;
  Pinterest?: string;
  LinkedIn?: string;
  Twitch?: string;
  VK?: string;
  PersonalWebsiteUrl?: string;
}

export interface UserProfile {
  id?: string;
  userName: string;
  lastSeen: string;
  memberSince: string;
  email: string;
  profileImageUrl: string;
  aboutMe: string;
  socialAccounts: Record<string, string>;
  posts: any;
}

export const usersApi = {
  // Get all users with pagination and filters
  getAll: async (params?: GetUsersParams) => {
    const response = await apiClient.get<UsersResponse>('/users/all', { params });
    return response.data;
  },

  // Get single user by ID
  getById: async (id: string) => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Get user profile by username
  getProfile: async (username: string) => {
    const response = await apiClient.get<UserProfile>(`/users/profile/${username}`, {
      params: { UserName: username }
    });
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserParams) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await apiClient.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Ban user
  ban: async (id: string) => {
    const response = await apiClient.post(`/users/${id}/ban`);
    return response.data;
  },
};
