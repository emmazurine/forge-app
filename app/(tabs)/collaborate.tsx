import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollabPostCard } from '../../src/components/collaborate/CollabPostCard';
import { Logo } from '../../src/components/ui/Logo';
import { UnderlineTabs } from '../../src/components/ui/UnderlineTabs';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useVerification } from '../../src/hooks/useVerification';
import { useCollaborationsStore } from '../../src/store/collaborations';
import { useOnboardingStore } from '../../src/store/onboarding';
import { useProfileStore } from '../../src/store/profile';
import { CollabType } from '../../src/types/collaboration';
import { NotificationBell } from '../../src/components/ui/NotificationBell';

const TABS: { id: CollabType | 'all' | 'mine'; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'mine',        label: 'My Posts' },
  { id: 'hackathon',   label: 'Hackathon' },
  { id: 'research',    label: 'Research' },
  { id: 'startup',     label: 'Startup' },
  { id: 'club',        label: 'Club' },
  { id: 'competition', label: 'Competition' },
  { id: 'nonprofit',   label: 'Nonprofit' },
  { id: 'other',       label: 'Other' },
];

export default function CollaborateScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { isVerified } = useVerification();

  const handlePost = () => {
    if (!isVerified) {
      Alert.alert(
        'Verify your student status',
        'You need to verify you\'re a student before posting opportunities.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Verify →', onPress: () => router.push('/verify') },
        ]
      );
      return;
    }
    router.push('/collaborate/add');
  };
  const posts = useCollaborationsStore((s) => s.posts);
  const savedProfile = useProfileStore((s) => s.saved);
  const obSchool = useOnboardingStore((s) => s.school);
  const viewerSchool = (savedProfile?.school.trim() || obSchool.trim()).toLowerCase();
  const [activeType, setActiveType] = useState<CollabType | 'all' | 'mine'>('all');
  const [query, setQuery] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.8, marginBottom: 4 },
    subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
    headerBtns: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    archiveBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.md,
    },
    postBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: Colors.accentSoft,
      borderWidth: 1,
      borderColor: Colors.accent + '44',
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 1,
    },
    postBtnPressed: { opacity: 0.8 },
    postBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.accent, letterSpacing: 0.2 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
    list: { flex: 1 },
    listContent: { paddingTop: Spacing.lg, paddingBottom: 120 },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
    filledDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
    },
    filledLine: { flex: 1, height: 1, backgroundColor: Colors.borderSubtle },
    filledLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, letterSpacing: 1 },
    closedWrap: { opacity: 0.55 },
  }), [Colors]);

  const filtered = useMemo(() => {
    let base = posts.filter(
      (p) => p.userId === 'me' || p.visibility !== 'school' || p.userSchool.trim().toLowerCase() === viewerSchool
    );
    if (activeType === 'mine') base = base.filter((p) => p.userId === 'me');
    else if (activeType !== 'all') base = base.filter((p) => p.type === activeType);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.userName.toLowerCase().includes(q)
    );
  }, [posts, activeType, query, viewerSchool]);

  const openPosts = useMemo(() => filtered.filter((p) => p.isOpen), [filtered]);
  const closedPosts = useMemo(() => filtered.filter((p) => !p.isOpen), [filtered]);
  const visiblePosts = useMemo(
    () => posts.filter((p) => p.userId === 'me' || p.visibility !== 'school' || p.userSchool.trim().toLowerCase() === viewerSchool),
    [posts, viewerSchool]
  );
  const openCount = visiblePosts.filter((p) => p.isOpen).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.navigate('/')}>
            <Logo size="md" showWordmark={false} />
          </Pressable>
          <View>
            <Text style={styles.title}>Collaborate</Text>
            <Text style={styles.subtitle}>{openCount} open opportunities</Text>
          </View>
        </View>
        <View style={styles.headerBtns}>
          <NotificationBell />
          <Pressable
            style={({ pressed }) => [styles.archiveBtn, pressed && styles.postBtnPressed]}
            onPress={() => router.push('/archive')}
          >
            <Ionicons name="library-outline" size={16} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.postBtn, pressed && styles.postBtnPressed]}
            onPress={handlePost}
          >
            <Ionicons name="add" size={16} color={Colors.accent} />
            <Text style={styles.postBtnText}>Post</Text>
          </Pressable>
        </View>
      </View>

      <UnderlineTabs
        tabs={TABS as { id: string; label: string }[]}
        active={activeType}
        onSelect={(id) => setActiveType(id as CollabType | 'all' | 'mine')}
      />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, skill, or person…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={15} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {query ? 'No matches' : activeType === 'mine' ? 'No posts yet' : 'No posts found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {query
                ? 'Try a different keyword'
                : activeType === 'mine'
                ? 'Tap Post to share an opportunity'
                : 'Be the first to post an opportunity'}
            </Text>
          </View>
        ) : (
          <>
            {openPosts.map((post) => <CollabPostCard key={post.id} post={post} />)}
            {closedPosts.length > 0 && (
              <>
                <View style={styles.filledDivider}>
                  <View style={styles.filledLine} />
                  <Text style={styles.filledLabel}>FILLED</Text>
                  <View style={styles.filledLine} />
                </View>
                {closedPosts.map((post) => (
                  <View key={post.id} style={styles.closedWrap}>
                    <CollabPostCard post={post} />
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
