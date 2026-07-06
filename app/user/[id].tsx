import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../../src/constants/theme';
import { ColorPalette } from '../../src/constants/themes';
import { STUDENTS } from '../../src/data/students';
import { useColors } from '../../src/hooks/useColors';
import { useGuestGuard } from '../../src/hooks/useGuestGuard';
import { useVerification } from '../../src/hooks/useVerification';
import { useConnectionsStore } from '../../src/store/connections';
import { useMessagesStore } from '../../src/store/messages';
import { PortfolioSnapshot } from '../../src/types/portfolio';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    error: { color: C.textMuted, textAlign: 'center', marginTop: 100 },
    content: { paddingBottom: 60 },
    hero: { alignItems: 'center', paddingTop: 80, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
    name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.3, marginTop: Spacing.sm },
    major: { fontSize: FontSize.sm, color: C.textSecondary },
    school: { fontSize: FontSize.sm, color: C.textMuted },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceText: { fontSize: FontSize.xs, color: C.textMuted },
    openBadge: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
      backgroundColor: C.greenSoft, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs, borderRadius: Radius.full,
      borderWidth: 1, borderColor: C.green + '33', marginTop: Spacing.xs,
    },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
    openText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: C.green },
    bioCard: {
      marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
      padding: Spacing.lg, backgroundColor: C.surface,
      borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border,
    },
    bio: { fontSize: FontSize.md, color: C.textSecondary, lineHeight: 24 },
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    projectCard: { backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg, gap: Spacing.sm },
    projectName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    projectDesc: { fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: { backgroundColor: C.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: C.border },
    tagText: { fontSize: FontSize.sm, color: C.textSecondary, fontWeight: FontWeight.medium },
    skillTag: { backgroundColor: C.accentSoft, borderColor: C.accent + '33' },
    skillText: { color: C.accent },
    connectSection: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.md },
    connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    btnPressed: { opacity: 0.85 },
    connectBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
    connectedBanner: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, backgroundColor: C.greenSoft, borderWidth: 1,
      borderColor: C.green + '33', paddingVertical: Spacing.lg, borderRadius: Radius.lg,
    },
    connectedText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.green },
    requestedBanner: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, backgroundColor: C.greenSoft, borderWidth: 1,
      borderColor: C.green + '33', paddingVertical: Spacing.lg, borderRadius: Radius.lg,
    },
    requestedText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: C.green, flexShrink: 1 },
    portfolioWrap: { backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    portfolioExpRow: { padding: Spacing.md, gap: 5 },
    portfolioExpBorder: { borderTopWidth: 1, borderTopColor: C.borderSubtle },
    portfolioExpHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    portfolioTypePill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    portfolioTypeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
    portfolioExpDate: { fontSize: FontSize.xs, color: C.textMuted },
    portfolioExpTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: C.text, marginTop: 2 },
    portfolioExpRole: { fontSize: FontSize.xs, color: C.textSecondary, fontWeight: FontWeight.medium },
    portfolioOutcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    portfolioOutcomeText: { fontSize: FontSize.xs, color: C.orange, fontWeight: FontWeight.medium },
    skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    portfolioMore: { fontSize: FontSize.xs, color: C.textMuted, fontStyle: 'italic', padding: Spacing.md, paddingTop: 0 },
    messageBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, backgroundColor: C.accentSoft, paddingVertical: Spacing.lg,
      borderRadius: Radius.lg, borderWidth: 1, borderColor: C.accent + '44',
    },
    messageBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.accent },
  });
}

type Styles = ReturnType<typeof createStyles>;

