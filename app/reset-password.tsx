import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { supabase } from '../src/lib/supabase';

type Stage = 'exchanging' | 'ready' | 'error' | 'done';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
    title: { fontSize: 26, fontWeight: FontWeight.bold, color: C.text, letterSpacing: -0.8 },
    subtitle: { fontSize: FontSize.sm, color: C.textMuted, lineHeight: 20, marginTop: -Spacing.md },
    field: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: C.textMuted, letterSpacing: 0.8 },
    input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, color: C.text, fontSize: FontSize.md },
    errorText: { fontSize: FontSize.xs, color: C.red, textAlign: 'center' },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.lg, borderRadius: Radius.lg },
    btnDisabled: { opacity: 0.6 },
    btnPressed: { opacity: 0.88 },
    btnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
    backLink: { fontSize: FontSize.sm, color: C.accent, fontWeight: FontWeight.semibold },
    bodyText: { fontSize: FontSize.sm, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
  });
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { code } = useLocalSearchParams<{ code?: string }>();

  const [stage, setStage] = useState<Stage>('exchanging');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('This reset link is missing or malformed.');
      setStage('error');
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError(exchangeError.message);
        setStage('error');
      } else {
        setStage('ready');
      }
    });
  }, [code]);

  const canSubmit = password.length >= 6 && !saving;

  const handleSetPassword = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStage('done');
    setTimeout(() => router.replace('/(tabs)/profile'), 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Reset Password', presentation: 'modal' }} />
      <KeyboardAvoidingView style={styles.scroll} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {stage === 'exchanging' && (
            <View style={styles.centered}>
              <ActivityIndicator color={Colors.accent} />
              <Text style={styles.bodyText}>Verifying your reset link…</Text>
            </View>
          )}

          {stage === 'error' && (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={28} color={Colors.red} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={styles.backLink}>Back to Log In</Text>
              </Pressable>
            </View>
          )}

          {stage === 'done' && (
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.green} />
              <Text style={styles.bodyText}>Password updated. Taking you back to your profile…</Text>
            </View>
          )}

          {stage === 'ready' && (
            <>
              <Text style={styles.title}>Choose a new password</Text>
              <Text style={styles.subtitle}>You'll be logged in with this password from now on.</Text>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
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
                  onSubmitEditing={handleSetPassword}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Pressable
                style={({ pressed }) => [styles.btn, !canSubmit && styles.btnDisabled, pressed && canSubmit && styles.btnPressed]}
                onPress={handleSetPassword}
                disabled={!canSubmit}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Set Password</Text>
                }
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
