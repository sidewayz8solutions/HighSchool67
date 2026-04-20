import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';

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

// Map Adventurer hair codes → Avataaars top codes
const HAIR_CODE_MAP: Record<string, string> = {
  short01: 'shortRound',
  short02: 'shortFlat',
  short03: 'shortWaved',
  short04: 'shortCurly',
  short05: 'theCaesar',
  short06: 'sides',
  short07: 'theCaesarAndSidePart',
  short08: 'shaggy',
  short09: 'shaggyMullet',
  short10: 'shavedSides',
  short11: 'shavedSides',
  short12: 'shortRound',
  short13: 'shortFlat',
  short14: 'shortWaved',
  short15: 'sides',
  short16: 'theCaesar',
  short17: 'shaggy',
  short18: 'shaggyMullet',
  short19: 'shortCurly',
  long01: 'straight01',
  long02: 'straight02',
  long03: 'longButNotTooLong',
  long04: 'straightAndStrand',
  long05: 'curly',
  long06: 'curly',
  long07: 'frizzle',
  long08: 'frizzle',
  long09: 'shaggy',
  long10: 'shaggyMullet',
  long11: 'dreads',
  long12: 'dreads01',
  long13: 'dreads02',
  long14: 'fro',
  long15: 'froBand',
  long16: 'bun',
  long17: 'bob',
  long18: 'miaWallace',
  long19: 'shortCurly',
  long20: 'curvy',
  long21: 'bigHair',
  long22: 'longButNotTooLong',
  long23: 'straight01',
  long24: 'straight02',
  long25: 'straightAndStrand',
  long26: 'curly',
};

// Map old glasses codes → Avataaars accessories
const GLASSES_MAP: Record<string, string> = {
  variant01: 'prescription01',
  variant02: 'prescription02',
  variant03: 'sunglasses',
  variant04: 'wayfarers',
  variant05: 'round',
  round: 'round',
};

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
      // Convert adventurer hair code to avataaars top
      const adventurerHair = hair[0] ?? 'short01';
      const avataaarsTop = HAIR_CODE_MAP[adventurerHair] ?? 'shortRound';

      // Convert glasses
      const rawGlasses = glasses?.[0];
      const avataaarsGlasses = rawGlasses ? GLASSES_MAP[rawGlasses] ?? 'round' : undefined;

      const options: any = {
        size: size * 2,
        seed,
        top: [avataaarsTop],
        topProbability: 100,
        hairColor: hexToDiceBear(hairColor),
        skinColor: [getClosestSkinTone(skinColor)],
        clothing: ['shirtCrewNeck'],
        clothesColor: ['3c4f5c'],
        eyebrows: ['defaultNatural'],
        eyes: ['default'],
        mouth: ['smile'],
        style: ['circle'],
        backgroundColor: ['transparent'],
      };

      if (avataaarsGlasses) {
        options.accessories = [avataaarsGlasses];
        options.accessoriesProbability = 100;
      } else {
        options.accessories = [];
        options.accessoriesProbability = 0;
      }

      const avatar = createAvatar(avataaars, options);
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
