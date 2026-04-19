import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, colors, spacing, radii } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { SCHEDULED_EVENTS, canParticipateInEvent, getEventConsequences } from '@repo/game-engine/world-events';
import { formatGameDate } from '@repo/game-engine/event-calendar';
import Animated, { FadeInUp } from 'react-native-reanimated';

const CATEGORY_COLORS: Record<string, string> = {
  academic: colors.primary,
  social: colors.secondary,
  sports: colors.success,
  arts: '#f59e0b',
  drama: '#a855f7',
  holiday: '#ec4899',
  crisis: colors.danger,
  opportunity: colors.accent,
};

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  social: 'Social',
  sports: 'Sports',
  arts: 'Arts',
  drama: 'Drama',
  holiday: 'Holiday',
  crisis: 'Crisis',
  opportunity: 'Opportunity',
};

const SCOPE_LABELS: Record<string, string> = {
  personal: 'Personal',
  clique: 'Clique',
  school_wide: 'School Wide',
  global: 'Global',
};

const CATEGORY_ICONS: Record<string, string> = {
  academic: '📚',
  social: '🎉',
  sports: '🏆',
  arts: '🎨',
  drama: '🎭',
  holiday: '🎃',
  crisis: '⚠️',
  opportunity: '✨',
};

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const player = useGameStore((s) => s.player);
  const progress = useGameStore((s) => s.progress);
  const makeEventChoice = useGameStore((s) => s.makeEventChoice);
  const atmosphere = useGameStore((s) => s.atmosphere);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const event = SCHEDULED_EVENTS.find((e) => e.id === eventId);

  if (!event) {
    return (
      <LinearGradient
        colors={colors.gradientDark as unknown as [string, string]}
        style={styles.gradientBg}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorText}>
            The event you are looking for does not exist.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </LinearGradient>
    );
  }

  const canParticipate = canParticipateInEvent(event, player);
  const consequences = event.consequences ?? [];

  const handleMakeChoice = () => {
    if (!selectedChoice) return;
    makeEventChoice(event.id, selectedChoice);
    setResultMessage('Choice made! The effects have been applied.');
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setResultMessage(null);
  };

  const statCheckPassed = (statCheck?: { stat: string; threshold: number }) => {
    if (!statCheck) return true;
    const statValue = player.stats[statCheck.stat as keyof typeof player.stats] as number | undefined;
    return (statValue ?? 0) >= statCheck.threshold;
  };

  return (
    <LinearGradient
      colors={colors.gradientDark as unknown as [string, string]}
      style={styles.gradientBg}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back to Calendar</Text>
        </TouchableOpacity>

        {/* Category Badge */}
        <View style={styles.categoryRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORY_COLORS[event.category] ?? colors.primary },
            ]}
          >
            <Text style={styles.categoryBadgeIcon}>
              {CATEGORY_ICONS[event.category] ?? '📅'}
            </Text>
            <Text style={styles.categoryBadgeText}>
              {CATEGORY_LABELS[event.category] ?? event.category}
            </Text>
          </View>
          <View style={[styles.scopeBadge, { borderColor: colors.textMuted }]}>
            <Text style={styles.scopeBadgeText}>
              {SCOPE_LABELS[event.scope] ?? event.scope}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Date & Time */}
        <Text style={styles.dateText}>
          {formatGameDate(event.semester, event.day)} • {event.period}
          {event.duration ? ` (${event.duration} periods)` : ''}
        </Text>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </Card>

        {/* Requirements Check */}
        {event.requirements && (
          <Card style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Requirements</Text>
            {event.requirements.minStats && (
              <View style={styles.reqSection}>
                <Text style={styles.reqSubtitle}>Minimum Stats:</Text>
                {Object.entries(event.requirements.minStats).map(
                  ([stat, val]) => {
                    const playerStat =
                      player.stats[stat as keyof typeof player.stats] as
                        | number
                        | undefined;
                    const passed = (playerStat ?? 0) >= (val ?? 0);
                    return (
                      <View key={stat} style={styles.reqRow}>
                        <Text
                          style={[
                            styles.reqText,
                            passed
                              ? styles.reqMet
                              : styles.reqNotMet,
                          ]}
                        >
                          {passed ? '✓' : '✗'} {stat}: {val}
                          {playerStat !== undefined
                            ? ` (you have ${playerStat})`
                            : ''}
                        </Text>
                      </View>
                    );
                  }
                )}
              </View>
            )}
            {event.requirements.clique && (
              <View style={styles.reqSection}>
                <Text style={styles.reqSubtitle}>Clique Required:</Text>
                <Text
                  style={[
                    styles.reqText,
                    player.clique === event.requirements.clique
                      ? styles.reqMet
                      : styles.reqNotMet,
                  ]}
                >
                  {player.clique === event.requirements.clique ? '✓' : '✗'}{' '}
                  {event.requirements.clique}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Can Participate Indicator */}
        {!canParticipate && (
          <View style={styles.cannotParticipate}>
            <Text style={styles.cannotParticipateText}>
              ⚠️ You do not meet the requirements for this event.
            </Text>
          </View>
        )}

        {/* Choices */}
        <Text style={styles.choicesTitle}>Your Choices</Text>
        {event.choices.map((choice, index) => {
          const passed = statCheckPassed(choice.statCheck);
          const isSelected = selectedChoice === choice.id;

          return (
            <Animated.View
              key={choice.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <TouchableOpacity
                style={[
                  styles.choiceCard,
                  isSelected && styles.choiceCardSelected,
                  !passed && styles.choiceCardDisabled,
                ]}
                onPress={() => passed && handleChoiceSelect(choice.id)}
                activeOpacity={passed ? 0.7 : 1}
              >
                <View style={styles.choiceHeader}>
                  <Text
                    style={[
                      styles.choiceLetter,
                      isSelected && styles.choiceLetterSelected,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <View style={styles.choiceInfo}>
                    <Text
                      style={[
                        styles.choiceText,
                        !passed && styles.choiceTextDisabled,
                        isSelected && styles.choiceTextSelected,
                      ]}
                    >
                      {choice.text}
                    </Text>
                    {choice.statCheck && (
                      <Text
                        style={[
                          styles.statCheckText,
                          passed
                            ? styles.statCheckPass
                            : styles.statCheckFail,
                        ]}
                      >
                        Requires {choice.statCheck.stat} {'>'}{' '}
                        {choice.statCheck.threshold}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Text style={styles.selectedCheck}>✓</Text>
                  )}
                </View>

                {/* Choice Effects Preview */}
                {choice.effects.stats && (
                  <View style={styles.effectsRow}>
                    {Object.entries(choice.effects.stats).map(
                      ([stat, val]) =>
                        val !== undefined ? (
                          <View key={stat} style={styles.effectBadge}>
                            <Text
                              style={[
                                styles.effectText,
                                val >= 0
                                  ? styles.effectPositive
                                  : styles.effectNegative,
                              ]}
                            >
                              {val >= 0 ? '+' : ''}
                              {val} {stat}
                            </Text>
                          </View>
                        ) : null
                    )}
                  </View>
                )}

                {choice.effects.npcRelationships && (
                  <View style={styles.effectsRow}>
                    {Object.entries(choice.effects.npcRelationships).map(
                      ([npcId, delta]) => (
                        <View key={npcId} style={styles.effectBadge}>
                          <Text style={styles.effectText}>
                            {delta.friendship
                              ? `${delta.friendship >= 0 ? '+' : ''}${delta.friendship} friendship `
                              : ''}
                            {delta.romance
                              ? `${delta.romance >= 0 ? '+' : ''}${delta.romance} romance`
                              : ''}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}

                {choice.effects.atmosphereDelta !== undefined && (
                  <View style={styles.effectsRow}>
                    <View style={styles.effectBadge}>
                      <Text
                        style={[
                          styles.effectText,
                          (choice.effects.atmosphereDelta ?? 0) >= 0
                            ? styles.effectPositive
                            : styles.effectNegative,
                        ]}
                      >
                        {(choice.effects.atmosphereDelta ?? 0) >= 0 ? '+' : ''}
                        {choice.effects.atmosphereDelta} atmosphere
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Consequence Preview */}
        {consequences.length > 0 && (
          <Card style={styles.consequencesCard}>
            <Text style={styles.consequencesTitle}>⚡ Delayed Effects</Text>
            <Text style={styles.consequencesSubtitle}>
              Your choices may have consequences later...
            </Text>
            {consequences.map((c) => (
              <View key={c.triggerChoiceId} style={styles.consequenceItem}>
                <Text style={styles.consequenceDescription}>
                  • {c.description}
                </Text>
                <Text style={styles.consequenceDelay}>
                  in {c.delayedDays} days
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Rewards */}
        {event.rewards && (
          <Card style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>Rewards</Text>
            {event.rewards.stats &&
              Object.entries(event.rewards.stats).map(([stat, val]) =>
                val !== undefined ? (
                  <Text key={stat} style={styles.rewardText}>
                    +{val} {stat}
                  </Text>
                ) : null
              )}
            {event.rewards.currency?.points ? (
              <Text style={styles.rewardText}>
                +{event.rewards.currency.points} points
              </Text>
            ) : null}
            {event.rewards.currency?.gems ? (
              <Text style={styles.rewardText}>
                +{event.rewards.currency.gems} gems
              </Text>
            ) : null}
          </Card>
        )}

        {/* Result Message */}
        {resultMessage && (
          <View style={styles.resultBanner}>
            <Text style={styles.resultText}>{resultMessage}</Text>
          </View>
        )}

        {/* Participate Button */}
        <Button
          title={
            resultMessage
              ? 'Done!'
              : selectedChoice
              ? 'Confirm Choice'
              : 'Select a Choice'
          }
          onPress={handleMakeChoice}
          disabled={!selectedChoice || !!resultMessage || !canParticipate}
          style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backBtnText: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  categoryBadgeIcon: {
    fontSize: 14,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scopeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  scopeBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  descriptionCard: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  requirementsCard: {
    marginBottom: spacing.md,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.warning,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reqSection: {
    marginBottom: spacing.sm,
  },
  reqSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  reqRow: {
    marginBottom: 2,
  },
  reqText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reqMet: {
    color: colors.success,
  },
  reqNotMet: {
    color: colors.danger,
  },
  cannotParticipate: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  cannotParticipateText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  choicesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  choiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  choiceCardDisabled: {
    opacity: 0.5,
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHighlight,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: spacing.sm,
  },
  choiceLetterSelected: {
    backgroundColor: colors.primary,
    color: '#fff',
  },
  choiceInfo: {
    flex: 1,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  choiceTextSelected: {
    color: colors.primaryLight,
  },
  choiceTextDisabled: {
    color: colors.textMuted,
  },
  selectedCheck: {
    fontSize: 18,
    color: colors.success,
    fontWeight: '800',
  },
  statCheckText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  statCheckPass: {
    color: colors.success,
  },
  statCheckFail: {
    color: colors.danger,
  },
  effectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    marginLeft: 40,
  },
  effectBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  effectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  effectPositive: {
    color: colors.success,
  },
  effectNegative: {
    color: colors.danger,
  },
  consequencesCard: {
    marginBottom: spacing.md,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  consequencesSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  consequenceItem: {
    marginBottom: spacing.xs,
  },
  consequenceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  consequenceDelay: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  rewardsCard: {
    marginBottom: spacing.md,
    borderColor: colors.success,
    borderWidth: 1,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resultBanner: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  resultText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
