import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  avatarImageUrl: string | null;
  slug: string;
  aboutMe: string;
  socialAccounts: Record<string, string>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    userName: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', data);
    return response.data;
  },

  logout: async (data: LogoutRequest) => {
    const response = await apiClient.post('/auth/logout', data);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get<UserProfile>('/users/profile');
    return response.data;
  },
};
