import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, radii, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';

interface Question {
  text: string;
  answer: number;
  options: number[];
}

function generateQuestion(): Question {
  const ops = ['+', '-', '*'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 12) + 1;
  let b = Math.floor(Math.random() * 12) + 1;
  let answer = 0;

  if (op === '+') answer = a + b;
  if (op === '-') {
    if (a < b) [a, b] = [b, a];
    answer = a - b;
  }
  if (op === '*') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    answer = a * b;
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    options.add(Math.max(0, answer + offset));
  }

  return {
    text: `${a} ${op === '*' ? '×' : op} ${b} = ?`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

export default function MathBlitzScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);
  const updateChallenge = useGameStore((s) => s.updateChallenge);

  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (started && timeLeft === 0) {
      endGame();
    }
  }, [started, timeLeft]);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setQuestion(generateQuestion());
  };

  const answer = (value: number) => {
    if (!question || gameOver) return;
    if (value === question.answer) {
      setScore((s) => s + 1);
    }
    setQuestion(generateQuestion());
  };

  const endGame = () => {
    setGameOver(true);
    const pointsEarned = score * 10;
    addCurrency({ points: pointsEarned });
    modifyStats({ academics: Math.min(100, score) });
    updateChallenge('c1', score >= 8 ? 80 : 0);
  };

  if (!started || gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Math Blitz</Text>
        <Text style={styles.subtitle}>Answer as many math questions as you can in 30 seconds!</Text>
        <Card style={styles.card}>
          <Text style={styles.resultText}>
            {gameOver ? `Game Over!\nScore: ${score}\nPoints earned: PTS ${score * 10}` : 'Ready to play?'}
          </Text>
        </Card>
        <Button title={gameOver ? 'Play Again' : 'Start Game (-10 ENERGY)'} onPress={startGame} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>⏱ {timeLeft}s</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <Card style={styles.questionCard}>
        <Text style={styles.questionText}>{question?.text}</Text>
      </Card>

      <View style={styles.grid}>
        {question?.options.map((opt) => (
          <TouchableOpacity key={opt} style={styles.option} onPress={() => answer(opt)}>
            <Text style={styles.optionText}>{opt}</Text>
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
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  timer: {
    fontSize: 20,
    color: colors.warning,
    fontWeight: '700',
  },
  score: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  questionCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  option: {
    width: '47%',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
  },
  optionText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
});
