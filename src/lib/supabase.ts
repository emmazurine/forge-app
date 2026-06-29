import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// True only when real credentials are present
export const isSupabaseConfigured =
  url.startsWith('https://') && !url.includes('your-project-id') && key.length > 20;

export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? key : 'placeholder',
  { auth: { persistSession: false } }
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
