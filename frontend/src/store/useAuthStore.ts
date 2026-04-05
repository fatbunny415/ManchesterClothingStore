import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { useCartStore } from './useCartStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (data: Partial<User>) => set((state) => ({ 
        user: state.user ? { ...state.user, ...data } : null 
      })),
      logout: () => {
        useCartStore.getState().clearLocalCart();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'manchester-auth',
    }
  )
);
