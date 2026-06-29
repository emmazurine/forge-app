import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { ColorPalette } from '../src/constants/themes';
import { useColors } from '../src/hooks/useColors';
import { useArchiveStore } from '../src/store/archive';
import { ArchiveEntry } from '../src/types/archive';
import { ExperienceType } from '../src/types/portfolio';

const TYPE_FILTERS: { id: ExperienceType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'project', label: 'Project' },
  { id: 'hackathon', label: 'Hackathon' },
  { id: 'research', label: 'Research' },
  { id: 'startup', label: 'Startup' },
  { id: 'club', label: 'Club' },
];

function abbreviateSchool(name: string): string {
  const map: Record<string, string> = {
    'Thomas Jefferson HSST': 'TJ HSST',
    'George Mason University': 'GMU',
    'Northern Virginia Community College': 'NOVA',
    'George Washington University': 'GWU',
    'American University': 'AU',
    'University of Maryland': 'UMD',
    'Virginia Tech': 'VT',
    'Howard University': 'Howard',
    'Marymount University': 'Marymount',
    'Georgetown University': 'Georgetown',
  };
  return map[name] ?? name;
}

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    navHeader: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
    navInner: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    navTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text, textAlign: 'center' },
    navSub: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },
    stickyFilters: { backgroundColor: C.bg, paddingTop: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.borderSubtle, gap: Spacing.sm },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, backgroundColor: C.surface,
      borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    },
    searchInput: { flex: 1, color: C.text, fontSize: FontSize.sm },
    schoolRow: { flexShrink: 0 },
    chipRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, alignItems: 'center' },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    chipActive: { backgroundColor: C.accentSoft, borderColor: C.accent + '55' },
    chipText: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
    chipTextActive: { color: C.accent, fontWeight: FontWeight.semibold },
    chipDivider: { width: 1, height: 20, backgroundColor: C.border, marginHorizontal: 2 },
    statsRow: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xs },
    statsText: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium },
    list: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingTop: Spacing.sm },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: C.textSecondary },
    emptySubtitle: { fontSize: FontSize.sm, color: C.textMuted },
    card: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    cardAccent: { width: 3 },
    cardBody: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', flex: 1 },
    cardRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    gradYear: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium },
    typePill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
    typePillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
    failedPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.red + '44' },
    failedPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: C.red },
    cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: C.text, lineHeight: 22 },
    schoolRow2: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardSchool: { fontSize: FontSize.xs, color: C.textMuted },
    cardTeam: { fontSize: FontSize.xs, color: C.textSecondary, fontStyle: 'italic' },
    outcomeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: C.orangeSoft, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
    outcomeRowFailed: { backgroundColor: C.redSoft },
    outcomeText: { fontSize: FontSize.xs, color: C.orange, fontWeight: FontWeight.medium, flex: 1 },
    outcomeTextFailed: { color: C.red },
    expandedContent: { gap: Spacing.md, marginTop: Spacing.xs },
    expandedDivider: { height: 1, backgroundColor: C.borderSubtle },
    expandedLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    expandedBody: { fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 21 },
    lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    lessonLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.orange, letterSpacing: 0.8 },
    lessonBody: { fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 21, fontStyle: 'italic' },
    skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    skillTag: { backgroundColor: C.surfaceElevated, borderWidth: 1, borderColor: C.border, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
    skillTagText: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
  });
}

type Styles = ReturnType<typeof createStyles>;

