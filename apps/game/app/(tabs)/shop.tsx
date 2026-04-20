import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { CurrencyBadge } from '@/components/visuals';
import type { RoomItem } from '@repo/types';

const SHOP_ITEMS: RoomItem[] = [
  { id: 'poster-1', name: 'Band Poster', category: 'poster', rarity: 'common', cost: { points: 50, gems: 0 }, statBonuses: { creativity: 2 } },
  { id: 'lamp-1', name: 'Neon Lamp', category: 'lighting', rarity: 'rare', cost: { points: 0, gems: 5 }, statBonuses: { creativity: 3, happiness: 2 } },
  { id: 'desk-1', name: 'Gaming Desk', category: 'furniture', rarity: 'epic', cost: { points: 200, gems: 10 }, statBonuses: { academics: 3, creativity: 3 } },
  { id: 'rug-1', name: 'Shag Rug', category: 'floor', rarity: 'common', cost: { points: 75, gems: 0 }, statBonuses: { happiness: 3 } },
  { id: 'plant-1', name: 'Monstera', category: 'furniture', rarity: 'rare', cost: { points: 100, gems: 3 }, statBonuses: { happiness: 4, energy: 2 } },
  { id: 'mirror-1', name: 'LED Mirror', category: 'wall', rarity: 'epic', cost: { points: 150, gems: 8 }, statBonuses: { popularity: 4, happiness: 2 } },
  { id: 'bookshelf-1', name: 'Bookshelf', category: 'furniture', rarity: 'common', cost: { points: 60, gems: 0 }, statBonuses: { academics: 3 } },
  { id: 'speaker-1', name: 'Subwoofer', category: 'furniture', rarity: 'rare', cost: { points: 120, gems: 5 }, statBonuses: { rebellion: 3, popularity: 2 } },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function ShopScreen() {
  const currency = useGameStore((s) => s.player.currency);
  const inventory = useGameStore((s) => s.player.inventory);
  const spendCurrency = useGameStore((s) => s.spendCurrency);
  const addToInventory = useGameStore((s) => s.addToInventory);
  const [bought, setBought] = useState<string | null>(null);

  const buy = (item: RoomItem) => {
    if (!spendCurrency(item.cost)) return;
    addToInventory(item);
    setBought(item.id);
    setTimeout(() => setBought(null), 1500);
  };

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.subtitle}>Decorate your room, boost your stats.</Text>

        <View style={styles.currencyRow}>
          <CurrencyBadge points={currency.points} gems={currency.gems} size="lg" />
        </View>

        {SHOP_ITEMS.map((item) => {
          const owned = inventory.some((i) => i.id === item.id);
          const canAfford = currency.points >= item.cost.points && currency.gems >= item.cost.gems;
          return (
            <Card key={item.id} style={[styles.card, bought === item.id && styles.cardBought]}>
              <View style={styles.itemRow}>
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[item.rarity] + '22', borderColor: RARITY_COLORS[item.rarity] }]}>
                  <Text style={[styles.rarityText, { color: RARITY_COLORS[item.rarity] }]}>{item.rarity.toUpperCase()}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.bonuses}>
                    {Object.entries(item.statBonuses).map(([k, v]) => `${k} +${v}`).join(', ')}
                  </Text>
                </View>
                <View style={styles.costCol}>
                  <CurrencyBadge points={item.cost.points > 0 ? item.cost.points : undefined} gems={item.cost.gems > 0 ? item.cost.gems : undefined} size="sm" />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.buyBtn, (!canAfford || owned) && styles.buyBtnDisabled]}
                onPress={() => buy(item)}
                disabled={!canAfford || owned}
              >
                <Text style={styles.buyText}>{owned ? 'Owned' : canAfford ? 'Buy' : 'Too expensive'}</Text>
              </TouchableOpacity>
            </Card>
          );
        })}
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
  currencyRow: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardBought: { borderColor: colors.success, borderWidth: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  rarityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginRight: spacing.md },
  rarityText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  itemInfo: { flex: 1 },
  itemName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemCategory: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  bonuses: { color: colors.success, fontSize: 12, marginTop: 2 },
  costCol: { alignItems: 'flex-end' },
  buyBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  buyBtnDisabled: { backgroundColor: colors.surfaceHighlight },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
