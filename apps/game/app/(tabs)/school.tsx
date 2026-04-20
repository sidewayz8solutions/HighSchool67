import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { NpcAvatar, Particles } from '@/components/visuals';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SchoolScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const npcs = useGameStore((s) => s.npcs);
  const changeNPCRelationship = useGameStore((s) => s.changeNPCRelationship);
  const spendEnergy = useGameStore((s) => s.spendEnergy);
  const updateChallenge = useGameStore((s) => s.updateChallenge);
  const [particles, setParticles] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const interact = (npcId: string, type: 'chat' | 'flirt' | 'gift') => {
    const cost = type === 'gift' ? 15 : 10;
    if (!spendEnergy(cost)) return;

    if (type === 'chat') {
      changeNPCRelationship(npcId, 5, 'friendship');
      updateChallenge('c2', 1);
      setLastAction('Chat');
    } else if (type === 'flirt') {
      changeNPCRelationship(npcId, 5, 'romance');
      setLastAction('Flirt');
    } else if (type === 'gift') {
      changeNPCRelationship(npcId, 10, 'friendship');
      changeNPCRelationship(npcId, 5, 'romance');
      setLastAction('Gift');
    }
    setParticles(true);
    setTimeout(() => setParticles(false), 1500);
  };

  return (
    <LinearGradient colors={colors.gradientDark } style={styles.gradientBg}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <Particles active={particles} onComplete={() => setParticles(false)} />

        <Text style={styles.title}>School Hallways</Text>
        <Text style={styles.subtitle}>Meet students, make friends, or stir up drama.</Text>

        {npcs.filter((n) => n.unlocked).map((npc, index) => (
          <Animated.View key={npc.id} entering={FadeInUp.delay(index * 100)}>
            <Card glow style={styles.card}>
              <View style={styles.npcHeader}>
                <NpcAvatar
                  seed={npc.visualConfig.seed}
                  hair={npc.visualConfig.hair}
                  hairColor={npc.visualConfig.hairColor}
                  skinColor={npc.visualConfig.skinColor}
                  glasses={npc.visualConfig.glasses}
                  size={72}
                  borderColor={npc.romance > 50 ? '#ec4899' : npc.relationship > 70 ? '#22c55e' : 'rgba(255,255,255,0.15)'}
                />
                <View style={styles.npcInfo}>
                  <Text style={styles.name}>{npc.name}</Text>
                  <Text style={styles.clique}>{npc.clique} • {npc.personality}</Text>
                  <Text style={styles.bio}>{npc.bio}</Text>
                  {npc.schedule && (
                    <Text style={styles.schedule}>Now: {npc.schedule.afternoon}</Text>
                  )}
                </View>
              </View>

              <View style={styles.meters}>
                <Text style={styles.meterLabel}>Friendship: {npc.relationship}/100</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { width: `${npc.relationship}%`, backgroundColor: npc.relationship > 70 ? '#22c55e' : npc.relationship > 40 ? '#f59e0b' : '#ef4444' }]} />
                </View>
                <Text style={styles.meterLabel}>Romance: {npc.romance}/100</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { width: `${npc.romance}%`, backgroundColor: npc.romance > 50 ? '#ec4899' : '#64748b' }]} />
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => interact(npc.id, 'chat')}>
                  <Text style={styles.actionText}>Chat</Text>
                  <Text style={styles.actionCost}>-10 ENERGY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => interact(npc.id, 'flirt')}>
                  <Text style={styles.actionText}>Flirt</Text>
                  <Text style={styles.actionCost}>-10 ENERGY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => interact(npc.id, 'gift')}>
                  <Text style={styles.actionText}>Gift</Text>
                  <Text style={styles.actionCost}>-15 ENERGY</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.aiBtn}
                onPress={() => router.push({ pathname: '/ai-dialogue', params: { npcId: npc.id } })}
              >
                <Text style={styles.aiBtnText}>AI Deep Chat (-10 ENERGY)</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  npcHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  npcInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'capitalize',
  },
  clique: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  schedule: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  meters: {
    marginTop: spacing.md,
  },
  meterLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  actionCost: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  aiBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});
