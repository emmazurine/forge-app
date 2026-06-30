import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SPOTS } from '../data/spots';
import { Spot } from '../types/spot';

interface SpotsStore {
  spots: Spot[];
  googleCache: Spot[];
  addSpot: (spot: Spot) => void;
  addReview: (spotId: string, rating: number) => void;
  cacheGoogleSpots: (spots: Spot[]) => void;
}

export const useSpotsStore = create<SpotsStore>()(
  persist(
    (set) => ({
      spots: SPOTS,
      googleCache: [],
      cacheGoogleSpots: (spots) => set({ googleCache: spots }),
      addSpot: (spot) => set((s) => ({ spots: [spot, ...s.spots] })),
      addReview: (spotId, rating) =>
        set((s) => ({
          spots: s.spots.map((sp) => {
            if (sp.id !== spotId) return sp;
            const newCount = sp.reviewCount + 1;
            const newRating = parseFloat(
              ((sp.rating * sp.reviewCount + rating) / newCount).toFixed(1)
            );
            return { ...sp, rating: newRating, reviewCount: newCount };
          }),
        })),
    }),
    {
      name: 'forge-spots',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: any, current) => {
        const persistedSpots: Spot[] = persisted?.spots ?? [];
        const userAdded = persistedSpots.filter((s) => s.id.startsWith('user-'));
        // Carry over any seed spot rating/review changes from the persisted state
        const mergedSeeds = SPOTS.map((seed) => {
          const saved = persistedSpots.find((p) => p.id === seed.id);
          return saved ?? seed;
        });
        return { ...current, spots: [...userAdded, ...mergedSeeds] };
      },
    }
  )
);
