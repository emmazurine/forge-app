import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Checkin {
  userId: string;
  spotId: string;
  label: string;
  expiresAt: number;
  userName: string;
  userInitials: string;
  userAvatarColor: string;
}

const NOW = Date.now();
const H = 3600000;

const SEED_CHECKINS: Checkin[] = [
  {
    userId: '1',
    spotId: '1',
    label: 'ML recommendation engine',
    expiresAt: NOW + 1.5 * H,
    userName: 'Alex Chen',
    userInitials: 'AC',
    userAvatarColor: '#6366F1',
  },
  {
    userId: '4',
    spotId: '1',
    label: 'AI policy research paper',
    expiresAt: NOW + 1.75 * H,
    userName: 'Maya Patel',
    userInitials: 'MP',
    userAvatarColor: '#F59E0B',
  },
  {
    userId: '2',
    spotId: '3',
    label: 'HackDC team prep',
    expiresAt: NOW + 0.75 * H,
    userName: 'Sofia Reyes',
    userInitials: 'SR',
    userAvatarColor: '#22C55E',
  },
  {
    userId: '3',
    spotId: '6',
    label: 'catching up on reading',
    expiresAt: NOW + 1.25 * H,
    userName: 'Jordan Kim',
    userInitials: 'JK',
    userAvatarColor: '#3B82F6',
  },
];

interface CheckinsStore {
  checkins: Checkin[];
  checkIn: (
    spotId: string,
    label: string,
    userInfo: Pick<Checkin, 'userName' | 'userInitials' | 'userAvatarColor'>
  ) => void;
  checkOut: () => void;
  myCheckin: () => Checkin | null;
}

export const useCheckinsStore = create<CheckinsStore>()(
  persist(
    (set, get) => ({
      checkins: SEED_CHECKINS,

      checkIn: (spotId, label, userInfo) =>
        set((s) => ({
          checkins: [
            ...s.checkins.filter((c) => c.userId !== 'me'),
            {
              userId: 'me',
              spotId,
              label: label.trim(),
              expiresAt: Date.now() + 2 * H,
              ...userInfo,
            },
          ],
        })),

      checkOut: () =>
        set((s) => ({ checkins: s.checkins.filter((c) => c.userId !== 'me') })),

      myCheckin: () => {
        const now = Date.now();
        return get().checkins.find((c) => c.userId === 'me' && c.expiresAt > now) ?? null;
      },
    }),
    {
      name: 'forge-checkins',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: any, current) => {
        const persistedCheckins: Checkin[] = persisted?.checkins ?? [];
        const now = Date.now();
        const myValid = persistedCheckins.filter(
          (c) => c.userId === 'me' && c.expiresAt > now
        );
        return { ...current, checkins: [...SEED_CHECKINS, ...myValid] };
      },
    }
  )
);
