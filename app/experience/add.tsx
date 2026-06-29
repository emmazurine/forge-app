import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { usePortfolioStore } from '../../src/store/portfolio';
import { Experience, ExperienceType } from '../../src/types/portfolio';

function placeholderTitle(type: ExperienceType): string {
  const map: Record<ExperienceType, string> = {
    project:    'e.g. CourseMatch AI',
    hackathon:  'e.g. HackDC 2024 — 2nd Place',
    research:   'e.g. ML Fairness in Healthcare',
    startup:    'e.g. EduTrack (YC W25)',
    internship: 'e.g. Software Engineer Intern @ Google',
    club:       'e.g. AI Club — President',
    other:      'Give it a clear name',
  };
  return map[type];
}

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    field: { gap: Spacing.sm },
    label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    optional: { fontWeight: FontWeight.medium, opacity: 0.6 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    inputMulti: { minHeight: 110, paddingTop: Spacing.md + 2, textAlignVertical: 'top' },
    rowFields: { flexDirection: 'row', gap: Spacing.md },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    typeChipText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    skillRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    skillAddBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.accent + '44', alignItems: 'center', justifyContent: 'center' },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    skillTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 5 },
    skillTagText: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.red + '44' },
    deleteBtnText: { fontSize: FontSize.sm, color: C.red, fontWeight: FontWeight.medium },
    footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: C.borderSubtle, gap: Spacing.sm },
    submitBtn: { paddingVertical: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center' },
    submitDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    submitText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    submitHint: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },
  });
}

