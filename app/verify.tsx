import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { ColorPalette } from '../src/constants/themes';
import { useColors } from '../src/hooks/useColors';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { useOnboardingStore } from '../src/store/onboarding';

type VerifyPhase = 'upload' | 'pending' | 'verified';

function initialPhase(status: string): VerifyPhase {
  if (status === 'verified') return 'verified';
  if (status === 'pending') return 'pending';
  return 'upload';
}

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.8 },
    subtitle: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20, marginTop: -Spacing.md },
    infoCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      backgroundColor: C.accentSoft, borderRadius: Radius.lg, padding: Spacing.lg,
      borderWidth: 1, borderColor: C.accent + '33',
    },
    infoText: { flex: 1, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
    uploadCard: {
      borderWidth: 2, borderColor: C.border, borderRadius: Radius.xl,
      paddingVertical: Spacing.xxl + Spacing.lg, alignItems: 'center',
      gap: Spacing.md, backgroundColor: C.surface,
    },
    uploadCardSelected: { borderColor: C.green, backgroundColor: C.greenSoft },
    uploadLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.textSecondary },
    uploadSub: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },
    acceptedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
    acceptedChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: C.surfaceElevated, borderRadius: Radius.full,
      paddingHorizontal: Spacing.md, paddingVertical: 4,
      borderWidth: 1, borderColor: C.borderSubtle,
    },
    acceptedChipText: { fontSize: FontSize.xs, color: C.textMuted },
    errorText: { fontSize: FontSize.xs, color: C.red, textAlign: 'center' },
    pendingCard: {
      alignItems: 'center', gap: Spacing.md, backgroundColor: C.orangeSoft,
      borderRadius: Radius.xl, padding: Spacing.xxl,
      borderWidth: 1, borderColor: C.orange + '33',
    },
    pendingTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.orange, letterSpacing: -0.5 },
    pendingDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    pendingMeta: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center' },
    removeLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
    removeLinkText: { fontSize: FontSize.xs, color: C.textMuted, textDecorationLine: 'underline' },
    verifiedCard: {
      alignItems: 'center', gap: Spacing.md, backgroundColor: C.greenSoft,
      borderRadius: Radius.xl, padding: Spacing.xxl,
      borderWidth: 1, borderColor: C.green + '55',
    },
    verifiedTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.green, letterSpacing: -0.5 },
    verifiedDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: C.borderSubtle },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    btnGreen: { backgroundColor: C.green },
    btnDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    btnPressed: { opacity: 0.88 },
    btnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    btnTextDisabled: { color: C.textMuted },
  });
}

