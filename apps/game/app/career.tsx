import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Card, Button, colors, spacing, radii } from '@repo/ui';
import {
  useGameStore,
  getAvailableCareers,
  getCurrentCareer,
  getCareerRecommendation,
  CAREER_PATHS,
} from '@repo/game-engine';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

const CAREER_EMOJI: Record<string, string> = {
  pro_athlete: '🏆',
  scientist: '🔬',
  artist: '🎨',
  influencer: '📱',
  entrepreneur: '💼',
  musician: '🎵',
  activist: '✊',
  detective: '🕵️',
};

const CAREER_COLORS: Record<string, readonly [string, string]> = {
  pro_athlete: ['#ef4444', '#f97316'],
  scientist: ['#3b82f6', '#8b5cf6'],
  artist: ['#ec4899', '#f59e0b'],
  influencer: ['#f59e0b', '#ef4444'],
  entrepreneur: ['#22c55e', '#3b82f6'],
  musician: ['#8b5cf6', '#ec4899'],
  activist: ['#ef4444', '#dc2626'],
  detective: ['#6366f1', '#4f46e5'],
};

export default function CareerScreen() {
  const router = useRouter();
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  const {
    player,
    careerPaths,
    currentCareerId,
    selectCareer,
    checkCareerMilestones,
  } = useGameStore((s) => ({
    player: s.player,
    careerPaths: s.careerPaths,
    currentCareerId: s.currentCareerId,
    selectCareer: s.selectCareer,
    checkCareerMilestones: s.checkCareerMilestones,
  }));

  const availableCareers = useMemo(
    () => getAvailableCareers(player),
    [player]
  );

  const currentCareer = useMemo(
    () => (currentCareerId ? careerPaths.find((c) => c.id === currentCareerId) ?? null : null),
    [careerPaths, currentCareerId]
  );

  const recommendation = useMemo(
    () => getCareerRecommendation(player),
    [player]
  );

  const handleSelectCareer = (careerId: string) => {
    selectCareer(careerId);
    setSelectedCareerId(careerId);
  };

  const handleCheckMilestones = () => {
    const result = checkCareerMilestones();
    if (result.newlyCompleted.length > 0) {
      // Could show a toast here
    }
  };

  return (
    <LinearGradient colors={colors.gradientDark} style={styles.gradientBg}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Career Paths</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.subtitle}>
            Choose your destiny. Each path unlocks unique milestones and rewards.
          </Text>
        </Animated.View>

        {/* Current Career */}
        {currentCareer && (
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Card style={styles.currentCareerCard} glow>
              <LinearGradient
                colors={CAREER_COLORS[currentCareer.id] ?? colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.currentCareerGradient}
              >
                <Text style={styles.currentCareerEmoji}>
                  {CAREER_EMOJI[currentCareer.id] ?? '⭐'}
                </Text>
                <Text style={styles.currentCareerTitle}>{currentCareer.name}</Text>
                <Text style={styles.currentCareerDesc}>{currentCareer.description}</Text>
              </LinearGradient>

              <View style={styles.milestoneSection}>
                <Text style={styles.milestoneHeader}>Milestones</Text>
                {currentCareer.milestones.map((m, idx) => (
                  <View key={m.id} style={styles.milestoneRow}>
                    <View
                      style={[
                        styles.milestoneDot,
                        m.completed && styles.milestoneDotCompleted,
                        idx === currentCareer.currentMilestone && !m.completed && styles.milestoneDotActive,
                      ]}
                    />
                    <View style={styles.milestoneInfo}>
                      <Text
                        style={[
                          styles.milestoneName,
                          m.completed && styles.milestoneNameCompleted,
                        ]}
                      >
                        {m.name}
                      </Text>
                      <Text style={styles.milestoneDesc}>{m.description}</Text>
                      {m.completed && m.reward.title && (
                        <Text style={styles.milestoneReward}>🏅 {m.reward.title}</Text>
                      )}
                    </View>
                  </View>
                ))}
                <Button
                  title="Check Milestones"
                  variant="primary"
                  onPress={handleCheckMilestones}
                  style={styles.checkBtn}
                />
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Recommendation */}
        {recommendation && !currentCareerId && (
          <Animated.View entering={FadeInUp.delay(150).duration(400)}>
            <Card style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Recommended for you</Text>
              <View style={styles.recommendationRow}>
                <Text style={styles.recommendationEmoji}>
                  {CAREER_EMOJI[recommendation.id] ?? '⭐'}
                </Text>
                <View style={styles.recommendationInfo}>
                  <Text style={styles.recommendationName}>{recommendation.name}</Text>
                  <Text style={styles.recommendationDesc}>{recommendation.description}</Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Career Grid */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>Available Paths</Text>
          <View style={styles.careerGrid}>
            {CAREER_PATHS.map((career, index) => {
              const isAvailable = availableCareers.some((c) => c.id === career.id);
              const isSelected = currentCareerId === career.id;
              const isRecommended = recommendation?.id === career.id;

              return (
                <Animated.View
                  key={career.id}
                  entering={FadeIn.delay(index * 50)}
                  style={styles.careerCardWrapper}
                >
                  <TouchableOpacity
                    onPress={() => isAvailable && handleSelectCareer(career.id)}
                    activeOpacity={0.8}
                    disabled={!isAvailable}
                  >
                    <Card
                      style={[
                        styles.careerCard,
                        !isAvailable && styles.careerCardLocked,
                        isSelected && styles.careerCardSelected,
                      ]}
                    >
                      <LinearGradient
                        colors={CAREER_COLORS[career.id] ?? colors.gradientPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.careerCardGradient}
                      >
                        <Text style={styles.careerEmoji}>
                          {CAREER_EMOJI[career.id] ?? '⭐'}
                        </Text>
                        {isRecommended && !isSelected && (
                          <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>Recommended</Text>
                          </View>
                        )}
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedText}>Active</Text>
                          </View>
                        )}
                        {!isAvailable && (
                          <View style={styles.lockedOverlay}>
                            <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.6)" />
                          </View>
                        )}
                      </LinearGradient>
                      <View style={styles.careerInfo}>
                        <Text style={styles.careerName}>{career.name}</Text>
                        <Text style={styles.careerDesc} numberOfLines={2}>
                          {career.description}
                        </Text>
                        <View style={styles.requirementRow}>
                          <Text style={styles.requirementText}>
                            Requires: {career.requirements.dominantStat} {career.requirements.minValue}+
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    paddingTop: spacing.xl + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  currentCareerCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  currentCareerGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  currentCareerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  currentCareerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  currentCareerDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
  },
  milestoneSection: {
    padding: spacing.lg,
  },
  milestoneHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighlight,
    marginRight: spacing.md,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  milestoneDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  milestoneDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  milestoneNameCompleted: {
    color: colors.success,
  },
  milestoneDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  milestoneReward: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
    fontWeight: '600',
  },
  checkBtn: {
    marginTop: spacing.md,
  },
  recommendationCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationEmoji: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  recommendationDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  careerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  careerCardWrapper: {
    width: (SCREEN_W - spacing.md * 2 - spacing.md) / 2,
  },
  careerCard: {
    padding: 0,
    overflow: 'hidden',
  },
  careerCardLocked: {
    opacity: 0.5,
  },
  careerCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  careerCardGradient: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  careerEmoji: {
    fontSize: 40,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerInfo: {
    padding: spacing.md,
  },
  careerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  careerDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  requirementRow: {
    marginTop: spacing.sm,
  },
  requirementText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
