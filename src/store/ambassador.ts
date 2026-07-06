import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useOnboardingStore } from './onboarding';

export type AmbassadorStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface AmbassadorApplication {
  pitch: string;
  eventTypes: string[];
  reach: string;
  availability: string[];
}

interface AmbassadorStore {
  status: AmbassadorStatus;
  application: AmbassadorApplication | null;
  submittedAt: number | null;
  submit: (application: AmbassadorApplication) => Promise<{ ok: boolean; error?: string }>;
  setStatus: (status: AmbassadorStatus) => void;
  reset: () => void;
}

export const useAmbassadorStore = create<AmbassadorStore>()(
  persist(
    (set) => ({
      status: 'none',
      application: null,
      submittedAt: null,
      submit: async (application) => {
        if (isSupabaseConfigured) {
          const userId = useOnboardingStore.getState().userId;
          const { error } = await supabase.from('ambassador_applications').upsert({
            user_id: userId,
            pitch: application.pitch,
            event_types: application.eventTypes,
            reach: application.reach,
            availability: application.availability,
            status: 'pending',
          }, { onConflict: 'user_id' });
          if (error) return { ok: false, error: error.message };
        }
        set({ status: 'pending', application, submittedAt: Date.now() });
        return { ok: true };
      },
      setStatus: (status) => set({ status }),
      reset: () => set({ status: 'none', application: null, submittedAt: null }),
    }),
    {
      name: 'forge-ambassador',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
