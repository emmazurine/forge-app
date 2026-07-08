import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// True only when real credentials are present
export const isSupabaseConfigured =
  url.startsWith('https://') && !url.includes('your-project-id') && key.length > 20;

export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? key : 'placeholder',
  {
    auth: {
      // On web, Supabase falls back to `window.localStorage` itself (guarded by an
      // isBrowser() check that's safe during Metro's Node-side SSR of the static export).
      // AsyncStorage's web shim isn't SSR-safe, so only use it on native.
      ...(Platform.OS !== 'web' && { storage: AsyncStorage }),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);

export type VerificationRow = {
  id: string;
  user_id: string;
  method: 'email' | 'id';
  email: string | null;
  file_name: string | null;
  storage_key: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
};

export type AmbassadorApplicationRow = {
  id: string;
  user_id: string;
  pitch: string;
  event_types: string[];
  reach: string;
  availability: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};
