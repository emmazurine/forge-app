import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Avatar } from '../../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { ColorPalette } from '../../src/constants/themes';
import { STUDENTS } from '../../src/data/students';
import { useColors } from '../../src/hooks/useColors';
import { useGuestGuard } from '../../src/hooks/useGuestGuard';
import { useMessagesStore } from '../../src/store/messages';
import { useOnboardingStore } from '../../src/store/onboarding';
import { usePortfolioStore } from '../../src/store/portfolio';
import { useProfileStore } from '../../src/store/profile';
import { Message } from '../../src/types/message';
import { formatRelativeTime } from '../../src/utils/time';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    flex: { flex: 1 },
    error: { color: C.textMuted, textAlign: 'center', marginTop: 100 },
    customHeader: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
    headerInner: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    headerName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    headerSchool: { fontSize: FontSize.xs, color: C.textMuted },
    messageList: { flex: 1 },
    messageListContent: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
      gap: Spacing.sm,
      flexGrow: 1,
    },
    emptyThread: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 80 },
    emptyName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: C.text, marginTop: Spacing.sm },
    emptySchool: { fontSize: FontSize.sm, color: C.textMuted },
    emptyBio: {
      fontSize: FontSize.sm,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 280,
      marginTop: Spacing.xs,
    },
    emptyHint: { fontSize: FontSize.sm, color: C.textMuted, marginTop: Spacing.sm },
    bubbleRow: { alignItems: 'flex-start', gap: 3 },
    bubbleRowMe: { alignItems: 'flex-end' },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: Spacing.md + 2,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.xl,
    },
    bubbleThem: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderBottomLeftRadius: Radius.sm,
    },
    bubbleMe: { backgroundColor: C.accent, borderBottomRightRadius: Radius.sm },
    bubbleText: { fontSize: FontSize.md, color: C.text, lineHeight: 22 },
    bubbleTextMe: { color: '#fff' },
    bubbleTime: { fontSize: FontSize.xs, color: C.textMuted, marginLeft: Spacing.xs },
    bubbleTimeMe: { marginLeft: 0, marginRight: Spacing.xs },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: C.border,
      backgroundColor: C.bg,
    },
    input: {
      flex: 1,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm + 2,
      paddingBottom: Spacing.sm + 2,
      color: C.text,
      fontSize: FontSize.md,
      maxHeight: 120,
      lineHeight: 22,
    },
    sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    sendBtnPressed: { opacity: 0.85 },
    portfolioBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    portfolioCard: {
      maxWidth: '88%',
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    portfolioCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    portfolioAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    portfolioAvatarText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
    portfolioCardMeta: { flex: 1, gap: 2 },
    portfolioCardName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    portfolioCardSub: { fontSize: FontSize.xs, color: C.textMuted },
    portfolioLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: C.accentSoft,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.full,
    },
    portfolioLabelText: { fontSize: FontSize.xs, color: C.accent, fontWeight: FontWeight.semibold },
    portfolioDivider: { height: 1, backgroundColor: C.borderSubtle },
    portfolioExpRow: { gap: 3 },
    portfolioExpBorder: { paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: C.borderSubtle },
    portfolioExpTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: C.text },
    portfolioExpRole: { fontSize: FontSize.xs, color: C.textSecondary },
    portfolioExpOutcome: { fontSize: FontSize.xs, color: C.orange, fontWeight: FontWeight.medium },
    portfolioMore: { fontSize: FontSize.xs, color: C.textMuted, fontStyle: 'italic' },
    portfolioEmpty: { fontSize: FontSize.sm, color: C.textMuted, fontStyle: 'italic' },
  });
}

