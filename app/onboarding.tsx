import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { ColorPalette } from '../src/constants/themes';
import { useColors } from '../src/hooks/useColors';
import { useOnboardingStore } from '../src/store/onboarding';

const INTEREST_GROUPS = [
  {
    label: 'Tech & Science',
    items: ['AI / ML', 'Robotics', 'Comp Sci', 'Hardware', 'Physics', 'Biomedical', 'Climate Tech', 'Open Source', 'Crypto', 'Game Dev', 'Music Tech'],
  },
  {
    label: 'Business & Entrepreneurship',
    items: ['Startups', 'Research', 'EdTech', 'Health', 'Social Impact', 'Finance', 'Marketing', 'Product Management'],
  },
  {
    label: 'Humanities & Social Sciences',
    items: ['History', 'Philosophy', 'Political Science', 'Economics', 'Psychology', 'Sociology', 'International Relations', 'Law', 'Linguistics', 'Anthropology'],
  },
  {
    label: 'Arts & Media',
    items: ['Design', 'Creative Writing', 'Journalism', 'Theater / Performance', 'Fine Arts', 'Architecture', 'Film', 'Photography'],
  },
  {
    label: 'Policy & Society',
    items: ['Policy', 'Civic Tech', 'Gender Studies', 'Public Health', 'Education Reform', 'Criminal Justice'],
  },
];

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'];

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    welcomeSafe: { justifyContent: 'space-between' },
    welcomeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xxl },
    welcomeMark: { width: 72, height: 72, backgroundColor: C.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 12, marginBottom: Spacing.sm },
    welcomeMarkLetter: { fontSize: 36, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -1 },
    welcomeWordmark: { fontSize: 30, fontWeight: FontWeight.bold, color: C.text, letterSpacing: 8 },
    welcomeDivider: { width: 40, height: 1, backgroundColor: C.accent, opacity: 0.5 },
    welcomeTagline: { fontSize: FontSize.lg, color: C.textSecondary, textAlign: 'center', lineHeight: 26, fontWeight: FontWeight.medium },
    welcomeBottom: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, gap: Spacing.lg },
    welcomeDescription: { fontSize: FontSize.sm, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
    ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    ctaBtnPressed: { opacity: 0.88 },
    ctaBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    progressBar: { flex: 1, flexDirection: 'row', gap: 6 },
    progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.border },
    progressSegmentActive: { backgroundColor: C.accent },
    stepScroll: { flex: 1 },
    stepContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    stepTitle: { fontSize: 26, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.8 },
    stepSubtitle: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20, marginTop: -Spacing.md },
    fields: { gap: Spacing.xl },
    field: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    inputMultiline: { minHeight: 88, paddingTop: Spacing.md + 2 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    chipActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
    chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.textSecondary },
    chipTextActive: { color: C.accent, fontWeight: FontWeight.semibold },
    interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    interestChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    interestChipActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
    interestChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.textSecondary },
    interestChipTextActive: { color: C.accent, fontWeight: FontWeight.semibold },
    selectionCount: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },
    interestGroupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: Spacing.xs },
    customInterestRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    customInterestInput: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, color: C.text, fontSize: FontSize.sm },
    customInterestAddBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: Spacing.md },
    toggleInfo: { flex: 1, gap: 3 },
    toggleLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: C.text },
    toggleDesc: { fontSize: FontSize.xs, color: C.textMuted },
    footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: C.borderSubtle },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    continueBtnDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    continueBtnPressed: { opacity: 0.88 },
    continueBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    continueBtnTextDisabled: { color: C.textMuted },
    // Verify step
    verifyMethodCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg },
    verifyMethodIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
    verifyMethodTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    verifyMethodDesc: { fontSize: FontSize.xs, color: C.textMuted, lineHeight: 18 },
    verifyBadgeInstant: { backgroundColor: C.greenSoft, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    verifyBadgeInstantText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: C.green },
    verifyStatusCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: C.accentSoft, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.accent + '44' },
    verifyStatusTitle: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium },
    verifyStatusEmail: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    verifySuccessCard: { alignItems: 'center', gap: Spacing.md, backgroundColor: C.greenSoft, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: C.green + '33' },
    verifySuccessTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.green, letterSpacing: -0.5 },
    verifySuccessDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    verifyPendingCard: { alignItems: 'center', gap: Spacing.md, backgroundColor: C.orangeSoft, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: C.orange + '33' },
    verifyPendingTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.orange, letterSpacing: -0.5 },
    verifyPendingDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    verifyRemoveLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
    verifyRemoveLinkText: { fontSize: FontSize.xs, color: C.textMuted, textDecorationLine: 'underline' },
    backLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    backLinkText: { fontSize: FontSize.sm, color: C.textMuted },
    inputError: { fontSize: FontSize.xs, color: C.red, marginTop: 2 },
    skipText: { fontSize: FontSize.sm, color: C.textMuted, textDecorationLine: 'underline' },
    uploadCard: { borderWidth: 2, borderColor: C.border, borderRadius: Radius.xl, paddingVertical: Spacing.xxl + Spacing.lg, alignItems: 'center', gap: Spacing.md, backgroundColor: C.surface },
    uploadCardSelected: { borderColor: C.green, backgroundColor: C.greenSoft },
    uploadLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.textSecondary },
    uploadSub: { fontSize: FontSize.xs, color: C.textMuted },
    uploadAccepted: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
  });
}

