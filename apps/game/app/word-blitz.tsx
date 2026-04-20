import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, colors, radii, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  FadeIn,
  FadeInUp,
  BounceIn,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// ─── Types ──────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard';

interface WordEntry {
  word: string;
  hint: string;
}

// ─── Word Bank ──────────────────────────────────────────────────────

const WORD_BANK: Record<Difficulty, WordEntry[]> = {
  easy: [
    { word: 'homework', hint: 'After school assignments' },
    { word: 'football', hint: 'Friday night lights sport' },
    { word: 'lunchbox', hint: 'Meal container' },
    { word: 'notebook', hint: 'Where you take notes' },
    { word: 'pencil', hint: 'Writing tool' },
    { word: 'locker', hint: 'Storage in the hallway' },
    { word: 'detention', hint: 'Punishment after class' },
    { word: 'theater', hint: 'Drama club stage' },
    { word: 'gym', hint: 'Where you play sports' },
    { word: 'cheer', hint: 'Spirit squad shout' },
    { word: 'quiz', hint: 'Short test' },
    { word: 'dance', hint: 'Prom night activity' },
    { word: 'prom', hint: 'Formal dance event' },
    { word: 'club', hint: 'After school group' },
    { word: 'team', hint: 'Group of players' },
    { word: 'band', hint: 'Musical group' },
    { word: 'book', hint: 'Reading material' },
    { word: 'exam', hint: 'Big test' },
    { word: 'grade', hint: 'Letter score' },
    { word: 'class', hint: 'Period of learning' },
  ],
  medium: [
    { word: 'cafeteria', hint: 'Where you eat lunch' },
    { word: 'auditorium', hint: 'Large school hall' },
    { word: 'semester', hint: 'Half of a school year' },
    { word: 'valedictorian', hint: 'Top of the class' },
    { word: 'extracurricular', hint: 'After school activities' },
    { word: 'scholarship', hint: 'College money award' },
    { word: 'graduation', hint: 'Commencement day' },
    { word: 'principal', hint: 'Head of the school' },
    { word: 'cafeteria', hint: 'Lunch room' },
    { word: 'homecoming', hint: 'Fall celebration dance' },
    { word: 'yearbook', hint: 'Memory collection' },
    { word: 'tutoring', hint: 'Extra help sessions' },
    { word: 'rehearsal', hint: 'Practice for a play' },
    { word: 'science', hint: 'Lab subject' },
    { word: 'geometry', hint: 'Shapes and angles math' },
    { word: 'literature', hint: 'Book study' },
    { word: 'chemistry', hint: 'Periodic table subject' },
    { word: 'biology', hint: 'Study of life' },
    { word: 'marching', hint: '____ band' },
  ],
  hard: [
    { word: 'valedictorian', hint: 'Highest academic honor' },
    { word: 'extracurricular', hint: 'Outside regular classes' },
    { word: 'scholastic', hint: 'Related to education' },
    { word: 'commencement', hint: 'Graduation ceremony' },
    { word: 'matriculate', hint: 'Enroll at college' },
    { word: 'baccalaureate', hint: 'Bachelor degree speech' },
    { word: 'debate', hint: 'Argument competition' },
    { word: 'trigonometry', hint: 'Advanced triangle math' },
    { word: 'apprenticeship', hint: 'Hands-on training' },
    { word: 'internship', hint: 'Work experience' },
    { word: 'championship', hint: 'Final competition' },
    { word: 'vocabulary', hint: 'Word collection' },
    { word: 'laboratory', hint: 'Science room' },
    { word: 'philosophy', hint: 'Deep thinking subject' },
    { word: 'psychology', hint: 'Mind study' },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────

function getTimePerWord(diff: Difficulty): number {
  switch (diff) {
    case 'easy':
      return 20;
    case 'medium':
      return 15;
    default:
      return 10;
  }
}

function scrambleWord(word: string): string {
  const arr = word.split('');
  let scrambled = arr.sort(() => Math.random() - 0.5).join('');
  // Make sure it's actually scrambled
  let attempts = 0;
  while (scrambled === word && attempts < 10) {
    scrambled = arr.sort(() => Math.random() - 0.5).join('');
    attempts++;
  }
  return scrambled;
}

function pickRandomWord(diff: Difficulty): WordEntry {
  const pool = WORD_BANK[diff];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Component ──────────────────────────────────────────────────────

export default function WordBlitzScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState(0);
  const [totalGameTime, setTotalGameTime] = useState(60);
  const [wordTimeLeft, setWordTimeLeft] = useState(20);
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wordsSolved, setWordsSolved] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [usedWordIndices, setUsedWordIndices] = useState<Set<number>>(new Set());

  // Animated values
  const shakeOffset = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const letterAnims = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeOffset]);

  const triggerGlow = useCallback(() => {
    glowScale.value = withSequence(
      withSpring(1.08, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
  }, [glowScale]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (totalGameTime <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTotalGameTime((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, totalGameTime]);

  // Word timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (wordTimeLeft <= 0) {
      // Time up for this word
      setStreak(0);
      nextWord();
      return;
    }
    const timer = setTimeout(() => setWordTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, wordTimeLeft]);

  const nextWord = useCallback(() => {
    const pool = WORD_BANK[difficulty];
    // Pick a word we haven't used yet, or reset if all used
    let available = pool.map((_, i) => i).filter((i) => !usedWordIndices.has(i));
    if (available.length === 0) {
      setUsedWordIndices(new Set());
      available = pool.map((_, i) => i);
    }
    const randomIndex = available[Math.floor(Math.random() * available.length)];
    const entry = pool[randomIndex];
    setUsedWordIndices((prev) => new Set([...prev, randomIndex]));
    setCurrentWord(entry);
    setScrambled(scrambleWord(entry.word));
    setUserInput('');
    setWordTimeLeft(getTimePerWord(difficulty));
    setFeedback(null);

    // Stagger letter animations
    entry.word.split('').forEach((_, i) => {
      letterAnims[i].value = 0;
      letterAnims[i].value = withTiming(1, { duration: 300 + i * 60 });
    });
  }, [difficulty, usedWordIndices]);

  const startGame = (diff: Difficulty) => {
    if (!spendEnergy(10)) return;
    setDifficulty(diff);
    setGameState('playing');
    setScore(0);
    setTotalGameTime(60);
    setStreak(0);
    setMaxStreak(0);
    setWordsSolved(0);
    setUsedWordIndices(new Set());
    setFeedback(null);

    const pool = WORD_BANK[diff];
    const idx = Math.floor(Math.random() * pool.length);
    const entry = pool[idx];
    setCurrentWord(entry);
    setScrambled(scrambleWord(entry.word));
    setUserInput('');
    setWordTimeLeft(getTimePerWord(diff));
    setUsedWordIndices(new Set([idx]));
  };

  const submitAnswer = () => {
    if (!currentWord || gameState !== 'playing') return;
    const clean = userInput.trim().toLowerCase();
    if (!clean) return;

    if (clean === currentWord.word.toLowerCase()) {
      // Correct!
      const comboMultiplier = Math.min(streak + 1, 5);
      const timeBonus = Math.floor(wordTimeLeft * 2);
      const pointsEarned = 100 * comboMultiplier + timeBonus;
      setScore((s) => s + pointsEarned);
      setStreak((c) => {
        const newStreak = c + 1;
        setMaxStreak((m) => Math.max(m, newStreak));
        return newStreak;
      });
      setWordsSolved((w) => w + 1);
      setFeedback('correct');
      triggerGlow();
      setTimeout(() => {
        setFeedback(null);
        nextWord();
      }, 800);
    } else {
      // Wrong
      setStreak(0);
      setFeedback('wrong');
      triggerShake();
      setTimeout(() => setFeedback(null), 600);
    }
    setUserInput('');
  };

  const endGame = () => {
    setGameState('gameover');
    Keyboard.dismiss();
    const pointsEarned = score + wordsSolved * 25;
    addCurrency({ points: pointsEarned });
    modifyStats({
      creativity: Math.min(100, wordsSolved * 3),
      academics: Math.min(100, wordsSolved * 2),
    });
  };

  // ─── Render: Idle / Game Over ─────────────────────────────────────

  if (gameState === 'idle' || gameState === 'gameover') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.title}>Word Blitz</Text>
        </Animated.View>

        <Text style={styles.subtitle}>
          Unscramble as many words as you can before time runs out!
        </Text>

        <Card style={styles.card}>
          {gameState === 'gameover' ? (
            <Animated.View entering={BounceIn}>
              <Text style={styles.resultTitle}>Game Over!</Text>
              <Text style={styles.resultScore}>Score: {score}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{wordsSolved}</Text>
                  <Text style={styles.statLabel}>Words</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{maxStreak}x</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>PTS {score + wordsSolved * 25}</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardText}>+Creativity +Academics</Text>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.resultText}>
              60 seconds. Unscramble words to score! Longer streaks = combo multiplier.
            </Text>
          )}
        </Card>

        {gameState === 'idle' && (
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                onPress={() => startGame(diff)}
                style={[
                  styles.diffButton,
                  diff === 'easy' && styles.diffEasy,
                  diff === 'medium' && styles.diffMedium,
                  diff === 'hard' && styles.diffHard,
                ]}
              >
                <Text style={styles.diffButtonText}>
                  {diff === 'easy' ? 'Easy' : diff === 'medium' ? 'Medium' : 'Hard'}
                </Text>
                <Text style={styles.diffDetail}>
                  {diff === 'easy' ? '4-5 letters' : diff === 'medium' ? '6-7 letters' : '8+ letters'}
                </Text>
                <Text style={styles.diffTimer}>
                  {getTimePerWord(diff)}s per word
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: spacing.md }} />

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
    <View style={[styles.gameContainer, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      {/* HUD */}
      <View style={[styles.hud, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <Text style={[styles.hudText, { color: colors.warning }]}>
          {totalGameTime}s
        </Text>
        <Text style={styles.hudScore}>Score: {score}</Text>
        <Text style={[styles.hudText, { color: colors.secondary }]}>
          {wordsSolved} solved
        </Text>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: `${(wordTimeLeft / getTimePerWord(difficulty)) * 100}%`,
              backgroundColor:
                wordTimeLeft <= 5 ? colors.danger : wordTimeLeft <= 10 ? colors.warning : colors.success,
            },
          ]}
        />
      </View>

      {/* Streak */}
      {streak > 1 && (
        <Animated.View entering={BounceIn} style={styles.streakBadge}>
          <Text style={styles.streakText}>
            {streak >= 5 ? 'SAVAGE!' : streak >= 3 ? 'ON FIRE!' : 'NICE!'} {streak}x combo
          </Text>
        </Animated.View>
      )}

      {/* Scrambled word */}
      <Animated.View entering={FadeIn} style={[styles.wordContainer, shakeStyle, glowStyle]}>
        <Text style={styles.hintText}>Unscramble this word:</Text>
        <View style={styles.letterRow}>
          {scrambled.split('').map((letter, i) => (
            <Animated.View
              key={`${scrambled}-${i}`}
              entering={FadeInUp.delay(i * 60)}
              style={[
                styles.letterTile,
                feedback === 'correct' && styles.tileCorrect,
                feedback === 'wrong' && styles.tileWrong,
              ]}
            >
              <Text
                style={[
                  styles.letterText,
                  feedback === 'correct' && styles.letterCorrect,
                  feedback === 'wrong' && styles.letterWrong,
                ]}
              >
                {letter.toUpperCase()}
              </Text>
            </Animated.View>
          ))}
        </View>
        {currentWord && (
          <Text style={styles.hintDetail}>{currentWord.hint}</Text>
        )}
      </Animated.View>

      {/* Feedback */}
      {feedback === 'correct' && (
        <Animated.View entering={FadeIn} style={styles.feedbackContainer}>
          <Text style={styles.feedbackCorrect}>CORRECT! +{100 * Math.min(streak, 5)}</Text>
        </Animated.View>
      )}
      {feedback === 'wrong' && (
        <Animated.View entering={FadeIn} style={styles.feedbackContainer}>
          <Text style={styles.feedbackWrong}>WRONG! Streak lost</Text>
        </Animated.View>
      )}

      {/* Input */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.textInput}
          value={userInput}
          onChangeText={setUserInput}
          onSubmitEditing={submitAnswer}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Type the word..."
          placeholderTextColor={colors.textMuted}
          maxLength={16}
          returnKeyType="go"
        />

        <TouchableOpacity style={styles.submitButton} onPress={submitAnswer} activeOpacity={0.7}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>

      {/* Letter shortcut buttons */}
      <View style={styles.keyboardHint}>
        <Text style={styles.keyboardHintText}>
          Tap letters or type to unscramble
        </Text>
      </View>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={() => { setStreak(0); nextWord(); }}>
        <Text style={styles.skipText}>Skip Word (-streak)</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
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
  },
  rewardText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.lg,
  },
  diffButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  diffEasy: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.success,
  },
  diffMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.warning,
  },
  diffHard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.danger,
  },
  diffButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  diffDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  diffTimer: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
  hudText: {
    fontSize: 16,
    fontWeight: '700',
  },
  hudScore: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
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
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  streakText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hintText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  hintDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  letterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  letterTile: {
    width: 44,
    height: 52,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceGlow,
  },
  tileCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: colors.success,
  },
  tileWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: colors.danger,
  },
  letterText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  letterCorrect: {
    color: colors.success,
  },
  letterWrong: {
    color: colors.danger,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  feedbackCorrect: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.success,
  },
  feedbackWrong: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.danger,
  },
  inputSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
  },
  submitButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  keyboardHint: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  keyboardHintText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