export default function AddExperienceScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { experiences, addExperience, updateExperience, removeExperience } = usePortfolioStore();

  const TYPE_OPTIONS = useMemo(() => [
    { value: 'project'    as ExperienceType, label: 'Project',    color: Colors.purple,   bg: Colors.purpleSoft },
    { value: 'hackathon'  as ExperienceType, label: 'Hackathon',  color: Colors.orange,   bg: Colors.orangeSoft },
    { value: 'research'   as ExperienceType, label: 'Research',   color: Colors.blue,     bg: Colors.blueSoft },
    { value: 'startup'    as ExperienceType, label: 'Startup',    color: Colors.accent,   bg: Colors.accentSoft },
    { value: 'internship' as ExperienceType, label: 'Internship', color: Colors.teal,     bg: Colors.tealSoft },
    { value: 'club'       as ExperienceType, label: 'Club',       color: Colors.green,    bg: Colors.greenSoft },
    { value: 'other'      as ExperienceType, label: 'Other',      color: Colors.textMuted, bg: Colors.surfaceElevated },
  ], [Colors]);

  const editing = experiences.find((e) => e.id === editId);

  const [type, setType]             = useState<ExperienceType>(editing?.type ?? 'project');
  const [title, setTitle]           = useState(editing?.title ?? '');
  const [role, setRole]             = useState(editing?.role ?? '');
  const [description, setDesc]      = useState(editing?.description ?? '');
  const [outcome, setOutcome]       = useState(editing?.outcome ?? '');
  const [lessons, setLessons]       = useState(editing?.lessonsLearned ?? '');
  const [startDate, setStart]       = useState(editing?.startDate ?? '');
  const [endDate, setEnd]           = useState(editing?.endDate ?? '');
  const [link, setLink]             = useState(editing?.link ?? '');
  const [skills, setSkills]         = useState<string[]>(editing?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (editing) {
      setType(editing.type);
      setTitle(editing.title);
      setRole(editing.role);
      setDesc(editing.description);
      setOutcome(editing.outcome ?? '');
      setLessons(editing.lessonsLearned ?? '');
      setStart(editing.startDate);
      setEnd(editing.endDate ?? '');
      setLink(editing.link ?? '');
      setSkills(editing.skills);
    }
  }, [editId]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput('');
  };

  const canSubmit = title.trim().length > 0 && role.trim().length > 0 && startDate.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const exp: Experience = {
      id: editId ?? `exp-${Date.now()}`,
      type,
      title: title.trim(),
      role: role.trim(),
      description: description.trim(),
      outcome: outcome.trim() || undefined,
      lessonsLearned: lessons.trim() || undefined,
      skills,
      startDate: startDate.trim(),
      endDate: endDate.trim() || undefined,
      link: link.trim() || undefined,
    };
    if (editId) { updateExperience(editId, exp); } else { addExperience(exp); }
    router.back();
  };

  const handleDelete = () => {
    if (editId) { removeExperience(editId); router.back(); }
  };

  const selectedCfg = TYPE_OPTIONS.find((o) => o.value === type)!;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: editId ? 'Edit Experience' : 'Add Experience' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.field}>
            <Text style={styles.label}>EXPERIENCE TYPE</Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const active = type === opt.value;
                return (
                  <Pressable key={opt.value} style={[styles.typeChip, active && { backgroundColor: opt.bg, borderColor: opt.color }]} onPress={() => setType(opt.value)}>
                    <Text style={[styles.typeChipText, active && { color: opt.color, fontWeight: FontWeight.semibold }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>TITLE</Text>
            <TextInput style={styles.input} placeholder={placeholderTitle(type)} placeholderTextColor={Colors.textMuted} value={title} onChangeText={setTitle} maxLength={100} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>YOUR ROLE</Text>
            <TextInput style={styles.input} placeholder="e.g. Full-Stack Developer, Lead Researcher" placeholderTextColor={Colors.textMuted} value={role} onChangeText={setRole} maxLength={80} />
          </View>

          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>START</Text>
              <TextInput style={styles.input} placeholder="Sep 2024" placeholderTextColor={Colors.textMuted} value={startDate} onChangeText={setStart} maxLength={20} />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>END</Text>
              <TextInput style={styles.input} placeholder="Nov 2024 or blank = present" placeholderTextColor={Colors.textMuted} value={endDate} onChangeText={setEnd} maxLength={20} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput style={[styles.input, styles.inputMulti]} placeholder="What did you build, research, or accomplish? Be specific." placeholderTextColor={Colors.textMuted} value={description} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top" maxLength={500} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>OUTCOME <Text style={styles.optional}>(OPTIONAL)</Text></Text>
            <TextInput style={styles.input} placeholder="e.g. Won 2nd place, 500 beta users, Published paper" placeholderTextColor={Colors.textMuted} value={outcome} onChangeText={setOutcome} maxLength={120} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>LESSONS LEARNED <Text style={styles.optional}>(OPTIONAL)</Text></Text>
            <TextInput style={[styles.input, styles.inputMulti]} placeholder="What would you do differently? What surprised you? What should the next person know?" placeholderTextColor={Colors.textMuted} value={lessons} onChangeText={setLessons} multiline numberOfLines={3} textAlignVertical="top" maxLength={400} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>SKILLS USED</Text>
            <View style={styles.skillRow}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Python, Figma, React" placeholderTextColor={Colors.textMuted} value={skillInput} onChangeText={setSkillInput} onSubmitEditing={addSkill} returnKeyType="done" blurOnSubmit={false} maxLength={40} />
              <Pressable style={styles.skillAddBtn} onPress={addSkill}>
                <Ionicons name="add" size={18} color={Colors.accent} />
              </Pressable>
            </View>
            {skills.length > 0 && (
              <View style={styles.tagWrap}>
                {skills.map((s) => (
                  <Pressable key={s} style={styles.skillTag} onPress={() => setSkills((p) => p.filter((x) => x !== s))}>
                    <Text style={styles.skillTagText}>{s}</Text>
                    <Ionicons name="close" size={11} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>LINK <Text style={styles.optional}>(OPTIONAL)</Text></Text>
            <TextInput style={styles.input} placeholder="GitHub, Devpost, paper URL…" placeholderTextColor={Colors.textMuted} value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" maxLength={200} />
          </View>

          {editId && (
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={15} color={Colors.red} />
              <Text style={styles.deleteBtnText}>Delete Experience</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: selectedCfg.color }, !canSubmit && styles.submitDisabled, pressed && canSubmit && { opacity: 0.88 }]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitText}>{editId ? 'Save Changes' : 'Add to Portfolio'}</Text>
          </Pressable>
          {!canSubmit && <Text style={styles.submitHint}>Title, role, and start date are required</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
