import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../src/components/ui/Avatar';
import { FontSize, FontWeight, Radius, Spacing } from '../src/constants/theme';
import { SPOTS } from '../src/data/spots';
import { useColors } from '../src/hooks/useColors';
import { useCheckinsStore, Checkin } from '../src/store/checkins';
import { useConnectionsStore } from '../src/store/connections';
import { useProfileStore } from '../src/store/profile';
import { Spot } from '../src/types/spot';

const NOVA_REGION = {
  latitude: 38.82,
  longitude: -77.23,
  latitudeDelta: 0.22,
  longitudeDelta: 0.28,
};

function AvatarStack({ checkins, size = 26 }: { checkins: Checkin[]; size?: number }) {
  const shown = checkins.slice(0, 3);
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
      {shown.map((c, i) => (
        <View
          key={c.userId}
          style={{
            marginLeft: i > 0 ? -(size * 0.35) : 0,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: '#fff',
            zIndex: shown.length - i,
          }}
        >
          <Avatar initials={c.userInitials} color={c.userAvatarColor} size={size} />
        </View>
      ))}
      {checkins.length > 3 && (
        <View style={{
          marginLeft: -(size * 0.35), width: size, height: size, borderRadius: size / 2,
          backgroundColor: '#444', borderWidth: 1.5, borderColor: '#fff',
          alignItems: 'center', justifyContent: 'center', zIndex: 0,
        }}>
          <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>+{checkins.length - 3}</Text>
        </View>
      )}
    </View>
  );
}

