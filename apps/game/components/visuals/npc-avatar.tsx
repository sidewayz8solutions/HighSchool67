import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

interface NpcAvatarProps {
  seed: string;
  size?: number;
  hair?: string[];
  hairColor?: string;
  skinColor?: string;
  glasses?: string[];
  borderColor?: string;
}

function hexToDiceBear(hex: string): string[] {
  return [hex.replace('#', '')];
}

export function NpcAvatar({
  seed,
  size = 64,
  hair = ['short01'],
  hairColor = '#4a2511',
  skinColor = '#f5d0b5',
  glasses,
  borderColor = 'rgba(255,255,255,0.15)',
}: NpcAvatarProps) {
  const svgString = useMemo(() => {
    try {
      const avatar = createAvatar(adventurer, {
        size: size * 2,
        seed,
        hair,
        hairColor: hexToDiceBear(hairColor),
        skinColor: hexToDiceBear(skinColor),
        glasses,
        glassesProbability: glasses ? 100 : 0,
        hairProbability: 100,
      });
      return avatar.toString();
    } catch (e) {
      console.warn('NPC avatar generation failed:', e);
      return null;
    }
  }, [seed, size, hair, hairColor, skinColor, glasses]);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
      ]}
    >
      {svgString ? (
        <View style={{ width: size * 0.88, height: size * 0.88, borderRadius: (size * 0.88) / 2, overflow: 'hidden' }}>
          <SvgXml xml={svgString} width={size * 0.88} height={size * 0.88} />
        </View>
      ) : (
        <View style={[styles.fallback, { width: size * 0.6, height: size * 0.6, borderRadius: (size * 0.6) / 2 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fallback: {
    backgroundColor: '#334155',
  },
});
