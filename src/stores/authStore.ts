import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@pesqueiro.com',
    role: 'admin' as const,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Operador Caixa',
    email: 'operador@pesqueiro.com',
    role: 'operator' as const,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock login validation
        const user = mockUsers.find(u => u.email === email);
        if (user && password === '123456') {
          const token = 'mock-jwt-token-' + Date.now();
          set({
            user,
            token,
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },
    }),
    {
      name: 'fishery-auth',
    }
  )
);