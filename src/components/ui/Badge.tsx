import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { CollabType } from '../../types/collaboration';
import { SpotType } from '../../types/spot';

const SPOT_TYPE_CONFIG: Record<SpotType, { label: string; color: string; bg: string }> = {
  cafe: { label: 'Cafe', color: Colors.orange, bg: Colors.orangeSoft },
  library: { label: 'Library', color: Colors.accent, bg: Colors.accentSoft },
  campus: { label: 'Campus', color: Colors.green, bg: Colors.greenSoft },
  coworking: { label: 'Coworking', color: Colors.blue, bg: Colors.blueSoft },
  other: { label: 'Other', color: Colors.purple, bg: Colors.purpleSoft },
};

const COLLAB_TYPE_CONFIG: Record<CollabType, { label: string; color: string; bg: string }> = {
  hackathon: { label: 'Hackathon', color: Colors.orange, bg: Colors.orangeSoft },
  research: { label: 'Research', color: Colors.blue, bg: Colors.blueSoft },
  startup: { label: 'Startup', color: Colors.accent, bg: Colors.accentSoft },
  club: { label: 'Club', color: Colors.green, bg: Colors.greenSoft },
  competition: { label: 'Competition', color: Colors.red, bg: Colors.redSoft },
  nonprofit: { label: 'Nonprofit', color: Colors.teal,   bg: Colors.tealSoft   },
  other:     { label: 'Other',     color: Colors.purple, bg: Colors.purpleSoft },
};

interface SpotBadgeProps {
  type: SpotType;
}

export function SpotTypeBadge({ type }: SpotBadgeProps) {
  const config = SPOT_TYPE_CONFIG[type];
  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

interface CollabBadgeProps {
  type: CollabType;
}

export function CollabTypeBadge({ type }: CollabBadgeProps) {
  const config = COLLAB_TYPE_CONFIG[type];
  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
});
