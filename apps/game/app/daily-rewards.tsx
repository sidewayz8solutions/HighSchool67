import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Button, colors, spacing, radii } from '@repo/ui';
import { useGameStore, getStreakStatus, isStreakAtRisk, getMonthlyBonus } from '@repo/game-engine';
import type { DailyReward, LoginStreak } from '@repo/types';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Constants ──────────────────────────────────────────────────────

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const REWARD_ICONS: Record<string, string> = {
  points: '💰',
  gems: '💎',
  energy: '⚡',
  item: '🎁',
};

// ─── Reward Card ────────────────────────────────────────────────────

function RewardDayCard({
  reward,
  dayIndex,
  isCurrentDay,
  onClaim,
}: {
  reward: DailyReward;
  dayIndex: number;
  isCurrentDay: boolean;
  onClaim: () => void;
}) {
  const pulseAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);

  // Pulse animation for current day
  if (isCurrentDay && !reward.claimed) {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value * scaleAnim.value }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15 });
  };

  const isClaimed = reward.claimed;
  const rewardTypes = Object.entries(reward.reward).filter(([_, v]) => v !== undefined);

  const cardStyle = [
    styles.rewardCard,
    isClaimed && styles.rewardCardClaimed,
    isCurrentDay && !isClaimed && styles.rewardCardCurrent,
    reward.isBonus && styles.rewardCardBonus,
  ];

  return (
    <Animated.View entering={FadeInUp.delay(dayIndex * 80)} style={[cardStyle, animatedStyle]}>
      <TouchableOpacity
        onPress={isCurrentDay && !isClaimed ? onClaim : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={isCurrentDay && !isClaimed ? 0.7 : 1}
        disabled={!isCurrentDay || isClaimed}
      >
        {/* Day label */}
        <View style={styles.dayLabelRow}>
          <Text style={styles.dayLabel}>Day {reward.day}</Text>
          {isCurrentDay && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>TODAY</Text></View>}
        </View>

        {/* Reward icon area */}
        <View style={styles.rewardIconArea}>
          {isClaimed ? (
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ) : (
            <>
              {reward.isBonus && (
                <LinearGradient
                  colors={colors.gradientGold}
                  style={styles.bonusGlow}
                />
              )}
              <Text style={styles.rewardIcon}>
                {reward.reward.gems ? REWARD_ICONS.gems :
                 reward.reward.energy ? REWARD_ICONS.energy :
                 reward.reward.itemId ? REWARD_ICONS.item :
                 REWARD_ICONS.points}
              </Text>
              {reward.isBonus && <Text style={styles.bonusLabel}>BONUS</Text>}
            </>
          )}
        </View>

        {/* Reward values */}
        <View style={styles.rewardValues}>
          {rewardTypes.map(([key, val]) => (
            <Text
              key={key}
              style={[
                styles.rewardValue,
                isClaimed && styles.rewardValueClaimed,
                key === 'gems' && { color: colors.secondary },
                key === 'energy' && { color: colors.accent },
              ]}
            >
              {isClaimed ? '—' : `+${val} ${key}`}
            </Text>
          ))}
        </View>

        {/* Claimed indicator */}
        {isClaimed && (
          <View style={styles.claimedOverlay}>
            <Text style={styles.claimedText}>Claimed</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Streak Fire Animation ──────────────────────────────────────────

function StreakFire({ streak }: { streak: number }) {
  const fireScale = useSharedValue(1);

  fireScale.value = withRepeat(
    withSequence(
      withTiming(1.1, { duration: 500 }),
      withTiming(1, { duration: 500 }),
    ),
    -1,
    true,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  return (
    <Animated.View style={[styles.fireContainer, animatedStyle]}>
      <Text style={styles.fireIcon}>🔥</Text>
      <Text style={styles.fireCount}>{streak}</Text>
      <Text style={styles.fireLabel}>day streak</Text>
    </Animated.View>
  );
}

// ─── Protection Shield ──────────────────────────────────────────────

function StreakProtection({ used, onUse }: { used: boolean; onUse: () => void }) {
  if (used) {
    return (
      <View style={[styles.protectionBox, styles.protectionUsed]}>
        <Text style={styles.protectionIcon}>🛡️</Text>
        <Text style={styles.protectionText}>Streak protection used</Text>
        <Text style={styles.protectionSubtext}>Your streak is safe!</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onUse} style={styles.protectionBox}>
      <Text style={styles.protectionIcon}>🛡️</Text>
      <Text style={styles.protectionText}>Streak Protection Available</Text>
      <Text style={styles.protectionSubtext}>Tap to protect your streak for 24h</Text>
    </TouchableOpacity>
  );
}

// ─── Monthly Bonus Section ──────────────────────────────────────────

function MonthlyBonus({ streak }: { streak: LoginStreak }) {
  const bonus = getMonthlyBonus(streak);
  const daysUntilMonthly = Math.max(0, 30 - streak.currentStreak);

  return (
    <View style={styles.monthlySection}>
      <Text style={styles.monthlyTitle}>📅 Monthly Bonus</Text>
      <View style={styles.monthlyCard}>
        {bonus ? (
          <>
            <Text style={styles.monthlyReady}>Bonus Ready!</Text>
            <Text style={styles.monthlyReward}>
              {bonus.points} Points + {bonus.gems} Gems
            </Text>
            {!streak.monthlyBonusClaimed && (
              <Button title="Claim Monthly Bonus" variant="gold" onPress={() => {}} />
            )}
          </>
        ) : (
          <>
            <Text style={styles.monthlyLocked}>🔒 Locked</Text>
            <Text style={styles.monthlyDesc}>
              Reach a 30-day streak to unlock the monthly bonus
            </Text>
            <View style={styles.monthlyProgressBar}>
              <View
                style={[
                  styles.monthlyProgressFill,
                  { width: `${Math.min(100, (streak.currentStreak / 30) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.monthlyDaysLeft}>
              {daysUntilMonthly} days remaining
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Daily Rewards Screen ───────────────────────────────────────────

export default function DailyRewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [claimMessage, setClaimMessage] = useState('');

  const {
    loginStreak,
    claimDailyReward,
    processDailyLogin,
    useStreakProtection: activateStreakProtection,
    addCurrency,
  } = useGameStore();

  const streakStatus = getStreakStatus(loginStreak);
  const atRisk = isStreakAtRisk(loginStreak);

  // Get the rewards array - if empty, use defaults
  const rewards = loginStreak.dailyRewards.length > 0
    ? loginStreak.dailyRewards
    : Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        reward: {
          points: [50, 100, undefined, 200, undefined, 300, undefined][i],
          gems: [undefined, undefined, undefined, undefined, 5, undefined, 15][i],
          energy: [undefined, undefined, 10, undefined, undefined, 10, undefined][i],
        },
        claimed: false,
        isBonus: i === 6,
      } as DailyReward));

  const handleClaimDay = useCallback((day: number) => {
    if (day !== streakStatus.currentDay) return;

    const result = claimDailyReward(day);
    if (result.success && result.reward) {
      const rewardParts: string[] = [];
      if (result.reward.reward.points) rewardParts.push(`${result.reward.reward.points} pts`);
      if (result.reward.reward.gems) rewardParts.push(`${result.reward.reward.gems} gems`);
      if (result.reward.reward.energy) rewardParts.push(`${result.reward.reward.energy} energy`);
      setClaimMessage(`Claimed: ${rewardParts.join(', ')}!`);
    } else {
      setClaimMessage('Already claimed or not available');
    }

    setTimeout(() => setClaimMessage(''), 3000);
  }, [claimDailyReward, streakStatus.currentDay]);

  const handleStreakProtection = useCallback(() => {
    const success = activateStreakProtection();
    if (success) {
      setClaimMessage('Streak protection activated!');
    } else {
      setClaimMessage('Protection already used');
    }
    setTimeout(() => setClaimMessage(''), 3000);
  }, [activateStreakProtection]);

  // Today's reward
  const todayReward = rewards.find((r) => r.day === streakStatus.currentDay);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 16) + 12 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Rewards</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Streak Counter */}
        <StreakFire streak={loginStreak.currentStreak} />

        {/* At Risk Warning */}
        {atRisk && (
          <Animated.View entering={FadeInUp} style={styles.riskBanner}>
            <Text style={styles.riskText}>⚠️ Your streak is at risk! Log in tomorrow to keep it.</Text>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Claim Toast */}
      {claimMessage ? (
        <Animated.View entering={FadeInUp} style={styles.toast}>
          <Text style={styles.toastText}>{claimMessage}</Text>
        </Animated.View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 7-Day Calendar Row */}
        <View style={styles.calendarRow}>
          {rewards.map((reward, idx) => (
            <RewardDayCard
              key={reward.day}
              reward={reward}
              dayIndex={idx}
              isCurrentDay={reward.day === streakStatus.currentDay}
              onClaim={() => handleClaimDay(reward.day)}
            />
          ))}
        </View>

        {/* Streak Info */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.streakInfoCard}>
          <Text style={styles.streakInfoTitle}>Your Streak</Text>
          <View style={styles.streakInfoRow}>
            <View style={styles.streakInfoItem}>
              <Text style={styles.streakInfoValue}>{loginStreak.currentStreak}</Text>
              <Text style={styles.streakInfoLabel}>Current</Text>
            </View>
            <View style={styles.streakInfoDivider} />
            <View style={styles.streakInfoItem}>
              <Text style={styles.streakInfoValue}>{loginStreak.longestStreak}</Text>
              <Text style={styles.streakInfoLabel}>Best</Text>
            </View>
            <View style={styles.streakInfoDivider} />
            <View style={styles.streakInfoItem}>
              <Text style={styles.streakInfoValue}>{streakStatus.daysUntilBonus}</Text>
              <Text style={styles.streakInfoLabel}>Until Bonus</Text>
            </View>
          </View>
          {streakStatus.hoursUntilReset !== null && (
            <Text style={styles.hoursLeft}>
              ⏰ {Math.floor(streakStatus.hoursUntilReset)}h until streak resets
            </Text>
          )}
        </Animated.View>

        {/* Quick Claim Button */}
        {todayReward && !todayReward.claimed && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <Button
              title={`Claim Day ${streakStatus.currentDay} Reward`}
              onPress={() => handleClaimDay(streakStatus.currentDay)}
              style={{ marginBottom: spacing.md }}
            />
          </Animated.View>
        )}

        {/* Streak Protection */}
        <StreakProtection
          used={loginStreak.streakProtectionUsed}
          onUse={handleStreakProtection}
        />

        {/* Monthly Bonus */}
        <MonthlyBonus streak={loginStreak} />

        {/* How it Works */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.howItWorks}>
          <Text style={styles.howTitle}>How it works</Text>
          <View style={styles.howItem}>
            <Text style={styles.howNumber}>1</Text>
            <Text style={styles.howText}>Log in daily to build your streak</Text>
          </View>
          <View style={styles.howItem}>
            <Text style={styles.howNumber}>2</Text>
            <Text style={styles.howText}>Claim rewards each day — they get better!</Text>
          </View>
          <View style={styles.howItem}>
            <Text style={styles.howNumber}>3</Text>
            <Text style={styles.howText}>Day 7 is a bonus day with extra gems</Text>
          </View>
          <View style={styles.howItem}>
            <Text style={styles.howNumber}>4</Text>
            <Text style={styles.howText}>Miss a day and your streak resets (unless you have protection!)</Text>
          </View>
          <View style={styles.howItem}>
            <Text style={styles.howNumber}>5</Text>
            <Text style={styles.howText}>Reach 30 days for a massive monthly bonus</Text>
          </View>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.sm,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  fireContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fireIcon: {
    fontSize: 48,
  },
  fireCount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginTop: -4,
  },
  fireLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  riskBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  riskText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  // Calendar Row
  calendarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rewardCard: {
    width: (SCREEN_W - spacing.md * 2 - spacing.sm * 3) / 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceHighlight,
    padding: spacing.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  rewardCardClaimed: {
    borderColor: colors.success,
    opacity: 0.7,
  },
  rewardCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}15`,
  },
  rewardCardBonus: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  dayLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  rewardIconArea: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rewardIcon: {
    fontSize: 28,
  },
  bonusGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.3,
  },
  bonusLabel: {
    position: 'absolute',
    top: 0,
    right: -4,
    fontSize: 8,
    fontWeight: '800',
    color: colors.warning,
  },
  checkmarkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.success}30`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
  },
  rewardValues: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  rewardValueClaimed: {
    color: colors.textMuted,
  },
  claimedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.md,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
  },
  // Streak Info
  streakInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  streakInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  streakInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakInfoValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  streakInfoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  streakInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceHighlight,
  },
  hoursLeft: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
  },
  // Streak Protection
  protectionBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  protectionUsed: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}10`,
  },
  protectionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  protectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  protectionSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  // Monthly Bonus
  monthlySection: {
    marginBottom: spacing.lg,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  monthlyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  monthlyReady: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  monthlyReward: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  monthlyLocked: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  monthlyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  monthlyProgressBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  monthlyProgressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: radii.full,
  },
  monthlyDaysLeft: {
    fontSize: 13,
    color: colors.textMuted,
  },
  // How It Works
  howItWorks: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  howTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  howItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  howNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.sm,
  },
  howText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  // Toast
  toast: {
    position: 'absolute',
    top: 180,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.lg,
    padding: spacing.md,
    zIndex: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  toastText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
});
