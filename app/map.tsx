import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { useColors } from '../src/hooks/useColors';

export default function MapScreen() {
  const router = useRouter();
  const Colors = useColors();

  const styles = useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.lg },
    title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
    body: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
    backBtn: {
      marginTop: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
      backgroundColor: Colors.accent, borderRadius: Radius.lg,
    },
    backText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  }), [Colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.wrap}>
        <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.title}>Map available on iOS & Android</Text>
        <Text style={styles.body}>
          Open Forge in the Expo Go app or a native build to explore the map and see live check-ins.
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
