import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LocalAccount = {
  firstName: string;
  email: string;
  username: string;
  password: string;
  createdAt: number;
};

type SignupInput = {
  firstName: string;
  email: string;
  username: string;
  password: string;
};

type AuthState = {
  isSignedIn: boolean;
  hasHydrated: boolean;
  accounts: LocalAccount[];
  showPostSignupMessage: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  signIn: () => void;
  signOut: () => void;
  createLocalAccount: (input: SignupInput) => { ok: boolean; error?: string };
  loginWithCredentials: (username: string, password: string) => { ok: boolean; error?: string };
  consumePostSignupMessage: () => boolean;
};

const normalize = (value: string) => value.trim();
const normalizeLower = (value: string) => value.trim().toLowerCase();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isSignedIn: false,
      hasHydrated: false,
      accounts: [],
      showPostSignupMessage: false,
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),
      signIn: () => set({ isSignedIn: true }),
      signOut: () => set({ isSignedIn: false }),
      createLocalAccount: input => {
        const firstName = normalize(input.firstName);
        const email = normalizeLower(input.email);
        const username = normalize(input.username);

        const exists = get().accounts.some(
          account => account.username.toLowerCase() === username.toLowerCase() || account.email === email,
        );

        if (exists) {
          return { ok: false, error: 'An account with this username or email already exists.' };
        }

        set(state => ({
          accounts: [
            ...state.accounts,
            {
              firstName,
              email,
              username,
              password: input.password,
              createdAt: Date.now(),
            },
          ],
          showPostSignupMessage: true,
        }));

        return { ok: true };
      },
      loginWithCredentials: (username, password) => {
        const normalizedUsername = normalize(username).toLowerCase();
        const account = get().accounts.find(acc => acc.username.toLowerCase() === normalizedUsername);

        if (!account || account.password !== password) {
          return { ok: false, error: 'Invalid username or password.' };
        }

        set({ isSignedIn: true });
        return { ok: true };
      },
      consumePostSignupMessage: () => {
        const shouldShow = get().showPostSignupMessage;
        if (shouldShow) {
          set({ showPostSignupMessage: false });
        }
        return shouldShow;
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      partialize: state => ({
        isSignedIn: state.isSignedIn,
        accounts: state.accounts,
        showPostSignupMessage: state.showPostSignupMessage,
      }),
    },
  ),
);
