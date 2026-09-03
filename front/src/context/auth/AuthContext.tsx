import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAccessToken as setApiAccessToken } from '../../api/api';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
    setApiAccessToken(token);
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
        // Network or server offline errors fallback to logged-out state
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    tryRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
