import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { useCollaborationsStore } from '../../store/collaborations';
import { CollabPost } from '../../types/collaboration';
import { formatRelativeTime } from '../../utils/time';
import { Avatar } from '../ui/Avatar';
import { CollabTypeBadge } from '../ui/Badge';

interface CollabPostCardProps {
  post: CollabPost;
}

export function CollabPostCard({ post }: CollabPostCardProps) {
  const router = useRouter();
  const Colors = useColors();
  const { closePost, reopenPost, removePost, toggleApply, appliedIds } = useCollaborationsStore();
  const [showDetail, setShowDetail] = useState(false);
  const isOwn = post.userId === 'me';
  const hasApplied = appliedIds.includes(post.id);
  const displayCount = post.applicantCount + (hasApplied ? 1 : 0);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.lg,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      gap: Spacing.md,
    },
    pressed: { opacity: 0.75 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    metaRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexShrink: 0 },
    closedBadge: {
      backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.sm,
      paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    },
    closedText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
    time: { fontSize: FontSize.xs, color: Colors.textMuted },
    title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, lineHeight: 22 },
    description: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
    skills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    skillTag: {
      backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.md,
      paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    skillText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    moreText: { fontSize: FontSize.xs, color: Colors.textMuted, alignSelf: 'center' },
    divider: { height: 1, backgroundColor: Colors.borderSubtle },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    author: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
    authorInfo: { flex: 1, gap: 1 },
    authorName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
    authorSchool: { fontSize: FontSize.xs, color: Colors.textMuted },
    interestedBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: Colors.greenSoft, borderWidth: 1, borderColor: Colors.green + '33',
      borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    },
    interestedText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.green },
    countBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border,
      borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    },
    countText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textMuted },
    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: '88%',
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md },
    sheetScroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
    sheetTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    closeBtn: { padding: Spacing.xs },
    sheetTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.3, marginBottom: Spacing.md },
    sheetDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
    sheetLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
    sheetSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    sheetSkillTag: {
      backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.md,
      paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    sheetSkillText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    sheetInterestRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
      padding: Spacing.md, marginBottom: Spacing.lg,
    },
    sheetInterestText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    sheetAuthorCard: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1,
      borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg,
    },
    sheetAuthorInfo: { flex: 1, gap: 2 },
    sheetAuthorName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    sheetAuthorMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
    sheetActions: { gap: Spacing.sm },
    applyBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: Spacing.md + 2,
    },
    appliedBtn: { backgroundColor: Colors.green },
    applyBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    viewProfileBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1,
      borderColor: Colors.border, paddingVertical: Spacing.md,
    },
    viewProfileText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    ownActionsRow: { flexDirection: 'row', gap: Spacing.sm },
    ownActionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.xs, backgroundColor: Colors.surface, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.md,
    },
    ownActionBtnDestructive: { borderColor: Colors.red + '44' },
    ownActionText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    ownActionTextDestructive: { color: Colors.red },
    statRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: Colors.accentSoft, borderRadius: Radius.lg,
      padding: Spacing.md, marginBottom: Spacing.lg,
    },
    statText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.accent },
    statSub: { fontSize: FontSize.xs, color: Colors.accent, opacity: 0.8 },
  }), [Colors]);

  const handleApply = () => {
    if (!post.isOpen) return;
    toggleApply(post.id);
  };

  const handleDelete = () => {
    Alert.alert('Delete post?', 'This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removePost(post.id); setShowDetail(false); } },
    ]);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => setShowDetail(true)}
      >
        <View style={styles.topRow}>
          <CollabTypeBadge type={post.type} />
          <View style={styles.metaRight}>
            {!post.isOpen && (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Filled</Text>
              </View>
            )}
            <Text style={styles.time}>{formatRelativeTime(post.postedAt)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{post.description}</Text>

        <View style={styles.skills}>
          {post.skills.slice(0, 4).map((skill) => (
            <View key={skill} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {post.skills.length > 4 && (
            <Text style={styles.moreText}>+{post.skills.length - 4}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.author}>
            <Avatar initials={post.userInitials} color={post.userAvatarColor} size={26} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{isOwn ? 'You' : post.userName}</Text>
              <Text style={styles.authorSchool} numberOfLines={1}>{post.userSchool}</Text>
            </View>
          </View>
          {isOwn ? (
            <View style={styles.countBadge}>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.countText}>{displayCount} interested</Text>
            </View>
          ) : hasApplied ? (
            <View style={styles.interestedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.green} />
              <Text style={styles.interestedText}>Interested</Text>
            </View>
          ) : (
            <View style={styles.countBadge}>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.countText}>{displayCount}</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Detail Modal */}
      <Modal visible={showDetail} animationType="slide" transparent onRequestClose={() => setShowDetail(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDetail(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.sheetTopRow}>
                <CollabTypeBadge type={post.type} />
                <Pressable style={styles.closeBtn} onPress={() => setShowDetail(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.sheetTitle}>{post.title}</Text>
              <Text style={styles.sheetDesc}>{post.description}</Text>

              {post.skills.length > 0 && (
                <>
                  <Text style={styles.sheetLabel}>Skills needed</Text>
                  <View style={styles.sheetSkills}>
                    {post.skills.map((skill) => (
                      <View key={skill} style={styles.sheetSkillTag}>
                        <Text style={styles.sheetSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.sheetInterestRow}>
                <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.sheetInterestText}>
                  <Text style={{ fontWeight: FontWeight.semibold, color: Colors.text }}>{displayCount} </Text>
                  {displayCount === 1 ? 'person has' : 'people have'} expressed interest
                  {!post.isOpen ? ' · This post is filled' : ''}
                </Text>
              </View>

              <Text style={styles.sheetLabel}>Posted by</Text>
              <Pressable
                style={styles.sheetAuthorCard}
                onPress={() => { setShowDetail(false); router.push(`/user/${post.userId}`); }}
                disabled={isOwn}
              >
                <Avatar initials={post.userInitials} color={post.userAvatarColor} size={40} />
                <View style={styles.sheetAuthorInfo}>
                  <Text style={styles.sheetAuthorName}>{isOwn ? 'You' : post.userName}</Text>
                  <Text style={styles.sheetAuthorMeta}>{post.userSchool} · {formatRelativeTime(post.postedAt)}</Text>
                </View>
                {!isOwn && <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />}
              </Pressable>

              <View style={styles.sheetActions}>
                {isOwn ? (
                  <>
                    {isOwn && displayCount > 0 && (
                      <View style={styles.statRow}>
                        <Ionicons name="people" size={18} color={Colors.accent} />
                        <View>
                          <Text style={styles.statText}>{displayCount} interested</Text>
                          <Text style={styles.statSub}>People who want to collaborate</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.ownActionsRow}>
                      <Pressable
                        style={styles.ownActionBtn}
                        onPress={() => { post.isOpen ? closePost(post.id) : reopenPost(post.id); setShowDetail(false); }}
                      >
                        <Ionicons
                          name={post.isOpen ? 'checkmark-circle-outline' : 'refresh-outline'}
                          size={15}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.ownActionText}>{post.isOpen ? 'Mark Filled' : 'Reopen'}</Text>
                      </Pressable>
                      <Pressable style={[styles.ownActionBtn, styles.ownActionBtnDestructive]} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={15} color={Colors.red} />
                        <Text style={styles.ownActionTextDestructive}>Delete</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {post.isOpen && (
                      <Pressable
                        style={[styles.applyBtn, hasApplied && styles.appliedBtn]}
                        onPress={handleApply}
                      >
                        <Ionicons
                          name={hasApplied ? 'checkmark-circle' : 'hand-right-outline'}
                          size={18}
                          color="#fff"
                        />
                        <Text style={styles.applyBtnText}>
                          {hasApplied ? "You're interested — tap to undo" : "I'm Interested"}
                        </Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={styles.viewProfileBtn}
                      onPress={() => { setShowDetail(false); router.push(`/user/${post.userId}`); }}
                    >
                      <Ionicons name="person-outline" size={15} color={Colors.textSecondary} />
                      <Text style={styles.viewProfileText}>View {post.userName}'s Profile</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
