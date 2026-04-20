import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '@repo/ui';

export type EmotionType = 'joy' | 'anger' | 'sadness' | 'surprise' | 'trust' | 'fear' | 'neutral';

// ─── Emotion Colors ───────────────────────────────────────────────

const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#f59e0b',
  anger: '#ef4444',
  sadness: '#3b82f6',
  surprise: '#a855f7',
  trust: '#22c55e',
  fear: '#64748b',
  neutral: colors.primary,
};

const EMOTION_GLOWS: Record<EmotionType, string> = {
  joy: 'rgba(245,158,11,0.4)',
  anger: 'rgba(239,68,68,0.4)',
  sadness: 'rgba(59,130,246,0.4)',
  surprise: 'rgba(168,85,247,0.4)',
  trust: 'rgba(34,197,94,0.4)',
  fear: 'rgba(100,116,139,0.4)',
  neutral: colors.primaryGlow,
};

const EMOTION_OVERLAYS: Record<EmotionType, string> = {
  joy: 'rgba(245,158,11,0.08)',
  anger: 'rgba(239,68,68,0.15)',
  sadness: 'rgba(59,130,246,0.12)',
  surprise: 'rgba(168,85,247,0.10)',
  trust: 'rgba(34,197,94,0.10)',
  fear: 'rgba(100,116,139,0.15)',
  neutral: 'transparent',
};

// ─── Hair Paths (subset from svg-avatar) ──────────────────────────

const HAIR_PATHS: Record<string, string | null> = {
  short01: 'M 20 45 Q 20 15, 50 12 Q 80 15, 80 45 L 80 50 Q 80 25, 50 22 Q 20 25, 20 50 Z',
  short05: 'M 18 48 Q 15 22, 50 18 Q 85 22, 82 48 L 82 52 L 18 52 Z',
  short08: 'M 18 48 Q 16 25, 50 20 Q 84 25, 82 48 L 82 52 L 18 52 Z',
  short11: 'M 42 48 Q 42 5, 50 2 Q 58 5, 58 48 L 62 48 Q 62 10, 65 8 Q 68 15, 68 48 L 72 48 Q 72 20, 75 18 Q 78 25, 78 48 L 82 48 Q 82 30, 85 28 Q 88 35, 88 50 L 75 52 L 50 52 L 25 52 L 12 50 Q 12 35, 15 28 Q 18 30, 18 48 L 22 48 Z',
  long01: 'M 18 45 Q 15 5, 50 5 Q 85 5, 82 45 L 85 75 Q 87 85, 80 88 L 75 88 L 75 50 Q 75 35, 50 35 Q 25 35, 25 50 L 25 88 L 20 88 Q 13 85, 15 75 Z',
  long06: 'M 20 48 Q 18 20, 35 15 Q 50 10, 65 15 Q 82 20, 80 48 Q 82 55, 75 52 Q 70 48, 65 52 Q 60 48, 55 52 Q 50 48, 45 52 Q 40 48, 35 52 Q 30 48, 25 52 Q 18 55, 20 48 Z',
  long11: 'M 18 48 Q 15 12, 42 10 Q 50 9, 58 10 Q 85 12, 82 48 L 86 70 Q 88 80, 81 82 L 76 82 L 76 48 Q 76 26, 50 26 Q 24 26, 24 48 L 24 82 L 19 82 Q 12 80, 14 70 Z',
  long19: 'M 26 45 Q 26 16, 50 13 Q 74 16, 74 45 L 80 30 Q 92 16, 80 12 Q 70 2, 50 5 Q 30 2, 20 12 Q 8 16, 20 30 Z',
  long22: 'M 18 48 Q 16 20, 38 16 Q 50 14, 62 16 Q 84 20, 82 48 L 88 36 Q 98 20, 88 16 Q 78 6, 50 9 Q 22 6, 12 16 Q 2 20, 12 36 Z',
  long25: 'M 20 48 Q 18 18, 44 14 Q 50 13, 56 14 Q 82 18, 80 48 L 88 34 Q 98 18, 88 14 Q 78 4, 50 7 Q 22 4, 12 14 Q 2 18, 12 34 Z',
};

