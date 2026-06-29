import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Student } from '../types/user';

interface ProfileStore {
  saved: Student | null;
  saveProfile: (profile: Student) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      saved: null,
      saveProfile: (profile) => set({ saved: profile }),
      resetProfile: () => set({ saved: null }),
    }),
    {
      name: 'forge-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
