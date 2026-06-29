import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontWeight } from '../../constants/theme';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
}

export function Avatar({ initials, color, size = 40 }: AvatarProps) {
  const fontSize = size * 0.36;
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '22',
          borderColor: color + '44',
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
});
