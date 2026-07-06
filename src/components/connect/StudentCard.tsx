import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { useGuestGuard } from '../../hooks/useGuestGuard';
import { useVerification } from '../../hooks/useVerification';
import { useConnectionsStore } from '../../store/connections';
import { Student } from '../../types/user';
import { Avatar } from '../ui/Avatar';

interface StudentCardProps {
  student: Student;
  isMe?: boolean;
}

export function StudentCard({ student, isMe }: StudentCardProps) {
  const router = useRouter();
  const Colors = useColors();
  const { isVerified } = useVerification();
  const { openConnectModal, getStatus } = useConnectionsStore();
  const guard = useGuestGuard();
  const status = isMe ? null : getStatus(student.id);
  const isPending = status === 'pending';
  const isConnected = status === 'connected';

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
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    headerInfo: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
    name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#22C55E22', paddingHorizontal: Spacing.xs + 2, paddingVertical: 2, borderRadius: Radius.full },
    verifiedBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: '#22C55E' },
    ambassadorBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: Spacing.xs + 2, paddingVertical: 2, borderRadius: Radius.full },
    ambassadorBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: '#F59E0B' },
    schoolLocked: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    schoolLockedText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
    openBadge: {
      backgroundColor: Colors.greenSoft,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    openText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: Colors.green },
    school: { fontSize: FontSize.sm, color: Colors.textSecondary },
    schoolName: { fontSize: FontSize.xs, color: Colors.textMuted },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    distanceText: { fontSize: FontSize.xs, color: Colors.textMuted },
    bio: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
    project: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: Colors.accentSoft,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 1,
      borderRadius: Radius.md,
      alignSelf: 'flex-start',
    },
    projectName: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.accent },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    interests: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    interestTag: {
      backgroundColor: Colors.surfaceElevated,
      paddingHorizontal: Spacing.md,
      paddingVertical: 4,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: Colors.borderSubtle,
    },
    interestText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    moreText: { fontSize: FontSize.xs, color: Colors.textMuted, alignSelf: 'center', paddingHorizontal: 4 },
    connectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: Colors.accentSoft,
      borderWidth: 1,
      borderColor: Colors.accent + '44',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      flexShrink: 0,
    },
    connectBtnPending: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.border },
    connectBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.accent },
    connectBtnTextPending: { color: Colors.textMuted },
    connectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: Colors.greenSoft,
      borderWidth: 1,
      borderColor: Colors.green + '33',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      flexShrink: 0,
    },
    connectedText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.green },
    youBadge: {
      backgroundColor: Colors.accentSoft,
      borderWidth: 1,
      borderColor: Colors.accent + '44',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      flexShrink: 0,
    },
    youBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.accent },
  }), [Colors]);

  const handleConnect = () => {
    if (isPending || isConnected) return;
    if (!isVerified) {
      Alert.alert(
        'Verify your student status',
        'You need to verify you\'re a student before connecting with others.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Verify →', onPress: () => router.push('/verify') },
        ]
      );
      return;
    }
    guard('connect with other students', () => openConnectModal(student), { blocking: true });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => isMe ? router.push('/(tabs)/profile') : router.push(`/user/${student.id}`)}
    >
      <View style={styles.header}>
        <Avatar initials={student.initials} color={student.avatarColor} size={44} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{isMe ? `${student.name} (You)` : student.name}</Text>
            {student.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#22C55E" />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
            {student.isAmbassador && (
              <View style={styles.ambassadorBadge}>
                <Ionicons name="star" size={9} color="#F59E0B" />
                <Text style={styles.ambassadorBadgeText}>Ambassador</Text>
              </View>
            )}
            {student.openToCollaborate && !isMe && (
              <View style={styles.openBadge}>
                <Text style={styles.openText}>Open</Text>
              </View>
            )}
          </View>
          <Text style={styles.school} numberOfLines={1}>
            {student.major} · {student.year}
          </Text>
          {isMe || isVerified ? (
            <Text style={styles.schoolName} numberOfLines={1}>{student.school}</Text>
          ) : (
            <View style={styles.schoolLocked}>
              <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
              <Text style={styles.schoolLockedText}>Verify to see institution</Text>
            </View>
          )}
        </View>
        {student.distance && !isMe && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.distanceText}>{student.distance}</Text>
          </View>
        )}
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {student.bio}
      </Text>

      {student.currentProject && (
        <View style={styles.project}>
          <Ionicons name="code-slash-outline" size={13} color={Colors.accent} />
          <Text style={styles.projectName} numberOfLines={1}>
            {student.currentProject}
          </Text>
        </View>
      )}

      <View style={styles.cardBottom}>
        <View style={styles.interests}>
          {student.interests.slice(0, 3).map((interest) => (
            <View key={interest} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {student.interests.length > 3 && (
            <Text style={styles.moreText}>+{student.interests.length - 3}</Text>
          )}
        </View>

        {isMe ? (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>View Profile</Text>
          </View>
        ) : isConnected ? (
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.green} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        ) : student.openToCollaborate ? (
          <Pressable
            style={[styles.connectBtn, isPending && styles.connectBtnPending]}
            onPress={handleConnect}
            hitSlop={8}
          >
            <Ionicons
              name={isPending ? 'checkmark-circle' : 'person-add-outline'}
              size={13}
              color={isPending ? Colors.textMuted : Colors.accent}
            />
            <Text style={[styles.connectBtnText, isPending && styles.connectBtnTextPending]}>
              {isPending ? 'Requested' : 'Connect'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
