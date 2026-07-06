import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EVENTS } from '../data/events';
import { cancelEventReminder, scheduleEventReminder } from '../lib/eventNotifications';
import { ForgeEvent } from '../types/event';

interface EventsState {
  rsvpedIds: string[];
  submittedEvents: ForgeEvent[];
  reminderIds: Record<string, string>;
  rsvp: (event: ForgeEvent) => void;
  cancelRsvp: (eventId: string) => void;
  submitEvent: (event: ForgeEvent) => void;
  deleteEvent: (eventId: string) => void;
  reconcileReminders: () => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      rsvpedIds: [],
      submittedEvents: [],
      reminderIds: {},
      rsvp: (event) => {
        if (!get().rsvpedIds.includes(event.id)) {
          set((s) => ({ rsvpedIds: [...s.rsvpedIds, event.id] }));
        }
        if (!get().reminderIds[event.id] && !event.isPast) {
          scheduleEventReminder(event).then((notificationId) => {
            if (notificationId) {
              set((s) => ({ reminderIds: { ...s.reminderIds, [event.id]: notificationId } }));
            }
          });
        }
      },
      cancelRsvp: (eventId) => {
        set((s) => ({ rsvpedIds: s.rsvpedIds.filter((id) => id !== eventId) }));
        const notificationId = get().reminderIds[eventId];
        if (notificationId) {
          cancelEventReminder(notificationId);
          set((s) => {
            const { [eventId]: _, ...rest } = s.reminderIds;
            return { reminderIds: rest };
          });
        }
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
      reconcileReminders: () => {
        const { rsvpedIds, reminderIds, submittedEvents } = get();
        const allEvents = [...EVENTS, ...submittedEvents];
        for (const eventId of rsvpedIds) {
          if (reminderIds[eventId]) continue;
          const event = allEvents.find((e) => e.id === eventId);
          if (!event || event.isPast) continue;
          scheduleEventReminder(event).then((notificationId) => {
            if (notificationId) {
              set((s) => ({ reminderIds: { ...s.reminderIds, [event.id]: notificationId } }));
            }
          });
        }
      },
    }),
    {
      name: 'forge-events',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
