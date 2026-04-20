import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const LANE_COUNT = 4;
const LANE_WIDTH = SCREEN_W / LANE_COUNT;
const NOTE_SIZE = 60;

interface Note {
  id: number;
  lane: number;
  targetTime: number;
  hit: boolean;
  missed: boolean;
}

const SONG_DURATION = 20; // seconds
const BPM = 120;
const BEAT_INTERVAL = 60 / BPM;

export default function DanceBattleScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);
  const updateChallenge = useGameStore((s) => s.updateChallenge);

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [timeLeft, setTimeLeft] = useState(SONG_DURATION);
  const [feedback, setFeedback] = useState<string | null>(null);

  const laneColors = ['#ec4899', '#3b82f6', '#a855f7', '#22c55e'];
  const laneEmojis = ['👆', '👉', '👇', '👈'];

  // Generate notes on start
  const generateNotes = useCallback(() => {
    const newNotes: Note[] = [];
    let id = 0;
    for (let t = 2; t < SONG_DURATION - 2; t += BEAT_INTERVAL) {
      // Add some rhythmic variation
      const lane = Math.floor(Math.random() * LANE_COUNT);
      newNotes.push({
        id: id++,
        lane,
        targetTime: t,
        hit: false,
        missed: false,
      });
      // Double notes sometimes
      if (Math.random() > 0.7) {
        newNotes.push({
          id: id++,
          lane: Math.floor(Math.random() * LANE_COUNT),
          targetTime: t + BEAT_INTERVAL / 2,
          hit: false,
          missed: false,
        });
      }
    }
    return newNotes;
  }, []);

  // Timer
  useEffect(() => {
    if (!started || gameOver) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [started, gameOver, timeLeft]);

  // Check for missed notes
  useEffect(() => {
    if (!started || gameOver) return;
    const elapsed = SONG_DURATION - timeLeft;
    let anyMissed = false;
    setNotes((prev) =>
      prev.map((note) => {
        if (!note.hit && !note.missed && elapsed > note.targetTime + 0.5) {
          anyMissed = true;
          return { ...note, missed: true };
        }
        return note;
      })
    );
    if (anyMissed) {
      setCombo(0);
    }
  }, [timeLeft, started, gameOver]);

  const endGame = () => {
    setGameOver(true);
    const pointsEarned = score * 5 + maxCombo * 10;
    addCurrency({ points: pointsEarned });
    modifyStats({ popularity: Math.min(100, Math.floor(score / 3)) });
    updateChallenge('c1', score >= 10 ? 80 : 0);
  };

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(SONG_DURATION);
    setNotes(generateNotes());
    setFeedback(null);
  };

  const hitNote = (lane: number) => {
    const elapsed = SONG_DURATION - timeLeft;
    const note = notes.find(
      (n) => n.lane === lane && !n.hit && !n.missed && Math.abs(n.targetTime - elapsed) < 0.4
    );

    if (note) {
      const accuracy = Math.abs(note.targetTime - elapsed);
      let points = 100;
      let msg = 'PERFECT!';
      if (accuracy > 0.2) {
        points = 50;
        msg = 'GOOD';
      } else if (accuracy > 0.3) {
        points = 25;
        msg = 'OKAY';
      }

      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, hit: true } : n)));
      setScore((s) => s + points);
      setCombo((c) => {
        const newCombo = c + 1;
        setMaxCombo((m) => Math.max(m, newCombo));
        return newCombo;
      });
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const elapsed = SONG_DURATION - timeLeft;

  if (!started || gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dance Battle</Text>
        <Text style={styles.subtitle}>Hit the notes as they reach the target line. Build your combo!</Text>
        <Card style={styles.card}>
          <Text style={styles.resultText}>
            {gameOver
              ? `Final Score: ${score}\nMax Combo: ${maxCombo}x\nPoints: PTS ${score * 5 + maxCombo * 10}`
              : 'Tap the lanes in time with the beat!'}
          </Text>
        </Card>
        <Button title={gameOver ? 'Dance Again' : 'Start Dancing (-10 ENERGY)'} onPress={startGame} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>⏱ {Math.ceil(timeLeft)}s</Text>
        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={[styles.comboText, combo > 5 && { color: colors.secondary }]}>
          {combo > 1 ? `${combo}x COMBO!` : ''}
        </Text>
      </View>

      {feedback && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.feedbackOverlay}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </Animated.View>
      )}

      <View style={styles.lanesContainer}>
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <View key={lane} style={[styles.lane, { backgroundColor: `${laneColors[lane]}15` }]}>
            {notes
              .filter((n) => n.lane === lane && !n.hit && !n.missed)
              .map((note) => {
                const progress = (note.targetTime - elapsed) / 3; // 3 seconds to fall
                const y = interpolate(progress, [1, 0], [-NOTE_SIZE, 400], 'clamp');
                return (
                  <View
                    key={note.id}
                    style={[
                      styles.note,
                      {
                        backgroundColor: laneColors[lane],
                        transform: [{ translateY: y }],
                      },
                    ]}
                  >
                    <Text style={styles.noteEmoji}>{laneEmojis[lane]}</Text>
                  </View>
                );
              })}
          </View>
        ))}

        <View style={styles.targetLine} />
      </View>

      <View style={styles.controls}>
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <TouchableOpacity
            key={lane}
            activeOpacity={0.6}
            onPress={() => hitNote(lane)}
            style={[styles.laneButton, { backgroundColor: laneColors[lane] }]}
          >
            <Text style={styles.laneButtonText}>{laneEmojis[lane]}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: 48,
  },
  hudText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  comboText: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '800',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.secondary,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  lanesContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  lane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceHighlight,
    position: 'relative',
    overflow: 'hidden',
  },
  note: {
    position: 'absolute',
    left: (LANE_WIDTH - NOTE_SIZE) / 2,
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderRadius: NOTE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  noteEmoji: {
    fontSize: 24,
  },
  targetLine: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.text,
    opacity: 0.5,
  },
  controls: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: 32,
    gap: 8,
  },
  laneButton: {
    flex: 1,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laneButtonText: {
    fontSize: 28,
  },
});
