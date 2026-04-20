import * as Haptics from 'expo-haptics';

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export function isHapticsEnabled() {
  return enabled;
}

function trigger(fn: () => void) {
  if (!enabled) return;
  try {
    fn();
  } catch {
    // Haptics may not be available on all platforms
  }
}

export const haptics = {
  light: () => trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => trigger(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => trigger(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  warning: () => trigger(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  selection: () => trigger(() => Haptics.selectionAsync()),
};

export type HapticType = keyof typeof haptics;
