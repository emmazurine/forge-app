import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { EVENTS } from '../../src/data/events';
import { STUDENTS } from '../../src/data/students';
import { useColors } from '../../src/hooks/useColors';
import { useConnectionsStore } from '../../src/store/connections';
import { useEventsStore } from '../../src/store/events';
import { EventType } from '../../src/types/event';

const TYPE_CONFIG: Record<EventType, { label: string; icon: any; color: string; softColor: string }> = {
  'lock-in':    { label: 'Lock-In',    icon: 'moon-outline',     color: '#A855F7', softColor: 'rgba(168,85,247,0.12)' },
  'hackathon':  { label: 'Hackathon',  icon: 'flash-outline',    color: '#F59E0B', softColor: 'rgba(245,158,11,0.12)' },
  'workshop':   { label: 'Workshop',   icon: 'build-outline',    color: '#3B82F6', softColor: 'rgba(59,130,246,0.12)' },
  'study-group':{ label: 'Study',      icon: 'book-outline',     color: '#22C55E', softColor: 'rgba(34,197,94,0.12)' },
  'social':     { label: 'Social',     icon: 'people-outline',   color: '#6366F1', softColor: 'rgba(99,102,241,0.12)' },
  'other':      { label: 'Event',      icon: 'calendar-outline', color: '#9090AA', softColor: 'rgba(144,144,170,0.12)' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const Colors = useColors();
  const { rsvpedIds, rsvp, cancelRsvp } = useEventsStore();
  const connections = useConnectionsStore((s) => s.connections);

  const submittedEvents = useEventsStore((s) => s.submittedEvents);
  const event = EVENTS.find((e) => e.id === id) ?? submittedEvents.find((e) => e.id === id);
  const host = event ? STUDENTS.find((s) => s.id === event.hostId) : null;

  const friendsGoing = useMemo(() => {
    if (!event) return [];
    const connectedIds = Object.entries(connections)
      .filter(([, status]) => status === 'connected')
      .map(([id]) => id);
    return STUDENTS.filter(
      (s) => connectedIds.includes(s.id) && event.rsvpIds.includes(s.id)
    );
  }, [connections, event]);

  const isRsvped = !!event && rsvpedIds.includes(event.id);
  const total = event ? event.rsvpIds.length + (isRsvped && !event.rsvpIds.includes('me') ? 1 : 0) : 0;
  const spotsLeft = event ? event.capacity - total : 0;
  const fillPct = event ? Math.min(total / event.capacity, 1) : 0;
  const isFull = spotsLeft <= 0 && !isRsvped;
  const cfg = event ? TYPE_CONFIG[event.type] : TYPE_CONFIG['other'];

  const handleRsvp = () => {
    if (!event) return;
    if (isRsvped) {
      Alert.alert('Cancel RSVP?', 'Remove yourself from this event?', [
        { text: 'Keep RSVP', style: 'cancel' },
        { text: 'Cancel RSVP', style: 'destructive', onPress: () => cancelRsvp(event.id) },
      ]);
    } else if (isFull) {
      Alert.alert('Event is full', 'All spots have been claimed. Check back for future events.');
    } else {
      rsvp(event.id);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    backBtn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    backText: { fontSize: FontSize.sm, color: Colors.accent },
    scroll: { flex: 1 },
    content: { paddingBottom: 140 },
    hero: {
      marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
      backgroundColor: Colors.surface, borderRadius: Radius.xl,
      borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    },
    heroBar: { height: 4, backgroundColor: cfg.color },
    heroPadding: { padding: Spacing.lg, gap: Spacing.md },
    typePill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: cfg.softColor, paddingHorizontal: Spacing.sm,
      paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start',
    },
    typePillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: cfg.color },
    heroTitle: { fontSize: 24, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.5 },
    metaGrid: { gap: Spacing.sm },
    metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
    metaText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
    sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    card: {
      backgroundColor: Colors.surface, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
    },
    hostRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    hostInfo: { flex: 1, gap: 2 },
    hostName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
    ambassadorBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: Spacing.sm,
      paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start',
    },
    ambassadorText: { fontSize: 11, fontWeight: FontWeight.semibold, color: '#F59E0B' },
    hostMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
    descText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
    capacityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    capacityLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
    capacityCount: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: spotsLeft <= 5 ? Colors.orange : Colors.text },
    track: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: fillPct > 0.85 ? Colors.orange : cfg.color, borderRadius: 3, width: `${fillPct * 100}%` as any },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: {
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.full,
      borderWidth: 1, borderColor: Colors.border,
      paddingHorizontal: Spacing.md, paddingVertical: 5,
    },
    tagText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border,
      padding: Spacing.lg, paddingBottom: 34,
    },
    rsvpBtn: {
      backgroundColor: Colors.accent, borderRadius: Radius.lg,
      padding: Spacing.md + 2, alignItems: 'center', justifyContent: 'center',
      flexDirection: 'row', gap: Spacing.sm,
    },
    rsvpBtnFull: { backgroundColor: Colors.border },
    rsvpBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    goingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
    goingBadge: {
      flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.greenSoft, borderRadius: Radius.lg,
      padding: Spacing.md + 2, justifyContent: 'center',
    },
    goingText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.green },
    cancelBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2,
      borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.red + '66',
      backgroundColor: Colors.surface,
    },
    cancelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.red },
    friendRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    friendRowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
    friendInfo: { flex: 1, gap: 2 },
    friendName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    friendMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
    notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    notFoundText: { fontSize: FontSize.lg, color: Colors.textMuted },
    sponsorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    sponsorIcon: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: Colors.accent + '1A', alignItems: 'center', justifyContent: 'center',
    },
    sponsorInfo: { flex: 1, gap: 2 },
    sponsorName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    sponsorRole: { fontSize: FontSize.xs, color: Colors.textMuted },
    sponsorEmail: { fontSize: FontSize.xs, color: Colors.accent },
    sponsorDivider: { height: 1, backgroundColor: Colors.borderSubtle },
    safetyBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      backgroundColor: Colors.accent + '0D', borderRadius: Radius.md,
      borderWidth: 1, borderColor: Colors.accent + '33', padding: Spacing.md, marginBottom: Spacing.sm,
    },
    safetyText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
  }), [Colors, cfg, fillPct, spotsLeft]);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFoundWrap}>
          <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/events')}>
        <Ionicons name="chevron-back" size={18} color={Colors.accent} />
        <Text style={styles.backText}>Events</Text>
      </Pressable>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBar} />
          <View style={styles.heroPadding}>
            <View style={styles.typePill}>
              <Ionicons name={cfg.icon} size={11} color={cfg.color} />
              <Text style={styles.typePillText}>{cfg.label}</Text>
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.metaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.metaText}>
                  {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={15} color={Colors.textMuted} />
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Host */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosted by</Text>
          <Pressable
            style={styles.card}
            onPress={() => host && router.push(`/user/${host.id}`)}
          >
            <View style={styles.hostRow}>
              <Avatar initials={event.hostInitials} color={event.hostAvatarColor} size={44} />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{event.hostName}</Text>
                {host && <Text style={styles.hostMeta}>{host.major} · {host.year}</Text>}
                <View style={styles.ambassadorBadge}>
                  <Ionicons name="star" size={10} color="#F59E0B" />
                  <Text style={styles.ambassadorText}>Ambassador</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </Pressable>
        </View>

        {/* Sponsors */}
        {event.sponsors && event.sponsors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adult Sponsors</Text>
            <View style={styles.safetyBanner}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accent} style={{ marginTop: 1 }} />
              <Text style={styles.safetyText}>
                This event has a verified adult sponsor — a teacher, faculty member, or parent volunteer overseeing the event.
              </Text>
            </View>
            <View style={styles.card}>
              {event.sponsors.map((sponsor, i) => (
                <View key={i}>
                  {i > 0 && <View style={styles.sponsorDivider} />}
                  <View style={[styles.sponsorRow, i > 0 && { marginTop: Spacing.md }]}>
                    <View style={styles.sponsorIcon}>
                      <Ionicons name="person" size={16} color={Colors.accent} />
                    </View>
                    <View style={styles.sponsorInfo}>
                      <Text style={styles.sponsorName}>{sponsor.name}</Text>
                      <Text style={styles.sponsorRole}>{sponsor.role}</Text>
                      <Text style={styles.sponsorEmail}>{sponsor.email}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Friends Going */}
        {friendsGoing.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {friendsGoing.length === 1 ? '1 Connection Going' : `${friendsGoing.length} Connections Going`}
            </Text>
            <View style={styles.card}>
              {friendsGoing.map((friend, i) => (
                <Pressable
                  key={friend.id}
                  style={[styles.friendRow, i < friendsGoing.length - 1 && styles.friendRowDivider]}
                  onPress={() => router.push(`/user/${friend.id}`)}
                >
                  <Avatar initials={friend.initials} color={friend.avatarColor} size={40} />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendMeta}>{friend.school} · {friend.year}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.descText}>{event.description}</Text>
          </View>
        </View>

        {/* Capacity */}
        {!event.isPast && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.card}>
              <View style={styles.capacityRow}>
                <Text style={styles.capacityLabel}>{total} of {event.capacity} spots filled</Text>
                <Text style={styles.capacityCount}>
                  {isFull ? 'Full' : `${spotsLeft} left`}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={styles.fill} />
              </View>
            </View>
          </View>
        )}

        {event.isPast && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.card}>
              <Text style={styles.descText}>{total} students attended this event.</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsRow}>
            {event.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {!event.isPast && (
        <View style={styles.footer}>
          {isRsvped ? (
            <View style={styles.goingRow}>
              <View style={styles.goingBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                <Text style={styles.goingText}>You're going</Text>
              </View>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => cancelRsvp(event.id)}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.red} />
                <Text style={styles.cancelText}>Cancel RSVP</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.rsvpBtn, isFull && styles.rsvpBtnFull]}
              onPress={handleRsvp}
            >
              <Ionicons
                name={isFull ? 'close-circle-outline' : 'calendar'}
                size={18}
                color="#fff"
              />
              <Text style={styles.rsvpBtnText}>
                {isFull ? 'Event is full' : 'RSVP for this event'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
