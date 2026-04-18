import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withDecay,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BALL_SIZE = 48;
const TARGET_W = 80;
const TARGET_H = 40;

export default function FootballTossScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [throws, setThrows] = useState(0);

  const targetX = SCREEN_W / 2 - TARGET_W / 2;
  const targetY = 100;

  const ballX = useSharedValue(SCREEN_W / 2 - BALL_SIZE / 2);
  const ballY = useSharedValue(SCREEN_H - 200);
  const ballScale = useSharedValue(1);

  const resetBall = () => {
    ballX.value = SCREEN_W / 2 - BALL_SIZE / 2;
    ballY.value = SCREEN_H - 200;
    ballScale.value = withSpring(1);
  };

  const checkHit = (x: number, y: number) => {
    const hit =
      x > targetX &&
      x + BALL_SIZE < targetX + TARGET_W &&
      y > targetY &&
      y + BALL_SIZE < targetY + TARGET_H;

    if (hit) {
      setScore((s) => s + 1);
      ballScale.value = withSpring(1.4, {}, () => {
        ballScale.value = withSpring(1);
      });
    }

    setThrows((t) => {
      const next = t + 1;
      if (next >= 5) {
        setTimeout(() => {
          setGameOver(true);
          const pointsEarned = (hit ? score + 1 : score) * 15;
          addCurrency({ points: pointsEarned });
          modifyStats({ athletics: Math.min(100, (hit ? score + 1 : score) * 2) });
        }, 600);
      }
      return next;
    });

    setTimeout(resetBall, 500);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(ballX);
      cancelAnimation(ballY);
    })
    .onUpdate((event) => {
      ballX.value = event.translationX + (SCREEN_W / 2 - BALL_SIZE / 2);
      ballY.value = event.translationY + (SCREEN_H - 200);
    })
    .onEnd((event) => {
      ballX.value = withDecay({ velocity: event.velocityX, deceleration: 0.995 }, (finished) => {
        if (finished) {
          runOnJS(checkHit)(ballX.value, ballY.value);
        }
      });
      ballY.value = withDecay({ velocity: event.velocityY, deceleration: 0.995 }, (finished) => {
        if (finished) {
          runOnJS(checkHit)(ballX.value, ballY.value);
        }
      });
    });

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ballX.value - (SCREEN_W / 2 - BALL_SIZE / 2) },
      { translateY: ballY.value - (SCREEN_H - 200) },
      { scale: ballScale.value },
    ],
  }));

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setThrows(0);
    resetBall();
  };

  if (!started || gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Football Toss</Text>
        <Text style={styles.subtitle}>Flick the football into the end zone!</Text>
        <Card style={styles.card}>
          <Text style={styles.resultText}>
            {gameOver ? `Game Over!\nScore: ${score} / 5\nPoints earned: PTS ${score * 15}` : '5 throws. Good luck!'}
          </Text>
        </Card>
        <Button title={gameOver ? 'Play Again' : 'Start Game (-10 ENERGY)'} onPress={startGame} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gameContainer}>
      <Text style={styles.gameTitle}>Football Toss</Text>
      <Text style={styles.gameSubtitle}>Throw {throws} / 5 • Score: {score}</Text>

      <View style={[styles.target, { left: targetX, top: targetY }]}>
        <Text style={styles.targetText}>END ZONE</Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.ball, ballStyle]}>
          <Text style={styles.ballEmoji}>BALL</Text>
        </Animated.View>
      </GestureDetector>

      <Text style={styles.hint}>Drag and flick the ball toward the end zone!</Text>
    </GestureHandlerRootView>
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
    alignItems: 'center',
    paddingTop: 48,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  gameSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  target: {
    position: 'absolute',
    width: TARGET_W,
    height: TARGET_H,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  ball: {
    position: 'absolute',
    bottom: 200,
    width: BALL_SIZE,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballEmoji: {
    fontSize: 36,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    color: colors.textMuted,
    fontSize: 14,
  },
});
