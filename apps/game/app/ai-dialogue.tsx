import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { generateDialogueFromApi } from '@/services/ai';

export default function AIDialogueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { npcId } = useLocalSearchParams<{ npcId: string }>();
  const npc = useGameStore((s) => s.npcs.find((n) => n.id === npcId));
  const player = useGameStore((s) => s.player);
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const changeNPCRelationship = useGameStore((s) => s.changeNPCRelationship);
  const updateChallenge = useGameStore((s) => s.updateChallenge);

  const [loading, setLoading] = useState(true);
  const [dialogue, setDialogue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!npc) return;

    let cancelled = false;

    async function fetchDialogue() {
      if (!npc) return;
      setLoading(true);
      try {
        const text = await generateDialogueFromApi({
          playerName: player.name,
          clique: player.clique,
          npcName: npc.name,
          npcClique: npc.clique,
          relationship: npc.relationship,
          currentScene: 'hallway between classes',
        });

        if (!cancelled) {
          setDialogue(text ?? `${npc.name} smiles. "Hey ${player.name}, good to see you."`);
          changeNPCRelationship(npc.id, 3, 'friendship');
          updateChallenge('c2', 1);
        }
      } catch (e) {
        if (!cancelled) {
          setError('The AI is taking a nap. Try again later!');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (spendEnergy(10)) {
      fetchDialogue();
    } else {
      setLoading(false);
      setError('Not enough energy to start a deep conversation.');
    }

    return () => {
      cancelled = true;
    };
  }, [npc, player]);

  if (!npc) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Text style={styles.error}>NPC not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      <Text style={styles.title}>AI Conversation</Text>
      <Text style={styles.subtitle}>You bump into {npc.name} {npc.avatar} in the hallway.</Text>

      <Card style={styles.card}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{npc.name} is thinking...</Text>
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View>
            <Text style={styles.npcName}>{npc.name}</Text>
            <Text style={styles.dialogue}>“{dialogue}”</Text>
            <Text style={styles.hint}>Friendship +3</Text>
          </View>
        )}
      </Card>

      <Button title="Back to School" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
    marginBottom: spacing.lg,
    minHeight: 200,
    justifyContent: 'center',
  },
  loader: {
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  npcName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  dialogue: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  hint: {
    marginTop: spacing.md,
    color: colors.success,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});