export default function ConversationScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const student = STUDENTS.find((s) => s.id === id);
  const { getOrCreate, sendMessage, sendPortfolio, markRead } = useMessagesStore();
  const experiences = usePortfolioStore((s) => s.experiences);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const guard = useGuestGuard();

  const handleSendPortfolio = () => {
    if (!conversation) return;
    guard('message other students', () => {
      const saved = useProfileStore.getState().saved;
      const ob = useOnboardingStore.getState();
      const name = saved?.name.trim() || ob.name.trim() || 'Anonymous';
      const initials = saved?.initials || name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      sendPortfolio(conversation.id, {
        senderName: name,
        senderSchool: saved?.school || ob.school,
        senderMajor: saved?.major || ob.major,
        senderInitials: initials,
        senderAvatarColor: saved?.avatarColor ?? '#6366F1',
        experiences,
        sharedAt: Date.now(),
      });
    });
  };

  const conversation = student
    ? getOrCreate(id, {
        participantName: student.name,
        participantInitials: student.initials,
        participantAvatarColor: student.avatarColor,
        participantSchool: student.school,
      })
    : useMessagesStore.getState().getConversation(id);

  const messages = useMessagesStore((s) =>
    s.conversations.find((c) => c.participantId === id)?.messages ?? []
  );

  useEffect(() => {
    if (conversation) markRead(conversation.id);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !conversation) return;
    guard('message other students', () => {
      sendMessage(conversation.id, trimmed);
      setText('');
    });
  };

  if (!conversation && !student) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Conversation not found</Text>
      </SafeAreaView>
    );
  }

  const participantName = student?.name ?? conversation?.participantName ?? 'Unknown';
  const participantInitials = student?.initials ?? conversation?.participantInitials ?? '?';
  const participantColor = student?.avatarColor ?? conversation?.participantAvatarColor ?? Colors.accent;
  const participantSchool = student?.school ?? conversation?.participantSchool ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: '',
          header: () => (
            <SafeAreaView style={styles.customHeader} edges={['top']}>
              <View style={styles.headerInner}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.headerCenter, pressed && { opacity: 0.75 }]}
                  onPress={() => student && router.push(`/user/${student.id}`)}
                >
                  <Avatar initials={participantInitials} color={participantColor} size={34} />
                  <View>
                    <Text style={styles.headerName}>{participantName}</Text>
                    <Text style={styles.headerSchool}>{participantSchool}</Text>
                  </View>
                </Pressable>
                <View style={styles.backBtn} />
              </View>
            </SafeAreaView>
          ),
        }}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyThread}>
              <Avatar initials={participantInitials} color={participantColor} size={56} />
              <Text style={styles.emptyName}>{participantName}</Text>
              <Text style={styles.emptySchool}>{participantSchool}</Text>
              {student?.bio ? <Text style={styles.emptyBio}>{student.bio}</Text> : null}
              <Text style={styles.emptyHint}>Send a message to start the conversation</Text>
            </View>
          ) : (
            messages.map((msg) => <Bubble key={msg.id} msg={msg} styles={styles} Colors={Colors} />)
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          {experiences.length > 0 && (
            <Pressable style={({ pressed }) => [styles.portfolioBtn, pressed && { opacity: 0.7 }]} onPress={handleSendPortfolio} hitSlop={6}>
              <Ionicons name="briefcase-outline" size={19} color={Colors.textMuted} />
            </Pressable>
          )}
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, !text.trim() && styles.sendBtnDisabled, pressed && text.trim() && styles.sendBtnPressed]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="arrow-up" size={18} color={text.trim() ? '#fff' : Colors.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Styles = ReturnType<typeof createStyles>;

function Bubble({ msg, styles, Colors }: { msg: Message; styles: Styles; Colors: ColorPalette }) {
  const isMe = msg.senderId === 'me';

  if (msg.type === 'portfolio' && msg.portfolio) {
    const p = msg.portfolio;
    return (
      <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioCardHeader}>
            <View style={[styles.portfolioAvatar, { backgroundColor: p.senderAvatarColor + '33', borderColor: p.senderAvatarColor + '55' }]}>
              <Text style={[styles.portfolioAvatarText, { color: p.senderAvatarColor }]}>{p.senderInitials}</Text>
            </View>
            <View style={styles.portfolioCardMeta}>
              <Text style={styles.portfolioCardName}>{p.senderName}</Text>
              <Text style={styles.portfolioCardSub}>{p.senderMajor} · {p.senderSchool}</Text>
            </View>
            <View style={styles.portfolioLabel}>
              <Ionicons name="briefcase-outline" size={12} color={Colors.accent} />
              <Text style={styles.portfolioLabelText}>Portfolio</Text>
            </View>
          </View>

          <View style={styles.portfolioDivider} />

          {p.experiences.length === 0 ? (
            <Text style={styles.portfolioEmpty}>No experiences added yet.</Text>
          ) : (
            p.experiences.slice(0, 3).map((exp, i) => (
              <View key={exp.id} style={[styles.portfolioExpRow, i > 0 && styles.portfolioExpBorder]}>
                <Text style={styles.portfolioExpTitle}>{exp.title}</Text>
                <Text style={styles.portfolioExpRole}>
                  {exp.role} · {exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`}
                </Text>
                {exp.outcome ? <Text style={styles.portfolioExpOutcome}>{exp.outcome}</Text> : null}
              </View>
            ))
          )}
          {p.experiences.length > 3 && (
            <Text style={styles.portfolioMore}>+{p.experiences.length - 3} more experiences</Text>
          )}
        </View>
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{formatRelativeTime(msg.sentAt)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.text}</Text>
      </View>
      <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{formatRelativeTime(msg.sentAt)}</Text>
    </View>
  );
}
