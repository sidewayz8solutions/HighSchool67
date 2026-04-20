import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const isTablet = SCREEN_W > 768;
const COLUMNS = isTablet ? 5 : 3;
const CARD_SIZE = (SCREEN_W - spacing.lg * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS;

// ─── Game Data ────────────────────────────────────────────────────

interface MiniGame {
  id: string;
  name: string;
  icon: string;
  route: string;
  stat: 'Academics' | 'Athletics' | 'Creativity' | 'Popularity';
  bestScore: number;
  color: string;
  gradient: [string, string];
  description: string;
}

const GAMES: MiniGame[] = [
  {
    id: 'math-blitz',
    name: 'Math Blitz',
    icon: '∑',
    route: '/math-blitz',
    stat: 'Academics',
    bestScore: 0,
    color: '#3b82f6',
    gradient: ['#3b82f6', '#1d4ed8'],
    description: 'Rapid-fire math puzzles',
  },
  {
    id: 'football-toss',
    name: 'Football Toss',
    icon: '🏈',
    route: '/football-toss',
    stat: 'Athletics',
    bestScore: 0,
    color: '#22c55e',
    gradient: ['#22c55e', '#15803d'],
    description: 'Aim and throw touchdowns',
  },
  {
    id: 'dance-battle',
    name: 'Dance Battle',
    icon: '♪',
    route: '/dance-battle',
    stat: 'Popularity',
    bestScore: 0,
    color: '#ec4899',
    gradient: ['#ec4899', '#be185d'],
    description: 'Hit the beat, own the floor',
  },
  {
    id: 'art-studio',
    name: 'Art Studio',
    icon: '🎨',
    route: '/art-studio',
    stat: 'Creativity',
    bestScore: 0,
    color: '#a855f7',
    gradient: ['#a855f7', '#7c3aed'],
    description: 'Create masterpieces',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    icon: '🧠',
    route: '/memory-match',
    stat: 'Academics',
    bestScore: 0,
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    description: 'Test your memory skills',
  },
  {
    id: 'word-blitz',
    name: 'Word Blitz',
    icon: 'W',
    route: '/word-blitz',
    stat: 'Academics',
    bestScore: 0,
    color: '#6366f1',
    gradient: ['#6366f1', '#4f46e5'],
    description: 'Spell words under pressure',
  },
  {
    id: 'rhythm-strike',
    name: 'Rhythm Strike',
    icon: '🎵',
    route: '/rhythm-strike',
    stat: 'Creativity',
    bestScore: 0,
    color: '#06b6d4',
    gradient: ['#06b6d4', '#0891b2'],
    description: 'Perfect your timing',
  },
  {
    id: 'photo-hunt',
    name: 'Photo Hunt',
    icon: '📸',
    route: '/photo-hunt',
    stat: 'Creativity',
    bestScore: 0,
    color: '#f97316',
    gradient: ['#f97316', '#ea580c'],
    description: 'Spot the differences',
  },
  {
    id: 'debate-club',
    name: 'Debate Club',
    icon: '🗣️',
    route: '/debate-club',
    stat: 'Popularity',
    bestScore: 0,
    color: '#14b8a6',
    gradient: ['#14b8a6', '#0d9488'],
    description: 'Argue and persuade',
  },
  {
    id: 'coding-challenge',
    name: 'Coding Challenge',
    icon: '</>',
    route: '/coding-challenge',
    stat: 'Academics',
    bestScore: 0,
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
    description: 'Debug and optimize code',
  },
];

const STAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Academics: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: '📚 Academic' },
  Athletics: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: '💪 Athletic' },
  Creativity: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: '🎨 Creative' },
  Popularity: { bg: 'rgba(236,72,153,0.15)', text: '#ec4899', label: '⭐ Social' },
};

// ─── Game Card ────────────────────────────────────────────────────

