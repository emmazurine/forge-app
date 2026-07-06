import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ConnectModal } from '../src/components/connect/ConnectModal';
import { GuestGuardModal } from '../src/components/guest/GuestGuardModal';
import { DarkColors, LightColors } from '../src/constants/themes';
import { notifyLocal } from '../src/lib/notifications';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { useAmbassadorStore } from '../src/store/ambassador';
import { useAuthStore } from '../src/store/auth';
import { useEventsStore } from '../src/store/events';
import { useOnboardingStore } from '../src/store/onboarding';
import { useThemeStore } from '../src/store/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const C = isDark ? DarkColors : LightColors;
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    useEventsStore.getState().reconcileReminders();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    Notifications.requestPermissionsAsync();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const href = response.notification.request.content.data?.href;
      if (typeof href === 'string') router.push(href as any);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { userId, verificationStatus, setVerification } = useOnboardingStore.getState();
    if (verificationStatus !== 'pending') return;

    // Check if verification resolved while the app was closed
    supabase
      .from('verifications')
      .select('status, method')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.status === 'verified') {
          setVerification(data.method as 'email' | 'id', 'verified');
          notifyLocal("You're verified!", 'Your student status is now verified on Forge.', '/(tabs)/profile');
        } else if (data?.status === 'rejected') {
          setVerification(data.method as 'email' | 'id', 'rejected');
          notifyLocal('Verification needs another look', 'Your verification submission was rejected — tap to review.', '/(tabs)/profile');
        }
      });

    // Subscribe to real-time verification updates
    const channel = supabase
      .channel(`verification-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'verifications', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const { verificationMethod } = useOnboardingStore.getState();
          const method = verificationMethod ?? 'id';
          if (payload.new.status === 'verified') {
            setVerification(method, 'verified');
            notifyLocal("You're verified!", 'Your student status is now verified on Forge.', '/(tabs)/profile');
          } else if (payload.new.status === 'rejected') {
            setVerification(method, 'rejected');
            notifyLocal('Verification needs another look', 'Your verification submission was rejected — tap to review.', '/(tabs)/profile');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { userId } = useOnboardingStore.getState();
    const { status: ambassadorStatus, setStatus } = useAmbassadorStore.getState();
    if (ambassadorStatus !== 'pending') return;

    // Check if the application was reviewed while the app was closed
    supabase
      .from('ambassador_applications')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.status === 'approved') {
          setStatus('approved');
          notifyLocal("You're a Forge Ambassador!", 'Your ambassador application was approved.', '/(tabs)/profile');
        } else if (data?.status === 'rejected') {
          setStatus('rejected');
          notifyLocal('Ambassador application update', 'Your ambassador application was not approved this time.', '/(tabs)/profile');
        }
      });

    // Subscribe to real-time review updates
    const channel = supabase
      .channel(`ambassador-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ambassador_applications', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          if (payload.new.status === 'approved') {
            setStatus('approved');
            notifyLocal("You're a Forge Ambassador!", 'Your ambassador application was approved.', '/(tabs)/profile');
          } else if (payload.new.status === 'rejected') {
            setStatus('rejected');
            notifyLocal('Ambassador application update', 'Your ambassador application was not approved this time.', '/(tabs)/profile');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ConnectModal />
      <GuestGuardModal />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="spot/[id]"
          options={{
            title: '',
            headerBackTitle: 'Spots',
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="spot/add"
          options={{
            title: 'Add a Spot',
            headerBackTitle: 'Spots',
          }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{
            title: '',
            headerBackTitle: 'Back',
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="event/[id]"
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="notifications"
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="collaborate/add"
          options={{
            title: 'Post an Opportunity',
            headerBackTitle: 'Collaborate',
          }}
        />
        <Stack.Screen
          name="conversation/[id]"
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="archive"
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="experience/add"
          options={{
            title: '',
            headerBackTitle: 'Portfolio',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="verify"
          options={{
            title: 'Verify Student Status',
            headerBackTitle: 'Profile',
          }}
        />
        <Stack.Screen
          name="ambassador-apply"
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="map"
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="event/create"
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