function SpotMarker({
  spot,
  checkins,
  isSelected,
  isMySpot,
  connectedIds,
  onPress,
}: {
  spot: Spot;
  checkins: Checkin[];
  isSelected: boolean;
  isMySpot: boolean;
  connectedIds: string[];
  onPress: () => void;
}) {
  const hasConnected = checkins.some((c) => connectedIds.includes(c.userId));
  const total = checkins.length;

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View style={{ alignItems: 'center', width: 52 }}>
        {total > 0 && (
          <View style={{ marginBottom: 3 }}>
            <AvatarStack checkins={checkins} size={22} />
          </View>
        )}
        <View style={[
          {
            width: isSelected ? 18 : 14,
            height: isSelected ? 18 : 14,
            borderRadius: isSelected ? 9 : 7,
            backgroundColor: spot.accentColor,
            borderWidth: isSelected ? 2.5 : isMySpot ? 2 : 1.5,
            borderColor: isMySpot ? '#fff' : isSelected ? '#fff' : spot.accentColor + 'AA',
            shadowColor: spot.accentColor,
            shadowOpacity: hasConnected || isSelected ? 0.6 : 0.2,
            shadowRadius: isSelected ? 6 : 3,
            shadowOffset: { width: 0, height: 0 },
            elevation: isSelected ? 6 : 2,
          },
        ]} />
        {total > 0 && (
          <View style={{
            backgroundColor: hasConnected ? spot.accentColor : '#888',
            borderRadius: 8, minWidth: 16, height: 16,
            alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: 4, marginTop: 2,
          }}>
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>{total}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const connections = useConnectionsStore((s) => s.connections);
  const connectedIds = useMemo(
    () => Object.entries(connections).filter(([, v]) => v === 'connected').map(([id]) => id),
    [connections]
  );

  const { checkins, checkIn, checkOut, myCheckin } = useCheckinsStore();
  const profileSaved = useProfileStore((s) => s.saved);

  const activeCheckins = useMemo(
    () => checkins.filter((c) => c.expiresAt > Date.now()),
    [checkins]
  );

  const myActive = myCheckin();

  const checkinsPerSpot = useMemo(() => {
    const map: Record<string, Checkin[]> = {};
    for (const c of activeCheckins) {
      if (!map[c.spotId]) map[c.spotId] = [];
      map[c.spotId].push(c);
    }
    return map;
  }, [activeCheckins]);

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const sheetAnim = useRef(new Animated.Value(340)).current;

  const openSheet = (spotId: string) => {
    setSelectedSpotId(spotId);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.timing(sheetAnim, { toValue: 340, duration: 220, useNativeDriver: true }).start(() => {
      setSelectedSpotId(null);
      setLabel('');
    });
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();
  }, []);

  const selectedSpot = selectedSpotId ? SPOTS.find((s) => s.id === selectedSpotId) ?? null : null;
  const selectedCheckins = selectedSpotId ? (checkinsPerSpot[selectedSpotId] ?? []) : [];
  const isCheckedInHere = !!myActive && myActive.spotId === selectedSpotId;
  const isCheckedInElsewhere = !!myActive && myActive.spotId !== selectedSpotId;

  const handleCheckIn = () => {
    if (!selectedSpotId || !profileSaved) return;
    const trimmed = label.trim();
    if (!trimmed) return;
    checkIn(selectedSpotId, trimmed, {
      userName: profileSaved.name,
      userInitials: profileSaved.initials,
      userAvatarColor: profileSaved.avatarColor,
    });
    setLabel('');
    Keyboard.dismiss();
  };

  const openInMaps = (spot: Spot) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`;
    Linking.openURL(url);
  };

  const flyTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.015, longitudeDelta: 0.015 },
      600
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    header: {
      position: 'absolute', top: insets.top + 8, left: 12, right: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: Colors.surface + 'F0',
      borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 10,
      borderWidth: 1, borderColor: Colors.border,
      shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
    locateBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    activityBar: {
      position: 'absolute', bottom: insets.bottom + 12, left: 0, right: 0,
    },
    activityScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
    activityChip: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: Colors.surface + 'F4',
      borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderWidth: 1, borderColor: Colors.border,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    activityName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    activitySpot: { fontSize: FontSize.xs, color: Colors.textMuted },
    activityConnected: { borderColor: Colors.accent + '66', backgroundColor: Colors.accentSoft + 'EE' },
    sheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: Colors.surface,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
      borderColor: Colors.border,
      paddingBottom: insets.bottom + Spacing.lg,
      shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
    },
    sheetHandle: {
      width: 36, height: 4, borderRadius: 2,
      backgroundColor: Colors.borderSubtle, alignSelf: 'center', marginTop: 10, marginBottom: 4,
    },
    sheetHeader: {
      flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xs,
    },
    sheetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
    sheetClose: { padding: 4, marginLeft: Spacing.sm },
    metaRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    },
    metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
    mapsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    mapsBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.accent },
    checkinsList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
    checkinRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: Spacing.md,
      borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    checkinRowConnected: { borderColor: Colors.accent + '44', backgroundColor: Colors.accentSoft },
    checkinInfo: { flex: 1, gap: 2 },
    checkinName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
    checkinLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
    connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
    divider: { height: 1, backgroundColor: Colors.borderSubtle, marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
    inputRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
      borderWidth: 1, borderColor: Colors.border,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    },
    input: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
    checkinBtn: {
      marginHorizontal: Spacing.lg, backgroundColor: Colors.accent,
      borderRadius: Radius.lg, paddingVertical: Spacing.md,
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'row', gap: Spacing.sm,
    },
    checkinBtnSwitch: { backgroundColor: Colors.accent },
    checkinBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    checkoutBtn: {
      marginHorizontal: Spacing.lg, borderRadius: Radius.lg, paddingVertical: Spacing.md,
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'row', gap: Spacing.sm,
      backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.red + '66',
    },
    checkoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.red },
    emptyHere: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs },
    emptyHereText: { fontSize: FontSize.sm, color: Colors.textMuted },
  }), [Colors, insets]);

  const friendsOut = useMemo(
    () => activeCheckins.filter((c) => c.userId !== 'me' && connectedIds.includes(c.userId)),
    [activeCheckins, connectedIds]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={NOVA_REGION}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        onPress={() => selectedSpotId && closeSheet()}
      >
        {SPOTS.map((spot) => {
          const spotCheckins = checkinsPerSpot[spot.id] ?? [];
          const isMySpot = myActive?.spotId === spot.id;
          return (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.lat, longitude: spot.lng }}
              tracksViewChanges={false}
              onPress={() => {
                flyTo(spot.lat, spot.lng);
                openSheet(spot.id);
              }}
            >
              <SpotMarker
                spot={spot}
                checkins={spotCheckins}
                isSelected={selectedSpotId === spot.id}
                isMySpot={isMySpot}
                connectedIds={connectedIds}
                onPress={() => {
                  flyTo(spot.lat, spot.lng);
                  openSheet(spot.id);
                }}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={Colors.accent} />
          </Pressable>
          <Text style={styles.headerTitle}>Spots Map</Text>
        </View>
        <Pressable
          style={styles.locateBtn}
          hitSlop={8}
          onPress={() => {
            if (userLocation) {
              flyTo(userLocation.latitude, userLocation.longitude);
            } else {
              mapRef.current?.animateToRegion(NOVA_REGION, 600);
            }
          }}
        >
          <Ionicons name="locate" size={16} color={Colors.accent} />
        </Pressable>
      </View>

      {/* Activity bar */}
      {!selectedSpotId && friendsOut.length > 0 && (
        <View style={styles.activityBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
            {friendsOut.map((c) => {
              const spot = SPOTS.find((s) => s.id === c.spotId);
              return (
                <Pressable
                  key={c.userId}
                  style={[styles.activityChip, styles.activityConnected]}
                  onPress={() => { if (spot) { flyTo(spot.lat, spot.lng); openSheet(spot.id); } }}
                >
                  <Avatar initials={c.userInitials} color={c.userAvatarColor} size={28} />
                  <View>
                    <Text style={styles.activityName}>{c.userName.split(' ')[0]}</Text>
                    <Text style={styles.activitySpot}>{spot?.name ?? 'Unknown spot'}</Text>
                  </View>
                </Pressable>
              );
            })}
            {myActive && (
              <Pressable
                style={styles.activityChip}
                onPress={() => {
                  const spot = SPOTS.find((s) => s.id === myActive.spotId);
                  if (spot) { flyTo(spot.lat, spot.lng); openSheet(spot.id); }
                }}
              >
                <Avatar initials={profileSaved?.initials ?? 'ME'} color={profileSaved?.avatarColor ?? '#6366F1'} size={28} />
                <View>
                  <Text style={styles.activityName}>You</Text>
                  <Text style={styles.activitySpot}>{SPOTS.find((s) => s.id === myActive.spotId)?.name ?? ''}</Text>
                </View>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}

      {/* Bottom sheet */}
      {selectedSpot && (
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>{selectedSpot.name}</Text>
            <Pressable style={styles.sheetClose} onPress={closeSheet} hitSlop={8}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {selectedSpot.address.split(',').slice(0, 2).join(',')}
              </Text>
            </View>
            <Pressable style={styles.mapsBtn} onPress={() => openInMaps(selectedSpot)}>
              <Ionicons name="navigate-outline" size={12} color={Colors.accent} />
              <Text style={styles.mapsBtnText}>Open in Maps</Text>
            </Pressable>
          </View>

          <View style={styles.checkinsList}>
            {selectedCheckins.length === 0 ? (
              <View style={styles.emptyHere}>
                <Ionicons name="people-outline" size={28} color={Colors.textMuted} />
                <Text style={styles.emptyHereText}>No one checked in yet — be the first!</Text>
              </View>
            ) : (
              selectedCheckins.map((c) => {
                const isMe = c.userId === 'me';
                const isConn = connectedIds.includes(c.userId);
                return (
                  <View key={c.userId} style={[styles.checkinRow, (isConn || isMe) && styles.checkinRowConnected]}>
                    <Avatar initials={c.userInitials} color={c.userAvatarColor} size={36} />
                    <View style={styles.checkinInfo}>
                      <Text style={styles.checkinName}>{isMe ? 'You' : c.userName}</Text>
                      {c.label ? <Text style={styles.checkinLabel}>"{c.label}"</Text> : null}
                    </View>
                    {(isConn || isMe) && <View style={styles.connectedDot} />}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.divider} />

          {isCheckedInHere ? (
            <Pressable style={styles.checkoutBtn} onPress={checkOut}>
              <Ionicons name="log-out-outline" size={18} color={Colors.red} />
              <Text style={styles.checkoutText}>Check out</Text>
            </Pressable>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.inputRow}>
                <Ionicons name="pencil-outline" size={15} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="What are you working on?"
                  placeholderTextColor={Colors.textMuted}
                  value={label}
                  onChangeText={setLabel}
                  returnKeyType="done"
                  onSubmitEditing={handleCheckIn}
                  maxLength={60}
                />
              </View>
              <Pressable
                style={[
                  styles.checkinBtn,
                  isCheckedInElsewhere && styles.checkinBtnSwitch,
                  !label.trim() && { opacity: 0.4 },
                ]}
                onPress={handleCheckIn}
                disabled={!label.trim()}
              >
                <Ionicons name="location" size={18} color="#fff" />
                <Text style={styles.checkinBtnText}>
                  {isCheckedInElsewhere ? 'Switch to this spot' : 'Check in here'}
                </Text>
              </Pressable>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      )}
    </View>
  );
}
