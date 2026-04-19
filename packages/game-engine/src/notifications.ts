import type { LoginStreak } from '@repo/types';

// ─── Types ──────────────────────────────────────────────────────────

export type NotificationType =
  | 'energy_refill'
  | 'daily_reminder'
  | 'event_reminder'
  | 'streak_warning'
  | 'friend_activity'
  | 'achievement_unlock'
  | 'special_offer'
  | 'story_unlock';

export interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
  action?: string;
  [key: string]: unknown;
}

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  body: string;
  scheduleTime?: Date;
  data?: NotificationData;
  badge?: number;
  sound?: boolean | string;
}

export interface ScheduledNotification {
  id: string;
  config: NotificationConfig;
  scheduledAt: string;
  triggered: boolean;
}

// ─── Internal State ─────────────────────────────────────────────────

let _notifications: Map<string, ScheduledNotification> = new Map();
let _hasPermissions = false;
let _expoNotificationsModule: any = null;

// ─── Permission Helpers ─────────────────────────────────────────────

/**
 * Check if notification permissions have been granted.
 */
export async function getNotificationPermissions(): Promise<boolean> {
  if (_hasPermissions) return true;

  try {
    const { getPermissionsAsync } = await import('expo-notifications');
    const { status } = await getPermissionsAsync();
    _hasPermissions = status === 'granted';
    return _hasPermissions;
  } catch {
    // Fallback: assume granted on web
    _hasPermissions = true;
    return true;
  }
}

/**
 * Request notification permissions from the user.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (_hasPermissions) return true;

  try {
    const { requestPermissionsAsync } = await import('expo-notifications');
    const { status } = await requestPermissionsAsync();
    _hasPermissions = status === 'granted';
    return _hasPermissions;
  } catch {
    // Fallback for web
    _hasPermissions = true;
    return true;
  }
}

// ─── Scheduling ─────────────────────────────────────────────────────

/**
 * Initialize the notifications module.
 */
async function getNotificationsModule() {
  if (_expoNotificationsModule) return _expoNotificationsModule;
  try {
    const mod = await import('expo-notifications');
    _expoNotificationsModule = mod;
    return mod;
  } catch {
    return null;
  }
}

/**
 * Schedule a push notification.
 * Returns a notification ID that can be used to cancel it.
 */
export async function scheduleNotification(config: NotificationConfig): Promise<string> {
  const hasPerms = await getNotificationPermissions();
  if (!hasPerms) {
    await requestNotificationPermissions();
  }

  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const notifications = await getNotificationsModule();
    if (notifications) {
      const { scheduleNotificationAsync } = notifications;
      const trigger = config.scheduleTime
        ? { date: config.scheduleTime }
        : null;

      const nativeId = await scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: { type: config.type, ...config.data },
          badge: config.badge,
          sound: config.sound ?? true,
        },
        trigger,
      });

      _notifications.set(nativeId, {
        id: nativeId,
        config,
        scheduledAt: new Date().toISOString(),
        triggered: false,
      });

      return nativeId;
    }
  } catch {
    // Fallback: store locally
  }

  // Web fallback: use setTimeout for scheduled notifications
  _notifications.set(id, {
    id,
    config,
    scheduledAt: new Date().toISOString(),
    triggered: false,
  });

  if (config.scheduleTime) {
    const delay = config.scheduleTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        showLocalNotification(config);
        const n = _notifications.get(id);
        if (n) n.triggered = true;
      }, delay);
    }
  }

  return id;
}

/**
 * Cancel a scheduled notification by ID.
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    const notifications = await getNotificationsModule();
    if (notifications?.cancelScheduledNotificationAsync) {
      await notifications.cancelScheduledNotificationAsync(id);
    }
  } catch {
    // ignore
  }
  _notifications.delete(id);
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    const notifications = await getNotificationsModule();
    if (notifications?.cancelAllScheduledNotificationsAsync) {
      await notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch {
    // ignore
  }
  _notifications.clear();
}

/**
 * Get all scheduled notifications.
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  return Array.from(_notifications.values());
}

// ─── Preset Schedulers ──────────────────────────────────────────────

/**
 * Schedule a daily reminder notification.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  const title = 'High School 67';
  const body = 'Your school day is waiting! Come back and continue your adventure.';

  // Calculate next occurrence
  const now = new Date();
  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  if (scheduled.getTime() <= now.getTime()) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduleNotification({
    type: 'daily_reminder',
    title,
    body,
    scheduleTime: scheduled,
    data: { screen: 'index' },
  });
}

/**
 * Schedule a notification for when energy is full.
 */
