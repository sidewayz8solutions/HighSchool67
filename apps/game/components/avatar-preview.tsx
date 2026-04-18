import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@repo/ui';
import type { AvatarConfig } from '@repo/types';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
}

const HAIR_MAP: Record<number, ("short01" | "short02" | "short03" | "short04" | "short05" | "short06" | "short07" | "short08" | "short09" | "short10" | "short11" | "short12" | "short13" | "short14" | "short15" | "short16" | "long01" | "long02" | "long03" | "long04" | "long05" | "long06" | "long07" | "long08" | "long09" | "long10" | "long11" | "long12" | "long13" | "long14" | "long15" | "long16" | "long17" | "long18" | "long19" | "long20" | "long21")[]> = {
  0: ['short01'], // Short
  1: ['long01'],  // Long
  2: ['long06'],  // Curly
  3: ['long11'],  // Braids
  4: [],          // Bald
  5: ['long16'],  // Bun
  6: ['long21'],  // Ponytail
  7: ['short11'], // Mohawk
};

const GLASSES_MAP: Record<number, ('variant01' | 'variant03' | 'variant02' | 'variant04' | 'variant05')[]> = {
  1: ['variant01'], // Glasses
  2: ['variant03'], // Sunglasses
};

function hexToDiceBear(hex: string): string[] {
  return [hex.replace('#', '')];
}

export function AvatarPreview({ config, size = 180 }: AvatarPreviewProps) {
  const svgString = useMemo(() => {
    try {
      const hair = HAIR_MAP[config.hairStyle] ?? HAIR_MAP[0];
      const isBald = config.hairStyle === 4;
      const glasses = GLASSES_MAP[config.accessory];

      const options = {
        size: size * 2,
        hair: isBald ? [] : hair,
        hairColor: hexToDiceBear(config.hairColor),
        skinColor: hexToDiceBear(config.skinTone),
        glasses: glasses || [],
        seed: `${config.gender}-${config.skinTone}-${config.hairStyle}-${config.hairColor}-${config.eyeColor}-${config.outfit}-${config.accessory}`,
      } as any;

      const avatar = createAvatar(adventurer, options);
      return avatar.toString();
    } catch (e) {
      console.warn('Avatar generation failed:', e);
      return null;
    }
  }, [config, size]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={['#1e1e2e', '#0a0a0f']}
        style={[styles.bg, { borderRadius: size / 2 }]}
      >
        <View style={[styles.glowRing, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475 }]} />

        {svgString ? (
          <View style={{ width: size * 0.9, height: size * 0.9 }}>
            <SvgXml xml={svgString} width={size * 0.9} height={size * 0.9} />
          </View>
        ) : (
          <View style={[styles.fallback, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]} />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primaryGlow,
  },
  fallback: {
    backgroundColor: colors.surfaceHighlight,
  },
});
