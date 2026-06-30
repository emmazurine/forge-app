import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SpotSuggestion, SuggestionField } from '../types/suggestion';

const CONFIRM_THRESHOLD = 3;

interface SuggestionsStore {
  suggestions: SpotSuggestion[];
  addSuggestion: (spotId: string, field: SuggestionField, suggestedValue: string, userId: string) => void;
  confirmSuggestion: (id: string, userId: string) => void;
  deleteSuggestion: (id: string, userId: string) => void;
  getForSpot: (spotId: string) => SpotSuggestion[];
  getEffectiveValue: (spotId: string, field: SuggestionField, defaultValue: string) => { value: string; communityUpdated: boolean };
}

export const useSuggestionsStore = create<SuggestionsStore>()(
  persist(
    (set, get) => ({
      suggestions: [],

      addSuggestion: (spotId, field, suggestedValue, userId) => {
        // Don't allow duplicate pending suggestion for same spot+field+value from same user
        const existing = get().suggestions.find(
          (s) => s.spotId === spotId && s.field === field && s.suggestedValue === suggestedValue && s.status === 'pending'
        );
        if (existing) {
          // Just confirm it instead
          get().confirmSuggestion(existing.id, userId);
          return;
        }
        const suggestion: SpotSuggestion = {
          id: `${spotId}-${field}-${Date.now()}`,
          spotId,
          field,
          suggestedValue,
          submittedBy: userId,
          submittedAt: Date.now(),
          confirmedBy: [userId],
          status: 'pending',
        };
        set((s) => ({ suggestions: [suggestion, ...s.suggestions] }));
      },

      deleteSuggestion: (id, userId) => {
        set((s) => ({
          suggestions: s.suggestions.filter(
            (sg) => !(sg.id === id && sg.submittedBy === userId && sg.status === 'pending')
          ),
        }));
      },

      confirmSuggestion: (id, userId) => {
        set((s) => ({
          suggestions: s.suggestions.map((sg) => {
            if (sg.id !== id || sg.confirmedBy.includes(userId)) return sg;
            const confirmedBy = [...sg.confirmedBy, userId];
            const status = confirmedBy.length >= CONFIRM_THRESHOLD ? 'applied' : 'pending';
            return { ...sg, confirmedBy, status };
          }),
        }));
      },

      getForSpot: (spotId) =>
        get().suggestions.filter((s) => s.spotId === spotId),

      getEffectiveValue: (spotId, field, defaultValue) => {
        const applied = get().suggestions.find(
          (s) => s.spotId === spotId && s.field === field && s.status === 'applied'
        );
        if (applied) return { value: applied.suggestedValue, communityUpdated: true };
        return { value: defaultValue, communityUpdated: false };
      },
    }),
    {
      name: 'forge-suggestions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
