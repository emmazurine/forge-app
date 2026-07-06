import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpotTypeBadge } from '../../src/components/ui/Badge';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { ColorPalette } from '../../src/constants/themes';
import { useColors } from '../../src/hooks/useColors';
import { useGuestGuard } from '../../src/hooks/useGuestGuard';
import { useBookmarksStore } from '../../src/store/bookmarks';
import { useCheckinsStore } from '../../src/store/checkins';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useProfileStore } from '../../src/store/profile';
import { useSpotsStore } from '../../src/store/spots';
import { useSuggestionsStore } from '../../src/store/suggestions';
import { SuggestionField } from '../../src/types/suggestion';
import { isSpotOpenNow } from '../../src/utils/hours';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    error: { color: C.textMuted, textAlign: 'center', marginTop: 100 },
    content: { paddingBottom: 60 },
    hero: { marginHorizontal: Spacing.lg, marginTop: 80, marginBottom: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', position: 'relative' },
    bookmarkBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 1, padding: Spacing.sm },
    heroInner: { padding: Spacing.xl, gap: Spacing.sm },
    heroName: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.5, marginTop: Spacing.sm },
    heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroMetaText: { fontSize: FontSize.sm, color: C.textMuted, flex: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.xs },
    ratingValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    ratingCount: { fontSize: FontSize.sm, color: C.textMuted },
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.md },
    sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    description: { fontSize: FontSize.md, color: C.textSecondary, lineHeight: 24 },
    detailGrid: { backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.borderSubtle },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    detailLabel: { fontSize: FontSize.sm, color: C.textSecondary },
    detailRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' },
    detailBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    detailBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
    detailValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textAlign: 'right', flexShrink: 1 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: { backgroundColor: C.surface, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: C.border },
    tagText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    distanceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentSoft, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.accent + '33', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.md },
    distanceText: { fontSize: FontSize.sm, color: C.accent, fontWeight: FontWeight.medium },
    reviewSection: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg, gap: Spacing.lg },
    starRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    starLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.orange, marginLeft: Spacing.xs },
    reviewInput: { backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, color: C.text, fontSize: FontSize.sm, minHeight: 80, lineHeight: 20 },
    reviewSubmit: { backgroundColor: C.accent, paddingVertical: Spacing.md + 2, borderRadius: Radius.lg, alignItems: 'center' },
    reviewSubmitDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    reviewSubmitPressed: { opacity: 0.85 },
    reviewSubmitText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
    reviewSubmitTextDisabled: { color: C.textMuted },
    reviewThanks: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
    reviewThanksText: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: C.text },
    whoSection: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg, gap: Spacing.md },
    whoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    whoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    whoLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
    whoTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    whoCount: { fontSize: FontSize.xs, color: C.green, fontWeight: FontWeight.medium },
    whoEmpty: { fontSize: FontSize.sm, color: C.textMuted, fontStyle: 'italic' },
    whoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
    whoAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    whoAvatarText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
    whoInfo: { flex: 1, gap: 2 },
    whoName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    whoLabel: { fontSize: FontSize.xs, color: C.textSecondary },
    whoTime: { fontSize: FontSize.xs, color: C.textMuted },
    myCheckinRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: Radius.md, borderWidth: 1, borderColor: C.green + '33', padding: Spacing.md, gap: Spacing.md },
    myCheckinInfo: { flex: 1, gap: 2 },
    myCheckinYou: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.green },
    myCheckinLabel: { fontSize: FontSize.xs, color: C.green, opacity: 0.85, fontStyle: 'italic' },
    myCheckinTime: { fontSize: FontSize.xs, color: C.green, opacity: 0.7 },
    checkOutBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: C.green + '22', borderWidth: 1, borderColor: C.green + '44' },
    checkOutText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.green },
    checkInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: C.accent + '44', backgroundColor: C.accentSoft },
    checkInBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.accent },
    checkInForm: { gap: Spacing.md },
    checkInInput: { backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, color: C.text, fontSize: FontSize.sm },
    checkInFormBtns: { flexDirection: 'row', gap: Spacing.sm },
    checkInCancelBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.md, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    checkInCancelText: { fontSize: FontSize.sm, color: C.textMuted, fontWeight: FontWeight.medium },
    checkInConfirmBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md, backgroundColor: C.accent },
    checkInConfirmText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
    btnPressedOp: { opacity: 0.8 },
    suggestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
    suggestBtnText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    pendingSection: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.sm },
    pendingTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    pendingCard: { backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg, gap: Spacing.sm },
    pendingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    pendingChange: { flex: 1, gap: 2 },
    pendingField: { fontSize: FontSize.xs, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
    pendingValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    pendingMeta: { fontSize: FontSize.xs, color: C.textMuted },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accentSoft, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: C.accent + '33' },
    confirmBtnConfirmed: { backgroundColor: C.greenSoft, borderColor: C.green + '33' },
    confirmBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.accent },
    confirmBtnTextConfirmed: { color: C.green },
    appliedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.greenSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: C.green + '33' },
    appliedBadgeText: { fontSize: 10, fontWeight: FontWeight.semibold, color: C.green },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: C.bg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl, maxHeight: '85%' },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: Spacing.lg },
    modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: C.text, paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg, letterSpacing: -0.3 },
    modalFieldSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg, gap: Spacing.sm },
    modalFieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    modalOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    modalOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
    modalOptionActive: { borderColor: C.accent, backgroundColor: C.accentSoft },
    modalOptionText: { fontSize: FontSize.sm, color: C.textSecondary },
    modalOptionTextActive: { color: C.accent, fontWeight: FontWeight.semibold },
    modalSubmit: { marginHorizontal: Spacing.xl, marginTop: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center' },
    modalSubmitDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    modalSubmitText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    modalSubmitTextDisabled: { color: C.textMuted },
    detailCommunityBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  });
}

