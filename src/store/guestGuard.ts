import { create } from 'zustand';

interface GuestGuardStore {
  actionLabel: string | null;
  onProceed: (() => void) | null;
  // Soft guard: user can dismiss and proceed as guest. Hard guard (blocking):
  // the action is unavailable at all without an account.
  blocking: boolean;
  request: (actionLabel: string, onProceed: () => void, opts?: { blocking?: boolean }) => void;
  dismiss: () => void;
}

export const useGuestGuardStore = create<GuestGuardStore>()((set) => ({
  actionLabel: null,
  onProceed: null,
  blocking: false,
  request: (actionLabel, onProceed, opts) => set({ actionLabel, onProceed, blocking: !!opts?.blocking }),
  dismiss: () => set({ actionLabel: null, onProceed: null, blocking: false }),
}));
