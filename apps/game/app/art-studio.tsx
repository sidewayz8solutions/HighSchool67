import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, { FadeIn, BounceIn, FadeOut } from 'react-native-reanimated';

const COLOR_PALETTE = [
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Ocean', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#22c55e' },
  { name: 'Gold', hex: '#f59e0b' },
  { name: 'Violet', hex: '#a855f7' },
  { name: 'Coral', hex: '#f97316' },
];

interface Round {
  targetColor: string;
  options: string[];
  correctIndex: number;
}

function generateRound(): Round {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const options = shuffled.slice(0, 4).map((c) => c.hex);
  const correctIndex = options.indexOf(target.hex);
  return { targetColor: target.name, options, correctIndex };
}

export default function ArtStudioScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [showingResult, setShowingResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const TOTAL_ROUNDS = 8;

  useEffect(() => {
    if (!started || gameOver || showingResult) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [started, gameOver, timeLeft, showingResult]);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setRound(0);
    setStreak(0);
    nextRound();
  };

  const nextRound = useCallback(() => {
    setCurrentRound(generateRound());
    setTimeLeft(15);
    setShowingResult(false);
    setLastCorrect(null);
  }, []);

  const handleAnswer = (index: number) => {
    if (!currentRound || showingResult) return;

    const correct = index === currentRound.correctIndex;
    setLastCorrect(correct);
    setShowingResult(true);

    if (correct) {
      const timeBonus = Math.floor(timeLeft * 5);
      const streakBonus = streak * 10;
      setScore((s) => s + 100 + timeBonus + streakBonus);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        setGameOver(true);
        const pointsEarned = score + (correct ? 100 + Math.floor(timeLeft * 5) + streak * 10 : 0);
        addCurrency({ points: pointsEarned });
        modifyStats({ creativity: Math.min(100, Math.floor((score + (correct ? 100 : 0)) / 50)) });
      } else {
        setRound((r) => r + 1);
        nextRound();
      }
    }, 1000);
  };

  if (!started || gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Art Studio</Text>
        <Text style={styles.subtitle}>Match colors fast. The quicker you are, the more points you earn.</Text>
        <Card style={styles.card}>
          <Text style={styles.resultText}>
            {gameOver
              ? `Final Score: ${score}\nRounds: ${TOTAL_ROUNDS}\nPoints: PTS ${score}`
              : `${TOTAL_ROUNDS} rounds. Match the named color to its swatch.`}
          </Text>
        </Card>
        <Button title={gameOver ? 'Paint Again' : 'Start Painting (-10 ENERGY)'} onPress={startGame} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
        <Text style={styles.hudText}>Score: {score}</Text>
      </View>

      {streak > 2 && (
        <Animated.View entering={BounceIn} style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak}x Streak!</Text>
        </Animated.View>
      )}

      <View style={styles.timerBar}>
        <View style={[styles.timerFill, { width: `${(timeLeft / 15) * 100}%` }]} />
      </View>

      {currentRound && (
        <>
          <Animated.View entering={FadeIn} key={round} style={styles.targetSection}>
            <Text style={styles.instruction}>Find this color:</Text>
            <Text style={styles.targetName}>{currentRound.targetColor}</Text>
          </Animated.View>

          <View style={styles.optionsGrid}>
            {currentRound.options.map((colorHex, index) => (
              <TouchableOpacity
                key={`${round}-${index}`}
                activeOpacity={0.7}
                disabled={showingResult}
                onPress={() => handleAnswer(index)}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorHex },
                  showingResult && index === currentRound.correctIndex && styles.correctOption,
                  showingResult && lastCorrect === false && index !== currentRound.correctIndex && styles.wrongOption,
                ]}
              >
                {showingResult && index === currentRound.correctIndex && (
                  <Text style={styles.checkEmoji}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {showingResult && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.resultOverlay}>
          <Text style={[styles.resultEmoji, lastCorrect ? { color: colors.success } : { color: colors.danger }]}>
            {lastCorrect ? 'Perfect!' : 'Miss!'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: 48,
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
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: 48,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  hudText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  streakText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
  timerBar: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  timerFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  targetSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instruction: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  targetName: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  colorOption: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  correctOption: {
    borderWidth: 4,
    borderColor: colors.success,
    transform: [{ scale: 1.05 }],
  },
  wrongOption: {
    opacity: 0.4,
  },
  checkEmoji: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 32,
    fontWeight: '900',
  },
});
