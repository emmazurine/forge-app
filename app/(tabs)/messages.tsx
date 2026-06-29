import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Logo } from '../../src/components/ui/Logo';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useMessagesStore } from '../../src/store/messages';
import { Conversation } from '../../src/types/message';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { formatRelativeTime } from '../../src/utils/time';

export default function MessagesScreen() {
  const router = useRouter();
  const Colors = useColors();
  const conversations = useMessagesStore((s) => s.conversations);

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
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.xxl,
      paddingBottom: 80,
    },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginTop: Spacing.sm },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  }), [Colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.navigate('/')}>
            <Logo size="md" showWordmark={false} />
          </Pressable>
          <View>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>{conversations.length} conversations</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="mail-outline" size={44} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Find someone on Connect and send them a message
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {conversations.map((convo) => (
            <ConvoRow
              key={convo.id}
              convo={convo}
              onPress={() => router.push(`/conversation/${convo.participantId}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ConvoRow({ convo, onPress }: { convo: Conversation; onPress: () => void }) {
  const Colors = useColors();
  const last = convo.messages[convo.messages.length - 1];
  const isUnread = last?.senderId !== 'me';
  const preview = !last
    ? 'No messages yet'
    : last.type === 'portfolio'
    ? `${last.senderId === 'me' ? 'You shared' : 'Shared'} their portfolio`
    : last.text || 'No messages yet';
  const timestamp = last ? formatRelativeTime(last.sentAt) : '';

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md + 2,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderSubtle,
      gap: Spacing.md,
    },
    rowPressed: { backgroundColor: Colors.surface },
    avatarWrap: { position: 'relative' },
    unreadDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: Colors.accent,
      borderWidth: 2,
      borderColor: Colors.bg,
    },
    rowBody: { flex: 1, gap: 3 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textSecondary, flex: 1 },
    nameUnread: { fontWeight: FontWeight.bold, color: Colors.text },
    timestamp: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: Spacing.sm },
    preview: { fontSize: FontSize.sm, color: Colors.textMuted },
    previewUnread: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
    chevron: { marginLeft: Spacing.xs },
  }), [Colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        <Avatar initials={convo.participantInitials} color={convo.participantAvatarColor} size={50} />
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, isUnread && styles.nameUnread]} numberOfLines={1}>
            {convo.participantName}
          </Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        <Text style={[styles.preview, isUnread && styles.previewUnread]} numberOfLines={1}>
          {last?.senderId === 'me' ? `You: ${preview}` : preview}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={styles.chevron} />
    </Pressable>
  );
}
