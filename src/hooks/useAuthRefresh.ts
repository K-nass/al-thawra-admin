import { useEffect, useState, useRef } from 'react';
import { getRefreshToken, setAuthToken, setRefreshToken, clearAllTokens } from '@/api/client';
import { authApi } from '@/api/auth.api';

export function useAuthRefresh() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const refreshTokenOnLoad = async () => {
      // Prevent duplicate calls in React Strict Mode
      if (hasRefreshed.current) {
        return;
      }
      
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        setIsLoading(false);
        setIsAuthorized(false);
        return;
      }

      hasRefreshed.current = true;

      try {
        const response = await authApi.refreshToken({ refreshToken });
        
        if (response.accessToken) {
          setAuthToken(response.accessToken);
          setIsAuthorized(true);
          
          // Store the new refresh token returned by the API
          if (response.refreshToken) {
            setRefreshToken(response.refreshToken);
          }
        } else {
          // No accessToken in refresh response
        }
      } catch (error) {
        clearAllTokens();
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    refreshTokenOnLoad();
  }, []);

  return { isLoading, isAuthorized };
}
