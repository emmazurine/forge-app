import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { useColors } from '../src/hooks/useColors';
import { useAllNotifications, useUnreadCount } from '../src/hooks/useNotifications';
import { useConnectionsStore } from '../src/store/connections';
import { useNotificationsStore } from '../src/store/notifications';
import { AppNotification, NotificationType } from '../src/types/notification';

export { useAllNotifications, useUnreadCount };

const TYPE_ICON: Record<NotificationType, { name: any; color: string }> = {
  connection_request:  { name: 'person-add-outline',       color: '#6366F1' },
  connection_accepted: { name: 'checkmark-circle-outline', color: '#22C55E' },
  message:             { name: 'chatbubble-outline',        color: '#3B82F6' },
  event_reminder:      { name: 'calendar-outline',          color: '#F59E0B' },
  post_interest:       { name: 'hand-right-outline',        color: '#14B8A6' },
  welcome:             { name: 'sparkles-outline',          color: '#A855F7' },
};

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { lastViewedAt, markAllRead } = useNotificationsStore();
  const { acceptRequest, declineRequest } = useConnectionsStore();
  const allNotifs = useAllNotifications();

  useEffect(() => { markAllRead(); }, []);

  const newNotifs = allNotifs.filter((n) => n.timestamp > lastViewedAt);
  const earlierNotifs = allNotifs.filter((n) => n.timestamp <= lastViewedAt);

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
      borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    backBtn: { padding: Spacing.xs },
    title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
    markBtn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
    markText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.medium },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 60 },
    groupLabel: {
      fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.8,
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
    },
    row: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2,
      borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    rowUnread: { backgroundColor: Colors.accentSoft + '66' },
    iconWrap: {
      width: 42, height: 42, borderRadius: 21,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      borderWidth: 1,
    },
    avatarWrap: { position: 'relative', flexShrink: 0 },
    typeDot: {
      position: 'absolute', bottom: -2, right: -2,
      width: 18, height: 18, borderRadius: 9,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: Colors.bg,
    },
    body: { flex: 1, gap: 2 },
    rowTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, lineHeight: 20 },
    rowTitleUnread: { fontWeight: FontWeight.semibold },
    rowBody: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 17 },
    rowTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 6, flexShrink: 0 },
    actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.accent },
    acceptText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
    declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    declineText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 80 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    emptyBody: { fontSize: FontSize.sm, color: Colors.textMuted },
  }), [Colors]);

  const renderNotif = (notif: AppNotification, unread: boolean) => {
    const cfg = TYPE_ICON[notif.type];
    const isConnReq = notif.type === 'connection_request';
    const reqStudentId = isConnReq ? notif.id.replace('conn-req-', '') : null;

    const iconEl = notif.avatarInitials ? (
      <View style={styles.avatarWrap}>
        <Avatar initials={notif.avatarInitials} color={notif.avatarColor ?? '#6366F1'} size={42} />
        <View style={[styles.typeDot, { backgroundColor: cfg.color }]}>
          <Ionicons name={cfg.name} size={10} color="#fff" />
        </View>
      </View>
    ) : (
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '44' }]}>
        <Ionicons name={cfg.name} size={20} color={cfg.color} />
      </View>
    );

    const bodyEl = (
      <View style={styles.body}>
        <Text style={[styles.rowTitle, unread && styles.rowTitleUnread]}>{notif.title}</Text>
        {!!notif.body && <Text style={styles.rowBody}>{notif.body}</Text>}
        <Text style={styles.rowTime}>{formatTime(notif.timestamp)}</Text>
        {isConnReq && reqStudentId && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
              onPress={() => acceptRequest(reqStudentId)}
            >
              <Ionicons name="checkmark" size={14} color="#fff" />
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.declineBtn, pressed && { opacity: 0.85 }]}
              onPress={() => declineRequest(reqStudentId)}
            >
              <Ionicons name="close" size={14} color={Colors.textSecondary} />
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
          </View>
        )}
      </View>
    );

    if (isConnReq) {
      return (
        <View key={notif.id} style={[styles.row, unread && styles.rowUnread]}>
          {iconEl}
          {bodyEl}
        </View>
      );
    }

    return (
      <Pressable
        key={notif.id}
        style={({ pressed }) => [styles.row, unread && styles.rowUnread, pressed && { opacity: 0.85 }]}
        onPress={() => notif.href && router.push(notif.href as any)}
      >
        {iconEl}
        {bodyEl}
        {unread && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Colors.accent} />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
        </View>
        {allNotifs.length > 0 && (
          <Pressable style={styles.markBtn} onPress={markAllRead}>
            <Text style={styles.markText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {allNotifs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyBody}>New activity will show up here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {newNotifs.length > 0 && (
            <>
              <Text style={styles.groupLabel}>New</Text>
              {newNotifs.map((n) => renderNotif(n, true))}
            </>
          )}
          {earlierNotifs.length > 0 && (
            <>
              <Text style={styles.groupLabel}>Earlier</Text>
              {earlierNotifs.map((n) => renderNotif(n, false))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
