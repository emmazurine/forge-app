import * as Notifications from 'expo-notifications';
import { ForgeEvent } from '../types/event';

const REMINDER_LEAD_MS = 60 * 60 * 1000; // 1 hour before

function parseEventStart(event: ForgeEvent): Date | null {
  const match = event.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  const [year, month, day] = event.date.split('-').map((n) => parseInt(n, 10));
  return new Date(year, month - 1, day, hours, minutes);
}

export async function scheduleEventReminder(event: ForgeEvent): Promise<string | null> {
  const start = parseEventStart(event);
  if (!start) return null;
  const fireAt = new Date(start.getTime() - REMINDER_LEAD_MS);
  if (fireAt.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `"${event.title}" starts soon`,
      body: `${event.startTime} · ${event.location.split(',')[0]}`,
      data: { href: `/event/${event.id}` },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}

export async function cancelEventReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
