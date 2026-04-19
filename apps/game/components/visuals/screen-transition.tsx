import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'flip';

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
}

export function ScreenTransition({
  children,
  type = 'fade',
  duration,
  delay = 0,
}: ScreenTransitionProps) {
  const progress = useSharedValue(0);

  // Default durations per transition type
  const defaultDuration = {
    fade: 300,
    slide: 400,
    scale: 350,
    flip: 500,
  };

  const animDuration = duration ?? defaultDuration[type];

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: animDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    switch (type) {
      case 'slide':
        return {
          opacity: interpolate(p, [0, 0.3, 1], [0, 1, 1]),
          transform: [
            { translateX: interpolate(p, [0, 1], [100, 0]) },
          ],
        };

      case 'scale':
        return {
          opacity: interpolate(p, [0, 0.5, 1], [0, 0.5, 1]),
          transform: [
            { scale: interpolate(p, [0, 1], [0.8, 1]) },
          ],
        };

      case 'flip':
        return {
          opacity: interpolate(p, [0, 0.3, 1], [0, 1, 1]),
          transform: [
            { perspective: 1000 },
            { rotateY: `${interpolate(p, [0, 1], [90, 0])}deg` },
          ],
        };

      case 'fade':
      default:
        return {
          opacity: interpolate(p, [0, 1], [0, 1]),
        };
    }
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
