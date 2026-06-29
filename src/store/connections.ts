import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Student } from '../types/user';

export type ConnectionStatus = 'pending' | 'connected';

interface ConnectionsStore {
  connections: Record<string, ConnectionStatus>;
  incomingRequests: string[];
  requestNotes: Record<string, string>;
  modalStudent: Student | null;
  openConnectModal: (student: Student) => void;
  closeConnectModal: () => void;
  sendRequest: (studentId: string, note?: string) => void;
  acceptRequest: (studentId: string) => void;
  declineRequest: (studentId: string) => void;
  disconnect: (studentId: string) => void;
  getStatus: (studentId: string) => ConnectionStatus | null;
}

export const useConnectionsStore = create<ConnectionsStore>()(
  persist(
    (set, get) => ({
      connections: { '1': 'connected' as ConnectionStatus },
      // Jordan Kim and Maya Patel have sent you connection requests
      incomingRequests: ['3', '4'],
      requestNotes: {},
      modalStudent: null,
      openConnectModal: (student) => set({ modalStudent: student }),
      closeConnectModal: () => set({ modalStudent: null }),
      sendRequest: (studentId, note) =>
        set((s) => ({
          connections: { ...s.connections, [studentId]: 'pending' },
          requestNotes: note?.trim()
            ? { ...s.requestNotes, [studentId]: note.trim() }
            : s.requestNotes,
        })),
      acceptRequest: (studentId) =>
        set((s) => ({
          connections: { ...s.connections, [studentId]: 'connected' },
          incomingRequests: s.incomingRequests.filter((id) => id !== studentId),
        })),
      declineRequest: (studentId) =>
        set((s) => ({
          incomingRequests: s.incomingRequests.filter((id) => id !== studentId),
        })),
      disconnect: (studentId) =>
        set((s) => {
          const { [studentId]: _, ...rest } = s.connections;
          return { connections: rest };
        }),
      getStatus: (studentId) => get().connections[studentId] ?? null,
    }),
    {
      name: 'forge-connections',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        connections: s.connections,
        incomingRequests: s.incomingRequests,
        requestNotes: s.requestNotes,
      }),
    }
  )
);
