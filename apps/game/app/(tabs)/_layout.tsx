import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@repo/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HapticTab } from '@/components/haptic-tab';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '@repo/game-engine';

// Animated icon wrapper for press feedback
function AnimatedTabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  // Bounce on focus change
  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 10, stiffness: 300 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }, 150);
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol size={size} name={name as any} color={color} />
    </Animated.View>
  );
}

// Badge component for tab notifications
function TabBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

import { useEffect } from 'react';

export default function TabLayout() {
  // Get data for badges from game store
  const unreadNotifications = useGameStore((s) => {
    // Count based on active events, new unlocks, unclaimed rewards
    let count = 0;
    if (s.activeEvents?.length) count += s.activeEvents.length;
    // Check if daily login reward is available
    const lastLogin = s.loginStreak?.lastLoginDate;
    const today = new Date().toISOString().split('T')[0];
    if (lastLogin !== today) count += 1;
    return count;
  });

  const socialNotifications = useGameStore((s) => {
    // Count based on NPC interactions available, pending friend requests, etc.
    return s.npcs?.filter((n) => n.unlocked && n.relationship > 50 && n.relationship < 80).length ?? 0;
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceHighlight,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          height: 64,
          paddingBottom: 8,
        },
        tabBarButton: (props) => <HapticTab {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <AnimatedTabIcon name="house.fill" color={color} size={size} focused={focused} />
              {unreadNotifications > 0 && focused === false && (
                <View style={styles.dotBadge} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="school"
        options={{
          title: 'School',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="school.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="minigame-hub"
        options={{
          title: 'Arcade',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="gamecontroller.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="room"
        options={{
          title: 'Room',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="bed.double.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <AnimatedTabIcon name="heart.fill" color={color} size={size} focused={focused} />
              {socialNotifications > 0 && (
                <TabBadge count={socialNotifications} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          title: 'Story',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="book.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="person.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  dotBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
