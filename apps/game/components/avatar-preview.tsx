import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@repo/ui';
import type { AvatarConfig } from '@repo/types';
import { OUTFITS, ACCESSORIES } from '@repo/types';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
}

// DiceBear adventurer hair style mapping
const HAIR_MAP: Record<number, string[]> = {
  0: ['short01'], // Short
  1: ['long01'],  // Long
  2: ['long06'],  // Curly
  3: ['long11'],  // Braids
  4: [],          // Bald
  5: ['long16'],  // Bun
  6: ['long21'],  // Ponytail
  7: ['short11'], // Mohawk
};

// Only glasses/sunglasses are supported by DiceBear adventurer
const GLASSES_MAP: Record<number, string[]> = {
  0: [],           // None
  1: ['variant01'], // Glasses
  2: ['variant03'], // Sunglasses
};

function hexToDiceBear(hex: string): string[] {
  return [hex.replace('#', '')];
}

export function AvatarPreview({ config, size = 180 }: AvatarPreviewProps) {
  const outfit = OUTFITS[config.outfit] ?? OUTFITS[0];
  const accessory = ACCESSORIES[config.accessory] ?? ACCESSORIES[0];

  const svgString = useMemo(() => {
    try {
      const hair = HAIR_MAP[config.hairStyle] ?? HAIR_MAP[0];
      const isBald = config.hairStyle === 4;
      const glasses = GLASSES_MAP[config.accessory];

      const avatar = createAvatar(adventurer, {
        size: size * 2,
        seed: `hs67-${config.gender}-${config.skinTone}-${config.hairStyle}-${config.hairColor}`,
        hair: isBald ? [] : hair,
        hairColor: hexToDiceBear(config.hairColor),
        skinColor: hexToDiceBear(config.skinTone),
        glasses: glasses || [],
        glassesProbability: glasses && glasses.length > 0 ? 100 : 0,
        hairProbability: isBald ? 0 : 100,
      } as any);

      return avatar.toString();
    } catch (e) {
      console.warn('Avatar generation failed:', e);
      return null;
    }
  }, [config.gender, config.skinTone, config.hairStyle, config.hairColor, config.accessory, size]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outfit color ring */}
      <View
        style={[
          styles.outfitRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: outfit.color,
          },
        ]}
      />

      {/* Main avatar circle */}
      <View
        style={[
          styles.avatarCircle,
          {
            width: size * 0.92,
            height: size * 0.92,
            borderRadius: size * 0.46,
          },
        ]}
      >
        <LinearGradient
          colors={['#1e1e2e', '#0a0a0f']}
          style={StyleSheet.absoluteFill}
        />

        {svgString ? (
          <View style={{ width: size * 0.85, height: size * 0.85 }}>
            <SvgXml xml={svgString} width={size * 0.85} height={size * 0.85} />
          </View>
        ) : (
          <View style={[styles.fallback, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]} />
        )}
      </View>

      {/* Eye color indicator */}
      <View
        style={[
          styles.eyeIndicator,
          { backgroundColor: config.eyeColor, borderColor: colors.surface },
        ]}
      />

      {/* Outfit badge */}
      <View style={[styles.outfitBadge, { backgroundColor: colors.surface }]}>
        <Text style={styles.badgeEmoji}>{outfit.emoji}</Text>
      </View>

      {/* Accessory badge (if not None) */}
      {config.accessory !== 0 && (
        <View style={[styles.accessoryBadge, { backgroundColor: colors.surface }]}>
          <Text style={styles.badgeEmoji}>{accessory.emoji}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outfitRing: {
    position: 'absolute',
    opacity: 0.6,
  },
  avatarCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eyeIndicator: {
    position: 'absolute',
    bottom: '8%',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  outfitBadge: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  accessoryBadge: {
    position: 'absolute',
    bottom: '5%',
    right: '5%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeEmoji: {
    fontSize: 16,
  },
  fallback: {
    backgroundColor: colors.surfaceHighlight,
  },
});
