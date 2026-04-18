import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import Animated, { FlipInEasyX, FlipOutEasyX, BounceIn } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_W - spacing.md * 2 - 12 * 3) / 4;

const EMOJIS = ['A','B','C','D','E','F','G','H'];

interface CardData {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function generateCards(): CardData[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  const shuffled = pairs.sort(() => Math.random() - 0.5);
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryMatchScreen() {
  const router = useRouter();
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const addCurrency = useGameStore((s) => s.addCurrency);
  const modifyStats = useGameStore((s) => s.modifyStats);

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (!started || gameOver) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, gameOver, timeLeft]);

  const endGame = useCallback(() => {
    setGameOver(true);
    const score = matches * 100 - moves * 5 + Math.floor(timeLeft) * 2;
    const finalScore = Math.max(0, score);
    addCurrency({ points: finalScore });
    modifyStats({ academics: Math.min(100, matches * 5) });
  }, [matches, moves, timeLeft]);

  const startGame = () => {
    if (!spendEnergy(10)) return;
    setStarted(true);
    setGameOver(false);
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeLeft(60);
    setCombo(0);
  };

  const flipCard = (id: number) => {
    if (gameOver || flippedCards.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(newCards);
    setFlippedCards((prev) => [...prev, id]);

    if (flippedCards.length === 1) {
      setMoves((m) => m + 1);
      const firstId = flippedCards[0];
      const firstCard = newCards.find((c) => c.id === firstId);
      const secondCard = newCards.find((c) => c.id === id);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === id ? { ...c, matched: true } : c
            )
          );
          setFlippedCards([]);
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches >= EMOJIS.length) {
              setTimeout(endGame, 500);
            }
            return newMatches;
          });
          setCombo((c) => c + 1);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === id ? { ...c, flipped: false } : c
            )
          );
          setFlippedCards([]);
          setCombo(0);
        }, 800);
      }
    }
  };

  if (!started || gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Memory Match</Text>
        <Text style={styles.subtitle}>Find all matching pairs before time runs out!</Text>
        <Card style={styles.card}>
          <Text style={styles.resultText}>
            {gameOver
              ? `Matches: ${matches}/${EMOJIS.length}\nMoves: ${moves}\nTime: ${60 - timeLeft}s\nPoints: PTS ${Math.max(0, matches * 100 - moves * 5 + Math.floor(timeLeft) * 2)}`
              : 'Match all 8 pairs. Fewer moves = more points!'}
          </Text>
        </Card>
        <Button title={gameOver ? 'Play Again' : 'Start Matching (-10 ENERGY)'} onPress={startGame} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Home" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>⏱ {timeLeft}s</Text>
        <Text style={styles.hudText}>Matches: {matches}/{EMOJIS.length}</Text>
        <Text style={styles.hudText}>Moves: {moves}</Text>
      </View>

      {combo > 1 && (
        <Animated.View entering={BounceIn} style={styles.comboBadge}>
          <Text style={styles.comboText}>🔥 {combo}x Combo!</Text>
        </Animated.View>
      )}

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.7}
            disabled={card.flipped || card.matched || flippedCards.length >= 2}
            onPress={() => flipCard(card.id)}
            style={styles.cardWrapper}
          >
            {card.flipped || card.matched ? (
              <Animated.View entering={FlipInEasyX} style={[styles.cardFace, card.matched && styles.cardMatched]}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
              </Animated.View>
            ) : (
              <Animated.View exiting={FlipOutEasyX} style={styles.cardBack}>
                <Text style={styles.cardBackText}>?</Text>
              </Animated.View>
            )}
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
    fontSize: 18,
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
    fontSize: 14,
    fontWeight: '700',
  },
  comboBadge: {
    alignSelf: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  comboText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  cardWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardMatched: {
    borderColor: colors.success,
    opacity: 0.7,
  },
  cardBack: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardBackText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textMuted,
  },
});
