import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useAmbassadorStore } from '../../src/store/ambassador';
import { useEventsStore } from '../../src/store/events';
import { useProfileStore } from '../../src/store/profile';
import { EventSponsor, EventType, ForgeEvent } from '../../src/types/event';

const TYPE_OPTIONS: { id: EventType; label: string; icon: string }[] = [
  { id: 'lock-in',     label: 'Lock-In',     icon: 'moon-outline' },
  { id: 'hackathon',   label: 'Hackathon',   icon: 'flash-outline' },
  { id: 'workshop',    label: 'Workshop',    icon: 'build-outline' },
  { id: 'study-group', label: 'Study Group', icon: 'book-outline' },
  { id: 'social',      label: 'Social',      icon: 'people-outline' },
  { id: 'other',       label: 'Other',       icon: 'calendar-outline' },
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  hint?: string;
}) {
  const Colors = useColors();
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted }}>{label}</Text>
      {hint && <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -2, lineHeight: 15 }}>{hint}</Text>}
      <TextInput
        style={{
          backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1,
          borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
          color: Colors.text, fontSize: FontSize.sm, lineHeight: multiline ? 22 : undefined,
          minHeight: multiline ? 100 : undefined, textAlignVertical: multiline ? 'top' : undefined,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function SponsorCard({
  sponsor,
  index,
  onRemove,
}: {
  sponsor: EventSponsor;
  index: number;
  onRemove: () => void;
}) {
  const Colors = useColors();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: Colors.surface, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.accent + '22', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name="person" size={18} color={Colors.accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text }}>{sponsor.name}</Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary }}>{sponsor.role}</Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>{sponsor.email}</Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={8} style={{ padding: 4 }}>
        <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

