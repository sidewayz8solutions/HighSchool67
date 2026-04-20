import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import RoomGridEditor from '@/components/room-grid';

const WALL_COLORS = [
  { name: 'Slate', hex: '#64748b' },
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Ocean', hex: '#3b82f6' },
  { name: 'Forest', hex: '#22c55e' },
  { name: 'Gold', hex: '#f59e0b' },
  { name: 'Violet', hex: '#a855f7' },
  { name: 'Rose', hex: '#ec4899' },
  { name: 'Midnight', hex: '#1e293b' },
];

const FLOOR_TYPES = [
  { name: 'Wood', pattern: 'linear-gradient(90deg, #8B6914 0%, #A0522D 50%, #8B6914 100%)' },
  { name: 'Tile', pattern: '#e2e8f0' },
  { name: 'Carpet', pattern: '#7f1d1d' },
  { name: 'Concrete', pattern: '#475569' },
];

export default function RoomScreen() {
  const room = useGameStore((s) => s.player.room);

  const setWallColor = (hex: string) => {
    useGameStore.setState((s) => { s.player.room.wallColor = hex; });
  };

  const setFloorType = (name: string) => {
    useGameStore.setState((s) => { s.player.room.floorType = name; });
  };

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Room</Text>
        <Text style={styles.subtitle}>Customize your space to match your vibe.</Text>

        <RoomGridEditor />

        <Text style={styles.sectionTitle}>Wall Color</Text>
        <View style={styles.colorRow}>
          {WALL_COLORS.map((color) => (
            <TouchableOpacity
              key={color.hex}
              activeOpacity={0.7}
              style={[styles.colorSwatch, { backgroundColor: color.hex }, room.wallColor === color.hex && styles.colorSwatchSelected]}
              onPress={() => setWallColor(color.hex)}
            >
              {room.wallColor === color.hex && <View style={styles.checkDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Flooring</Text>
        <View style={styles.floorRow}>
          {FLOOR_TYPES.map((floor) => (
            <TouchableOpacity
              key={floor.name}
              activeOpacity={0.7}
              style={[styles.floorOption, room.floorType === floor.name && styles.floorOptionSelected]}
              onPress={() => setFloorType(floor.name)}
            >
              <View style={[styles.floorPreview, { backgroundColor: floor.pattern.startsWith('linear') ? undefined : floor.pattern }]}>
                {floor.pattern.startsWith('linear') && (
                  <div style={{
                    width: '100%', height: '100%', borderRadius: 6,
                    background: floor.pattern,
                  }} />
                )}
              </View>
              <Text style={styles.floorName}>{floor.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Room Bonuses</Text>
          {room.items.length === 0 ? (
            <Text style={styles.emptyBonus}>Place items to get passive stat bonuses.</Text>
          ) : (
            room.items.map((item) => (
              <View key={`${item.id}-${item.position.x}-${item.position.y}`} style={styles.bonusRow}>
                <Text style={styles.bonusName}>{item.name}</Text>
                <Text style={styles.bonusValue}>
                  {Object.entries(item.statBonuses).map(([stat, val]) => `${stat} +${val}`).join(', ')}
                </Text>
              </View>
            ))
          )}
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.lg, textTransform: 'uppercase', letterSpacing: 1 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorSwatch: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: colors.text },
  checkDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
  floorRow: { flexDirection: 'row', gap: spacing.sm },
  floorOption: { flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: spacing.sm, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  floorOptionSelected: { borderColor: colors.primary },
  floorPreview: { width: '100%', height: 32, borderRadius: 6, marginBottom: 6, overflow: 'hidden' },
  floorName: { color: colors.text, fontSize: 12, fontWeight: '600' },
  statsCard: { marginTop: spacing.lg },
  statsTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  emptyBonus: { color: colors.textMuted, fontSize: 14 },
  bonusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bonusName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  bonusValue: { color: colors.success, fontSize: 13 },
});
