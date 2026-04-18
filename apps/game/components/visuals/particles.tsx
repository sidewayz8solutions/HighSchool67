import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * -150 - 50,
    size: Math.random() * 6 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 1000 + 800,
    delay: Math.random() * 400,
  }));
}

export function Particles({
  active,
  count = 20,
  colors = ['#f59e0b', '#3b82f6', '#ec4899', '#22c55e', '#a855f7', '#fff'],
  onComplete,
}: {
  active: boolean;
  count?: number;
  colors?: string[];
  onComplete?: () => void;
}) {
  const particles = useRef<Particle[]>(generateParticles(count, colors));
  const anims = useRef<Animated.Value[]>(
    particles.current.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    if (!active) {
      anims.current.forEach((a) => a.setValue(0));
      return;
    }

    particles.current = generateParticles(count, colors);
    const animations = anims.current.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: particles.current[i].duration,
        delay: particles.current[i].delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animations).start(({ finished }) => {
      if (finished && onComplete) onComplete();
    });
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((p, i) => {
        const translateY = anims.current[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.y],
        });
        const translateX = anims.current[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.x],
        });
        const opacity = anims.current[i].interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1, 0],
        });
        const scale = anims.current[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.2, 0.8],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
                opacity,
              },
            ]}
          />
        );
      })}
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
  },
});
