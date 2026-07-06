import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { useGuestGuardStore } from '../../store/guestGuard';

function createStyles(Colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    backdrop: { ...StyleSheet.absoluteFillObject },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.xl,
      gap: Spacing.lg,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: Colors.orangeSoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.orange + '33',
      alignSelf: 'center',
    },
    title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
    body: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    signUpBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: Colors.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg,
    },
    btnPressed: { opacity: 0.85 },
    signUpText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
    guestBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
    guestText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  });
}

export function GuestGuardModal() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const router = useRouter();
  const { actionLabel, onProceed, blocking, dismiss } = useGuestGuardStore();
  const isVisible = !!actionLabel;

  const handleContinueAsGuest = () => {
    const proceed = onProceed;
    dismiss();
    proceed?.();
  };

  const handleSignUp = () => {
    dismiss();
    router.push('/login');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={dismiss} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={24} color={Colors.orange} />
          </View>
          <Text style={styles.title}>{blocking ? 'Create an account to continue' : "You're not logged in"}</Text>
          <Text style={styles.body}>
            {actionLabel
              ? blocking
                ? `You need an account to ${actionLabel}.`
                : `If you ${actionLabel} without an account, you could lose it if you refresh the page or switch browsers.`
              : ''}
          </Text>
          <Pressable style={({ pressed }) => [styles.signUpBtn, pressed && styles.btnPressed]} onPress={handleSignUp}>
            <Ionicons name="person-add-outline" size={16} color="#fff" />
            <Text style={styles.signUpText}>{blocking ? 'Sign Up' : 'Sign Up to Save'}</Text>
          </Pressable>
          <Pressable style={styles.guestBtn} onPress={blocking ? dismiss : handleContinueAsGuest}>
            <Text style={styles.guestText}>{blocking ? 'Cancel' : 'Continue as Guest'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
