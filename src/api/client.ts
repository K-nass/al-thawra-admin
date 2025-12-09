import axios from 'axios';

// Token storage: 
// - Auth token in memory (cleared on page refresh for security)
// - Refresh token in sessionStorage (survives page refresh, cleared when tab closes)
// - User role in sessionStorage (for role-based routing)
let authToken: string | null = null;

const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = 'user_role';

// Token management functions
export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setRefreshToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

// User role management functions
export function setUserRole(role: string | null) {
  if (role) {
    sessionStorage.setItem(USER_ROLE_KEY, role);
  } else {
    sessionStorage.removeItem(USER_ROLE_KEY);
  }
}

export function getUserRole(): string | null {
  return sessionStorage.getItem(USER_ROLE_KEY);
}

export function clearAuthToken() {
  authToken = null;
}

export function clearRefreshToken() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearUserRole() {
  sessionStorage.removeItem(USER_ROLE_KEY);
}

export function clearAllTokens() {
  authToken = null;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_ROLE_KEY);
}

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if exists (from in-memory storage)
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, clear tokens and reject
        clearAllTokens();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        setAuthToken(accessToken);
        setRefreshToken(newRefreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject all queued requests
        clearAllTokens();
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
