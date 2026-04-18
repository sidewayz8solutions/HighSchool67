import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@repo/ui';
import type { AvatarConfig } from '@repo/types';
import { SvgAvatar } from '@/components/visuals/svg-avatar';

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
}

const HAIR_MAP: Record<number, string> = {
  0: 'short01', 1: 'long01', 2: 'long06', 3: 'long11',
  4: 'short01', 5: 'long16', 6: 'long21', 7: 'short11',
};

export function AvatarPreview({ config, size = 180 }: AvatarPreviewProps) {
  const hairKey = HAIR_MAP[config.hairStyle] ?? 'short01';
  // For bald, explicitly no hair
  const hairStyle = config.hairStyle === 4 ? undefined : hairKey;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={['#1e1e2e', '#0a0a0f']}
        style={[styles.bg, { borderRadius: size / 2 }]}
      >
        <View style={[styles.glowRing, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475 }]} />
        <View style={{ width: size, height: size }}>
          <SvgAvatar
            skinTone={config.skinTone}
            hairStyle={hairStyle}
            hairColor={config.hairColor}
            eyeColor={config.eyeColor}
            outfit={config.outfit}
            accessory={config.accessory}
            size={size}
          />
        </View>
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
});
