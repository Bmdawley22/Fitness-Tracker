import { create } from 'zustand';

type AuthState = {
  isSignedIn: boolean;
  hasHydrated: boolean;
  signIn: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  isSignedIn: false,
  hasHydrated: true,
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),
}));
