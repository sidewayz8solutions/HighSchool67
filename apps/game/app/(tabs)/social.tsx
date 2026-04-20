import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { AnimatedPortrait } from '@/components/visuals';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Mock Data ────────────────────────────────────────────────────

const FRIENDS_PREVIEW = [
  { id: '1', name: 'Chad', clique: 'jock', relationship: 75, seed: 'chad-jock', lastActive: '2m ago' },
  { id: '2', name: 'Britney', clique: 'popular', relationship: 60, seed: 'britney-popular', lastActive: '15m ago' },
  { id: '3', name: 'Dexter', clique: 'nerd', relationship: 85, seed: 'dexter-nerd', lastActive: '1h ago' },
];

const SOCIAL_FEED = [
  { id: 'f1', npc: 'Chad', action: 'scored a touchdown at practice', time: '10m ago', icon: '🏈' },
  { id: 'f2', npc: 'Britney', action: 'posted about student council elections', time: '25m ago', icon: '📢' },
  { id: 'f3', npc: 'Raven', action: 'wrote a new poem in the cemetery', time: '1h ago', icon: '🖤' },
];

const TOURNAMENT_PREVIEW = {
  name: 'Spring Showdown',
  daysLeft: 3,
  yourRank: 12,
  totalPlayers: 156,
  topPlayer: 'Chad',
  topScore: 2450,
};

// ─── Components ───────────────────────────────────────────────────

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {badge && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

function SeeAllButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.seeAll} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.seeAllText}>See All →</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const npcs = useGameStore((s) => s.npcs);
  const unlockedNpcs = npcs.filter((n) => n.unlocked).slice(0, 5);

  // Use real NPC data if available, otherwise fall back to mock
  const friendsList = unlockedNpcs.length >= 3
    ? unlockedNpcs.slice(0, 3).map((n) => ({
        id: n.id,
        name: n.name,
        clique: n.clique,
        relationship: n.relationship,
        seed: n.visualConfig.seed,
        lastActive: 'now',
      }))
    : FRIENDS_PREVIEW;

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Social</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Friends, drama, and everything in between.</Text>
        </Animated.View>

        {/* Friends Hub */}
        <Animated.View entering={FadeInUp.delay(100).duration(450)}>
          <Card glow style={styles.card}>
            <SectionHeader title="Friends Hub" badge={`${unlockedNpcs.length} online`} />
            <View style={styles.friendsRow}>
              {friendsList.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => router.push({ pathname: '/ai-dialogue', params: { npcId: friend.id } })}
                  activeOpacity={0.7}
                >
                  <AnimatedPortrait
                    seed={friend.seed}
                    size={56}
                    emotion={friend.relationship > 70 ? 'joy' : 'neutral'}
                    blinking
                  />
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendClique}>{friend.clique}</Text>
                  <View style={styles.friendshipBar}>
                    <View
                      style={[
                        styles.friendshipFill,
                        {
                          width: `${friend.relationship}%`,
                          backgroundColor:
                            friend.relationship > 70
                              ? colors.success
                              : friend.relationship > 40
                              ? colors.warning
                              : colors.danger,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.friendshipText}>{friend.relationship}/100</Text>
                </TouchableOpacity>
              ))}
            </View>
            <SeeAllButton onPress={() => router.push('/friends')} />
          </Card>
        </Animated.View>

        {/* Social Feed */}
        <Animated.View entering={FadeInUp.delay(200).duration(450)}>
          <Card style={styles.card}>
            <SectionHeader title="Social Feed" />
            {SOCIAL_FEED.map((item) => (
              <View key={item.id} style={styles.feedItem}>
                <View style={styles.feedIconBubble}>
                  <Text style={styles.feedIcon}>{item.icon}</Text>
                </View>
                <View style={styles.feedContent}>
                  <Text style={styles.feedText}>
                    <Text style={styles.feedNpcName}>{item.npc}</Text>{' '}
                    {item.action}
                  </Text>
                  <Text style={styles.feedTime}>{item.time}</Text>
                </View>
              </View>
            ))}
            <SeeAllButton onPress={() => router.push('/social-feed')} />
          </Card>
        </Animated.View>

        {/* Gift Center */}
        <Animated.View entering={FadeInUp.delay(300).duration(450)}>
          <Card style={[styles.card, styles.giftCard]}>
            <View style={styles.giftRow}>
              <View style={styles.giftInfo}>
                <Text style={styles.giftTitle}>🎁 Daily Gifts</Text>
                <Text style={styles.giftSubtitle}>Send gifts to boost friendships</Text>
                <View style={styles.giftStatusRow}>
                  <View style={styles.giftStatusDot} />
                  <Text style={styles.giftStatusText}>3 gifts available today</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.giftButton}
                onPress={() => router.push('/gift-exchange')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={colors.gradientGold }
                  style={styles.giftButtonGradient}
                >
                  <Text style={styles.giftButtonText}>Send Gift</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {/* Tournament */}
        <Animated.View entering={FadeInUp.delay(400).duration(450)}>
          <Card glow style={[styles.card, styles.tournamentCard]}>
            <SectionHeader title="Tournament" badge={`${TOURNAMENT_PREVIEW.daysLeft}d left`} />
            <View style={styles.tournamentBanner}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tournamentGradient}
              >
                <Text style={styles.tournamentName}>{TOURNAMENT_PREVIEW.name}</Text>
                <View style={styles.tournamentStats}>
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatValue}>#{TOURNAMENT_PREVIEW.yourRank}</Text>
                    <Text style={styles.tournamentStatLabel}>Your Rank</Text>
                  </View>
                  <View style={styles.tournamentDivider} />
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatValue}>{TOURNAMENT_PREVIEW.totalPlayers}</Text>
                    <Text style={styles.tournamentStatLabel}>Players</Text>
                  </View>
                  <View style={styles.tournamentDivider} />
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatValue}>{TOURNAMENT_PREVIEW.topPlayer}</Text>
                    <Text style={styles.tournamentStatLabel}>#1 Spot</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            <TouchableOpacity
              style={styles.tournamentBtn}
              onPress={() => router.push('/tournament')}
              activeOpacity={0.7}
            >
              <Text style={styles.tournamentBtnText}>View Full Leaderboard</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  headerBadge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  card: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: colors.primaryGlow,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sectionBadgeText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  seeAll: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  seeAllText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },

  // Friends
  friendsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  friendItem: {
    alignItems: 'center',
    width: SCREEN_W * 0.22,
  },
  friendName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  friendClique: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  friendshipBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  friendshipFill: {
    height: 4,
    borderRadius: 2,
  },
  friendshipText: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },

  // Feed
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  feedIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  feedIcon: {
    fontSize: 16,
  },
  feedContent: {
    flex: 1,
  },
  feedText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  feedNpcName: {
    color: colors.text,
    fontWeight: '700',
  },
  feedTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  // Gift Center
  giftCard: {
    borderColor: 'rgba(245,158,11,0.2)',
  },
  giftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftInfo: {
    flex: 1,
  },
  giftTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  giftSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  giftStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  giftStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  giftStatusText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  giftButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  giftButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  giftButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  // Tournament
  tournamentCard: {
    borderColor: 'rgba(99,102,241,0.2)',
  },
  tournamentBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  tournamentGradient: {
    padding: spacing.md,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  tournamentStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentStat: {
    flex: 1,
    alignItems: 'center',
  },
  tournamentStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  tournamentStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tournamentDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tournamentBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tournamentBtnText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
});
