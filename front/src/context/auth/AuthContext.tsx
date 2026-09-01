import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  provider?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
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
  };

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await fetch(
          `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include', // envoie le cookie httpOnly
          }
        );
        if (!res.ok) throw new Error('no session');
        const data = await res.json();
        setAuth(data.user, data.accessToken);
      } catch {
        // pas de session valide, on reste déconnecté silencieusement
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
