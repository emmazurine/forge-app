import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookmarksStore {
  savedIds: string[];
  toggle: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      savedIds: [],
      toggle: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id)
            ? s.savedIds.filter((x) => x !== id)
            : [...s.savedIds, id],
        })),
      isBookmarked: (id) => get().savedIds.includes(id),
    }),
    {
      name: 'forge-bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
