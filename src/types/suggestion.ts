export type SuggestionField = 'noiseLevel' | 'wifiQuality' | 'outlets' | 'seating' | 'workStyle';

export interface SpotSuggestion {
  id: string;
  spotId: string;
  field: SuggestionField;
  suggestedValue: string;
  submittedBy: string;
  submittedAt: number;
  confirmedBy: string[];
  status: 'pending' | 'applied';
}
