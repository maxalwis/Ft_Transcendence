import { createContext } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  provider?: string | null;
  avatar?: string | null;
  preferredLanguage?: 'FR' | 'EN' | 'ES' | 'AR' | null;
  preferredCategory?: 'MUSIC' | 'CULTURE' | 'WORKSHOPS' | 'LEISURE' | 'OTHERS' | null;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
