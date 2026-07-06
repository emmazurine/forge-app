import { Ionicons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNearbyStudySpots, isGoogleConfigured } from '../../src/lib/googlePlaces';
import { useOnboardingStore } from '../../src/store/onboarding';
import { geocodeZip } from '../../src/utils/geocode';
import { FilterBar } from '../../src/components/spots/FilterBar';
import { SpotCard } from '../../src/components/spots/SpotCard';
import { Logo } from '../../src/components/ui/Logo';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useBookmarksStore } from '../../src/store/bookmarks';
import { useSpotsStore } from '../../src/store/spots';
import { Spot, SpotFilter } from '../../src/types/spot';
import { formatDistance, haversinemiles } from '../../src/utils/distance';
import { isSpotOpenNow } from '../../src/utils/hours';

const DISTANCE_OPTIONS: { label: string; miles: number }[] = [
  { label: '1 mi', miles: 1 },
  { label: '3 mi', miles: 3 },
  { label: '5 mi', miles: 5 },
  { label: '10 mi', miles: 10 },
  { label: '25 mi', miles: 25 },
  { label: 'Any', miles: 9999 },
];
const DEFAULT_MAX_MILES = 10;

type SpotWithDist = Spot & { _miles: number };

function withDistances(spots: Spot[], userLat: number, userLng: number): SpotWithDist[] {
  return spots.map((s) => {
    const miles = haversinemiles(userLat, userLng, s.lat, s.lng);
    return { ...s, _miles: miles, distance: formatDistance(miles) };
  });
}

function applyFilter(spots: SpotWithDist[], filter: SpotFilter, query: string, savedIds: string[], maxMiles: number): SpotWithDist[] {
  let result = spots.filter((s) => s._miles <= maxMiles);
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  switch (filter) {
    case 'saved':   result = result.filter((s) => savedIds.includes(s.id)); break;
    case 'quiet':   result = result.filter((s) => s.noiseLevel === 'quiet' || s.noiseLevel === 'silent'); break;
    case 'wifi':    result = result.filter((s) => s.wifiQuality === 'excellent' || s.wifiQuality === 'good'); break;
    case 'outlets': result = result.filter((s) => s.outlets === 'plentiful' || s.outlets === 'some'); break;
    case 'group':   result = result.filter((s) => s.workStyle === 'group' || s.workStyle === 'both'); break;
    case 'open':    result = result.filter((s) =>
      s.openNow === true || (s.openNow === undefined && isSpotOpenNow(s.hours) === true)
    ); break;
  }
  return result.sort((a, b) => a._miles - b._miles);
}

