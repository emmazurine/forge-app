import { Spot, SpotType } from '../types/spot';
import { formatDistance, haversinemiles } from '../utils/distance';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';
export const isGoogleConfigured = KEY.length > 10;

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.formattedAddress',
  'places.types',
  'places.primaryType',
  'places.dineIn',
  'places.currentOpeningHours.openNow',
  'places.currentOpeningHours.weekdayDescriptions',
  'places.businessStatus',
].join(',');

// Secondary types that disqualify a place (unless it's also explicitly a cafe)
const EXCLUDE_TYPES = new Set([
  'restaurant', 'fast_food_restaurant', 'meal_delivery', 'meal_takeaway',
  'bar', 'night_club', 'liquor_store', 'grocery_store', 'supermarket',
  'convenience_store', 'gas_station', 'beauty_salon', 'hair_salon',
  'spa', 'gym', 'lodging', 'hotel', 'motel',
]);

// Primary types that are never study spots regardless of other signals
const EXCLUDE_PRIMARY_TYPES = new Set([
  'donut_shop', 'ice_cream_shop', 'juice_bar', 'sandwich_shop',
  'fast_food_restaurant', 'meal_delivery', 'meal_takeaway',
  'pizza_restaurant', 'burger_restaurant', 'mexican_restaurant',
  'chinese_restaurant', 'japanese_restaurant', 'thai_restaurant',
  'indian_restaurant', 'mediterranean_restaurant', 'seafood_restaurant',
  'steak_house', 'sushi_restaurant', 'ramen_restaurant', 'noodle_restaurant',
  'american_restaurant', 'italian_restaurant', 'french_restaurant',
  'bar', 'night_club', 'grocery_store', 'convenience_store',
  'gas_station', 'beauty_salon', 'spa', 'gym', 'lodging',
]);

const EXCLUDE_NAMES = [
  /little free library/i,
  /little library/i,
  /book exchange/i,
  /book box/i,
  /book nook/i,
  /virtual office/i,
  /registered agent/i,
  /mailbox/i,
  /readyspaces/i,
  /ups store/i,
  /the ups/i,
  /postal/i,
  /storage/i,
  // Quick-service / no-seating chains
  /dunkin/i,
  /krispy kreme/i,
  /duck donut/i,
  /dutch bros/i,
  /7.?eleven/i,
  /wawa/i,
  /sheetz/i,
  /jersey mike/i,
  /subway/i,
  /chipotle/i,
  /chick.?fil.?a/i,
  /mcdonald/i,
  /taco bell/i,
  /sonic drive/i,
  /smoothie king/i,
  /tropical smoothie/i,
  /jamba juice/i,
];

const MIN_REVIEWS: Record<SpotType, number> = {
  library: 10,
  campus: 5,
  cafe: 8,
  coworking: 5,
  other: 15,
};

const ACCENT: Record<SpotType, string> = {
  cafe: '#F59E0B',
  library: '#6366F1',
  campus: '#22C55E',
  coworking: '#3B82F6',
  other: '#8B5CF6',
};

function googleTypeToSpotType(types: string[]): SpotType {
  if (types.includes('library')) return 'library';
  if (types.includes('university') || types.includes('school')) return 'campus';
  if (types.includes('cafe') || types.includes('coffee_shop')) return 'cafe';
  if (types.includes('coworking_space')) return 'coworking';
  return 'other';
}

function tagsFromTypes(types: string[]): string[] {
  const tags: string[] = [];
  if (types.includes('library')) tags.push('Library');
  if (types.includes('cafe') || types.includes('coffee_shop')) tags.push('Coffee');
  if (types.includes('university') || types.includes('school')) tags.push('Campus');
  if (types.includes('coworking_space')) tags.push('Coworking');
  return tags.slice(0, 3);
}

async function searchNearby(lat: number, lng: number, types: string[], radiusMeters: number): Promise<any[]> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
    }),
  });
  const json = await res.json();
  if (json.error) console.warn('Places API error:', json.error.message);
  return (json.places ?? []).filter((p: any) => p.businessStatus !== 'CLOSED_PERMANENTLY');
}

