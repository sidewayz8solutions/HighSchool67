import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import {
  GAME_TYPES,
  LEADERBOARD_NPCS,
  useGameStore,
} from '@repo/game-engine';
import { NpcAvatar } from '@/components/visuals';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import type { LeaderboardEntry } from '@repo/game-engine';

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

type TimeFilter = 'all' | 'week' | 'today';

function PodiumEntry({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: number;
}) {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const podiumColors = ['#f59e0b', '#94a3b8', '#b45309'];
  const podiumColor = podiumColors[position - 1];
  const heights = [140, 110, 90];
  const height = heights[position - 1];

  return (
    <Animated.View
      entering={FadeIn.delay(position * 200).duration(600)}
      style={[
        styles.podiumEntry,
        { height },
        isFirst && styles.podiumFirst,
      ]}
    >
      <View style={[styles.podiumRankCircle, { backgroundColor: podiumColor }]}>
        <Text style={styles.podiumRankNum}>{position}</Text>
      </View>
      <NpcAvatar
        seed={entry.avatarConfig.seed}
        hair={entry.avatarConfig.hair}
        hairColor={entry.avatarConfig.hairColor}
        skinColor={entry.avatarConfig.skinColor}
        size={isFirst ? 56 : 44}
        borderColor={podiumColor}
      />
      <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
        {entry.name}
      </Text>
      <Text style={[styles.podiumScore, { color: podiumColor }]}>
        {entry.score.toLocaleString()}
      </Text>
      <View style={[styles.podiumBar, { backgroundColor: `${podiumColor}44`, height: isFirst ? 6 : isSecond ? 5 : 4 }]} />
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const player = useGameStore((s) => s.player);

  const [selectedGame, setSelectedGame] = useState<string>(GAME_TYPES[0]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const playerEntry: LeaderboardEntry = useMemo(() => ({
    rank: 0,
    playerId: player.id,
    name: player.name,
    score: 7200 + Math.floor(Math.random() * 2000),
    avatarConfig: {
      seed: player.name,
      hair: ['short01'],
      hairColor: player.avatarConfig.hairColor,
      skinColor: player.avatarConfig.skinTone,
    },
    date: new Date().toISOString(),
    isPlayer: true,
  }), [player]);

  const filteredEntries = useMemo(() => {
    let entries = [...LEADERBOARD_NPCS];

    if (timeFilter === 'today') {
      entries = entries.filter((e) => {
        const diff = Date.now() - new Date(e.date).getTime();
        return diff < 86400000;
      });
    } else if (timeFilter === 'week') {
      entries = entries.filter((e) => {
        const diff = Date.now() - new Date(e.date).getTime();
        return diff < 86400000 * 7;
      });
    }

    entries.push(playerEntry);
    entries.sort((a, b) => b.score - a.score);
    return entries.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [timeFilter, playerEntry]);

  const topThree = filteredEntries.slice(0, 3);
  const rest = filteredEntries.slice(3);

  const reorderedForPodium = [
    topThree.find((e) => e.rank === 2),
    topThree.find((e) => e.rank === 1),
    topThree.find((e) => e.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>The best of the best. Where do you rank?</Text>

        {/* Time Filter */}
        <View style={styles.filterRow}>
          {([
            { key: 'all', label: 'All Time' },
            { key: 'week', label: 'This Week' },
            { key: 'today', label: 'Today' },
          ] as const).map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, timeFilter === f.key && styles.filterChipActive]}
              onPress={() => setTimeFilter(f.key)}
            >
              <Text style={[styles.filterText, timeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Game Type Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gameSelector}
        >
          {GAME_TYPES.map((game) => (
            <TouchableOpacity
              key={game}
              style={[styles.gameTab, selectedGame === game && styles.gameTabActive]}
              onPress={() => setSelectedGame(game)}
            >
              <Text style={styles.gameTabEmoji}>{GAME_TYPE_EMOJI[game]}</Text>
              <Text style={[styles.gameTabText, selectedGame === game && styles.gameTabTextActive]}>
                {game}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Podium */}
        <View style={styles.podiumContainer}>
          {reorderedForPodium.map((entry, idx) => {
            const actualPosition = entry.rank;
            return (
              <PodiumEntry
                key={entry.playerId}
                entry={entry}
                position={actualPosition}
              />
            );
          })}
        </View>

        {/* Rank List */}
        <Text style={styles.sectionTitle}>Rankings</Text>
        <Card style={styles.rankingsCard}>
          {rest.map((entry, index) => (
            <Animated.View key={entry.playerId} entering={FadeInUp.delay(index * 40)}>
              <View style={[styles.rankRow, entry.isPlayer && styles.playerRankRow]}>
                <Text style={styles.rankNumber}>#{entry.rank}</Text>
                <NpcAvatar
                  seed={entry.avatarConfig.seed}
                  hair={entry.avatarConfig.hair}
                  hairColor={entry.avatarConfig.hairColor}
                  skinColor={entry.avatarConfig.skinColor}
                  size={36}
                />
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankName, entry.isPlayer && styles.rankNamePlayer]}>
                    {entry.name} {entry.isPlayer ? '(You)' : ''}
                  </Text>
                  <Text style={styles.rankDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.rankScore, entry.isPlayer && styles.rankScorePlayer]}>
                  {entry.score.toLocaleString()}
                </Text>
              </View>
              {index < rest.length - 1 && <View style={styles.rankDivider} />}
            </Animated.View>
          ))}

          {rest.length === 0 && (
            <Text style={styles.noEntriesText}>No additional entries yet.</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  gameSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: spacing.md,
  },
  gameTab: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gameTabActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}22`,
  },
  gameTabEmoji: { fontSize: 20, marginBottom: 4 },
  gameTabText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  gameTabTextActive: { color: colors.primaryLight, fontWeight: '800' },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    gap: 12,
    height: 180,
  },
  podiumEntry: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90,
  },
  podiumFirst: {
    zIndex: 1,
  },
  podiumRankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  podiumRankNum: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  podiumBar: {
    width: 60,
    borderRadius: 3,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  rankingsCard: { marginBottom: spacing.md },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerRankRow: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  rankNumber: {
    width: 44,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
    textAlign: 'center',
  },
  rankInfo: { flex: 1, marginLeft: spacing.sm },
  rankName: { fontSize: 14, fontWeight: '700', color: colors.text },
  rankNamePlayer: { color: colors.primaryLight },
  rankDate: { fontSize: 11, color: colors.textMuted },
  rankScore: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  rankScorePlayer: { color: colors.primaryLight },
  rankDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  noEntriesText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});
