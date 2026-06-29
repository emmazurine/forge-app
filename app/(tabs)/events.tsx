import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { Logo } from '../../src/components/ui/Logo';
import { UnderlineTabs } from '../../src/components/ui/UnderlineTabs';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { EVENTS } from '../../src/data/events';
import { useColors } from '../../src/hooks/useColors';
import { useEventsStore } from '../../src/store/events';
import { ForgeEvent, EventType } from '../../src/types/event';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { STUDENTS } from '../../src/data/students';
import { useConnectionsStore } from '../../src/store/connections';
import { useAmbassadorStore } from '../../src/store/ambassador';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

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
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface EventCardProps { event: ForgeEvent }

function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const Colors = useColors();
  const { rsvpedIds, cancelRsvp } = useEventsStore();
  const connections = useConnectionsStore((s) => s.connections);
  const isRsvped = rsvpedIds.includes(event.id);
  const cfg = TYPE_CONFIG[event.type];
  const total = event.rsvpIds.length + (isRsvped && !event.rsvpIds.includes('me') ? 1 : 0);
  const spotsLeft = event.capacity - total;
  const fillPct = Math.min(total / event.capacity, 1);

  const friendsGoing = useMemo(() => {
    const connectedIds = Object.entries(connections)
      .filter(([, status]) => status === 'connected')
      .map(([id]) => id);
    return STUDENTS.filter(
      (s) => connectedIds.includes(s.id) && event.rsvpIds.includes(s.id)
    );
  }, [connections, event.rsvpIds]);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      overflow: 'hidden',
    },
    pressed: { opacity: 0.75 },
    typeBar: { height: 3, backgroundColor: cfg.color },
    inner: { padding: Spacing.lg, gap: Spacing.md },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    typePill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: cfg.softColor, paddingHorizontal: Spacing.sm,
      paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start',
    },
    typePillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: cfg.color },
    titleArea: { flex: 1, gap: 3 },
    title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dateText: { fontSize: FontSize.xs, color: Colors.textMuted },
    hostRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    hostName: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
    ambassadorBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 7,
      paddingVertical: 2, borderRadius: Radius.full,
    },
    ambassadorText: { fontSize: 10, fontWeight: FontWeight.semibold, color: '#F59E0B' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    locationText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
    capacityArea: { gap: 6 },
    capacityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    capacityText: { fontSize: FontSize.xs, color: Colors.textMuted },
    capacityCount: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: spotsLeft <= 5 ? Colors.orange : Colors.textSecondary },
    track: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: fillPct > 0.85 ? Colors.orange : cfg.color, borderRadius: 2, width: `${fillPct * 100}%` as any },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    friendsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    friendAvatarStack: { flexDirection: 'row' },
    friendAvatarWrap: { borderWidth: 1.5, borderColor: Colors.surface, borderRadius: 11 },
    friendsText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1, lineHeight: 16 },
    friendsDivider: { height: 1, backgroundColor: Colors.borderSubtle },
    rsvpBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: Colors.greenSoft, paddingHorizontal: Spacing.md,
      paddingVertical: 6, borderRadius: Radius.full,
    },
    rsvpText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.green },
    seeMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeMoreText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.accent },
    pastLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  }), [Colors, cfg, fillPct, spotsLeft]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      <View style={styles.typeBar} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.typePill}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            <Text style={styles.typePillText}>{cfg.label}</Text>
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.dateText}>{formatDate(event.date)} · {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.hostRow}>
          <Avatar initials={event.hostInitials} color={event.hostAvatarColor} size={22} />
          <Text style={styles.hostName}>{event.hostName}</Text>
          <View style={styles.ambassadorBadge}>
            <Ionicons name="star" size={9} color="#F59E0B" />
            <Text style={styles.ambassadorText}>Ambassador</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>{event.location}</Text>
        </View>

        {!event.isPast && (
          <View style={styles.capacityArea}>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityText}>{total} going</Text>
              <Text style={styles.capacityCount}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={styles.fill} />
            </View>
          </View>
        )}

        {friendsGoing.length > 0 && (
          <>
            <View style={styles.friendsDivider} />
            <View style={styles.friendsRow}>
              <View style={styles.friendAvatarStack}>
                {friendsGoing.slice(0, 3).map((s, i) => (
                  <View key={s.id} style={[styles.friendAvatarWrap, i > 0 && { marginLeft: -8 }]}>
                    <Avatar initials={s.initials} color={s.avatarColor} size={22} />
                  </View>
                ))}
              </View>
              <Text style={styles.friendsText}>
                {friendsGoing.length === 1
                  ? `${friendsGoing[0].name.split(' ')[0]} is going`
                  : friendsGoing.length === 2
                  ? `${friendsGoing[0].name.split(' ')[0]} & ${friendsGoing[1].name.split(' ')[0]} are going`
                  : `${friendsGoing[0].name.split(' ')[0]} + ${friendsGoing.length - 1} connections going`}
              </Text>
            </View>
          </>
        )}

        <View style={styles.bottomRow}>
          {event.isPast ? (
            <Text style={styles.pastLabel}>{total} attended</Text>
          ) : isRsvped ? (
            <Pressable
              style={styles.rsvpBadge}
              onPress={() => cancelRsvp(event.id)}
            >
              <Ionicons name="checkmark-circle" size={13} color={Colors.green} />
              <Text style={styles.rsvpText}>You're going · Cancel</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable style={styles.seeMoreBtn} onPress={() => router.push(`/event/${event.id}`)}>
            <Text style={styles.seeMoreText}>{event.isPast ? 'View recap' : 'See details'}</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.accent} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function EventsScreen() {
  const Colors = useColors();
  const router = useRouter();
  const ambassadorStatus = useAmbassadorStore((s) => s.status);
  const submittedEvents = useEventsStore((s) => s.submittedEvents);
  const [activeTab, setActiveTab] = useState('upcoming');

  const allEvents = useMemo(() => [...EVENTS, ...submittedEvents], [submittedEvents]);

  const filtered = useMemo(
    () => allEvents.filter((e) => (activeTab === 'past' ? e.isPast : !e.isPast)),
    [allEvents, activeTab]
  );

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.8, marginBottom: 4 },
    subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
    ambassadorNote: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: Radius.md,
      borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
      padding: Spacing.md,
    },
    ambassadorNoteText: { fontSize: FontSize.xs, color: '#F59E0B', flex: 1, lineHeight: 18 },
    list: { flex: 1 },
    listContent: { paddingTop: Spacing.lg, paddingBottom: 120 },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
    ambassadorCta: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      marginHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderRadius: Radius.xl, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.2)',
    },
    ambassadorCtaIcon: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: 'rgba(245,158,11,0.15)',
      alignItems: 'center', justifyContent: 'center',
    },
    ambassadorCtaInfo: { flex: 1, gap: 3 },
    ambassadorCtaTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
    ambassadorCtaDesc: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 17 },
  }), [Colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="md" showWordmark={false} />
          <View>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>Hosted by ambassadors</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {ambassadorStatus === 'approved' && (
            <Pressable
              onPress={() => router.push('/event/create')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: Colors.accent, borderRadius: Radius.md,
                paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
              }}
            >
              <Ionicons name="add" size={15} color="#fff" />
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' }}>Create</Text>
            </Pressable>
          )}
          <NotificationBell />
        </View>
      </View>

      <View style={styles.ambassadorNote}>
        <Ionicons name="star" size={14} color="#F59E0B" />
        <Text style={styles.ambassadorNoteText}>
          Events are hosted by verified student Ambassadors — real people, real places.
        </Text>
      </View>

      <UnderlineTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((event) => <EventCard key={event.id} event={event} />)}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon</Text>
          </View>
        )}

        {activeTab === 'upcoming' && ambassadorStatus === 'approved' && (
          <Pressable style={styles.ambassadorCta} onPress={() => router.push('/event/create')}>
            <View style={styles.ambassadorCtaIcon}>
              <Ionicons name="add-circle-outline" size={22} color="#F59E0B" />
            </View>
            <View style={styles.ambassadorCtaInfo}>
              <Text style={styles.ambassadorCtaTitle}>Host your own event</Text>
              <Text style={styles.ambassadorCtaDesc}>
                As an Ambassador, you can run lock-ins, hackathons, workshops, and more. You'll need an adult sponsor.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
          </Pressable>
        )}
        {activeTab === 'upcoming' && ambassadorStatus !== 'approved' && (
          <Pressable style={styles.ambassadorCta} onPress={() => ambassadorStatus !== 'pending' && router.push('/ambassador-apply')}>
            <View style={styles.ambassadorCtaIcon}>
              <Ionicons name="star-outline" size={22} color="#F59E0B" />
            </View>
            <View style={styles.ambassadorCtaInfo}>
              <Text style={styles.ambassadorCtaTitle}>
                {ambassadorStatus === 'pending' ? 'Application under review' : 'Want to host events?'}
              </Text>
              <Text style={styles.ambassadorCtaDesc}>
                {ambassadorStatus === 'pending'
                  ? "We'll be in touch soon about your Ambassador application."
                  : 'Apply to become an Ambassador and run your own lock-ins, hackathons, and more.'}
              </Text>
            </View>
            {ambassadorStatus !== 'pending' && (
              <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
