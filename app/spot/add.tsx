import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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
import { ColorPalette } from '../../src/constants/themes';
import { useColors } from '../../src/hooks/useColors';
import { useSpotsStore } from '../../src/store/spots';
import {
  NoiseLevel,
  OutletDensity,
  SeatingAmount,
  SpotType,
  WifiQuality,
  WorkStyle,
} from '../../src/types/spot';

const NOISE_OPTIONS   = [{ value: 'silent', label: 'Silent' }, { value: 'quiet', label: 'Quiet' }, { value: 'moderate', label: 'Moderate' }, { value: 'lively', label: 'Lively' }];
const WIFI_OPTIONS    = [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'none', label: 'None' }];
const OUTLET_OPTIONS  = [{ value: 'plentiful', label: 'Plentiful' }, { value: 'some', label: 'Some' }, { value: 'few', label: 'Few' }, { value: 'none', label: 'None' }];
const SEATING_OPTIONS = [{ value: 'plenty', label: 'Plenty' }, { value: 'moderate', label: 'Moderate' }, { value: 'limited', label: 'Limited' }];
const STYLE_OPTIONS   = [{ value: 'solo', label: 'Solo' }, { value: 'group', label: 'Group' }, { value: 'both', label: 'Both' }];

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
    sectionTitleText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text, letterSpacing: -0.3 },
    sectionLine: { flex: 1, height: 1, backgroundColor: C.borderSubtle },
    field: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    inputMultiline: { minHeight: 88, paddingTop: Spacing.md + 2 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    typeDot: { width: 7, height: 7, borderRadius: 4 },
    typeChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.textSecondary },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    pickerChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    pickerChipActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
    pickerChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.textSecondary },
    pickerChipTextActive: { color: C.accent, fontWeight: FontWeight.semibold },
    tagInputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    tagInput: { flex: 1 },
    tagAddBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.accent + '44', alignItems: 'center', justifyContent: 'center' },
    tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 5 },
    tagText: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
    tagHint: { fontSize: FontSize.xs, color: C.textMuted, fontStyle: 'italic' },
    footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: C.borderSubtle, gap: Spacing.sm },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    submitBtnDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    submitBtnPressed: { opacity: 0.88 },
    submitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    submitBtnTextDisabled: { color: C.textMuted },
    submitHint: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },
  });
}

type Styles = ReturnType<typeof createStyles>;

