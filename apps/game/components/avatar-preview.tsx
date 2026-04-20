import { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@repo/ui';
import type { AvatarConfig } from '@repo/types';
import { OUTFITS, ACCESSORIES } from '@repo/types';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
}

// ─── Avataaars Mappings ─────────────────────────────────────────────

const TOP_MAP: Record<number, string[]> = {
  0: ['shortRound'],        // Short
  1: ['longButNotTooLong'], // Long
  2: ['curly'],             // Curly
  3: ['dreads'],            // Braids
  4: [],                    // Bald
  5: ['bun'],               // Bun
  6: ['straightAndStrand'], // Ponytail
  7: ['shavedSides'],       // Mohawk
};

const CLOTHING_MAP: Record<number, string[]> = {
  0: ['hoodie'],            // Casual
  1: ['graphicShirt'],      // Jock
  2: ['blazerAndSweater'],  // Nerd
  3: ['blazerAndShirt'],    // Goth
  4: ['collarAndSweater'],  // Preppy
  5: ['overall'],           // Artsy
  6: ['shirtCrewNeck'],     // Street
  7: ['shirtVNeck'],        // Vintage
};

const ACCESSORY_MAP: Record<number, { type: 'accessories' | 'top'; value: string[]; color?: string }> = {
  0: { type: 'accessories', value: [] },                           // None
  1: { type: 'accessories', value: ['prescription02'] },           // Glasses
  2: { type: 'accessories', value: ['sunglasses'] },               // Sunglasses
  3: { type: 'accessories', value: ['kurt'] },                     // Headphones
  4: { type: 'top', value: ['hat'], color: '262e33' },             // Hat
  5: { type: 'top', value: ['winterHat1'], color: '262e33' },      // Beanie
  6: { type: 'top', value: ['hat'], color: 'ffd700' },             // Crown (gold hat)
  7: { type: 'accessories', value: ['eyepatch'] },                 // Mask -> eyepatch
};

const EYES_MAP: Record<number, string[]> = {
  0: ['default'],
  1: ['happy'],
  2: ['side'],
  3: ['squint'],
  4: ['wink'],
  5: ['surprised'],
  6: ['hearts'],
  7: ['default'],
};

function hexToDiceBear(hex: string): string[] {
  return [hex.replace('#', '')];
}

function getClosestSkinTone(hex: string): string {
  const tones: Record<string, string> = {
    '#f5d0b5': 'ffdbb4',
    '#ecad80': 'd08b5b',
    '#9e5622': 'ae5d29',
    '#d4a373': 'edb98a',
    '#f2d3b1': 'ffdbb4',
    '#e8b89a': 'edb98a',
    '#763900': '614335',
  };
  return tones[hex.toLowerCase()] ?? hex.replace('#', '');
}

