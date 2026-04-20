import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { AvatarPreview } from '@/components/avatar-preview';
import { Particles, CurrencyBadge } from '@/components/visuals';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

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

// ─── Quick Action Button ──────────────────────────────────────────

function QuickActionButton({
  icon,
  label,
  onPress,
  gradient,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  gradient: [string, string];
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient colors={gradient} style={styles.quickActionIconBg}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
      </LinearGradient>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Widget Components ────────────────────────────────────────────

function DailyStreakWidget({ streak, router }: { streak: number; router: any }) {
  return (
    <TouchableOpacity
      style={styles.streakWidget}
      onPress={() => router.push('/daily-rewards')}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(245,158,11,0.2)', 'rgba(251,191,36,0.08)']}
        style={styles.streakGradient}
      >
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={styles.streakText}>
          <Text style={styles.streakTitle}>{streak} Day Streak</Text>
          <Text style={styles.streakSubtitle}>Tap to claim daily rewards</Text>
        </View>
        <Text style={styles.streakArrow}>→</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ActiveEventsWidget({ events }: { events: Array<{ id: string; title: string; time: string; color: string }> }) {
  return (
    <View>
      {events.slice(0, 2).map((event) => (
        <View key={event.id} style={styles.eventItem}>
          <View style={[styles.eventDot, { backgroundColor: event.color }]} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>{event.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function AtmosphereIndicator({ atmosphere }: { atmosphere: string }) {
  const atmosphereColors: Record<string, string> = {
    chill: '#22c55e',
    tense: '#f59e0b',
    dramatic: '#ef4444',
    romantic: '#ec4899',
    mysterious: '#a855f7',
  };
  const color = atmosphereColors[atmosphere] ?? colors.textMuted;

  return (
    <View style={styles.atmosphereBar}>
      <Text style={styles.atmosphereLabel}>Atmosphere</Text>
      <View style={styles.atmosphereTrack}>
        <View style={[styles.atmosphereFill, { width: '60%', backgroundColor: color }]} />
      </View>
      <Text style={[styles.atmosphereValue, { color }]}>
        {atmosphere.charAt(0).toUpperCase() + atmosphere.slice(1)}
      </Text>
    </View>
  );
}

function CareerProgressWidget({ careerName, milestone, progress }: { careerName: string; milestone: string; progress: number }) {
  return (
    <View style={styles.careerWidget}>
      <Text style={styles.careerTitle}>🎯 {careerName}</Text>
      <Text style={styles.careerMilestone}>Next: {milestone}</Text>
      <View style={styles.careerBar}>
        <View style={styles.careerTrack}>
          <Animated.View style={[styles.careerFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.careerPercent}>{progress}%</Text>
      </View>
    </View>
  );
}

// ─── Mock World Activity Data ─────────────────────────────────────

const WORLD_ACTIVITIES = [
  { id: 'wa1', npc: 'Chad', action: 'scored a touchdown at football practice', time: '5m ago' },
  { id: 'wa2', npc: 'Raven', action: 'was seen writing poetry in the cemetery', time: '12m ago' },
  { id: 'wa3', npc: 'Britney', action: 'organized a student council meeting', time: '25m ago' },
];

const UPCOMING_EVENTS = [
  { id: 'ev1', title: 'Math Competition', time: 'Starts in 2h', color: '#3b82f6' },
  { id: 'ev2', title: 'School Dance', time: 'Tomorrow evening', color: '#ec4899' },
];

const GAME_ICONS: Record<string, { gradient: [string, string]; icon: string }> = {
  'Math Blitz': { gradient: ['#3b82f6', '#1d4ed8'], icon: '∑' },
  'Football Toss': { gradient: ['#ef4444', '#b91c1c'], icon: 'F' },
  'Dance Battle': { gradient: ['#ec4899', '#be185d'], icon: '♪' },
  'Art Studio': { gradient: ['#a855f7', '#7c3aed'], icon: 'A' },
  'Memory Match': { gradient: ['#f59e0b', '#d97706'], icon: 'M' },
};

// ─── Main Screen ──────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = useGameStore((s) => s.player);
  const progress = useGameStore((s) => s.progress);
  const challenges = useGameStore((s) => s.challenges);
  const loginStreak = useGameStore((s) => s.loginStreak);
  const careerPaths = useGameStore((s) => s.careerPaths);
  const currentCareerId = useGameStore((s) => s.currentCareerId);
  const atmosphere = useGameStore((s) => s.atmosphere);

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

  // Career data
  const currentCareer = careerPaths.find((c) => c.id === currentCareerId);
  const careerName = currentCareer?.name ?? 'No Career Selected';
  const currentMilestone = currentCareer?.milestones?.[currentCareer.currentMilestone ?? 0];
  const milestoneName = currentMilestone?.name ?? 'Choose a career path';
  const milestoneProgress = currentCareer
    ? Math.round(((currentCareer.currentMilestone ?? 0) / (currentCareer.milestones.length || 1)) * 100)
    : 0;

  // Streak data
  const streakDays = loginStreak?.currentStreak ?? 0;

  // Atmosphere value
  const atmosphereValue = atmosphere?.dominant ?? 'chill';

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
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

        {/* Daily Streak Widget */}
        <Animated.View entering={FadeInUp.delay(50).duration(400)}>
          <DailyStreakWidget streak={streakDays} router={router} />
        </Animated.View>

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

        {/* Active Events Widget */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Card style={styles.card}>
            <View style={styles.widgetHeader}>
              <Text style={styles.sectionTitle}>Active Events</Text>
              <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>Calendar →</Text>
              </TouchableOpacity>
            </View>
            <ActiveEventsWidget events={UPCOMING_EVENTS} />
          </Card>
        </Animated.View>

        {/* Quick Actions Row */}
        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="🌳"
              label="Skill Tree"
              onPress={() => router.push('/skill-tree')}
              gradient={['#22c55e', '#15803d']}
            />
            <QuickActionButton
              icon="📅"
              label="Calendar"
              onPress={() => router.push('/calendar')}
              gradient={['#3b82f6', '#1d4ed8']}
            />
            <QuickActionButton
              icon="🏆"
              label="Tournament"
              onPress={() => router.push('/tournament')}
              gradient={['#f59e0b', '#d97706']}
            />
            <QuickActionButton
              icon="💬"
              label="Social Feed"
              onPress={() => router.push('/social-feed')}
              gradient={['#ec4899', '#be185d']}
            />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Card glow style={styles.card}>
            <Text style={styles.sectionTitle}>Stats</Text>
            <StatBar label="Academics" value={player.stats.academics} color="#3b82f6" />
            <StatBar label="Athletics" value={player.stats.athletics} color="#22c55e" />
            <StatBar label="Creativity" value={player.stats.creativity} color="#a855f7" />
            <StatBar label="Popularity" value={player.stats.popularity} color="#ec4899" />
            <StatBar label="Rebellion" value={player.stats.rebellion} color="#64748b" />
            <StatBar label="Happiness" value={player.stats.happiness} color="#f59e0b" />
          </Card>
        </Animated.View>

        {/* Atmosphere Indicator */}
        <Animated.View entering={FadeInUp.delay(250).duration(400)}>
          <Card style={styles.card}>
            <AtmosphereIndicator atmosphere={atmosphereValue} />
          </Card>
        </Animated.View>

        {/* Career Progress Widget */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Card style={[styles.card, styles.careerCard]}>
            <CareerProgressWidget
              careerName={careerName}
              milestone={milestoneName}
              progress={milestoneProgress}
            />
            {!currentCareerId && (
              <Button
                title="Choose Career"
                variant="secondary"
                onPress={() => router.push('/career')}
              />
            )}
          </Card>
        </Animated.View>

        {/* World Activity Feed */}
        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
          <Card style={styles.card}>
            <View style={styles.widgetHeader}>
              <Text style={styles.sectionTitle}>World Activity</Text>
            </View>
            {WORLD_ACTIVITIES.map((activity) => (
              <View key={activity.id} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityNpc}>{activity.npc}</Text>{' '}
                    {activity.action}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Daily Challenges */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
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
        </Animated.View>

        {/* Mini-Game Hub Button */}
        <Animated.View entering={FadeInUp.delay(450).duration(400)}>
          <TouchableOpacity
            style={styles.minigameHubButton}
            onPress={() => router.push('/minigame-hub')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.minigameHubGradient}
            >
              <Text style={styles.minigameHubIcon}>🎮</Text>
              <View style={styles.minigameHubText}>
                <Text style={styles.minigameHubTitle}>Mini-Game Hub</Text>
                <Text style={styles.minigameHubSubtitle}>10 games • Play to boost stats</Text>
              </View>
              <Text style={styles.minigameHubArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Mini Games Grid (keeping existing) */}
        <Text style={styles.sectionTitle}>Quick Play</Text>
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

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  headerText: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  periodBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primaryGlow, borderWidth: 1,
    borderColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: spacing.sm,
  },
  periodText: { color: colors.primaryLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Currency
  currencyRow: { marginBottom: spacing.md },

  // Streak Widget
  streakWidget: {
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  streakIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  streakText: {
    flex: 1,
  },
  streakTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '800',
  },
  streakSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  streakArrow: {
    color: '#fbbf24',
    fontSize: 20,
    fontWeight: '700',
  },

  // Energy
  energyCard: { marginBottom: spacing.md },
  energyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  energyDot: { width: 12, height: 12, borderRadius: 6 },
  energyBarContainer: { flex: 1 },
  energyBarBg: { height: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 5, overflow: 'hidden' },
  energyBarFill: { height: 10, backgroundColor: colors.warning, borderRadius: 5 },
  energyText: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '600' },

  // Event
  eventText: { color: colors.text, fontSize: 13, fontWeight: '600', lineHeight: 20 },

  // Cards
  card: { marginBottom: spacing.md },

  // Widget Header
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seeAll: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Title
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: colors.textSecondary,
    marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1,
  },

  // Active Events
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  eventTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionIcon: {
    fontSize: 22,
  },
  quickActionLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Stats
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statLabel: { width: 90, color: colors.textMuted, fontSize: 14 },
  barContainer: { flex: 1, height: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 5, marginHorizontal: spacing.sm, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  statValue: { width: 36, color: colors.text, fontSize: 14, fontWeight: '600', textAlign: 'right' },

  // Atmosphere
  atmosphereBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atmosphereLabel: {
    color: colors.textMuted,
    fontSize: 12,
    width: 80,
    fontWeight: '600',
  },
  atmosphereTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  atmosphereFill: {
    height: 6,
    borderRadius: 3,
  },
  atmosphereValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 70,
    textAlign: 'right',
  },

  // Career
  careerCard: {
    borderColor: 'rgba(168,85,247,0.15)',
  },
  careerWidget: {
    marginBottom: spacing.sm,
  },
  careerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  careerMilestone: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  careerBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careerTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  careerFill: {
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  careerPercent: {
    color: colors.secondaryLight,
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },

  // World Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  activityNpc: {
    color: colors.text,
    fontWeight: '700',
  },
  activityTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  // Challenges
  challengeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  challengeTitle: { color: colors.text, fontSize: 14 },
  completed: { color: colors.textMuted },
  challengeProgress: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },

  // Mini-Game Hub Button
  minigameHubButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  minigameHubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  minigameHubIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  minigameHubText: {
    flex: 1,
  },
  minigameHubTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  minigameHubSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  minigameHubArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  // Game Grid
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
