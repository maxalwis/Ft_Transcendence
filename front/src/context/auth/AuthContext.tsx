import { useState, useEffect, type ReactNode } from 'react';
import { setAccessToken as setApiAccessToken } from '../../api/api';
import { AuthContext, type User } from './AuthContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
    setApiAccessToken(token);
  };

  const updateUser = (partialUser: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, ...partialUser };
    });
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setApiAccessToken(null);
  };

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const port = import.meta.env.VITE_HTTPS_PORT || '8443';
        const res = await fetch(`https://localhost:${port}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) return;

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

    tryRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setAuth, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