export default function SpotsScreen() {
  const router = useRouter();
  const Colors = useColors();
  const allSpotsFromStore = useSpotsStore((s) => s.spots);
  const cacheGoogleSpots = useSpotsStore((s) => s.cacheGoogleSpots);
  const savedIds = useBookmarksStore((s) => s.savedIds);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filter, setFilter] = useState<SpotFilter>('all');
  const [query, setQuery] = useState('');
  const [maxMiles, setMaxMiles] = useState(DEFAULT_MAX_MILES);
  const [showDistDrop, setShowDistDrop] = useState(false);
  const [dropAnchor, setDropAnchor] = useState({ x: 0, y: 0, width: 0 });
  const distBtnRef = useRef<View>(null);
  const zipCode = useOnboardingStore((s) => s.zipCode);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  // 'gps' = using live GPS, 'zip' = using geocoded home zip, 'none' = no location at all
  const [locMode, setLocMode] = useState<'gps' | 'zip' | 'none'>('none');
  const [googleSpots, setGoogleSpots] = useState<Spot[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  async function fetchAndSetPlaces(lat: number, lng: number) {
    if (!isGoogleConfigured) return;
    setLoadingPlaces(true);
    try {
      const places = await fetchNearbyStudySpots(lat, lng);
      setGoogleSpots(places);
      cacheGoogleSpots(places);
    } catch (e) {
      console.warn('Google Places fetch failed', e);
    } finally {
      setLoadingPlaces(false);
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        setLocMode('gps');
        await fetchAndSetPlaces(latitude, longitude);
        return;
      }
      // GPS denied — fall back to home zip code
      if (zipCode.trim().length >= 3) {
        const coords = await geocodeZip(zipCode);
        if (coords) {
          setUserLat(coords.lat);
          setUserLng(coords.lng);
          setLocMode('zip');
          await fetchAndSetPlaces(coords.lat, coords.lng);
          return;
        }
      }
      setLocMode('none');
    })();
  }, []);

  const selectedLabel = DISTANCE_OPTIONS.find((o) => o.miles === maxMiles)?.label ?? `${maxMiles} mi`;

  const openDrop = () => {
    distBtnRef.current?.measure((_fx, _fy, width, _height, px, py) => {
      setDropAnchor({ x: px, y: py + _height + 4, width });
      setShowDistDrop(true);
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    logoRow: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
    pageTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    pageTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    pageTitle: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.8 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
    addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff', letterSpacing: 0.2 },
    distBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: Colors.surface, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
      borderWidth: 1, borderColor: Colors.border,
    },
    distBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
    distBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
    distBtnTextActive: { color: Colors.accent },
    dropOverlay: { flex: 1 },
    dropMenu: {
      position: 'absolute', backgroundColor: Colors.surface,
      borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
      minWidth: 120, overflow: 'hidden',
    },
    dropItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2,
      borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    dropItemLast: { borderBottomWidth: 0 },
    dropItemActive: { backgroundColor: Colors.accentSoft },
    dropItemText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    dropItemTextActive: { color: Colors.accent, fontWeight: FontWeight.semibold },
    banner: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
      backgroundColor: Colors.orangeSoft, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderWidth: 1, borderColor: Colors.orange + '33',
    },
    bannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
    bannerBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 3, backgroundColor: Colors.orange, borderRadius: Radius.sm },
    bannerBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#fff' },
    loadingBanner: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
      backgroundColor: Colors.accentSoft, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    loadingBannerText: { fontSize: FontSize.xs, color: Colors.accent },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 42, gap: Spacing.sm },
    searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
    list: { flex: 1 },
    listContent: { paddingTop: Spacing.lg, paddingBottom: 120 },
    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, gap: Spacing.md },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textAlign: 'center' },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.sm },
    emptyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
    viewToggle: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    gridRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
    gridPlaceholder: { flex: 1 },
  }), [Colors]);

  const allSpots = useMemo(() => {
    if (userLat == null || userLng == null) return [];
    const userAdded = allSpotsFromStore.filter((sp) => sp.id.startsWith('user-'));
    const base = isGoogleConfigured ? [...googleSpots, ...userAdded] : allSpotsFromStore;
    const seen = new Set<string>();
    const deduped = base.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
    return withDistances(deduped, userLat, userLng);
  }, [googleSpots, allSpotsFromStore, userLat, userLng]);

  const filtered = useMemo(
    () => applyFilter(allSpots, filter, query, savedIds, maxMiles),
    [allSpots, filter, query, savedIds, maxMiles]
  );

  const noneNearby = locMode !== 'none' && userLat != null && !loadingPlaces && allSpots.filter((s) => s._miles <= maxMiles).length === 0;
  const isFiltered = maxMiles !== DEFAULT_MAX_MILES;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.logoRow}>
        <Logo size="xxl" showMark={false} />
      </View>
      <View style={styles.pageTitleRow}>
        <Pressable style={styles.pageTitleLeft} onPress={() => router.navigate('/')}>
          <Logo size="md" showWordmark={false} />
          <Text style={styles.pageTitle}>Spots</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <NotificationBell />
          <View ref={distBtnRef}>
            <Pressable
              style={[styles.distBtn, isFiltered && styles.distBtnActive]}
              onPress={openDrop}
            >
              <Ionicons name="navigate-outline" size={13} color={isFiltered ? Colors.accent : Colors.textMuted} />
              <Text style={[styles.distBtnText, isFiltered && styles.distBtnTextActive]}>
                {selectedLabel}
              </Text>
              <Ionicons name="chevron-down" size={12} color={isFiltered ? Colors.accent : Colors.textMuted} />
            </Pressable>
          </View>
          <Pressable style={styles.viewToggle} onPress={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}>
            <Ionicons name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} size={16} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={[styles.addBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }]} onPress={() => router.push('/map')}>
            <Ionicons name="map-outline" size={15} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.addBtn} onPress={() => router.push('/spot/add')}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      {locMode === 'zip' && (
        <View style={[styles.banner, { backgroundColor: Colors.accentSoft, borderColor: Colors.accent + '33' }]}>
          <Ionicons name="home-outline" size={16} color={Colors.accent} />
          <Text style={[styles.bannerText, { color: Colors.accent }]}>
            Showing spots near zip {zipCode}
          </Text>
          {Platform.OS !== 'web' && (
            <Pressable style={[styles.bannerBtn, { backgroundColor: Colors.accent }]} onPress={() => ExpoLinking.openSettings()}>
              <Text style={styles.bannerBtnText}>Use GPS</Text>
            </Pressable>
          )}
        </View>
      )}
      {locMode === 'none' && (
        <View style={styles.banner}>
          <Ionicons name="location-outline" size={16} color={Colors.orange} />
          <Text style={styles.bannerText}>
            {Platform.OS === 'web'
              ? 'Allow location in your browser, or add a zip code during setup.'
              : 'Enable location or add a zip code in your profile.'}
          </Text>
          {Platform.OS !== 'web' && (
            <Pressable style={styles.bannerBtn} onPress={() => ExpoLinking.openSettings()}>
              <Text style={styles.bannerBtnText}>Settings</Text>
            </Pressable>
          )}
        </View>
      )}

      {loadingPlaces && (
        <View style={styles.loadingBanner}>
          <Ionicons name="navigate-outline" size={14} color={Colors.accent} />
          <Text style={styles.loadingBannerText}>Finding spots near you…</Text>
        </View>
      )}

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search spots..." placeholderTextColor={Colors.textMuted} value={query} onChangeText={setQuery} />
        {query.length > 0 && <Ionicons name="close-circle" size={16} color={Colors.textMuted} onPress={() => setQuery('')} />}
      </View>

      <FilterBar active={filter} onSelect={setFilter} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {noneNearby ? (
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No spots within {selectedLabel}</Text>
            <Text style={styles.emptySubtitle}>Try increasing your distance or be the first to add a spot nearby.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/spot/add')}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Add a spot</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No spots found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        ) : viewMode === 'list' ? (
          filtered.map((spot) => <SpotCard key={spot.id} spot={spot} />)
        ) : (
          filtered.reduce<React.ReactElement[]>((rows, spot, i) => {
            if (i % 3 === 0) {
              const b = filtered[i + 1];
              const c = filtered[i + 2];
              rows.push(
                <View key={spot.id} style={styles.gridRow}>
                  <SpotCard spot={spot} compact />
                  {b ? <SpotCard spot={b} compact /> : <View style={styles.gridPlaceholder} />}
                  {c ? <SpotCard spot={c} compact /> : <View style={styles.gridPlaceholder} />}
                </View>
              );
            }
            return rows;
          }, [])
        )}
      </ScrollView>

      <Modal visible={showDistDrop} transparent animationType="fade" onRequestClose={() => setShowDistDrop(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDistDrop(false)}>
          <View style={styles.dropOverlay}>
            <View style={[styles.dropMenu, { top: dropAnchor.y, right: 16 }]}>
              {DISTANCE_OPTIONS.map((opt, i) => {
                const active = opt.miles === maxMiles;
                return (
                  <Pressable
                    key={opt.miles}
                    style={[styles.dropItem, i === DISTANCE_OPTIONS.length - 1 && styles.dropItemLast, active && styles.dropItemActive]}
                    onPress={() => { setMaxMiles(opt.miles); setShowDistDrop(false); }}
                  >
                    <Text style={[styles.dropItemText, active && styles.dropItemTextActive]}>{opt.label}</Text>
                    {active && <Ionicons name="checkmark" size={14} color={Colors.accent} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
