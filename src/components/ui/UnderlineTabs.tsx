import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

interface Tab<T extends string> {
  id: T;
  label: string;
}

interface UnderlineTabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onSelect: (id: T) => void;
}

export function UnderlineTabs<T extends string>({ tabs, active, onSelect }: UnderlineTabsProps<T>) {
  const Colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      position: 'relative',
    },
    row: {
      paddingHorizontal: Spacing.lg,
      flexDirection: 'row',
    },
    tab: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      marginRight: Spacing.sm,
      position: 'relative',
    },
    label: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      color: Colors.textMuted,
      letterSpacing: 0.1,
    },
    labelActive: {
      color: Colors.text,
      fontWeight: FontWeight.semibold,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      left: Spacing.md,
      right: Spacing.md,
      height: 2,
      backgroundColor: Colors.accent,
      borderRadius: 2,
    },
    border: {
      height: 1,
      backgroundColor: Colors.borderSubtle,
      marginTop: -1,
    },
  }), [Colors]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              style={styles.tab}
              onPress={() => onSelect(tab.id)}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.border} />
    </View>
  );
}
