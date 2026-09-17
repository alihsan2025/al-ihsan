import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'SUPER_ADMIN' | 'FINANCE' | 'MODERATOR' | 'FIELD_AGENT';

export interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  userRole: UserRole;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  userRole: 'FIELD_AGENT',
  loading: true,
});
