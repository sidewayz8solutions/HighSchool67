import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export type WeatherType = 'rain' | 'snow' | 'sunny' | 'cloudy' | 'night' | 'fog';
export type Intensity = 'light' | 'medium' | 'heavy';

const INTENSITY_MULTIPLIER: Record<Intensity, number> = {
  light: 0.5,
  medium: 1,
  heavy: 1.8,
};

const INTENSITY_OPACITY: Record<Intensity, number> = {
  light: 0.3,
  medium: 0.5,
  heavy: 0.75,
};

interface DropParticle {
  id: number;
  x: number;
  delay: number;
  speed: number;
  length: number;
  opacity: number;
}

interface SnowParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  speed: number;
  swayAmount: number;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface FogLayer {
  id: number;
  y: number;
  speed: number;
  delay: number;
  opacity: number;
}

// ─── Rain Component ───────────────────────────────────────────────

function RainDrops({ intensity }: { intensity: Intensity }) {
  const multiplier = INTENSITY_MULTIPLIER[intensity];
  const drops = useMemo(() => {
    const count = Math.floor(60 * multiplier);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_W,
      delay: Math.random() * 2000,
      speed: 1200 + Math.random() * 600,
      length: 12 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [multiplier]);

  return (
    <>
      {drops.map((drop) => (
        <RainDrop key={drop.id} drop={drop} />
      ))}
    </>
  );
}

function RainDrop({ drop }: { drop: DropParticle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      drop.delay,
      withRepeat(
        withTiming(1, { duration: drop.speed, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [drop.delay, drop.speed, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-20, SCREEN_H + 20]) },
      { translateX: interpolate(progress.value, [0, 1], [0, -8]) },
    ],
    opacity: interpolate(progress.value, [0, 0.1, 0.9, 1], [0, drop.opacity, drop.opacity, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        style,
        { left: drop.x, height: drop.length, backgroundColor: 'rgba(96,165,250,0.6)' },
      ]}
    />
  );
}

// ─── Snow Component ───────────────────────────────────────────────

function SnowFlakes({ intensity }: { intensity: Intensity }) {
  const multiplier = INTENSITY_MULTIPLIER[intensity];
  const flakes = useMemo(() => {
    const count = Math.floor(40 * multiplier);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_W,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 4000,
      speed: 4000 + Math.random() * 3000,
      swayAmount: 20 + Math.random() * 30,
    }));
  }, [multiplier]);

  return (
    <>
      {flakes.map((flake) => (
        <SnowFlake key={flake.id} flake={flake} />
      ))}
    </>
  );
}

function SnowFlake({ flake }: { flake: SnowParticle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      flake.delay,
      withRepeat(
        withTiming(1, { duration: flake.speed, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [flake.delay, flake.speed, progress]);

  const style = useAnimatedStyle(() => {
    const sway = Math.sin(progress.value * Math.PI * 4) * flake.swayAmount;
    return {
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [-20, SCREEN_H + 20]) },
        { translateX: sway },
      ],
      opacity: interpolate(progress.value, [0, 0.05, 0.95, 1], [0, 0.8, 0.8, 0]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.snowFlake,
        style,
        {
          left: flake.x,
          width: flake.size,
          height: flake.size,
          borderRadius: flake.size / 2,
          backgroundColor: 'rgba(255,255,255,0.85)',
        },
      ]}
    />
  );
}

// ─── Sunny Component ──────────────────────────────────────────────

function SunnyOverlay({ intensity }: { intensity: Intensity }) {
  const opacity = INTENSITY_OPACITY[intensity];
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  const flareStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.3]) }],
  }));

  return (
    <View style={styles.sunnyContainer} pointerEvents="none">
      <LinearGradient
        colors={['rgba(251,191,36,0.08)', 'rgba(245,158,11,0.02)', 'transparent']}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
      <Animated.View
        style={[
          styles.lensFlare,
          flareStyle,
          { top: '8%', right: '12%', opacity: opacity * 0.4 },
        ]}
      >
        <LinearGradient
          colors={['rgba(251,191,36,0.4)', 'transparent']}
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.lensFlare,
          flareStyle,
          { top: '25%', left: '5%', opacity: opacity * 0.25 },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'transparent']}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Cloudy Component ─────────────────────────────────────────────

