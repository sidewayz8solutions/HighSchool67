import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

interface CodeBlock {
  id: number;
  text: string;
  color: string;
  indent: number;
}

interface Puzzle {
  title: string;
  description: string;
  blocks: CodeBlock[];
  hintIndex: number; // which block index is the hint for
}

// ─── Puzzle Data ────────────────────────────────────────────────────

const PUZZLES: Puzzle[] = [
  {
    title: 'Morning Routine',
    description: 'Arrange the steps to get ready for school.',
    blocks: [
      { id: 0, text: 'wake_up()', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'brush_teeth()', color: '#22c55e', indent: 0 },
      { id: 2, text: 'get_dressed()', color: '#22c55e', indent: 0 },
      { id: 3, text: 'eat_breakfast()', color: '#22c55e', indent: 0 },
      { id: 4, text: 'grab_backpack()', color: '#f59e0b', indent: 0 },
      { id: 5, text: 'leave_for_school()', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Grade Calculator',
    description: 'Put the logic in order to calculate a letter grade.',
    blocks: [
      { id: 0, text: 'score = get_test_score()', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'if score >= 90:', color: '#a855f7', indent: 0 },
      { id: 2, text: 'grade = "A"', color: '#22c55e', indent: 1 },
      { id: 3, text: 'elif score >= 80:', color: '#a855f7', indent: 0 },
      { id: 4, text: 'grade = "B"', color: '#22c55e', indent: 1 },
      { id: 5, text: 'else:', color: '#a855f7', indent: 0 },
      { id: 6, text: 'grade = "C"', color: '#22c55e', indent: 1 },
      { id: 7, text: 'print(grade)', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Lunch Queue',
    description: 'Fix the loop that serves lunch to each student.',
    blocks: [
      { id: 0, text: 'students = get_line()', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'for student in students:', color: '#a855f7', indent: 0 },
      { id: 2, text: 'tray = get_lunch_tray()', color: '#22c55e', indent: 1 },
      { id: 3, text: 'student.give(tray)', color: '#22c55e', indent: 1 },
      { id: 4, text: 'if student.vegetarian:', color: '#f59e0b', indent: 1 },
      { id: 5, text: 'tray.swap_veggie()', color: '#22c55e', indent: 2 },
    ],
    hintIndex: 1,
  },
  {
    title: 'Homework Check',
    description: 'Order the function that checks homework completion.',
    blocks: [
      { id: 0, text: 'def check_homework():', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'assignments = get_list()', color: '#22c55e', indent: 1 },
      { id: 2, text: 'completed = 0', color: '#22c55e', indent: 1 },
      { id: 3, text: 'for hw in assignments:', color: '#a855f7', indent: 1 },
      { id: 4, text: 'if hw.is_done():', color: '#f59e0b', indent: 2 },
      { id: 5, text: 'completed += 1', color: '#22c55e', indent: 3 },
      { id: 6, text: 'return completed', color: '#ec4899', indent: 1 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Club Signup',
    description: 'Arrange the code for signing up students to clubs.',
    blocks: [
      { id: 0, text: 'clubs = {\'Art\': [], \'Debate\': []}', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'student = input("Name: ")', color: '#22c55e', indent: 0 },
      { id: 2, text: 'choice = input("Club: ")', color: '#22c55e', indent: 0 },
      { id: 3, text: 'if choice in clubs:', color: '#a855f7', indent: 0 },
      { id: 4, text: 'clubs[choice].add(student)', color: '#22c55e', indent: 1 },
      { id: 5, text: 'print("Welcome!")', color: '#22c55e', indent: 1 },
      { id: 6, text: 'else:', color: '#a855f7', indent: 0 },
      { id: 7, text: 'print("Club not found")', color: '#ef4444', indent: 1 },
    ],
    hintIndex: 3,
  },
  {
    title: 'GPA Boost',
    description: 'Order the code that calculates a bonus GPA point.',
    blocks: [
      { id: 0, text: 'grades = [85, 92, 78, 96]', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'total = 0', color: '#22c55e', indent: 0 },
      { id: 2, text: 'for grade in grades:', color: '#a855f7', indent: 0 },
      { id: 3, text: 'total = total + grade', color: '#22c55e', indent: 1 },
      { id: 4, text: 'average = total / 4', color: '#22c55e', indent: 0 },
      { id: 5, text: 'if average > 90:', color: '#f59e0b', indent: 0 },
      { id: 6, text: 'gpa = 4.0', color: '#22c55e', indent: 1 },
      { id: 7, text: 'print("Honor Roll!")', color: '#ec4899', indent: 1 },
    ],
    hintIndex: 2,
  },
  {
    title: 'Attendance Tracker',
    description: 'Fix the attendance checking system.',
    blocks: [
      { id: 0, text: 'def mark_attendance(day):', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'roster = get_class_roster()', color: '#22c55e', indent: 1 },
      { id: 2, text: 'for student in roster:', color: '#a855f7', indent: 1 },
      { id: 3, text: 'if student.is_present(day):', color: '#f59e0b', indent: 2 },
      { id: 4, text: 'mark_green(student)', color: '#22c55e', indent: 3 },
      { id: 5, text: 'else:', color: '#a855f7', indent: 2 },
      { id: 6, text: 'mark_absent(student)', color: '#ef4444', indent: 3 },
      { id: 7, text: 'save_to_database()', color: '#ec4899', indent: 1 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Secret Message',
    description: 'Decode loop: arrange the code to reveal the message.',
    blocks: [
      { id: 0, text: 'message = "HSEDIUGH"', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'decoded = ""', color: '#22c55e', indent: 0 },
      { id: 2, text: 'for i in range(len(message)):', color: '#a855f7', indent: 0 },
      { id: 3, text: 'if i % 2 == 0:', color: '#f59e0b', indent: 1 },
      { id: 4, text: 'decoded += message[i]', color: '#22c55e', indent: 2 },
      { id: 5, text: 'print(decoded)', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 2,
  },
  {
    title: 'Sport Tryouts',
    description: 'Arrange the tryout evaluation logic.',
    blocks: [
      { id: 0, text: 'athletes = get_tryouts()', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'team = []', color: '#22c55e', indent: 0 },
      { id: 2, text: 'for athlete in athletes:', color: '#a855f7', indent: 0 },
      { id: 3, text: 'score = run_drills(athlete)', color: '#22c55e', indent: 1 },
      { id: 4, text: 'if score >= passing:', color: '#f59e0b', indent: 1 },
      { id: 5, text: 'team.append(athlete)', color: '#22c55e', indent: 2 },
      { id: 6, text: 'print(f"Team size: {len(team)}")', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 2,
  },
  {
    title: 'Study Timer',
    description: 'Order the Pomodoro study timer code.',
    blocks: [
      { id: 0, text: 'def study_timer(minutes):', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'seconds = minutes * 60', color: '#22c55e', indent: 1 },
      { id: 2, text: 'while seconds > 0:', color: '#a855f7', indent: 1 },
      { id: 3, text: 'print(format_time(seconds))', color: '#22c55e', indent: 2 },
      { id: 4, text: 'seconds -= 1', color: '#22c55e', indent: 2 },
      { id: 5, text: 'sleep(1)', color: '#22c55e', indent: 2 },
      { id: 6, text: 'print("Break time!")', color: '#ec4899', indent: 1 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Class Schedule',
    description: 'Arrange the code to build a class schedule.',
    blocks: [
      { id: 0, text: 'periods = ["Math", "Science", "Lunch", "History"]', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'schedule = {}', color: '#22c55e', indent: 0 },
      { id: 2, text: 'for i, period in enumerate(periods):', color: '#a855f7', indent: 0 },
      { id: 3, text: 'room = get_classroom(period)', color: '#22c55e', indent: 1 },
      { id: 4, text: 'schedule[i+1] = {period: room}', color: '#22c55e', indent: 1 },
      { id: 5, text: 'print_schedule(schedule)', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 2,
  },
  {
    title: 'Grade Comparison',
    description: 'Order the code to compare two student grades.',
    blocks: [
      { id: 0, text: 'alice = get_grade("Alice")', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'bob = get_grade("Bob")', color: '#3b82f6', indent: 0 },
      { id: 2, text: 'if alice > bob:', color: '#a855f7', indent: 0 },
      { id: 3, text: 'winner = "Alice"', color: '#22c55e', indent: 1 },
      { id: 4, text: 'elif bob > alice:', color: '#a855f7', indent: 0 },
      { id: 5, text: 'winner = "Bob"', color: '#22c55e', indent: 1 },
      { id: 6, text: 'else:', color: '#a855f7', indent: 0 },
      { id: 7, text: 'winner = "Tie"', color: '#22c55e', indent: 1 },
      { id: 8, text: 'announce(winner)', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 2,
  },
  {
    title: 'Friend Finder',
    description: 'Fix the code that finds friends in the same club.',
    blocks: [
      { id: 0, text: 'my_clubs = get_my_clubs()', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'classmates = get_classmates()', color: '#3b82f6', indent: 0 },
      { id: 2, text: 'friends = []', color: '#22c55e', indent: 0 },
      { id: 3, text: 'for person in classmates:', color: '#a855f7', indent: 0 },
      { id: 4, text: 'shared = person.clubs & my_clubs', color: '#22c55e', indent: 1 },
      { id: 5, text: 'if len(shared) > 0:', color: '#f59e0b', indent: 1 },
      { id: 6, text: 'friends.append(person.name)', color: '#22c55e', indent: 2 },
      { id: 7, text: 'print(f"Found {len(friends)} friends")', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 3,
  },
  {
    title: 'Test Prep',
    description: 'Arrange the study session function.',
    blocks: [
      { id: 0, text: 'def study_for_test(subject):', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'materials = get_notes(subject)', color: '#22c55e', indent: 1 },
      { id: 2, text: 'flashcards = make_cards(materials)', color: '#22c55e', indent: 1 },
      { id: 3, text: 'correct = 0', color: '#22c55e', indent: 1 },
      { id: 4, text: 'for card in flashcards:', color: '#a855f7', indent: 1 },
      { id: 5, text: 'if quiz(card) == True:', color: '#f59e0b', indent: 2 },
      { id: 6, text: 'correct += 1', color: '#22c55e', indent: 3 },
      { id: 7, text: 'return correct / len(flashcards)', color: '#ec4899', indent: 1 },
    ],
    hintIndex: 0,
  },
  {
    title: 'Bell Schedule',
    description: 'Order the code for the school bell system.',
    blocks: [
      { id: 0, text: 'bells = {8: "Start", 12: "Lunch", 15: "End"}', color: '#3b82f6', indent: 0 },
      { id: 1, text: 'current_time = get_time()', color: '#22c55e', indent: 0 },
      { id: 2, text: 'for bell_time, event in bells.items():', color: '#a855f7', indent: 0 },
      { id: 3, text: 'if current_time == bell_time:', color: '#f59e0b', indent: 1 },
      { id: 4, text: 'ring_bell()', color: '#22c55e', indent: 2 },
      { id: 5, text: 'announce(event)', color: '#22c55e', indent: 2 },
      { id: 6, text: 'log_bell_event(event)', color: '#ec4899', indent: 0 },
    ],
    hintIndex: 2,
  },
];

const TIME_PER_PUZZLE = 30;
const MAX_HINTS = 3;

// ─── Helpers ────────────────────────────────────────────────────────

function shuffleBlocks(blocks: CodeBlock[]): CodeBlock[] {
  // Create a shuffled version that is NOT in correct order
  let shuffled = [...blocks].sort(() => Math.random() - 0.5);
  let attempts = 0;
  // Ensure it's actually different from the original
  while (
    shuffled.every((b, i) => b.id === blocks[i].id) &&
    attempts < 10
  ) {
    shuffled = [...blocks].sort(() => Math.random() - 0.5);
    attempts++;
  }
  return shuffled;
}

function blocksEqual(a: CodeBlock[], b: CodeBlock[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((block, i) => block.id === b[i].id);
}

// ─── Component ──────────────────────────────────────────────────────

export default function CodingChallengeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [shuffledPuzzles, setShuffledPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [orderedBlocks, setOrderedBlocks] = useState<CodeBlock[]>([]);
  const [poolBlocks, setPoolBlocks] = useState<CodeBlock[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_PUZZLE);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);
  const [hintActive, setHintActive] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Animated values
  const sequenceGlow = useSharedValue(0);
  const errorShake = useSharedValue(0);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + sequenceGlow.value * 0.5,
    shadowRadius: 4 + sequenceGlow.value * 12,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || feedback) return;
    if (timeLeft <= 0) {
      // Time up - skip this puzzle
      handleNextPuzzle(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, feedback]);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    const shuffled = [...PUZZLES].sort(() => Math.random() - 0.5);
    setShuffledPuzzles(shuffled);
    setGameState('playing');
    setCurrentPuzzleIndex(0);
    setScore(0);
    setTotalScore(0);
    setPuzzlesSolved(0);
    setHintsLeft(MAX_HINTS);
    setHintActive(false);
    setFeedback(null);

    const firstPuzzle = shuffled[0];
    if (firstPuzzle) {
      setOrderedBlocks([]);
      setPoolBlocks(shuffleBlocks(firstPuzzle.blocks));
      setTimeLeft(TIME_PER_PUZZLE);
    }
  };

  const loadPuzzle = (index: number) => {
    const puzzle = shuffledPuzzles[index];
    if (!puzzle) return;
    setOrderedBlocks([]);
    setPoolBlocks(shuffleBlocks(puzzle.blocks));
    setTimeLeft(TIME_PER_PUZZLE);
    setFeedback(null);
    setHintActive(false);
  };

  const handleNextPuzzle = useCallback(
    (solved: boolean) => {
      if (solved) {
        const timeBonus = Math.floor(timeLeft * 5);
        const puzzleScore = 100 + timeBonus;
        setScore(puzzleScore);
        setTotalScore((s) => s + puzzleScore);
        setPuzzlesSolved((p) => p + 1);
        setFeedback('correct');

        // Glow animation
        sequenceGlow.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 600 })
        );
      } else {
        setFeedback('wrong');
        // Shake animation
        errorShake.value = withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(0, { duration: 60 })
        );
      }

      setTimeout(() => {
        const nextIndex = currentPuzzleIndex + 1;
        if (nextIndex >= shuffledPuzzles.length) {
          setGameState('gameover');
          const finalPoints = totalScore + (solved ? score : 0);
          addCurrency({ points: finalPoints });
          modifyStats({
            academics: Math.min(100, (puzzlesSolved + (solved ? 1 : 0)) * 7),
          });
        } else {
          setCurrentPuzzleIndex(nextIndex);
          loadPuzzle(nextIndex);
        }
      }, solved ? 1200 : 800);
    },
    [currentPuzzleIndex, shuffledPuzzles, timeLeft, totalScore, score, puzzlesSolved, addCurrency, modifyStats]
  );

  const checkSolution = () => {
    const puzzle = shuffledPuzzles[currentPuzzleIndex];
    if (!puzzle || orderedBlocks.length === 0) return;

    // Check if ordered blocks match the correct sequence
    const isCorrect = blocksEqual(orderedBlocks, puzzle.blocks);
    handleNextPuzzle(isCorrect);
  };

  const moveBlockToOrdered = (block: CodeBlock) => {
    if (feedback) return;
    setPoolBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setOrderedBlocks((prev) => [...prev, block]);
  };

  const moveBlockToPool = (block: CodeBlock) => {
    if (feedback) return;
    setOrderedBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setPoolBlocks((prev) => [...prev, block]);
  };

  const useHint = () => {
    if (hintsLeft <= 0 || hintActive || feedback) return;
    const puzzle = shuffledPuzzles[currentPuzzleIndex];
    if (!puzzle) return;

    // Find the hint block in the pool
    const hintBlockId = puzzle.blocks[puzzle.hintIndex].id;

    // If it's in the pool, move it to the correct position in ordered
    const inPool = poolBlocks.find((b) => b.id === hintBlockId);
    if (inPool) {
      setHintsLeft((h) => h - 1);
      setPoolBlocks((prev) => prev.filter((b) => b.id !== hintBlockId));
      setOrderedBlocks((prev) => {
        // Insert at the correct position
        const newOrdered = [...prev];
        newOrdered.splice(puzzle.hintIndex, 0, inPool);
        return newOrdered;
      });
      setHintActive(true);
    }
  };

  const currentPuzzle = shuffledPuzzles[currentPuzzleIndex];

  // ─── Render: Idle / Game Over ─────────────────────────────────────

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>Code Challenge</Text>
        </Animated.View>

        <Text style={styles.subtitle}>
          Arrange code blocks in the correct order to solve each puzzle!
        </Text>

        <Card style={styles.card}>
          {gameState === 'gameover' ? (
            <Animated.View entering={BounceIn}>
              <Text style={styles.resultTitle}>Challenge Complete!</Text>
              <Text style={styles.resultScore}>Score: {totalScore}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>
                    {puzzlesSolved}/{shuffledPuzzles.length}
                  </Text>
                  <Text style={styles.statLabel}>Solved</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{hintsLeft}</Text>
                  <Text style={styles.statLabel}>Hints Saved</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>PTS {totalScore}</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+Academics (Heavy)</Text>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.resultText}>
              {PUZZLES.length}+ puzzles. Drag or tap code blocks into the correct execution order. Syntax highlighting helps!
            </Text>
          )}
        </Card>

        <Button
          title={gameState === 'gameover' ? 'Code Again' : 'Start Challenge (-10 ENERGY)'}
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
        <Text style={styles.hudPuzzle}>
          Puzzle {currentPuzzleIndex + 1}/{shuffledPuzzles.length}
        </Text>
        <Text style={[styles.hudTimer, { color: timeLeft <= 5 ? colors.danger : colors.text }]}>
          {timeLeft}s
        </Text>
        <Text style={styles.hudScore}>Score: {totalScore}</Text>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBar}>
        <View
          style={[
            styles.timerFill,
            {
              width: `${(timeLeft / TIME_PER_PUZZLE) * 100}%`,
              backgroundColor:
                timeLeft <= 8 ? colors.danger : timeLeft <= 15 ? colors.warning : colors.primary,
            },
          ]}
        />
      </View>

      {/* Puzzle info */}
      {currentPuzzle && (
        <Animated.View entering={FadeIn} key={currentPuzzleIndex} style={styles.puzzleHeader}>
          <Text style={styles.puzzleTitle}>{currentPuzzle.title}</Text>
          <Text style={styles.puzzleDesc}>{currentPuzzle.description}</Text>
        </Animated.View>
      )}

      {/* Hint button */}
      <TouchableOpacity
        style={[styles.hintBtn, hintsLeft <= 0 && styles.hintBtnDisabled]}
        onPress={useHint}
        disabled={hintsLeft <= 0}
      >
        <Text style={styles.hintBtnText}>
          {hintsLeft > 0 ? `HINT (${hintsLeft})` : 'No Hints'}
        </Text>
      </TouchableOpacity>

      {/* Ordered sequence area */}
      <Animated.View style={[styles.sequenceArea, glowStyle, shakeStyle]}>
        <Text style={styles.sequenceLabel}>
          YOUR SEQUENCE {orderedBlocks.length > 0 && `(${orderedBlocks.length})`}
        </Text>
        <ScrollView style={styles.sequenceScroll} showsVerticalScrollIndicator={false}>
          {orderedBlocks.length === 0 ? (
            <View style={styles.emptySequence}>
              <Text style={styles.emptyText}>Tap blocks below to build the sequence</Text>
            </View>
          ) : (
            orderedBlocks.map((block, index) => (
              <TouchableOpacity
                key={`ordered-${block.id}`}
                onPress={() => moveBlockToPool(block)}
                activeOpacity={0.7}
              >
                <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.blockRow}>
                  <Text style={styles.blockNumber}>{index + 1}</Text>
                  <View
                    style={[
                      styles.codeBlock,
                      { borderLeftColor: block.color, paddingLeft: 8 + block.indent * 20 },
                    ]}
                  >
                    <View style={[styles.colorIndicator, { backgroundColor: block.color }]} />
                    <Text style={styles.codeText}>{block.text}</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>

      {/* Feedback */}
      {feedback === 'correct' && (
        <Animated.View entering={BounceIn} style={styles.feedbackBox}>
          <Text style={styles.feedbackCorrect}>CORRECT! +{score}</Text>
        </Animated.View>
      )}
      {feedback === 'wrong' && (
        <Animated.View entering={FadeIn} style={styles.feedbackBox}>
          <Text style={styles.feedbackWrong}>NOT QUITE... Moving on</Text>
        </Animated.View>
      )}

      {/* Pool area */}
      <View style={styles.poolArea}>
        <Text style={styles.poolLabel}>AVAILABLE BLOCKS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poolScroll}>
          {poolBlocks.map((block) => (
            <TouchableOpacity
              key={`pool-${block.id}`}
              onPress={() => moveBlockToOrdered(block)}
              activeOpacity={0.6}
            >
              <View style={[styles.poolBlock, { borderTopColor: block.color }]}>
                <Text style={styles.poolText}>{block.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Check button */}
      <TouchableOpacity
        style={[styles.checkButton, orderedBlocks.length === 0 && styles.checkButtonDisabled]}
        onPress={checkSolution}
        disabled={orderedBlocks.length === 0 || !!feedback}
        activeOpacity={0.7}
      >
        <Text style={styles.checkButtonText}>
          {feedback ? '...' : 'CHECK SOLUTION'}
        </Text>
      </TouchableOpacity>
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
  hudPuzzle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  hudTimer: {
    fontSize: 16,
    fontWeight: '800',
  },
  hudScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  timerBar: {
    height: 5,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  puzzleHeader: {
    marginBottom: spacing.sm,
  },
  puzzleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  puzzleDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  hintBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  hintBtnDisabled: {
    backgroundColor: colors.surfaceHighlight,
  },
  hintBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  sequenceArea: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
  },
  sequenceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  sequenceScroll: {
    flex: 1,
  },
  emptySequence: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  blockNumber: {
    width: 22,
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textAlign: 'center',
  },
  codeBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingRight: spacing.sm,
    borderLeftWidth: 4,
  },
  colorIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  codeText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  feedbackBox: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  feedbackCorrect: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.success,
  },
  feedbackWrong: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.warning,
  },
  poolArea: {
    marginBottom: spacing.sm,
  },
  poolLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  poolScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  poolBlock: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderTopWidth: 3,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  checkButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkButtonDisabled: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
