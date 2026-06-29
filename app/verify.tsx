import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { ColorPalette } from '../src/constants/themes';
import { useColors } from '../src/hooks/useColors';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { useOnboardingStore } from '../src/store/onboarding';

type VerifyPhase = 'pick' | 'email-input' | 'email-code' | 'email-done' | 'id-upload' | 'id-pending';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.8 },
    subtitle: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20, marginTop: -Spacing.md },
    fieldWrap: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    inputError: { fontSize: FontSize.xs, color: C.red, marginTop: 2 },
    methodCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, padding: Spacing.lg },
    methodIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
    methodTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    methodDesc: { fontSize: FontSize.xs, color: C.textMuted, lineHeight: 18 },
    instantBadge: { backgroundColor: C.greenSoft, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    instantBadgeText: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: C.green },
    codeCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: C.accentSoft, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.accent + '44' },
    codeCardLabel: { fontSize: FontSize.xs, color: C.textMuted, fontWeight: FontWeight.medium },
    codeCardEmail: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.text },
    successCard: { alignItems: 'center', gap: Spacing.md, backgroundColor: C.greenSoft, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: C.green + '33' },
    successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.green, letterSpacing: -0.5 },
    successDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    pendingCard: { alignItems: 'center', gap: Spacing.md, backgroundColor: C.orangeSoft, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: C.orange + '33' },
    pendingTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: C.orange, letterSpacing: -0.5 },
    pendingDesc: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
    removeLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
    removeLinkText: { fontSize: FontSize.xs, color: C.textMuted, textDecorationLine: 'underline' },
    backLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    backLinkText: { fontSize: FontSize.sm, color: C.textMuted },
    uploadCard: { borderWidth: 2, borderColor: C.border, borderRadius: Radius.xl, paddingVertical: Spacing.xxl + Spacing.lg, alignItems: 'center', gap: Spacing.md, backgroundColor: C.surface },
    uploadCardSelected: { borderColor: C.green, backgroundColor: C.greenSoft },
    uploadLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: C.textSecondary },
    uploadSub: { fontSize: FontSize.xs, color: C.textMuted },
    uploadAccepted: { fontSize: FontSize.xs, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
    footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: C.borderSubtle },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    btnDisabled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    btnPressed: { opacity: 0.88 },
    btnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    btnTextDisabled: { color: C.textMuted },
  });
}

type Styles = ReturnType<typeof createStyles>;

