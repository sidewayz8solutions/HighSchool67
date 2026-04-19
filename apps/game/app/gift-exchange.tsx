import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import {
  MOCK_FRIENDS,
  canSendGift,
  getRemainingGifts,
  sendGift,
  useGameStore,
} from '@repo/game-engine';
import { NpcAvatar } from '@/components/visuals';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { Friend, RoomItem } from '@repo/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const FRIEND_REACTIONS: Record<string, string[]> = {
  'Alex Ramos': ['Thanks bro! This is sick!', 'Dude, you know me too well!', 'Appreciate it man! 💪'],
  'Sam Kim': ['This is beautiful! Thank you! ✨', 'You have such great taste!', 'I love it! So thoughtful 💕'],
  'Jordan Taylor': ['Efficient choice. Thank you.', 'Interesting. I appreciate it.', 'This will be useful. Thanks.'],
  'Riley Parker': ['OMG YES! This is perfect!!', 'Ahhh you shouldn\'t have! 🥰', 'This is SO me! Love it!'],
  'Casey Williams': ['Nice! Thanks! 🎮', 'Ooh this is cool!', 'Appreciate the gift!'],
};

function getMockGiftableItems(): RoomItem[] {
  return [
    { id: 'poster-1', name: 'Band Poster', category: 'poster', rarity: 'common', cost: { points: 50, gems: 0 }, statBonuses: { creativity: 2 } },
    { id: 'lamp-1', name: 'Neon Lamp', category: 'lighting', rarity: 'rare', cost: { points: 0, gems: 5 }, statBonuses: { creativity: 3, happiness: 2 } },
    { id: 'desk-1', name: 'Gaming Desk', category: 'furniture', rarity: 'epic', cost: { points: 200, gems: 10 }, statBonuses: { academics: 3, creativity: 3 } },
    { id: 'rug-1', name: 'Shag Rug', category: 'floor', rarity: 'common', cost: { points: 75, gems: 0 }, statBonuses: { happiness: 3 } },
    { id: 'plant-1', name: 'Monstera', category: 'furniture', rarity: 'rare', cost: { points: 100, gems: 3 }, statBonuses: { happiness: 4, energy: 2 } },
    { id: 'mirror-1', name: 'LED Mirror', category: 'wall', rarity: 'epic', cost: { points: 150, gems: 8 }, statBonuses: { popularity: 4, happiness: 2 } },
    { id: 'bookshelf-1', name: 'Bookshelf', category: 'furniture', rarity: 'common', cost: { points: 60, gems: 0 }, statBonuses: { academics: 3 } },
    { id: 'speaker-1', name: 'Subwoofer', category: 'furniture', rarity: 'rare', cost: { points: 120, gems: 5 }, statBonuses: { rebellion: 3, popularity: 2 } },
  ];
}

function GiftItemCard({
  item,
  onSelect,
  index,
  isSelected,
}: {
  item: RoomItem;
  onSelect: (item: RoomItem) => void;
  index: number;
  isSelected: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    }, 100);
    onSelect(item);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50)}
      style={[styles.gridItem, animatedStyle, isSelected && styles.gridItemSelected]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.rarityStripe, { backgroundColor: RARITY_COLORS[item.rarity] }]} />
        <View style={styles.itemContent}>
          <Text style={styles.itemEmoji}>{getItemEmoji(item.category)}</Text>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: `${RARITY_COLORS[item.rarity]}22`, borderColor: `${RARITY_COLORS[item.rarity]}44` }]}>
            <Text style={[styles.rarityText, { color: RARITY_COLORS[item.rarity] }]}>{item.rarity.toUpperCase()}</Text>
          </View>
          <Text style={styles.bonusText}>
            {Object.entries(item.statBonuses).map(([k, v]) => `${k} +${v}`).join(', ')}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getItemEmoji(category: string): string {
  switch (category) {
    case 'poster': return '🖼️';
    case 'lighting': return '💡';
    case 'furniture': return '🪑';
    case 'floor': return '🟫';
    case 'wall': return '🪞';
    default: return '📦';
  }
}

