import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, colors, spacing, radii } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  FadeIn,
  FadeInUp,
  BounceIn,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

// ─── Types ──────────────────────────────────────────────────────────

type ArgumentType = 'logic' | 'emotion' | 'ethics';

interface Argument {
  text: string;
  type: ArgumentType;
  strength: number; // 1-10
}

interface DebateScenario {
  topic: string;
  opponentStance: string;
  arguments: Argument[];
  bestType: ArgumentType; // the type that counters opponent best
}

// ─── Debate Scenarios ───────────────────────────────────────────────

const SCENARIOS: DebateScenario[] = [
  {
    topic: 'School Uniforms',
    opponentStance: 'Uniforms suppress individuality and creativity.',
    arguments: [
      { text: 'Uniforms reduce bullying based on clothing brands.', type: 'ethics', strength: 8 },
      { text: 'Studies show uniforms improve academic focus by 15%.', type: 'logic', strength: 9 },
      { text: 'Everyone wearing the same thing feels oppressive.', type: 'emotion', strength: 6 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Phone Policy',
    opponentStance: 'Phones should be banned during all school hours.',
    arguments: [
      { text: 'Phones are essential safety tools for emergencies.', type: 'ethics', strength: 9 },
      { text: 'Banning phones teaches responsible use, not avoidance.', type: 'logic', strength: 7 },
      { text: 'Students feel trusted when allowed supervised phone use.', type: 'emotion', strength: 6 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Cafeteria Food',
    opponentStance: 'The school should only serve healthy food options.',
    arguments: [
      { text: 'Occasional treats boost student morale significantly.', type: 'emotion', strength: 8 },
      { text: 'Healthy food improves test scores and attendance.', type: 'logic', strength: 9 },
      { text: 'Forcing healthy choices violates personal freedom.', type: 'ethics', strength: 6 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Homework Loads',
    opponentStance: 'More homework equals better academic results.',
    arguments: [
      { text: 'Excessive homework causes burnout and mental health issues.', type: 'emotion', strength: 9 },
      { text: 'Quality assignments beat quantity every time.', type: 'logic', strength: 8 },
      { text: 'Students need time for extracurricular development.', type: 'ethics', strength: 7 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'GPA Calculations',
    opponentStance: 'Art and music classes should not count toward GPA.',
    arguments: [
      { text: 'The arts develop critical creative thinking skills.', type: 'logic', strength: 8 },
      { text: 'Dismissing arts devalues students who excel in them.', type: 'emotion', strength: 9 },
      { text: 'All academic pursuits deserve equal recognition.', type: 'ethics', strength: 8 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'Class Rankings',
    opponentStance: 'Publishing class rankings motivates students.',
    arguments: [
      { text: 'Rankings create unhealthy competition and anxiety.', type: 'emotion', strength: 9 },
      { text: 'No evidence shows rankings improve performance.', type: 'logic', strength: 8 },
      { text: 'Students have a right to academic privacy.', type: 'ethics', strength: 7 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'Sports Funding',
    opponentStance: 'Sports programs deserve more funding than arts.',
    arguments: [
      { text: 'Arts programs have lower injury rates and broader participation.', type: 'logic', strength: 7 },
      { text: 'Every student deserves equal funding for their passion.', type: 'ethics', strength: 9 },
      { text: 'The arts build empathy and cultural understanding.', type: 'emotion', strength: 8 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Dress Code',
    opponentStance: 'Strict dress codes prevent distractions.',
    arguments: [
      { text: 'Dress codes unfairly target female students.', type: 'ethics', strength: 9 },
      { text: 'Self-expression through clothing boosts confidence.', type: 'emotion', strength: 8 },
      { text: 'There is no data linking dress to academic performance.', type: 'logic', strength: 7 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Starting Times',
    opponentStance: 'School should start at 7:00 AM.',
    arguments: [
      { text: 'Teenagers need 8-10 hours of sleep for brain development.', type: 'logic', strength: 9 },
      { text: 'Early starts lead to chronic sleep deprivation.', type: 'emotion', strength: 8 },
      { text: 'Health guidelines recommend later start times.', type: 'ethics', strength: 7 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Group Projects',
    opponentStance: 'Group projects teach essential teamwork.',
    arguments: [
      { text: 'One student often does all the work unfairly.', type: 'ethics', strength: 8 },
      { text: 'Group projects cause anxiety for introverted students.', type: 'emotion', strength: 9 },
      { text: 'Individual assessment better measures personal growth.', type: 'logic', strength: 7 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Standardized Tests',
    opponentStance: 'Standardized tests fairly measure all students.',
    arguments: [
      { text: 'Tests ignore different learning styles and abilities.', type: 'ethics', strength: 8 },
      { text: 'Test anxiety causes scores to not reflect true knowledge.', type: 'emotion', strength: 9 },
      { text: 'Grades and portfolios are better predictors of success.', type: 'logic', strength: 8 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Social Media Clubs',
    opponentStance: 'Social media clubs are a waste of school resources.',
    arguments: [
      { text: 'Digital literacy is essential for modern careers.', type: 'logic', strength: 8 },
      { text: 'These clubs build confidence in public expression.', type: 'emotion', strength: 7 },
      { text: 'Social media skills are marketable and practical.', type: 'logic', strength: 9 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Summer School',
    opponentStance: 'Summer school should be mandatory for struggling students.',
    arguments: [
      { text: 'Students need breaks for mental health recovery.', type: 'emotion', strength: 8 },
      { text: 'Summer jobs teach real-world skills.', type: 'logic', strength: 7 },
      { text: 'Mandatory attendance violates summer freedom.', type: 'ethics', strength: 6 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'Open Campus Lunch',
    opponentStance: 'Students should not leave campus during lunch.',
    arguments: [
      { text: 'Local businesses benefit from student customers.', type: 'logic', strength: 7 },
      { text: 'Off-campus lunch teaches time management.', type: 'ethics', strength: 8 },
      { text: 'A change of scenery refreshes the mind for afternoon classes.', type: 'emotion', strength: 7 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'P.E. Requirements',
    opponentStance: 'Physical education should not be required.',
    arguments: [
      { text: 'Regular exercise is linked to better academic performance.', type: 'logic', strength: 9 },
      { text: 'P.E. builds lifelong healthy habits.', type: 'emotion', strength: 7 },
      { text: 'Public health benefits outweigh individual preferences.', type: 'ethics', strength: 8 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Library Hours',
    opponentStance: 'The library should close at 3 PM.',
    arguments: [
      { text: 'Many students lack quiet study spaces at home.', type: 'ethics', strength: 8 },
      { text: 'Extended hours accommodate different schedules.', type: 'logic', strength: 7 },
      { text: 'The library is a safe haven for many students.', type: 'emotion', strength: 9 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'Voting Age',
    opponentStance: 'The voting age should stay at 18.',
    arguments: [
      { text: '16-year-olds pay taxes and deserve representation.', type: 'ethics', strength: 9 },
      { text: 'Younger voters bring fresh perspectives to democracy.', type: 'emotion', strength: 7 },
      { text: 'Civic education makes teens informed voters.', type: 'logic', strength: 8 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Cheating Penalties',
    opponentStance: 'Cheating should result in automatic expulsion.',
    arguments: [
      { text: 'Rehabilitation is more effective than punishment.', type: 'logic', strength: 7 },
      { text: 'Extreme penalties destroy futures over one mistake.', type: 'emotion', strength: 9 },
      { text: 'Restorative justice teaches accountability better.', type: 'ethics', strength: 8 },
    ],
    bestType: 'emotion',
  },
  {
    topic: 'Club Requirements',
    opponentStance: 'Joining a club should be mandatory.',
    arguments: [
      { text: 'Forced participation defeats the purpose of clubs.', type: 'logic', strength: 8 },
      { text: 'Students have different commitments outside school.', type: 'ethics', strength: 8 },
      { text: 'Genuine interest creates better engagement than requirement.', type: 'emotion', strength: 7 },
    ],
    bestType: 'logic',
  },
  {
    topic: 'Online Classes',
    opponentStance: 'All classes should be in-person only.',
    arguments: [
      { text: 'Online options accommodate students with disabilities.', type: 'ethics', strength: 9 },
      { text: 'Remote learning develops self-discipline skills.', type: 'logic', strength: 7 },
      { text: 'Flexibility reduces stress for overcommitted students.', type: 'emotion', strength: 8 },
    ],
    bestType: 'ethics',
  },
  {
    topic: 'Community Service',
    opponentStance: 'Community service hours should be required to graduate.',
    arguments: [
      { text: 'Mandatory service contradicts the spirit of volunteering.', type: 'logic', strength: 8 },
      { text: 'Students already juggle overwhelming schedules.', type: 'emotion', strength: 7 },
      { text: 'Forcing charity work is ethically questionable.', type: 'ethics', strength: 8 },
    ],
    bestType: 'ethics',
  },
];

const ROUNDS_PER_GAME = 5;
const TIME_PER_ROUND = 10;

const ARGUMENT_COLORS: Record<ArgumentType, string> = {
  logic: '#3b82f6',
  emotion: '#ec4899',
  ethics: '#22c55e',
};

const CROWD_REACTIONS = {
  amazing: ['🙌', '🔥', '👏', '💯', '⭐'],
  good: ['👍', '🙂', '✨', '💪', '🎯'],
  weak: ['🤔', '😬', '💤', '😕', '👎'],
};

// ─── Component ──────────────────────────────────────────────────────

export default function DebateClubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [shuffledScenarios, setShuffledScenarios] = useState<DebateScenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [showingResult, setShowingResult] = useState(false);
  const [lastResult, setLastResult] = useState<'amazing' | 'good' | 'weak' | null>(null);
  const [crowdReaction, setCrowdReaction] = useState('');
  const [roundScores, setRoundScores] = useState<number[]>([]);

  // Animated values
  const podiumScale = useSharedValue(1);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showingResult) return;
    if (timeLeft <= 0) {
      // Time's up - auto weak answer
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, showingResult]);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, ROUNDS_PER_GAME);
    setShuffledScenarios(shuffled);
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
    setTotalScore(0);
    setTimeLeft(TIME_PER_ROUND);
    setShowingResult(false);
    setLastResult(null);
    setRoundScores([]);
  };

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= ROUNDS_PER_GAME) {
      setGameState('gameover');
      const pointsEarned = totalScore * 5;
      addCurrency({ points: pointsEarned });
      modifyStats({
        popularity: Math.min(100, Math.floor(totalScore / 20)),
        academics: Math.min(100, Math.floor(totalScore / 25)),
      });
      return;
    }
    setCurrentRound((r) => r + 1);
    setTimeLeft(TIME_PER_ROUND);
    setShowingResult(false);
    setLastResult(null);
    setCrowdReaction('');
  }, [currentRound, totalScore, addCurrency, modifyStats]);

  const handleAnswer = (argIndex: number) => {
    if (showingResult) return;

    const scenario = shuffledScenarios[currentRound];
    if (!scenario) return;

    setShowingResult(true);

    if (argIndex < 0) {
      // Time's up
      setLastResult('weak');
      setCrowdReaction(CROWD_REACTIONS.weak[Math.floor(Math.random() * 5)]);
      setRoundScores((prev) => [...prev, 0]);
      setTimeout(nextRound, 2000);
      return;
    }

    const chosen = scenario.arguments[argIndex];
    const isBest = chosen.type === scenario.bestType;
    const timeBonus = Math.floor(timeLeft * 5);

    let roundScore = 0;
    let result: 'amazing' | 'good' | 'weak';

    if (isBest && timeLeft > 5) {
      roundScore = 100 + timeBonus;
      result = 'amazing';
    } else if (isBest) {
      roundScore = 80 + timeBonus;
      result = 'good';
    } else if (chosen.strength >= 7) {
      roundScore = 50 + timeBonus;
      result = 'good';
    } else {
      roundScore = 20 + timeBonus;
      result = 'weak';
    }

    setScore(roundScore);
    setTotalScore((s) => s + roundScore);
    setLastResult(result);
    setCrowdReaction(CROWD_REACTIONS[result][Math.floor(Math.random() * 5)]);
    setRoundScores((prev) => [...prev, roundScore]);

    // Animate
    podiumScale.value = withSequence(
      withSpring(1.03, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    setTimeout(nextRound, 2000);
  };

  const scenario = shuffledScenarios[currentRound];

  // ─── Render: Idle / Game Over ─────────────────────────────────────

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>Debate Club</Text>
        </Animated.View>

        <Text style={styles.subtitle}>
          Choose the most persuasive argument to win the crowd!
        </Text>

        <Card style={styles.card}>
          {gameState === 'gameover' ? (
            <Animated.View entering={BounceIn}>
              <Text style={styles.resultTitle}>Debate Complete!</Text>
              <Text style={styles.resultScore}>Score: {totalScore}</Text>
              <View style={styles.roundsList}>
                {roundScores.map((rs, i) => (
                  <View key={i} style={styles.roundBadge}>
                    <Text style={styles.roundBadgeText}>
                      R{i + 1}: {rs}pts
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.pointsText}>
                Points: PTS {totalScore * 5}
              </Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+Popularity +Academics</Text>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.resultText}>
              {ROUNDS_PER_GAME} rounds. Pick the best argument against each topic. Faster answers earn time bonuses!
            </Text>
          )}
        </Card>

        <Button
          title={gameState === 'gameover' ? 'Debate Again' : 'Start Debate (-10 ENERGY)'}
          onPress={startGame}
        />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  // ─── Render: Playing ──────────────────────────────────────────────

  return (
    <View style={[styles.gameContainer, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      {/* HUD */}
      <View style={[styles.hud, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <Text style={styles.hudRound}>
          Round {currentRound + 1}/{ROUNDS_PER_GAME}
        </Text>
        <Text style={styles.hudTotal}>Total: {totalScore}</Text>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBar}>
        <View
          style={[
            styles.timerFill,
            {
              width: `${(timeLeft / TIME_PER_ROUND) * 100}%`,
              backgroundColor:
                timeLeft <= 3 ? colors.danger : timeLeft <= 6 ? colors.warning : colors.primary,
            },
          ]}
        />
      </View>

      {/* Topic card */}
      {scenario && (
        <Animated.View entering={FadeIn} key={currentRound} style={styles.topicCard}>
          <Text style={styles.topicLabel}>DEBATE TOPIC</Text>
          <Text style={styles.topicTitle}>{scenario.topic}</Text>

          <View style={styles.opponentBox}>
            <Text style={styles.opponentLabel}>OPPONENT SAYS:</Text>
            <Text style={styles.opponentStance}>{'"'}{scenario.opponentStance}{'"'}</Text>
          </View>
        </Animated.View>
      )}

      {/* Argument cards */}
      {scenario && !showingResult && (
        <View style={styles.argumentsContainer}>
          {scenario.arguments.map((arg, index) => (
            <Animated.View
              key={`${currentRound}-${index}`}
              entering={FadeInUp.delay(index * 150)}
              style={{ width: '100%' }}
            >
              <TouchableOpacity
                style={[
                  styles.argumentCard,
                  { borderColor: ARGUMENT_COLORS[arg.type] },
                ]}
                onPress={() => handleAnswer(index)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: ARGUMENT_COLORS[arg.type] },
                  ]}
                >
                  <Text style={styles.typeBadgeText}>
                    {arg.type === 'logic' ? 'LOGIC' : arg.type === 'emotion' ? 'EMOTION' : 'ETHICS'}
                  </Text>
                </View>
                <Text style={styles.argumentText}>{arg.text}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Result overlay */}
      {showingResult && lastResult && (
        <Animated.View entering={BounceIn} style={styles.resultOverlay}>
          <Animated.View
            style={[
              styles.resultBox,
              {
                borderColor:
                  lastResult === 'amazing'
                    ? colors.secondary
                    : lastResult === 'good'
                      ? colors.success
                      : colors.warning,
              },
            ]}
          >
            <Text style={styles.crowdReaction}>{crowdReaction}</Text>
            <Text
              style={[
                styles.resultLabel,
                {
                  color:
                    lastResult === 'amazing'
                      ? colors.secondary
                      : lastResult === 'good'
                        ? colors.success
                        : colors.warning,
                },
              ]}
            >
              {lastResult === 'amazing' ? 'CRUSHING ARGUMENT!' : lastResult === 'good' ? 'SOLID POINT!' : 'WEAK REBUTTAL'}
            </Text>
            <Text style={styles.resultPoints}>+{score} points</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roundsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  roundBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  roundBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rewardRow: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignSelf: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  hudRound: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  hudTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  timerBar: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    alignItems: 'center',
  },
  topicLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  opponentBox: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.sm,
    padding: spacing.md,
    width: '100%',
  },
  opponentLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 4,
    letterSpacing: 1,
  },
  opponentStance: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  argumentsContainer: {
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'flex-start',
  },
  argumentCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 2,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 56,
    alignItems: 'center',
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  argumentText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    zIndex: 20,
  },
  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    minWidth: 250,
  },
  crowdReaction: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  resultPoints: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
