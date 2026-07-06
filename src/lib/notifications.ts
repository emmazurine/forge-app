import * as Notifications from 'expo-notifications';

export async function notifyLocal(title: string, body: string, href?: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: href ? { href } : undefined },
    trigger: null,
  });
}
