import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

interface TagProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export function Tag({ label, color, bgColor }: TagProps) {
  const Colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 1,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    text: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.medium,
      letterSpacing: 0.2,
    },
  }), [Colors]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor ?? Colors.surfaceElevated }]}>
      <Text style={[styles.text, { color: color ?? Colors.textSecondary }]}>{label}</Text>
    </View>
  );
}
