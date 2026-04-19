import { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export type ParticleType =
  | 'sparkle'
  | 'heart'
  | 'star'
  | 'confetti'
  | 'rain'
  | 'snow'
  | 'fire'
  | 'magic'
  | 'currency';

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

const PARTICLE_EMOJIS: Record<ParticleType, string[]> = {
  sparkle: ['✨', '⭐', '✦', '◆'],
  heart: ['❤️', '💕', '💖', '💗'],
  star: ['⭐', '🌟', '✦', '✶'],
  confetti: ['🎉', '🎊', '✨', '💫'],
  rain: ['', '', '', ''], // lines
  snow: ['❄️', '✦', '•', '◆'],
  fire: ['🔥', '✦', '•', '◆'],
  magic: ['✨', '🔮', '✦', '💫'],
  currency: ['🪙', '💰', '✦', ''],
};

const PARTICLE_COLORS: Record<ParticleType, string[]> = {
  sparkle: ['#f59e0b', '#fbbf24', '#fcd34d', '#fffbeb'],
  heart: ['#ec4899', '#f472b6', '#db2777', '#fda4af'],
  star: ['#f59e0b', '#fbbf24', '#fde047', '#fff'],
  confetti: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'],
  rain: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  snow: ['#ffffff', '#e2e8f0', '#cbd5e1', '#f1f5f9'],
  fire: ['#f59e0b', '#ef4444', '#f97316', '#fbbf24'],
  magic: ['#a855f7', '#8b5cf6', '#c084fc', '#e9d5ff'],
  currency: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
};

function generateParticles(type: ParticleType, count: number, origin?: { x: number; y: number }): ParticleData[] {
  const clampedCount = Math.min(count, 50);
  const colors = PARTICLE_COLORS[type];
  const emojis = PARTICLE_EMOJIS[type];

  return Array.from({ length: clampedCount }, (_, i) => {
    const baseX = origin ? origin.x : SCREEN_W / 2;
    const baseY = origin ? origin.y : SCREEN_H / 2;

    let x: number;
    let y: number;
    let size: number;
    let driftX: number;
    let driftY: number;

    switch (type) {
      case 'rain':
        x = Math.random() * SCREEN_W;
        y = -20 - Math.random() * 100;
        size = Math.random() * 2 + 1.5;
        driftX = -0.5 + Math.random() * -1;
        driftY = 8 + Math.random() * 6;
        break;
      case 'snow':
        x = Math.random() * SCREEN_W;
        y = -20 - Math.random() * 80;
        size = Math.random() * 6 + 3;
        driftX = Math.sin(i * 0.5) * 30;
        driftY = 3 + Math.random() * 3;
        break;
      case 'fire':
        x = baseX + (Math.random() - 0.5) * 60;
        y = baseY + Math.random() * 20;
        size = Math.random() * 8 + 4;
        driftX = (Math.random() - 0.5) * 40;
        driftY = -(40 + Math.random() * 80);
        break;
      case 'confetti':
        x = baseX + (Math.random() - 0.5) * 100;
        y = baseY - 20 - Math.random() * 40;
        size = Math.random() * 8 + 4;
        driftX = (Math.random() - 0.5) * 150;
        driftY = 80 + Math.random() * 120;
        break;
      case 'magic':
        x = baseX + (Math.random() - 0.5) * 20;
        y = baseY + (Math.random() - 0.5) * 20;
        size = Math.random() * 6 + 3;
        driftX = (Math.random() - 0.5) * 150;
        driftY = (Math.random() - 0.5) * 150;
        break;
      case 'sparkle':
        x = baseX + (Math.random() - 0.5) * 80;
        y = baseY + Math.random() * 30;
        size = Math.random() * 10 + 5;
        driftX = (Math.random() - 0.5) * 30;
        driftY = -(40 + Math.random() * 80);
        break;
      case 'heart':
        x = baseX + (Math.random() - 0.5) * 60;
        y = baseY + Math.random() * 20;
        size = Math.random() * 10 + 6;
        driftX = Math.sin(i * 0.8) * 25;
        driftY = -(50 + Math.random() * 70);
        break;
      case 'star':
        x = baseX;
        y = baseY;
        size = Math.random() * 12 + 6;
        driftX = (Math.random() - 0.5) * 200;
        driftY = (Math.random() - 0.5) * 200;
        break;
      case 'currency':
        x = baseX + (Math.random() - 0.5) * 50;
        y = baseY;
        size = Math.random() * 8 + 6;
        driftX = (Math.random() - 0.5) * 20;
        driftY = -(60 + Math.random() * 80);
        break;
      default:
        x = baseX;
        y = baseY;
        size = 6;
        driftX = 0;
        driftY = 0;
    }

    return {
      id: i,
      x,
      y,
      size,
      color: colors[i % colors.length],
      duration: type === 'rain' || type === 'snow' ? 2000 + Math.random() * 2000 : 1200 + Math.random() * 800,
      delay: type === 'rain' || type === 'snow' ? Math.random() * 2000 : Math.random() * 300,
      rotation: Math.random() * 360,
      driftX,
      driftY,
      opacity: Math.random() * 0.3 + 0.7,
    };
  });
}

interface SingleParticleProps {
  data: ParticleData;
  type: ParticleType;
  onComplete?: () => void;
  totalParticles: number;
}

function SingleParticle({ data, type, onComplete, totalParticles }: SingleParticleProps) {
  const progress = useSharedValue(0);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (!completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    progress.value = withDelay(
      data.delay,
      withTiming(1, { duration: data.duration, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(handleComplete)();
        }
      })
    );
  }, [data.delay, data.duration, progress, handleComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = interpolate(p, [0, 0.2, 0.8, 1], [0, data.opacity, data.opacity * 0.6, 0]);
    const translateX = data.driftX * p + (type === 'heart' ? Math.sin(p * Math.PI * 3) * 8 : 0);
    const translateY = data.driftY * p;
    const scale = interpolate(p, [0, 0.3, 1], [0.3, 1, type === 'star' ? 0.5 : 0.8]);
    const rotate = `${data.rotation + (type === 'confetti' ? p * 720 : type === 'snow' ? p * 180 : 0)}deg`;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate },
      ],
      opacity,
    };
  });

  if (type === 'rain') {
    return (
      <Animated.View
        style={[
          styles.particle,
          animatedStyle,
          {
            left: data.x,
            top: data.y,
            width: 2,
            height: data.size * 6,
            backgroundColor: data.color,
            borderRadius: 1,
          },
        ]}
      />
    );
  }

  if (type === 'fire') {
    return (
      <Animated.View
        style={[
          styles.particle,
          animatedStyle,
          {
            left: data.x,
            top: data.y,
            width: data.size,
            height: data.size,
            borderRadius: data.size / 2,
            backgroundColor: data.color,
          },
        ]}
      />
    );
  }

  const emoji = PARTICLE_EMOJIS[type][data.id % PARTICLE_EMOJIS[type].length];

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: data.x,
          top: data.y,
        },
      ]}
    >
      {emoji ? (
        <Animated.Text style={{ fontSize: data.size, color: data.color, fontWeight: '900' }}>
          {emoji}
        </Animated.Text>
      ) : (
        <Animated.View
          style={{
            width: data.size,
            height: data.size,
            borderRadius: data.size / 2,
            backgroundColor: data.color,
          }}
        />
      )}
      {type === 'currency' && (
        <Animated.Text style={[styles.currencyText, { fontSize: data.size * 0.7 }]}>
          +
        </Animated.Text>
      )}
    </Animated.View>
  );
}

interface EnhancedParticlesProps {
  active: boolean;
  type: ParticleType;
  count?: number;
  origin?: { x: number; y: number };
  onComplete?: () => void;
}

export function EnhancedParticles({
  active,
  type,
  count = 30,
  origin,
  onComplete,
}: EnhancedParticlesProps) {
  const completedCount = useRef(0);

  const handleParticleComplete = useCallback(() => {
    completedCount.current += 1;
    // Only call onComplete once most particles are done
    if (onComplete && completedCount.current >= Math.min(count, 50) * 0.8) {
      onComplete();
    }
  }, [onComplete, count]);

  if (!active) {
    completedCount.current = 0;
    return null;
  }

  const particles = generateParticles(type, count, origin);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <SingleParticle
          key={`${type}-${p.id}-${Date.now()}`}
          data={p}
          type={type}
          onComplete={handleParticleComplete}
          totalParticles={particles.length}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    color: '#fbbf24',
    fontWeight: '900',
    position: 'absolute',
    top: -8,
    right: -4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
