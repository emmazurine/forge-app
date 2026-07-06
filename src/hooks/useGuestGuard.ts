import { isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { useGuestGuardStore } from '../store/guestGuard';

/**
 * Returns a `guard(action, onProceed, opts)` function. If the user is logged
 * in (or auth isn't configured for this build), it calls `onProceed`
 * immediately. Otherwise it opens GuestGuardModal.
 *
 * By default this is a soft guard: the guest can dismiss the modal and
 * proceed anyway. Pass `{ blocking: true }` for actions that require an
 * account outright (e.g. connect requests, collaboration sign-ups) — the
 * modal then only offers Sign Up or Cancel, with no guest bypass.
 *
 * Not backed by Alert.alert: react-native-web's Alert.alert is a no-op
 * (`static alert() {}`) on web, so it never shows anything and never fires
 * button callbacks there.
 */
export function useGuestGuard() {
  const user = useAuthStore((s) => s.user);
  const request = useGuestGuardStore((s) => s.request);

  return (action: string, onProceed: () => void, opts?: { blocking?: boolean }) => {
    if (user || !isSupabaseConfigured) {
      onProceed();
      return;
    }
    request(action, onProceed, opts);
  };
}
