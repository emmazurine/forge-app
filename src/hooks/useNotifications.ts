import { useMemo } from 'react';
import { EVENTS } from '../data/events';
import { STUDENTS } from '../data/students';
import { useCollaborationsStore } from '../store/collaborations';
import { useConnectionsStore } from '../store/connections';
import { useEventsStore } from '../store/events';
import { useMessagesStore } from '../store/messages';
import { SEEDED_NOTIFICATIONS, useNotificationsStore } from '../store/notifications';
import { AppNotification } from '../types/notification';

export function useAllNotifications(): AppNotification[] {
  const incomingRequests = useConnectionsStore((s) => s.incomingRequests);
  const conversations = useMessagesStore((s) => s.conversations);
  const rsvpedIds = useEventsStore((s) => s.rsvpedIds);
  const posts = useCollaborationsStore((s) => s.posts);

  return useMemo(() => {
    const all: AppNotification[] = [];

    for (const reqId of incomingRequests) {
      const student = STUDENTS.find((s) => s.id === reqId);
      if (!student) continue;
      all.push({
        id: `conn-req-${reqId}`,
        type: 'connection_request',
        title: `${student.name} wants to connect`,
        body: `${student.major} · ${student.year}`,
        timestamp: Date.now() - 5 * 60 * 1000,
        href: '/(tabs)/profile',
        avatarInitials: student.initials,
        avatarColor: student.avatarColor,
      });
    }

    for (const conv of conversations) {
      const last = conv.messages[conv.messages.length - 1];
      if (!last || last.senderId === 'me') continue;
      all.push({
        id: `msg-${conv.id}`,
        type: 'message',
        title: `New message from ${conv.participantName}`,
        body: last.text.length > 60 ? last.text.slice(0, 60) + '…' : last.text,
        timestamp: conv.updatedAt,
        href: `/conversation/${conv.id}`,
        avatarInitials: conv.participantInitials,
        avatarColor: conv.participantAvatarColor,
      });
    }

    for (const event of EVENTS) {
      if (!rsvpedIds.includes(event.id) || event.isPast) continue;
      const eventDate = new Date(event.date + 'T12:00:00');
      const daysAway = Math.ceil((eventDate.getTime() - Date.now()) / 86_400_000);
      if (daysAway < 0 || daysAway > 14) continue;
      const when = daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;
      all.push({
        id: `event-rem-${event.id}`,
        type: 'event_reminder',
        title: `"${event.title}" is ${when}`,
        body: `${event.startTime} · ${event.location.split(',')[0]}`,
        timestamp: Date.now() - 30 * 60 * 1000,
        href: `/event/${event.id}`,
      });
    }

    for (const post of posts) {
      if (post.userId !== 'me' || post.applicantCount === 0) continue;
      all.push({
        id: `post-int-${post.id}`,
        type: 'post_interest',
        title: `${post.applicantCount} people interested in your post`,
        body: `"${post.title}"`,
        timestamp: Date.now() - 2 * 3_600_000,
        href: '/(tabs)/collaborate',
      });
    }

    all.push(...SEEDED_NOTIFICATIONS);
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }, [incomingRequests, conversations, rsvpedIds, posts]);
}

export function useUnreadCount(): number {
  const all = useAllNotifications();
  const lastViewedAt = useNotificationsStore((s) => s.lastViewedAt);
  return all.filter((n) => n.timestamp > lastViewedAt).length;
}
