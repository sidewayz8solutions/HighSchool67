import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import {
  MOCK_FRIENDS,
  generateFriendCode,
  addFriendByCode,
  removeFriend,
  compareStats,
  getMockPlayerFromFriend,
  useGameStore,
} from '@repo/game-engine';
import { NpcAvatar } from '@/components/visuals';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { Friend, StatComparison } from '@repo/game-engine';

export default function FriendsScreen() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);

  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [statsComparison, setStatsComparison] = useState<StatComparison[]>([]);

  const myFriendCode = generateFriendCode(player.id);

  const handleAddFriend = useCallback(() => {
    if (!friendCode.trim()) return;
    const result = addFriendByCode(friends, friendCode.trim(), MOCK_FRIENDS);
    if (result.success && result.friend) {
      setFriends((prev) => [...prev, result.friend!]);
      setFriendCode('');
      setAddModalVisible(false);
    } else {
      Alert.alert('Error', result.error ?? 'Could not add friend');
    }
  }, [friendCode, friends]);

  const handleRemoveFriend = useCallback((friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setFriends((prev) => removeFriend(prev, friendId)),
        },
      ]
    );
  }, []);

  const handleViewStats = useCallback((friend: Friend) => {
    const mockPlayer = getMockPlayerFromFriend(friend);
    const comparison = compareStats(player, mockPlayer);
    setStatsComparison(comparison);
    setSelectedFriend(friend);
    setStatsModalVisible(true);
  }, [player]);

  const handleVisitRoom = useCallback((friend: Friend) => {
    router.push({ pathname: '/room', params: { friendId: friend.id, viewing: 'true' } });
  }, [router]);

  const handleSendGift = useCallback((friend: Friend) => {
    router.push({ pathname: '/gift-exchange', params: { friendId: friend.id } });
  }, [router]);

  const formatLastActive = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getFriendshipColor = (level: number): string => {
    if (level >= 80) return '#ec4899';
    if (level >= 50) return '#22c55e';
    if (level >= 25) return '#f59e0b';
    return '#64748b';
  };

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.subtitle}>{friends.length} friends • Your code: <Text style={styles.codeText}>{myFriendCode}</Text></Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {friends.length === 0 && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👋</Text>
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptyText}>Share your friend code or add others to connect!</Text>
              <Text style={styles.emptyCode}>Your code: {myFriendCode}</Text>
            </Card>
          </Animated.View>
        )}

        {friends.map((friend, index) => (
          <Animated.View key={friend.id} entering={FadeInUp.delay(index * 80)}>
            <Card style={styles.friendCard}>
              <TouchableOpacity
                onPress={() => handleViewStats(friend)}
                onLongPress={() => handleRemoveFriend(friend.id)}
                delayLongPress={500}
                activeOpacity={0.8}
              >
                <View style={styles.friendRow}>
                  <NpcAvatar
                    seed={friend.avatarConfig.seed}
                    hair={friend.avatarConfig.hair}
                    hairColor={friend.avatarConfig.hairColor}
                    skinColor={friend.avatarConfig.skinColor}
                    size={60}
                    borderColor={getFriendshipColor(friend.friendshipLevel)}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.displayName}</Text>
                    <Text style={styles.friendMeta}>Lv.{friend.level} • {friend.currentCareer}</Text>
                    <Text style={styles.lastActive}>Last active: {formatLastActive(friend.lastActive)}</Text>
                    <View style={styles.friendshipRow}>
                      <View style={[styles.friendshipBar, { backgroundColor: `${getFriendshipColor(friend.friendshipLevel)}33` }]}>
                        <View style={[styles.friendshipFill, { width: `${friend.friendshipLevel}%`, backgroundColor: getFriendshipColor(friend.friendshipLevel) }]} />
                      </View>
                      <Text style={[styles.friendshipText, { color: getFriendshipColor(friend.friendshipLevel) }]}>{friend.friendshipLevel}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewStats(friend)}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <Text style={styles.actionLabel}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleVisitRoom(friend)}>
                  <Text style={styles.actionIcon}>🚪</Text>
                  <Text style={styles.actionLabel}>Visit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleSendGift(friend)}>
                  <Text style={styles.actionIcon}>🎁</Text>
                  <Text style={styles.actionLabel}>Gift</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemoveFriend(friend.id)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <Text style={[styles.actionLabel, styles.removeText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        ))}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <Text style={styles.modalSubtitle}>Your Friend Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxText}>{myFriendCode}</Text>
            </View>

            <Text style={styles.inputLabel}>Enter Friend Code</Text>
            <TextInput
              style={styles.codeInput}
              value={friendCode}
              onChangeText={setFriendCode}
              placeholder="HS67-XXXX-XXXX"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={20}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddFriend}>
              <Text style={styles.submitBtnText}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddModalVisible(false); setFriendCode(''); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>

      {/* Stats Comparison Modal */}
      <Modal visible={statsModalVisible} transparent animationType="slide" onRequestClose={() => setStatsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            {selectedFriend && (
              <>
                <View style={styles.statsHeader}>
                  <NpcAvatar
                    seed={selectedFriend.avatarConfig.seed}
                    hair={selectedFriend.avatarConfig.hair}
                    hairColor={selectedFriend.avatarConfig.hairColor}
                    skinColor={selectedFriend.avatarConfig.skinColor}
                    size={56}
                  />
                  <View style={{ marginLeft: spacing.md }}>
                    <Text style={styles.statsFriendName}>{selectedFriend.displayName}</Text>
                    <Text style={styles.statsFriendMeta}>Lv.{selectedFriend.level} • {selectedFriend.currentCareer}</Text>
                  </View>
                </View>

                <Text style={styles.statsTitle}>Stat Comparison</Text>
                {statsComparison.map((comp) => (
                  <View key={comp.stat} style={styles.statRow}>
                    <Text style={styles.statName}>{comp.stat}</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${Math.min(100, comp.playerValue)}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={styles.statValueYou}>{comp.playerValue}</Text>
                    <View style={styles.statBarContainer}>
                      <View style={[styles.statBar, { width: `${Math.min(100, comp.friendValue)}%`, backgroundColor: colors.secondary }]} />
                    </View>
                    <Text style={styles.statValueFriend}>{comp.friendValue}</Text>
                    <Text style={[styles.diffText, comp.diff > 0 ? styles.diffPositive : comp.diff < 0 ? styles.diffNegative : styles.diffNeutral]}>
                      {comp.diff > 0 ? '+' : ''}{comp.diff}
                    </Text>
                  </View>
                ))}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => { setStatsModalVisible(false); handleVisitRoom(selectedFriend); }}>
                    <Text style={styles.modalActionText}>Visit Room</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => { setStatsModalVisible(false); handleSendGift(selectedFriend); }}>
                    <Text style={styles.modalActionText}>Send Gift</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setStatsModalVisible(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  codeText: { color: colors.primaryLight, fontWeight: '700' },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  emptyCode: { fontSize: 14, color: colors.primaryLight, fontWeight: '700', marginTop: spacing.sm },
  friendCard: { marginBottom: spacing.md },
  friendRow: { flexDirection: 'row', alignItems: 'center' },
  friendInfo: { flex: 1, marginLeft: spacing.md },
  friendName: { fontSize: 18, fontWeight: '800', color: colors.text },
  friendMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  lastActive: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  friendshipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  friendshipBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  friendshipFill: {
    height: 5,
    borderRadius: 3,
  },
  friendshipText: {
    fontSize: 11,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 10, color: colors.text, fontWeight: '700', marginTop: 2 },
  removeBtn: { backgroundColor: 'rgba(239,68,68,0.1)' },
  removeText: { color: colors.danger },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  codeBox: {
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeBoxText: { fontSize: 18, fontWeight: '800', color: colors.primaryLight, letterSpacing: 1 },
  inputLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  codeInput: {
    backgroundColor: colors.surfaceHighlight,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsFriendName: { fontSize: 20, fontWeight: '800', color: colors.text },
  statsFriendMeta: { fontSize: 13, color: colors.textMuted },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    width: 70,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  statBar: {
    height: 6,
    borderRadius: 3,
  },
  statValueYou: { width: 28, fontSize: 11, color: colors.primaryLight, fontWeight: '700', textAlign: 'center' },
  statValueFriend: { width: 28, fontSize: 11, color: colors.secondaryLight, fontWeight: '700', textAlign: 'center' },
  diffText: { width: 32, fontSize: 11, fontWeight: '800', textAlign: 'right' },
  diffPositive: { color: colors.success },
  diffNegative: { color: colors.danger },
  diffNeutral: { color: colors.textMuted },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  closeBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  closeBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
});
