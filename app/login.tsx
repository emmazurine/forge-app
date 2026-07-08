import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
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
import { useAuthStore } from '../src/store/auth';

type Mode = 'signIn' | 'signUp';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.8 },
    subtitle: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20, marginTop: -Spacing.md },
    fields: { gap: Spacing.lg },
    field: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    errorText: { fontSize: FontSize.xs, color: C.red },
    forgotLink: { alignSelf: 'flex-end', marginTop: -Spacing.sm },
    forgotLinkText: { fontSize: FontSize.xs, color: C.accent, fontWeight: FontWeight.semibold },
    infoCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      backgroundColor: C.greenSoft, borderRadius: Radius.lg, padding: Spacing.lg,
      borderWidth: 1, borderColor: C.green + '33',
    },
    infoText: { flex: 1, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20 },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    btnDisabled: { opacity: 0.6 },
    btnPressed: { opacity: 0.88 },
    btnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    switchRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs },
    switchText: { fontSize: FontSize.sm, color: C.textMuted },
    switchLink: { fontSize: FontSize.sm, color: C.accent, fontWeight: FontWeight.semibold },
    disabledCard: {
      backgroundColor: C.surface, borderRadius: Radius.lg, padding: Spacing.lg,
      borderWidth: 1, borderColor: C.border,
    },
    disabledText: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20 },
  });
}

export default function LoginScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (mode === 'signIn') {
      const ok = await signIn(email.trim(), password);
      if (ok) {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/profile');
      }
      return;
    }
    const { ok, needsConfirmation } = await signUp(email.trim(), password, name.trim() || undefined);
    if (!ok) return;
    if (needsConfirmation) {
      setConfirmationSent(true);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  const switchMode = () => {
    clearError();
    setConfirmationSent(false);
    setResetSent(false);
    setResetError(null);
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim();
    if (trimmed.length < 4) {
      setResetError('Enter your email above first.');
      return;
    }
    setResetError(null);
    setResetSending(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: Linking.createURL('reset-password'),
    });
    setResetSending(false);
    if (resetErr) {
      setResetError(resetErr.message);
      return;
    }
    setResetSent(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: mode === 'signIn' ? 'Log In' : 'Sign Up', presentation: 'modal' }} />
      <KeyboardAvoidingView style={styles.scroll} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{mode === 'signIn' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signIn'
              ? 'Log in to sync your profile, connections, and saved spots.'
              : 'Sign up to save your profile and pick up where you left off on any device.'}
          </Text>

          {!isSupabaseConfigured && (
            <View style={styles.disabledCard}>
              <Text style={styles.disabledText}>
                Login isn't configured for this build yet — add your Supabase credentials to enable it.
              </Text>
            </View>
          )}

          {confirmationSent ? (
            <View style={styles.infoCard}>
              <Ionicons name="mail-outline" size={20} color={Colors.green} />
              <Text style={styles.infoText}>
                We sent a confirmation link to {email.trim()}. Click it, then come back and log in.
              </Text>
            </View>
          ) : resetSent ? (
            <View style={styles.infoCard}>
              <Ionicons name="mail-outline" size={20} color={Colors.green} />
              <Text style={styles.infoText}>
                We sent a password reset link to {email.trim()}. Open it to choose a new password.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.fields}>
                {mode === 'signUp' && (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Your name"
                      placeholderTextColor={Colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                )}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
              </View>

              {mode === 'signIn' && (
                <Pressable style={styles.forgotLink} onPress={handleForgotPassword} disabled={resetSending}>
                  <Text style={styles.forgotLinkText}>{resetSending ? 'Sending…' : 'Forgot password?'}</Text>
                </Pressable>
              )}

              {resetError ? <Text style={styles.errorText}>{resetError}</Text> : null}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [styles.btn, !canSubmit && styles.btnDisabled, pressed && canSubmit && styles.btnPressed]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.btnText}>{mode === 'signIn' ? 'Log In' : 'Sign Up'}</Text>
                      <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
                    </>
                }
              </Pressable>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>
                  {mode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
                </Text>
                <Pressable onPress={switchMode}>
                  <Text style={styles.switchLink}>{mode === 'signIn' ? 'Sign up' : 'Log in'}</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