export default function CreateEventScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { submitEvent } = useEventsStore();
  const profile = useProfileStore((s) => s.saved);
  const ambassadorStatus = useAmbassadorStore((s) => s.status);

  // Event fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Sponsors
  const [sponsors, setSponsors] = useState<EventSponsor[]>([]);
  const [addingSponsors, setAddingSponsors] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorRole, setSponsorRole] = useState('');
  const [sponsorEmail, setSponsorEmail] = useState('');

  const canAddSponsor =
    sponsorName.trim().length > 1 &&
    sponsorRole.trim().length > 1 &&
    sponsorEmail.trim().includes('@');

  const addSponsor = () => {
    if (!canAddSponsor) return;
    setSponsors((prev) => [
      ...prev,
      { name: sponsorName.trim(), role: sponsorRole.trim(), email: sponsorEmail.trim() },
    ]);
    setSponsorName('');
    setSponsorRole('');
    setSponsorEmail('');
    setAddingSponsors(false);
  };

  const removeSponsor = (idx: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    const val = tagsInput.trim();
    if (val && !tags.includes(val)) {
      setTags((t) => [...t, val]);
      setTagsInput('');
    }
  };

  const canSubmit =
    title.trim().length >= 3 &&
    type !== null &&
    description.trim().length >= 20 &&
    date.trim().match(/^\d{4}-\d{2}-\d{2}$/) !== null &&
    startTime.trim().length >= 3 &&
    location.trim().length >= 3 &&
    parseInt(capacity) > 0 &&
    sponsors.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit || !profile) return;

    const cap = parseInt(capacity);
    const dateObj = new Date(date + 'T12:00:00');
    const isPast = dateObj < new Date();

    const newEvent: ForgeEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      type: type!,
      hostId: 'me',
      hostName: profile.name,
      hostInitials: profile.initials,
      hostAvatarColor: profile.avatarColor,
      location: location.trim(),
      date,
      startTime: startTime.trim(),
      endTime: endTime.trim() || undefined,
      capacity: cap,
      rsvpIds: [],
      tags,
      isPast,
      sponsors,
    };

    submitEvent(newEvent);
    Alert.alert(
      'Event submitted!',
      'Your event is now live on Forge.',
      [{ text: 'View events', onPress: () => router.replace('/(tabs)/events') }]
    );
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
    section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, gap: Spacing.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
    sectionRequired: { fontSize: FontSize.xs, color: Colors.red, fontWeight: FontWeight.semibold },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    divider: { height: 1, backgroundColor: Colors.borderSubtle, marginTop: Spacing.xl, marginHorizontal: Spacing.lg },
    sponsorBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      marginHorizontal: Spacing.lg, marginTop: Spacing.md,
      backgroundColor: Colors.accent + '0D',
      borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.accent + '33',
      padding: Spacing.md,
    },
    sponsorBannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
    addSponsorBtn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
      borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
      justifyContent: 'center',
    },
    addSponsorText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    sponsorForm: {
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
    },
    sponsorFormTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
    sponsorFormBtns: { flexDirection: 'row', gap: Spacing.sm },
    cancelSponsorBtn: {
      flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: Radius.md,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      alignItems: 'center',
    },
    cancelSponsorText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    addSponsorConfirmBtn: {
      flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: Radius.md,
      backgroundColor: Colors.accent, alignItems: 'center',
    },
    addSponsorConfirmBtnDisabled: { backgroundColor: Colors.border },
    addSponsorConfirmText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: Colors.surface, borderRadius: Radius.full,
      borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    tagText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    addTagRow: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: Colors.surface, borderRadius: Radius.full,
      borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 6,
    },
    addTagInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm, padding: 0, minWidth: 100 },
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
    validationHint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  }), [Colors]);

  if (ambassadorStatus !== 'approved') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Colors.accent} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Event</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.lg }}>
          <Ionicons name="star-outline" size={48} color={Colors.textMuted} />
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' }}>
            Ambassadors only
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
            Only approved Forge Ambassadors can create events. Apply from your Profile tab.
          </Text>
          <Pressable
            style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.accent, borderRadius: Radius.lg }}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Text style={{ color: '#fff', fontWeight: FontWeight.semibold }}>Go to Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/events')} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Event basics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Event Details</Text>
            </View>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="Give your event a name" />
            <View style={{ gap: 5 }}>
              <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted }}>Type</Text>
              <View style={styles.chips}>
                {TYPE_OPTIONS.map((opt) => {
                  const active = type === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setType(opt.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 1,
                        borderRadius: Radius.full, borderWidth: 1.5,
                        borderColor: active ? Colors.accent : Colors.border,
                        backgroundColor: active ? Colors.accentSoft : Colors.surface,
                      }}
                    >
                      <Ionicons name={opt.icon as any} size={13} color={active ? Colors.accent : Colors.textMuted} />
                      <Text style={{ fontSize: FontSize.sm, color: active ? Colors.accent : Colors.textSecondary, fontWeight: active ? FontWeight.semibold : FontWeight.regular }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Field label="Description" value={description} onChangeText={setDescription} placeholder="What's this event about? What should people bring or expect?" multiline />
          </View>

          <View style={styles.divider} />

          {/* When & Where */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>When & Where</Text>
            </View>
            <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" hint="Format: 2026-08-15" keyboardType="numbers-and-punctuation" />
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <Field label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="e.g. 7:00 PM" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="End Time (optional)" value={endTime} onChangeText={setEndTime} placeholder="e.g. 10:00 PM" />
              </View>
            </View>
            <Field label="Location" value={location} onChangeText={setLocation} placeholder="Building, room, or address" />
            <Field label="Capacity" value={capacity} onChangeText={setCapacity} placeholder="Max attendees" keyboardType="number-pad" />
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Tags <Text style={{ color: Colors.textMuted, fontWeight: FontWeight.regular }}>(optional)</Text></Text>
            </View>
            <View style={styles.tagWrap}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <Pressable onPress={() => setTags((t) => t.filter((x) => x !== tag))} hitSlop={6}>
                    <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
                  </Pressable>
                </View>
              ))}
              <View style={styles.addTagRow}>
                <TextInput
                  style={styles.addTagInput}
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="Add a tag..."
                  placeholderTextColor={Colors.textMuted}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                {tagsInput.trim().length > 0 && (
                  <Pressable onPress={addTag} hitSlop={6}>
                    <Ionicons name="add-circle" size={18} color={Colors.accent} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Adult Sponsors — REQUIRED */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Adult Sponsors</Text>
              <Text style={styles.sectionRequired}>Required</Text>
            </View>

            <View style={styles.sponsorBanner}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.accent} style={{ marginTop: 1 }} />
              <Text style={styles.sponsorBannerText}>
                Every Forge event must have at least one adult sponsor — a teacher, faculty member, or parent volunteer who has agreed to oversee the event. This is how we keep things safe and trusted, similar to how school clubs work.
              </Text>
            </View>

            {sponsors.map((s, i) => (
              <SponsorCard key={i} sponsor={s} index={i} onRemove={() => removeSponsor(i)} />
            ))}

            {addingSponsors ? (
              <View style={styles.sponsorForm}>
                <Text style={styles.sponsorFormTitle}>Add Adult Sponsor</Text>
                <Field label="Full Name" value={sponsorName} onChangeText={setSponsorName} placeholder="e.g. Dr. Sarah Mitchell" />
                <Field label="Role / Title" value={sponsorRole} onChangeText={setSponsorRole} placeholder="e.g. CS Department Chair, GMU" />
                <Field label="Email / Contact" value={sponsorEmail} onChangeText={setSponsorEmail} placeholder="e.g. smitchell@gmu.edu" keyboardType="email-address" />
                <View style={styles.sponsorFormBtns}>
                  <Pressable style={styles.cancelSponsorBtn} onPress={() => { setAddingSponsors(false); setSponsorName(''); setSponsorRole(''); setSponsorEmail(''); }}>
                    <Text style={styles.cancelSponsorText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.addSponsorConfirmBtn, !canAddSponsor && styles.addSponsorConfirmBtnDisabled]}
                    onPress={addSponsor}
                    disabled={!canAddSponsor}
                  >
                    <Text style={styles.addSponsorConfirmText}>Add Sponsor</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.addSponsorBtn} onPress={() => setAddingSponsors(true)}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.addSponsorText}>
                  {sponsors.length === 0 ? 'Add an Adult Sponsor' : 'Add Another Sponsor'}
                </Text>
              </Pressable>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.submitText}>Publish Event</Text>
        </Pressable>
        {!canSubmit && sponsors.length === 0 && (
          <Text style={styles.validationHint}>An adult sponsor is required to publish</Text>
        )}
        {!canSubmit && sponsors.length > 0 && (
          <Text style={styles.validationHint}>Fill in all required fields to publish</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
