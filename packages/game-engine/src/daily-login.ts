import type {
  DailyReward,
  LoginStreak,
} from '@repo/types';

// ─── Constants ──────────────────────────────────────────────────────

const STREAK_RISK_HOURS = 20; // hours since last login to show warning
const STREAK_BREAK_HOURS = 48; // hours since last login to reset streak
const MONTHLY_BONUS_DAYS = 30; // days for monthly bonus

// ─── Default 7-Day Reward Cycle ─────────────────────────────────────

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: { points: 50 }, claimed: false },
  { day: 2, reward: { points: 100 }, claimed: false },
  { day: 3, reward: { energy: 10 }, claimed: false },
  { day: 4, reward: { points: 200 }, claimed: false },
  { day: 5, reward: { gems: 5 }, claimed: false },
  { day: 6, reward: { points: 300, energy: 10 }, claimed: false },
  { day: 7, reward: { gems: 15 }, claimed: false, isBonus: true },
];

// ─── Factory ────────────────────────────────────────────────────────

/**
 * Create a fresh default login streak object.
 */
export function getDefaultLoginStreak(): LoginStreak {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: '',
    dailyRewards: resetDailyRewards([]),
    streakProtectionUsed: false,
    monthlyBonusClaimed: false,
  };
}

// ─── Core Logic ─────────────────────────────────────────────────────

/**
 * Process a daily login. Determines if streak continues, resets, or increments.
 * Returns the updated streak, today's reward, and whether the streak continued.
 */
