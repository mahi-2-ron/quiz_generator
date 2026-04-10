import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'smartquiz-auth',
    }
  )
);
