import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
  runOnJS,
  withSequence,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────────────

interface HiddenObject {
  id: number;
  emoji: string;
  name: string;
  found: boolean;
}

// ─── Object Pool ────────────────────────────────────────────────────

const OBJECT_POOL: { emoji: string; name: string }[] = [
  { emoji: '🎒', name: 'Backpack' },
  { emoji: '📱', name: 'Phone' },
  { emoji: '🎧', name: 'Headphones' },
  { emoji: '✏️', name: 'Pencil' },
  { emoji: '📕', name: 'Book' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🏀', name: 'Basketball' },
  { emoji: '🎸', name: 'Guitar' },
  { emoji: '🧢', name: 'Cap' },
  { emoji: '🥤', name: 'Soda' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🎭', name: 'Mask' },
  { emoji: '🏆', name: 'Trophy' },
  { emoji: '🔑', name: 'Key' },
  { emoji: '✂️', name: 'Scissors' },
  { emoji: '🌟', name: 'Star' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🌈', name: 'Rainbow' },
  { emoji: '🎈', name: 'Balloon' },
  { emoji: '📷', name: 'Camera' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🍩', name: 'Donut' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🌸', name: 'Flower' },
  { emoji: '🍦', name: 'Ice Cream' },
  { emoji: '🎯', name: 'Dartboard' },
  { emoji: '🎪', name: 'Tent' },
  { emoji: '🎨', name: 'Palette' },
];

const DISTRACTOR_EMOJIS = [
  '🟦', '🟥', '🟩', '🟨', '🟪', '🟫', '⬜', '⬛', '🔵', '🔴', '🟢', '🟡', '🟣', '🟤', '⚪', '⚫',
  '◻️', '◼️', '🔷', '🔶', '🔹', '🔸', '▪️', '▫️', '🔲', '🔳',
];

const GRID_SIZE = 6; // 6x6 grid
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const OBJECTS_COUNT = 10;
const GAME_TIME = 45;
const MAX_HINTS = 3;

// ─── Component ──────────────────────────────────────────────────────

export default function PhotoHuntScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [objects, setObjects] = useState<HiddenObject[]>([]);
  const [grid, setGrid] = useState<(HiddenObject | { type: 'distractor'; emoji: string })[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [hints, setHints] = useState(MAX_HINTS);
  const [hintTarget, setHintTarget] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [revealedCells, setRevealedCells] = useState<Set<number>>(new Set());

  // Animated values
  const hintGlow = useSharedValue(0);
  const foundScale = useSharedValue(1);

  const hintStyle = useAnimatedStyle(() => ({
    shadowOpacity: hintGlow.value * 0.8,
    shadowRadius: 8 + hintGlow.value * 8,
  }));

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && objects.length > 0 && objects.every((o) => o.found)) {
      // Time bonus for finding all
      const timeBonus = timeLeft * 10;
      setScore((s) => s + timeBonus);
      setTimeout(endGame, 500);
    }
  }, [objects, gameState, timeLeft]);

  const generateGame = useCallback(() => {
    // Shuffle and pick target objects
    const shuffled = [...OBJECT_POOL].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, OBJECTS_COUNT).map((o, i) => ({
      ...o,
      id: i,
      found: false,
    }));

    // Create grid with targets placed randomly
    const positions = Array.from({ length: TOTAL_CELLS }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    
    const targetPositions = positions.slice(0, OBJECTS_COUNT);
    const distractorPositions = positions.slice(OBJECTS_COUNT);

    const newGrid: (HiddenObject | { type: 'distractor'; emoji: string })[] = new Array(TOTAL_CELLS);

    // Place targets
    targets.forEach((obj, i) => {
      newGrid[targetPositions[i]] = obj;
    });

    // Place distractors
    distractorPositions.forEach((pos) => {
      const randomDistractor = DISTRACTOR_EMOJIS[Math.floor(Math.random() * DISTRACTOR_EMOJIS.length)];
      newGrid[pos] = { type: 'distractor', emoji: randomDistractor };
    });

    setObjects(targets);
    setGrid(newGrid);
    setRevealedCells(new Set());
    setHintTarget(null);
  }, []);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_TIME);
    setHints(MAX_HINTS);
    setWrongClicks(0);
    setHintTarget(null);
    setRevealedCells(new Set());
    generateGame();
  };

  const tapCell = (index: number) => {
    if (gameState !== 'playing') return;
    if (revealedCells.has(index)) return;

    const cell = grid[index];

    if (cell && 'id' in cell && typeof cell.id === 'number') {
      // Found an object!
      const obj = cell as HiddenObject;
      if (obj.found) return;

      setRevealedCells((prev) => new Set([...prev, index]));
      setScore((s) => s + 100);
      setObjects((prev) =>
        prev.map((o) => (o.id === obj.id ? { ...o, found: true } : o))
      );

      // Animate found
      foundScale.value = withSequence(
        withSpring(1.15, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      // Distractor - wrong click
      setRevealedCells((prev) => new Set([...prev, index]));
      setWrongClicks((w) => w + 1);
      setScore((s) => Math.max(0, s - 10));
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;

    // Find an unfound object
    const unfound = objects.filter((o) => !o.found);
    if (unfound.length === 0) return;

    // Find its position in grid
    const targetObj = unfound[Math.floor(Math.random() * unfound.length)];
    const targetIndex = grid.findIndex(
      (cell) => cell && 'id' in cell && (cell as HiddenObject).id === targetObj.id
    );

    if (targetIndex >= 0) {
      setHints((h) => h - 1);
      setHintTarget(targetIndex);
      setRevealedCells((prev) => new Set([...prev, targetIndex]));
      setObjects((prev) =>
        prev.map((o) => (o.id === targetObj.id ? { ...o, found: true } : o))
      );
      setScore((s) => s + 50);

      // Glow animation
      hintGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 })
      );

      // Clear hint after delay
      setTimeout(() => setHintTarget(null), 1500);
    }
  };

  const endGame = () => {
    setGameState('gameover');
    const foundCount = objects.filter((o) => o.found).length;
    const timeBonus = Math.floor(timeLeft) * 5;
    const finalScore = score + timeBonus;
    addCurrency({ points: finalScore });
    modifyStats({
      creativity: Math.min(100, foundCount * 5 + Math.floor(timeLeft / 10)),
    });
  };

  const foundCount = objects.filter((o) => o.found).length;
  const cellSize = (SCREEN_W - spacing.md * 2 - 8 * (GRID_SIZE - 1)) / GRID_SIZE;

  // ─── Render: Idle / Game Over ─────────────────────────────────────

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>Photo Hunt</Text>
        </Animated.View>

        <Text style={styles.subtitle}>
          Find all hidden objects in the school scene before time runs out!
        </Text>

        <Card style={styles.card}>
          {gameState === 'gameover' ? (
            <Animated.View entering={BounceIn}>
              <Text style={styles.resultTitle}>
                {foundCount === OBJECTS_COUNT ? 'All Found!' : 'Time\'s Up!'}
              </Text>
              <Text style={styles.resultScore}>Score: {score}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>
                    {foundCount}/{OBJECTS_COUNT}
                  </Text>
                  <Text style={styles.statLabel}>Found</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{wrongClicks}</Text>
                  <Text style={styles.statLabel}>Misses</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{GAME_TIME - timeLeft}s</Text>
                  <Text style={styles.statLabel}>Time Used</Text>
                </View>
              </View>
              <Text style={styles.pointsText}>
                Points: PTS {score + Math.floor(timeLeft) * 5}
              </Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+Creativity</Text>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.resultText}>
              Find {OBJECTS_COUNT} hidden objects in {GAME_TIME} seconds. Use hints wisely!
            </Text>
          )}
        </Card>

        <Button
          title={gameState === 'gameover' ? 'Play Again' : 'Start Hunt (-10 ENERGY)'}
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
        <Text style={[styles.hudTimer, { color: timeLeft <= 10 ? colors.danger : colors.warning }]}>
          {timeLeft}s
        </Text>
        <Text style={styles.hudScore}>Score: {score}</Text>
        <Text style={styles.hudFound}>
          {foundCount}/{OBJECTS_COUNT}
        </Text>
      </View>

      {/* Target list */}
      <View style={styles.targetList}>
        {objects.map((obj) => (
          <View
            key={obj.id}
            style={[styles.targetItem, obj.found && styles.targetItemFound]}
          >
            <Text style={[styles.targetEmoji, obj.found && styles.targetEmojiFound]}>
              {obj.emoji}
            </Text>
            <Text style={[styles.targetName, obj.found && styles.targetNameFound]}>
              {obj.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Hint button */}
      <TouchableOpacity
        style={[styles.hintButton, hints <= 0 && styles.hintButtonDisabled]}
        onPress={useHint}
        disabled={hints <= 0}
        activeOpacity={0.7}
      >
        <Text style={styles.hintButtonText}>
          {hints > 0 ? `HINT (${hints} left)` : 'No Hints'}
        </Text>
      </TouchableOpacity>

      {/* Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {grid.map((cell, index) => {
            const isRevealed = revealedCells.has(index);
            const isHinted = hintTarget === index;
            const isTarget = cell && 'id' in cell;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => tapCell(index)}
                activeOpacity={0.6}
                disabled={isRevealed}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                  },
                  isRevealed && isTarget && styles.cellFound,
                  isRevealed && !isTarget && styles.cellWrong,
                  isHinted && styles.cellHinted,
                ]}
              >
                {isRevealed ? (
                  <Animated.View entering={BounceIn}>
                    <Text style={styles.cellEmoji}>
                      {cell ? ('emoji' in cell ? cell.emoji : '?') : '?'}
                    </Text>
                  </Animated.View>
                ) : (
                  <View style={styles.cellHidden}>
                    <Text style={styles.cellHiddenDot}>?</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
    fontSize: 28,
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
    fontSize: 12,
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
  hudTimer: {
    fontSize: 18,
    fontWeight: '800',
  },
  hudScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  hudFound: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  targetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    opacity: 0.8,
  },
  targetItemFound: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: colors.success,
    opacity: 1,
  },
  targetEmoji: {
    fontSize: 16,
    marginRight: 4,
    opacity: 0.5,
  },
  targetEmojiFound: {
    opacity: 1,
  },
  targetName: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  targetNameFound: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  hintButton: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  hintButtonDisabled: {
    backgroundColor: colors.surfaceHighlight,
  },
  hintButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
  },
  cellHidden: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHiddenDot: {
    fontSize: 20,
    color: colors.surfaceGlow,
    fontWeight: '800',
  },
  cellFound: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: colors.success,
  },
  cellWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  cellHinted: {
    borderColor: colors.primary,
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  cellEmoji: {
    fontSize: 28,
  },
});
