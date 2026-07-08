import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const Colors = useColors();
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
    title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
    body: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    btn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.accent, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
      borderRadius: Radius.lg, marginTop: Spacing.sm,
    },
    btnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={32} color={Colors.red} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>Forge hit an unexpected error. Try again — if it keeps happening, restarting the app should help.</Text>
        <Pressable style={styles.btn} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>Try Again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
