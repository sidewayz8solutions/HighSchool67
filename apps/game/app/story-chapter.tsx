import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, colors, spacing } from '@repo/ui';
import { useGameStore, STORY_CHAPTERS, getCurrentScene } from '@repo/game-engine';
import { generateDialogueFromApi } from '@/services/ai';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryChoice } from '@repo/types';

export default function StoryChapterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const chapter = STORY_CHAPTERS.find((c) => c.id === chapterId);

  const storyProgress = useGameStore((s) => s.storyProgress);
  const player = useGameStore((s) => s.player);
  const makeStoryChoice = useGameStore((s) => s.makeStoryChoice);
  const resetChapter = useGameStore((s) => s.resetChapter);

  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentSceneId = chapter ? getCurrentScene(chapter, storyProgress) : '';
  const currentScene = chapter?.scenes.find((s) => s.id === currentSceneId);
  const isCompleted = chapter ? storyProgress.completedChapters.includes(chapter.id) : false;

  useEffect(() => {
    if (!currentScene?.aiGenerated) {
      setAiText(null);
      return;
    }

    let cancelled = false;
    async function fetchAi() {
      setLoading(true);
      try {
        const text = await generateDialogueFromApi({
          playerName: player.name,
          clique: player.clique,
          npcName: 'Narrator',
          npcClique: 'neutral',
          relationship: 50,
          currentScene: currentScene!.text,
        });
        if (!cancelled) setAiText(text ?? currentScene!.text);
      } catch {
        if (!cancelled) setAiText(currentScene!.text);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAi();
    return () => { cancelled = true; };
  }, [currentScene?.id]);

  const handleChoice = useCallback((choice: StoryChoice) => {
    if (!chapter || !currentScene) return;
    setSelectedChoice(choice.id);

    // Small delay for dramatic effect
    setTimeout(() => {
      makeStoryChoice(chapter.id, choice.id, currentScene.id);
      setSelectedChoice(null);
      setAiText(null);
    }, 400);
  }, [chapter, currentScene, makeStoryChoice]);

  if (!chapter) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Text style={styles.error}>Chapter not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (isCompleted) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.chapterTitle}>{chapter.thumbnail} {chapter.title}</Text>
        <Card style={styles.card}>
          <Text style={styles.completeText}>🎉 Chapter Complete!</Text>
          <Text style={styles.completeSubtext}>
            You have completed this chapter. Your choices shaped the story.
          </Text>
          <View style={styles.historyBox}>
            <Text style={styles.historyTitle}>Your Choices:</Text>
            {storyProgress.choiceHistory[chapter.id]?.map((choiceId, idx) => {
              const scene = chapter.scenes.find((s) => s.choices.some((c) => c.id === choiceId));
              const choice = scene?.choices.find((c) => c.id === choiceId);
              return (
                <Text key={idx} style={styles.historyItem}>
                  {idx + 1}. {choice?.text ?? 'Unknown choice'}
                </Text>
              );
            })}
          </View>
        </Card>
        <Button title="Replay Chapter" variant="secondary" onPress={() => { resetChapter(chapter.id); setAiText(null); }} />
        <View style={{ height: spacing.md }} />
        <Button title="Back to Story" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  if (!currentScene) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        <Text style={styles.error}>No scenes available.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const displayText = aiText ?? currentScene.text;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.chapterTitle}>{chapter.thumbnail} {chapter.title}</Text>
      <Text style={styles.sceneMeta}>Scene {chapter.scenes.findIndex((s) => s.id === currentScene.id) + 1} / {chapter.scenes.length}</Text>

      <Animated.View entering={FadeIn.duration(400)}>
        <Card style={styles.narrativeCard}>
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loaderText}>The story is unfolding...</Text>
            </View>
          ) : (
            <Text style={styles.narrativeText}>{displayText}</Text>
          )}
        </Card>
      </Animated.View>

      <View style={styles.choicesContainer}>
        {currentScene.choices.map((choice, index) => {
          const meetsStat = !choice.statCheck || (player.stats[choice.statCheck.stat] ?? 0) >= choice.statCheck.threshold;
          const isSelected = selectedChoice === choice.id;

          return (
            <Animated.View key={choice.id} entering={FadeInUp.delay(index * 100).duration(300)}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!meetsStat || !!selectedChoice}
                onPress={() => handleChoice(choice)}
                style={[
                  styles.choiceCard,
                  !meetsStat && styles.choiceDisabled,
                  isSelected && styles.choiceSelected,
                ]}
              >
                <Text style={[styles.choiceText, !meetsStat && styles.choiceTextDisabled]}>
                  {choice.text}
                </Text>
                {!meetsStat && choice.statCheck && (
                  <Text style={styles.statCheckText}>
                    Requires {choice.statCheck.stat} {choice.statCheck.threshold}
                  </Text>
                )}
                {choice.effects.currency && (choice.effects.currency.gems || choice.effects.currency.points) && (
                  <Text style={styles.rewardText}>
                    {choice.effects.currency.points ? `+${choice.effects.currency.points} PTS ` : ''}
                    {choice.effects.currency.gems ? `+${choice.effects.currency.gems} GEMS` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Button title="Leave Chapter" variant="ghost" onPress={() => router.back()} />
      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sceneMeta: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  narrativeCard: {
    marginBottom: spacing.lg,
    minHeight: 150,
    justifyContent: 'center',
  },
  narrativeText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  loader: {
    alignItems: 'center',
  },
  loaderText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  choicesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  choiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  choiceDisabled: {
    opacity: 0.4,
  },
  choiceText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  choiceTextDisabled: {
    color: colors.textMuted,
  },
  statCheckText: {
    color: colors.warning,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  rewardText: {
    color: colors.success,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completeSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  historyBox: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
    padding: spacing.md,
  },
  historyTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  historyItem: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  card: {
    marginBottom: spacing.lg,
  },
});
