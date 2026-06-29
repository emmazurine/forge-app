import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontWeight } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const CFG: Record<LogoSize, {
  mark: number; radius: number; stroke: number;
  font: number; tracking: number; gap: number;
}> = {
  sm:  { mark: 26, radius: 5,  stroke: 2,   font: 13, tracking: 3,   gap: 9  },
  md:  { mark: 34, radius: 7,  stroke: 2.5, font: 17, tracking: 3.5, gap: 11 },
  lg:  { mark: 46, radius: 9,  stroke: 3,   font: 22, tracking: 4,   gap: 14 },
  xl:  { mark: 54, radius: 11, stroke: 3.5, font: 28, tracking: 5.5, gap: 16 },
  xxl: { mark: 70, radius: 14, stroke: 4.5, font: 42, tracking: 10,  gap: 20 },
};

interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  showMark?: boolean;
}

export function Logo({ size = 'md', showWordmark = true, showMark = true }: LogoProps) {
  const Colors = useColors();
  const c = CFG[size];
  const pad  = Math.round(c.mark * 0.18);
  const sw   = c.stroke;
  const span = c.mark - pad * 2;

  const stemX   = pad;
  const stemY   = pad;
  const stemH   = span;
  const topBarW = span;
  const midBarW = Math.round(span * 0.65);
  const midBarY = pad + Math.round(span * 0.43);

  const styles = useMemo(() => StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    mark: {
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    stroke: { position: 'absolute', backgroundColor: Colors.text },
    wordmark: {
      color: Colors.text,
      fontWeight: FontWeight.bold,
      textShadowColor: 'rgba(99, 102, 241, 0.85)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 32,
    },
  }), [Colors]);

  return (
    <View style={[styles.row, { gap: c.gap }]}>
      {showMark && (
        <View style={[styles.mark, { width: c.mark, height: c.mark, borderRadius: c.radius }]}>
          <View style={[styles.stroke, { width: sw, height: stemH, left: stemX, top: stemY }]} />
          <View style={[styles.stroke, { width: topBarW, height: sw, left: stemX, top: stemY }]} />
          <View style={[styles.stroke, { width: midBarW, height: sw, left: stemX, top: midBarY }]} />
        </View>
      )}

      {showWordmark && (
        <Text style={[styles.wordmark, { fontSize: c.font, letterSpacing: c.tracking }]}>
          FORGE
        </Text>
      )}
    </View>
  );
}
