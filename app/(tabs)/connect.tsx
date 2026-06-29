import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StudentCard } from '../../src/components/connect/StudentCard';
import { Avatar } from '../../src/components/ui/Avatar';
import { Logo } from '../../src/components/ui/Logo';
import { UnderlineTabs } from '../../src/components/ui/UnderlineTabs';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { STUDENTS } from '../../src/data/students';
import { useColors } from '../../src/hooks/useColors';
import { useVerification } from '../../src/hooks/useVerification';
import { matchStudents, MatchResult } from '../../src/lib/matchStudents';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useProfileStore } from '../../src/store/profile';
import { Student } from '../../src/types/user';

function buildMeStudent(): Student {
  const saved = useProfileStore.getState().saved;
  if (saved) return { ...saved, id: 'me' };
  const ob = useOnboardingStore.getState();
  const name = ob.name.trim() || 'Your Name';
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: 'me', name, initials, avatarColor: '#6366F1',
    school: ob.school.trim(), major: ob.major.trim(), year: ob.year,
    bio: ob.bio.trim(), interests: [...ob.interests], skills: [],
    currentProject: ob.currentProject.trim() || undefined,
    projectDescription: ob.projectDescription.trim() || undefined,
    openToCollaborate: ob.openToCollaborate,
  };
}

const TABS = [
  { id: 'All', label: 'All' },
  { id: 'AI/ML', label: 'AI / ML' },
  { id: 'Startups', label: 'Startups' },
  { id: 'Research', label: 'Research' },
  { id: 'Robotics', label: 'Robotics' },
  { id: 'Policy', label: 'Policy' },
  { id: 'Health', label: 'Health' },
];

const INTEREST_MAP: Record<string, string[]> = {
  'AI/ML': ['Machine Learning', 'AI', 'Healthcare AI', 'Clinical NLP'],
  'Startups': ['Startups', 'EdTech', 'Product'],
  'Research': ['Research', 'Open Research', 'AI Policy', 'Clinical Research', 'Quantum Computing'],
  'Robotics': ['Robotics', 'Embedded Systems', 'Autonomous Vehicles'],
  'Policy': ['AI Policy', 'Tech Ethics', 'Public Interest Tech'],
  'Health': ['Healthcare AI', 'Med Startups', 'Global Health', 'Medicine'],
};

const SUGGESTIONS = [
  'Someone doing ML research who wants to co-found',
  'A designer interested in social impact',
  'Someone with hardware experience for a robotics project',
  'A pre-med student open to healthcare AI',
];

