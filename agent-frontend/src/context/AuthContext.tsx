import { createContext } from 'react';
import { LoginCredentials, UserProfile } from '@/types/auth';

interface IAuthContext {
  user: UserProfile;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<IAuthContext>({
  user: {},
  loading: false,
  login: async () => {},
  logout: async () => {},
});
