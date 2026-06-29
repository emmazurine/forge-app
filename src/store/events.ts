import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ForgeEvent } from '../types/event';

interface EventsState {
  rsvpedIds: string[];
  submittedEvents: ForgeEvent[];
  rsvp: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  submitEvent: (event: ForgeEvent) => void;
  deleteEvent: (eventId: string) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      rsvpedIds: [],
      submittedEvents: [],
      rsvp: (eventId) => {
        if (!get().rsvpedIds.includes(eventId)) {
          set((s) => ({ rsvpedIds: [...s.rsvpedIds, eventId] }));
        }
      },
      cancelRsvp: (eventId) => {
        set((s) => ({ rsvpedIds: s.rsvpedIds.filter((id) => id !== eventId) }));
      },
      submitEvent: (event) => {
        set((s) => ({ submittedEvents: [event, ...s.submittedEvents] }));
      },
      deleteEvent: (eventId) => {
        set((s) => ({
          submittedEvents: s.submittedEvents.filter((e) => e.id !== eventId),
          rsvpedIds: s.rsvpedIds.filter((id) => id !== eventId),
        }));
      },
    }),
    {
      name: 'forge-events',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
