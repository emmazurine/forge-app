import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { useConnectionsStore } from '../../store/connections';
import { Student } from '../../types/user';
import { Avatar } from '../ui/Avatar';

function createStyles(Colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: { flex: 1 },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheet: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.xl,
      paddingBottom: 40,
      paddingTop: Spacing.md,
      gap: Spacing.lg,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: Colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: Spacing.sm,
    },
    studentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    studentInfo: { flex: 1, gap: 2 },
    studentName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
    studentMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
    studentSchool: { fontSize: FontSize.xs, color: Colors.textMuted },
    divider: { height: 1, backgroundColor: Colors.borderSubtle },
    inputLabel: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      color: Colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: -Spacing.sm,
    },
    input: {
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      color: Colors.text,
      fontSize: FontSize.sm,
      lineHeight: 20,
      minHeight: 80,
    },
    sendBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: Colors.accent,
      paddingVertical: Spacing.lg,
      borderRadius: Radius.lg,
    },
    btnPressed: { opacity: 0.85 },
    sendBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
    cancelBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
    cancelBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
    successContainer: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
    successIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: Colors.greenSoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.green + '33',
      marginBottom: Spacing.sm,
    },
    successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.3 },
    successSubtitle: {
      fontSize: FontSize.sm,
      color: Colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: Spacing.lg,
    },
  });
}

export function ConnectModal() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { modalStudent, closeConnectModal, sendRequest } = useConnectionsStore();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(400)).current;

  const isVisible = !!modalStudent;

  useEffect(() => {
    if (isVisible) {
      setSent(false);
      setMessage('');
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, damping: 26, stiffness: 220, useNativeDriver: true }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      sheetY.setValue(400);
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 400, duration: 200, useNativeDriver: true }),
    ]).start(() => closeConnectModal());
  };

  const handleSend = () => {
    if (!modalStudent) return;
    sendRequest(modalStudent.id, message.trim() || undefined);
    setSent(true);
    setTimeout(() => handleClose(), 1500);
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={styles.backdrop} onPress={handleClose} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            <View style={styles.handle} />
            {sent ? (
              <SuccessState styles={styles} name={modalStudent?.name ?? ''} />
            ) : (
              <RequestState
                styles={styles}
                Colors={Colors}
                student={modalStudent}
                message={message}
                onMessageChange={setMessage}
                onSend={handleSend}
                onCancel={handleClose}
              />
            )}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function RequestState({
  student, message, onMessageChange, onSend, onCancel, styles, Colors,
}: {
  student: Student | null;
  message: string;
  onMessageChange: (v: string) => void;
  onSend: () => void;
  onCancel: () => void;
  styles: ReturnType<typeof createStyles>;
  Colors: ReturnType<typeof useColors>;
}) {
  if (!student) return null;
  return (
    <>
      <View style={styles.studentRow}>
        <Avatar initials={student.initials} color={student.avatarColor} size={52} />
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMeta} numberOfLines={1}>{student.major} · {student.year}</Text>
          <Text style={styles.studentSchool} numberOfLines={1}>{student.school}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.inputLabel}>Add a note (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder={`Hey ${student.name.split(' ')[0]}, I'd love to connect…`}
        placeholderTextColor={Colors.textMuted}
        value={message}
        onChangeText={onMessageChange}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={200}
      />
      <Pressable style={({ pressed }) => [styles.sendBtn, pressed && styles.btnPressed]} onPress={onSend}>
        <Ionicons name="person-add-outline" size={16} color="#fff" />
        <Text style={styles.sendBtnText}>Send Request</Text>
      </Pressable>
      <Pressable style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Not now</Text>
      </Pressable>
    </>
  );
}

function SuccessState({ name, styles }: { name: string; styles: ReturnType<typeof createStyles> }) {
  const Colors = useColors();
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={28} color={Colors.green} />
      </View>
      <Text style={styles.successTitle}>Request sent</Text>
      <Text style={styles.successSubtitle}>
        {name.split(' ')[0]} will be notified and can accept your request.
      </Text>
    </View>
  );
}