function todayHours(weekdayDescriptions?: string[]): string {
  if (!weekdayDescriptions?.length) return '';
  // Google returns Mon=0…Sun=6; JS getDay() returns Sun=0…Sat=6
  const jsDay = new Date().getDay();
  const googleDay = (jsDay + 6) % 7;
  const raw = weekdayDescriptions[googleDay] ?? '';
  // Strip the day-name prefix: "Monday: 7:00 AM – 9:00 PM" → "7:00 AM – 9:00 PM"
  return raw.replace(/^[^:]+:\s*/, '');
}

function mapToSpot(p: any, userLat: number, userLng: number): Spot {
  const types: string[] = p.types ?? [];
  const spotType = googleTypeToSpotType(types);
  const lat = p.location?.latitude ?? 0;
  const lng = p.location?.longitude ?? 0;
  const miles = haversinemiles(userLat, userLng, lat, lng);
  return {
    id: `g-${p.id}`,
    googlePlaceId: p.id,
    name: p.displayName?.text ?? 'Unknown',
    type: spotType,
    description: '',
    address: p.formattedAddress ?? '',
    distance: formatDistance(miles),
    lat,
    lng,
    hours: todayHours(p.currentOpeningHours?.weekdayDescriptions),
    noiseLevel: spotType === 'library' ? 'quiet' : 'moderate',
    wifiQuality: 'good',
    outlets: 'some',
    seating: 'moderate',
    workStyle: 'both',
    tags: tagsFromTypes(types),
    rating: p.rating ?? 0,
    reviewCount: p.userRatingCount ?? 0,
    accentColor: ACCENT[spotType],
    openNow: p.currentOpeningHours?.openNow,
  };
}

export async function fetchNearbyStudySpots(userLat: number, userLng: number): Promise<Spot[]> {
  if (!isGoogleConfigured) return [];

  const [cafes, libraries, coworking] = await Promise.all([
    searchNearby(userLat, userLng, ['cafe'], 5000),
    searchNearby(userLat, userLng, ['library'], 10000),
    searchNearby(userLat, userLng, ['coworking_space'], 10000),
  ]);

  const seen = new Set<string>();
  const all: Spot[] = [];
  for (const p of [...cafes, ...libraries, ...coworking]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);

    const name = p.displayName?.text ?? '';
    if (EXCLUDE_NAMES.some((re) => re.test(name))) continue;

    const types: string[] = p.types ?? [];
    const primaryType: string = p.primaryType ?? '';

    // Drop by primary type (no exceptions — a donut shop is a donut shop)
    if (EXCLUDE_PRIMARY_TYPES.has(primaryType)) continue;

    // Use primaryType — Google's most specific classification — to determine if this is truly a cafe.
    // Checking the types[] array alone lets restaurants like "Eggs & Sushi" through because Google
    // adds 'cafe' as a loose secondary type. primaryType doesn't lie.
    const isTrueCafe = primaryType === 'cafe' || primaryType === 'coffee_shop';
    const isLibraryOrCoworking = types.includes('library') || types.includes('coworking_space') || types.includes('university') || types.includes('school');

    if (!isTrueCafe && !isLibraryOrCoworking) continue;

    // Cafes with dineIn explicitly false have no seating — not a study spot
    if (isTrueCafe && p.dineIn === false) continue;

    const spotType = googleTypeToSpotType(types);
    const minReviews = MIN_REVIEWS[spotType];
    const reviews = p.userRatingCount ?? 0;
    const rating = p.rating ?? 0;

    if (reviews < minReviews) continue;
    if (rating > 0 && rating < 3.5) continue;

    all.push(mapToSpot(p, userLat, userLng));
  }

  return all.sort((a, b) => {
    const da = haversinemiles(userLat, userLng, a.lat, a.lng);
    const db = haversinemiles(userLat, userLng, b.lat, b.lng);
    return da - db;
  });
}