type Styles = ReturnType<typeof createStyles>;

function formatTimeLeft(expiresAt: number): string {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'leaving soon';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
}

function DetailRow({ icon, label, value, color, badge, badgeColor, communityUpdated, styles, Colors }: {
  icon: string; label: string; value: string; color: string;
  badge?: string; badgeColor?: string; communityUpdated?: boolean; styles: Styles; Colors: ColorPalette;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon as any} size={15} color={Colors.textMuted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <View style={styles.detailRight}>
        {badge && badgeColor && (
          <View style={[styles.detailBadge, { backgroundColor: badgeColor + '22' }]}>
            <Text style={[styles.detailBadgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        )}
        {communityUpdated && (
          <View style={styles.appliedBadge}>
            <Ionicons name="people" size={10} color={Colors.green} />
            <Text style={styles.appliedBadgeText}>Community</Text>
          </View>
        )}
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function SpotDetailScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const spots = useSpotsStore((s) => s.spots);
  const googleCache = useSpotsStore((s) => s.googleCache);
  const spot = spots.find((s) => s.id === id) ?? googleCache.find((s) => s.id === id);
  const { toggle, isBookmarked } = useBookmarksStore();
  const saved = spot ? isBookmarked(spot.id) : false;
  const guard = useGuestGuard();
  const handleToggleBookmark = () => {
    if (!spot) return;
    if (saved) { toggle(spot.id); return; }
    guard('save this spot', () => toggle(spot.id));
  };
  const addReview = useSpotsStore((s) => s.addReview);
  const openNow = spot
    ? (spot.openNow !== undefined ? spot.openNow : isSpotOpenNow(spot.hours))
    : null;

  const NOISE_CONFIG = {
    silent:   { icon: 'volume-mute',   label: 'Silent',   color: Colors.green },
    quiet:    { icon: 'volume-low',    label: 'Quiet',    color: Colors.green },
    moderate: { icon: 'volume-medium', label: 'Moderate', color: Colors.orange },
    lively:   { icon: 'volume-high',   label: 'Lively',   color: Colors.red },
  } as const;
  const WIFI_CONFIG = {
    excellent: { label: 'Excellent', color: Colors.green },
    good:      { label: 'Good',      color: Colors.green },
    fair:      { label: 'Fair',      color: Colors.orange },
    none:      { label: 'None',      color: Colors.red },
  } as const;
  const OUTLET_CONFIG = {
    plentiful: { label: 'Plentiful', color: Colors.green },
    some:      { label: 'Some',      color: Colors.orange },
    few:       { label: 'Few',       color: Colors.orange },
    none:      { label: 'None',      color: Colors.red },
  } as const;
  const SEATING_CONFIG = {
    plenty:   { label: 'Plenty',   color: Colors.green },
    moderate: { label: 'Moderate', color: Colors.orange },
    limited:  { label: 'Limited',  color: Colors.red },
  } as const;
  const WORK_STYLE_CONFIG = {
    solo:  { label: 'Solo Work',   icon: 'person-outline' },
    group: { label: 'Group Work',  icon: 'people-outline' },
    both:  { label: 'Solo & Group', icon: 'people-circle-outline' },
  } as const;

  if (!spot) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Spot not found</Text>
      </SafeAreaView>
    );
  }

  const { checkIn, checkOut, myCheckin } = useCheckinsStore();
  const allCheckins = useCheckinsStore((s) => s.checkins);
  const savedProfile = useProfileStore((s) => s.saved);
  const { name: obName } = useOnboardingStore();

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const activeCheckins = allCheckins.filter((c) => c.spotId === spot.id && c.expiresAt > nowMs);
  const myActive = myCheckin();
  const isCheckedInHere = myActive?.spotId === spot.id;

  const userId = useOnboardingStore((s) => s.userId);
  const { addSuggestion, confirmSuggestion, deleteSuggestion, getForSpot, getEffectiveValue } = useSuggestionsStore();
  const spotSuggestions = getForSpot(spot.id);
  const pendingSuggestions = spotSuggestions.filter((s) => s.status === 'pending');

  const FIELD_OPTIONS: Record<SuggestionField, { label: string; options: { value: string; label: string }[] }> = {
    noiseLevel: { label: 'Noise Level', options: [{ value: 'silent', label: 'Silent' }, { value: 'quiet', label: 'Quiet' }, { value: 'moderate', label: 'Moderate' }, { value: 'lively', label: 'Lively' }] },
    wifiQuality: { label: 'WiFi Quality', options: [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'none', label: 'No WiFi' }] },
    outlets: { label: 'Outlets', options: [{ value: 'plentiful', label: 'Plentiful' }, { value: 'some', label: 'Some' }, { value: 'few', label: 'Few' }, { value: 'none', label: 'None' }] },
    seating: { label: 'Seating', options: [{ value: 'plenty', label: 'Plenty' }, { value: 'moderate', label: 'Moderate' }, { value: 'limited', label: 'Limited' }] },
    workStyle: { label: 'Best For', options: [{ value: 'solo', label: 'Solo Work' }, { value: 'group', label: 'Group Work' }, { value: 'both', label: 'Both' }] },
  };
  const FIELDS = Object.keys(FIELD_OPTIONS) as SuggestionField[];

  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selections, setSelections] = useState<Partial<Record<SuggestionField, string>>>({});

  const handleSubmitSuggestions = () => {
    FIELDS.forEach((field) => {
      if (selections[field]) addSuggestion(spot.id, field, selections[field]!, userId);
    });
    setSelections({});
    setShowSuggestModal(false);
  };

  const noiseEff = getEffectiveValue(spot.id, 'noiseLevel', spot.noiseLevel);
  const wifiEff = getEffectiveValue(spot.id, 'wifiQuality', spot.wifiQuality);
  const outletsEff = getEffectiveValue(spot.id, 'outlets', spot.outlets);
  const seatingEff = getEffectiveValue(spot.id, 'seating', spot.seating);
  const workStyleEff = getEffectiveValue(spot.id, 'workStyle', spot.workStyle);

  const noise = NOISE_CONFIG[noiseEff.value as keyof typeof NOISE_CONFIG];
  const wifi = WIFI_CONFIG[wifiEff.value as keyof typeof WIFI_CONFIG];
  const outlet = OUTLET_CONFIG[outletsEff.value as keyof typeof OUTLET_CONFIG];
  const seating = SEATING_CONFIG[seatingEff.value as keyof typeof SEATING_CONFIG];
  const workStyle = WORK_STYLE_CONFIG[workStyleEff.value as keyof typeof WORK_STYLE_CONFIG];

  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInLabel, setCheckInLabel] = useState('');

  const handleCheckIn = () => {
    const name = savedProfile?.name.trim() || obName.trim() || 'Anonymous';
    const initials = savedProfile?.initials || name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    const avatarColor = savedProfile?.avatarColor ?? '#6366F1';
    checkIn(spot.id, checkInLabel, { userName: name, userInitials: initials, userAvatarColor: avatarColor });
    setShowCheckInForm(false);
    setCheckInLabel('');
  };

  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: spot.accentColor + '18', borderColor: spot.accentColor + '33' }]}>
          <Pressable style={styles.bookmarkBtn} onPress={handleToggleBookmark}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? Colors.accent : Colors.textMuted} />
          </Pressable>
          <View style={styles.heroInner}>
            <SpotTypeBadge type={spot.type} />
            <Text style={styles.heroName}>{spot.name}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.heroMetaText}>{spot.address}</Text>
            </View>
            <View style={styles.ratingRow}>
              {spot.reviewCount > 0 ? (
                <>
                  <Ionicons name="star" size={14} color={Colors.orange} />
                  <Text style={styles.ratingValue}>{spot.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>{spot.reviewCount} reviews</Text>
                </>
              ) : (
                <Text style={styles.ratingCount}>No reviews yet · be the first</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{spot.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailGrid}>
            <DetailRow styles={styles} Colors={Colors} icon={noise.icon as any} label="Noise Level" value={noise.label} color={noise.color} communityUpdated={noiseEff.communityUpdated} />
            <DetailRow styles={styles} Colors={Colors} icon="wifi-outline" label="WiFi Quality" value={wifi.label} color={wifi.color} communityUpdated={wifiEff.communityUpdated} />
            <DetailRow styles={styles} Colors={Colors} icon="flash-outline" label="Outlets" value={outlet.label} color={outlet.color} communityUpdated={outletsEff.communityUpdated} />
            <DetailRow styles={styles} Colors={Colors} icon="grid-outline" label="Seating" value={seating.label} color={seating.color} communityUpdated={seatingEff.communityUpdated} />
            <DetailRow styles={styles} Colors={Colors} icon={workStyle.icon as any} label="Best For" value={workStyle.label} color={Colors.accent} communityUpdated={workStyleEff.communityUpdated} />
            <DetailRow
              styles={styles} Colors={Colors}
              icon="time-outline" label="Hours" value={spot.hours} color={Colors.textSecondary}
              badge={openNow !== null ? (openNow ? 'Open now' : 'Closed') : undefined}
              badgeColor={openNow ? Colors.green : Colors.red}
            />
          </View>
        </View>

        {pendingSuggestions.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={styles.pendingTitle}>Community Suggestions</Text>
            {pendingSuggestions.map((sg) => {
              const fieldCfg = FIELD_OPTIONS[sg.field];
              const optLabel = fieldCfg.options.find((o) => o.value === sg.suggestedValue)?.label ?? sg.suggestedValue;
              const alreadyConfirmed = sg.confirmedBy.includes(userId);
              const isOwner = sg.submittedBy === userId;
              const needed = 3 - sg.confirmedBy.length;
              return (
                <View key={sg.id} style={styles.pendingCard}>
                  <View style={styles.pendingRow}>
                    <View style={styles.pendingChange}>
                      <Text style={styles.pendingField}>{fieldCfg.label}</Text>
                      <Text style={styles.pendingValue}>→ {optLabel}</Text>
                      <Text style={styles.pendingMeta}>{sg.confirmedBy.length}/3 confirmations · {needed} more needed</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                      {isOwner && (
                        <Pressable
                          style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.6 : 1 }]}
                          onPress={() => deleteSuggestion(sg.id, userId)}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                        </Pressable>
                      )}
                      <Pressable
                        style={({ pressed }) => [styles.confirmBtn, alreadyConfirmed && styles.confirmBtnConfirmed, pressed && { opacity: 0.8 }]}
                        onPress={() => !alreadyConfirmed && confirmSuggestion(sg.id, userId)}
                        disabled={alreadyConfirmed}
                      >
                        <Ionicons name={alreadyConfirmed ? 'checkmark-circle' : 'checkmark-circle-outline'} size={14} color={alreadyConfirmed ? Colors.green : Colors.accent} />
                        <Text style={[styles.confirmBtnText, alreadyConfirmed && styles.confirmBtnTextConfirmed]}>
                          {alreadyConfirmed ? 'Confirmed' : 'Confirm'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable style={({ pressed }) => [styles.suggestBtn, pressed && { opacity: 0.8 }]} onPress={() => setShowSuggestModal(true)}>
          <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.suggestBtnText}>Suggest a change</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {spot.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.distanceCard]}>
          <Ionicons name="navigate-outline" size={16} color={Colors.accent} />
          <Text style={styles.distanceText}>{spot.distance} from your location</Text>
        </View>

        <View style={styles.whoSection}>
          <View style={styles.whoHeader}>
            <View style={styles.whoHeaderLeft}>
              {activeCheckins.length > 0 && <View style={styles.whoLiveDot} />}
              <Text style={styles.whoTitle}>Who's Here</Text>
            </View>
            {activeCheckins.length > 0 && <Text style={styles.whoCount}>{activeCheckins.length} checked in</Text>}
          </View>

          {activeCheckins.length === 0 && !showCheckInForm && !isCheckedInHere && (
            <Text style={styles.whoEmpty}>No one checked in yet — be the first.</Text>
          )}

          {activeCheckins.filter((c) => c.userId !== 'me').map((c) => (
            <View key={c.userId} style={styles.whoRow}>
              <View style={[styles.whoAvatar, { backgroundColor: c.userAvatarColor + '33', borderColor: c.userAvatarColor + '55' }]}>
                <Text style={[styles.whoAvatarText, { color: c.userAvatarColor }]}>{c.userInitials}</Text>
              </View>
              <View style={styles.whoInfo}>
                <Text style={styles.whoName}>{c.userName}</Text>
                {c.label ? <Text style={styles.whoLabel}>{c.label}</Text> : null}
              </View>
              <Text style={styles.whoTime}>{formatTimeLeft(c.expiresAt)}</Text>
            </View>
          ))}

          {isCheckedInHere && myActive ? (
            <View style={styles.myCheckinRow}>
              <View style={styles.myCheckinInfo}>
                <Text style={styles.myCheckinYou}>You're checked in</Text>
                {myActive.label ? <Text style={styles.myCheckinLabel}>"{myActive.label}"</Text> : null}
                <Text style={styles.myCheckinTime}>{formatTimeLeft(myActive.expiresAt)} remaining</Text>
              </View>
              <Pressable style={({ pressed }) => [styles.checkOutBtn, pressed && styles.btnPressedOp]} onPress={checkOut}>
                <Text style={styles.checkOutText}>Check Out</Text>
              </Pressable>
            </View>
          ) : showCheckInForm ? (
            <View style={styles.checkInForm}>
              <TextInput
                style={styles.checkInInput}
                placeholder="What are you working on? (optional)"
                placeholderTextColor={Colors.textMuted}
                value={checkInLabel}
                onChangeText={setCheckInLabel}
                maxLength={80}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCheckIn}
              />
              <View style={styles.checkInFormBtns}>
                <Pressable style={styles.checkInCancelBtn} onPress={() => { setShowCheckInForm(false); setCheckInLabel(''); }}>
                  <Text style={styles.checkInCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.checkInConfirmBtn, pressed && styles.btnPressedOp]} onPress={handleCheckIn}>
                  <Ionicons name="location" size={14} color="#fff" />
                  <Text style={styles.checkInConfirmText}>Check In</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={({ pressed }) => [styles.checkInBtn, pressed && styles.btnPressedOp]} onPress={() => setShowCheckInForm(true)}>
              <Ionicons name="location-outline" size={15} color={Colors.accent} />
              <Text style={styles.checkInBtnText}>Check In Here</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write a Review</Text>
          {submitted ? (
            <View style={styles.reviewThanks}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
              <Text style={styles.reviewThanksText}>Thanks for your review!</Text>
            </View>
          ) : (
            <>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setSelectedStar(star)} onPressIn={() => setHoveredStar(star)} onPressOut={() => setHoveredStar(0)} hitSlop={6}>
                    <Ionicons name={star <= (hoveredStar || selectedStar) ? 'star' : 'star-outline'} size={30} color={star <= (hoveredStar || selectedStar) ? Colors.orange : Colors.border} />
                  </Pressable>
                ))}
                {selectedStar > 0 && <Text style={styles.starLabel}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][selectedStar]}</Text>}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Describe your experience (optional)"
                placeholderTextColor={Colors.textMuted}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
              <Pressable
                style={({ pressed }) => [styles.reviewSubmit, !selectedStar && styles.reviewSubmitDisabled, pressed && selectedStar && styles.reviewSubmitPressed]}
                onPress={() => { if (!selectedStar) return; addReview(spot.id, selectedStar); setSubmitted(true); }}
                disabled={!selectedStar}
              >
                <Text style={[styles.reviewSubmitText, !selectedStar && styles.reviewSubmitTextDisabled]}>Submit Review</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showSuggestModal} transparent animationType="slide" onRequestClose={() => setShowSuggestModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSuggestModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Suggest a change</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {FIELDS.map((field) => (
                    <View key={field} style={styles.modalFieldSection}>
                      <Text style={styles.modalFieldLabel}>{FIELD_OPTIONS[field].label}</Text>
                      <View style={styles.modalOptions}>
                        {FIELD_OPTIONS[field].options.map((opt) => {
                          const active = selections[field] === opt.value;
                          return (
                            <Pressable
                              key={opt.value}
                              style={[styles.modalOption, active && styles.modalOptionActive]}
                              onPress={() => setSelections((prev) => ({ ...prev, [field]: active ? undefined : opt.value }))}
                            >
                              <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                  <Pressable
                    style={({ pressed }) => [styles.modalSubmit, !Object.keys(selections).some((k) => selections[k as SuggestionField]) && styles.modalSubmitDisabled, pressed && { opacity: 0.85 }]}
                    onPress={handleSubmitSuggestions}
                    disabled={!Object.keys(selections).some((k) => selections[k as SuggestionField])}
                  >
                    <Text style={[styles.modalSubmitText, !Object.keys(selections).some((k) => selections[k as SuggestionField]) && styles.modalSubmitTextDisabled]}>
                      Submit suggestion
                    </Text>
                  </Pressable>
                  <View style={{ height: 20 }} />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
