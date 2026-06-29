import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '../../src/components/ui/Logo';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useVerification } from '../../src/hooks/useVerification';
import { isSupabaseConfigured, supabase } from '../../src/lib/supabase';
import { useBookmarksStore } from '../../src/store/bookmarks';
import { useCollaborationsStore } from '../../src/store/collaborations';
import { useConnectionsStore } from '../../src/store/connections';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useArchiveStore } from '../../src/store/archive';
import { usePortfolioStore } from '../../src/store/portfolio';
import { useAmbassadorStore } from '../../src/store/ambassador';
import { useProfileStore } from '../../src/store/profile';
import { useThemeStore } from '../../src/store/theme';
import { ColorPalette } from '../../src/constants/themes';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { Experience } from '../../src/types/portfolio';
import { Student } from '../../src/types/user';
import { STUDENTS } from '../../src/data/students';

const AVATAR_COLORS = [
  '#6366F1', '#3B82F6', '#22C55E', '#F59E0B',
  '#EF4444', '#A855F7', '#14B8A6', '#EC4899',
];

function buildInitialProfile(): Student {
  const saved = useProfileStore.getState().saved;
  if (saved) return saved;

  const ob = useOnboardingStore.getState();
  const name = ob.name.trim() || 'Your Name';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    id: 'me',
    name,
    initials,
    avatarColor: '#6366F1',
    school: ob.school.trim(),
    major: ob.major.trim(),
    year: ob.year,
    bio: ob.bio.trim(),
    interests: [...ob.interests],
    skills: [],
    currentProject: ob.currentProject.trim() || undefined,
    projectDescription: ob.projectDescription.trim() || undefined,
    openToCollaborate: ob.openToCollaborate,
    verified: ob.verificationStatus === 'verified',
  };
}

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    flex: { flex: 1 },
    content: { paddingBottom: 120 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.5 },
    editActions: { flexDirection: 'row', gap: Spacing.sm },
    cancelBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    cancelText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: C.accent },
    saveText: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.semibold },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    editBtnText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    savedIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    savedText: { fontSize: FontSize.sm, color: C.green, fontWeight: FontWeight.medium },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    colorRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginTop: Spacing.sm },
    colorSwatch: { width: 28, height: 28, borderRadius: 14 },
    colorSwatchSelected: { width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: C.text },
    heroCard: {
      backgroundColor: C.surface,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: C.border,
      marginHorizontal: Spacing.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      gap: Spacing.md,
    },
    heroFields: { alignSelf: 'stretch', gap: Spacing.md },
    rowFields: { flexDirection: 'row', gap: Spacing.md },
    heroInfo: { alignItems: 'center', gap: 3 },
    name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.text },
    major: { fontSize: FontSize.sm, color: C.textSecondary },
    school: { fontSize: FontSize.sm, color: C.textMuted },
    openBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: C.greenSoft,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: C.green + '33',
    },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
    openText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: C.green },
    collaborateToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: C.borderSubtle,
    },
    collaborateLabel: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    bioCard: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      padding: Spacing.lg,
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
    },
    bio: { fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 22 },
    bioInput: { minHeight: 88, lineHeight: 22 },
    inputBase: {
      backgroundColor: C.surfaceElevated,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      color: C.text,
      fontSize: FontSize.sm,
    },
    descInput: { minHeight: 72 },
    fieldGap: { gap: 5 },
    fieldLabel: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium, letterSpacing: 0.3 },
    projectCard: {
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    projectHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    projectName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    activeBadge: { backgroundColor: C.greenSoft, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    activeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.green },
    projectDesc: { fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
    emptyField: { fontSize: FontSize.sm, color: C.textMuted, fontStyle: 'italic' },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    interestTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: C.border,
      gap: 5,
    },
    interestText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    skillTag: { backgroundColor: C.accentSoft, borderColor: C.accent + '33' },
    skillText: { color: C.accent },
    addTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.surfaceElevated,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      minWidth: 140,
    },
    skillAddRow: { borderColor: C.accent + '33', backgroundColor: C.accentSoft },
    addTagInput: { flex: 1, color: C.text, fontSize: FontSize.sm, padding: 0 },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    stat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
    statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: C.text },
    statLabel: { fontSize: FontSize.xs, color: C.textMuted },
    bottomPad: { height: Spacing.xxl },
    expList: { gap: Spacing.sm },
    expCard: {
      flexDirection: 'row',
      backgroundColor: C.surfaceElevated,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    expAccent: { width: 3 },
    expBody: { flex: 1, padding: Spacing.md, gap: 5 },
    expHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    expTypePill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
    expTypeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
    expDate: { fontSize: FontSize.xs, color: C.textMuted },
    expTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: C.text, marginTop: 2 },
    expRole: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
    expDesc: { fontSize: FontSize.xs, color: C.textMuted, lineHeight: 17, marginTop: 2 },
    expOutcome: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    expOutcomeText: { fontSize: FontSize.xs, color: C.orange, fontWeight: FontWeight.medium },
    expSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    expSkillTag: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
    },
    expSkillText: { fontSize: FontSize.xs - 1, color: C.textMuted },
    expMoreSkills: { fontSize: FontSize.xs, color: C.textMuted, alignSelf: 'center' },
    expEditBtn: { alignSelf: 'center', marginRight: Spacing.sm, padding: Spacing.sm },
    publishBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.full,
      backgroundColor: C.surfaceElevated,
      borderWidth: 1,
      borderColor: C.border,
    },
    publishBtnActive: { backgroundColor: C.accentSoft, borderColor: C.accent + '44' },
    publishBtnText: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium },
    publishBtnTextActive: { color: C.accent },
    portfolioActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
    addExpBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.md,
      backgroundColor: C.accentSoft,
      borderWidth: 1,
      borderColor: C.accent + '44',
    },
    addExpText: { fontSize: FontSize.sm, color: C.accent, fontWeight: FontWeight.semibold },
    sharePortfolioBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    sharePortfolioText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    // Appearance toggle
    appearanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
    },
    appearanceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    appearanceLabel: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    toggleTrack: {
      width: 44,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
    },
    // Verification
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E22', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    verifiedBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: '#22C55E' },
    pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.orangeSoft, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    pendingBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: C.orange },
    rejectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.red + '22', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    rejectedBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: C.red },
    verifyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      padding: Spacing.lg,
    },
    verifyCardInfo: { flex: 1, gap: 3 },
    verifyCardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    verifyCardDesc: { fontSize: FontSize.xs, color: C.textMuted, lineHeight: 17 },
    verifyStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      padding: Spacing.lg,
    },
    verifyStatusInfo: { flex: 1, gap: 2 },
    verifyStatusTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    verifyStatusSub: { fontSize: FontSize.xs, color: C.textMuted },
    // Reset
    resetSection: { marginTop: Spacing.xxl, marginHorizontal: Spacing.lg },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.red + '44',
    },
    resetBtnPressed: { opacity: 0.7 },
    resetText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.red },
    // Connections
    connectionsList: { gap: Spacing.xs },
    connectionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
    connectionPressable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    connectionInfo: { flex: 1, gap: 2 },
    connectionName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    connectionSchool: { fontSize: FontSize.xs, color: C.textMuted },
    disconnectBtn: {
      width: 32,
      height: 32,
      borderRadius: Radius.full,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Requests
    requestsList: { gap: Spacing.md },
    requestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    requestInfo: { flex: 1, gap: 2 },
    requestName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    requestSchool: { fontSize: FontSize.xs, color: C.textMuted },
    requestNote: { fontSize: FontSize.xs, color: C.textMuted, fontStyle: 'italic', marginTop: 2 },
    acceptBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.full,
      backgroundColor: C.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    declineBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.full,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Ambassador
    ambassadorCard: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderRadius: Radius.lg, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.25)',
      padding: Spacing.lg,
    },
    ambassadorIconWrap: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: 'rgba(245,158,11,0.15)',
      alignItems: 'center', justifyContent: 'center',
    },
    ambassadorCardInfo: { flex: 1, gap: 2 },
    ambassadorCardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    ambassadorCardDesc: { fontSize: FontSize.xs, color: C.textMuted, lineHeight: 17 },
    ambassadorBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
    ambassadorBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: Spacing.sm,
      paddingVertical: 3, borderRadius: Radius.full,
    },
    ambassadorBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#F59E0B' },
    pendingChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: C.orangeSoft, paddingHorizontal: Spacing.sm,
      paddingVertical: 3, borderRadius: Radius.full,
    },
    pendingChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.orange },
    // Section
    section: { marginTop: Spacing.xxl, paddingHorizontal: Spacing.lg, gap: Spacing.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    sectionTitle: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      color: C.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
  });
}

