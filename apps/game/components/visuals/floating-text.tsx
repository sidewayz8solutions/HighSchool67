import { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

// ─── Prefix Colors ────────────────────────────────────────────────

const PREFIX_COLORS: Record<string, string> = {
  '+': '#22c55e',
  '-': '#ef4444',
  '★': '#f59e0b',
};

function getPrefixColor(text: string): string | undefined {
  const first = text.charAt(0);
  return PREFIX_COLORS[first];
}

// ─── Single Floating Text ─────────────────────────────────────────

interface FloatingTextProps {
  text: string;
  color: string;
  startPosition: { x: number; y: number };
  onComplete?: () => void;
}

export function FloatingText({
  text,
  color,
  startPosition,
  onComplete,
}: FloatingTextProps) {
  const progress = useSharedValue(0);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (!completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.out(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
  }, [progress, handleComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    // Float upward
    const translateY = interpolate(p, [0, 1], [0, -80]);

    // Scale: 0.5 → 1.2 → 1.0
    const scale = interpolate(p, [0, 0.2, 0.5, 1], [0.5, 1.2, 1.0, 0.9]);

    // Fade out in the last 40%
    const opacity = interpolate(p, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);

    // Slight horizontal drift
    const translateX = interpolate(p, [0, 1], [0, Math.sin(p * Math.PI * 2) * 5]);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  // Auto-detect prefix color override
  const prefixColor = getPrefixColor(text);
  const finalColor = prefixColor ?? color;

  return (
    <Animated.View
      style={[
        styles.floatingText,
        animatedStyle,
        {
          left: startPosition.x,
          top: startPosition.y,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.Text style={[styles.text, { color: finalColor }]}>
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

// ─── Floating Text Manager ────────────────────────────────────────

interface FloatingTextItem {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
}

interface FloatingTextManagerProps {
  items: FloatingTextItem[];
}

export function FloatingTextManager({ items }: FloatingTextManagerProps) {
  const activeIds = useRef<Set<string>>(new Set());

  const handleComplete = useCallback((id: string) => {
    activeIds.current.delete(id);
  }, []);

  // Reset active set when items change
  useEffect(() => {
    items.forEach((item) => {
      if (!activeIds.current.has(item.id)) {
        activeIds.current.add(item.id);
      }
    });
  }, [items]);

  return (
    <View style={styles.managerContainer} pointerEvents="none">
      {items.map((item) => (
        <FloatingText
          key={item.id}
          text={item.text}
          color={item.color}
          startPosition={item.position}
          onComplete={() => handleComplete(item.id)}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  managerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 300,
    pointerEvents: 'none',
  },
  floatingText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
});
