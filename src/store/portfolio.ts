import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Experience } from '../types/portfolio';

interface PortfolioStore {
  experiences: Experience[];
  addExperience: (exp: Experience) => void;
  updateExperience: (id: string, exp: Experience) => void;
  removeExperience: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      experiences: [],

      addExperience: (exp) =>
        set((s) => ({ experiences: [exp, ...s.experiences] })),

      updateExperience: (id, exp) =>
        set((s) => ({
          experiences: s.experiences.map((e) => (e.id === id ? exp : e)),
        })),

      removeExperience: (id) =>
        set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) })),
    }),
    {
      name: 'forge-portfolio',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