export default function OnboardingScreen() {
  const Colors = useColors();
  const { step } = useOnboardingStore();
  if (step === 0) return <WelcomeStep />;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top', 'bottom']}>
      <StepHeader step={step} />
      {step === 1 && <ProfileStep />}
      {step === 2 && <InterestsStep />}
      {step === 3 && <BuildingStep />}
      {step === 4 && <VerifyStep />}
    </SafeAreaView>
  );
}

function WelcomeStep() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { nextStep } = useOnboardingStore();
  return (
    <SafeAreaView style={[styles.safe, styles.welcomeSafe]} edges={['top', 'bottom']}>
      <View style={styles.welcomeCenter}>
        <View style={styles.welcomeMark}>
          <Text style={styles.welcomeMarkLetter}>F</Text>
        </View>
        <Text style={styles.welcomeWordmark}>FORGE</Text>
        <View style={styles.welcomeDivider} />
        <Text style={styles.welcomeTagline}>Find your focus.{'\n'}Build with the right people.</Text>
      </View>
      <View style={styles.welcomeBottom}>
        <Text style={styles.welcomeDescription}>Discover inspiring places to work and ambitious students to build with — all in one place.</Text>
        <Pressable style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]} onPress={nextStep}>
          <Text style={styles.ctaBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ProfileStep() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { name, school, major, year, zipCode, setName, setSchool, setMajor, setYear, setZipCode, nextStep } = useOnboardingStore();
  const canContinue = name.trim().length > 0 && school.trim().length > 0 && year.length > 0;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.stepScroll} contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>Who are you?</Text>
        <Text style={styles.stepSubtitle}>Set up your profile so others can find you.</Text>
        <View style={styles.fields}>
          <Field label="FULL NAME" styles={styles}>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" />
          </Field>
          <Field label="SCHOOL" styles={styles}>
            <TextInput style={styles.input} placeholder="Your school or university" placeholderTextColor={Colors.textMuted} value={school} onChangeText={setSchool} returnKeyType="next" />
          </Field>
          <Field label="MAJOR / FIELD (OPTIONAL)" styles={styles}>
            <TextInput style={styles.input} placeholder="e.g. Computer Science" placeholderTextColor={Colors.textMuted} value={major} onChangeText={setMajor} returnKeyType="next" />
          </Field>
          <Field label="HOME ZIP CODE (OPTIONAL)" styles={styles}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 22030"
              placeholderTextColor={Colors.textMuted}
              value={zipCode}
              onChangeText={(v) => setZipCode(v.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </Field>
          <Field label="YEAR" styles={styles}>
            <View style={styles.chipGrid}>
              {YEARS.map((y) => (
                <Pressable key={y} style={[styles.chip, year === y && styles.chipActive]} onPress={() => setYear(y)}>
                  <Text style={[styles.chipText, year === y && styles.chipTextActive]}>{y}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ContinueButton label="Continue" onPress={nextStep} disabled={!canContinue} styles={styles} />
      </View>
    </KeyboardAvoidingView>
  );
}

function InterestsStep() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { interests, toggleInterest, nextStep } = useOnboardingStore();
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const canContinue = interests.length >= 1;

  const addCustom = () => {
    const val = customInput.trim();
    if (val && !interests.includes(val)) toggleInterest(val);
    setCustomInput('');
    setShowCustom(false);
  };

  return (
    <>
      <ScrollView style={styles.stepScroll} contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>What drives you?</Text>
        <Text style={styles.stepSubtitle}>Select everything that sparks your interest — STEM, arts, humanities, anything.</Text>
        {INTEREST_GROUPS.map((group) => (
          <View key={group.label}>
            <Text style={styles.interestGroupLabel}>{group.label}</Text>
            <View style={styles.interestGrid}>
              {group.items.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <Pressable key={interest} style={[styles.interestChip, active && styles.interestChipActive]} onPress={() => toggleInterest(interest)}>
                    {active && <Ionicons name="checkmark" size={12} color={Colors.accent} />}
                    <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Custom "Other" interests */}
        <Text style={styles.interestGroupLabel}>Other</Text>
        <View style={styles.interestGrid}>
          {interests.filter((i) => !INTEREST_GROUPS.flatMap((g) => g.items).includes(i)).map((custom) => (
            <Pressable key={custom} style={[styles.interestChip, styles.interestChipActive]} onPress={() => toggleInterest(custom)}>
              <Ionicons name="checkmark" size={12} color={Colors.accent} />
              <Text style={[styles.interestChipText, styles.interestChipTextActive]}>{custom}</Text>
            </Pressable>
          ))}
          {showCustom ? (
            <View style={styles.customInterestRow}>
              <TextInput
                style={styles.customInterestInput}
                placeholder="Add your own..."
                placeholderTextColor={Colors.textMuted}
                value={customInput}
                onChangeText={setCustomInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addCustom}
                maxLength={40}
              />
              <Pressable style={styles.customInterestAddBtn} onPress={addCustom}>
                <Ionicons name="add" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.interestChip} onPress={() => setShowCustom(true)}>
              <Ionicons name="add" size={12} color={Colors.textMuted} />
              <Text style={styles.interestChipText}>Add your own</Text>
            </Pressable>
          )}
        </View>

        {interests.length > 0 && <Text style={styles.selectionCount}>{interests.length} selected</Text>}
      </ScrollView>
      <View style={styles.footer}>
        <ContinueButton label="Continue" onPress={nextStep} disabled={!canContinue} styles={styles} />
      </View>
    </>
  );
}

function BuildingStep() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { bio, currentProject, projectDescription, openToCollaborate, setBio, setCurrentProject, setProjectDescription, setOpenToCollaborate, nextStep } = useOnboardingStore();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.stepScroll} contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>What are you building?</Text>
        <Text style={styles.stepSubtitle}>Share what you're working on. All optional.</Text>
        <View style={styles.fields}>
          <Field label="BIO" styles={styles}>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Tell others a bit about yourself and your goals…" placeholderTextColor={Colors.textMuted} value={bio} onChangeText={setBio} multiline numberOfLines={3} textAlignVertical="top" />
          </Field>
          <Field label="CURRENT PROJECT" styles={styles}>
            <TextInput style={styles.input} placeholder="Project name" placeholderTextColor={Colors.textMuted} value={currentProject} onChangeText={setCurrentProject} returnKeyType="next" />
          </Field>
          {currentProject.trim().length > 0 && (
            <Field label="PROJECT DESCRIPTION" styles={styles}>
              <TextInput style={[styles.input, styles.inputMultiline]} placeholder="What are you building and why?" placeholderTextColor={Colors.textMuted} value={projectDescription} onChangeText={setProjectDescription} multiline numberOfLines={3} textAlignVertical="top" />
            </Field>
          )}
          <Pressable style={styles.toggleRow} onPress={() => setOpenToCollaborate(!openToCollaborate)}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Open to collaborate</Text>
              <Text style={styles.toggleDesc}>Let other students reach out to you</Text>
            </View>
            <Switch
              value={openToCollaborate}
              onValueChange={setOpenToCollaborate}
              trackColor={{ false: Colors.border, true: Colors.accentGlow }}
              thumbColor={openToCollaborate ? Colors.accent : Colors.textMuted}
            />
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ContinueButton label="Continue" onPress={nextStep} styles={styles} />
      </View>
    </KeyboardAvoidingView>
  );
}

type Styles = ReturnType<typeof createStyles>;

type VerifyPhase = 'upload' | 'pending';

function VerifyStep() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { userId, setVerification, verificationStatus, complete } = useOnboardingStore();

  const [phase, setPhase] = useState<VerifyPhase>(
    verificationStatus === 'pending' || verificationStatus === 'verified' ? 'pending' : 'upload'
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setFileName(asset.name);
      setFileUri(asset.uri);
      setFileMimeType(asset.mimeType ?? null);
      setFileObject((asset as any).file ?? null);
      setUploadError(null);
    }
  };

  const handleSubmit = async () => {
    if (!fileName) return;
    if (!isSupabaseConfigured) {
      setVerification('id', 'verified');
      setPhase('pending');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const blob: Blob = fileObject instanceof File
        ? fileObject
        : await fetch(fileUri!).then((r) => r.blob());
      const ext = fileName.split('.').pop() ?? 'pdf';
      const storageKey = `${userId}/${Date.now()}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('verification-docs')
        .upload(storageKey, blob, { contentType: fileMimeType ?? 'application/octet-stream' });
      if (storageError) throw new Error(storageError.message);

      const { error: dbError } = await supabase.from('verifications').upsert({
        user_id: userId, method: 'id', file_name: fileName, storage_key: storageKey, status: 'verified',
      }, { onConflict: 'user_id' });
      if (dbError) throw new Error(dbError.message);

      setVerification('id', 'verified');
      setPhase('pending');
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (isSupabaseConfigured) {
      await supabase.from('verifications').delete().eq('user_id', userId);
    }
    setVerification(null, 'none');
    setFileName(null);
    setFileUri(null);
    setFileMimeType(null);
    setFileObject(null);
    setUploadError(null);
    setPhase('upload');
  };

  const handleEnter = () => { complete(); router.replace('/(tabs)'); };
  const handleSkip = () => { setVerification(null, 'none'); complete(); router.replace('/(tabs)'); };

  return (
    <>
      <ScrollView style={styles.stepScroll} contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>Upload your transcript</Text>
        <Text style={styles.stepSubtitle}>We manually review transcripts to confirm you're an active student.</Text>

        {phase === 'upload' && (
          <>
            <View style={styles.verifyMethodCard}>
              <View style={styles.verifyMethodIcon}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.accent} />
              </View>
              <Text style={styles.verifyMethodDesc}>
                Your transcript is only used to verify your student status — it's never shared with other users or stored beyond the review period.
              </Text>
            </View>

            <Pressable
              style={[styles.uploadCard, !!fileName && styles.uploadCardSelected]}
              onPress={handlePickFile}
            >
              {fileName ? (
                <>
                  <Ionicons name="document-text" size={44} color={Colors.green} />
                  <Text style={[styles.uploadLabel, { color: Colors.green }]} numberOfLines={1}>{fileName}</Text>
                  <Text style={styles.uploadSub}>Tap to choose a different file</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={44} color={Colors.textMuted} />
                  <Text style={styles.uploadLabel}>Tap to upload transcript</Text>
                  <Text style={styles.uploadSub}>PDF or photo — unofficial is fine</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.uploadAccepted}>Accepted: PDF · JPG / PNG · Unofficial OK · Any semester</Text>
            {uploadError ? <Text style={styles.inputError}>{uploadError}</Text> : null}

            <Pressable onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
              <Text style={styles.skipText}>Skip for now — verify later in Profile</Text>
            </Pressable>
          </>
        )}

        {phase === 'pending' && (
          <View style={styles.verifyPendingCard}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.orange} />
            <Text style={styles.verifyPendingTitle}>Under Review</Text>
            <Text style={styles.verifyPendingDesc}>
              We'll confirm your student status within 24 hours. You can explore Forge in the meantime.
            </Text>
            <Pressable style={styles.verifyRemoveLink} onPress={handleRemove}>
              <Ionicons name="refresh-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.verifyRemoveLinkText}>Remove & upload a different transcript</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {phase === 'upload' && (
          <Pressable
            style={({ pressed }) => [styles.continueBtn, (!fileName || uploading) && styles.continueBtnDisabled, pressed && !!fileName && !uploading && styles.continueBtnPressed]}
            onPress={handleSubmit}
            disabled={!fileName || uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={[styles.continueBtnText, !fileName && styles.continueBtnTextDisabled]}>Submit for Review</Text>
            }
          </Pressable>
        )}
        {phase === 'pending' && (
          <ContinueButton label="Enter Forge" onPress={handleEnter} styles={styles} />
        )}
      </View>
    </>
  );
}

function StepHeader({ step }: { step: number }) {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { prevStep } = useOnboardingStore();
  return (
    <View style={styles.stepHeader}>
      <Pressable style={styles.backBtn} onPress={prevStep} hitSlop={12}>
        <Ionicons name="arrow-back" size={20} color={Colors.text} />
      </Pressable>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.progressSegment, i <= step && styles.progressSegmentActive]} />
        ))}
      </View>
      <View style={{ width: 36 }} />
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

function ContinueButton({ label, onPress, disabled = false, styles }: { label: string; onPress: () => void; disabled?: boolean; styles: Styles }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.continueBtn, disabled && styles.continueBtnDisabled, pressed && !disabled && styles.continueBtnPressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.continueBtnText, disabled && styles.continueBtnTextDisabled]}>{label}</Text>
      {!disabled && <Ionicons name="arrow-forward-outline" size={18} color="#fff" />}
    </Pressable>
  );
}