export default function UserDetailScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isVerified } = useVerification();
  const student = STUDENTS.find((s) => s.id === id);
  const { openConnectModal, getStatus } = useConnectionsStore();
  const conversations = useMessagesStore((s) => s.conversations);
  const guard = useGuestGuard();

  const promptVerify = (action: string) => {
    Alert.alert(
      'Verify your student status',
      `You need to verify you're a student before you can ${action}.`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Verify →', onPress: () => router.push('/verify') },
      ]
    );
  };

  const EXP_COLORS: Record<string, string> = {
    project: Colors.purple, hackathon: Colors.orange, research: Colors.blue,
    startup: Colors.accent, internship: Colors.teal, club: Colors.green, other: Colors.textMuted,
  };

  const sharedPortfolio: PortfolioSnapshot | null = (() => {
    const convo = conversations.find((c) => c.participantId === id);
    if (!convo) return null;
    const msgs = [...convo.messages].reverse();
    const found = msgs.find((m) => m.type === 'portfolio' && m.senderId !== 'me' && m.portfolio);
    return found?.portfolio ?? null;
  })();

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Student not found</Text>
      </SafeAreaView>
    );
  }

  const status = getStatus(student.id);
  const isPending = status === 'pending';
  const isConnected = status === 'connected';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Avatar initials={student.initials} color={student.avatarColor} size={80} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.name}>{student.name}</Text>
            {student.verified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#22C55E22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 }}>
                <Ionicons name="shield-checkmark" size={11} color="#22C55E" />
                <Text style={{ fontSize: 10, fontWeight: FontWeight.semibold, color: '#22C55E' }}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.major}>{student.major} · {student.year}</Text>
          {isVerified ? (
            <Text style={styles.school}>{student.school}</Text>
          ) : (
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={() => promptVerify('see student institutions')}>
              <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
              <Text style={[styles.school, { fontStyle: 'italic' }]}>Verify to see institution</Text>
            </Pressable>
          )}
          {student.distance && (
            <View style={styles.distanceRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.distanceText}>{student.distance}</Text>
            </View>
          )}
          {student.openToCollaborate && (
            <View style={styles.openBadge}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open to collaborate</Text>
            </View>
          )}
        </View>

        <View style={styles.bioCard}>
          <Text style={styles.bio}>{student.bio}</Text>
        </View>

        {student.currentProject && (
          <Section styles={styles} Colors={Colors} title="Current Project" icon="code-slash-outline">
            <View style={styles.projectCard}>
              <Text style={styles.projectName}>{student.currentProject}</Text>
              {student.projectDescription && <Text style={styles.projectDesc}>{student.projectDescription}</Text>}
            </View>
          </Section>
        )}

        <Section styles={styles} Colors={Colors} title="Interests" icon="heart-outline">
          <View style={styles.tagWrap}>
            {student.interests.map((interest) => (
              <View key={interest} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section styles={styles} Colors={Colors} title="Skills" icon="sparkles-outline">
          <View style={styles.tagWrap}>
            {student.skills.map((skill) => (
              <View key={skill} style={[styles.tag, styles.skillTag]}>
                <Text style={[styles.tagText, styles.skillText]}>{skill}</Text>
              </View>
            ))}
          </View>
        </Section>

        {sharedPortfolio ? (
          <Section styles={styles} Colors={Colors} title="Portfolio" icon="briefcase-outline">
            <View style={styles.portfolioWrap}>
              {sharedPortfolio.experiences.slice(0, 3).map((exp, i) => (
                <View key={exp.id} style={[styles.portfolioExpRow, i > 0 && styles.portfolioExpBorder]}>
                  <View style={styles.portfolioExpHeader}>
                    <View style={[styles.portfolioTypePill, { backgroundColor: EXP_COLORS[exp.type] + '22' }]}>
                      <Text style={[styles.portfolioTypeText, { color: EXP_COLORS[exp.type] }]}>{exp.type}</Text>
                    </View>
                    <Text style={styles.portfolioExpDate}>
                      {exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`}
                    </Text>
                  </View>
                  <Text style={styles.portfolioExpTitle}>{exp.title}</Text>
                  <Text style={styles.portfolioExpRole}>{exp.role}</Text>
                  {exp.outcome ? (
                    <View style={styles.portfolioOutcomeRow}>
                      <Ionicons name="trophy-outline" size={11} color={Colors.orange} />
                      <Text style={styles.portfolioOutcomeText}>{exp.outcome}</Text>
                    </View>
                  ) : null}
                  {exp.skills.length > 0 && (
                    <View style={styles.skillWrap}>
                      {exp.skills.slice(0, 4).map((s) => (
                        <View key={s} style={[styles.tag, styles.skillTag]}>
                          <Text style={[styles.tagText, styles.skillText]}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {sharedPortfolio.experiences.length > 3 && (
                <Text style={styles.portfolioMore}>+{sharedPortfolio.experiences.length - 3} more experiences</Text>
              )}
            </View>
          </Section>
        ) : null}

        <View style={styles.connectSection}>
          {isConnected ? (
            <View style={styles.connectedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.connectedText}>Connected with {student.name.split(' ')[0]}</Text>
            </View>
          ) : student.openToCollaborate && (
            isPending ? (
              <View style={styles.requestedBanner}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                <Text style={styles.requestedText}>Request sent — waiting for {student.name.split(' ')[0]} to accept</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.connectBtn, pressed && styles.btnPressed]}
                onPress={() => isVerified
                  ? guard('connect with other students', () => openConnectModal(student), { blocking: true })
                  : promptVerify('connect with other students')}
              >
                <Ionicons name="person-add-outline" size={16} color="#fff" />
                <Text style={styles.connectBtnText}>Connect with {student.name.split(' ')[0]}</Text>
              </Pressable>
            )
          )}
          <Pressable
            style={({ pressed }) => [styles.messageBtn, pressed && styles.btnPressed]}
            onPress={() => isVerified ? router.push(`/conversation/${student.id}`) : promptVerify('message other students')}
          >
            <Ionicons name="mail-outline" size={16} color={Colors.accent} />
            <Text style={styles.messageBtnText}>Send Message</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children, styles, Colors }: { title: string; icon: string; children: React.ReactNode; styles: Styles; Colors: ColorPalette }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={14} color={Colors.textMuted} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
