import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import {
  GAME_TYPES,
  getWeeklyTournament,
  formatCountdown,
  getActiveTournaments,
  getTournamentHistory,
  getRewardsForRank,
  LEADERBOARD_NPCS,
  useGameStore,
} from '@repo/game-engine';
import { NpcAvatar } from '@/components/visuals';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Tournament, LeaderboardEntry, TournamentReward } from '@repo/game-engine';

const GAME_TYPE_EMOJI: Record<string, string> = {
  'Math Blitz': '🔢',
  'Memory Match': '🧠',
  'Dance Battle': '💃',
  'Art Studio': '🎨',
  'Football Toss': '🏈',
  'Word Puzzle': '📝',
  'Rhythm Game': '🎵',
  'Trivia Challenge': '❓',
  'Speed Run': '⚡',
  'Photo Hunt': '📸',
};

const GAME_ROUTES: Record<string, string> = {
  'Math Blitz': '/math-blitz',
  'Memory Match': '/memory-match',
  'Dance Battle': '/dance-battle',
  'Art Studio': '/art-studio',
  'Football Toss': '/football-toss',
};

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(targetDate));
      scale.value = withSpring(1.05, { damping: 4, stiffness: 200 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      }, 200);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, scale]);

  return (
    <Animated.View style={[styles.countdownBox, animatedStyle]}>
      <Text style={styles.countdownLabel}>Ends In</Text>
      <Text style={styles.countdownValue}>{timeLeft}</Text>
    </Animated.View>
  );
}

function RewardRow({ reward, isHighlighted }: { reward: TournamentReward; isHighlighted: boolean }) {
  return (
    <View style={[styles.rewardRow, isHighlighted && styles.rewardRowHighlighted]}>
      <Text style={styles.rewardRank}>
        {reward.rankMin === reward.rankMax ? `#${reward.rankMin}` : `#${reward.rankMin}-${reward.rankMax}`}
      </Text>
      <View style={styles.rewardPrizes}>
        <Text style={styles.rewardPoints}>+{reward.points} pts</Text>
        <Text style={styles.rewardGems}>+{reward.gems} 💎</Text>
      </View>
      {reward.itemName && <Text style={styles.rewardItem}>🎁 {reward.itemName}</Text>}
    </View>
  );
}

