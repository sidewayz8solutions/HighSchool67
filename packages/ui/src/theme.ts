export const colors = {
  // Base
  background: '#0a0a0f',
  surface: '#14141f',
  surfaceHighlight: '#1e1e2e',
  surfaceGlow: '#252538',

  // Text
  text: '#f0f0f5',
  textMuted: '#6b6b7b',
  textSecondary: '#a0a0b0',

  // Primary - Electric Indigo
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.3)',

  // Secondary - Hot Pink
  secondary: '#ec4899',
  secondaryLight: '#f472b6',
  secondaryDark: '#db2777',
  secondaryGlow: 'rgba(236, 72, 153, 0.3)',

  // Accent - Cyan
  accent: '#06b6d4',
  accentLight: '#22d3ee',
  accentGlow: 'rgba(6, 182, 212, 0.3)',

  // Status
  success: '#22c55e',
  successGlow: 'rgba(34, 197, 94, 0.3)',
  warning: '#f59e0b',
  warningGlow: 'rgba(245, 158, 11, 0.3)',
  danger: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',

  // Gradient presets
  gradientPrimary: ['#6366f1', '#8b5cf6', '#ec4899'] as const,
  gradientDark: ['#0a0a0f', '#14141f', '#1e1e2e'] as const,
  gradientSurface: ['#1e1e2e', '#14141f'] as const,
  gradientGold: ['#f59e0b', '#fbbf24', '#fcd34d'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 0,
  },
};