export default function GiftExchangeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const inventory = useGameStore((s) => s.player.inventory);

  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [selectedFriendId, setSelectedFriendId] = useState<string>(
    (params.friendId as string) ?? MOCK_FRIENDS[0].id
  );
  const [selectedItem, setSelectedItem] = useState<RoomItem | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const selectedFriend = friends.find((f) => f.id === selectedFriendId) ?? friends[0];
  const giftableItems = inventory.length > 0 ? inventory : getMockGiftableItems();
  const remainingGifts = getRemainingGifts(selectedFriend);

  const handleSelectItem = useCallback((item: RoomItem) => {
    setSelectedItem(item);
    setConfirmModalVisible(true);
  }, []);

  const handleSendGift = useCallback(() => {
    if (!selectedItem || !selectedFriend) return;
    if (!canSendGift(selectedFriend)) {
      Alert.alert('Daily Limit Reached', 'You can only send 3 gifts per friend per day.');
      return;
    }

    const result = sendGift(selectedFriend, selectedItem);
    setFriends((prev) =>
      prev.map((f) => (f.id === selectedFriend.id ? result.updatedFriend : f))
    );

    setConfirmModalVisible(false);
    setSelectedItem(null);
  }, [selectedItem, selectedFriend]);

  const getRandomReaction = (friendName: string): string => {
    const reactions = FRIEND_REACTIONS[friendName] ?? ['Thanks for the gift!'];
    return reactions[Math.floor(Math.random() * reactions.length)];
  };

  const recentGifts = selectedFriend.giftHistory.slice(-5).reverse();

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Gift Exchange</Text>
        <Text style={styles.subtitle}>Send gifts to friends and grow your bond!</Text>

        {/* Friend Selector */}
        <Text style={styles.sectionLabel}>Select Friend</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendSelector}
        >
          {friends.map((friend, index) => (
            <Animated.View key={friend.id} entering={FadeInUp.delay(index * 60)}>
              <TouchableOpacity
                style={[
                  styles.friendChip,
                  selectedFriendId === friend.id && styles.friendChipActive,
                ]}
                onPress={() => setSelectedFriendId(friend.id)}
              >
                <NpcAvatar
                  seed={friend.avatarConfig.seed}
                  hair={friend.avatarConfig.hair}
                  hairColor={friend.avatarConfig.hairColor}
                  skinColor={friend.avatarConfig.skinColor}
                  size={48}
                  borderColor={selectedFriendId === friend.id ? colors.primary : 'transparent'}
                />
                <Text style={[styles.friendChipName, selectedFriendId === friend.id && styles.friendChipNameActive]}>
                  {friend.displayName}
                </Text>
                {selectedFriendId === friend.id && (
                  <View style={styles.giftLimitBadge}>
                    <Text style={styles.giftLimitText}>{getRemainingGifts(friend)} left</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Daily Limit Indicator */}
        <View style={styles.limitBar}>
          <View style={[styles.limitFill, { width: `${((3 - remainingGifts) / 3) * 100}%`, backgroundColor: remainingGifts > 0 ? colors.primary : colors.danger }]} />
        </View>
        <Text style={styles.limitText}>
          {remainingGifts > 0
            ? `You can send ${remainingGifts} more gift${remainingGifts !== 1 ? 's' : ''} to ${selectedFriend.displayName} today`
            : `Daily gift limit reached for ${selectedFriend.displayName}`}
        </Text>

        {/* Giftable Items Grid */}
        <Text style={styles.sectionLabel}>Choose a Gift</Text>
        <View style={styles.itemsGrid}>
          {giftableItems.map((item, index) => (
            <GiftItemCard
              key={item.id}
              item={item}
              onSelect={handleSelectItem}
              index={index}
              isSelected={selectedItem?.id === item.id}
            />
          ))}
        </View>

        {/* Gift History */}
        {recentGifts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent Gifts to {selectedFriend.displayName}</Text>
            <Card style={styles.historyCard}>
              {recentGifts.map((gift, index) => (
                <Animated.View key={`${gift.itemId}-${index}`} entering={FadeInUp.delay(index * 40)}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyEmoji}>🎁</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyItemName}>{gift.itemName}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(gift.sentAt).toLocaleDateString()} • +{gift.friendshipBoost} friendship
                      </Text>
                    </View>
                  </View>
                  {index < recentGifts.length - 1 && <View style={styles.historyDivider} />}
                </Animated.View>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="slide" onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            {selectedItem && selectedFriend && (
              <>
                <Text style={styles.confirmEmoji}>🎁</Text>
                <Text style={styles.confirmTitle}>Send {selectedItem.name}?</Text>
                <Text style={styles.confirmTo}>To: <Text style={styles.confirmFriendName}>{selectedFriend.displayName}</Text></Text>

                <View style={styles.confirmDetails}>
                  <View style={[styles.rarityBadge, { backgroundColor: `${RARITY_COLORS[selectedItem.rarity]}22`, borderColor: `${RARITY_COLORS[selectedItem.rarity]}44` }]}>
                    <Text style={[styles.rarityText, { color: RARITY_COLORS[selectedItem.rarity] }]}>{selectedItem.rarity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.confirmBonuses}>
                    {Object.entries(selectedItem.statBonuses).map(([k, v]) => `${k} +${v}`).join(', ')}
                  </Text>
                </View>

                <View style={styles.reactionBubble}>
                  <Text style={styles.reactionText}>
                    {selectedFriend.displayName} will probably say:{'\n'}
                    <Text style={styles.reactionQuote}>"{getRandomReaction(selectedFriend.displayName)}"</Text>
                  </Text>
                </View>

                <View style={styles.friendshipBoost}>
                  <Text style={styles.friendshipBoostText}>+5 Friendship</Text>
                </View>

                <TouchableOpacity
                  style={[styles.sendBtn, remainingGifts <= 0 && styles.sendBtnDisabled]}
                  onPress={handleSendGift}
                  disabled={remainingGifts <= 0}
                >
                  <Text style={styles.sendBtnText}>Send Gift</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  friendSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: spacing.sm,
  },
  friendChip: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    minWidth: 72,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  friendChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  friendChipName: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  friendChipNameActive: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  giftLimitBadge: {
    marginTop: 4,
    backgroundColor: `${colors.primary}33`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  giftLimitText: {
    fontSize: 9,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  limitBar: {
    height: 5,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  limitFill: {
    height: 5,
    borderRadius: 3,
  },
  limitText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gridItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  rarityStripe: {
    height: 4,
  },
  itemContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 32, marginBottom: 6 },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bonusText: {
    fontSize: 11,
    color: colors.success,
    textAlign: 'center',
  },
  historyCard: { marginTop: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyEmoji: { fontSize: 20, marginRight: spacing.sm },
  historyInfo: { flex: 1 },
  historyItemName: { fontSize: 14, fontWeight: '700', color: colors.text },
  historyDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  historyDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
  },
  confirmEmoji: { fontSize: 48, marginBottom: spacing.sm },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  confirmTo: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  confirmFriendName: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  confirmDetails: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  confirmBonuses: {
    fontSize: 13,
    color: colors.success,
    marginTop: 6,
  },
  reactionBubble: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  reactionText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  reactionQuote: {
    color: colors.text,
    fontStyle: 'italic',
  },
  friendshipBoost: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  friendshipBoostText: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});