const OUTFIT_COLORS: Record<number, string> = {
  0: '#3b82f6', 1: '#ef4444', 2: '#8b5cf6', 3: '#1e293b',
  4: '#22c55e', 5: '#f59e0b', 6: '#ec4899', 7: '#a855f7',
};

// ─── Animated SVG Components ──────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G) as any;

interface AnimatedPortraitProps {
  seed: string;
  size: number;
  emotion: EmotionType;
  blinking?: boolean;
  borderColor?: string;
  onPress?: () => void;
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) / 2147483647;
}

function getAvatarPropsFromSeed(seed: string) {
  const r = (offset: number) => seededRandom(`${seed}-${offset}`);
  const hairKeys = Object.keys(HAIR_PATHS);
  const hairStyle = hairKeys[Math.floor(r(1) * hairKeys.length)] ?? 'short01';
  const skinTones = ['#f5d0b5', '#ecad80', '#d4a373', '#9e5622', '#c68642', '#f2d3b1'];
  const skinTone = skinTones[Math.floor(r(2) * skinTones.length)] ?? '#f5d0b5';
  const hairColors = ['#0a0a0a', '#4a2511', '#e5d7a3', '#562306', '#afafaf', '#85c2c6', '#dba3be', '#3eac2c', '#cb6820', '#592454'];
  const hairColor = hairColors[Math.floor(r(3) * hairColors.length)] ?? '#0a0a0a';
  const eyeColors = ['#3b6e28', '#4a2511', '#2c5282', '#744210', '#1a202c'];
  const eyeColor = eyeColors[Math.floor(r(4) * eyeColors.length)] ?? '#3b6e28';
  const outfit = Math.floor(r(5) * 8);

  return { hairStyle, skinTone, hairColor, eyeColor, outfit };
}