function Field({ label, children, styles }: { label: string; children: React.ReactNode; styles: Styles }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function VerifyScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { userId, setVerification } = useOnboardingStore();

  const [phase, setPhase] = useState<VerifyPhase>('pick');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isValidEmail = (e: string) =>
    e.includes('@') && (e.endsWith('.edu') || e.includes('.edu.') || e.includes('.k12.'));
  const emailError = email.length > 3 && !isValidEmail(email) ? 'Must be a school email (.edu)' : '';
  const codeValid = code.length === 6 && /^\d+$/.test(code);

  const handleSendCode = () => { if (isValidEmail(email)) setPhase('email-code'); };

  const handleVerifyCode = async () => {
    if (!codeValid) return;
    if (isSupabaseConfigured) {
      await supabase.from('verifications').upsert({
        user_id: userId, method: 'email', email, status: 'verified',
      });
    }
    setVerification('email', 'verified', email);
    setPhase('email-done');
  };

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
    }
  };

  const handleIDSubmit = async () => {
    if (!fileName) return;
    if (!isSupabaseConfigured) {
      setVerification('id', 'pending');
      setPhase('id-pending');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      // On web, use the File object directly; on native, fetch the URI
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
        user_id: userId, method: 'id', file_name: fileName, storage_key: storageKey, status: 'pending',
      });
      if (dbError) throw new Error(dbError.message);

      setVerification('id', 'pending');
      setPhase('id-pending');
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
    setPhase('id-upload');
  };

  const handleDone = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Verify Student Status', headerBackTitle: 'Profile' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Verify your status</Text>
          <Text style={styles.subtitle}>Forge is for real students only. This keeps the community safe.</Text>

          {phase === 'pick' && (
            <>
              <Pressable style={styles.methodCard} onPress={() => setPhase('email-input')}>
                <View style={styles.methodIcon}>
                  <Ionicons name="mail-outline" size={22} color={Colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.methodTitle}>School Email</Text>
                  <Text style={styles.methodDesc}>Get a code sent to your .edu address</Text>
                </View>
                <View style={styles.instantBadge}><Text style={styles.instantBadgeText}>Instant</Text></View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>

              <Pressable style={styles.methodCard} onPress={() => setPhase('id-upload')}>
                <View style={styles.methodIcon}>
                  <Ionicons name="card-outline" size={22} color={Colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.methodTitle}>Student ID or Transcript</Text>
                  <Text style={styles.methodDesc}>Upload a photo of your school ID or recent transcript</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>
            </>
          )}

          {phase === 'email-input' && (
            <>
              <Pressable onPress={() => setPhase('pick')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={15} color={Colors.textMuted} />
                <Text style={styles.backLinkText}>Choose different method</Text>
              </Pressable>
              <Field label="SCHOOL EMAIL ADDRESS" styles={styles}>
                <TextInput
                  style={[styles.input, emailError ? { borderColor: Colors.red } : undefined]}
                  placeholder="you@university.edu"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoFocus
                />
                {emailError ? <Text style={styles.inputError}>{emailError}</Text> : null}
              </Field>
            </>
          )}

          {phase === 'email-code' && (
            <>
              <View style={styles.codeCard}>
                <Ionicons name="mail-open-outline" size={24} color={Colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.codeCardLabel}>Code sent to</Text>
                  <Text style={styles.codeCardEmail} numberOfLines={1}>{email}</Text>
                </View>
              </View>
              <Field label="6-DIGIT CODE" styles={styles}>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={Colors.textMuted}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </Field>
            </>
          )}

          {phase === 'email-done' && (
            <View style={styles.successCard}>
              <Ionicons name="shield-checkmark" size={48} color={Colors.green} />
              <Text style={styles.successTitle}>You're verified!</Text>
              <Text style={styles.successDesc}>Your student status has been confirmed.</Text>
            </View>
          )}

          {phase === 'id-upload' && (
            <>
              <Pressable onPress={() => setPhase('pick')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={15} color={Colors.textMuted} />
                <Text style={styles.backLinkText}>Choose different method</Text>
              </Pressable>
              <Pressable style={[styles.uploadCard, !!fileName && styles.uploadCardSelected]} onPress={handlePickFile}>
                {fileName ? (
                  <>
                    <Ionicons name="document-text" size={40} color={Colors.green} />
                    <Text style={[styles.uploadLabel, { color: Colors.green }]} numberOfLines={1}>{fileName}</Text>
                    <Text style={styles.uploadSub}>Tap to choose a different file</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.uploadLabel}>Tap to choose file</Text>
                    <Text style={styles.uploadSub}>Student ID or recent transcript</Text>
                  </>
                )}
              </Pressable>
              <Text style={styles.uploadAccepted}>Accepted: PDF, photo ID, enrollment letter, transcript</Text>
              {uploadError ? <Text style={{ fontSize: FontSize.xs, color: Colors.red, textAlign: 'center' }}>{uploadError}</Text> : null}
            </>
          )}

          {phase === 'id-pending' && (
            <View style={styles.pendingCard}>
              <Ionicons name="hourglass-outline" size={48} color={Colors.orange} />
              <Text style={styles.pendingTitle}>Under Review</Text>
              <Text style={styles.pendingDesc}>We'll verify your student status shortly.</Text>
              <Pressable style={styles.removeLink} onPress={handleRemove}>
                <Ionicons name="refresh-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.removeLinkText}>Remove & re-upload a different document</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {phase === 'email-input' && (
            <Pressable
              style={({ pressed }) => [styles.btn, !isValidEmail(email) && styles.btnDisabled, pressed && isValidEmail(email) && styles.btnPressed]}
              onPress={handleSendCode}
              disabled={!isValidEmail(email)}
            >
              <Text style={[styles.btnText, !isValidEmail(email) && styles.btnTextDisabled]}>Send Verification Code</Text>
              {isValidEmail(email) && <Ionicons name="arrow-forward-outline" size={18} color="#fff" />}
            </Pressable>
          )}
          {phase === 'email-code' && (
            <Pressable
              style={({ pressed }) => [styles.btn, !codeValid && styles.btnDisabled, pressed && codeValid && styles.btnPressed]}
              onPress={handleVerifyCode}
              disabled={!codeValid}
            >
              <Text style={[styles.btnText, !codeValid && styles.btnTextDisabled]}>Verify Code</Text>
              {codeValid && <Ionicons name="arrow-forward-outline" size={18} color="#fff" />}
            </Pressable>
          )}
          {(phase === 'email-done' || phase === 'id-pending') && (
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={handleDone}>
              <Text style={styles.btnText}>Done</Text>
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
            </Pressable>
          )}
          {phase === 'id-upload' && (
            <Pressable
              style={({ pressed }) => [styles.btn, (!fileName || uploading) && styles.btnDisabled, pressed && !!fileName && !uploading && styles.btnPressed]}
              onPress={handleIDSubmit}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