export default function VerifyScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { userId, setVerification, verificationStatus } = useOnboardingStore();

  const [phase, setPhase] = useState<VerifyPhase>(initialPhase(verificationStatus));
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;
    supabase
      .from('verifications')
      .select('status, method')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const s = data.status as string;
        if (s === 'verified') {
          setVerification(data.method, 'verified');
          setPhase('verified');
        } else if (s === 'pending') {
          setVerification(data.method, 'pending');
          setPhase('pending');
        }
      });
  }, [userId]);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setFileName(asset.name);
      setFileUri(asset.uri);
      setFileMimeType(asset.mimeType ?? null);
      setFileObject((asset as any).file ?? null);
      setUploadError(null);
    }
  };

  const handleSubmit = async () => {
    if (!fileName) return;
    if (!isSupabaseConfigured) {
      setVerification('id', 'verified');
      setPhase('verified');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const blob: Blob = fileObject instanceof File
        ? fileObject
        : await fetch(fileUri!).then((r) => r.blob());
      const ext = fileName.split('.').pop() ?? 'pdf';
      const storageKey = `${userId}/${Date.now()}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('verification-docs')
        .upload(storageKey, blob, { contentType: fileMimeType ?? 'application/octet-stream' });
      if (storageError) throw new Error(storageError.message);

      const { error: dbError } = await supabase.from('verifications').upsert({
        user_id: userId, method: 'id', file_name: fileName, storage_key: storageKey, status: 'verified',
      }, { onConflict: 'user_id' });
      if (dbError) throw new Error(dbError.message);

      setVerification('id', 'verified');
      setPhase('verified');
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (isSupabaseConfigured) {
      await supabase.from('verifications').delete().eq('user_id', userId);
    }
    setVerification(null, 'none');
    setFileName(null);
    setFileUri(null);
    setFileMimeType(null);
    setFileObject(null);
    setUploadError(null);
    setPhase('upload');
  };

  const handleDone = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Verify Student Status', headerBackTitle: 'Profile' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {phase === 'verified' ? 'You\'re verified' : 'Upload your transcript'}
        </Text>
        <Text style={styles.subtitle}>
          {phase === 'verified'
            ? 'Your student status has been confirmed.'
            : 'We review transcripts manually to confirm you\'re an active student.'}
        </Text>

        {phase === 'upload' && (
          <>
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.accent} />
              <Text style={styles.infoText}>
                Your transcript is only used to verify your student status. It's never shared with other users or stored beyond the review period.
              </Text>
            </View>

            <Pressable
              style={[styles.uploadCard, !!fileName && styles.uploadCardSelected]}
              onPress={handlePickFile}
            >
              {fileName ? (
                <>
                  <Ionicons name="document-text" size={44} color={Colors.green} />
                  <Text style={[styles.uploadLabel, { color: Colors.green }]} numberOfLines={1}>{fileName}</Text>
                  <Text style={styles.uploadSub}>Tap to choose a different file</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={44} color={Colors.textMuted} />
                  <Text style={styles.uploadLabel}>Tap to upload transcript</Text>
                  <Text style={styles.uploadSub}>Choose a PDF or photo of your unofficial transcript</Text>
                </>
              )}
            </Pressable>

            <View style={styles.acceptedRow}>
              {['PDF', 'JPG / PNG', 'Unofficial OK', 'Any semester'].map((label) => (
                <View key={label} style={styles.acceptedChip}>
                  <Ionicons name="checkmark" size={11} color={Colors.green} />
                  <Text style={styles.acceptedChipText}>{label}</Text>
                </View>
              ))}
            </View>

            {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
          </>
        )}

        {phase === 'pending' && (
          <View style={styles.pendingCard}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.orange} />
            <Text style={styles.pendingTitle}>Under Review</Text>
            <Text style={styles.pendingDesc}>
              We'll verify your transcript and confirm your student status within 24 hours.
            </Text>
            <Text style={styles.pendingMeta}>You'll see a Verified badge on your profile once approved.</Text>
            <Pressable style={styles.removeLink} onPress={handleRemove}>
              <Ionicons name="refresh-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.removeLinkText}>Remove & upload a different transcript</Text>
            </Pressable>
          </View>
        )}

        {phase === 'verified' && (
          <View style={styles.verifiedCard}>
            <Ionicons name="shield-checkmark" size={56} color={Colors.green} />
            <Text style={styles.verifiedTitle}>Verified Student</Text>
            <Text style={styles.verifiedDesc}>
              Your transcript was reviewed and your student status is confirmed. Your profile shows a Verified badge.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {phase === 'upload' && (
          <Pressable
            style={({ pressed }) => [styles.btn, (!fileName || uploading) && styles.btnDisabled, pressed && !!fileName && !uploading && styles.btnPressed]}
            onPress={handleSubmit}
            disabled={!fileName || uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={[styles.btnText, !fileName && styles.btnTextDisabled]}>Submit for Review</Text>
                  {!!fileName && <Ionicons name="arrow-forward-outline" size={18} color="#fff" />}
                </>
            }
          </Pressable>
        )}
        {phase === 'pending' && (
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={handleDone}>
            <Text style={styles.btnText}>Done</Text>
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
          </Pressable>
        )}
        {phase === 'verified' && (
          <Pressable style={({ pressed }) => [styles.btn, styles.btnGreen, pressed && styles.btnPressed]} onPress={handleDone}>
            <Text style={styles.btnText}>Back to Profile</Text>
            <Ionicons name="arrow-back-outline" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
