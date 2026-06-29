import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  submit: (application: AmbassadorApplication) => void;
  reset: () => void;
}

export const useAmbassadorStore = create<AmbassadorStore>()(
  persist(
    (set) => ({
      status: 'none',
      application: null,
      submittedAt: null,
      submit: (application) =>
        set({ status: 'pending', application, submittedAt: Date.now() }),
      reset: () => set({ status: 'none', application: null, submittedAt: null }),
    }),
    {
      name: 'forge-ambassador',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
