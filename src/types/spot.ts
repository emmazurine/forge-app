export type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'lively';
export type WifiQuality = 'excellent' | 'good' | 'fair' | 'none';
export type OutletDensity = 'plentiful' | 'some' | 'few' | 'none';
export type SeatingAmount = 'plenty' | 'moderate' | 'limited';
export type WorkStyle = 'solo' | 'group' | 'both';
export type SpotType = 'cafe' | 'library' | 'campus' | 'coworking' | 'other';

export interface Spot {
  id: string;
  name: string;
  type: SpotType;
  description: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  hours: string;
  noiseLevel: NoiseLevel;
  wifiQuality: WifiQuality;
  outlets: OutletDensity;
  seating: SeatingAmount;
  workStyle: WorkStyle;
  tags: string[];
  rating: number;
  reviewCount: number;
  accentColor: string;
  openNow?: boolean;
  googlePlaceId?: string;
}

export type SpotFilter = 'all' | 'quiet' | 'wifi' | 'outlets' | 'group' | 'open' | 'saved';
