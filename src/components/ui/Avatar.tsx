import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FontWeight } from '../../constants/theme';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  uri?: string;
}

export function Avatar({ initials, color, size = 40, uri }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const fontSize = size * 0.36;
  const showImage = !!uri && !failed;

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
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.text, { color, fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  text: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
});
