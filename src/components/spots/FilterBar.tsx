import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { SpotFilter } from '../../types/spot';

const FILTERS: { id: SpotFilter; label: string; icon?: string }[] = [
  { id: 'all',     label: 'All Spots' },
  { id: 'saved',   label: 'Saved', icon: 'bookmark' },
  { id: 'quiet',   label: 'Quiet' },
  { id: 'wifi',    label: 'Great WiFi' },
  { id: 'outlets', label: 'Outlets' },
  { id: 'group',   label: 'Group Work' },
  { id: 'open',    label: 'Open Now' },
];

interface FilterBarProps {
  active: SpotFilter;
  onSelect: (f: SpotFilter) => void;
}

export function FilterBar({ active, onSelect }: FilterBarProps) {
  const Colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderSubtle,
    },
    scroll: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    chipActive: {
      backgroundColor: Colors.accentSoft,
      borderColor: Colors.accent,
    },
    chipText: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      color: Colors.textSecondary,
    },
    chipTextActive: {
      color: Colors.accent,
    },
  }), [Colors]);

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {FILTERS.map((f) => {
          const isActive = f.id === active;
          return (
            <Pressable
              key={f.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(f.id)}
            >
              {f.icon && (
                <Ionicons
                  name={f.icon as any}
                  size={12}
                  color={isActive ? Colors.accent : Colors.textSecondary}
                />
              )}
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