export default function TournamentScreen() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);

  const [selectedGame, setSelectedGame] = useState<string>(GAME_TYPES[0]);
  const [tournament, setTournament] = useState<Tournament>(getWeeklyTournament(GAME_TYPES[0]));
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>(getActiveTournaments());
  const [history, setHistory] = useState<ReturnType<typeof getTournamentHistory>>(getTournamentHistory());

  useEffect(() => {
    setTournament(getWeeklyTournament(selectedGame));
  }, [selectedGame]);

  const handlePlayGame = useCallback(() => {
    const route = GAME_ROUTES[selectedGame];
    if (route) {
      router.push(route as any);
    }
  }, [selectedGame, router]);

  const playerEntry = tournament.entries.find((e) => e.isPlayer);
  const playerRank = playerEntry?.rank ?? 0;
  const topEntries = tournament.entries.slice(0, 10);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankDefault;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#f59e0b';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#b45309';
    return colors.textMuted;
  };

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tournament Hub</Text>
        <Text style={styles.subtitle}>Compete weekly for glory and rewards.</Text>

        {/* Active Tournament Banner */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card glow style={styles.bannerCard}>
            <LinearGradient
              colors={['rgba(99,102,241,0.15)', 'rgba(236,72,153,0.1)']}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerHeader}>
                <Text style={styles.bannerGameType}>{GAME_TYPE_EMOJI[selectedGame]} {selectedGame}</Text>
                <View style={[styles.statusBadge, tournament.status === 'active' ? styles.statusActive : styles.statusUpcoming]}>
                  <Text style={styles.statusText}>{tournament.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.bannerTitle}>{tournament.name}</Text>
              <CountdownDisplay targetDate={tournament.endTime} />

              {playerRank > 0 && (
                <View style={styles.playerRankBanner}>
                  <Text style={styles.playerRankText}>Your Rank: <Text style={styles.playerRankNum}>#{playerRank}</Text> of {tournament.entries.length}</Text>
                  <Text style={styles.playerScoreText}>Score: {playerEntry?.score ?? 0}</Text>
                </View>
              )}
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Game Type Selector */}
        <Text style={styles.sectionTitle}>Select Game</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gameSelector}
        >
          {GAME_TYPES.map((game, index) => (
            <Animated.View key={game} entering={FadeInUp.delay(index * 40)}>
              <TouchableOpacity
                style={[
                  styles.gameChip,
                  selectedGame === game && styles.gameChipActive,
                ]}
                onPress={() => setSelectedGame(game)}
              >
                <Text style={styles.gameChipEmoji}>{GAME_TYPE_EMOJI[game]}</Text>
                <Text style={[styles.gameChipText, selectedGame === game && styles.gameChipTextActive]}>
                  {game}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <Card style={styles.leaderboardCard}>
          {topEntries.map((entry, index) => (
            <Animated.View key={`${entry.playerId}-${index}`} entering={FadeInUp.delay(index * 50)}>
              <View style={[styles.leaderboardRow, entry.isPlayer && styles.playerRow]}>
                <Text style={[styles.rankNum, getRankStyle(entry.rank), { color: getRankColor(entry.rank) }]}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </Text>
                <NpcAvatar
                  seed={entry.avatarConfig.seed}
                  hair={entry.avatarConfig.hair}
                  hairColor={entry.avatarConfig.hairColor}
                  skinColor={entry.avatarConfig.skinColor}
                  size={36}
                />
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryName, entry.isPlayer && styles.entryNamePlayer]}>
                    {entry.name} {entry.isPlayer ? '(You)' : ''}
                  </Text>
                  <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.entryScore, entry.isPlayer && styles.entryScorePlayer]}>
                  {entry.score.toLocaleString()}
                </Text>
              </View>
              {index < topEntries.length - 1 && <View style={styles.divider} />}
            </Animated.View>
          ))}
        </Card>

        {/* Rewards */}
        <Text style={styles.sectionTitle}>Rewards</Text>
        <Card style={styles.rewardsCard}>
          {tournament.rewards.slice(0, 4).map((reward, index) => (
            <RewardRow
              key={index}
              reward={reward}
              isHighlighted={playerRank > 0 && playerRank >= reward.rankMin && playerRank <= reward.rankMax}
            />
          ))}
        </Card>

        {/* Play Button */}
        <TouchableOpacity style={styles.playBtn} onPress={handlePlayGame}>
          <LinearGradient
            colors={colors.gradientPrimary }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playBtnGradient}
          >
            <Text style={styles.playBtnText}>Play to Improve Score</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tournament History */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent History</Text>
            {history.map((h, index) => (
              <Animated.View key={h.id} entering={FadeInUp.delay(index * 60)}>
                <Card style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyName}>{h.name}</Text>
                      <Text style={styles.historyDate}>Ended {new Date(h.endTime).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.historyRank}>
                      <Text style={styles.historyRankNum}>#{h.finalRank}</Text>
                      <Text style={styles.historyScore}>{h.score.toLocaleString()}</Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </>
        )}

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
  bannerCard: { marginBottom: spacing.lg },
  bannerGradient: {
    padding: spacing.lg,
    borderRadius: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bannerGameType: { fontSize: 14, fontWeight: '700', color: colors.primaryLight },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: { backgroundColor: 'rgba(34,197,94,0.2)' },
  statusUpcoming: { backgroundColor: 'rgba(245,158,11,0.2)' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: spacing.md },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: spacing.md,
  },
  countdownLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  countdownValue: { fontSize: 28, fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] },
  playerRankBanner: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  playerRankText: { fontSize: 14, color: colors.textSecondary },
  playerRankNum: { fontSize: 18, fontWeight: '900', color: colors.primaryLight },
  playerScoreText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  gameSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: spacing.sm,
  },
  gameChip: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gameChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}22`,
  },
  gameChipEmoji: { fontSize: 22, marginBottom: 4 },
  gameChipText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  gameChipTextActive: { color: colors.primaryLight, fontWeight: '800' },
  leaderboardCard: { marginBottom: spacing.md },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerRow: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  rankNum: {
    width: 40,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  rankGold: { fontSize: 20 },
  rankSilver: { fontSize: 18 },
  rankBronze: { fontSize: 18 },
  rankDefault: {},
  entryInfo: { flex: 1, marginLeft: spacing.sm },
  entryName: { fontSize: 14, fontWeight: '700', color: colors.text },
  entryNamePlayer: { color: colors.primaryLight },
  entryDate: { fontSize: 11, color: colors.textMuted },
  entryScore: { fontSize: 14, fontWeight: '800', color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  entryScorePlayer: { color: colors.primaryLight },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rewardsCard: { marginBottom: spacing.md },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  rewardRowHighlighted: {
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  rewardRank: {
    width: 60,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
  },
  rewardPrizes: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  rewardGems: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentLight,
  },
  rewardItem: {
    fontSize: 12,
    color: colors.warning,
  },
  playBtn: {
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  playBtnGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  playBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyCard: { marginBottom: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: { fontSize: 14, fontWeight: '700', color: colors.text },
  historyDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  historyRank: { alignItems: 'flex-end' },
  historyRankNum: { fontSize: 16, fontWeight: '900', color: colors.primaryLight },
  historyScore: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
