import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { FontSize } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useConnectionsStore } from '../../src/store/connections';
import { useMessagesStore } from '../../src/store/messages';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useUnreadCount } from '../../src/hooks/useNotifications';

export default function TabLayout() {
  const Colors = useColors();
  const isComplete = useOnboardingStore((s) => s.isComplete);
  const requestCount = useConnectionsStore((s) => s.incomingRequests.length);
  const unreadNotifCount = useUnreadCount();
  const unreadCount = useMessagesStore((s) =>
    s.conversations.filter((c) => {
      const last = c.messages[c.messages.length - 1];
      return last && last.senderId !== 'me';
    }).length
  );

  if (!isComplete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Spots',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collaborate"
        options={{
          title: 'Collaborate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarBadge: (requestCount + unreadNotifCount) > 0 ? (requestCount + unreadNotifCount) : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