export function AnimatedPortrait({
  seed,
  size,
  emotion,
  blinking = true,
  borderColor,
  onPress,
}: AnimatedPortraitProps) {
  const emotionColor = EMOTION_COLORS[emotion];
  const emotionGlow = EMOTION_GLOWS[emotion];
  const emotionOverlay = EMOTION_OVERLAYS[emotion];
  const { hairStyle, skinTone, hairColor, eyeColor, outfit } = getAvatarPropsFromSeed(seed);
  const hairPath = HAIR_PATHS[hairStyle] ?? HAIR_PATHS['short01'];
  const outfitColor = OUTFIT_COLORS[outfit] ?? OUTFIT_COLORS[0];

  // Blink animation
  const blinkProgress = useSharedValue(0);
  const isBlinking = useSharedValue(false);

  useEffect(() => {
    if (!blinking) return;

    const startBlinking = () => {
      const nextBlinkDelay = 3000 + Math.random() * 2000;
      blinkProgress.value = withDelay(
        nextBlinkDelay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 150 }),
          withTiming(0, { duration: nextBlinkDelay }, () => {
            runOnJS(startBlinking)();
          })
        )
      );
    };

    startBlinking();
  }, [blinking, blinkProgress]);

  // Scale pulse on interaction
  const scaleAnim = useSharedValue(1);

  const handlePress = () => {
    scaleAnim.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withTiming(1.05, { duration: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    onPress?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // Fear shake animation
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (emotion === 'fear') {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-1.5, { duration: 80 }),
          withTiming(1.5, { duration: 80 })
        ),
        -1,
        true
      );
    } else {
      shakeX.value = 0;
    }
  }, [emotion, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Eye blink interpolation (scaleY for eyes)
  const leftEyeScaleY = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(blinkProgress.value, [0, 1], [1, 0.1]) }],
  }));

  const rightEyeScaleY = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(blinkProgress.value, [0, 1], [1, 0.1]) }],
  }));

  // Emotion mouth path
  const getMouthPath = () => {
    switch (emotion) {
      case 'joy':
        return 'M 43 58 Q 50 65, 57 58';
      case 'sadness':
        return 'M 43 62 Q 50 55, 57 62';
      case 'surprise':
        return 'M 45 58 Q 50 68, 55 58 Q 50 48, 45 58';
      case 'anger':
        return 'M 43 60 L 50 58 L 57 60';
      case 'trust':
        return 'M 43 58 Q 50 63, 57 58';
      case 'fear':
        return 'M 45 60 Q 50 55, 55 60';
      default:
        return 'M 43 58 Q 50 63, 57 58';
    }
  };

  // Eyebrow positions based on emotion
  const getEyebrowPaths = () => {
    switch (emotion) {
      case 'anger':
        return {
          left: 'M 35 38 L 45 42',
          right: 'M 55 42 L 65 38',
        };
      case 'sadness':
        return {
          left: 'M 35 40 L 45 38',
          right: 'M 55 38 L 65 40',
        };
      case 'surprise':
        return {
          left: 'M 35 36 L 45 34',
          right: 'M 55 34 L 65 36',
        };
      case 'joy':
        return {
          left: 'M 35 38 L 45 37',
          right: 'M 55 37 L 65 38',
        };
      default:
        return {
          left: 'M 35 38 L 45 38',
          right: 'M 55 38 L 65 38',
        };
    }
  };

  const eyebrows = getEyebrowPaths();
  const finalBorderColor = borderColor ?? emotionColor;

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: finalBorderColor,
          shadowColor: emotionColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
        },
      ]}
    >
      <Animated.View style={[shakeStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Background overlay for emotion */}
          {emotion !== 'neutral' && (
            <Circle cx="50" cy="50" r="50" fill={emotionOverlay} />
          )}

          {/* Body / Outfit */}
          <Rect x="25" y="80" width="50" height="25" rx="8" fill={outfitColor} opacity={0.9} />

          {/* Neck */}
          <Rect x="42" y="72" width="16" height="12" fill={skinTone} />

          {/* Head */}
          <Circle cx="50" cy="48" r="28" fill={skinTone} />

          {/* Ears */}
          <Circle cx="22" cy="48" r="5" fill={skinTone} />
          <Circle cx="78" cy="48" r="5" fill={skinTone} />

          {/* Eyes with blink */}
          <AnimatedG style={leftEyeScaleY as any}>
            <Ellipse cx="40" cy="45" rx="5" ry="6" fill="#fff" />
            <Circle cx="40" cy="45" r="3" fill={eyeColor} />
            <Circle cx="41" cy="44" r="1" fill="#fff" />
          </AnimatedG>

          <AnimatedG style={rightEyeScaleY as any}>
            <Ellipse cx="60" cy="45" rx="5" ry="6" fill="#fff" />
            <Circle cx="60" cy="45" r="3" fill={eyeColor} />
            <Circle cx="61" cy="44" r="1" fill="#fff" />
          </AnimatedG>

          {/* Eyebrows */}
          {emotion !== 'neutral' && (
            <G>
              <Path d={eyebrows.left} stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <Path d={eyebrows.right} stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </G>
          )}

          {/* Mouth - emotion based */}
          <Path
            d={getMouthPath()}
            stroke={emotion === 'anger' || emotion === 'fear' ? '#991b1b' : '#000'}
            strokeWidth="1.5"
            fill={emotion === 'surprise' ? 'rgba(0,0,0,0.3)' : 'none'}
            strokeLinecap="round"
          />

          {/* Nose */}
          <Path d="M 50 48 L 48 54 L 52 54 Z" fill="rgba(0,0,0,0.08)" />

          {/* Hair */}
          {hairPath && <Path d={hairPath} fill={hairColor} />}

          {/* Emotion-specific overlays */}
          {emotion === 'anger' && (
            <G>
              <Rect x="20" y="20" width="60" height="15" fill="rgba(239,68,68,0.15)" rx="5" />
            </G>
          )}
          {emotion === 'trust' && (
            <G>
              <Circle cx="50" cy="50" r="35" fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth="3" />
            </G>
          )}
        </Svg>

        {/* Border glow ring */}
        <View
          style={[
            styles.glowRing,
            {
              width: size * 0.95,
              height: size * 0.95,
              borderRadius: size * 0.475,
              borderColor: emotionGlow,
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    elevation: 8,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.6,
  },
});