export function AvatarPreview({ config, size = 200 }: AvatarPreviewProps) {
  const outfit = OUTFITS[config.outfit] ?? OUTFITS[0];
  const accessory = ACCESSORIES[config.accessory] ?? ACCESSORIES[0];

  // ─── Animation Shared Values ──────────────────────────────────────
  const breath = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const ringRotation = useSharedValue(0);
  const shadowPulse = useSharedValue(0.3);
  const glowIntensity = useSharedValue(0);
  const prevConfigRef = useRef(config);

  // Start continuous idle animations on mount
  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to config changes with a spring bounce + glow
  useEffect(() => {
    const prev = prevConfigRef.current;
    const changed = JSON.stringify(prev) !== JSON.stringify(config);
    if (changed) {
      scale.value = withSequence(
        withSpring(0.94, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 250 })
      );
      shadowPulse.value = withSequence(
        withTiming(0.7, { duration: 150 }),
        withTiming(0.3, { duration: 500 })
      );
      glowIntensity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 })
      );
      prevConfigRef.current = config;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // ─── Avatar Generation ────────────────────────────────────────────
  const svgString = useMemo(() => {
    try {
      const hair = TOP_MAP[config.hairStyle] ?? TOP_MAP[0];
      const isBald = config.hairStyle === 4;
      const clothing = CLOTHING_MAP[config.outfit] ?? CLOTHING_MAP[0];
      const acc = ACCESSORY_MAP[config.accessory] ?? ACCESSORY_MAP[0];
      const eyes = EYES_MAP[config.hairStyle % Object.keys(EYES_MAP).length];

      const options: any = {
        size: size * 2,
        seed: `hs67-${config.gender}-${config.skinTone}-${config.hairStyle}-${config.hairColor}-${config.outfit}-${config.accessory}`,
        skinColor: [getClosestSkinTone(config.skinTone)],
        hairColor: hexToDiceBear(config.hairColor),
        clothesColor: hexToDiceBear(outfit.color),
        clothing,
        eyes,
        eyebrows: ['defaultNatural'],
        mouth: ['smile'],
        style: ['circle'],
        backgroundColor: ['transparent'],
      };

      // Hair / top
      if (isBald) {
        options.top = [];
        options.topProbability = 0;
      } else {
        options.top = hair;
        options.topProbability = 100;
      }

      // Accessory handling
      if (acc.type === 'accessories') {
        options.accessories = acc.value;
        options.accessoriesProbability = acc.value.length > 0 ? 100 : 0;
      } else if (acc.type === 'top') {
        // Hat/beanie overrides hair
        options.top = acc.value;
        options.topProbability = 100;
        if (acc.color) {
          options.hatColor = [acc.color];
        }
        options.accessories = [];
        options.accessoriesProbability = 0;
      }

      const avatar = createAvatar(avataaars, options);
      return avatar.toString();
    } catch (e) {
      console.warn('Avatar generation failed:', e);
      return null;
    }
  }, [config, size, outfit.color]);

  // ─── Animated Styles ──────────────────────────────────────────────
  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(breath.value, [0, 1], [0, -8]) },
      { scale: scale.value },
    ],
  }));

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
    opacity: interpolate(breath.value, [0, 0.5, 1], [0.4, 0.7, 0.4]),
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    opacity: shadowPulse.value,
    transform: [
      { scale: interpolate(breath.value, [0, 1], [1, 1.05]) },
    ],
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(600)} style={[styles.container, { width: size, height: size }]}>
      {/* Rotating gradient ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          ringAnimStyle,
        ]}
      >
        <LinearGradient
          colors={[outfit.color, `${outfit.color}33`, outfit.color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Shadow blob */}
      <Animated.View
        style={[
          styles.shadow,
          {
            width: size * 0.8,
            height: size * 0.15,
            borderRadius: size * 0.4,
            bottom: size * 0.02,
          },
          shadowAnimStyle,
        ]}
      />

      {/* Main avatar with breathing */}
      <Animated.View style={[containerAnimStyle, { position: 'absolute' }]}>
        <View
          style={[
            styles.avatarCircle,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: size * 0.45,
            },
          ]}
        >
          <LinearGradient
            colors={['#1e1e2e', '#0a0a0f']}
            style={StyleSheet.absoluteFill}
          />

          {/* Glow flash on change */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: outfit.color,
                borderRadius: size * 0.45,
              },
              glowAnimStyle,
            ]}
          />

          {svgString ? (
            <View style={{ width: size * 0.88, height: size * 0.88 }}>
              <SvgXml xml={svgString} width={size * 0.88} height={size * 0.88} />
            </View>
          ) : (
            <View style={[styles.fallback, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]} />
          )}
        </View>
      </Animated.View>

      {/* Eye color indicator */}
      <View
        style={[
          styles.eyeIndicator,
          {
            backgroundColor: config.eyeColor,
            borderColor: colors.surface,
            bottom: size * 0.12,
          },
        ]}
      />

      {/* Outfit badge */}
      <Animated.View
        style={[
          styles.badge,
          styles.outfitBadge,
          {
            backgroundColor: colors.surface,
            top: size * 0.02,
            right: size * 0.02,
          },
        ]}
      >
        <Animated.Text style={styles.badgeEmoji}>{outfit.emoji}</Animated.Text>
      </Animated.View>

      {/* Accessory badge (if not None) */}
      {config.accessory !== 0 && (
        <Animated.View
          style={[
            styles.badge,
            styles.accessoryBadge,
            {
              backgroundColor: colors.surface,
              bottom: size * 0.02,
              right: size * 0.02,
            },
          ]}
        >
          <Animated.Text style={styles.badgeEmoji}>{accessory.emoji}</Animated.Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.6,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: '#000',
  },
  avatarCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fallback: {
    backgroundColor: colors.surfaceHighlight,
  },
  eyeIndicator: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },
  outfitBadge: {},
  accessoryBadge: {},
  badgeEmoji: {
    fontSize: 18,
  },
});
