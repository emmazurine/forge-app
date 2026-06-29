import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppNotification } from '../types/notification';

const NOW = Date.now();
const H = 3_600_000;
const D = 86_400_000;

// Seeded historical notifications (activity that happened "before" the user opened the app)
export const SEEDED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-alex-accepted',
    type: 'connection_accepted',
    title: 'Alex Chen accepted your request',
    body: "You're now connected. Send them a message!",
    timestamp: NOW - 6 * H,
    href: '/user/1',
    avatarInitials: 'AC',
    avatarColor: '#6366F1',
  },
  {
    id: 'n-priya-interest',
    type: 'post_interest',
    title: '3 new people interested in your post',
    body: "Your opportunity is getting traction on Collaborate.",
    timestamp: NOW - 18 * H,
    href: '/(tabs)/collaborate',
    avatarInitials: 'PA',
    avatarColor: '#14B8A6',
  },
  {
    id: 'n-welcome',
    type: 'welcome',
    title: 'Welcome to Forge!',
    body: 'Your profile is live. Connect with students across NoVA.',
    timestamp: NOW - 7 * D,
    href: '/(tabs)/connect',
  },
];

interface NotificationsStore {
  lastViewedAt: number;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      // Default: anything older than 24h is already "seen"
      lastViewedAt: NOW - 24 * H,
      markAllRead: () => set({ lastViewedAt: Date.now() }),
    }),
    {
      name: 'forge-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
