import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

type AuthState = {
  session: string | null;
  userEmail: string | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      userEmail: null,
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, userEmail: null });
      },
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        set({ session: data.session?.access_token ?? null, userEmail: data.user?.email ?? null });
      },
      signup: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        set({ session: data.session?.access_token ?? null, userEmail: data.user?.email ?? null });
      },
      restoreSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          set({ session: null, userEmail: null });
          return;
        }
        set({
          session: data.session?.access_token ?? null,
          userEmail: data.session?.user.email ?? null,
        });
      },
    }),
    { name: "pet-auth", partialize: (state) => ({ session: state.session, userEmail: state.userEmail }) },
  ),
);
