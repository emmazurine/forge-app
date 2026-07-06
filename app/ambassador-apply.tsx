import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { useColors } from '../src/hooks/useColors';
import { useAmbassadorStore } from '../src/store/ambassador';

const EVENT_TYPE_OPTIONS = [
  { id: 'lock-in',    label: 'Lock-In',     icon: 'moon-outline' },
  { id: 'hackathon',  label: 'Hackathon',   icon: 'flash-outline' },
  { id: 'workshop',   label: 'Workshop',    icon: 'build-outline' },
  { id: 'study',      label: 'Study Group', icon: 'book-outline' },
  { id: 'social',     label: 'Social',      icon: 'people-outline' },
  { id: 'pitch',      label: 'Pitch Night', icon: 'mic-outline' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'weekday-eve',  label: 'Weekday evenings' },
  { id: 'weekend-day',  label: 'Weekend days' },
  { id: 'weekend-eve',  label: 'Weekend evenings' },
  { id: 'flexible',     label: 'Flexible / varies' },
];

function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const Colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm + 1,
          borderRadius: Radius.full,
          borderWidth: 1.5,
          borderColor: selected ? Colors.accent : Colors.border,
          backgroundColor: selected ? Colors.accentSoft : Colors.surface,
        },
      ]}
      hitSlop={4}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={13}
          color={selected ? Colors.accent : Colors.textMuted}
        />
      )}
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: selected ? FontWeight.semibold : FontWeight.regular,
          color: selected ? Colors.accent : Colors.textSecondary,
        }}
      >
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark" size={13} color={Colors.accent} />
      )}
    </Pressable>
  );
}

export default function AmbassadorApplyScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { submit } = useAmbassadorStore();

  const [pitch, setPitch] = useState('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [reach, setReach] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const canSubmit =
    pitch.trim().length >= 50 &&
    eventTypes.length >= 1 &&
    reach.trim().length >= 20 &&
    availability.length >= 1;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submit({ pitch: pitch.trim(), eventTypes, reach: reach.trim(), availability });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    router.back();
  };

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
      borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 140 },
    hero: {
      margin: Spacing.lg,
      padding: Spacing.xl,
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.2)',
      gap: Spacing.sm,
      alignItems: 'center',
    },
    heroIcon: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: 'rgba(245,158,11,0.15)',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
    heroDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    perks: { gap: Spacing.xs, alignSelf: 'stretch', marginTop: Spacing.sm },
    perk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    perkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.md },
    label: {
      fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text,
    },
    sublabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -Spacing.xs },
    textarea: {
      backgroundColor: Colors.surface, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border,
      padding: Spacing.md, minHeight: 110,
      color: Colors.text, fontSize: FontSize.sm, lineHeight: 22,
      textAlignVertical: 'top',
    },
    charCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
    charCountOk: { color: Colors.green },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    divider: { height: 1, backgroundColor: Colors.borderSubtle, marginHorizontal: Spacing.lg },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border,
      padding: Spacing.lg, paddingBottom: 34, gap: Spacing.sm,
    },
    submitBtn: {
      backgroundColor: Colors.accent, borderRadius: Radius.lg,
      paddingVertical: Spacing.md + 2, alignItems: 'center', justifyContent: 'center',
      flexDirection: 'row', gap: Spacing.sm,
    },
    submitBtnDisabled: { backgroundColor: Colors.border },
    submitText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    submitHint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
    submitErrorText: { fontSize: FontSize.xs, color: Colors.red, textAlign: 'center' },
  }), [Colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Ambassador Application</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="star" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.heroTitle}>Become a Forge Ambassador</Text>
            <Text style={styles.heroDesc}>
              Ambassadors are the heartbeat of Forge — they host events, build community, and connect students in their area.
            </Text>
            <View style={styles.perks}>
              {[
                'Host and name your own events',
                'Ambassador badge on your profile',
                'Early access to new Forge features',
                'Direct line to the Forge team',
              ].map((p) => (
                <View key={p} style={styles.perk}>
                  <Ionicons name="checkmark-circle" size={15} color="#F59E0B" />
                  <Text style={styles.perkText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Q1 — Pitch */}
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <Text style={styles.label}>Why do you want to be a Forge Ambassador?</Text>
            <Text style={styles.sublabel}>Tell us about yourself and what drives you to build community.</Text>
            <TextInput
              style={styles.textarea}
              value={pitch}
              onChangeText={setPitch}
              placeholder="What do you care about? What kind of community do you want to build? What makes you the right person for this?"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={600}
            />
            <Text style={[styles.charCount, pitch.trim().length >= 50 && styles.charCountOk]}>
              {pitch.trim().length}/600 {pitch.trim().length < 50 ? `(${50 - pitch.trim().length} more to go)` : '✓'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Q2 — Event types */}
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <Text style={styles.label}>What kinds of events would you host?</Text>
            <Text style={styles.sublabel}>Pick everything you'd be excited to run.</Text>
            <View style={styles.chips}>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  selected={eventTypes.includes(opt.id)}
                  onPress={() => toggleChip(eventTypes, setEventTypes, opt.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Q3 — Reach */}
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <Text style={styles.label}>How would you bring students in?</Text>
            <Text style={styles.sublabel}>Your school, clubs, Discord servers, friend groups — whatever your pull is.</Text>
            <TextInput
              style={styles.textarea}
              value={reach}
              onChangeText={setReach}
              placeholder="e.g. I'm a CS club officer at GMU and have 200+ Discord members. I can post in class group chats and my department's Slack..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={400}
            />
            <Text style={[styles.charCount, reach.trim().length >= 20 && styles.charCountOk]}>
              {reach.trim().length}/400 {reach.trim().length >= 20 ? '✓' : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Q4 — Availability */}
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <Text style={styles.label}>When are you generally available to host?</Text>
            <Text style={styles.sublabel}>Select all that usually work for you.</Text>
            <View style={styles.chips}>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={availability.includes(opt.id)}
                  onPress={() => toggleChip(availability, setAvailability, opt.id)}
                />
              ))}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}
        <Pressable
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.submitText}>Submit Application</Text>
            </>
          )}
        </Pressable>
        {!canSubmit && !submitting && (
          <Text style={styles.submitHint}>
            Answer all questions to submit
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
