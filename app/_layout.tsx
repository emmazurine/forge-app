import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ConnectModal } from '../src/components/connect/ConnectModal';
import { DarkColors, LightColors } from '../src/constants/themes';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { useOnboardingStore } from '../src/store/onboarding';
import { useThemeStore } from '../src/store/theme';

export default function RootLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const C = isDark ? DarkColors : LightColors;

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
        } else if (data?.status === 'rejected') {
          setVerification(data.method as 'email' | 'id', 'rejected');
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
          } else if (payload.new.status === 'rejected') {
            setVerification(method, 'rejected');
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
      </Stack>
    </>
  );
}