export default function ProfileScreen() {
  const Colors = useColors();
  const { isDark, toggle } = useThemeStore();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const verificationStatus = useOnboardingStore((s) => s.verificationStatus);
  const setVerification = useOnboardingStore((s) => s.setVerification);
  const { isVerified } = useVerification();

  const connections = useConnectionsStore((s) => s.connections);
  const connectionCount = Object.values(connections).filter((v) => v === 'connected').length;
  const connectedIds = Object.entries(connections)
    .filter(([, v]) => v === 'connected')
    .map(([id]) => id);
  const incomingRequests = useConnectionsStore((s) => s.incomingRequests);
  const requestNotes = useConnectionsStore((s) => s.requestNotes);
  const { acceptRequest, declineRequest, disconnect } = useConnectionsStore();
  const myPostCount = useCollaborationsStore((s) => s.posts.filter((p) => p.userId === 'me').length);
  const savedCount = useBookmarksStore((s) => s.savedIds.length);
  const experiences = usePortfolioStore((s) => s.experiences);

  const router = useRouter();
  const ambassadorStatus = useAmbassadorStore((s) => s.status);

  const [profile, setProfile] = useState<Student>(buildInitialProfile);
  const committed = useRef<Student>(profile);
  const [editing, setEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Sync when Zustand hydrates from AsyncStorage after first render
  const savedProfile = useProfileStore((s) => s.saved);
  useEffect(() => {
    if (savedProfile && !editing) {
      setProfile(savedProfile);
      committed.current = savedProfile;
    }
  }, [savedProfile]);

  const startEdit = () => { setProfile({ ...committed.current }); setEditing(true); };

  const save = () => {
    const name = profile.name.trim() || committed.current.name;
    const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const trimmed = { ...profile, name, initials };
    committed.current = trimmed;
    setProfile(trimmed);
    useProfileStore.getState().saveProfile(trimmed);
    setEditing(false);
    setNewInterest('');
    setNewSkill('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const cancel = () => { setProfile({ ...committed.current }); setEditing(false); setNewInterest(''); setNewSkill(''); };

  const addInterest = () => {
    const val = newInterest.trim();
    if (val && !profile.interests.includes(val)) {
      setProfile((p) => ({ ...p, interests: [...p.interests, val] }));
      setNewInterest('');
    }
  };

  const removeInterest = (idx: number) => {
    setProfile((p) => ({ ...p, interests: p.interests.filter((_, i) => i !== idx) }));
  };

  const addSkill = () => {
    const val = newSkill.trim();
    if (val && !profile.skills.includes(val)) {
      setProfile((p) => ({ ...p, skills: [...p.skills, val] }));
      setNewSkill('');
    }
  };

  const removeSkill = (idx: number) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.titleRow}>
              <Pressable onPress={() => router.navigate('/')}>
                <Logo size="md" showWordmark={false} />
              </Pressable>
              <Text style={styles.title}>{editing ? 'Edit Profile' : 'Profile'}</Text>
            </View>
            <View style={styles.headerRight}>
              {!editing && <NotificationBell />}
              {editing ? (
                <View style={styles.editActions}>
                  <Pressable style={styles.cancelBtn} onPress={cancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.saveBtn} onPress={save}>
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                </View>
              ) : justSaved ? (
                <View style={styles.savedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
                  <Text style={styles.savedText}>Saved</Text>
                </View>
              ) : (
                <Pressable style={styles.editBtn} onPress={startEdit}>
                  <Ionicons name="pencil-outline" size={15} color={Colors.textSecondary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <Avatar initials={profile.initials} color={profile.avatarColor} size={72} />
            {editing && (
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    style={[profile.avatarColor === c ? styles.colorSwatchSelected : styles.colorSwatch, { backgroundColor: c }]}
                    onPress={() => setProfile((p) => ({ ...p, avatarColor: c }))}
                    hitSlop={6}
                  />
                ))}
              </View>
            )}
            {editing ? (
              <View style={styles.heroFields}>
                <Field styles={styles} label="Name" value={profile.name} onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))} placeholder="Your name" />
                <Field styles={styles} label="School" value={profile.school} onChangeText={(v) => setProfile((p) => ({ ...p, school: v }))} placeholder="Your school" />
                <View style={styles.rowFields}>
                  <View style={styles.flex}>
                    <Field styles={styles} label="Focus / Major" value={profile.major} onChangeText={(v) => setProfile((p) => ({ ...p, major: v }))} placeholder="e.g. Computer Science" />
                  </View>
                  <View style={styles.flex}>
                    <Field styles={styles} label="Year / Grade" value={profile.year} onChangeText={(v) => setProfile((p) => ({ ...p, year: v }))} placeholder="e.g. Senior" />
                  </View>
                </View>
                <Field styles={styles} label="Graduation Year" value={profile.graduationYear ?? ''} onChangeText={(v) => setProfile((p) => ({ ...p, graduationYear: v }))} placeholder="e.g. 2026" keyboardType="number-pad" />
              </View>
            ) : (
              <View style={styles.heroInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' }}>
                  <Text style={styles.name}>{profile.name}</Text>
                  {verificationStatus === 'verified' && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={11} color="#22C55E" />
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                    </View>
                  )}
                  {verificationStatus === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Ionicons name="hourglass-outline" size={11} color={Colors.orange} />
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                  {verificationStatus === 'rejected' && (
                    <View style={styles.rejectedBadge}>
                      <Ionicons name="close-circle" size={11} color={Colors.red} />
                      <Text style={styles.rejectedBadgeText}>Not verified</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.major}>{profile.major} · {profile.year}</Text>
                <Text style={styles.school}>{profile.school}</Text>
              </View>
            )}
            {editing ? (
              <View style={styles.collaborateToggle}>
                <Text style={styles.collaborateLabel}>Open to collaborate</Text>
                <Switch
                  value={profile.openToCollaborate}
                  onValueChange={(v) => setProfile((p) => ({ ...p, openToCollaborate: v }))}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor="#fff"
                />
              </View>
            ) : (
              profile.openToCollaborate && (
                <View style={styles.openBadge}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>Open to collaborate</Text>
                </View>
              )
            )}
          </View>

          {/* Bio */}
          <View style={styles.bioCard}>
            {editing ? (
              <TextInput
                style={[styles.inputBase, styles.bioInput]}
                value={profile.bio}
                onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}
                placeholder="Write a short bio..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}
          </View>

          {/* Current Project */}
          <Section styles={styles} title="Current Project" icon="code-slash-outline">
            {editing ? (
              <View style={styles.projectCard}>
                <Field styles={styles} label="Project Name" value={profile.currentProject ?? ''} onChangeText={(v) => setProfile((p) => ({ ...p, currentProject: v }))} placeholder="What are you building?" />
                <View style={styles.fieldGap}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.inputBase, styles.descInput]}
                    value={profile.projectDescription ?? ''}
                    onChangeText={(v) => setProfile((p) => ({ ...p, projectDescription: v }))}
                    placeholder="Describe it in 1–2 sentences..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ) : profile.currentProject ? (
              <View style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{profile.currentProject}</Text>
                  <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View>
                </View>
                {profile.projectDescription && <Text style={styles.projectDesc}>{profile.projectDescription}</Text>}
              </View>
            ) : (
              <Text style={styles.emptyField}>No project added yet.</Text>
            )}
          </Section>

          {/* Interests */}
          <Section styles={styles} title="Interests" icon="heart-outline">
            <View style={styles.tagWrap}>
              {profile.interests.map((interest, idx) => (
                <View key={`${interest}-${idx}`} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                  {editing && (
                    <Pressable onPress={() => removeInterest(idx)} hitSlop={8}>
                      <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
                    </Pressable>
                  )}
                </View>
              ))}
              {editing && (
                <View style={styles.addTagRow}>
                  <TextInput style={styles.addTagInput} value={newInterest} onChangeText={setNewInterest} placeholder="Add interest..." placeholderTextColor={Colors.textMuted} onSubmitEditing={addInterest} returnKeyType="done" />
                  {newInterest.trim().length > 0 && (
                    <Pressable onPress={addInterest}>
                      <Ionicons name="add-circle" size={18} color={Colors.accent} />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </Section>

          {/* Skills */}
          <Section styles={styles} title="Skills" icon="sparkles-outline">
            <View style={styles.tagWrap}>
              {profile.skills.map((skill, idx) => (
                <View key={`${skill}-${idx}`} style={[styles.interestTag, styles.skillTag]}>
                  <Text style={[styles.interestText, styles.skillText]}>{skill}</Text>
                  {editing && (
                    <Pressable onPress={() => removeSkill(idx)} hitSlop={8}>
                      <Ionicons name="close-circle" size={14} color={Colors.accent} />
                    </Pressable>
                  )}
                </View>
              ))}
              {editing && (
                <View style={[styles.addTagRow, styles.skillAddRow]}>
                  <TextInput style={styles.addTagInput} value={newSkill} onChangeText={setNewSkill} placeholder="Add skill..." placeholderTextColor={Colors.textMuted} onSubmitEditing={addSkill} returnKeyType="done" />
                  {newSkill.trim().length > 0 && (
                    <Pressable onPress={addSkill}>
                      <Ionicons name="add-circle" size={18} color={Colors.accent} />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </Section>

          {/* Connection Requests */}
          {!editing && incomingRequests.length > 0 && (
            <Section styles={styles} title="Connection Requests" icon="person-add-outline">
              <View style={styles.requestsList}>
                {incomingRequests.map((reqId) => {
                  const s = STUDENTS.find((st) => st.id === reqId);
                  if (!s) return null;
                  return (
                    <View key={reqId} style={styles.requestRow}>
                      <Avatar initials={s.initials} color={s.avatarColor} size={40} />
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{s.name}</Text>
                        {isVerified
                          ? <Text style={styles.requestSchool}>{s.school}</Text>
                          : null
                        }
                        {requestNotes[reqId] ? <Text style={styles.requestNote}>"{requestNotes[reqId]}"</Text> : null}
                      </View>
                      <Pressable style={styles.declineBtn} onPress={() => declineRequest(reqId)} hitSlop={6}>
                        <Ionicons name="close" size={16} color={Colors.textMuted} />
                      </Pressable>
                      <Pressable style={styles.acceptBtn} onPress={() => acceptRequest(reqId)} hitSlop={6}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </Section>
          )}

          {/* Activity */}
          {!editing && (
            <Section styles={styles} title="Activity" icon="stats-chart-outline">
              <View style={styles.statsRow}>
                <Stat styles={styles} value={String(connectionCount)} label="Connections" />
                <Stat styles={styles} value={String(myPostCount)} label="Posts" />
                <Stat styles={styles} value={String(savedCount)} label="Saved" />
              </View>
            </Section>
          )}

          {/* Connections list */}
          {!editing && connectionCount > 0 && (
            <Section styles={styles} title="Connections" icon="people-outline">
              <View style={styles.connectionsList}>
                {connectedIds.map((sid) => {
                  const s = STUDENTS.find((st) => st.id === sid);
                  if (!s) return null;
                  return (
                    <View key={sid} style={styles.connectionRow}>
                      <Pressable style={styles.connectionPressable} onPress={() => router.push(`/user/${sid}`)}>
                        <Avatar initials={s.initials} color={s.avatarColor} size={38} />
                        <View style={styles.connectionInfo}>
                          <Text style={styles.connectionName}>{s.name}</Text>
                          <Text style={styles.connectionSchool}>{s.school}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
                      </Pressable>
                      <Pressable style={styles.disconnectBtn} onPress={() => disconnect(sid)} hitSlop={6}>
                        <Ionicons name="person-remove-outline" size={15} color={Colors.textMuted} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </Section>
          )}

          {/* Portfolio */}
          {!editing && (
            <Section styles={styles} title="Portfolio" icon="briefcase-outline">
              {experiences.length === 0 ? (
                <Text style={styles.emptyField}>No experiences added yet.</Text>
              ) : (
                <View style={styles.expList}>
                  {experiences.map((exp) => (
                    <ExperienceCard
                      key={exp.id}
                      exp={exp}
                      styles={styles}
                      Colors={Colors}
                      onEdit={() => router.push(`/experience/add?editId=${exp.id}`)}
                    />
                  ))}
                </View>
              )}
              <View style={styles.portfolioActions}>
                <Pressable style={({ pressed }) => [styles.addExpBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push('/experience/add')}>
                  <Ionicons name="add" size={15} color={Colors.accent} />
                  <Text style={styles.addExpText}>Add Experience</Text>
                </Pressable>
                {experiences.length > 0 && (
                  <Pressable
                    style={({ pressed }) => [styles.sharePortfolioBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      const name = profile.name || 'Student';
                      const header = `${name} · ${profile.major} · ${profile.school}\n${'─'.repeat(40)}\n\n`;
                      const body = experiences.map((exp) => {
                        const date = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`;
                        const lines = [
                          exp.title.toUpperCase(),
                          `${exp.role} · ${date}`,
                          exp.description,
                          exp.outcome ? `Outcome: ${exp.outcome}` : '',
                          exp.skills.length > 0 ? `Skills: ${exp.skills.join(', ')}` : '',
                          exp.link ? `Link: ${exp.link}` : '',
                        ].filter(Boolean);
                        return lines.join('\n');
                      }).join('\n\n');
                      Share.share({ title: `${name}'s Portfolio`, message: header + body });
                    }}
                  >
                    <Ionicons name="share-outline" size={15} color={Colors.textSecondary} />
                    <Text style={styles.sharePortfolioText}>Export</Text>
                  </Pressable>
                )}
              </View>
            </Section>
          )}

          {/* Appearance */}
          {!editing && (
            <Section styles={styles} title="Appearance" icon="color-palette-outline">
              <Pressable style={styles.appearanceRow} onPress={toggle}>
                <View style={styles.appearanceLeft}>
                  <Ionicons
                    name={isDark ? 'moon-outline' : 'sunny-outline'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.appearanceLabel}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
                </View>
                <View style={[styles.toggleTrack, { backgroundColor: isDark ? Colors.accent : Colors.borderSubtle }]}>
                  <View style={[styles.toggleThumb, { alignSelf: isDark ? 'flex-end' : 'flex-start' }]} />
                </View>
              </Pressable>
            </Section>
          )}

          {/* Student Verification */}
          {!editing && (
            <Section styles={styles} title="Student Verification" icon="shield-outline">
              {verificationStatus === 'verified' ? (
                <View style={styles.verifyStatusRow}>
                  <Ionicons name="shield-checkmark" size={22} color="#22C55E" />
                  <View style={styles.verifyStatusInfo}>
                    <Text style={styles.verifyStatusTitle}>Verified Student</Text>
                    <Text style={styles.verifyStatusSub}>Your school status is confirmed</Text>
                  </View>
                </View>
              ) : verificationStatus === 'pending' ? (
                <View style={{ gap: Spacing.sm }}>
                  <View style={styles.verifyStatusRow}>
                    <Ionicons name="hourglass-outline" size={22} color={Colors.orange} />
                    <View style={styles.verifyStatusInfo}>
                      <Text style={styles.verifyStatusTitle}>Under Review</Text>
                      <Text style={styles.verifyStatusSub}>Usually verified within 24 hours</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.verifyCard}
                    onPress={async () => {
                      if (isSupabaseConfigured) {
                        const { userId: uid } = useOnboardingStore.getState();
                        await supabase.from('verifications').delete().eq('user_id', uid);
                      }
                      setVerification(null, 'none');
                      router.push('/verify');
                    }}
                  >
                    <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
                    <View style={styles.verifyCardInfo}>
                      <Text style={styles.verifyCardTitle}>Remove & re-upload</Text>
                      <Text style={styles.verifyCardDesc}>Replace your document with a different one</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </Pressable>
                </View>
              ) : verificationStatus === 'rejected' ? (
                <Pressable
                  style={[styles.verifyCard, { borderColor: Colors.red + '44' }]}
                  onPress={() => { setVerification(null, 'none'); router.push('/verify'); }}
                >
                  <Ionicons name="close-circle-outline" size={22} color={Colors.red} />
                  <View style={styles.verifyCardInfo}>
                    <Text style={styles.verifyCardTitle}>Document not recognized</Text>
                    <Text style={styles.verifyCardDesc}>We couldn't verify your document. Try uploading a clearer transcript or student ID.</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={Colors.red} />
                </Pressable>
              ) : (
                <Pressable style={styles.verifyCard} onPress={() => router.push('/verify')}>
                  <Ionicons name="shield-outline" size={22} color={Colors.accent} />
                  <View style={styles.verifyCardInfo}>
                    <Text style={styles.verifyCardTitle}>Verify your student status</Text>
                    <Text style={styles.verifyCardDesc}>Required to connect, message, and post opportunities</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </Pressable>
              )}
            </Section>
          )}

          {/* Ambassador Program */}
          {!editing && (
            <Section styles={styles} title="Ambassador Program" icon="star-outline">
              {ambassadorStatus === 'approved' ? (
                <View style={styles.ambassadorCard}>
                  <View style={styles.ambassadorIconWrap}>
                    <Ionicons name="star" size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.ambassadorCardInfo}>
                    <Text style={styles.ambassadorCardTitle}>You're a Forge Ambassador</Text>
                    <Text style={styles.ambassadorCardDesc}>You can host events and are visible as an ambassador across the app.</Text>
                    <View style={styles.ambassadorBadgeRow}>
                      <View style={styles.ambassadorBadge}>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={styles.ambassadorBadgeText}>Ambassador</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : ambassadorStatus === 'pending' ? (
                <View style={styles.ambassadorCard}>
                  <View style={styles.ambassadorIconWrap}>
                    <Ionicons name="hourglass-outline" size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.ambassadorCardInfo}>
                    <Text style={styles.ambassadorCardTitle}>Application Under Review</Text>
                    <Text style={styles.ambassadorCardDesc}>We'll review your application and get back to you within a few days.</Text>
                    <View style={styles.ambassadorBadgeRow}>
                      <View style={styles.pendingChip}>
                        <Ionicons name="time-outline" size={10} color={Colors.orange} />
                        <Text style={styles.pendingChipText}>Pending review</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : ambassadorStatus === 'rejected' ? (
                <Pressable style={[styles.ambassadorCard, { borderColor: Colors.red + '44', backgroundColor: Colors.red + '08' }]} onPress={() => router.push('/ambassador-apply')}>
                  <View style={[styles.ambassadorIconWrap, { backgroundColor: Colors.red + '22' }]}>
                    <Ionicons name="close-circle-outline" size={22} color={Colors.red} />
                  </View>
                  <View style={styles.ambassadorCardInfo}>
                    <Text style={styles.ambassadorCardTitle}>Application not approved</Text>
                    <Text style={styles.ambassadorCardDesc}>Thanks for applying. You can reapply anytime — we'd love to see you try again.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </Pressable>
              ) : (
                <Pressable style={styles.ambassadorCard} onPress={() => router.push('/ambassador-apply')}>
                  <View style={styles.ambassadorIconWrap}>
                    <Ionicons name="star-outline" size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.ambassadorCardInfo}>
                    <Text style={styles.ambassadorCardTitle}>Apply to be an Ambassador</Text>
                    <Text style={styles.ambassadorCardDesc}>Host events, build community, and get an Ambassador badge on your profile.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </Pressable>
              )}
            </Section>
          )}

          {/* Reset */}
          {!editing && (
            <View style={styles.resetSection}>
              <Pressable
                style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
                onPress={() => {
                  useOnboardingStore.getState().resetOnboarding();
                  useProfileStore.getState().resetProfile();
                }}
              >
                <Ionicons name="log-out-outline" size={16} color={Colors.red} />
                <Text style={styles.resetText}>Reset App & Redo Setup</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Styles = ReturnType<typeof createStyles>;

function ExperienceCard({ exp, onEdit, styles, Colors }: { exp: Experience; onEdit: () => void; styles: Styles; Colors: ColorPalette }) {
  const EXP_COLORS: Record<string, string> = {
    project: Colors.purple, hackathon: Colors.orange, research: Colors.blue,
    startup: Colors.accent, internship: Colors.teal, club: Colors.green, other: Colors.textMuted,
  };
  const color = EXP_COLORS[exp.type] ?? Colors.accent;
  const date = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`;
  const { publish, unpublish, entries } = useArchiveStore();
  const savedProfile = useProfileStore((s) => s.saved);
  const { school: obSchool } = useOnboardingStore();
  const isPublished = entries.some((e) => e.publisherId === 'me' && e.title === exp.title);
  const gradYear = parseInt(savedProfile?.graduationYear ?? '') || new Date().getFullYear() + 1;

  const handlePublishToggle = () => {
    if (isPublished) {
      const match = entries.find((e) => e.publisherId === 'me' && e.title === exp.title);
      if (match) unpublish(match.id);
    } else {
      publish({
        title: exp.title, type: exp.type, description: exp.description,
        outcome: exp.outcome, lessonsLearned: exp.lessonsLearned, skills: exp.skills,
        school: savedProfile?.school || obSchool || 'Unknown',
        graduationYear: gradYear, startDate: exp.startDate,
        endDate: exp.endDate ?? 'Present', link: exp.link,
      });
    }
  };

  return (
    <View style={styles.expCard}>
      <View style={[styles.expAccent, { backgroundColor: color }]} />
      <View style={styles.expBody}>
        <View style={styles.expHeader}>
          <View style={[styles.expTypePill, { backgroundColor: color + '22', borderColor: color + '44' }]}>
            <Text style={[styles.expTypeText, { color }]}>{exp.type}</Text>
          </View>
          <Text style={styles.expDate}>{date}</Text>
        </View>
        <Text style={styles.expTitle}>{exp.title}</Text>
        <Text style={styles.expRole}>{exp.role}</Text>
        {exp.description ? <Text style={styles.expDesc} numberOfLines={2}>{exp.description}</Text> : null}
        {exp.outcome ? (
          <View style={styles.expOutcome}>
            <Ionicons name="trophy-outline" size={12} color={Colors.orange} />
            <Text style={styles.expOutcomeText}>{exp.outcome}</Text>
          </View>
        ) : null}
        {exp.skills.length > 0 && (
          <View style={styles.expSkills}>
            {exp.skills.slice(0, 4).map((s) => (
              <View key={s} style={styles.expSkillTag}><Text style={styles.expSkillText}>{s}</Text></View>
            ))}
            {exp.skills.length > 4 && <Text style={styles.expMoreSkills}>+{exp.skills.length - 4}</Text>}
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.publishBtn, isPublished && styles.publishBtnActive, pressed && { opacity: 0.7 }]}
          onPress={handlePublishToggle}
          hitSlop={6}
        >
          <Ionicons name={isPublished ? 'library' : 'library-outline'} size={12} color={isPublished ? Colors.accent : Colors.textMuted} />
          <Text style={[styles.publishBtnText, isPublished && styles.publishBtnTextActive]}>
            {isPublished ? 'In Archive' : 'Add to Archive'}
          </Text>
        </Pressable>
      </View>
      <Pressable onPress={onEdit} style={styles.expEditBtn} hitSlop={8}>
        <Ionicons name="pencil-outline" size={15} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

function Section({ title, icon, children, styles }: { title: string; icon: string; children: React.ReactNode; styles: Styles }) {
  const Colors = useColors();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={14} color={Colors.textMuted} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, styles }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'url';
  styles: Styles;
}) {
  const Colors = useColors();
  return (
    <View style={styles.fieldGap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.inputBase}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function Stat({ value, label, styles }: { value: string; label: string; styles: Styles }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
