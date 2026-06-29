import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type VerificationMethod = 'email' | 'id' | null;
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

function generateUserId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

interface OnboardingStore {
  userId: string;
  isComplete: boolean;
  step: number;
  name: string;
  school: string;
  major: string;
  year: string;
  interests: string[];
  bio: string;
  currentProject: string;
  projectDescription: string;
  openToCollaborate: boolean;
  verificationMethod: VerificationMethod;
  verificationStatus: VerificationStatus;
  verificationEmail: string;
  nextStep: () => void;
  prevStep: () => void;
  setName: (v: string) => void;
  setSchool: (v: string) => void;
  setMajor: (v: string) => void;
  setYear: (v: string) => void;
  toggleInterest: (interest: string) => void;
  setBio: (v: string) => void;
  setCurrentProject: (v: string) => void;
  setProjectDescription: (v: string) => void;
  setOpenToCollaborate: (v: boolean) => void;
  setVerification: (method: VerificationMethod, status: VerificationStatus, email?: string) => void;
  complete: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      userId: generateUserId(),
      isComplete: false,
      step: 0,
      name: '',
      school: '',
      major: '',
      year: '',
      interests: [],
      bio: '',
      currentProject: '',
      projectDescription: '',
      openToCollaborate: true,
      verificationMethod: null,
      verificationStatus: 'none',
      verificationEmail: '',
      nextStep: () => set((s) => ({ step: s.step + 1 })),
      prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      setName: (v) => set({ name: v }),
      setSchool: (v) => set({ school: v }),
      setMajor: (v) => set({ major: v }),
      setYear: (v) => set({ year: v }),
      toggleInterest: (interest) =>
        set((s) => ({
          interests: s.interests.includes(interest)
            ? s.interests.filter((i) => i !== interest)
            : [...s.interests, interest],
        })),
      setBio: (v) => set({ bio: v }),
      setCurrentProject: (v) => set({ currentProject: v }),
      setProjectDescription: (v) => set({ projectDescription: v }),
      setOpenToCollaborate: (v) => set({ openToCollaborate: v }),
      setVerification: (method, status, email = '') =>
        set({ verificationMethod: method, verificationStatus: status, verificationEmail: email }),
      complete: () => set({ isComplete: true }),
      // userId intentionally excluded from reset — it's a permanent device identifier
      resetOnboarding: () => set({
        isComplete: false,
        step: 0,
        name: '',
        school: '',
        major: '',
        year: '',
        interests: [],
        bio: '',
        currentProject: '',
        projectDescription: '',
        openToCollaborate: true,
        verificationMethod: null,
        verificationStatus: 'none',
        verificationEmail: '',
      }),
    }),
    {
      name: 'forge-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        userId: s.userId,
        isComplete: s.isComplete,
        name: s.name,
        school: s.school,
        major: s.major,
        year: s.year,
        interests: s.interests,
        bio: s.bio,
        currentProject: s.currentProject,
        projectDescription: s.projectDescription,
        openToCollaborate: s.openToCollaborate,
        verificationMethod: s.verificationMethod,
        verificationStatus: s.verificationStatus,
        verificationEmail: s.verificationEmail,
      }),
    }
  )
);