function SectionTitle({ children, styles }: { children: string; styles: Styles }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Field({ label, children, styles }: { label: string; children: React.ReactNode; styles: Styles }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Picker({ label, options, value, onSelect, styles }: {
  label: string; options: { value: string; label: string }[]; value: string; onSelect: (v: string) => void; styles: Styles;
}) {
  return (
    <Field label={label} styles={styles}>
      <View style={styles.pickerRow}>
        {options.map((opt) => (
          <Pressable key={opt.value} style={[styles.pickerChip, opt.value === value && styles.pickerChipActive]} onPress={() => onSelect(opt.value)}>
            <Text style={[styles.pickerChipText, opt.value === value && styles.pickerChipTextActive]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </Field>
  );
}

export default function AddSpotScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const addSpot = useSpotsStore((s) => s.addSpot);

  const TYPE_OPTIONS = useMemo(() => [
    { value: 'cafe'      as SpotType, label: 'Cafe',      color: Colors.spotColors.cafe },
    { value: 'library'   as SpotType, label: 'Library',   color: Colors.spotColors.library },
    { value: 'campus'    as SpotType, label: 'Campus',    color: Colors.spotColors.campus },
    { value: 'coworking' as SpotType, label: 'Coworking', color: Colors.spotColors.coworking },
    { value: 'other'     as SpotType, label: 'Other',     color: Colors.purple },
  ], [Colors]);

  const [name, setName]               = useState('');
  const [type, setType]               = useState<SpotType | null>(null);
  const [address, setAddress]         = useState('');
  const [description, setDescription] = useState('');
  const [distance, setDistance]       = useState('');
  const [hours, setHours]             = useState('');
  const [noiseLevel, setNoise]        = useState<NoiseLevel>('moderate');
  const [wifiQuality, setWifi]        = useState<WifiQuality>('good');
  const [outlets, setOutlets]         = useState<OutletDensity>('some');
  const [seating, setSeating]         = useState<SeatingAmount>('moderate');
  const [workStyle, setWorkStyle]     = useState<WorkStyle>('both');
  const [tags, setTags]               = useState<string[]>([]);
  const [tagInput, setTagInput]       = useState('');

  const canSubmit = name.trim().length > 0 && type !== null && address.trim().length > 0;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const handleSubmit = () => {
    if (!canSubmit || !type) return;
    const accentColor = TYPE_OPTIONS.find((o) => o.value === type)?.color ?? Colors.accent;
    addSpot({
      id: `user-${Date.now()}`,
      name: name.trim(),
      type,
      description: description.trim() || `A ${type} spot for focused work.`,
      address: address.trim(),
      distance: distance.trim() || 'Nearby',
      hours: hours.trim() || 'Hours not specified',
      noiseLevel,
      wifiQuality,
      outlets,
      seating,
      workStyle,
      tags,
      rating: 0,
      reviewCount: 0,
      accentColor,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionTitle styles={styles}>The basics</SectionTitle>

          <Field label="SPOT NAME" styles={styles}>
            <TextInput style={styles.input} placeholder="e.g. Fenwick Library, Compass Coffee" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} returnKeyType="next" />
          </Field>

          <Field label="TYPE" styles={styles}>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const active = type === opt.value;
                return (
                  <Pressable key={opt.value} style={[styles.typeChip, active && { backgroundColor: opt.color + '20', borderColor: opt.color }]} onPress={() => setType(opt.value)}>
                    <View style={[styles.typeDot, { backgroundColor: active ? opt.color : Colors.border }]} />
                    <Text style={[styles.typeChipText, active && { color: opt.color, fontWeight: FontWeight.semibold }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="ADDRESS" styles={styles}>
            <TextInput style={styles.input} placeholder="Street address or location" placeholderTextColor={Colors.textMuted} value={address} onChangeText={setAddress} returnKeyType="next" />
          </Field>

          <Field label="DESCRIPTION (OPTIONAL)" styles={styles}>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="What makes this spot great?" placeholderTextColor={Colors.textMuted} value={description} onChangeText={setDescription} multiline numberOfLines={3} textAlignVertical="top" />
          </Field>

          <SectionTitle styles={styles}>The vibe</SectionTitle>

          <Picker label="NOISE LEVEL"  options={NOISE_OPTIONS}   value={noiseLevel} onSelect={(v) => setNoise(v as NoiseLevel)}   styles={styles} />
          <Picker label="WIFI QUALITY" options={WIFI_OPTIONS}    value={wifiQuality} onSelect={(v) => setWifi(v as WifiQuality)}   styles={styles} />
          <Picker label="OUTLETS"      options={OUTLET_OPTIONS}  value={outlets}    onSelect={(v) => setOutlets(v as OutletDensity)} styles={styles} />
          <Picker label="SEATING"      options={SEATING_OPTIONS} value={seating}    onSelect={(v) => setSeating(v as SeatingAmount)} styles={styles} />
          <Picker label="BEST FOR"     options={STYLE_OPTIONS}   value={workStyle}  onSelect={(v) => setWorkStyle(v as WorkStyle)}  styles={styles} />

          <SectionTitle styles={styles}>Details</SectionTitle>

          <Field label="HOURS" styles={styles}>
            <TextInput style={styles.input} placeholder="e.g. Mon–Fri 7 AM – 10 PM" placeholderTextColor={Colors.textMuted} value={hours} onChangeText={setHours} returnKeyType="next" />
          </Field>

          <Field label="DISTANCE FROM YOU (OPTIONAL)" styles={styles}>
            <TextInput style={styles.input} placeholder="e.g. 2.3 mi away" placeholderTextColor={Colors.textMuted} value={distance} onChangeText={setDistance} returnKeyType="done" />
          </Field>

          <Field label="TAGS" styles={styles}>
            <View style={styles.tagInputRow}>
              <TextInput style={[styles.input, styles.tagInput]} placeholder="Add a tag" placeholderTextColor={Colors.textMuted} value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done" blurOnSubmit={false} />
              <Pressable style={styles.tagAddBtn} onPress={addTag}>
                <Ionicons name="add" size={18} color={Colors.accent} />
              </Pressable>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagList}>
                {tags.map((tag) => (
                  <Pressable key={tag} style={styles.tag} onPress={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <Ionicons name="close" size={12} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            )}
            {tags.length === 0 && <Text style={styles.tagHint}>Tap a tag to remove it</Text>}
          </Field>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, !canSubmit && styles.submitBtnDisabled, pressed && canSubmit && styles.submitBtnPressed]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Ionicons name="location-outline" size={16} color={canSubmit ? '#fff' : Colors.textMuted} />
            <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>Add Spot</Text>
          </Pressable>
          {!canSubmit && <Text style={styles.submitHint}>Name, type, and address are required</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
