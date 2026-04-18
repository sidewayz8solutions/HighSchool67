import Svg, { Circle, Ellipse, Path, G, Rect } from 'react-native-svg';

// Hair path data (viewBox 0 0 100 100)
const HAIR_PATHS: Record<string, string | null> = {
  short01: 'M 20 45 Q 20 15, 50 12 Q 80 15, 80 45 L 80 50 Q 80 25, 50 22 Q 20 25, 20 50 Z',
  short02: 'M 18 45 Q 18 18, 50 14 Q 82 18, 82 45 L 82 48 Q 82 28, 50 24 Q 18 28, 18 48 Z',
  short03: 'M 20 45 Q 22 20, 40 16 Q 50 14, 60 16 Q 78 20, 80 45 L 80 50 L 20 50 Z',
  short04: 'M 22 48 Q 20 25, 35 20 Q 50 16, 65 20 Q 80 25, 78 48 L 78 52 L 22 52 Z',
  short05: 'M 18 48 Q 15 22, 50 18 Q 85 22, 82 48 L 82 52 L 18 52 Z',
  short06: 'M 20 45 Q 18 28, 35 24 Q 50 20, 65 24 Q 82 28, 80 45 L 80 50 Q 80 35, 50 30 Q 20 35, 20 50 Z',
  short07: 'M 22 45 Q 20 20, 40 16 Q 50 14, 60 16 Q 80 20, 78 45 L 78 48 L 22 48 Z',
  short08: 'M 18 48 Q 16 25, 50 20 Q 84 25, 82 48 L 82 52 L 18 52 Z',
  short09: 'M 20 48 Q 18 22, 50 18 Q 82 22, 80 48 L 80 52 L 20 52 Z',
  short10: 'M 22 45 Q 20 18, 50 14 Q 80 18, 78 45 L 78 48 L 22 48 Z',
  short11: 'M 42 48 Q 42 5, 50 2 Q 58 5, 58 48 L 62 48 Q 62 10, 65 8 Q 68 15, 68 48 L 72 48 Q 72 20, 75 18 Q 78 25, 78 48 L 82 48 Q 82 30, 85 28 Q 88 35, 88 50 L 75 52 L 50 52 L 25 52 L 12 50 Q 12 35, 15 28 Q 18 30, 18 48 L 22 48 Z',
  short12: 'M 20 48 Q 18 25, 40 20 Q 50 18, 60 20 Q 82 25, 80 48 L 80 52 L 20 52 Z',
  short13: 'M 22 45 Q 20 15, 50 12 Q 80 15, 80 45 L 80 50 Q 80 28, 50 24 Q 20 28, 20 50 Z',
  short14: 'M 18 48 Q 16 20, 50 16 Q 84 20, 82 48 L 82 52 L 18 52 Z',
  short15: 'M 20 48 Q 18 22, 50 18 Q 82 22, 80 48 L 80 52 L 20 52 Z',
  short16: 'M 22 48 Q 20 18, 50 14 Q 80 18, 78 48 L 78 52 L 22 52 Z',
  short17: 'M 18 48 Q 15 25, 50 20 Q 85 25, 82 48 L 82 52 L 18 52 Z',
  short18: 'M 20 48 Q 18 20, 50 16 Q 82 20, 80 48 L 80 52 L 20 52 Z',
  short19: 'M 22 48 Q 20 22, 50 18 Q 80 22, 78 48 L 78 52 L 22 52 Z',
  long01: 'M 18 45 Q 15 5, 50 5 Q 85 5, 82 45 L 85 75 Q 87 85, 80 88 L 75 88 L 75 50 Q 75 35, 50 35 Q 25 35, 25 50 L 25 88 L 20 88 Q 13 85, 15 75 Z',
  long02: 'M 20 45 Q 18 8, 50 6 Q 82 8, 80 45 L 83 70 Q 85 80, 78 82 L 73 82 L 73 50 Q 73 32, 50 32 Q 27 32, 27 50 L 27 82 L 22 82 Q 15 80, 17 70 Z',
  long03: 'M 18 48 Q 15 10, 50 8 Q 85 10, 82 48 L 85 72 Q 87 82, 80 85 L 74 85 L 74 52 Q 74 34, 50 34 Q 26 34, 26 52 L 26 85 L 20 85 Q 13 82, 15 72 Z',
  long04: 'M 20 45 Q 17 6, 50 4 Q 83 6, 80 45 L 84 68 Q 86 78, 79 80 L 72 80 L 72 48 Q 72 30, 50 30 Q 28 30, 28 48 L 28 80 L 21 80 Q 14 78, 16 68 Z',
  long05: 'M 18 48 Q 14 8, 50 6 Q 86 8, 82 48 L 86 74 Q 88 84, 81 86 L 76 86 L 76 52 Q 76 32, 50 32 Q 24 32, 24 52 L 24 86 L 19 86 Q 12 84, 14 74 Z',
  long06: 'M 20 48 Q 18 20, 35 15 Q 50 10, 65 15 Q 82 20, 80 48 Q 82 55, 75 52 Q 70 48, 65 52 Q 60 48, 55 52 Q 50 48, 45 52 Q 40 48, 35 52 Q 30 48, 25 52 Q 18 55, 20 48 Z',
  long07: 'M 18 48 Q 16 18, 40 14 Q 50 12, 60 14 Q 84 18, 82 48 L 85 70 Q 87 80, 80 82 L 75 82 L 75 50 Q 75 30, 50 30 Q 25 30, 25 50 L 25 82 L 20 82 Q 13 80, 15 70 Z',
  long08: 'M 20 48 Q 18 15, 45 12 Q 50 11, 55 12 Q 82 15, 80 48 L 83 68 Q 85 78, 78 80 L 73 80 L 73 48 Q 73 28, 50 28 Q 27 28, 27 48 L 27 80 L 22 80 Q 15 78, 17 68 Z',
  long09: 'M 18 48 Q 15 16, 42 13 Q 50 12, 58 13 Q 85 16, 82 48 L 85 72 Q 87 82, 80 84 L 74 84 L 74 50 Q 74 28, 50 28 Q 26 28, 26 50 L 26 84 L 20 84 Q 13 82, 15 72 Z',
  long10: 'M 20 48 Q 17 14, 44 11 Q 50 10, 56 11 Q 83 14, 80 48 L 84 66 Q 86 76, 79 78 L 72 78 L 72 46 Q 72 26, 50 26 Q 28 26, 28 46 L 28 78 L 21 78 Q 14 76, 16 66 Z',
  long11: 'M 18 48 Q 15 12, 42 10 Q 50 9, 58 10 Q 85 12, 82 48 L 86 70 Q 88 80, 81 82 L 76 82 L 76 48 Q 76 26, 50 26 Q 24 26, 24 48 L 24 82 L 19 82 Q 12 80, 14 70 Z',
  long12: 'M 20 48 Q 18 16, 45 13 Q 50 12, 55 13 Q 82 16, 80 48 L 84 68 Q 86 78, 79 80 L 74 80 L 74 48 Q 74 26, 50 26 Q 26 26, 26 48 L 26 80 L 21 80 Q 14 78, 16 68 Z',
  long13: 'M 18 48 Q 14 14, 42 11 Q 50 10, 58 11 Q 86 14, 82 48 L 87 66 Q 89 76, 82 78 L 76 78 L 76 46 Q 76 24, 50 24 Q 24 24, 24 46 L 24 78 L 18 78 Q 11 76, 13 66 Z',
  long14: 'M 20 48 Q 17 15, 46 12 Q 50 11, 54 12 Q 83 15, 80 48 L 85 64 Q 87 74, 80 76 L 74 76 L 74 44 Q 74 22, 50 22 Q 26 22, 26 44 L 26 76 L 20 76 Q 13 74, 15 64 Z',
  long15: 'M 18 48 Q 14 18, 44 14 Q 50 13, 56 14 Q 86 18, 82 48 L 88 62 Q 90 72, 83 74 L 76 74 L 76 42 Q 76 20, 50 20 Q 24 20, 24 42 L 24 74 L 17 74 Q 10 72, 12 62 Z',
  long16: 'M 30 45 Q 30 18, 50 15 Q 70 18, 70 45 L 75 35 Q 85 20, 75 15 Q 65 5, 50 8 Q 35 5, 25 15 Q 15 20, 25 35 Z',
  long17: 'M 28 45 Q 28 20, 50 17 Q 72 20, 72 45 L 78 32 Q 88 18, 78 14 Q 68 4, 50 7 Q 32 4, 22 14 Q 12 18, 22 32 Z',
  long18: 'M 32 45 Q 32 22, 50 19 Q 68 22, 68 45 L 74 34 Q 84 22, 74 18 Q 64 8, 50 11 Q 36 8, 26 18 Q 16 22, 26 34 Z',
  long19: 'M 26 45 Q 26 16, 50 13 Q 74 16, 74 45 L 80 30 Q 92 16, 80 12 Q 70 2, 50 5 Q 30 2, 20 12 Q 8 16, 20 30 Z',
  long20: 'M 24 48 Q 22 18, 50 14 Q 78 18, 76 48 L 82 34 Q 94 18, 82 14 Q 72 4, 50 7 Q 28 4, 18 14 Q 6 18, 18 34 Z',
  long21: 'M 20 45 Q 20 15, 50 12 Q 80 15, 80 45 L 80 50 L 75 50 L 75 30 Q 75 15, 50 15 Q 25 15, 25 30 L 25 50 L 20 50 Z M 55 20 Q 70 5, 85 15 Q 95 25, 90 40 Q 88 50, 80 48 Q 75 45, 78 38 Q 80 28, 72 22 Q 65 18, 55 20 Z',
  long22: 'M 18 48 Q 16 20, 38 16 Q 50 14, 62 16 Q 84 20, 82 48 L 88 36 Q 98 20, 88 16 Q 78 6, 50 9 Q 22 6, 12 16 Q 2 20, 12 36 Z',
  long23: 'M 20 48 Q 18 22, 42 18 Q 50 16, 58 18 Q 82 22, 80 48 L 86 38 Q 96 22, 86 18 Q 76 8, 50 11 Q 24 8, 14 18 Q 4 22, 14 38 Z',
  long24: 'M 18 48 Q 16 24, 40 20 Q 50 18, 60 20 Q 84 24, 82 48 L 90 36 Q 100 20, 90 16 Q 80 6, 50 9 Q 20 6, 10 16 Q 0 20, 10 36 Z',
  long25: 'M 20 48 Q 18 18, 44 14 Q 50 13, 56 14 Q 82 18, 80 48 L 88 34 Q 98 18, 88 14 Q 78 4, 50 7 Q 22 4, 12 14 Q 2 18, 12 34 Z',
  long26: 'M 18 48 Q 15 20, 42 16 Q 50 14, 58 16 Q 85 20, 82 48 L 92 32 Q 102 16, 92 12 Q 82 2, 50 5 Q 18 2, 8 12 Q -2 16, 8 32 Z',
};

