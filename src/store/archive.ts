import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ARCHIVE_SEED } from '../data/archive';
import { ArchiveEntry } from '../types/archive';

interface ArchiveStore {
  entries: ArchiveEntry[];
  publish: (entry: Omit<ArchiveEntry, 'id' | 'publishedAt' | 'publisherId'>) => void;
  unpublish: (id: string) => void;
}

export const useArchiveStore = create<ArchiveStore>()(
  persist(
    (set) => ({
      entries: ARCHIVE_SEED,

      publish: (entry) => {
        const newEntry: ArchiveEntry = {
          ...entry,
          id: `arc-user-${Date.now()}`,
          publishedAt: Date.now(),
          publisherId: 'me',
        };
        set((s) => ({ entries: [newEntry, ...s.entries] }));
      },

      unpublish: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },
    }),
    {
      name: 'forge-archive',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: any, current) => {
        const persistedEntries: ArchiveEntry[] = persisted?.entries ?? [];
        const userEntries = persistedEntries.filter((e) => e.publisherId === 'me');
        return { ...current, entries: [...userEntries, ...ARCHIVE_SEED] };
      },
    }
  )
);
