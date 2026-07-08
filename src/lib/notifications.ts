import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function notifyLocal(title: string, body: string, href?: string) {
  if (Platform.OS === 'web') return; // local scheduling isn't supported on web
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: href ? { href } : undefined },
    trigger: null,
  });
}