export async function scheduleEnergyRefill(): Promise<string> {
  // Assume energy refills in ~2 hours of not playing
  const refillTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  return scheduleNotification({
    type: 'energy_refill',
    title: 'Energy Full!',
    body: 'Your energy is fully refilled. Ready to get back to school?',
    scheduleTime: refillTime,
    data: { screen: 'school' },
  });
}

/**
 * Cancel the energy refill notification.
 */
export async function cancelEnergyRefill(): Promise<void> {
  for (const [id, n] of _notifications) {
    if (n.config.type === 'energy_refill' && !n.triggered) {
      await cancelNotification(id);
    }
  }
}

/**
 * Schedule a streak warning notification if the streak is about to break.
 */
export async function scheduleStreakWarning(streak: LoginStreak): Promise<string | null> {
  if (!streak.lastLoginDate) return null;

  const lastLogin = new Date(streak.lastLoginDate);
  const warningTime = new Date(lastLogin.getTime() + 20 * 60 * 60 * 1000); // 20 hours after last login

  // Only schedule if warning time is in the future
  if (warningTime.getTime() <= Date.now()) return null;

  return scheduleNotification({
    type: 'streak_warning',
    title: 'Streak in Danger!',
    body: `Your ${streak.currentStreak}-day login streak is about to expire! Log in now to keep it going.`,
    scheduleTime: warningTime,
    data: { screen: 'daily-rewards' },
  });
}

/**
 * Schedule an event reminder.
 */
export interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
}

export async function scheduleEventReminder(event: ScheduledEvent): Promise<string> {
  // Remind 15 minutes before event
  const reminderTime = new Date(event.startTime.getTime() - 15 * 60 * 1000);

  return scheduleNotification({
    type: 'event_reminder',
    title: `Event: ${event.title}`,
    body: event.description,
    scheduleTime: reminderTime,
    data: { screen: 'school', params: { eventId: event.id } },
  });
}

/**
 * Schedule an achievement unlock notification.
 */
export async function scheduleAchievementNotification(
  achievementName: string,
): Promise<string> {
  return scheduleNotification({
    type: 'achievement_unlock',
    title: 'Achievement Unlocked!',
    body: `You earned: ${achievementName}`,
    data: { screen: 'profile' },
  });
}

/**
 * Schedule a story unlock notification.
 */
export async function scheduleStoryUnlockNotification(
  chapterTitle: string,
): Promise<string> {
  return scheduleNotification({
    type: 'story_unlock',
    title: 'New Story Unlocked!',
    body: `"${chapterTitle}" is now available to play!`,
    data: { screen: 'story' },
  });
}

/**
 * Schedule a friend activity notification.
 */
export async function scheduleFriendActivityNotification(
  friendName: string,
  activity: string,
): Promise<string> {
  return scheduleNotification({
    type: 'friend_activity',
    title: `${friendName} is active!`,
    body: activity,
    data: { screen: 'school' },
  });
}

// ─── Local Notification (Web Fallback) ──────────────────────────────

function showLocalNotification(config: NotificationConfig): void {
  if (typeof window === 'undefined') return;

  // Use the browser Notification API if available
  if ('Notification' in window) {
    try {
      new window.Notification(config.title, {
        body: config.body,
        icon: '/assets/icon.png',
      });
    } catch {
      // ignore
    }
  }
}

// ─── Background Notification Handler ────────────────────────────────

/**
 * Set up a background notification response handler.
 * Call this once at app startup.
 */
export async function setupNotificationHandler(
  onNotificationResponse?: (type: NotificationType, data?: NotificationData) => void,
): Promise<void> {
  try {
    const notifications = await getNotificationsModule();
    if (!notifications) return;

    const { setNotificationHandler } = notifications;

    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listen for notification responses (user taps notification)
    const { addNotificationResponseReceivedListener } = notifications;
    addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data?.type && onNotificationResponse) {
        onNotificationResponse(data.type as NotificationType, data);
      }
    });
  } catch {
    // ignore
  }
}