export function processDailyLogin(
  streak: LoginStreak,
  today: string, // ISO date string
): {
  updatedStreak: LoginStreak;
  reward: DailyReward | null;
  streakContinued: boolean;
  isNewStreak: boolean;
} {
  const lastLogin = streak.lastLoginDate ? new Date(streak.lastLoginDate) : null;
  const todayDate = new Date(today);

  // Normalize to midnight for date comparison
  const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const lastMidnight = lastLogin
    ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
    : null;

  // Calculate hours difference
  const hoursSinceLastLogin = lastLogin
    ? (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    : Infinity;

  // Check if already logged in today
  if (lastMidnight && lastMidnight.getTime() === todayMidnight.getTime()) {
    // Find today's reward
    const todayReward = streak.dailyRewards.find((r) => {
      const expectedDay = streak.currentStreak > 0 ? ((streak.currentStreak - 1) % 7) + 1 : 1;
      return r.day === expectedDay;
    }) ?? null;

    return {
      updatedStreak: { ...streak },
      reward: todayReward,
      streakContinued: true,
      isNewStreak: false,
    };
  }

  let newStreak = { ...streak };
  let isNewStreak = false;

  // Determine streak behavior
  if (hoursSinceLastLogin < 24) {
    // Same calendar day (shouldn't happen due to above check) or consecutive day
    newStreak.currentStreak += 1;
  } else if (hoursSinceLastLogin < STREAK_BREAK_HOURS) {
    // Within grace period - streak continues
    newStreak.currentStreak += 1;
  } else {
    // Streak broken - reset
    newStreak.currentStreak = 1;
    newStreak.streakProtectionUsed = false;
    newStreak.monthlyBonusClaimed = false;
    newStreak.dailyRewards = resetDailyRewards([]);
    isNewStreak = true;
  }

  // Update longest streak
  if (newStreak.currentStreak > newStreak.longestStreak) {
    newStreak.longestStreak = newStreak.currentStreak;
  }

  // Update last login
  newStreak.lastLoginDate = today;

  // Determine which day's reward to give
  const rewardDay = ((newStreak.currentStreak - 1) % 7) + 1;

  // Check if we need to reset rewards for a new week
  if (rewardDay === 1 && newStreak.currentStreak > 1) {
    newStreak.dailyRewards = resetDailyRewards([]);
  }

  // Find or create the reward for today
  let todayReward = newStreak.dailyRewards.find((r) => r.day === rewardDay);
  if (!todayReward) {
    // Safety fallback - create from default
    const defaultReward = DAILY_REWARDS.find((r) => r.day === rewardDay);
    if (defaultReward) {
      todayReward = { ...defaultReward };
      newStreak.dailyRewards.push(todayReward);
    }
  }

  return {
    updatedStreak: newStreak,
    reward: todayReward ?? null,
    streakContinued: !isNewStreak,
    isNewStreak,
  };
}

/**
 * Check if the streak is at risk (20+ hours since last login).
 */
export function isStreakAtRisk(streak: LoginStreak): boolean {
  if (!streak.lastLoginDate) return false;

  const lastLogin = new Date(streak.lastLoginDate);
  const now = new Date();
  const hoursSince = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

  return hoursSince >= STREAK_RISK_HOURS && hoursSince < STREAK_BREAK_HOURS;
}

/**
 * Use streak protection to save the current streak.
 */
export function useStreakProtection(streak: LoginStreak): LoginStreak {
  if (streak.streakProtectionUsed) return streak;

  return {
    ...streak,
    streakProtectionUsed: true,
    // Extend the last login date by 24 hours to prevent streak break
    lastLoginDate: new Date(
      new Date(streak.lastLoginDate).getTime() + 24 * 60 * 60 * 1000
    ).toISOString(),
  };
}

/**
 * Get monthly bonus based on current streak.
 */
export function getMonthlyBonus(
  streak: LoginStreak,
): { points: number; gems: number } | null {
  if (streak.monthlyBonusClaimed) return null;
  if (streak.currentStreak < MONTHLY_BONUS_DAYS) return null;

  return {
    points: 500 + streak.currentStreak * 10,
    gems: 50 + Math.floor(streak.currentStreak / 10) * 5,
  };
}

/**
 * Reset daily rewards for a new week cycle.
 */
export function resetDailyRewards(_rewards: DailyReward[]): DailyReward[] {
  return DAILY_REWARDS.map((r) => ({ ...r, claimed: false }));
}

/**
 * Mark a specific day's reward as claimed.
 */
export function claimDailyReward(
  streak: LoginStreak,
  day: number,
): { updatedStreak: LoginStreak; reward: DailyReward | null } {
  const rewardIndex = streak.dailyRewards.findIndex((r) => r.day === day);
  if (rewardIndex === -1) {
    // Auto-create from defaults
    const defaultReward = DAILY_REWARDS.find((r) => r.day === day);
    if (!defaultReward) {
      return { updatedStreak: streak, reward: null };
    }
    const newRewards = [...streak.dailyRewards, { ...defaultReward }];
    return {
      updatedStreak: { ...streak, dailyRewards: newRewards },
      reward: { ...defaultReward },
    };
  }

  if (streak.dailyRewards[rewardIndex]!.claimed) {
    return { updatedStreak: streak, reward: null };
  }

  const updatedRewards = streak.dailyRewards.map((r, i) =>
    i === rewardIndex ? { ...r, claimed: true } : r
  );

  return {
    updatedStreak: { ...streak, dailyRewards: updatedRewards },
    reward: updatedRewards[rewardIndex]!,
  };
}

/**
 * Get the current day's number (1-7) based on streak.
 */
export function getCurrentDayInCycle(streak: LoginStreak): number {
  if (streak.currentStreak === 0) return 1;
  return ((streak.currentStreak - 1) % 7) + 1;
}

/**
 * Get streak status info for UI display.
 */
export function getStreakStatus(streak: LoginStreak): {
  currentDay: number;
  daysUntilBonus: number;
  atRisk: boolean;
  hoursUntilReset: number | null;
} {
  const currentDay = getCurrentDayInCycle(streak);
  const daysUntilBonus = 7 - currentDay;
  const atRisk = isStreakAtRisk(streak);

  let hoursUntilReset: number | null = null;
  if (streak.lastLoginDate) {
    const lastLogin = new Date(streak.lastLoginDate);
    const deadline = new Date(lastLogin.getTime() + STREAK_BREAK_HOURS * 60 * 60 * 1000);
    const now = new Date();
    hoursUntilReset = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  }

  return { currentDay, daysUntilBonus, atRisk, hoursUntilReset };
}
