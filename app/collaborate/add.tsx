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
import { useColors } from '../../src/hooks/useColors';
import { useCollaborationsStore } from '../../src/store/collaborations';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useProfileStore } from '../../src/store/profile';
import { CollabType, CollabVisibility } from '../../src/types/collaboration';

function placeholderForType(type: CollabType): string {
  const map: Record<CollabType, string> = {
    hackathon:   'Looking for Hackathon Teammate — AI Track',
    research:    'Seeking Co-Author for ML Paper',
    startup:     'Founding Engineer Wanted',
    club:        'Starting a Weekly Design Critique Group',
    competition: 'ICPC Team — One Spot Open',
    nonprofit:   'Need Engineer for 501(c)(3) Platform',
    other:       'Looking for collaborators on a unique project',
  };
  return map[type];
}

export default function AddCollabScreen() {
  const router = useRouter();
  const Colors = useColors();
  const addPost = useCollaborationsStore((s) => s.addPost);
  const { name: obName, school: obSchool } = useOnboardingStore();
  const savedProfile = useProfileStore((s) => s.saved);
  const userSchool = (savedProfile?.school.trim() || obSchool.trim());

  const [type, setType]               = useState<CollabType | null>(null);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills]           = useState<string[]>([]);
  const [skillInput, setSkillInput]   = useState('');
  const [visibility, setVisibility]   = useState<CollabVisibility>('everyone');

  const TYPE_OPTIONS = useMemo(() => [
    { value: 'hackathon'   as CollabType, label: 'Hackathon',   color: Colors.orange, bg: Colors.orangeSoft, description: 'Looking for teammates' },
    { value: 'research'    as CollabType, label: 'Research',    color: Colors.blue,   bg: Colors.blueSoft,   description: 'Academic collaboration' },
    { value: 'startup'     as CollabType, label: 'Startup',     color: Colors.accent, bg: Colors.accentSoft, description: 'Building a company' },
    { value: 'club'        as CollabType, label: 'Club',        color: Colors.green,  bg: Colors.greenSoft,  description: 'Group or community' },
    { value: 'competition' as CollabType, label: 'Competition', color: Colors.red,    bg: Colors.redSoft,    description: 'Contest or challenge' },
    { value: 'nonprofit'   as CollabType, label: 'Nonprofit',   color: Colors.teal,   bg: Colors.tealSoft,   description: 'Mission-driven work' },
    { value: 'other'       as CollabType, label: 'Other',       color: Colors.purple, bg: Colors.purpleSoft, description: 'Something else entirely' },
  ], [Colors]);

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xxl,
      gap: Spacing.xl,
    },
    field: { gap: Spacing.sm },
    fieldLabel: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      color: Colors.textMuted,
      letterSpacing: 0.8,
    },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeChip: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 2,
      minWidth: '30%',
      flexGrow: 1,
    },
    typeChipLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
    typeChipDesc: { fontSize: FontSize.xs, color: Colors.textMuted },
    input: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md + 2,
      color: Colors.text,
      fontSize: FontSize.md,
    },
    inputMultiline: { minHeight: 120, paddingTop: Spacing.md + 2 },
    charCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
    skillInputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    skillInput: { flex: 1 },
    skillAddBtn: {
      width: 44,
      height: 44,
      borderRadius: Radius.lg,
      backgroundColor: Colors.accentSoft,
      borderWidth: 1,
      borderColor: Colors.accent + '44',
      alignItems: 'center',
      justifyContent: 'center',
    },
    visibilityRow: { flexDirection: 'row', gap: Spacing.sm },
    visibilityChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderRadius: Radius.lg,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    visibilityChipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
    visibilityChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
    visibilityChipTextActive: { color: Colors.accent, fontWeight: FontWeight.semibold },
    skillList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    skillTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
    },
    skillTagText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    previewHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
    },
    previewDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
    previewHintText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    footer: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: Colors.borderSubtle,
      gap: Spacing.sm,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: Colors.accent,
      paddingVertical: Spacing.lg,
      borderRadius: Radius.lg,
    },
    submitBtnDisabled: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    submitBtnPressed: { opacity: 0.88 },
    submitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    submitBtnTextDisabled: { color: Colors.textMuted },
    submitHint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  }), [Colors]);

  const canSubmit = type !== null && title.trim().length > 0 && description.trim().length > 0;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput('');
  };

  const handleSubmit = () => {
    if (!canSubmit || !type) return;
    const userName = savedProfile?.name.trim() || obName.trim() || 'Anonymous';
    const userInitials = savedProfile?.initials
      || userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const userAvatarColor = savedProfile?.avatarColor ?? '#6366F1';
    addPost({
      id: `user-${Date.now()}`,
      userId: 'me',
      userName,
      userInitials,
      userAvatarColor,
      userSchool,
      title: title.trim(),
      description: description.trim(),
      type,
      skills,
      interests: [],
      postedAt: Date.now(),
      isOpen: true,
      applicantCount: 0,
      visibility,
    });
    router.back();
  };

  const selectedType = TYPE_OPTIONS.find((o) => o.value === type);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>OPPORTUNITY TYPE</Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const active = type === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.typeChip, active && { backgroundColor: opt.bg, borderColor: opt.color }]}
                    onPress={() => setType(opt.value)}
                  >
                    <Text style={[styles.typeChipLabel, active && { color: opt.color, fontWeight: FontWeight.semibold }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.typeChipDesc, active && { color: opt.color, opacity: 0.8 }]}>
                      {opt.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedType ? `e.g. ${placeholderForType(selectedType.value)}` : 'Give your post a clear, specific title'}
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe what you're working on, what you need, and what collaborators can expect…"
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={600}
            />
            <Text style={styles.charCount}>{description.length} / 600</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SKILLS NEEDED (OPTIONAL)</Text>
            <View style={styles.skillInputRow}>
              <TextInput
                style={[styles.input, styles.skillInput]}
                placeholder="e.g. Python, Figma, Writing"
                placeholderTextColor={Colors.textMuted}
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={addSkill}
                returnKeyType="done"
                blurOnSubmit={false}
              />
              <Pressable style={styles.skillAddBtn} onPress={addSkill}>
                <Ionicons name="add" size={18} color={Colors.accent} />
              </Pressable>
            </View>
            {skills.length > 0 && (
              <View style={styles.skillList}>
                {skills.map((skill) => (
                  <Pressable key={skill} style={styles.skillTag} onPress={() => setSkills((prev) => prev.filter((s) => s !== skill))}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                    <Ionicons name="close" size={12} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {!!userSchool && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>WHO CAN SEE THIS</Text>
              <View style={styles.visibilityRow}>
                <Pressable
                  style={[styles.visibilityChip, visibility === 'everyone' && styles.visibilityChipActive]}
                  onPress={() => setVisibility('everyone')}
                >
                  <Ionicons name="globe-outline" size={15} color={visibility === 'everyone' ? Colors.accent : Colors.textSecondary} />
                  <Text style={[styles.visibilityChipText, visibility === 'everyone' && styles.visibilityChipTextActive]}>
                    Everyone
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.visibilityChip, visibility === 'school' && styles.visibilityChipActive]}
                  onPress={() => setVisibility('school')}
                >
                  <Ionicons name="school-outline" size={15} color={visibility === 'school' ? Colors.accent : Colors.textSecondary} />
                  <Text
                    style={[styles.visibilityChipText, visibility === 'school' && styles.visibilityChipTextActive]}
                    numberOfLines={1}
                  >
                    {userSchool} Only
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {canSubmit && selectedType && (
            <View style={[styles.previewHint, { borderColor: selectedType.color + '44', backgroundColor: selectedType.bg }]}>
              <View style={[styles.previewDot, { backgroundColor: selectedType.color }]} />
              <Text style={[styles.previewHintText, { color: selectedType.color }]}>
                Your post will appear as a {selectedType.label.toLowerCase()} opportunity
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, !canSubmit && styles.submitBtnDisabled, pressed && canSubmit && styles.submitBtnPressed]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Ionicons name="flash-outline" size={16} color={canSubmit ? '#fff' : Colors.textMuted} />
            <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>Post Opportunity</Text>
          </Pressable>
          {!canSubmit && <Text style={styles.submitHint}>Type, title, and description are required</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
