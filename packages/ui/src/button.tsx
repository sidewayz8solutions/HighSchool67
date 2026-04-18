import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii } from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGold = variant === 'gold';

  if (isPrimary || isSecondary || isGold) {
    const gradientColors = isPrimary
      ? [colors.primary, colors.primaryDark]
      : isSecondary
      ? [colors.secondary, colors.secondaryDark]
      : colors.gradientGold;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.gradientBtnContainer, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          <Text style={[styles.gradientBtnText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.ghostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientBtnContainer: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  disabled: {
    opacity: 0.4,
  },
  ghostText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
  },
});
