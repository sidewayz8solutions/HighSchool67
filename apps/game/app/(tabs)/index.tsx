import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { AvatarPreview } from '@/components/avatar-preview';
import { Particles, CurrencyBadge } from '@/components/visuals';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function StatBar({ label, value, color, delay }: { label: string; value: number; color: string; delay?: number }) {
  const width = useSharedValue(0);
  useEffect(() => { width.value = withSpring(value, { damping: 15, stiffness: 120 }); }, [value]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barFill, animatedStyle, { backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const GAME_ICONS: Record<string, { gradient: [string, string]; icon: string }> = {
  'Math Blitz': { gradient: ['#3b82f6', '#1d4ed8'], icon: '∑' },
  'Football Toss': { gradient: ['#ef4444', '#b91c1c'], icon: 'F' },
  'Dance Battle': { gradient: ['#ec4899', '#be185d'], icon: '♪' },
  'Art Studio': { gradient: ['#a855f7', '#7c3aed'], icon: 'A' },
  'Memory Match': { gradient: ['#f59e0b', '#d97706'], icon: 'M' },
};

export default function HomeScreen() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);
  const progress = useGameStore((s) => s.progress);
  const challenges = useGameStore((s) => s.challenges);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const refillEnergy = useGameStore((s) => s.refillEnergy);
  const [particles, setParticles] = useState(false);
  const [eventMsg, setEventMsg] = useState('');

  const handleAdvance = () => {
    const result = advanceTime();
    if (result.event) {
      setEventMsg(`${result.event.title}: ${result.event.description.substring(0, 80)}...`);
    }
    if (result.unlockedNpcs.length > 0) {
      setEventMsg((prev) => prev + `\nNew: ${result.unlockedNpcs.map((n) => n.name).join(', ')} unlocked!`);
    }
    setParticles(true);
    setTimeout(() => setParticles(false), 2000);
  };

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Particles active={particles} onComplete={() => setParticles(false)} />

        {/* Header */}
        <View style={styles.header}>
          <AvatarPreview config={player.avatarConfig} size={90} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{player.name}</Text>
            <Text style={styles.subtitle}>
              {player.clique.charAt(0).toUpperCase() + player.clique.slice(1)} • Semester {progress.semester} • Day {progress.day}
            </Text>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>{progress.period.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.currencyRow}>
          <CurrencyBadge points={player.currency.points} gems={player.currency.gems} size="md" />
        </View>

        {/* Energy */}
        <Card glow style={styles.energyCard}>
          <View style={styles.energyRow}>
            <View style={[styles.energyDot, { backgroundColor: colors.warning }]} />
            <View style={styles.energyBarContainer}>
              <View style={styles.energyBarBg}>
                <View style={[styles.energyBarFill, { width: `${player.stats.energy}%` }]} />
              </View>
              <Text style={styles.energyText}>{player.stats.energy} / 100 ENERGY</Text>
            </View>
          </View>
          <Button title="Refill Energy (+20)" variant="secondary" onPress={() => refillEnergy(20)} />
        </Card>

        {/* Event Message */}
        {eventMsg ? (
          <Card glow style={[styles.card, { borderColor: colors.primary, borderWidth: 1 }]}>
            <Text style={styles.eventText}>{eventMsg}</Text>
          </Card>
        ) : null}

        {/* Stats */}
        <Card glow style={styles.card}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <StatBar label="Academics" value={player.stats.academics} color="#3b82f6" />
          <StatBar label="Athletics" value={player.stats.athletics} color="#22c55e" />
          <StatBar label="Creativity" value={player.stats.creativity} color="#a855f7" />
          <StatBar label="Popularity" value={player.stats.popularity} color="#ec4899" />
          <StatBar label="Rebellion" value={player.stats.rebellion} color="#64748b" />
          <StatBar label="Happiness" value={player.stats.happiness} color="#f59e0b" />
        </Card>

        {/* Daily Challenges */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          {challenges.map((c) => (
            <View key={c.id} style={styles.challengeRow}>
              <Text style={[styles.challengeTitle, c.completed && styles.completed]}>
                {c.completed ? 'Done: ' : ''}{c.title}
              </Text>
              <Text style={styles.challengeProgress}>
                {c.currentValue} / {c.targetValue}
              </Text>
            </View>
          ))}
        </Card>

        {/* Mini Games */}
        <Text style={styles.sectionTitle}>Mini-Games</Text>
        <View style={styles.gameGrid}>
          {[
            { name: 'Math Blitz', stat: 'Academics', route: '/math-blitz' },
            { name: 'Football Toss', stat: 'Athletics', route: '/football-toss' },
            { name: 'Dance Battle', stat: 'Popularity', route: '/dance-battle' },
            { name: 'Art Studio', stat: 'Creativity', route: '/art-studio' },
            { name: 'Memory Match', stat: 'Academics', route: '/memory-match' },
          ].map((game) => {
            const icon = GAME_ICONS[game.name];
            return (
              <TouchableOpacity key={game.name} style={styles.gameCard} onPress={() => router.push(game.route as any)}>
                <LinearGradient colors={icon.gradient as [string, string]} style={styles.gameIconBg}>
                  <Text style={styles.gameIcon}>{icon.icon}</Text>
                </LinearGradient>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameStat}>+{game.stat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title={progress.period === 'night' ? 'Go to Sleep' : 'Next Period'} onPress={handleAdvance} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  headerText: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  periodBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primaryGlow, borderWidth: 1,
    borderColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: spacing.sm,
  },
  periodText: { color: colors.primaryLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  currencyRow: { marginBottom: spacing.md },
  energyCard: { marginBottom: spacing.md },
  energyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  energyDot: { width: 12, height: 12, borderRadius: 6 },
  energyBarContainer: { flex: 1 },
  energyBarBg: { height: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 5, overflow: 'hidden' },
  energyBarFill: { height: 10, backgroundColor: colors.warning, borderRadius: 5 },
  energyText: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '600' },
  eventText: { color: colors.text, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  card: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: colors.textSecondary,
    marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statLabel: { width: 90, color: colors.textMuted, fontSize: 14 },
  barContainer: { flex: 1, height: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 5, marginHorizontal: spacing.sm, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  statValue: { width: 36, color: colors.text, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  challengeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  challengeTitle: { color: colors.text, fontSize: 14 },
  completed: { color: colors.textMuted },
  challengeProgress: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  gameCard: {
    width: '31%', backgroundColor: colors.surface, borderRadius: 12,
    padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  gameIconBg: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  gameIcon: { fontSize: 20, fontWeight: '900', color: '#fff' },
  gameName: { color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  gameStat: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});