function GameCard({ game, index }: { game: MiniGame; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const statInfo = STAT_COLORS[game.stat];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400)}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(game.route as any)}
        style={styles.gameCard}
      >
        <LinearGradient
          colors={game.gradient}
          style={styles.gameIconBg}
        >
          <Text style={styles.gameIcon}>{game.icon}</Text>
        </LinearGradient>
        <Text style={styles.gameName} numberOfLines={1}>
          {game.name}
        </Text>
        <Text style={styles.gameDescription} numberOfLines={1}>
          {game.description}
        </Text>
        <View style={[styles.statBadge, { backgroundColor: statInfo.bg }]}>
          <Text style={[styles.statText, { color: statInfo.text }]}>
            +{game.stat}
          </Text>
        </View>
        {game.bestScore > 0 && (
          <Text style={styles.bestScore}>Best: {game.bestScore}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function MiniGameHubScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const playerStats = useGameStore((s) => s.player.stats);

  const filters = ['All', 'Academics', 'Athletics', 'Creativity', 'Popularity'];

  const filteredGames = selectedFilter === 'All'
    ? GAMES
    : GAMES.filter((g) => g.stat === selectedFilter);

  const recentlyPlayed = GAMES.slice(0, 3); // Would come from actual play history

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with gradient text */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <LinearGradient
            colors={colors.gradientPrimary }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>🕹️ Arcade</Text>
          </LinearGradient>
          <Text style={styles.subtitle}>Play mini-games to boost your stats and earn rewards.</Text>
        </Animated.View>

        {/* Tournament Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <TouchableOpacity
            style={styles.tournamentBanner}
            onPress={() => router.push('/tournament')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tournamentGradient}
            >
              <View style={styles.tournamentContent}>
                <Text style={styles.tournamentLabel}>🏆 LIVE TOURNAMENT</Text>
                <Text style={styles.tournamentName}>Spring Showdown</Text>
                <Text style={styles.tournamentSubtitle}>3 days left • 156 players competing</Text>
              </View>
              <View style={styles.tournamentCta}>
                <Text style={styles.tournamentCtaText}>Join →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recently Played */}
        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyPlayedRow}
          >
            {recentlyPlayed.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.recentCard}
                onPress={() => router.push(game.route as any)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={game.gradient} style={styles.recentIconBg}>
                  <Text style={styles.recentIcon}>{game.icon}</Text>
                </LinearGradient>
                <Text style={styles.recentName}>{game.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter === 'All' ? 'All Games' : STAT_COLORS[filter]?.label ?? filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Game Grid */}
        <View style={styles.gameGrid}>
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </View>

        {/* Stats Summary */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Academics', value: playerStats.academics, color: '#3b82f6' },
                { label: 'Athletics', value: playerStats.athletics, color: '#22c55e' },
                { label: 'Creativity', value: playerStats.creativity, color: '#a855f7' },
                { label: 'Popularity', value: playerStats.popularity, color: '#ec4899' },
              ].map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
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
  container: { padding: spacing.lg, paddingTop: 60 },

  titleGradient: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },

  // Tournament Banner
  tournamentBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tournamentGradient: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentContent: {
    flex: 1,
  },
  tournamentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },
  tournamentSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
  },
  tournamentCta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  tournamentCtaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Recently Played
  recentlyPlayedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  recentCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    width: 72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recentIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  recentName: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Filter Chips
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Game Grid
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardWrapper: {
    width: CARD_SIZE,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  gameIconBg: {
    width: CARD_SIZE * 0.45,
    height: CARD_SIZE * 0.45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gameIcon: {
    fontSize: CARD_SIZE * 0.2,
    fontWeight: '900',
    color: '#fff',
  },
  gameName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  gameDescription: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 4,
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statText: {
    fontSize: 9,
    fontWeight: '700',
  },
  bestScore: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },

  // Stats Summary
  statsCard: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    flex: 1,
    minWidth: '45%',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
