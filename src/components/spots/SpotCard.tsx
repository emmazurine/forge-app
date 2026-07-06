import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors as StaticColors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { useGuestGuard } from '../../hooks/useGuestGuard';
import { useBookmarksStore } from '../../store/bookmarks';
import { useCheckinsStore } from '../../store/checkins';
import { Spot } from '../../types/spot';
import { isSpotOpenNow } from '../../utils/hours';
import { SpotTypeBadge } from '../ui/Badge';

const NOISE_CONFIG = {
  silent: { icon: 'volume-mute', label: 'Silent', color: StaticColors.green },
  quiet: { icon: 'volume-low', label: 'Quiet', color: StaticColors.green },
  moderate: { icon: 'volume-medium', label: 'Moderate', color: StaticColors.orange },
  lively: { icon: 'volume-high', label: 'Lively', color: StaticColors.red },
} as const;

const WIFI_CONFIG = {
  excellent: { icon: 'wifi', label: 'Excellent WiFi', color: StaticColors.green },
  good: { icon: 'wifi', label: 'Good WiFi', color: StaticColors.green },
  fair: { icon: 'wifi', label: 'Fair WiFi', color: StaticColors.orange },
  none: { icon: 'wifi-outline', label: 'No WiFi', color: StaticColors.red },
} as const;

const OUTLET_CONFIG = {
  plentiful: { icon: 'flash', label: 'Lots of Outlets', color: StaticColors.green },
  some: { icon: 'flash', label: 'Some Outlets', color: StaticColors.orange },
  few: { icon: 'flash-outline', label: 'Few Outlets', color: StaticColors.orange },
  none: { icon: 'flash-outline', label: 'No Outlets', color: StaticColors.red },
} as const;

interface SpotCardProps {
  spot: Spot;
  compact?: boolean;
}

export function SpotCard({ spot, compact = false }: SpotCardProps) {
  const router = useRouter();
  const Colors = useColors();
  const { toggle, isBookmarked } = useBookmarksStore();
  const saved = isBookmarked(spot.id);
  const guard = useGuestGuard();
  const handleToggleBookmark = () => {
    if (saved) { toggle(spot.id); return; }
    guard('save this spot', () => toggle(spot.id));
  };
  const noise = NOISE_CONFIG[spot.noiseLevel];
  const wifi = WIFI_CONFIG[spot.wifiQuality];
  const outlet = OUTLET_CONFIG[spot.outlets];
  const openNow = spot.openNow !== undefined ? spot.openNow : isSpotOpenNow(spot.hours);
  const allCheckins = useCheckinsStore((s) => s.checkins);
  const now = Date.now();
  const liveCount = allCheckins.filter((c) => c.spotId === spot.id && c.expiresAt > now).length;

  const styles = useMemo(() => StyleSheet.create({
    // ── List layout ──
    card: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    pressed: { opacity: 0.75 },
    accent: { width: 3 },
    body: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
    headerLeft: { flex: 1, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flexShrink: 1 },
    openBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, flexShrink: 0 },
    openBadgeOpen: { backgroundColor: Colors.greenSoft },
    openBadgeClosed: { backgroundColor: Colors.redSoft },
    openDot: { width: 5, height: 5, borderRadius: 3 },
    openText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold },
    meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
    attrs: { flexDirection: 'row', gap: Spacing.lg },
    attr: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    attrText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    tags: { flexDirection: 'row', gap: Spacing.xs },
    tag: { backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderSubtle },
    tagText: { fontSize: FontSize.xs, color: Colors.textMuted },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    ratingText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text },
    reviewText: { fontSize: FontSize.xs, color: Colors.textMuted },
    liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderSubtle, marginTop: -Spacing.xs },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
    liveText: { fontSize: FontSize.xs, color: Colors.green, fontWeight: FontWeight.medium },
    // ── Grid / compact layout ──
    cardCompact: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
    },
    accentBar: { height: 3, width: '100%' },
    bodyCompact: { flex: 1, padding: Spacing.sm + 2, gap: Spacing.xs + 1 },
    nameCompact: { fontSize: FontSize.xs + 1, fontWeight: FontWeight.semibold, color: Colors.text, lineHeight: 16 },
    metaCompact: { fontSize: FontSize.xs - 1, color: Colors.textMuted },
    attrsCompact: { flexDirection: 'row', gap: Spacing.xs + 2 },
    footerCompact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' as any },
    liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  }), [Colors]);

  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [styles.cardCompact, pressed && styles.pressed]}
        onPress={() => router.push(`/spot/${spot.id}`)}
      >
        <View style={[styles.accentBar, { backgroundColor: spot.accentColor }]} />
        <View style={styles.bodyCompact}>
          <View style={{ gap: 4 }}>
            <Text style={styles.nameCompact} numberOfLines={2}>{spot.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
              {openNow !== null && (
                <View style={[styles.openBadge, openNow ? styles.openBadgeOpen : styles.openBadgeClosed]}>
                  <View style={[styles.openDot, { backgroundColor: openNow ? Colors.green : Colors.red }]} />
                  <Text style={[styles.openText, { color: openNow ? Colors.green : Colors.red }]}>
                    {openNow ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
              <SpotTypeBadge type={spot.type} />
            </View>
            <Text style={styles.metaCompact}>{spot.distance}</Text>
          </View>

          <View style={styles.attrsCompact}>
            <Ionicons name={noise.icon as any} size={12} color={noise.color} />
            <Ionicons name={wifi.icon as any} size={12} color={wifi.color} />
            <Ionicons name={outlet.icon as any} size={12} color={outlet.color} />
            {liveCount > 0 && <View style={styles.liveDotSmall} />}
          </View>

          <View style={styles.footerCompact}>
            <View style={styles.rating}>
              <Ionicons name="star" size={11} color={Colors.orange} />
              <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            </View>
            <Pressable onPress={handleToggleBookmark} hitSlop={10}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={15}
                color={saved ? Colors.accent : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/spot/${spot.id}`)}
    >
      <View style={[styles.accent, { backgroundColor: spot.accentColor }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{spot.name}</Text>
              {openNow !== null && (
                <View style={[styles.openBadge, openNow ? styles.openBadgeOpen : styles.openBadgeClosed]}>
                  <View style={[styles.openDot, { backgroundColor: openNow ? Colors.green : Colors.red }]} />
                  <Text style={[styles.openText, { color: openNow ? Colors.green : Colors.red }]}>
                    {openNow ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaText}>{spot.distance}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaText} numberOfLines={1}>{spot.hours}</Text>
            </View>
          </View>
          <SpotTypeBadge type={spot.type} />
        </View>

        <View style={styles.attrs}>
          <Attr styles={styles} icon={noise.icon as any} label={noise.label} color={noise.color} />
          <Attr styles={styles} icon={wifi.icon as any} label={wifi.label} color={wifi.color} />
          <Attr styles={styles} icon={outlet.icon as any} label={outlet.label} color={outlet.color} />
        </View>

        <View style={styles.footer}>
          <View style={styles.tags}>
            {spot.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footerRight}>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={Colors.orange} />
              <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
              <Text style={styles.reviewText}>({spot.reviewCount})</Text>
            </View>
            <Pressable onPress={handleToggleBookmark} hitSlop={10}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={saved ? Colors.accent : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {liveCount > 0 && (
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {liveCount} {liveCount === 1 ? 'person' : 'people'} here now
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function Attr({ icon, label, color, styles }: { icon: string; label: string; color: string; styles: any }) {
  return (
    <View style={styles.attr}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={[styles.attrText, { color }]}>{label}</Text>
    </View>
  );
}
