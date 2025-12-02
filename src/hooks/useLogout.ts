import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { getAuthToken, getRefreshToken, clearAllTokens } from '@/api/client';

export function useLogout() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const accessToken = getAuthToken();
      const refreshToken = getRefreshToken();

      if (!accessToken || !refreshToken) {
        throw new Error('No tokens found');
      }

      await authApi.logout({
        accessToken,
        refreshToken,
      });
    },
    onSuccess: () => {
      clearAllTokens();
      navigate('/login');
    },
    onError: () => {
      // Even if logout API fails, clear tokens locally and redirect
      clearAllTokens();
      navigate('/login');
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
