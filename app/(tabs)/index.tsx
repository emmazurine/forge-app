import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterBar } from '../../src/components/spots/FilterBar';
import { SpotCard } from '../../src/components/spots/SpotCard';
import { Logo } from '../../src/components/ui/Logo';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useBookmarksStore } from '../../src/store/bookmarks';
import { useSpotsStore } from '../../src/store/spots';
import { Spot, SpotFilter } from '../../src/types/spot';
import { isSpotOpenNow } from '../../src/utils/hours';
import { NotificationBell } from '../../src/components/ui/NotificationBell';

function applyFilter(spots: Spot[], filter: SpotFilter, query: string, savedIds: string[]): Spot[] {
  let result = spots;
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  switch (filter) {
    case 'saved':   return result.filter((s) => savedIds.includes(s.id));
    case 'quiet':   return result.filter((s) => s.noiseLevel === 'quiet' || s.noiseLevel === 'silent');
    case 'wifi':    return result.filter((s) => s.wifiQuality === 'excellent' || s.wifiQuality === 'good');
    case 'outlets': return result.filter((s) => s.outlets === 'plentiful' || s.outlets === 'some');
    case 'group':   return result.filter((s) => s.workStyle === 'group' || s.workStyle === 'both');
    case 'open':    return result.filter((s) => isSpotOpenNow(s.hours) === true);
    default:        return result;
  }
}

export default function SpotsScreen() {
  const router = useRouter();
  const Colors = useColors();
  const spots = useSpotsStore((s) => s.spots);
  const savedIds = useBookmarksStore((s) => s.savedIds);
  const [filter, setFilter] = useState<SpotFilter>('all');
  const [query, setQuery] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    logoRow: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
    pageTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    pageTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    pageTitle: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.8 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
    addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff', letterSpacing: 0.2 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 42, gap: Spacing.sm },
    searchIcon: { marginRight: 2 },
    searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
    list: { flex: 1 },
    listContent: { paddingTop: Spacing.lg, paddingBottom: 120 },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  }), [Colors]);

  const filtered = useMemo(
    () => applyFilter(spots, filter, query, savedIds),
    [spots, filter, query, savedIds]
  );

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <NotificationBell />
          <Pressable style={[styles.addBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }]} onPress={() => router.push('/map')}>
            <Ionicons name="map-outline" size={15} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.addBtn} onPress={() => router.push('/spot/add')}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search spots..." placeholderTextColor={Colors.textMuted} value={query} onChangeText={setQuery} />
        {query.length > 0 && <Ionicons name="close-circle" size={16} color={Colors.textMuted} onPress={() => setQuery('')} />}
      </View>

      <FilterBar active={filter} onSelect={setFilter} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No spots found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        ) : (
          filtered.map((spot) => <SpotCard key={spot.id} spot={spot} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