const OUTFIT_COLORS: Record<number, string> = {
  0: '#3b82f6', 1: '#ef4444', 2: '#8b5cf6', 3: '#1e293b',
  4: '#22c55e', 5: '#f59e0b', 6: '#ec4899', 7: '#a855f7',
};

export interface SvgAvatarProps {
  skinTone: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  outfit?: number;
  accessory?: number;
  size?: number;
}

export function SvgAvatar({
  skinTone,
  hairStyle = 'short01',
  hairColor = '#0a0a0a',
  eyeColor = '#3b6e28',
  outfit = 0,
  accessory = 0,
  size = 100,
}: SvgAvatarProps) {
  const hairPath = HAIR_PATHS[hairStyle] ?? HAIR_PATHS['short01'];
  const outfitColor = OUTFIT_COLORS[outfit] ?? OUTFIT_COLORS[0];
  const hasGlasses = accessory === 1;
  const hasSunglasses = accessory === 2;
  const hasHeadphones = accessory === 3;
  const hasHat = accessory === 4;
  const hasBeanie = accessory === 5;
  const hasCrown = accessory === 6;
  const hasMask = accessory === 7;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Body / Outfit */}
      <Rect x="25" y="80" width="50" height="25" rx="8" fill={outfitColor} opacity={0.9} />

      {/* Neck */}
      <Rect x="42" y="72" width="16" height="12" fill={skinTone} />

      {/* Head */}
      <Circle cx="50" cy="48" r="28" fill={skinTone} />

      {/* Ears */}
      <Circle cx="22" cy="48" r="5" fill={skinTone} />
      <Circle cx="78" cy="48" r="5" fill={skinTone} />

      {/* Eyes */}
      <G>
        <Ellipse cx="40" cy="45" rx="5" ry="6" fill="#fff" />
        <Circle cx="40" cy="45" r="3" fill={eyeColor} />
        <Circle cx="41" cy="44" r="1" fill="#fff" />

        <Ellipse cx="60" cy="45" rx="5" ry="6" fill="#fff" />
        <Circle cx="60" cy="45" r="3" fill={eyeColor} />
        <Circle cx="61" cy="44" r="1" fill="#fff" />
      </G>

      {/* Glasses */}
      {hasGlasses && (
        <G>
          <Rect x="30" y="39" width="18" height="12" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
          <Rect x="52" y="39" width="18" height="12" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
          <Path d="M 48 45 L 52 45" stroke="#333" strokeWidth="1.5" />
        </G>
      )}

      {/* Sunglasses */}
      {hasSunglasses && (
        <G>
          <Rect x="30" y="40" width="18" height="10" rx="2" fill="#111" />
          <Rect x="52" y="40" width="18" height="10" rx="2" fill="#111" />
          <Path d="M 48 45 L 52 45" stroke="#111" strokeWidth="1.5" />
          <Path d="M 30 42 L 25 40" stroke="#111" strokeWidth="1.5" />
          <Path d="M 70 42 L 75 40" stroke="#111" strokeWidth="1.5" />
        </G>
      )}

      {/* Mouth */}
      <Path d="M 43 58 Q 50 63, 57 58" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <Path d="M 50 48 L 48 54 L 52 54 Z" fill="rgba(0,0,0,0.08)" />

      {/* Hair */}
      {hairPath && <Path d={hairPath} fill={hairColor} />}

      {/* Headphones */}
      {hasHeadphones && (
        <G>
          <Path d="M 22 48 Q 22 20, 50 18 Q 78 20, 78 48" stroke="#444" strokeWidth="3" fill="none" />
          <Rect x="16" y="42" width="10" height="14" rx="3" fill="#333" />
          <Rect x="74" y="42" width="10" height="14" rx="3" fill="#333" />
        </G>
      )}

      {/* Hat */}
      {hasHat && (
        <G>
          <Path d="M 22 40 Q 22 25, 50 22 Q 78 25, 78 40 L 82 42 L 18 42 Z" fill="#c0392b" />
          <Rect x="40" y="18" width="20" height="8" rx="2" fill="#c0392b" />
        </G>
      )}

      {/* Beanie */}
      {hasBeanie && (
        <G>
          <Path d="M 20 42 Q 20 20, 50 18 Q 80 20, 80 42 L 80 46 L 20 46 Z" fill="#2c3e50" />
          <Rect x="18" y="44" width="64" height="6" rx="2" fill="#34495e" />
        </G>
      )}

      {/* Crown */}
      {hasCrown && (
        <G>
          <Path d="M 25 40 L 30 28 L 40 35 L 50 25 L 60 35 L 70 28 L 75 40 Z" fill="#f1c40f" />
          <Rect x="25" y="40" width="50" height="6" rx="2" fill="#f39c12" />
          <Circle cx="30" cy="28" r="2" fill="#e74c3c" />
          <Circle cx="50" cy="25" r="2" fill="#e74c3c" />
          <Circle cx="70" cy="28" r="2" fill="#e74c3c" />
        </G>
      )}

      {/* Mask */}
      {hasMask && (
        <G>
          <Rect x="30" y="52" width="40" height="14" rx="6" fill="#ecf0f1" />
          <Path d="M 30 58 L 25 55" stroke="#ecf0f1" strokeWidth="2" />
          <Path d="M 70 58 L 75 55" stroke="#ecf0f1" strokeWidth="2" />
        </G>
      )}
    </Svg>
  );
}
