import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthStore {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<{ ok: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let initialized = false;

export const useAuthStore = create<AuthStore>()((set) => ({
  session: null,
  user: null,
  initializing: true,
  loading: false,
  error: null,

  initialize: () => {
    if (initialized) return;
    initialized = true;

    if (!isSupabaseConfigured) {
      set({ initializing: false });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, initializing: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false, error: error?.message ?? null });
    return !error;
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { name } } : undefined,
    });
    set({ loading: false, error: error?.message ?? null });
    if (error) return { ok: false, needsConfirmation: false };
    // With email confirmations enabled, Supabase returns a user but no session
    // until the confirmation link is clicked.
    return { ok: true, needsConfirmation: !data.session };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ loading: false });
  },

  clearError: () => set({ error: null }),
}));