export default function ArchiveScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const entries = useArchiveStore((s) => s.entries);
  const [query, setQuery] = useState('');
  const [school, setSchool] = useState('All');
  const [type, setType] = useState<ExperienceType | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const schools = useMemo(() => {
    const unique = Array.from(new Set(entries.map((e) => e.school))).sort();
    return ['All', ...unique];
  }, [entries]);

  const filtered = useMemo(() => {
    let base = entries;
    if (school !== 'All') base = base.filter((e) => e.school === school);
    if (type !== 'all') base = base.filter((e) => e.type === type);
    const q = query.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.skills.some((s) => s.toLowerCase().includes(q)) ||
          (e.lessonsLearned?.toLowerCase().includes(q) ?? false) ||
          (e.teamMembers?.some((m) => m.toLowerCase().includes(q)) ?? false)
      );
    }
    return [...base].sort((a, b) => b.publishedAt - a.publishedAt);
  }, [entries, query, school, type]);

  const failureCount = filtered.filter(
    (e) => e.outcome?.toLowerCase().includes('fail') || e.outcome?.toLowerCase().includes('shut down')
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: '',
          header: () => (
            <SafeAreaView style={styles.navHeader} edges={['top']}>
              <View style={styles.navInner}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </Pressable>
                <View>
                  <Text style={styles.navTitle}>Legacy Archive</Text>
                  <Text style={styles.navSub}>What students built before you</Text>
                </View>
                <View style={styles.backBtn} />
              </View>
            </SafeAreaView>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" stickyHeaderIndices={[0]}>
        <View style={styles.stickyFilters}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, skill, lesson…"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={15} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.schoolRow} contentContainerStyle={styles.chipRow}>
            {schools.map((s) => (
              <Pressable key={s} style={[styles.chip, school === s && styles.chipActive]} onPress={() => setSchool(s)}>
                <Text style={[styles.chipText, school === s && styles.chipTextActive]}>{abbreviateSchool(s)}</Text>
              </Pressable>
            ))}
            <View style={styles.chipDivider} />
            {TYPE_FILTERS.map((t) => (
              <Pressable key={t.id} style={[styles.chip, type === t.id && styles.chipActive]} onPress={() => setType(t.id)}>
                <Text style={[styles.chipText, type === t.id && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {filtered.length} entries · {failureCount > 0 ? `${failureCount} honest failures` : 'all wins'}
          </Text>
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="library-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nothing found</Text>
              <Text style={styles.emptySubtitle}>Try a different keyword or filter</Text>
            </View>
          ) : (
            filtered.map((entry) => (
              <ArchiveCard
                key={entry.id}
                entry={entry}
                expanded={expanded === entry.id}
                onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
                styles={styles}
                Colors={Colors}
              />
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ArchiveCard({ entry, expanded, onToggle, styles, Colors }: {
  entry: ArchiveEntry;
  expanded: boolean;
  onToggle: () => void;
  styles: Styles;
  Colors: ColorPalette;
}) {
  const EXP_COLORS: Record<string, string> = {
    project: Colors.purple, hackathon: Colors.orange, research: Colors.blue,
    startup: Colors.accent, internship: Colors.teal, club: Colors.green,
    nonprofit: Colors.green, other: Colors.textMuted,
  };
  const color = EXP_COLORS[entry.type] ?? Colors.accent;
  const isFailed = entry.outcome?.toLowerCase().includes('fail') || entry.outcome?.toLowerCase().includes('shut down');

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]} onPress={onToggle}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardMeta}>
            <View style={[styles.typePill, { backgroundColor: color + '22', borderColor: color + '44' }]}>
              <Text style={[styles.typePillText, { color }]}>{entry.type}</Text>
            </View>
            {isFailed && (
              <View style={styles.failedPill}>
                <Text style={styles.failedPillText}>honest failure</Text>
              </View>
            )}
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.gradYear}>{entry.graduationYear}</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
          </View>
        </View>

        <Text style={styles.cardTitle}>{entry.title}</Text>

        <View style={styles.schoolRow2}>
          <Ionicons name="school-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.cardSchool}>{abbreviateSchool(entry.school)}{' · '}{entry.startDate} – {entry.endDate}</Text>
        </View>

        {entry.teamMembers && entry.teamMembers.length > 0 && (
          <Text style={styles.cardTeam}>{entry.teamMembers.join(', ')}</Text>
        )}

        {entry.outcome && (
          <View style={[styles.outcomeRow, isFailed && styles.outcomeRowFailed]}>
            <Ionicons name={isFailed ? 'close-circle-outline' : 'trophy-outline'} size={12} color={isFailed ? Colors.red : Colors.orange} />
            <Text style={[styles.outcomeText, isFailed && styles.outcomeTextFailed]}>{entry.outcome}</Text>
          </View>
        )}

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedDivider} />
            <Text style={styles.expandedLabel}>WHAT THEY BUILT</Text>
            <Text style={styles.expandedBody}>{entry.description}</Text>

            {entry.lessonsLearned && (
              <>
                <View style={styles.lessonHeader}>
                  <Ionicons name="bulb-outline" size={13} color={Colors.orange} />
                  <Text style={styles.lessonLabel}>LESSONS LEARNED</Text>
                </View>
                <Text style={styles.lessonBody}>{entry.lessonsLearned}</Text>
              </>
            )}

            {entry.skills.length > 0 && (
              <View style={styles.skillsWrap}>
                {entry.skills.map((s) => (
                  <View key={s} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