export default function ConnectScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { isVerified } = useVerification();
  const [activeTab, setActiveTab] = useState('All');
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const aiInputRef = useRef<TextInput>(null);
  const savedProfile = useProfileStore((s) => s.saved);
  const me = useMemo(() => buildMeStudent(), [savedProfile]);

  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<MatchResult[] | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.8, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
    locationText: { fontSize: FontSize.sm, color: Colors.textMuted },
    headerBtns: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    iconBtn: {
      width: 36, height: 36, borderRadius: Radius.full,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    iconBtnActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent + '44' },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    },
    searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm, padding: 0 },
    list: { flex: 1 },
    listContent: { paddingTop: Spacing.lg, paddingBottom: 120 },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
    // AI modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: Spacing.lg, paddingBottom: 40, maxHeight: '85%',
    },
    modalHandle: {
      width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border,
      alignSelf: 'center', marginBottom: Spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    },
    modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
    modalSub: { fontSize: FontSize.sm, color: Colors.textMuted, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, lineHeight: 20 },
    aiInputRow: {
      flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: Radius.lg, padding: Spacing.md,
    },
    aiInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm, minHeight: 44, maxHeight: 100, padding: 0 },
    aiSendBtn: {
      width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    aiSendBtnDisabled: { backgroundColor: Colors.border },
    suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    suggestionChip: {
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    },
    suggestionText: { fontSize: FontSize.xs, color: Colors.textSecondary },
    resultsScroll: { paddingHorizontal: Spacing.lg },
    loadingWrap: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
    loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
    noResults: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    noResultsText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
    resultCard: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1,
      borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm,
    },
    resultInfo: { flex: 1, gap: 3 },
    resultName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    resultMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
    resultReason: { fontSize: FontSize.xs, color: Colors.accent, lineHeight: 17, marginTop: 2 },
  }), [Colors]);

  const filtered = useMemo(() => {
    let result = STUDENTS;
    if (activeTab !== 'All') {
      const terms = INTEREST_MAP[activeTab] ?? [];
      result = result.filter((s) => s.interests.some((i) => terms.includes(i)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (isVerified && s.school.toLowerCase().includes(q)) ||
          s.major.toLowerCase().includes(q) ||
          s.interests.some((i) => i.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeTab, query]);

  const toggleSearch = () => {
    if (showSearch) { setQuery(''); setShowSearch(false); }
    else { setShowSearch(true); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  const openAI = () => { setShowAI(true); setAiResults(null); setAiQuery(''); };
  const closeAI = () => setShowAI(false);

  const handleAISearch = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResults(null);
    try {
      const results = await matchStudents(aiQuery.trim(), STUDENTS);
      setAiResults(results);
    } catch {
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  };

  const matchedStudents = useMemo(() => {
    if (!aiResults) return [];
    return aiResults
      .map((r) => ({ student: STUDENTS.find((s) => s.id === r.id), reason: r.reason }))
      .filter((r): r is { student: Student; reason: string } => !!r.student);
  }, [aiResults]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.navigate('/')}>
            <Logo size="md" showWordmark={false} />
          </Pressable>
          <View>
            <Text style={styles.title}>Connect</Text>
            <View style={styles.locationRow}>
              <View style={styles.liveDot} />
              <Text style={styles.locationText}>{filtered.length} students near you</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerBtns}>
          <NotificationBell />
          <Pressable style={[styles.iconBtn, showAI && styles.iconBtnActive]} onPress={openAI}>
            <Ionicons name="sparkles-outline" size={18} color={showAI ? Colors.accent : Colors.textMuted} />
          </Pressable>
          <Pressable style={[styles.iconBtn, showSearch && styles.iconBtnActive]} onPress={toggleSearch}>
            <Ionicons
              name={showSearch ? 'close' : 'search-outline'}
              size={20}
              color={showSearch ? Colors.accent : Colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by name, major, or interest…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      <UnderlineTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {activeTab === 'All' && !query.trim() && <StudentCard student={me} isMe />}
        {filtered.map((student) => <StudentCard key={student.id} student={student} />)}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptySubtitle}>{query ? `No results for "${query}"` : 'Try a different filter'}</Text>
          </View>
        )}
      </ScrollView>

      {/* AI Match Modal */}
      <Modal visible={showAI} animationType="slide" transparent onRequestClose={closeAI}>
        <Pressable style={styles.modalOverlay} onPress={closeAI}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="sparkles" size={18} color={Colors.accent} />
                <Text style={styles.modalTitle}>Find a collaborator</Text>
              </View>
              <Pressable onPress={closeAI} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Describe who you're looking for — skills, interests, what kind of project — and AI will find the best matches.
            </Text>

            <View style={styles.aiInputRow}>
              <TextInput
                ref={aiInputRef}
                style={styles.aiInput}
                placeholder="e.g. someone interested in ML who wants to co-found a startup…"
                placeholderTextColor={Colors.textMuted}
                value={aiQuery}
                onChangeText={setAiQuery}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleAISearch}
                autoFocus
              />
              <Pressable
                style={[styles.aiSendBtn, (!aiQuery.trim() || aiLoading) && styles.aiSendBtnDisabled]}
                onPress={handleAISearch}
                disabled={!aiQuery.trim() || aiLoading}
              >
                {aiLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="arrow-up" size={18} color="#fff" />
                }
              </Pressable>
            </View>

            {!aiResults && !aiLoading && (
              <View style={styles.suggestionsRow}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} style={styles.suggestionChip} onPress={() => setAiQuery(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {aiLoading && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={Colors.accent} />
                  <Text style={styles.loadingText}>Finding matches…</Text>
                </View>
              )}

              {aiResults !== null && !aiLoading && matchedStudents.length === 0 && (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
                  <Text style={styles.noResultsText}>No strong matches found.{'\n'}Try describing different skills or interests.</Text>
                </View>
              )}

              {matchedStudents.map(({ student, reason }) => (
                <Pressable
                  key={student.id}
                  style={styles.resultCard}
                  onPress={() => { closeAI(); router.push(`/user/${student.id}`); }}
                >
                  <Avatar initials={student.initials} color={student.avatarColor} size={44} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{student.name}</Text>
                    <Text style={styles.resultMeta}>{student.major} · {student.year}</Text>
                    <Text style={styles.resultReason}>{reason}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