function CloudyOverlay({ intensity }: { intensity: Intensity }) {
  const opacity = INTENSITY_OPACITY[intensity];
  return (
    <LinearGradient
      colors={['rgba(148,163,184,0.12)', 'rgba(100,116,139,0.06)', 'transparent']}
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    />
  );
}

// ─── Night Component ──────────────────────────────────────────────

function NightOverlay({ intensity }: { intensity: Intensity }) {
  const opacity = INTENSITY_OPACITY[intensity];
  const stars = useMemo(() => {
    const count = intensity === 'light' ? 20 : intensity === 'medium' ? 40 : 70;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H * 0.6,
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 3000,
    }));
  }, [intensity]);

  return (
    <View style={styles.nightContainer} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(15,23,42,${opacity * 0.7})` }]} />
      {stars.map((star) => (
        <TwinklingStar key={star.id} star={star} opacity={opacity} />
      ))}
    </View>
  );
}

function TwinklingStar({ star, opacity }: { star: StarParticle; opacity: number }) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, { duration: 1500 + Math.random() * 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, [star.delay, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(twinkle.value, [0, 1], [0.2, 1]) * opacity,
    transform: [{ scale: interpolate(twinkle.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        style,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
      ]}
    />
  );
}

// ─── Fog Component ────────────────────────────────────────────────

function FogOverlay({ intensity }: { intensity: Intensity }) {
  const opacity = INTENSITY_OPACITY[intensity];
  const layers = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      y: (SCREEN_H * i) / 4,
      speed: 8000 + i * 2000,
      delay: i * 1500,
      opacity: 0.15 + Math.random() * 0.15,
    }));
  }, []);

  return (
    <View style={styles.fogContainer} pointerEvents="none">
      {layers.map((layer) => (
        <FogLayerView key={layer.id} layer={layer} opacity={opacity} />
      ))}
    </View>
  );
}

function FogLayerView({ layer, opacity }: { layer: FogLayer; opacity: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      layer.delay,
      withRepeat(
        withTiming(1, { duration: layer.speed, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [layer.delay, layer.speed, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-SCREEN_W * 0.3, SCREEN_W * 0.1]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        styles.fogLayer,
        {
          top: layer.y,
          opacity: layer.opacity * opacity,
        },
      ]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(203,213,225,0.3)', 'rgba(148,163,184,0.2)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: SCREEN_W * 2, height: SCREEN_H / 3 }}
      />
    </Animated.View>
  );
}

// ─── Main Weather Overlay ─────────────────────────────────────────

interface WeatherOverlayProps {
  weather: WeatherType;
  intensity?: Intensity;
}

export function WeatherOverlay({ weather, intensity = 'medium' }: WeatherOverlayProps) {
  if (weather === 'sunny') return <SunnyOverlay intensity={intensity} />;
  if (weather === 'cloudy') return <CloudyOverlay intensity={intensity} />;
  if (weather === 'night') return <NightOverlay intensity={intensity} />;
  if (weather === 'fog') return <FogOverlay intensity={intensity} />;

  // Rain and snow use particle system
  return (
    <View style={styles.container} pointerEvents="none">
      {weather === 'rain' && <RainDrops intensity={intensity} />}
      {weather === 'snow' && <SnowFlakes intensity={intensity} />}
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
    zIndex: 50,
    pointerEvents: 'none',
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
  },
  snowFlake: {
    position: 'absolute',
  },
  sunnyContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  lensFlare: {
    position: 'absolute',
    borderRadius: 60,
  },
  nightContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  fogContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    overflow: 'hidden',
  },
  fogLayer: {
    position: 'absolute',
    left: -SCREEN_W * 0.5,
    height: SCREEN_H / 3,
  },
});
