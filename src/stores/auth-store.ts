import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isInitialized: false,
  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setInitialized: (value) => set({ isInitialized: value }),
  clear: () => set({ user: null, session: null }),
}));
