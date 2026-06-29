import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUnreadCount } from '../../hooks/useNotifications';
import { Radius } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

export function NotificationBell() {
  const router = useRouter();
  const Colors = useColors();
  const unreadCount = useUnreadCount();

  const styles = useMemo(() => StyleSheet.create({
    wrap: { position: 'relative' },
    btn: {
      width: 36, height: 36, borderRadius: Radius.full,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    badge: {
      position: 'absolute', top: -3, right: -3,
      backgroundColor: Colors.red, borderRadius: 8,
      minWidth: 16, height: 16,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
      borderWidth: 1.5, borderColor: Colors.bg,
    },
    badgeText: { fontSize: 9, fontWeight: '700' as const, color: '#fff' },
  }), [Colors]);

  return (
    <Pressable style={styles.wrap} onPress={() => router.push('/notifications')} hitSlop={8}>
      <View style={styles.btn}>
        <Ionicons name="notifications-outline" size={18} color={Colors.textSecondary} />
      </View>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}
