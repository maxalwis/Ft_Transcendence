import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { setAccessToken as setApiAccessToken } from '../../api/api';
import { AuthContext, type User } from './AuthContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  const setAuth = useCallback((user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
    setApiAccessToken(token);
  }, []);

  const updateUser = useCallback((partialUser: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, ...partialUser };
    });
  }, []);

  const logout = useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    setAccessToken(null);
    setApiAccessToken(null);
  }, [clearRefreshTimer]);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const port = import.meta.env.VITE_HTTPS_PORT || '8443';

        const res = await fetch(`https://localhost:${port}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          logout();
          return;
        }

        const data = await res.json();

        if (data.user && data.accessToken) {
          setAuth(data.user, data.accessToken);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void tryRefresh();
  }, [logout, setAuth]);

  useEffect(() => {
    if (!accessToken) {
      clearRefreshTimer();
      return;
    }

    // Access token lifetime is currently 15 minutes.
    // Refresh one minute before expiration.
    const REFRESH_INTERVAL = 14 * 60 * 1000;

    clearRefreshTimer();

    refreshTimer.current = setTimeout(async () => {
      try {
        const port = import.meta.env.VITE_HTTPS_PORT || '8443';

        const res = await fetch(`https://localhost:${port}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          logout();
          return;
        }

        const data = await res.json();

        if (data.user && data.accessToken) {
          setAuth(data.user, data.accessToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }, REFRESH_INTERVAL);

    return clearRefreshTimer;
  }, [accessToken, clearRefreshTimer, logout, setAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        setAuth,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}