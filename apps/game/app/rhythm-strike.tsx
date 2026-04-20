import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing, radii } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
  BounceIn,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const LANE_COUNT = 4;
const LANE_WIDTH = SCREEN_W / LANE_COUNT;
const NOTE_SIZE = 56;
const FALL_DURATION = 3; // seconds for note to fall
const SONG_DURATION = 25; // seconds per song

type BPMSetting = 80 | 120 | 160;
type DifficultyLabel = 'slow' | 'medium' | 'fast';

interface FallingNote {
  id: number;
  lane: number;
  spawnTime: number;
  hit: boolean;
  missed: boolean;
  y: number;
}

interface SongConfig {
  label: DifficultyLabel;
  bpm: BPMSetting;
  name: string;
  color: string;
}

const SONGS: SongConfig[] = [
  { label: 'slow', bpm: 80, name: 'Freshman Groove', color: colors.success },
  { label: 'medium', bpm: 120, name: 'Hallway Hustle', color: colors.warning },
  { label: 'fast', bpm: 160, name: 'Senior Rush', color: colors.danger },
];

const LANE_COLORS = ['#ec4899', '#3b82f6', '#a855f7', '#22c55e'];
const LANE_LABELS = ['A', 'B', 'C', 'D'];

export default function RhythmStrikeScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);
  const updateChallenge = useGameStore((s) => s.updateChallenge);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [selectedSong, setSelectedSong] = useState<DifficultyLabel>('medium');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SONG_DURATION);
  const [notes, setNotes] = useState<FallingNote[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackColor, setFeedbackColor] = useState(colors.success);
  const [laneGlows, setLaneGlows] = useState<boolean[]>([false, false, false, false]);

  const noteIdCounter = useRef(0);
  const startTimeRef = useRef(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate notes for a song
  const generateNotes = useCallback((song: SongConfig): FallingNote[] => {
    const beatInterval = 60 / song.bpm;
    const newNotes: FallingNote[] = [];
    let id = 0;

    // Generate notes throughout the song
    for (let t = 2; t < SONG_DURATION - 1; t += beatInterval) {
      // Main beat note
      const lane = Math.floor(Math.random() * LANE_COUNT);
      newNotes.push({
        id: id++,
        lane,
        spawnTime: t,
        hit: false,
        missed: false,
        y: -NOTE_SIZE,
      });

      // Add off-beat notes for medium/fast
      if (song.bpm >= 120 && Math.random() > 0.5) {
        newNotes.push({
          id: id++,
          lane: Math.floor(Math.random() * LANE_COUNT),
          spawnTime: t + beatInterval / 2,
          hit: false,
          missed: false,
          y: -NOTE_SIZE,
        });
      }

      // Double notes for fast
      if (song.bpm >= 160 && Math.random() > 0.6) {
        newNotes.push({
          id: id++,
          lane: Math.floor(Math.random() * LANE_COUNT),
          spawnTime: t + beatInterval / 3,
          hit: false,
          missed: false,
          y: -NOTE_SIZE,
        });
      }
    }

    noteIdCounter.current = id;
    return newNotes;
  }, []);

  // End game
  const endGame = useCallback(() => {
    setGameState('gameover');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    const pointsEarned = score * 3 + maxCombo * 15 + perfectCount * 10;
    addCurrency({ points: pointsEarned });
    modifyStats({
      athletics: Math.min(100, Math.floor(score / 20)),
      popularity: Math.min(100, Math.floor(maxCombo / 2)),
    });
    updateChallenge('c1', score >= 200 ? 80 : 0);
  }, [score, maxCombo, perfectCount, addCurrency, modifyStats, updateChallenge]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, endGame]);

  // Game loop: update note positions
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const elapsed = SONG_DURATION - timeLeft;

      setNotes((prev) => {
        const updated = prev.map((note) => {
          if (note.hit || note.missed) return note;
          // Calculate Y position based on time until target
          const timeUntilHit = note.spawnTime - elapsed;
          const progress = 1 - (timeUntilHit / FALL_DURATION);
          const newY = interpolate(progress, [0, 1], [-NOTE_SIZE, 420], 'clamp');

          // Check if missed (passed the hit zone)
          if (newY > 440 && !note.missed && !note.hit) {
            return { ...note, missed: true, y: newY };
          }

          return { ...note, y: newY };
        });

        // Check for misses and update combo
        const anyNewMisses = updated.some((n) => n.missed && !prev.find((p) => p.id === n.id)?.missed);
        if (anyNewMisses) {
          runOnJS(setCombo)(0);
          runOnJS(setMissCount)((m) => m + 1);
        }

        return updated;
      });
    }, 16); // ~60fps

    gameLoopRef.current = interval;
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const startGame = (songLabel: DifficultyLabel) => {
    if (!spendEnergy(10)) return;
    const song = SONGS.find((s) => s.label === songLabel) ?? SONGS[1];
    setSelectedSong(songLabel);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectCount(0);
    setGoodCount(0);
    setMissCount(0);
    setTimeLeft(SONG_DURATION);
    setNotes(generateNotes(song));
    setFeedback(null);
    setLaneGlows([false, false, false, false]);
    startTimeRef.current = Date.now();
  };

  const hitLane = (lane: number) => {
    if (gameState !== 'playing') return;

    const elapsed = SONG_DURATION - timeLeft;
    const hitZoneY = 400;
    const tolerance = 50;

    // Find the closest note in this lane
    const laneNotes = notes.filter(
      (n) => n.lane === lane && !n.hit && !n.missed
    );

    if (laneNotes.length === 0) return;

    // Find the note closest to the hit zone
    const closestNote = laneNotes.reduce((closest, note) => {
      const noteDist = Math.abs(note.y - hitZoneY);
      const closestDist = Math.abs(closest.y - hitZoneY);
      return noteDist < closestDist ? note : closest;
    });

    const distance = Math.abs(closestNote.y - hitZoneY);

    if (distance < tolerance) {
      // Hit!
      let points = 100;
      let msg = 'PERFECT!';
      let fbColor = colors.secondary;

      if (distance > 30) {
        points = 50;
        msg = 'GOOD';
        fbColor = colors.warning;
        setGoodCount((g) => g + 1);
      } else if (distance > 15) {
        points = 75;
        msg = 'GREAT';
        fbColor = colors.accent;
      } else {
        setPerfectCount((p) => p + 1);
      }

      // Combo multiplier
      const comboMultiplier = Math.floor(combo / 5) + 1;
      const totalPoints = points * Math.min(comboMultiplier, 4);

      setNotes((prev) =>
        prev.map((n) => (n.id === closestNote.id ? { ...n, hit: true } : n))
      );
      setScore((s) => s + totalPoints);
      setCombo((c) => {
        const newCombo = c + 1;
        setMaxCombo((m) => Math.max(m, newCombo));
        return newCombo;
      });
      setFeedback(msg);
      setFeedbackColor(fbColor);

      // Lane glow
      setLaneGlows((prev) => {
        const next = [...prev];
        next[lane] = true;
        return next;
      });
      setTimeout(() => {
        setLaneGlows((prev) => {
          const next = [...prev];
          next[lane] = false;
          return next;
        });
      }, 150);

      setTimeout(() => setFeedback(null), 400);
    }
  };

  const song = SONGS.find((s) => s.label === selectedSong) ?? SONGS[1];

  // ─── Render: Idle / Game Over ─────────────────────────────────────

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>Rhythm Strike</Text>
        </Animated.View>

        <Text style={styles.subtitle}>
          Tap the lanes as notes hit the target line. Feel the beat!
        </Text>

        <Card style={styles.card}>
          {gameState === 'gameover' ? (
            <Animated.View entering={BounceIn}>
              <Text style={styles.resultTitle}>{song.name} Complete!</Text>
              <Text style={styles.resultScore}>Score: {score}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{perfectCount}</Text>
                  <Text style={styles.statLabel}>Perfect</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{goodCount}</Text>
                  <Text style={styles.statLabel}>Good</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{missCount}</Text>
                  <Text style={styles.statLabel}>Miss</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{maxCombo}x</Text>
                  <Text style={styles.statLabel}>Max Combo</Text>
                </View>
              </View>
              <Text style={styles.pointsText}>
                Points: PTS {score * 3 + maxCombo * 15 + perfectCount * 10}
              </Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+Athletics +Popularity</Text>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.resultText}>
              Tap the lanes when notes hit the target. Build combos for huge scores!
            </Text>
          )}
        </Card>

        {gameState === 'idle' && (
          <View style={styles.songList}>
            {SONGS.map((s) => (
              <TouchableOpacity
                key={s.label}
                onPress={() => startGame(s.label)}
                style={[
                  styles.songButton,
                  { borderColor: s.color, backgroundColor: `${s.color}15` },
                ]}
              >
                <View style={styles.songInfo}>
                  <Text style={styles.songName}>{s.name}</Text>
                  <Text style={styles.songBpm}>{s.bpm} BPM</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: s.color }]}>
                  <Text style={styles.diffBadgeText}>
                    {s.label === 'slow' ? 'Easy' : s.label === 'medium' ? 'Medium' : 'Hard'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          title={gameState === 'gameover' ? 'Play Again' : 'Back to Home'}
          variant={gameState === 'gameover' ? 'primary' : 'ghost'}
          onPress={() => {
            if (gameState === 'gameover') {
              setGameState('idle');
            } else {
              router.back();
            }
          }}
        />

        {gameState === 'gameover' && (
          <>
            <View style={{ height: spacing.sm }} />
            <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
          </>
        )}
      </View>
    );
  }

  // ─── Render: Playing ──────────────────────────────────────────────

  return (
    <View style={styles.gameContainer}>
      {/* HUD */}
      <View style={styles.hud}>
        <Text style={styles.hudSong}>{song.name}</Text>
        <Text style={[styles.hudTimer, { color: timeLeft <= 5 ? colors.danger : colors.text }]}>
          {Math.ceil(timeLeft)}s
        </Text>
        <Text style={styles.hudScore}>Score: {score}</Text>
      </View>

      {/* Combo */}
      {combo > 1 && (
        <Animated.View entering={BounceIn} style={styles.comboContainer}>
          <Text style={[styles.comboText, combo > 10 && { color: colors.secondary, fontSize: 24 }]}>
            {combo}x COMBO
          </Text>
        </Animated.View>
      )}

      {/* Feedback */}
      {feedback && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.feedbackOverlay}>
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedback}</Text>
        </Animated.View>
      )}

      {/* Lanes + Notes */}
      <View style={styles.lanesContainer}>
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <View
            key={lane}
            style={[
              styles.lane,
              { backgroundColor: laneGlows[lane] ? `${LANE_COLORS[lane]}40` : `${LANE_COLORS[lane]}10` },
            ]}
          >
            {/* Target circle */}
            <View style={[styles.targetCircle, { borderColor: LANE_COLORS[lane] }]}>
              <Text style={styles.targetLabel}>{LANE_LABELS[lane]}</Text>
            </View>

            {/* Falling notes */}
            {notes
              .filter((n) => n.lane === lane && !n.hit && !n.missed)
              .map((note) => (
                <View
                  key={note.id}
                  style={[
                    styles.note,
                    {
                      backgroundColor: LANE_COLORS[lane],
                      top: note.y,
                      left: (LANE_WIDTH - NOTE_SIZE) / 2,
                      opacity: interpolate(
                        note.y,
                        [-NOTE_SIZE, 0, 400, 450],
                        [0.3, 1, 1, 0.3],
                        'clamp'
                      ),
                    },
                  ]}
                />
              ))}

            {/* Hit particles */}
            {notes
              .filter((n) => n.lane === lane && n.hit)
              .map((note) => (
                <Animated.View
                  key={`hit-${note.id}`}
                  entering={FadeIn.duration(100)}
                  style={[
                    styles.hitParticle,
                    {
                      left: (LANE_WIDTH - NOTE_SIZE) / 2,
                      backgroundColor: LANE_COLORS[lane],
                    },
                  ]}
                />
              ))}
          </View>
        ))}
      </View>

      {/* Lane buttons */}
      <View style={styles.controls}>
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <TouchableOpacity
            key={lane}
            activeOpacity={0.5}
            onPressIn={() => hitLane(lane)}
            style={[
              styles.laneButton,
              { backgroundColor: LANE_COLORS[lane] },
              laneGlows[lane] && styles.laneButtonActive,
            ]}
          >
            <Text style={styles.laneButtonText}>{LANE_LABELS[lane]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

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
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 22,
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
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.md,
  },
  statCell: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
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
  songList: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  songButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  songBpm: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  diffBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
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
    paddingBottom: spacing.sm,
  },
  hudSong: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  hudTimer: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  hudScore: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  comboContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  comboText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.warning,
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
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
  targetCircle: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: NOTE_SIZE + 8,
    height: NOTE_SIZE + 8,
    borderRadius: (NOTE_SIZE + 8) / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  targetLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  note: {
    position: 'absolute',
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderRadius: NOTE_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  hitParticle: {
    position: 'absolute',
    bottom: 80,
    width: NOTE_SIZE + 8,
    height: NOTE_SIZE + 8,
    borderRadius: (NOTE_SIZE + 8) / 2,
    opacity: 0.4,
  },
  controls: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: 32,
    gap: 8,
  },
  laneButton: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  laneButtonActive: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  laneButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
