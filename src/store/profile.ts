import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ProjectUpdate } from '../types/portfolio';
import { Student } from '../types/user';

interface ProfileStore {
  saved: Student | null;
  projectUpdates: ProjectUpdate[];
  saveProfile: (profile: Student) => void;
  resetProfile: () => void;
  addProjectUpdate: (update: ProjectUpdate) => void;
  clearProjectUpdates: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      saved: null,
      projectUpdates: [],
      saveProfile: (profile) => set({ saved: profile }),
      resetProfile: () => set({ saved: null, projectUpdates: [] }),
      addProjectUpdate: (update) =>
        set((s) => ({ projectUpdates: [update, ...s.projectUpdates] })),
      clearProjectUpdates: () => set({ projectUpdates: [] }),
    }),
    {
      name: 'forge-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
