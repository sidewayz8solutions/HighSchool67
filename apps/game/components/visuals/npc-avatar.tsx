import { View, StyleSheet } from 'react-native';
import { SvgAvatar } from './svg-avatar';

interface NpcAvatarProps {
  seed: string;
  size?: number;
  hair?: string[];
  hairColor?: string;
  skinColor?: string;
  glasses?: string[];
  borderColor?: string;
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
  const hairStyle = hair[0];
  const accessory = glasses ? 1 : 0;

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
      <View style={{ width: size * 0.88, height: size * 0.88 }}>
        <SvgAvatar
          skinTone={skinColor}
          hairStyle={hairStyle}
          hairColor={hairColor}
          eyeColor="#3b6e28"
          outfit={0}
          accessory={accessory}
          size={size * 0.88}
        />
      </View>
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
});
