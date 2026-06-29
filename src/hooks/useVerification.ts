import { useOnboardingStore } from '../store/onboarding';

export function useVerification() {
  const status = useOnboardingStore((s) => s.verificationStatus);
  return {
    isVerified: status === 'verified',
    isPending: status === 'pending',
  };
}
